---
sidebar_position: 5
description: Upgrading OpsChain to the latest release.
---

# Upgrading

This guide takes you through upgrading OpsChain to the latest release.

:::caution
Before upgrading OpsChain, make sure you check the [changelog](/changelog.md) for the relevant version - making note of any breaking changes and related pre-upgrade steps.
:::

## Prerequisites

To patch OpsChain, we must refer to the `values.yaml` file used for [installation](/setup/configuration/preparing-your-environment.md#validate-your-configuration). The patching process should be performed in the same server as the one used for installation.

If you're upgrading a high availability topology, ensure you follow the [upgrade sequence](/operations/upgrading.md#upgrading-a-high-availability-topology) instructions.

### Validate Helm and K3s are installed

Before you proceed, please ensure Helm and K3s are installed and configured. You can quickly verify this by running the following commands:

```bash
helm version
k3s --version
```

If you see the version numbers, you are good to go. If you don't, please refer to the [Installing K3s](/setup/installing_k3s.md) guide for more information.

### Validate Helm registry access

With the credentials you received as part of your licence, ensure Helm is connected to DockerHub's registry.

```bash
helm registry login docker.io
```

The command will prompt you for your DockerHub credentials.

### OpsChain chart version

Identify the version of OpsChain you want to upgrade to from the [changelog](/changelog.md) page and set it to your bash profile with the Helm chart version format, for example:

```bash
vi ~/.bash_profile
```

And then add or modify the following line with the version you want to upgrade to:

```bash
export OPSCHAIN_CHART_VERSION=2025.11.12
```

Then source it for the changes to take effect:

```bash
source ~/.bash_profile
```

### Update the `values.yaml` file

Some OpsChain updates might change the settings in the `values.yaml` file. To ensure you don't lose any of your custom settings, carefully update your file, ensuring the new settings are applied and your custom settings are preserved. Refer to the [changelog](/changelog.md) for the version you're upgrading to for any new settings that need to be applied or breaking changes. If you are unsure, refer to the [configuration introduction](/setup/configuration/index.md) guide for more information.

To see the settings the release ships with, <a href='/files/downloads/values.yaml' download='values.yaml'>download the full `values.yaml`</a> for this version of the documentation and compare it against your own file.

:::note[OpsChain version]
Ensure all the settings that have an image tag match the OpsChain version you're patching to, otherwise your installation will be running with outdated images.
:::

## Upgrade OpsChain

:::warning[If upgrading from `2026-07-09`]
Ensure the`opschain-api-worker` deployment is scaled to `0` prior to running the `helm upgrade` command. This will avoid error events being generated in the audit history during the upgrade process. You can scale the deployment down with the following command:

`kubectl scale -n <opschain namespace> deploy/opschain-api-worker --replicas=0`
:::

With the environment variables configured and the `values.yaml` file updated, upgrade OpsChain to the latest version by running the following command:

```bash
helm upgrade --install opschain "oci://docker.io/limepoint/opschain" --version ${OPSCHAIN_CHART_VERSION} --create-namespace -n ${KUBERNETES_NAMESPACE} -f /limepoint/values.yaml --wait --timeout 30m --insecure-skip-tls-verify --debug
```

:::warning[Upgrade time]
The command may take several minutes (up to 30 mins) to start as the OpsChain images are downloaded, especially with slower internet connections.

Do not close or end the shell session while the upgrade is still ongoing, doing so might render your installation unusable.
:::

Just like with installation, this command will start the OpsChain server and its dependent services in separate Kubernetes pods.

The `kubectl` command can be used to see the upgrade progress:

```bash
kubectl get deployments.apps/opschain-api -n ${KUBERNETES_NAMESPACE}
```

The upgrade will be complete when the `READY` column of the `opschain-api` deployment is set to `1/1`. You can verify the current OpsChain version in the [version info](/getting-started/familiarisation/gui/version_info.md) section of the GUI.

## Upgrading a high availability topology

The steps above upgrade a single cluster. In a [high availability topology](/advanced/ha/index.md) several clusters share one replicated database, and every OpsChain instance — including those running in replica clusters — connects to the **primary** cluster's database. Each OpsChain API applies any outstanding database migrations automatically as it starts, against that shared database.

Two consequences shape how you upgrade:

- The schema is migrated once, by the first upgraded API to start. Every other running instance then uses that same, already-migrated schema.
- Running two different OpsChain versions against the shared database at the same time is unsafe — an older instance can encounter a schema it does not expect. Upgrade the primary first, and keep the window in which clusters run different versions as short as possible.

:::warning[Upgrade the whole topology in one maintenance window]
Treat the topology's OpsChain instances as a single application. Do not leave some clusters on the old version and others on the new version for longer than the upgrade itself takes.
:::

### Before you upgrade a topology

- The [changelog](/changelog.md) breaking changes and any **Before upgrading** steps apply to the whole topology — carry them out before you start.
- Move every cluster's `values.yaml` to the same new version together, keeping the encryption keys, database credentials and image registry password identical across clusters, as [high availability](/advanced/ha/index.md#prerequisites) already requires.
- Do not [failover](/advanced/ha/operations.md#failover) during an upgrade.
- If the release changes the PostgreSQL major version, streaming replication cannot run between clusters on different majors — plan this separately and follow the changelog's guidance. See [`db.cnpg.imageName`](/advanced/ha/index.md#dbcnpgimagename).

### Upgrade sequence

1. Update the `values.yaml` on **every** cluster to the new version, as described [above](#update-the-valuesyaml-file).

2. Reduce the running application to only the primary cluster. Scale the API and workers to `0` in every replica cluster and, if you run OpsChain instances (API, workers) in replica clusters, put those clusters into [stopped mode](/advanced/ha/operations.md#deploy-opschain-in-stopped-mode) (`stopped: true`) so only the primary cluster runs the application while the database is migrated. Their databases keep replicating.

3. Upgrade the **primary** cluster with the [upgrade command](#upgrade-opschain). Its API applies the database migration against the shared database. Wait until `opschain-api` reports `1/1`.

4. Upgrade each **replica** cluster to the same version with the same command. If you run OpsChain instances there, bring them back by removing `stopped: true`. Because the schema is already migrated, the new code matches it.

5. If you use the OpsChain secret vault, roll its pods in **every** cluster so they run the new image and reconnect to the primary database — delete them and let the StatefulSet recreate them:

   ```bash
   kubectl delete pod -l app.kubernetes.io/name=openbao -n ${KUBERNETES_NAMESPACE}
   ```

6. [Update the runner image version](#update-the-runner-image-version) in each cluster if it hasn't rolled automatically.

7. Verify every database cluster is healthy and replicating (`kubectl get cluster <cluster-name> -n ${KUBERNETES_NAMESPACE}`), confirm the [version info](/getting-started/familiarisation/gui/version_info.md), and make a small write — create a change or edit a project's properties — to confirm the primary is serving.

:::tip[Minimising database downtime]
Upgrading the primary cluster might restart its database instance in some scenarios, which briefly interrupts the database. If you run more than one database instance in the primary cluster (via [`db.cnpg.primary.replicas`](/advanced/ha/index.md#local-replicas)), set [`db.cnpg.primaryUpdateMethod`](/advanced/ha/index.md#dbcnpgprimaryupdatemethod) to `switchover` to reduce that interruption.
:::

If `opschain-api` does not become ready and the upgrade times out while you are using the OpsChain secret vault, see [`helm upgrade` fails with `context deadline exceeded`](/troubleshooting.md#helm-upgrade-fails-with-context-deadline-exceeded).

## Update the runner image version

After a successful patch, you may want to update your runner image version to the same version as OpsChain. This can be done via [system configuration](/setup/configuration/additional-settings.md#post-install-system-configuration), modifying the `Resolved image` tag to the version you're patching to.

## Old images in the OpsChain registry

OpsChain will not automatically remove old images in the internal image registry during the patching process. This means that old runner images may still exist in the registry, using up disk space. If you need to remove these old images, refer to the [container image cleanup](/operations/maintenance/container-image-cleanup.md) guide.

## Troubleshooting

If the Helm commands take too long to complete, you can check the status of the deployments with the following command:

```bash
kubectl get deployments.apps -n ${KUBERNETES_NAMESPACE}
```

And verify that all deployments have the `READY` column set to a matching value, for example:

```bash
NAME                                  READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/opschain-api          1/1     1            1           10m
deployment.apps/opschain-api-worker   2/2     2            2           10m
...
```

To check the status of the pods, you can run the following command:

```bash
kubectl get pods -n ${KUBERNETES_NAMESPACE}
```
