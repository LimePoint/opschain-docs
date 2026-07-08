---
sidebar_position: 1
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

OpsChain can back up its database automatically — see [automated backups](#automated-backups) below to enable and configure scheduled and pre-deploy backups. A few things to keep in mind:

- The backup must always be performed on the primary database cluster - if you're not running in a [high availability setup](/advanced/ha/index.md), this is the only cluster you have. Backing up from replica clusters will create unusable backups.
- The backup should ideally be performed when no changes, workflows or agents are running. If any of these are running, it's possible that they will be in an inconsistent state when restoring from the backup.
- When in a high availability setup, replica database clusters will need to be recreated after the backup is restored.

:::info[Limited backup]
Backing up the database is limited to the data that is stored in the database. While this includes change and step states, it will not include the actual long-running agents, change deployments or their respective resources.
:::

#### Automated backups

OpsChain can run scheduled database backups for you, and can also take a backup automatically before each upgrade. These backups run inside the cluster using a backup utility built into the OpsChain database image, so your data never leaves your local network.

:::note
Automated backups only run on the primary database cluster. In a [high availability setup](/advanced/ha/index.md), backup resources are not created on replica clusters, and the backup utility refuses to run if it detects the target database is a replica.
:::

##### Configure automated backups

Automated backups are controlled by the `db.backup` section of your `values.yaml`. Scheduled backups are enabled by default:

```yaml
db:
  backup:
    periodic:
      enabled: true
      schedule: '0 2 * * *'
```

Backups are written to a dedicated `opschain-db-backup` persistent volume claim. Two backup methods are available:

- `physical` — a `pg_basebackup` of the database (a compressed base backup plus its write-ahead log). This is the recommended method for scheduled backups and is restored using the [database recovery](#database-recovery) steps.
- `logical` — a `pg_dump` (custom format) export. This is portable across database versions and is recommended for the pre-deploy backup, as it can be restored even after an upgrade changes the database schema or major version.

:::warning[Copy your backups off the host]
With the default local storage, the backup volume lives on a single node and shares a failure domain with that node. Copy your backups to a safe location off the host — for example a file server on your local network — regularly. The backup volume should be treated as a staging area, not as your only copy.
:::

##### Backup reliability

Each backup is written to a temporary location and only saved — and counted towards retention — once it has completed and passed an integrity check, so an interrupted or corrupt backup is never mistaken for a good one and never displaces a valid backup. Every completed backup directory contains an `opschain-backup.json` marker, directories without it are considered incomplete.

Retention (`db.backup.retention.count` and `days`) is applied to completed backups only, and to each trigger independently. Size the volume (`db.backup.storage.size`) for roughly your largest expected database multiplied by the retention count, with headroom — with `local-path`/`hostPath` storage the volume cannot be resized in place, so err on the generous side.

:::note[Backups and high availability]
The `opschain-db-backup` volume is preserved when a cluster changes role (primary to replica, or back) during failover or failback, and is intentionally retained when OpsChain is uninstalled — see [persistent data](/operations/uninstall/persistent-data.md). Only the primary cluster runs backups, but the volume and its history stay in place so they remain available after a failover.
:::

##### Scheduled backups

When `db.backup.periodic.enabled` is `true`, a `CronJob` named `opschain-db-backup` runs on the configured `schedule` (a standard cron expression). Older backups are pruned according to `db.backup.retention`.

You can trigger a backup at any time without waiting for the schedule. The `$(date +%Y%m%d_%H%M%S)` suffix gives each run a unique name so repeated runs never clash:

```bash
kubectl create job --from=cronjob/opschain-db-backup opschain-db-backup-manual-$(date +%Y%m%d_%H%M%S) -n ${KUBERNETES_NAMESPACE}
```

Manually created jobs are not owned by the `CronJob`, so its history limits do not remove them. Delete a manual job (which also removes its pod) by name once it has completed:

```bash
kubectl delete job opschain-db-backup-manual-<suffix> -n ${KUBERNETES_NAMESPACE}
```

:::info[In-flight changes]
Scheduled backups run while OpsChain is online and do not stop the API or workers. The database backup itself is consistent, but any changes, workflows or agents that are mid-execution may be captured in an inconsistent state and could resume inconsistently after a restore. To avoid that possibility, scale the API and workers down first, take the backup, then scale them back up to your configured `api.replicas` and `apiWorker.replicas` counts:

```bash
kubectl scale deployment opschain-api opschain-api-worker --replicas=0 -n ${KUBERNETES_NAMESPACE}
```

```bash
kubectl scale deployment opschain-api --replicas=1 -n ${KUBERNETES_NAMESPACE}
kubectl scale deployment opschain-api-worker --replicas=3 -n ${KUBERNETES_NAMESPACE}
```

:::

##### Pre-deploy backups

Set `db.backup.preDeploy.enabled` to `true` to take a backup automatically before every `helm upgrade`. This runs as a Helm pre-upgrade hook: if the backup fails, the upgrade is aborted, so you always have a fresh backup before changes are applied. A `logical` backup is used by default so that it remains restorable across database version upgrades.

:::note
The pre-deploy backup writes to the same `opschain-db-backup` volume, which must already exist. Enable scheduled backups (or deploy once with backups enabled) before turning on the pre-deploy backup.
:::

### Kubernetes resources (optional)

Besides the database, you can also opt to use a Kubernetes backup tool to backup and restore OpsChain's Kubernetes resources, such as its deployments, services, etc. Kubernetes backup options include [Velero](https://velero.io/), [Kasten K10](https://www.kasten.io/) and [Portworx](https://portworx.com/products/px-backup/). These tools are outside the scope of this guide and you should refer to their documentation for more information on how to use them.

#### Creating a snapshot of your OpsChain resources

Prior to backing up your resources, we recommend stopping OpsChain. See the [stopping and starting](/operations/stopping-and-starting.md) guide for more information on how to stop OpsChain.

It is recommended that you backup the entire `opschain` namespace so that in an unlikely event of a failure, you can get OpsChain up and running after the recovery and restore process. Using the backup tool of your choice, make a snapshot of the `opschain` resources. In addition to the resources in the `opschain` namespace, the OpsChain persistent volumes that fulfil the persistent volume claims (in the `opschain` namespace) need to be backed up as well (e.g. database, Git repos, LDAP, step data). Once the snapshot has been created, you can restart OpsChain.

## Recovery

### Configuration file

Recover the `values.yaml` file for the version of OpsChain you're recovering from and use it to redeploy OpsChain. Copy it to the OpsChain's host filesystem and keep a note of its location to use it in the next steps.

### Database recovery

To restore OpsChain from a database backup, ensure you're deploying into an empty namespace. This is important to avoid conflicts with existing resources. Refer to the [uninstall](/operations/uninstall/index.md#remove-the-opschain-containers-and-data) guide for more information on how to clean up the Kubernetes namespace.

:::note[Turn off pre-deploy backups before recovering]
Set `db.backup.preDeploy.enabled` to `false` in your `values.yaml` before starting a recovery.
:::

:::warning[High availability clusters]
If you're restoring from a backup in a high availability setup, check the [extra requirements for high availability clusters](/advanced/ha/operations.md#recovery-from-a-backup) when restoring from a backup.
:::

Then, do a regular installation of OpsChain as described in the [installation](/setup/installation.md) guide, but with the additional `--set stopped=true` and `--set stopDatabase=true` flags in the Helm command, as described in the [deploy OpsChain in stopped mode](/advanced/ha/operations.md#deploy-opschain-in-stopped-mode) and [hibernating the database](/advanced/ha/operations.md#hibernating-the-database) sections.

:::info[OpsChain version]
You may try to restore the backup to a newer version of OpsChain, but beware of breaking changes between the versions. It's recommended to first restore the backup to the same version of OpsChain as the backup was created with and then upgrade to the latest version.
:::

:::note[Recovery helper pod]
The steps below use a helper pod that mounts your backup volume read-only at `/opt/backup`. You can enable it by setting `db.backup.recovery.enabled: true` in your `values.yaml` (and, for a physical restore, also `db.backup.recovery.mountDataVolume: true`). If you are recovering into a fresh namespace where the backup volume is empty, copy your off-host backup into the pod first (shown below), then follow the same extract steps.
:::

:::tip[Secret vault]
While in hibernated mode, it's expected that the OpsChain secret vault errors and restarts, given it's failing to access the database. If you'd like to avoid the overhead, scale it down to 0 replicas until you resume OpsChain.

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

#### Step 2: Start the recovery helper pod

Now that the data volume exists, start the recovery helper pod with the database's data volume mounted. In your `values.yaml` set:

```yaml
db:
  backup:
    recovery:
      enabled: true
      mountDataVolume: true
```

Then redeploy with `--set stopped=true --set stopDatabase=true`, keeping the database stopped and hibernated.

Once the pod is running, exec into it:

```bash
kubectl exec -it deploy/opschain-db-recovery -n ${KUBERNETES_NAMESPACE} -- bash
```

Your backups are available read-only under `/opt/backup`. List the physical backups and choose one to restore:

```bash
ls -lah /opt/backup/periodic
```

Each backup directory contains `base.tar.gz`, `pg_wal.tar.gz` and `backup_manifest`.

If the backup volume is empty — for example when recovering into a fresh namespace — copy your off-host backup into the pod from another terminal session instead, then use that path in the next step:

```bash
POD=$(kubectl get pod -n ${KUBERNETES_NAMESPACE} -l app=opschain-db-recovery -o jsonpath='{.items[0].metadata.name}')
for file in $(find /path/to/your/backup/20210101_120000 -type f); do
  kubectl cp $file ${KUBERNETES_NAMESPACE}/${POD}:/tmp/$(basename $file)
done
```

#### Step 3: Recover the database files

In the recovery pod shell, set a variable to the backup you chose (a directory under `/opt/backup/periodic`, or `/tmp` if you copied one in):

```bash
BACKUP_DIR=/opt/backup/periodic/20210101_120000
```

Clean up the existing PostgreSQL files in the database directory:

```bash
rm -rf /var/lib/postgresql/data/pgdata/*
```

Extract the base backup:

```bash
tar xzvf "$BACKUP_DIR/base.tar.gz" -C /var/lib/postgresql/data/pgdata/
```

And the WAL files:

```bash
tar xzvf "$BACKUP_DIR/pg_wal.tar.gz" -C /var/lib/postgresql/data/pgdata/pg_wal
```

The recovery pod runs as the `postgres` user (UID 26), so the extracted files already have the correct ownership. If you extracted a backup that was copied in as a different user, you need to fix ownership:

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

#### Step 5: Release the data volume and resume the database

The recovery pod holds the database's data volume, so it must be released before the database can start. In your `values.yaml` turn the recovery helper back off:

```yaml
db:
  backup:
    recovery:
      enabled: false
      mountDataVolume: false
```

Then redeploy without the `--set stopDatabase=true` flag (so the database resumes), keeping `--set stopped=true` for now so you can verify the database before the application starts.

Wait for the database to resume. Follow the creation and the logs of the database pod to ensure it successfully loaded the backup. You can follow the logs by running the following command:

```bash
kubectl logs -f pod/opschain-db-1 -n ${KUBERNETES_NAMESPACE}
```

If the database pod runs normally for a few minutes and the logs show no errors, it's likely that the database recovery was successful.

#### Step 6: Start OpsChain

You can now start OpsChain by redeploying without the `--set stopped=true` flag. Follow the API and worker logs to ensure they start successfully.

If you're using OpsChain's internal LDAP server, you'll need to recreate the users and groups in that server before you can sign in to OpsChain. Refer back to the [creating your first user](/setup/setup-instance.md#creating-your-first-opschain-user) guide on how to create LDAP users again.

#### Step 7: Clean up

The recovery pod was disabled in step 5, so there is nothing further to remove. Do **not** delete the backups from the `opschain-db-backup` volume — they remain your restore point. If you copied a backup into the pod's `/tmp` for the recovery, it was discarded automatically when the pod was removed.

#### Restoring a logical backup

A `logical` backup — such as a pre-deploy backup — is a `pg_dump` export that is loaded into a running database, rather than by replacing the data directory. Unlike a physical restore, you do not need to hibernate the database — it must be running to accept the restore.

:::warning[Restore into an empty database]
A logical restore must target a freshly initialised, empty `opschain` database. Restoring on top of a database that OpsChain has already populated is unreliable. In practice, this means starting from a clean cluster: deploy into an empty namespace (or delete and recreate the database cluster), and keep OpsChain stopped so the application does not create its schema before you restore.
:::

##### Step 1: Prepare an empty database and start the recovery helper

In your `values.yaml`, enable the recovery helper (a logical restore runs over the network, so leave the data volume unmounted):

```yaml
db:
  backup:
    recovery:
      enabled: true
      mountDataVolume: false
```

Then deploy with the application stopped using the `--set stopped=true` flag.

This starts the database but keeps the API and workers scaled to zero, so CloudNativePG bootstraps an empty `opschain` database and brings up the recovery helper pod. If the cluster already contains data, first remove it (see the [uninstall](/operations/uninstall/index.md#remove-the-opschain-containers-and-data) guide) and redeploy, so a fresh, empty database is created.

##### Step 2: Restore the dump

Exec into the recovery helper — its environment is already configured to connect to the database (host, credentials and TLS):

```bash
kubectl exec -it deploy/opschain-db-recovery -n ${KUBERNETES_NAMESPACE} -- bash
```

Choose the dump to restore, then restore the global objects (roles) followed by the database. Errors about roles that already exist can be ignored:

```bash
BACKUP_DIR=/opt/backup/pre-deploy/20210101_120000
psql -d postgres -f "$BACKUP_DIR/globals.sql"
```

```bash
pg_restore -d opschain --clean --if-exists --no-owner "$BACKUP_DIR/opschain.dump"
```

##### Step 3: Start OpsChain

In your `values.yaml` turn the recovery helper back off:

```yaml
db:
  backup:
    recovery:
      enabled: false
```

Then redeploy without the `--set stopped=true` flag to start the application against the restored database.

##### Testing a logical backup (non-destructive)

To confirm a dump is complete and restorable without touching any database, decode it to SQL inside the recovery helper. `pg_restore -f` reads every object in the archive and writes the equivalent SQL:

```bash
BACKUP_DIR=/opt/backup/pre-deploy/20210101_120000
# list the archive's contents
pg_restore -l "$BACKUP_DIR/opschain.dump" | head
pg_restore -f /tmp/restore_preview.sql "$BACKUP_DIR/opschain.dump" && echo 'archive fully decodes'
rm -f /tmp/restore_preview.sql
```

If it completes without error the dump is intact and restorable. This is the safest way to routinely verify your backups.

### Kubernetes resources recovery

Follow your backup tool's restore procedures if you need to restore a snapshot of your OpsChain Kubernetes resources.
