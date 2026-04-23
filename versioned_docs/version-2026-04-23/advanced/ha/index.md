---
sidebar_position: 1
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

- Either an external secret vault must be configured as the global default in both instances or OpsChain's secret vault must be [configured for high availability](/setup/configuration/additional-settings.md#secret-vault-settings).
- An external LDAP/AD server must be used for user authentication.
- The image registry password must be the same across all clusters.

## Installing the CNPG operator

Ensure all clusters have the CNPG operator installed. Follow the steps outlined in the [install the CNPG operator](/setup/configuration/preparing-your-environment.md#install-the-cnpg-operator) section of the installation guide to install the CNPG operator in each cluster.

## Configuration

### Cluster configuration

Some settings are available to configure your CNPG cluster via the `values.yaml` file and should be considered carefully before the first deployment with CNPG. All the settings below default to a non-HA setup.

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

#### `db.cnpg.primaryUpdateMethod`

Default value: _restart_

The method to use to update the primary database instance when performing a database upgrade or a failover. The available options are:

- `restart`: Restart the primary database instance, potentially causing a short downtime.
- `switchover`: Perform a database switchover to the updated primary instance.

:::warning Switchover requires multiple database instances
Setting this to `switchover` and not having two or more database instances will have the same effect of using `restart`.
:::

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
# opschain-db is the default cluster name for the database
kubectl get secrets -n ${KUBERNETES_NAMESPACE} | grep "opschain-db"
```

:::tip Providing alternative DNS names
You can provide alternative DNS names for the CNPG-generated TLS certificates by using the `db.cnpg.security.tls.serverAltDNSNames` setting (provide values as an array of strings).
:::

If you'd like to bring your own certificates, you must create the necessary Kubernetes secrets containing the CA certificate and private key, the server certificate and private key, and the streaming replica certificate and private key. To enable custom certificates, you must set the `db.cnpg.security.tls.customCerts.enabled` setting to `true`.

Each CNPG cluster requires the following set of secrets:

- **Server CA Secret:**  
  A generic secret containing the CA certificate and private key. This must be the same CA that signs the certificates for the server and the streaming replica. The secret name must be defined in the `db.cnpg.security.tls.customCerts.serverCASecret` setting.

- **Server TLS Secret:**
  A TLS secret (of type `kubernetes.io/tls`) for the database server, containing the certificate and private key. This should contain the `subjectAlternativeNames` for all service names used to access the database:  
  - `opschain-db-rw`
  - `opschain-db-rw.<namespace>`
  - `opschain-db-rw.<namespace>.svc`
  - `opschain-db-rw.<namespace>.svc.cluster.local`

  where `opschain-db` is the default cluster name (`db.cnpg.clusterName` setting) from the `values.yaml` file, and `<namespace>` is the namespace where OpsChain and the database cluster are deployed. The secret name must be defined in `db.cnpg.security.tls.customCerts.serverTLSSecret`.

- **Replication TLS Secret:**  
  A TLS secret (of type `kubernetes.io/tls`) for the `streaming_replica` user, allowing external clusters to connect for replication. It must contain the CA certificate, TLS certificate, and private key. This key pair will be used by all external clusters accessing this database and is referenced as shown in the [next section](#external-cluster-certificate). The secret name must be set in `db.cnpg.security.tls.customCerts.replicationTLSSecret`.

- **Client CA Secret:**  
  The CA certificate that signs the `streaming_replica` user's certificate. Specify this in `db.cnpg.security.tls.customCerts.clientCASecret`. You may use the same CA for both server and streaming replica, or provide a different CA by specifying the name of a generic secret containing the CA certificate and private key.

---

##### Summary table of required secrets

| Secret purpose              | Secret type           | Required data                              | `values.yaml` setting                                            | Notes                                                                                           |
|-----------------------------|----------------------|--------------------------------------------|------------------------------------------------------------------|-------------------------------------------------------------------------------------------------|
| Server CA                   | Generic (`Opaque`)   | `ca.crt`, `ca.key`                         | `db.cnpg.security.tls.customCerts.serverCASecret`                | Must be the CA used to sign both server & streaming replica certificates.                       |
| Server TLS Certificate      | TLS (`kubernetes.io/tls`) | `tls.crt`, `tls.key`                  | `db.cnpg.security.tls.customCerts.serverTLSSecret`               | SANs must include all relevant service FQDNs for the cluster.                                   |
| Replication TLS Certificate | TLS (`kubernetes.io/tls`) | `ca.crt`, `tls.crt`, `tls.key`         | `db.cnpg.security.tls.customCerts.replicationTLSSecret`          | Used by external clusters to connect as `streaming_replica`.                                    |
| Client CA                   | Generic (`Opaque`)   | `ca.crt`, `ca.key`                         | `db.cnpg.security.tls.customCerts.clientCASecret`                | May be the same as Server CA or a different CA specifically for the client (`streaming_replica`). |

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

By default, OpsChain will require TLS and password for all connections and only allow access to the database from these CIDR ranges:

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

If instead you'd like to fully replace the `pg_hba` configuration, you can set the `db.cnpg.security.pgHba.customRules` variable to a list of custom rules. Note that this will completely replace the default rules, such as the default CIDR ranges provided by OpsChain. For example:

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
By default, OpsChain adds a self-reference entry for the current cluster, enabling CNPG to reference itself.
:::

## What to do next

- Learn how to perform [operations on a high availability OpsChain setup](/advanced/ha/operations.md)
