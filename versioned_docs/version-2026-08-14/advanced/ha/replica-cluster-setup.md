---
sidebar_position: 2
description: A command-by-command guide to adding a replica cluster to an OpsChain high availability topology.
---

# Setting up a replica cluster

This guide walks through adding a replica cluster to an existing OpsChain high availability topology, step by step.

Before starting, read the [high availability setup guide](/advanced/ha/index.md), which explains the concepts and every configuration setting referenced below.

## Example topology

This guide uses a two-cluster example:

- **North** — the primary cluster, already installed and running as a standalone OpsChain instance by following the [installation guides](/setup/installing_k3s.md).
- **South** — the new replica cluster you are adding, which will replicate North's database.

Each cluster reaches the other's database over its [external service](/advanced/ha/index.md#external-service) by hostname — `cluster-north.example.com` and `cluster-south.example.com` in this example — and each has a distinct [`db.cnpg.clusterName`](/advanced/ha/index.md#dbcnpgclustername): `opschain-db-cluster-north` and `opschain-db-cluster-south`.

:::note[Certificates in this guide]
For simplicity, this guide uses CloudNativePG's default self-signed certificates and extracts them from the primary. This is convenient for evaluation and non-production topologies.

For production, provide your own certificates signed by a certificate authority you control (see [certificates](/advanced/ha/index.md#certificates)), and set `db.cnpg.security.tls.customCerts.enabled` to `true`. Because every cluster's certificate then chains to the same CA, each cluster trusts the others without copying per-cluster certificates around, and you control when they are renewed. When you bring your own certificates you can skip the extraction and copy steps below (steps 2 and 3) and instead create your own certificate secrets on each cluster.

Please note that self-signed certificates need to be re-extracted and re-distributed when they are **rotated** (for example when they expire), because the copies held by the other clusters then become stale.
:::

## Before you start

- Ensure your existing and new cluster meet the [prerequisites](/advanced/ha/index.md#prerequisites) for a high availability topology.
- The `values.yaml` for the replica uses the same [encryption and secret values](/setup/configuration/encryption-and-secrets.md) as the primary.

:::tip[Run the database only]
If you don't want to run a full OpsChain instance on the replica, set `stopped: true` in its `values.yaml` so only the database and its replication run. See [deploy OpsChain in stopped mode](/advanced/ha/operations.md#deploy-opschain-in-stopped-mode).
:::

## Step 1: expose the primary's database

On the **primary** (North), make sure the database is reachable from the replica over the external service, and that the primary's server certificate is valid for the hostname the replica will use to reach it. In North's `values.yaml`:

```yaml
db:
  cnpg:
    externalService:
      enabled: true
      nodePort: 30432
    security:
      tls:
        serverAltDNSNames:
          - "cluster-north.example.com"
```

:::note[Secret vault external service]
If you are using the OpsChain secret vault as the global default, also expose it so the active vault can be reached from the other clusters. The active vault can move between clusters on failover, so this must be enabled on every cluster in the topology. Add the following to the same `values.yaml`:

```yaml
secretVault:
  externalService:
    enabled: true
    nodePort: 30201
```

:::

:::warning[Redeploy before extracting the certificates]
Redeploy the primary so the external service and the updated `serverAltDNSNames` take effect — adding a name to `serverAltDNSNames` reissues the server certificate.
:::

## Step 2: extract the primary's certificates

On the **primary** (North), CloudNativePG stores its self-signed certificates in secrets named after the cluster. You can list them with:

```bash
kubectl get secrets -n ${KUBERNETES_NAMESPACE} | grep opschain-db-cluster-north
```

The replica needs two things from the primary to connect as the `streaming_replica` user: the primary's `streaming_replica` certificate and key (from the `<clusterName>-replication` secret), and the primary's CA certificate (from the `<clusterName>-ca` secret). Extract all three into files:

```bash
kubectl -n ${KUBERNETES_NAMESPACE} get secret opschain-db-cluster-north-replication -o jsonpath='{.data.tls\.crt}' | base64 -d > north-tls.crt
kubectl -n ${KUBERNETES_NAMESPACE} get secret opschain-db-cluster-north-replication -o jsonpath='{.data.tls\.key}' | base64 -d > north-tls.key
kubectl -n ${KUBERNETES_NAMESPACE} get secret opschain-db-cluster-north-ca -o jsonpath='{.data.ca\.crt}' | base64 -d > north-ca.crt
```

## Step 3: copy the certificates to the replica

Copy the three files extracted in step 2 (`north-tls.crt`, `north-tls.key`, `north-ca.crt`) to the host from which you run `kubectl` against the **replica** cluster. Use whatever secure copy method your environment allows, for example `scp`.

## Step 4: install the replica's infrastructure

On the **replica** (South), follow the standard installation guides up to — but **not including** — the [install OpsChain](/setup/installation.md#install-opschain) step. In other words, complete:

- [installing K3s and Helm](/setup/installing_k3s.md);
- [TLS configuration](/setup/configuration/tls/index.md);
- [preparing your environment](/setup/configuration/preparing-your-environment.md), including installing the [CNPG operator](/setup/configuration/preparing-your-environment.md#install-the-cnpg-operator).

Stop before running the `helm upgrade --install` that deploys OpsChain — you'll do that in step 7, once the replica is configured.

## Step 5: ensure clusters can resolve each other's hostnames

Each cluster reaches its peers by hostname, and those names must resolve from inside the cluster. An entry is required for every hostname a cluster's pods must resolve for its peers: each peer's database hostname and, when the OpsChain secret vault is used as the global default, that peer's secret-vault external hostname (the value of `global.secretVaultExternalHostName`).

If these hostnames are not already served by your organisation's DNS, you can add them to K3s' CoreDNS with a `coredns-custom` ConfigMap. Give each hostname its own server block, and keep those blocks out of CoreDNS' default `.:53` server block — an inline `hosts` block placed there conflicts with the entries K3s already manages. You can group several server blocks under a single `.server` key (the key name is arbitrary; only the `.server` suffix matters), so one entry per peer is enough. For example, mapping a peer's database hostname and its secret-vault external hostname to that peer's IP:

```yaml
# coredns-custom.yaml

apiVersion: v1
kind: ConfigMap
metadata:
  name: coredns-custom
  namespace: kube-system
data:
  peer-cluster.server: |
    peer-cluster.example.com {
      hosts {
        192.168.0.10 peer-cluster.example.com
        fallthrough
      }
    }
    peer-cluster-vault.example.com {
      hosts {
        192.168.0.10 peer-cluster-vault.example.com
        fallthrough
      }
    }
```

Apply it and restart CoreDNS for the changes to take effect:

```bash
kubectl apply -f coredns-custom.yaml
kubectl -n kube-system rollout restart deployment coredns
```

Confirm CoreDNS comes back healthy (`kubectl -n kube-system get pods -l k8s-app=kube-dns`) and that the name resolves before redeploying OpsChain. If this step is necessary for your setup, you must perform it in every cluster in your topology.

## Step 6: create the namespace and the replication secret

On the **replica**, create the OpsChain namespace, then create a secret holding the primary's certificate files. The secret's name must match the one you reference in the replica's `externalClusters` configuration (step 6); this guide names it `opschain-db-cluster-north-certs`:

```bash
kubectl create namespace ${KUBERNETES_NAMESPACE}

kubectl -n ${KUBERNETES_NAMESPACE} create secret generic opschain-db-cluster-north-certs \
  --from-file=tls.crt=north-tls.crt \
  --from-file=tls.key=north-tls.key \
  --from-file=ca.crt=north-ca.crt
```

:::note[Database credentials secret]
You do not need to create the `opschain-db-credentials` secret yourself — OpsChain creates it from the `env.PGPASSWORD` value in your `values.yaml` when you deploy. Because `PGPASSWORD` matches the primary's, the replica ends up with the same credentials.
:::

## Step 7: configure the replica's `values.yaml`

Configure the replica as a replica of the primary. The key settings are the [replica settings](/advanced/ha/index.md#replica-settings) and the [external cluster](/advanced/ha/index.md#external-cluster-configuration) definition pointing back at the primary, referencing the secret created in step 5:

```yaml
db:
  cnpg:
    clusterName: "opschain-db-cluster-south"

    # Expose this cluster's database too, so it can act as the primary after a failover.
    externalService:
      enabled: true
      nodePort: 30432

    replica:
      # Mark this cluster as a replica and point it at the primary.
      enabled: true
      primary: "opschain-db-cluster-north"
      source: "opschain-db-cluster-north"

    security:
      tls:
        serverAltDNSNames:
          - "cluster-south.example.com"

    externalClusters:
      - name: opschain-db-cluster-north
        connectionParameters:
          host: cluster-north.example.com
          # Must match the primary's externalService.nodePort.
          port: "30432"
          user: streaming_replica
        password:
          name: opschain-db-credentials
          key: password
        sslCert:
          name: opschain-db-cluster-north-certs
          key: tls.crt
        sslKey:
          name: opschain-db-cluster-north-certs
          key: tls.key
        sslRootCert:
          name: opschain-db-cluster-north-certs
          key: ca.crt
```

:::note[Secret vault external service]
If you are using the OpsChain secret vault as the global default, expose this cluster's vault too, so it can be reached when it holds the active vault after a failover. Add the following to the replica's `values.yaml`:

```yaml
secretVault:
  externalService:
    enabled: true
    nodePort: 30201
```

:::

Confirm the shared values are present in the replica's `env` as well — the replica must use the same [mandatory encryption and secret values](/setup/configuration/encryption-and-secrets.md#mandatory-encryption-and-password-settings) as the primary, including `PGPASSWORD` and the encryption keys. When you use the OpsChain secret vault, its [`secretVault.unsealKey`](/setup/configuration/encryption-and-secrets.md#mandatory-secret-vault-settings) must match across clusters too.

## Step 8: deploy the replica

Deploy OpsChain on the replica with the same command used for a normal install.

Because `replica.enabled` is `true`, the replica starts replicating from the primary as soon as it comes up. Its database is read-only until a failover promotes it.

:::note[The provided LDAP is not replicated]
Database replication copies OpsChain's application data, but the bundled OpsChain LDAP runs independently in each cluster and is not part of it. If you use the provided OpsChain LDAP, any users you created on the primary must be recreated on the replica — see [creating an LDAP authenticated user](/setup/setup-instance.md#creating-an-ldap-authenticated-user) — and kept in sync so logins keep working after a failover. This does not apply when all clusters share an [external LDAP](/operations/opschain-ldap.md#configuring-an-external-ldap).
:::

## Step 9: verify replication

Check that the replica cluster reports a healthy state:

```bash
kubectl get cluster opschain-db-cluster-south -n ${KUBERNETES_NAMESPACE}
```

It should show `Cluster in healthy state` once it has connected to the primary and caught up.

Follow the replica database pod's logs to watch it connect and stream from the primary:

```bash
kubectl logs -f opschain-db-cluster-south-1 -n ${KUBERNETES_NAMESPACE}
```

You can also confirm the connection from the **primary** side — the replica appears as a `streaming_replica` connection:

```bash
kubectl exec -it opschain-db-cluster-north-1 -n ${KUBERNETES_NAMESPACE} -- psql -U postgres -c "SELECT client_addr, state, sync_state FROM pg_stat_replication;"
```

:::tip[If the replica does not connect]

- Confirm the replication port (`30432`) is open from the replica to the primary, and that `cluster-north.example.com` resolves from inside the replica's cluster.
- Check that `env.PGPASSWORD` and the encryption keys are identical to the primary's.
- Check the replica database pod's logs for TLS errors — these usually mean the certificate files in `opschain-db-cluster-north-certs` are wrong or stale. Re-extract them (step 2) and recreate the secret.
- A replica that has been offline too long, or was never able to connect, may need to be rebuilt from scratch. See [recovering a replica cluster](/advanced/ha/operations.md#recovering-a-replica-cluster).

:::

## Make the topology ready for failover

The steps above let the replica stream from the primary. To also be able to [failover and failback](/advanced/ha/operations.md#failover) — where the primary later replicates from this cluster — the **primary** needs the replica's certificates and an external cluster entry pointing at it, mirroring what you just did on the replica.

1. Extract the replica's certificates, the same way you extracted the primary's in step 2:

   ```bash
   kubectl -n ${KUBERNETES_NAMESPACE} get secret opschain-db-cluster-south-replication -o jsonpath='{.data.tls\.crt}' | base64 -d > south-tls.crt
   kubectl -n ${KUBERNETES_NAMESPACE} get secret opschain-db-cluster-south-replication -o jsonpath='{.data.tls\.key}' | base64 -d > south-tls.key
   kubectl -n ${KUBERNETES_NAMESPACE} get secret opschain-db-cluster-south-ca -o jsonpath='{.data.ca\.crt}' | base64 -d > south-ca.crt
   ```

   Run these on the replica cluster, then copy the files to the primary's host.

2. Create the secret on the primary:

   ```bash
   kubectl -n ${KUBERNETES_NAMESPACE} create secret generic opschain-db-cluster-south-certs \
     --from-file=tls.crt=south-tls.crt \
     --from-file=tls.key=south-tls.key \
     --from-file=ca.crt=south-ca.crt
   ```

3. Add the replica to the primary's `externalClusters` in North's `values.yaml`, and redeploy:

   ```yaml
   db:
     cnpg:
       externalClusters:
         - name: opschain-db-cluster-south
           connectionParameters:
             host: cluster-south.example.com
             port: "30432"
             user: streaming_replica
           password:
             name: opschain-db-credentials
             key: password
           sslCert:
             name: opschain-db-cluster-south-certs
             key: tls.crt
           sslKey:
             name: opschain-db-cluster-south-certs
             key: tls.key
           sslRootCert:
             name: opschain-db-cluster-south-certs
             key: ca.crt
   ```

With both clusters carrying each other's certificates and external cluster definitions and having successfully established replication, the topology is ready for failover and failback.

## What to do next

- Learn how to perform [operations on a high availability OpsChain setup](/advanced/ha/operations.md).
