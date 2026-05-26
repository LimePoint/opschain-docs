---
sidebar_position: 4
description: Learn how to reclaim disk used by OpsChain images
---

# Container image cleanup

OpsChain generates and stores images in its internal image registry whenever a change, an agent or a step runs. To help ease disk usage, images can be cleaned up in two distinct ways:

1. **Tags in the Trow registry** — generated as part of normal operation (one tag per step, change, agent task, and template version). Cleaned up by the **registry reconciler** (recommended) or manually with rake tasks.
2. **Image blobs cached on the Kubernetes host runtime** — pulled by the kubelet onto each node's containerd cache when a pod runs. Cleaned up automatically by the kubelet's built-in image garbage collector (see [Tuning k3s image garbage collection](#tuning-k3s-image-garbage-collection) for how to configure it) or manually with `crictl` / `docker` for one-off admin tasks as described in the [Host-side image cleanup](#host-side-image-cleanup) section.

In high-availability topologies, each cluster has its own Trow registry, meaning that reconciliation must be configured individually in each cluster.

:::info Agent images
Agent images are persisted in the Trow registry until they are cleaned up by a [data cleanup definition](/operations/maintenance/data-cleaning.md). This provides more fine-grained control over which agent images to keep for possible reuse, etc.
:::

## Registry reconciliation

When the action generation for an asset, a change or a step finishes, the corresponding image stays in the local image registry as an orphan tag and may continue to consume disk space. This can be enabled via the [image cleanup settings](/setup/configuration/additional-settings.md#image-cleanup-settings) in the `values.yaml` file.

### How reconciliation works

When enabled, a Kubernetes `CronJob` (`opschain-registry-reconcile`) runs in the cluster on a configurable Cron schedule. The job runs the rake task `release:reconcile_registry`, which:

1. Verifies whether the images present in the registry belong to any inactive records and remove those images
2. Records a summary `info:registry_reconcile:summary` event including the cluster name (defined by the `db.cnpg.clusterName` property in the `values.yaml`) and per-repo counts (`found`, `live`, `removed`).

Non-transient images (e.g. `limepoint/*`) and unknown repos are not affected by the reconciliation process. You can still manually remove them using the commands specified in the [manual registry commands](#manual-registry-commands) section.

### Enabling the reconciler

In each cluster's `values.yaml`, enable the reconciliation and configure its cron schedule, for example

```yaml
registryReconcile:
  enabled: true
  schedule: "0 3 * * *"   # Cron expression
```

You can distinguish each cluster's events by the `cluster_name` field, sourced from the `db.cnpg.clusterName` setting.

### What reconciliation does not do

- It does **not** reclaim disk space right away. Trow stores image blobs separately from tag manifests; deleting a tag only removes the reference. Disk is reclaimed by Trow's garbage collector, which is scheduled by Trow itself.
- It does **not** touch seed images (`limepoint/*`) — those follow the upgrade lifecycle.

## Manual registry commands

To manage the Trow registry manually, you can rely in the following commands, to be executed in the server where OpsChain is installed.

### Search repositories in the registry

```bash
kubectl exec -n ${KUBERNETES_NAMESPACE} deploy/opschain-api -- /usr/bin/container_start.sh "rake release:search_repos[<search_query>]"
```

The search query can be ommited to list all repositories.

### List tags in a repository

```bash
kubectl exec -n ${KUBERNETES_NAMESPACE} deploy/opschain-api -- /usr/bin/container_start.sh "rake release:list_image_tags[<repository>]"
```

The repository argument can be ommited to list all tags in the default repository (`limepoint/opschain-runner-enterprise`).

### Remove a specific tag

```bash
kubectl exec -n ${KUBERNETES_NAMESPACE} deploy/opschain-api -- /usr/bin/container_start.sh "rake release:remove_image_tag[<tag_to_remove>,<repository>]"
```

The repository argument can be ommited to remove the tag from the default repository (`limepoint/opschain-runner-enterprise`).

:::warning
Removing `limepoint/*` images is not recommended as they are the base for running any change or step. Only delete tags for older versions that you know are not needed anymore.
:::

### Force a reconciliation run now

Run the reconciliation task manually:

```bash
kubectl exec -n ${KUBERNETES_NAMESPACE} deploy/opschain-api -- /usr/bin/container_start.sh "rake release:reconcile_registry"
```

## Host-side image cleanup

The commands above all act on the Trow registry. The Kubernetes nodes themselves also cache pulled image blobs in their container runtime (Docker or containerd via crictl). These caches are independent of Trow and have their own lifecycle on each node.

### Tuning k3s image garbage collection

The k3s defaults for node-side image garbage collection are conservative — they only begin reclaiming disk once usage is already high. For OpsChain workloads, where every change and step pulls or builds images onto each node's containerd cache, tightening these settings causes the node to clean up earlier and reduces the risk of running out of disk on the k3s host.

These settings are most effective when applied at install time, so the cluster behaves correctly from its first build onward. They apply per node, so the configuration must be applied on every k3s node. In high-availability topologies that means every node in each cluster.

#### Kubelet image GC thresholds

The kubelet runs a built-in image garbage collector on every node. It evicts unused images once the image filesystem crosses a high-water mark. The default values are:

| Setting | Default | Purpose |
| --- | --- | --- |
| `image-gc-high-threshold` | 85% | Image garbage collection begins when image-filesystem usage crosses this percentage |
| `image-gc-low-threshold` | 80% | Target image-filesystem usage after a garbage collection pass |
| `minimum-image-ttl-duration` | 2m | Minimum age before an image becomes eligible for eviction |

Configure tighter thresholds in `/limepoint/rancher/k3s/config.yaml` on each k3s node:

```yaml
kubelet-arg:
  - "image-gc-high-threshold=70"
  - "image-gc-low-threshold=60"
  - "minimum-image-ttl-duration=10m"
```

Restart k3s on each node where the changes were applied for the change to take effect:

```bash
sudo systemctl restart k3s
```

These values are a reasonable starting point for OpsChain clusters. Lower the thresholds further if disk pressure persists, or raise `minimum-image-ttl-duration` if you observe images being evicted too soon, causing subsequent steps to re-pull the image.

:::info GC is threshold-driven, not periodic
The kubelet only triggers image garbage collection when image-filesystem usage crosses the high threshold. A cluster with plenty of headroom will not garbage collect even with tight thresholds — there is nothing to do. These settings bring forward the _point_ at which cleanup starts; they do not schedule a sweep on a timer.
:::

#### Discarding unpacked containerd layers

By default, containerd retains both the compressed layer blobs and the unpacked snapshot of each pulled image. Setting `discard_unpacked_layers = true` on containerd's overlayfs snapshotter discards the compressed copy after unpacking, roughly halving the per-image disk footprint. The trade-off is a re-pull from the registry on cache miss — cheap, since the OpsChain image registry is in-cluster.

In k3s, containerd's configuration is rendered from a template. To customize it, create `/limepoint/k3s/agent/etc/containerd/config.toml.tmpl` based on the auto-generated `/limepoint/k3s/agent/etc/containerd/config.toml` and add `discard_unpacked_layers = true` to the relevant plugin section. See the [k3s containerd configuration documentation](https://docs.k3s.io/advanced#configuring-containerd) for the template procedure.

After updating the template, restart k3s on each affected node.

### Manual image cleanup

OpsChain adds Docker labels to its images to allow for simplified host-side cleanup. If no cleanup is performed then these images will continue to consume disk space. If at any moment you need to manually remove these images from the host, you can follow the steps below.

#### With Docker

##### Removing older OpsChain images

The following command will remove unused OpsChain Docker images (`label=opschain=true`) that were created over 72 hours ago (`until=72h`).

```bash
docker image prune --filter 'label=opschain=true' --filter 'until=72h'
```

If these images are not required for audit purposes it is suggested a cron job (or similar) is created to execute this command to free up disk space.

##### Removing OpsChain images for a particular change

The change ID is shown during change creation. The following command will remove unused OpsChain Docker images that exist for change `abc123`.

```bash
docker image prune --filter 'label=opschain.change_id=abc123'
```

#### With crictl

Using crictl, which is installed by default with k3s, you can view the images for a certain OpsChain version using the following command:

```bash
crictl images | grep <version>
```

If you wish to remove all images from a OpsChain version, you can use the following command:

```bash
crictl images | grep <version> | awk '{print $3}' | xargs crictl rmi
```

:::warning
This command will remove all images with the given version, ensure they are not required for audit purposes and are not being used by any changes or workers.
:::
