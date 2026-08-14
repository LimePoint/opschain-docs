---
sidebar_position: 3
description: A guide on how to operate a high availability OpsChain setup.
toc_max_heading_level: 4
---

# Operations

The procedures below operate on an existing high availability topology. They use the same two-cluster example as the [replica cluster setup guide](/advanced/ha/replica-cluster-setup.md#example-topology): a primary cluster **North** (`opschain-db-cluster-north`) and a replica cluster **South** (`opschain-db-cluster-south`) that replicates it.

By default, OpsChain automatically maps the `PGHOST` and `PGPORT` settings to the `primary` cluster's definition in the `values.yaml` file, so when the topology changes the OpsChain instance automatically connects to the new primary cluster.

## Procedures

Once you've defined your topology and deployed your clusters, you can perform manual failover and failback operations between your clusters and add or remove clusters to the topology.

To upgrade OpsChain across a topology, follow [upgrading a high availability topology](/operations/upgrading.md#upgrading-a-high-availability-topology) — the order in which clusters are upgraded matters, because they share one database.

### Deploy OpsChain in stopped mode

If you don't want to keep an entire OpsChain instance running in the replica clusters, you can opt to only deploy the database and its services such that the replication is still happening, but the OpsChain instance (API, workers, etc.) won't be available. This is useful if you want to save compute resources and can use the primary cluster's OpsChain instance for all operations.

To deploy OpsChain in stopped mode, you can set `stopped: true` at the top of the `values.yaml` file. For example:

```yaml
stopped: true
```

Alternatively, you can simply pass the `--set stopped=true` flag to the Helm command used for installing and patching OpsChain.

To startup the OpsChain instance again, you can simply remove the `stopped: true` setting in the `values.yaml` file and redeploy the cluster or by passing `--set stopped=false` to the Helm command used for installing and patching OpsChain.

### Hibernating the database

Besides stopping the OpsChain instance, you can also hibernate the database using the `stopDatabase: true` setting at the top of the `values.yaml` file or by passing `--set stopDatabase=true` to the Helm command used for installing and patching OpsChain.

When the database is hibernated, the Kubernetes PersistentVolume (PV) and PersistentVolumeClaim (PVC) will be created for it, but no PostgreSQL instance will be running in the replica cluster. This is useful for recovering a cluster from a physical backup or performing maintenance on the cluster.

To resume the database, you can simply remove the `stopDatabase: true` setting in the `values.yaml` file and redeploy the cluster or by passing `--set stopDatabase=false` to the Helm command used for installing and patching OpsChain.

:::tip
For faster hibernation switching, you can toggle hibernation on and off by annotating the database cluster with the `cnpg.io/hibernation` annotation instead of redeploying MintPress. For example:

```bash
kubectl annotate cluster opschain-db -n ${KUBERNETES_NAMESPACE} --overwrite cnpg.io/hibernation=on
```

:::

### Failover

A failover is the process of promoting a replica cluster to primary while demoting the current primary to a replica, ensuring data is not lost and that the new primary is ready to serve requests as soon as possible. With a simple declarative approach, you can do a planned failover in a few steps. We'll use the North (primary) and South (replica) clusters from the [example topology](/advanced/ha/replica-cluster-setup.md#example-topology) as an example.

:::warning[Downtime]
Failover requires a short downtime of OpsChain. The estimated downtime is the amount of time it takes to apply the changes to both clusters (primary and replica) + the time it takes for the databases to synchronize + the time it takes to redeploy the OpsChain instance such that it connects to the new primary database.
:::

#### Update the primary cluster to become a replica

In the `values.yaml` file of the North cluster, set the `replica.enabled`, `replica.primary` and `replica.source` settings.

```yaml
db:
  cnpg:
    replica:
      enabled: true
      # Now pointing to the South cluster as the primary
      primary: "opschain-db-cluster-south"
      source: "opschain-db-cluster-south"
```

Deploy the then-primary cluster in stopped mode, as described in the [Deploy OpsChain in stopped mode](#deploy-opschain-in-stopped-mode) section. Once you patch OpsChain with the updated `values.yaml` file, the North cluster will be in read-only mode.

Check the status of the North cluster:

```bash
kubectl get cluster opschain-db-cluster-north -n ${KUBERNETES_NAMESPACE}
```

Once the cluster notices it's now a replica, it will provide a `demotionToken` in its status. This token will be used to synchronize the data from the North cluster to the South cluster. You can obtain the token by running the following command:

```bash
kubectl get cluster opschain-db-cluster-north -n ${KUBERNETES_NAMESPACE} -o jsonpath='{.status.demotionToken}'
```

#### Update the secondary cluster to become the primary

Using the token obtained from the previous step, configure the `replica.enabled`, `replica.primary`, `replica.source` and `replica.promotionToken` settings in the `values.yaml` file of the South cluster.

```yaml
db:
  cnpg:
    replica:
      enabled: false
      primary: "opschain-db-cluster-south"
      source: "opschain-db-cluster-south"
      promotionToken: "<demotion-token>"
```

:::danger[Promoting the cluster]
The changes in these fields in the promoted cluster must be applied at exactly the same time, otherwise, data loss may occur and the former primary cluster will need to be rebuilt from scratch.
:::

Once you patch OpsChain with the updated `values.yaml` file, the South cluster will be promoted to primary, copying over the remaining WAL files from the North cluster, switching the WAL timeline and ensuring the North cluster can now fetch information from it. The OpsChain instance will automatically connect to the new primary database once deployed. Remember to deploy the South cluster without the `stopped: true` setting if you wish to use the OpsChain instance from that cluster.

::::note[Remaining clusters]
If you have more than two clusters, you must modify the `replica.primary` and `replica.source` fields for each remaining cluster to point to the new primary cluster.
::::

:::info
Once the failover is complete, the now-replica cluster will still have a stale `demotionToken` in its status, this token can be safely ignored. The `promotionToken` can be safely removed from the now-primary cluster's `values.yaml` file as well.
:::

#### Restart the secret vault

If you are using the OpsChain secret vault, you will need to restart its pods (in every cluster) anytime a failover is triggered, so they reconnect to the new primary database. The secret vault runs as a multi-replica StatefulSet, so restart **all** of its pods rather than a single one — delete them and let the StatefulSet recreate them against the new configuration:

```bash
kubectl delete pod -l app.kubernetes.io/name=openbao -n ${KUBERNETES_NAMESPACE}
```

This is necessary so that the secret vault can pick up the new primary cluster's configuration to successfully connect to it.

#### Verify the failover

You can verify the failover has succeeded in a few different ways. First, ensure all clusters are up and running:

```bash
kubectl get cluster <cluster-name> -n ${KUBERNETES_NAMESPACE}
```

All clusters should show `Cluster in healthy state` in their status.

You can access the logs for each database instance of a cluster using the following command:

```bash
kubectl logs <cluster-name>-1 -n ${KUBERNETES_NAMESPACE}
```

Where `<cluster-name>` is the name of the cluster.

And, finally, you can verify via the OpsChain instance that writes are working by creating a change or modifying a project's properties via the UI.

### Failback

Once a failover is complete, you may want to restore the original cluster as a primary cluster in your topology. You can do so by running the failover process in reverse.

If you already haven't done so, remove the `promotionToken` field from the `values.yaml` file of the now-primary cluster when you're demoting it to a replica.

### Adding new clusters to the topology

To add new clusters to the topology, you can simply specify its configuration in the `externalClusters` section for each cluster already in the topology, ensuring the `replica.enabled` field is set to `true` in the `values.yaml` file of the new cluster.

Once the cluster is deployed, it will start replicating from the source cluster as soon as possible. See the [replica cluster setup guide](/advanced/ha/replica-cluster-setup.md) for more information on how to configure the new cluster.

:::info
Ensure that the source cluster can be reached from the new cluster at all times. If the source cluster is not reachable, the new cluster will not be able to replicate from it and will fail to start up.

Check the [external service setting](/advanced/ha/index.md#external-service) section for more information on how to configure the external service for the new cluster.
:::

### Recovering a replica cluster

A replica cluster needs to be recovered from scratch if it has been down for a long time, such that the primary has deleted the WAL files the replica needs to fully synchronize. This might happen for various reasons, such as:

- The replica's been offline for a long time
- Network connectivity between the primary and the replica has been interrupted for a long time
- The replication stopped working - can be caused by many factors, such as bad certificates, configuration errors, etc.

To recover a stale replica cluster, you must:

1. Delete the replica cluster via Kubernetes: `kubectl delete cluster <cluster-name> -n ${KUBERNETES_NAMESPACE}`
2. Ensure the certificates and configurations are well defined and the cluster is defined as a replica and pointing to the primary cluster in its `values.yaml` file.
3. Redeploy the replica cluster using the same command used for deploying it initially.
4. Once the cluster is redeployed, it will start replicating from the primary cluster as soon as possible.

### Force secret vault primary to run on a cluster

When using the OpsChain secret vault with multiple clusters, the secret vault that will operate as the primary is whichever got a lock to the database first. During failover, upgrades or redeployment of the secret vault the primary instance might change to a different vault.

You can force the primary to be in a specific cluster by scaling down the other cluster's vaults, leaving only the one you want to be the primary.

```bash
# In each non-primary cluster
kubectl scale statefulset opschain-secret-vault --replicas=0 -n ${KUBERNETES_NAMESPACE}
```

Once the vaults are scaled down, the remaining cluster's vault will hold the lock and become the primary. Because that cluster runs several vault replicas, the active instance may be any one of them, so inspect all of their logs to confirm which is now the primary:

```bash
# In the primary vault's cluster
kubectl logs -l app.kubernetes.io/name=openbao -n ${KUBERNETES_NAMESPACE} --prefix --tail=50
```

Once the primary vault is confirmed, you can scale the other vaults back up to their configured replica count (`3` by default):

```bash
# In each non-primary cluster
kubectl scale statefulset opschain-secret-vault --replicas=3 -n ${KUBERNETES_NAMESPACE}
```

### Splitting a cluster

If at any point you want to split your clusters, you can do so by simply changing the `replica.enabled` field to `false` in the `values.yaml` file of the cluster you want to split and redeploying it. The cluster will then become a standalone primary cluster with the data it had already replicated and will not replicate from any other cluster.

:::info[Vault access]
You will also need to restart the secret vault pods in the cluster you're splitting from so they pick up the new primary cluster's configuration, reconnect to it, and acquire the lock to the database. Delete the pods and let the StatefulSet recreate them:

```bash
kubectl delete pod -l app.kubernetes.io/name=openbao -n ${KUBERNETES_NAMESPACE}
```

:::

:::warning[Rejoining a cluster]
Note that it is not possible to rejoin a cluster to the topology after splitting it. If you want it to get back into the topology, you will need to delete the cluster and redeploy it as a replica, which it will then replicate from zero.
:::

## Disaster recovery

Disaster recovery is the process of recovering a cluster from an unexpected failure. Disasters can happen at any time and at any cluster, primary or replica. It's important to devise a disaster recovery plan that takes into account the following scenarios.

### Recovery from a replica cluster failure

If a disaster happens to one of your replica clusters, a full recovery might be necessary, depending on how much time it's been offline and how much data the primary cluster retains, as per the [WAL retention settings](/advanced/ha/index.md#database-replication). If you're unsure, you can try to start up the cluster and follow the database logs to see if it can successfully synchronize with the primary cluster. You can verify the database logs by running the following command:

```bash
kubectl logs pod/<cluster-name>-1 -n ${KUBERNETES_NAMESPACE}
```

In case a full recovery is necessary, you can follow the steps outlined in the [Recovering a replica cluster](#recovering-a-replica-cluster) section above.

### Recovery from a primary cluster failure

If a disaster happens to the primary cluster, without [dedicated backups](/operations/maintenance/backups.md), a recovery can be achieved by promoting one of the replica clusters to primary and updating the remaining clusters to point to the new primary. It needs to be taken into account whether this is the right decision for your use case, such as not to cause a "split-brain" scenario.

The data loss (RPO) will be subject to the replication delay between the then-primary and the replicas. This can vary depending on the size of the database and many other factors that affect the replication delay, such as the cross-cluster network latency, the size of the WAL files, the number of replica clusters, etc.

When running with multiple replica clusters, it's important to consider that each cluster might be in a different stage of the replication process, meaning that the RPO can vary depending on the cluster selected to become the new primary.

You can check the status of the replication process by running the following command:

```bash
kubectl get cluster <cluster-name> -n ${KUBERNETES_NAMESPACE}
```

Where `<cluster-name>` is the name of the cluster.

The cluster will show the status of the replication process in its status.

### Recovery from a backup

If a disaster happens and instead of promoting a replica you want to restore from a previoulsy created backup, you can follow the steps outlined in the [database recovery](/operations/maintenance/backups.md#database-recovery) guide, with a few extra considerations:

- First, hibernate all replica clusters, to avoid data loss in case the recovery process doesn't complete successfully.
- Reinstall the primary cluster from the backup as described in the guide and ensure the primary cluster works as expected.
- Once the primary is up, delete the database cluster in the replica instances and redeploy them, such that they restart the replication process from the backed up primary.
- If you are using the OpsChain secret vault, restart its pods in every cluster after redeploying so they pick up the new primary cluster's configuration and reconnect to it — delete them (`kubectl delete pod -l app.kubernetes.io/name=openbao -n ${KUBERNETES_NAMESPACE}`) and let the StatefulSet recreate them.

With these steps, you will be able to restore your OpsChain instance and replicas to a working state as soon as possible.
