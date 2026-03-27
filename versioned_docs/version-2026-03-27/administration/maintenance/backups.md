---
sidebar_position: 3
description: Learn more about backing up and restoring your OpsChain resources.
---

# Backup & restore

This guide goes into detail about how to backup and restore your OpsChain resources, how OpsChain is designed to facilitate backups and how you can use a backup tool to backup and restore your OpsChain resources.

## Introduction

OpsChain is designed to be backup and restore friendly, ensuring you can easily export and import your OpsChain instance in different environments. Most of the settings and configurations used by OpsChain reside encrypted within its database, making it the most important resource to backup on a regular basis.

## Backup

### Configuration file

Make sure you have a backup of the `values.yaml` file used to deploy OpsChain, ideally one by deployment date, such that you can restore to a specific version of OpsChain. This file contains the exact configuration for OpsChain resources and services, such as its database, vault, LDAP server, etc., as well as the encryption secrets that were used to encrypt all your sensitive data. Without this file, restoring your OpsChain instance will not be possible.

### Database

To backup the OpsChain database, you must run a few manual steps on the host where OpsChain is installed. There are some considerations to keep in mind when backing up the database:

- The backup must always be performed on the primary database cluster - if you're not running in a [high availability setup](/advanced/high-availability-setup.md), this is the only cluster you have. Backing up from replica clusters will create unusable backups.
- The backup should ideally be performed when no changes, workflows or agents are running. If any of these are running, it's possible that they will be in an inconsistent state when restoring from the backup.
- When in a high availability setup, replica database clusters will need to be recreated after the backup is restored.

:::info Limited backup
Backing up the database is limited to the data that is stored in the database. While this includes change and step states, it will not include the actual long-running agents, change deployments or their respective resources.
:::

#### Perform a database backup

The steps below must be followed to backup an existing OpsChain instance. Please note that when `opschain-db` appears in these steps, it refers to the default database cluster name. If you have configured a different name for your cluster, use that name instead.

##### Step 1: Stop OpsChain API and workers

To avoid potential data loss, you should stop the OpsChain API and workers before performing a database backup.

```bash
kubectl scale deployment opschain-api --replicas=0 -n ${KUBERNETES_NAMESPACE}
```

```bash
kubectl scale deployment opschain-api-worker --replicas=0 -n ${KUBERNETES_NAMESPACE}
```

##### Step 2: Deploy a backup pod

