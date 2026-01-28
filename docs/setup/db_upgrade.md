---
sidebar_position: 7
description: Upgrading the database to the latest version.
---

# DB upgrade guide

Once the CNPG operator is installed and configured in your cluster - see the [install the CNPG operator section](/advanced/high-availability-setup.md#installing-the-cnpg-operator) if you haven't done so yet -, you should be ready to upgrade OpsChain to the new version. The entire upgrade process might take some time to complete depending on your database size. A downtime of OpsChain is required for this update.

:::warning
This process is only required if you're upgrading from an OpsChain version prior to 2026-01-27 and can be skipped if not.
:::

## Stop OpsChain

Stop OpsChain by deploying it with the previous version using the `--set stopped=true` flag in the Helm command. Once all the deployments and statefulsets are terminated, bring the database deployment back up by running the following command:

```bash
kubectl scale deployment/opschain-db -n ${KUBERNETES_NAMESPACE} --replicas=1
```

### Backup the existing database

:::danger
Skipping this step might result in permanent data loss. Do not proceed without a working backup of your database.
:::

With the database deployment back up, create a backup with the following commands:

1. Enter the database container

   ```bash
   kubectl exec -it deploy/opschain-db -n ${KUBERNETES_NAMESPACE} -- /bin/bash
   ```

2. Create a directory to store the backup on the host filesystem

   ```bash
   mkdir -p /tmp/backup
   ```

3. Create a backup of the database

   ```bash
   pg_basebackup -h 127.0.0.1 -p 5432 -U opschain -D "/tmp/backup" -Ft -z --compress=6 -P -vvv --wal-method=stream --checkpoint=fast --max-rate=300M
   ```

4. Verify the backup files are created and are not empty

   ```bash
   ls -lah /tmp/backup
   ```

5. Exit the database container

   ```bash
   exit
   ```

6. Get the database pod name

   ```bash
   DB_POD=$(kubectl get pods -n ${KUBERNETES_NAMESPACE} -l app=opschain-db -o jsonpath='{.items[0].metadata.name}')
   ```

7. Make a directory to store the backup on the host filesystem

   ```bash
   mkdir -p /limepoint/backup
   ```

8. Copy the backup files to the host

   ```bash
   kubectl cp $DB_POD:/tmp/backup/ /limepoint/backup/ -n ${KUBERNETES_NAMESPACE}
   ```

### Update the `values.yaml` file

Besides the regular configuration changes to your `values.yaml` file, you must make the following changes to your configuration file:

- Add the `db.recoveryMode` setting

```yaml
db:
  recoveryMode: true
  # ... other settings
```

- Copy the `db.volume.storageClass` and `db.volume.size` settings to the `db.cnpg.storage` section. The defaults are as follows:

```yaml
db:
  # the "db.volume" section stays as it was
  volume:
    storageClass: null
    accessMode: ReadWriteOnce
    size: "10Gi"

  cnpg:
    storage:
      storageClass: null
      size: "10Gi"
  # ... other settings
```

With these settings, OpsChain will keep your existing database deployment and will attempt to migrate it to the new database instance. This process might take some time to complete, depending on your database size.

If you'd like to use the high availability setup, read through the available options and settings described in the [High availability setup](/advanced/high-availability-setup.md) guide carefully before deploying. Once your topology and settings are ready, you can deploy OpsChain with the new version.

### Deploy OpsChain

Deploy OpsChain using the regular Helm upgrade command. Once deployed, a pod responsible for migrating the database will be created and will be running until the migration is complete, this process might take a few minutes to complete and the regular OpsChain services will not be available until then. You can follow the migration process by following the logs of the migration pod:

```bash
kubectl -n ${KUBERNETES_NAMESPACE} logs pod/$(kubectl get pods -n ${KUBERNETES_NAMESPACE} | grep "opschain-db-1-import" | awk '{print $1}') -f
```

:::tip
The command above will fail if the import pod has been terminated or has not been created yet.

Alternatively, you can describe the database cluster to check the migration progress:

```bash
kubectl describe cluster opschain-db -n ${KUBERNETES_NAMESPACE}
```

:::

:::info
It's expected that some OpsChain services fail to start during a long-running migration. This is expected and will not affect the migration process.
:::

If you used the default values, the new database instance will be in a pod named `opschain-db-1` and will be available in your Kubernetes namespace when the migration is complete. When the database successfully starts, restart the OpsChain services so they connect to it:

```bash
kubectl rollout restart deployment opschain-api opschain-api-worker opschain-log-aggregator -n ${KUBERNETES_NAMESPACE}
```

Verify the migration is successful via the logs and by checking OpsChain's instance is working either by creating a change or modifying a project's properties via the UI. If the automatic migration fails, you can follow the [manual database migration process](#manual-database-migration) to recover the database.

:::info
Once the migration is complete and the new database is fully operational, you should remove the `db.recoveryMode` and all the `db.volume` settings from the `values.yaml` file and redeploy OpsChain. The old database deployment will be removed once OpsChain successfully deploys without these settings.
:::

## Manual database migration

:::warning
This process is only required if the automatic migration fails to complete.
:::

If the migration process fails to complete automatically, you can still manually import the backup into the new database. The requirements to do so are:

- You must have the `base.tar.gz` and `pg_wal.tar.gz` files from the backup
- The CNPG operator must be installed and running
- The database credentials and encryption keys must be the same as the original database

:::info Default cluster name
This guide will use `opschain-db` as the cluster name, adjust it to the name of your cluster if you've changed it.
:::

Given those requirements are met, we can start the manual database migration process by deleting the existing cluster:

```bash
kubectl delete cluster opschain-db -n ${KUBERNETES_NAMESPACE}
```

:::danger
The next step requires deleting the old database deployment and relying only on the backup files to restore the database. Proceed only if you have a working backup of your database.
:::

Next, remove the `db.recoveryMode` setting in your `values.yaml` file and redeploy OpsChain in stopped mode with the database cluster in hibernation mode, by passing the `--set stopped=true` and the `--set stopDatabase=true` flags to the Helm command used for installing and patching OpsChain.

:::tip
For faster hibernation switching, you can toggle hibernation on and off by annotating the database cluster with the `cnpg.io/hibernation` annotation instead of redeploying OpsChain. For example:

```bash
kubectl annotate cluster opschain-db -n ${KUBERNETES_NAMESPACE} cnpg.io/hibernation=on
```

:::

You can then check the existing pod list by running the following command:

```bash
kubectl get pods -n ${KUBERNETES_NAMESPACE}
```

Once the database pod is not present in the list, we'll create a pod that uses the database's PVC and mount the backup files to it. Remember to update the image tag and claim name according to your setup, these are the defaults.

```bash
kubectl run restore-from-backup --rm -it --restart=Never \
  --image=limepoint/opschain-db:17.5 \
  --overrides='{
    "spec": {
      "securityContext": {"runAsUser": 0, "runAsGroup": 0},
      "containers": [{
        "name": "restore",
        "image": "limepoint/opschain-db:17.5",
        "command": ["/bin/bash"],
        "stdin": true,
        "tty": true,
        "volumeMounts": [
          {"name": "pgdata", "mountPath": "/var/lib/postgresql/data"}
        ]
      }],
      "volumes": [
        {"name": "pgdata", "persistentVolumeClaim": {"claimName": "opschain-db-1"}}
      ]
    }
  }'
```

This will drop you into a shell inside the recovery pod, do not exit this pod yet. From another terminal session, copy the backup files from the backup folder (modify to where your backup files are) into the pod's `/tmp` directory:

```bash
for file in $(find /limepoint/backup -type f); do
  kubectl cp $file restore-from-backup:/tmp/$(basename $file)
done
```

Back to the recovery pod shell, check the backup files are there and fully copied:

```bash
ls -lah /tmp
```

Save the sensitive PostgreSQL files to the `/tmp` directory:

```bash
cp /var/lib/postgresql/data/pgdata/{pg_hba.conf,pg_ident.conf,postgresql.conf,postgresql.auto.conf} /tmp/
```

And, finally, we can recover the database with the following commands:

1. Remove the original `pgdata` folder

   ```bash
   rm -rf /var/lib/postgresql/data/pgdata/*
   ```

2. Extract the base backup

   ```bash
   tar xzvf /tmp/base.tar.gz -C /var/lib/postgresql/data/pgdata/
   ```

3. Extract the WAL files

   ```bash
   tar xzvf /tmp/pg_wal.tar.gz -C /var/lib/postgresql/data/pgdata/pg_wal/
   ```

4. Change the ownership of the database folders and files

   ```bash
   chown -R 26:26 /var/lib/postgresql/data
   ```

5. Restore the sensitive PostgreSQL files

   ```bash
   cp /tmp/{pg_hba.conf,pg_ident.conf,postgresql.conf,postgresql.auto.conf} /var/lib/postgresql/data/pgdata/
   ```

6. Check the control data to ensure the backup is valid

   ```bash
   pg_controldata /var/lib/postgresql/data/pgdata/

   # For a valid backup, this should show "Database cluster state: in production" at the top of the output.
   ```

Once that's working, you can exit the recovery pod, toggle hibernation off by redeploying OpsChain without the `stopDatabase` setting and wait for CNPG to resume the cluster. You can follow the database's logs to check for failures/errors. It's common to see some CNPG errors at first, but they should be gone once the PostgreSQL instance is running.

If the database pod is running successfully, you can resume OpsChain by redeploying without the `stopped` and `stopDatabase` settings.
