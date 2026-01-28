---
sidebar_position: 6
description: A guide to setting up a high availability OpsChain setup.
---

# High availability setup

This guide covers the concepts and instructions needed to set up a high availability (HA) OpsChain deployment with database replication and disaster recovery capabilities.

## Overview

OpsChain uses [CloudNative PostgreSQL (CNPG)](https://cloudnative-pg.io/) to provide production-ready database high availability and disaster recovery. CNPG is a Kubernetes-native operator that manages PostgreSQL clusters with automatic failover, multi-cluster replication, and declarative configuration.

### Distributed topology

OpsChain makes use of CNPG's high availability distributed topology pattern by default, providing an easy declarative addition and removal of clusters from the topology, allowing you to scale and prepare for disaster recovery as necessary. When running with multiple clusters, OpsChain databases provide protection against complete cluster or regional failures, manual failover between clusters (declarative configuration change), and minimal data loss and downtime in case of cluster node failure.

Since all clusters have details of each other in their configuration, it is possible to failover and failback between clusters without having to rebuild each cluster from scratch.

## Prerequisites

To run a high availability OpsChain setup, some conditions must be met:

- All clusters must have network access to each other, including access to the database ports.
- Database credentials and encryption keys must be the same across all clusters.
- Replication can only be setup from a single source cluster. Data conciliation (active-active mode) is not supported.
- CNPG Kubernetes operator must be installed in all clusters.

If along the database replication you'd also like to run OpsChain instances (API, workers, etc.) in separate clusters, these additional conditions must be met:

- An external secret vault must be configured as the global default in all clusters.
- An external LDAP/AD server must be used for user authentication.
- The image registry password must be the same across all clusters.

## Configuration

### Installing the CNPG operator

Before deploying OpsChain with CNPG, you need to install the operator in each Kubernetes cluster where OpsChain will be deployed. To do so, run the following commands in each cluster:

First, create the operator namespace:

```bash
kubectl create namespace cnpg-system
```

Then create the secret used by the operator to pull images. Change `<username>` and `<password>` to the Docker Hub credentials that were provided to you as part of your licence.

```bash
kubectl create secret docker-registry opschain-operator-secret --docker-server=docker.io --docker-username=<username> --docker-password=<password> -n cnpg-system
```

Finally, apply the operator's YAML file:

```bash
kubectl apply -f \
  https://docs.opschain.io/files/downloads/cnpg-operator.yaml \
  --server-side
```

Verify the operator is running:

```bash
kubectl get pods -n cnpg-system
```

:::warning Operator scope
The CNPG operator is installed at the cluster level, with CRDs, controllers and service accounts deployed in the `cnpg-system` namespace.
:::

### Cluster configuration

Some settings are available to configure your CNPG cluster via the `values.yaml` file and should be considered carefully before the first deployment with CNPG. All the settings below default to a non-HA setup.

#### `db.recoveryMode`

Default value: _false_

Whether your OpsChain installation is upgrading to CNPG and needs to recover the database from the previous deployment. If set to `true`, OpsChain will keep your previous database deployment and will attempt to migrate it to the new database instance. This process might take some time to complete, depending on your database size. This setting will be removed in a future release of OpsChain.

```yaml
db:
  recoveryMode: true
  # ... other settings
```

:::warning
Ignore this setting if you're not upgrading OpsChain from a version prior to 2026-01-27.

Deploying without this setting will result in the previous database deployment being lost, thus making it impossible to recover your OpsChain database.
:::

#### `db.cnpg.clusterName`

Default value: _opschain-db_

The name of the CNPG cluster in the Kubernetes namespace.

:::danger
Modifying this setting after the database cluster has been deployed will result in data loss. Plan your cluster names carefully.
:::

#### `db.cnpg.instances`

Default value: _1_

The number of database instances to deploy in the current Kubernetes cluster. By default, OpsChain deploys a single database instance per cluster. In a primary cluster, one instance will be the primary and the rest will be read-only standby replicas. In replica clusters, all the instances will be read-only standby replicas.

#### `db.cnpg.imageName`

Default value: _limepoint/opschain-db:\<env.POSTGRESQL_VERSION\>_

The PostgreSQL image used for the database deployments. By default, it will use the `POSTGRESQL_VERSION` variable in the `env` section of the `values.yaml` file to determine the image version. If the variable is not set, the default PostgreSQL version for the OpsChain version you're using will be used.

:::warning
Beware that migrating from a previous version of PostgreSQL to a new one might require a full database rebuild. Defining an invalid image name will result in a deployment error and OpsChain will fail to start.
:::

#### `db.cnpg.disableReadOnlyServices`

Default value: _true_

Whether to disable the read-only services for the database. It's recommended to keep it disabled unless running multiple database instances within the same Kubernetes cluster.

#### Replica settings

The replica settings define how the current cluster should behave - as a primary or a replica cluster.

##### `db.cnpg.replica.enabled`

Default value: _false_

Whether the current cluster is a replica cluster. This is used to define the cluster as a replica of another cluster in the topology. If set to `true`, the cluster will start replicating from the primary cluster as soon as possible.

When doing failover and failback procedures, this setting will need to change in both clusters.

##### `db.cnpg.replica.primary`

Default value: _\<db.cnpg.clusterName\>_

The name of the primary database cluster in the topology. The name should exist in the `externalClusters` list of the current cluster's `values.yaml` file. If `db.cnpg.clusterName` has not been set, this should use the default cluster name of `opschain-db`.

When doing failover and failback procedures, this setting will need to change in both clusters.

##### `db.cnpg.replica.source`

Default value: _\<db.cnpg.replica.primary\>_ or _\<db.cnpg.clusterName\>_

The name of the database cluster where this cluster is replicating from. On the primary cluster, this references the cluster itself. The name should exist in the `externalClusters` list of the current cluster's `values.yaml` file. If `db.cnpg.clusterName` has not been set, this should use the default cluster name of `opschain-db`.

When doing failover and failback procedures, this setting will need to change in both clusters.

### Storage

You can configure the amount of storage that should be provisioned for the database cluster by modifying the `db.cnpg.storage.size` setting in the `values.yaml` file. It should be enough to accomodate the database and the WAL files used for replication. The default size is `10Gi`.

### External service

When using the high availability setup, OpsChain can automatically create a Kubernetes service to allow the database to be accessed from the external clusters. This can be done by setting the `db.cnpg.externalService.enabled` setting to `true` in the `values.yaml` file of each cluster.

You can also specify the node port to use for the external service by setting the `db.cnpg.externalService.nodePort`. The default node port is `30432`.

:::note
The Kubernetes service itself does not create any firewall rules to allow access to the database from the external clusters. You'll need to configure your firewall rules to allow access to the specified node port. For example, if you are using the local Linux firewall, you can run the following commands:

```bash
sudo firewall-cmd --permanent --add-port=30432/tcp
sudo firewall-cmd --reload
```

:::

### Security

#### Database credentials

One of the prerequisites for a high availability setup is to have the same database credentials across all clusters. OpsChain facilitates this by creating an `opschain-db-credentials` secret in the OpsChain namespace, inferring the password from the `env.PGPASSWORD` key in your `values.yaml` file.

#### Encryption keys

All Rails encryption keys defined in the `values.yaml` should be the same across all clusters. If this is not the case, OpsChain will not be able to decrypt the data stored in the database.

#### Certificates

By default, CNPG issues self-signed certificates for its managed clusters. These certificates are stored in secrets in the OpsChain namespace and should be trusted and configured as secrets in each of the external clusters. You can see the secrets created by CNPG by running the following command:

```bash
kubectl get secrets -n cnpg-system
```

If you'd like to bring your own certificates, you must create the necessary Kubernetes secrets containing the CA certificate and private key, the server certificate and private key, and the streaming replica certificate and private key. To enable custom certificates, you must set the `db.cnpg.security.tls.customCerts.enabled` setting to `true`.

Each CNPG cluster requires the following set of secrets:

- A generic secret containing the CA certificate and private key. This must be the same CA that signs the certificates for the server and the streaming replica. The secret name must be defined in the `db.cnpg.security.tls.customCerts.serverCASecret` setting.
- A TLS secret (of type `kubernetes.io/tls`) for the database server, containing the certificate and private key. This should contain the subjectAlternativeNames for the service used to access the database: `opschain-db-<cluster-name>-rw`, `opschain-db-<cluster-name>-rw.opschain`, `opschain-db-<cluster-name>-rw.opschain.svc`, `opschain-db-<cluster-name>-rw.opschain.svc.cluster.local`, where `<cluster-name>` is the `clusterName` in the `values.yaml` file of the cluster. The secret name must be defined in the `db.cnpg.security.tls.customCerts.serverTLSSecret` setting.
- A TLS secret (of type `kubernetes.io/tls`) for the `streaming_replica` user, which will allow external clusters to connect to the database for replication, containing the CA certificate, TLS certificate and private key. This key pair will be used by all the external clusters accessing this cluster's database and defined like seen in the [next section](#external-cluster-certificate). The secret name must be defined in the `db.cnpg.security.tls.customCerts.replicationTLSSecret` setting.
- Finally, the CA certificate that signs the `streaming_replica` user's certificate must be defined in the `db.cnpg.security.tls.customCerts.clientCASecret` setting. You can use the same CA for both the database server and the `streaming_replica` user. When using a different CA for the client, use the name of a generic secret containing the CA certificate and private key.

It is recommended to provide these certificates for all clusters in the topology, even if they are serving only as replicas at the moment. This will make it easier to failover and failback between clusters when necessary. When bringing your own certificates, you'll be responsible for ensuring the certificates are valid and rotated as necessary.

:::tip
To create a generic secret containing the CA certificate and private key, you can run the following command:

```bash
kubectl create secret generic my-ca-certs --from-file=ca.crt=path/to/ca.crt --from-file=ca.key=path/to/ca.key
```

To create a TLS secret containing the certificate and private key, you can run the following command:

```bash
kubectl create secret tls my-server-certs --cert=path/to/tls.crt --key=path/to/tls.key
```

:::

:::info
Although not recommended, you can disable TLS authentication by modifying the `pg_hba` rules to always trust certain CIDR ranges, as described in the [next section](#postgresql-connection-settings).
:::

##### External cluster certificate

Every external cluster definition must have a matching TLS secret containing the certificate (e.g `tls.crt`), private key (e.g `tls.key`) and CA certificate (e.g `ca.crt`) for all the clusters in the topology. These are the credentials that will be used by PostgreSQL to connect to the database of the cluster being accessed.

:::tip
To create a secret containing all these credentials, you can run the following command:

```bash
kubectl create secret generic streaming-replica-certs --from-file=tls.crt=path/to/tls.crt --from-file=tls.key=path/to/tls.key --from-file=ca.crt=path/to/ca.crt
```

:::

#### PostgreSQL connection settings

By default, OpsChain will require SSL and password for all connections connections and only allow access to the database from these CIDR ranges:

- 10.0.0.0/8
- 172.16.0.0/12
- 192.168.0.0/16

If you wish to add custom CIDRs to the list, you can add them as a list via the `db.cnpg.security.pgHba.additionalCidrs` variable in the `values.yaml` file of each cluster. These CIDRs will be added to the end of the list, after the default CIDR ranges. For example:

```yaml
db:
  cnpg:
    security:
      pgHba:
        additionalCidrs:
          - 92.0.0.0/8
          - 123.0.0.0/8
```

If instead you'd like to fully replace the `pg_hba` configuration, you can set the `db.cnpg.security.pgHba.customRules` variable to a list of custom rules. Note that this will completely replace the default rules, including the default CIDR ranges provided by OpsChain. For example:

```yaml
db:
  cnpg:
    security:
      pgHba:
        customRules:
          - "host all all 127.0.0.0/12 trust"
```

You can learn more about the `pg_hba` configuration in the [PostgreSQL documentation](https://www.postgresql.org/docs/17/auth-pg-hba-conf.html).

### PostgreSQL parameters

#### Database replication

PostgreSQL provides multiple adjustable settings to how it should handle storage of its Write-Ahead Log (WAL) files. These settings directly affect the amount of time a replica cluster can be offline for and gracefully recover from a failure without requiring a full recovery. By default, OpsChain makes use of the [replication slots](https://www.postgresql.org/docs/17/warm-standby.html#STREAMING-REPLICATION-SLOTS) feature of PostgreSQL and keeps up to 2GB of base WAL files (for non-slot replication), each being limited to 500MB, and a maximum of 2GB of WAL files per replication slot. By default, OpsChain limits the number of replication slots to 5 and the number of WAL senders to 10, for redundancy.

This configuration is an initial limiting of the maximum amount of storage space required by each cluster in the topology and means that, if a replica cluster stays offline for more than 2GB of WAL files, it will need to be fully restored from the primary cluster. With these numbers, the maximum storage space occupied by WAL files is limited to 2GB for the base WAL file + 2GB * number of replica clusters.

If you'd like to customize the WAL file storage settings, you can overwrite them in the `db.cnpg.postgresql.parameters` section of the `values.yaml` file. For example:

```yaml
db:
  cnpg:
    postgresql:
      parameters:
        wal_keep_size: "6GB"
        max_wal_size: "1GB"
        max_slot_wal_keep_size: "4GB"
        # Each replicating database occupies a replication slot. Recovering databases might temporarily occupy a secondary slot, so this setting should accomodate for that.
        max_replication_slots: "10"
        # Each WAL sender process tends to a replication slot.
        max_wal_senders: "15"
```

:::warning
Beware that changing these settings can cause your cluster to run out of storage space and fail to recover from a failure. Ensure you keep the storage space dedicated for the cluster up-to-date by modifying the `db.cnpg.storage` section in the `values.yaml` file.
:::

#### Local replicas

To limit the database overhead, OpsChain will deploy a single database instance in each Kubernetes cluster by default. However, CNPG allows you to deploy multiple database instances in the same cluster, where the first will be the cluster's primary database and the rest will be read-only standby replicas.

This is useful for pod-level high availability when running a multi-node Kubernetes cluster, which is not the default setup for OpsChain. You can increase the amount of database instances by modifying the `db.cnpg.instances` setting in your cluster's `values.yaml` file. For example:

```yaml
db:
  cnpg:
    instances: 3
```

:::note
Beware that each local replica instance will occupy a replication slot. Make sure to reflect that when configuring PostgreSQL's `max_replication_slots` and `max_wal_senders` parameters.
:::

#### Other settings

Other PostgreSQL parameters can be configured in the `db.cnpg.postgresql.parameters` section of the `values.yaml` file. A few examples are:

```yaml
db:
  cnpg:
    postgresql:
      parameters:
        # Maximum number of connections to the database
        max_connections: "500"
        # The level of detail of WAL files
        wal_level: "logical"
```

See the [CNPG PostgreSQL parameters documentation](https://cloudnative-pg.io/documentation/1.27/postgresql_conf/) for more information about the available parameters.

### External cluster configuration

By default, OpsChain does not specify any external cluster for replication, meaning that, in a default installation, the database will be running as a single primary cluster. All other clusters in the topology should be defined as external clusters in each other's `values.yaml` files. Replica clusters can be added and removed from the list as your infrastructure evolves.

Each external cluster is defined by a sequence of parameters. The following example defines an exhaustive list of all the parameters available for a single external cluster:

```yaml
db:
  cnpg:
    externalClusters:
      # The name of the external cluster and how it will be referenced in this cluster's configuration
      - name: opschain-db-melbourne
        # The connection parameters to the external cluster's database
        connectionParameters:
          host: opschain-db-melbourne.example.com
          port: "30432"
          user: streaming_replica
          dbname: postgres
          sslmode: require
        password:
          name: opschain-db-credentials
          key: password
        # The SSL certificate and keys to access the external cluster's database
        sslCert:
          name: opschain-db-melbourne-cert
          key: tls.crt
        sslKey:
          name: opschain-db-melbourne-cert
          key: tls.key
        sslRootCert:
          name: opschain-db-melbourne-cert
          key: ca.crt
```

:::note Pre-defined clusters
When deploying OpsChain with the `recoveryMode` setting enabled, OpsChain will automatically create an entry for the old database such that it can be accessed for migrating the database. Once the setting is disabled, the entry will be removed from the list.

By default, OpsChain adds a self-reference entry for the current cluster, enabling CNPG to reference itself.
:::

## Distributed topology use-case

To make it simpler to explain the possible operations with a high availability setup, let's use an example of a two-cluster topology. Let's say you have two clusters, North and South, and you want to define the North cluster as the primary and the South cluster as a replica for redundancy. You could have the following configuration in the `values.yaml` file of the North cluster:

:::note
This example uses custom certificates defined in their respective Kubernetes secrets as mentioned in the [Certificates section](#certificates).
:::

**Cluster North (primary):**

```yaml
db:
  cnpg:
    clusterName: "opschain-db-cluster-north"

    # Create the external service to allow the database to be accessed from the South cluster
    externalService:
      enabled: true
      nodePort: 30432

    replica:
      primary: "opschain-db-cluster-north"
      source: "opschain-db-cluster-north"

    # Define all clusters in the topology as external clusters
    externalClusters:
      - name: opschain-db-cluster-south
        connectionParameters:
          host: cluster-south.example.com
          # The connection port should match what's been configured in each cluster's `externalService.nodePort` setting.
          port: "30432"
          user: streaming_replica
          dbname: postgres
          sslmode: require
        password:
          name: opschain-db-credentials
          key: password
        # The SSL certificates and keys to access the external cluster's database
        sslCert:
          name: opschain-db-south-streaming-certs
          key: tls.crt
        sslKey:
          name: opschain-db-south-streaming-certs
          key: tls.key
        sslRootCert:
          name: opschain-db-south-ca-certs
          key: ca.crt

    security:
      tls:
        customCerts:
          enabled: true
          serverCASecret: "opschain-db-north-ca-certs"
          serverTLSSecret: "opschain-db-north-server-certs"
          clientCASecret: "opschain-db-north-ca-certs"
          replicationTLSSecret: "opschain-db-north-streaming-certs"
```

And the following configuration in the `values.yaml` file of the South cluster:

**Cluster South (replica):**

```yaml
db:
  cnpg:
    clusterName: "opschain-db-cluster-south"

    externalService:
      enabled: true
      nodePort: 30432

    replica:
      # Explicitly define this cluster is a replica. If this is not set, the cluster will start as a primary and will not replicate from any other cluster.
      enabled: true
      primary: "opschain-db-cluster-north"
      source: "opschain-db-cluster-north"

    externalClusters:
      - name: opschain-db-cluster-north
        connectionParameters:
          host: cluster-north.example.com
          port: "30432"
          user: streaming_replica
          dbname: postgres
          sslmode: require
        password:
          name: opschain-db-credentials
          key: password
        sslCert:
          name: opschain-db-north-streaming-certs
          key: tls.crt
        sslKey:
          name: opschain-db-north-streaming-certs
          key: tls.key
        sslRootCert:
          name: opschain-db-north-ca-certs
          key: ca.crt

    security:
      tls:
        customCerts:
          enabled: true
          serverCASecret: "opschain-db-south-ca-certs"
          serverTLSSecret: "opschain-db-south-server-certs"
          clientCASecret: "opschain-db-south-ca-certs"
          replicationTLSSecret: "opschain-db-south-streaming-certs"
```

:::warning Database credentials
Each Kubernetes cluster will have its own `opschain-db-credentials` secret, but the credentials should be the same across all clusters.
:::

## Deploying OpsChain

Once the topology has been defined in each cluster's `values.yaml` file, you can deploy OpsChain in each cluster as defined in the [installation guide](/setup/installation.md#install-opschain).

Once deployed, the North cluster will initialise with an empty OpsChain database - given the `replica.enabled: false` is set in the `values.yaml` file. It is recommended to do the initial setup of the North instance, like creating the first user and logging in before setting up the South cluster.

You can verify the North cluster's status by running the following command:

```bash
kubectl get cluster opschain-db-cluster-north -n ${KUBERNETES_NAMESPACE}
```

When the South cluster is deployed, it will start replicating from the North cluster immediately - given the `replica.enabled: true` is set in the `values.yaml` file of the South cluster and its `primary` field is set to the North cluster's name. Its database will be in a read-only state and the OpsChain instance will be using the North cluster's database until a failover is triggered.

By default, OpsChain will automatically map the `PGHOST` and `PGPORT` settings to the `primary` cluster's definition in the `values.yaml` file, ensuring that when your topology changes, the OpsChain instance will automatically connect to the new primary cluster.

## Operations

Once you've defined your topology and deployed your clusters, you can perform manual failover and failback operations between your clusters and add or remove clusters to the topology.

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
kubectl annotate cluster opschain-db -n ${KUBERNETES_NAMESPACE} cnpg.io/hibernation=on
```

:::

### Failover

A failover is the process of promoting a replica cluster to primary while demoting the current primary to a replica, ensuring data is not lost and that the new primary is ready to serve requests as soon as possible. With a simple declarative approach, you can do a planned failover in a few steps. We'll use the North and South clusters defined above as an example.

:::warning Downtime
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

:::danger Promoting the cluster
The changes in these fields in the promoted cluster must be applied at exactly the same time, otherwise, data loss may occur and the former primary cluster will need to be rebuilt from scratch.
:::

Once you patch OpsChain with the updated `values.yaml` file, the South cluster will be promoted to primary, copying over the remaining WAL files from the North cluster, switching the WAL timeline and ensuring the North cluster can now fetch information from it. The OpsChain instance will automatically connect to the new primary database once deployed. Remember to deploy the South cluster without the `stopped: true` setting if you wish to use the OpsChain instance from that cluster.

::::note Remaining clusters
If you have more than two clusters, you must modify the `replica.primary` and `replica.source` fields for each remaining cluster to point to the new primary cluster.
::::

:::info
Once the failover is complete, the now-replica cluster will still have a stale `demotionToken` in its status, this token can be safely ignored. The `promotionToken` can be safely removed from the now-primary cluster's `values.yaml` file as well.
:::

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

To add new clusters to the topology, you can simply specify its configuration in the `externalClusters` section for each cluster in the topology, ensuring the `replica.enabled` field is set to `true` in the `values.yaml` file of the new cluster.

Once the cluster is deployed, it will start replicating from the source cluster as soon as possible.

:::info
Ensure that the source cluster can be reached from the new cluster at all times. If the source cluster is not reachable, the new cluster will not be able to replicate from it and will fail to start up.

Check the [external service setting](#external-service) section for more information on how to configure the external service for the new cluster.
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

## Disaster recovery

Disaster recovery is the process of recovering a cluster from an unexpected failure. Disasters can happen at any time and at any cluster, primary or replica. It's important to devise a disaster recovery plan that takes into account the following scenarios.

### Recovery from a replica cluster failure

If a disaster happens to one of your replica clusters, a full recovery might be necessary, depending on how much time it's been offline and how much data the primary cluster retains, as per the [WAL retention settings](#database-replication). If you're unsure, you can try to start up the cluster and follow the database logs to see if it can successfully synchronize with the primary cluster. You can verify the database logs by running the following command:

```bash
kubectl logs pod/<cluster-name>-1 -n ${KUBERNETES_NAMESPACE}
```

In case a full recovery is necessary, you can follow the steps outlined in the [Recovering a replica cluster](#recovering-a-replica-cluster) section above.

### Recovery from a primary cluster failure

If a disaster happens to the primary cluster, without dedicated backups, a recovery can be achieved by promoting one of the replica clusters to primary and updating the remaining clusters to point to the new primary. It needs to be taken into account whether this is the right decision for your use case, such as not to cause a "split-brain" scenario.

The data loss (RPO) will be subject to the replication delay between the then-primary and the replicas. This can vary depending on the size of the database and many other factors that affect the replication delay, such as the cross-cluster network latency, the size of the WAL files, the number of replica clusters, etc.

When running with multiple replica clusters, it's important to consider that each cluster might be in a different stage of the replication process, meaning that the RPO can vary depending on the cluster selected to become the new primary.

You can check the status of the replication process by running the following command:

```bash
kubectl get cluster <cluster-name> -n ${KUBERNETES_NAMESPACE}
```

Where `<cluster-name>` is the name of the cluster.

The cluster will show the status of the replication process in its status.