Paste the following definition of the backup pod to a file, e.g `backup-helper.yaml`:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: backup-helper
spec:
  initContainers:
  - command:
    - /bin/bash
    - -c
    - find /var/lib/postgresql -not -user postgres -exec chown postgres:postgres
      {} \+;
    image: limepoint/opschain-db:<image-tag>
    imagePullPolicy: IfNotPresent
    name: db-permissions
    securityContext:
      runAsGroup: 0
      runAsUser: 0
  containers:
  - name: postgres
    image: limepoint/opschain-db:<image-tag>
    securityContext:
      runAsUser: 0
      runAsGroup: 0
    command: ["bash", "-c"]
    args:
    - |
      mkdir -p /opt/certs
      cp /ca-certs/ca.crt /opt/certs/
      cp /certs/tls.crt /opt/certs/
      cp /certs/tls.key /opt/certs/
      chmod 640 /opt/certs/*

      mkdir -p ~/.postgresql
      cp /opt/certs/ca.crt ~/.postgresql/root.crt
      cp /opt/certs/tls.crt ~/.postgresql/postgresql.crt
      cp /opt/certs/tls.key ~/.postgresql/postgresql.key
      chmod 640 ~/.postgresql/*

      echo "Certificates copied and permissions set!"
      sleep infinity
    env:
    - name: PGPASSWORD
      valueFrom:
        secretKeyRef:
          name: opschain-db-credentials
          key: password
    - name: PGSSLMODE
      value: "verify-full"
    - name: PGSSLCERT
      value: "/opt/certs/tls.crt"
    - name: PGSSLKEY
      value: "/opt/certs/tls.key"
    - name: PGSSLROOTCERT
      value: "/opt/certs/ca.crt"
    volumeMounts:
    - name: certs
      mountPath: /certs
      readOnly: true
    - name: ca-cert
      mountPath: /ca-certs
      readOnly: true
  volumes:
  - name: certs
    secret:
      secretName: opschain-db-replication
      defaultMode: 0644
  - name: ca-cert
    secret:
      secretName: opschain-db-ca
      defaultMode: 0644
```

Open that file and make the following changes:

- Replace the `<image-tag>` placeholder with the tag for the OpsChain version you're recovering from.
- Replace the `secretName` settings with the names of the Kubernetes secrets that contain the TLS certificates for the database cluster. The names in this sample are for the auto-generated certificates using the default configuration.

:::tip Existing secrets
You can check the existing Kubernetes secrets by running the following command:

```bash
kubectl get secrets -n ${KUBERNETES_NAMESPACE}
```

:::

Once you've made the necessary changes, deploy the backup pod:

```bash
kubectl apply -f backup-helper.yaml -n ${KUBERNETES_NAMESPACE}
```

Once the backup pod is deployed, execute into it:

```bash
kubectl exec -it pod/backup-helper -n ${KUBERNETES_NAMESPACE} -- /bin/bash
```

Within the backup pod, create a path to store the backup:

```bash
mkdir -p /opt/backup
```

##### Step 3: Generate a backup

Still within the backup pod, create some helper variables:

```bash
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backup/${BACKUP_DATE}"
```

:::tip Timezone difference
The backup date is generated with the timezone set in the pod, which might diverge from your expected timezone.
:::

Then, generate the backup:

```bash
pg_basebackup -h opschain-db-rw -U streaming_replica -D "$BACKUP_DIR" -Ft -z --compress=6 -P -v --wal-method=stream --checkpoint=fast --max-rate=100M
```

:::tip Export rate
The `--max-rate` option is used to limit the export rate to 100MB/s. You can adjust this value to your needs.
:::

This command might take a few seconds to complete, depending on the size of your database. Once it is done, verify that the backup files have been created and are not empty:

```bash
ls -lah "$BACKUP_DIR"
```

You should see the following files:

- `backup_manifest`: a manifest file containing the backup information.
- `base.tar.gz`: a compressed tar file containing the base backup.
- `pg_wal.tar.gz`: a compressed tar file containing the WAL files.

Check where the backup files have been saved to:

```bash
echo "$BACKUP_DIR"
```

And note it down, you will need it in the next step. Once you've verified that the backup files have been created and are not empty, you can exit the backup pod. The pod will remain running until you manually delete it.

##### Step 4: Copy the backup files to the host filesystem

Back to the host filesystem, create a directory to store the backup:

```bash
mkdir -p /limepoint/backups
```

And copy the backup files to it:

```bash
kubectl cp backup-helper:/opt/backup -n ${KUBERNETES_NAMESPACE} /limepoint/backups/
```

This will copy the backup files to the `/limepoint/backups` directory on the host. Verify that the files have been copied:

```bash
ls -lah /limepoint/backups
```

Once the files have been copied, you can delete the backup pod:

```bash
kubectl delete pod backup-helper -n ${KUBERNETES_NAMESPACE}
```

And copy the backup files to a secure location.

##### Step 5: Restart OpsChain

If you have scaled down the OpsChain API and workers, you can now scale them back up:

```bash
kubectl scale deployment opschain-api --replicas=1 -n ${KUBERNETES_NAMESPACE}
```

```bash
kubectl scale deployment opschain-api-worker --replicas=3 -n ${KUBERNETES_NAMESPACE}
```

Check your `values.yaml` file for the correct number of worker replicas.

### Kubernetes resources (optional)

Besides the database, you can also opt to use a Kubernetes backup tool to backup and restore OpsChain's Kubernetes resources, such as its deployments, services, etc. Kubernetes backup options include [Velero](https://velero.io/), [Kasten K10](https://www.kasten.io/) and [Portworx](https://portworx.com/products/px-backup/). These tools are outside the scope of this guide and you should refer to their documentation for more information on how to use them.

#### Creating a snapshot of your OpsChain resources

Prior to backing up your resources, we recommend stopping OpsChain:

```bash
opschain server stop
```

It is recommended that you backup the entire `opschain` namespace so that in an unlikely event of a failure, you can get OpsChain up and running after the recovery and restore process. Using the backup tool of your choice, make a snapshot of the `opschain` resources. In addition to the resources in the `opschain` namespace, the OpsChain persistent volumes that fulfil the persistent volume claims (in the `opschain` namespace) need to be backed up as well (e.g. database, Git repos, LDAP, step data). Once the snapshot has been created, you can restart OpsChain:

```bash
opschain server start
```

## Recovery

### Configuration file

Recover the `values.yaml` file for the version of OpsChain you're recovering from and use it to redeploy OpsChain. Copy it to the OpsChain's host filesystem and keep a note of its location to use it in the next steps.

### Database recovery

To restore OpsChain from a database backup, ensure you're deploying into an empty namespace. This is important to avoid conflicts with existing resources. Refer to the [uninstall](/setup/uninstall/uninstall.md#remove-the-opschain-containers-and-data) guide for more information on how to clean up the Kubernetes namespace.

:::warning High availability clusters
If you're restoring from a backup in a high availability setup, check the [extra requirements for high availability clusters](/advanced/high-availability-setup.md#recovery-from-a-backup) when restoring from a backup.
:::

Then, do a regular installation of OpsChain as described in the [installation](/setup/installation.md) guide, but with the additional `--set stopped=true` and `--set stopDatabase=true` flags in the Helm command, as described in the [deploy OpsChain in stopped mode](/advanced/high-availability-setup.md#deploy-opschain-in-stopped-mode) and [hibernating the database](/advanced/high-availability-setup.md#hibernating-the-database) sections.

:::info OpsChain version
You may try to restore the backup to a newer version of OpsChain, but beware of breaking changes between the versions. It's recommended to first restore the backup to the same version of OpsChain as the backup was created with and then upgrade to the latest version.
:::

:::tip Secret vault
While in hibernated mode, it's expected that the default secret vault errors and restarts, given it's failing to access the database. If you'd like to avoid the overhead, scale it down to 0 replicas until you resume OpsChain.

```bash
kubectl scale statefulset opschain-secret-vault --replicas=0 -n ${KUBERNETES_NAMESPACE}
```

Once OpsChain is resumed, you can scale the secret vault back up to the original number of replicas:

```bash
kubectl scale statefulset opschain-secret-vault --replicas=1 -n ${KUBERNETES_NAMESPACE}
```

:::

#### Step 1: Ensure the database pod has been initialised

Right after deploying OpsChain in stopped mode and with a hibernated database, a few pods will be created to initialise the database and will disappear once the initialisation is complete. You can check the status of the pods by running the following command:

```bash
kubectl get pods -n ${KUBERNETES_NAMESPACE}
```

If the database pod is not present in the list and there are no `initdb` pods present in the list, it's likely that the database has already been initialised and you can continue with the next step.

If you encounter errors or are unsure of the database status, you can always delete the database cluster and redeploy OpsChain, this will recreate and initialise the database again.

#### Step 2: Create a recovery pod

Create a recovery pod that will be used to restore the database from the backup files. This pod will use the same volume mounts of the database pod, meaning it's making changes to the database's filesystem directly. If the database is running or anything else makes changes to its files, the recovery process will likely fail.

Make the following changes to the command below:

- Replace the `<image-tag>` placeholder with the tag for the OpsChain version you're recovering from.
- Replace the `claimName` setting with the name of the persistent volume claim for the database. The name in this sample is for the default database cluster name. If you have configured a different name for your cluster, use that name instead.

```bash
kubectl run restore-from-backup --rm -it --restart=Never \
  --image=limepoint/opschain-db:<image-tag> \
  --overrides='{
    "spec": {
      "securityContext": {"runAsUser": 0, "runAsGroup": 0},
      "containers": [{
        "name": "restore",
        "image": "limepoint/opschain-db:<image-tag>",
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

Once you execute that command, you will be dropped into a shell inside the recovery pod. From another terminal session, copy the backup files from the backup folder (modify to where your backup files are) into the pod's `/tmp` directory:

```bash
for file in $(find /limepoint/backups/20210101_120000 -type f); do
  kubectl cp $file restore-from-backup:/tmp/$(basename $file)
done
```

Verify that the backup files have been copied:

```bash
ls -lah /tmp
```

You should see the following files:

```bash
backup_manifest
base.tar.gz
pg_wal.tar.gz
```

#### Step 3: Recover the database files

Back to the recovery pod shell, cleanup the PostgreSQL files in the database directory:

```bash
rm -rf /var/lib/postgresql/data/pgdata/*
```

Then, extract the base backup:

```bash
tar xzvf /tmp/base.tar.gz -C /var/lib/postgresql/data/pgdata/
```

And the WAL files:

```bash
tar xzvf /tmp/pg_wal.tar.gz -C /var/lib/postgresql/data/pgdata/pg_wal
```

Finally, change the ownership of the database folders and files:

```bash
chown -R 26:26 /var/lib/postgresql/data/pgdata
```

#### Step 4: Verify the database recovery

Run the following command to verify the database control data:

```bash
pg_controldata /var/lib/postgresql/data/pgdata/
```

This should show `Database cluster state: in production` at the top of the output. If it does not, ensure the backup you have is not from a replica database cluster and that you're using the correct database cluster name then restart the process from the beginning.

If that seems to be working, you can proceed with the next steps from another shell session. It's recommended to stay in the recovery pod so you can cleanup the backup files once you've verified everything is working.

#### Step 5: Toggle database hibernation off

Redeploy OpsChain without the `--set stopDatabase=true` flag and wait for the database to resume. To avoid too much overhead, it's recommended to keep the `--set stopped=true` flag for now.

Follow the creation and the logs of the database pod to ensure it successfully loaded the backup. You can follow the logs by running the following command:

```bash
kubectl logs -f pod/opschain-db-1 -n ${KUBERNETES_NAMESPACE}
```

If the database pod runs normally for a few minutes and the logs show no errors, it's likely that the database recovery was successful.

#### Step 6: Start OpsChain

You can now resume OpsChain by redeploying without the `--set stopped=true` and `--set stopDatabase=true` flags in the Helm command. Follow the API and worker logs to ensure they start successfully.

If you're using OpsChain's internal LDAP server, you'll need to recreate the users and groups in that server before you can sign in to OpsChain. Refer back to the [creating your first user](/setup/installation.md#creating-your-first-opschain-user) guide on how to create LDAP users again.

#### Step 7: Cleanup the backup files

Once you've verified everything is working, refer back to your recovery pod shell and remove the backup files:

:::tip
If you have already exited the recovery pod, you can recreate it and delete the files just the same.
:::

```bash
rm -f /tmp/base.tar.gz /tmp/pg_wal.tar.gz /tmp/backup_manifest
```

And exit the recovery pod, it will be automatically deleted once you exit the shell.

### Kubernetes resources recovery

Follow your backup tool's restore procedures if you need to restore a snapshot of your OpsChain Kubernetes resources.
