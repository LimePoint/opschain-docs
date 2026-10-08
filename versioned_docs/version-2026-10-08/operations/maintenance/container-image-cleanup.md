---
sidebar_position: 4
description: Learn how to reclaim disk used by OpsChain images
---

# Container image cleanup

OpsChain generates and stores images in its internal image registry whenever a change, an agent or a step runs. To help ease disk usage, images can be cleaned up in two distinct ways:

1. **Tags in the Trow registry** — generated as part of normal operation (one tag per step, change, agent task, and template version). Cleaned up by the **registry reconciler** (recommended) or manually with rake tasks.
2. **Image blobs cached on each K3s node** — pulled by the kubelet into the node's containerd image store when a pod runs. Cleaned up automatically by the kubelet's built-in image garbage collector (see [Tuning K3s image garbage collection](#tuning-k3s-image-garbage-collection) for how to configure it) or manually with `crictl` for one-off admin tasks, as described in the [Host-side image cleanup](#host-side-image-cleanup) section.

In high-availability topologies, each cluster has its own Trow registry, meaning that reconciliation must be configured individually in each cluster.

:::info[Agent images]
Agent images are persisted in the Trow registry until they are cleaned up by a [data cleanup definition](/operations/maintenance/data-cleaning.md). This provides more fine-grained control over which agent images to keep for possible reuse, etc.
:::

## Registry reconciliation

When the action generation for an asset, a change or a step finishes, the corresponding image stays in the local image registry as an orphan tag and may continue to consume disk space. The registry reconciliation job is responsible for cleaning up these orphan tags and it can be enabled via the [image cleanup settings](/setup/configuration/additional-settings.md#image-cleanup-settings) in the `values.yaml` file.

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

The commands above all act on the Trow registry. Each K3s node also caches the image blobs it pulls in containerd's own image store. That cache is independent of Trow and has its own lifecycle on every node.

The paths in this section follow the [K3s installation guide](/setup/installing_k3s.md), which installs K3s with `--data-dir /limepoint/k3s` and symlinks `/etc/rancher` to `/limepoint/rancher`. Adjust them if your K3s data directory differs. K3s owns these files as root, so edit them as root.

### Tuning K3s image garbage collection

The K3s defaults for node-side image garbage collection are conservative — they only begin reclaiming disk once usage is already high. On an OpsChain node, where every change and step pulls or builds images into containerd's cache, tightening these settings makes the node clean up earlier and reduces the risk of the host running out of disk.

These settings are most effective when applied at install time, so the cluster behaves correctly from its first build onward. They apply per node, so the configuration must be applied on every K3s node. In high-availability topologies that means every node in each cluster.

#### Kubelet image GC thresholds

The kubelet runs a built-in image garbage collector on every node. It evicts unused images once the image filesystem crosses a high-water mark. The default values are:

| Setting | Default | Purpose |
| --- | --- | --- |
| `image-gc-high-threshold` | 85% | Image garbage collection begins when image-filesystem usage crosses this percentage |
| `image-gc-low-threshold` | 80% | Target image-filesystem usage after a garbage collection pass |
| `minimum-image-ttl-duration` | 2m | Minimum age before an image becomes eligible for eviction |

Pass tighter thresholds to the kubelet from K3s' configuration file, `/limepoint/rancher/k3s/config.yaml`:

```yaml
kubelet-arg:
  - "image-gc-high-threshold=70"
  - "image-gc-low-threshold=60"
  - "minimum-image-ttl-duration=10m"
```

These values are a reasonable starting point for OpsChain clusters. Lower the thresholds further if disk pressure persists, or raise `minimum-image-ttl-duration` if you observe images being evicted too soon, causing subsequent steps to re-pull the image.

:::info[GC is threshold-driven, not periodic]
The kubelet only triggers image garbage collection when image-filesystem usage crosses the high threshold. A cluster with plenty of headroom will not garbage collect even with tight thresholds — there is nothing to do. These settings bring forward the _point_ at which cleanup starts; they do not schedule a sweep on a timer.
:::

#### Discarding unpacked containerd layers

After pulling an image, containerd keeps both the compressed layers it downloaded and the unpacked snapshot it runs containers from. Discarding the compressed copy once an image is unpacked roughly halves the disk each image costs. The trade-off is that containerd pulls a layer again if it ever needs one back — cheap here, because the OpsChain image registry runs in the same cluster.

:::note[Root privileges are required]
The commands below must be run with root privileges.
:::

K3s v1.35 ships containerd 2.x, which merges drop-in configuration files from `/limepoint/k3s/agent/etc/containerd/config-v3.toml.d/` over the configuration K3s generates. Add the setting there rather than editing the generated `/limepoint/k3s/agent/etc/containerd/config.toml`, which K3s rewrites on every start.

Create the directory:

```bash
mkdir -p /limepoint/k3s/agent/etc/containerd/config-v3.toml.d
```

Then create `/limepoint/k3s/agent/etc/containerd/config-v3.toml.d/discard-unpacked-layers.toml` containing:

```toml
[plugins.'io.containerd.cri.v1.images']
  discard_unpacked_layers = true
```

The setting only applies when containerd pulls images itself rather than handing the pull to its transfer service. K3s already enables that, so nothing else is needed — but if containerd logs `Found 'DiscardUnpackedLayers' in CRI config which is incompatible with transfer service`, check that your configuration has not turned `use_local_image_pull` off. See the [K3s containerd configuration documentation](https://docs.k3s.io/advanced#configuring-containerd) for the full set of options.

#### Applying the configuration

K3s reads both files at start-up. Restart it on each node you changed:

```bash
sudo systemctl restart k3s
```

:::warning[Restarting K3s interrupts running work]
Restarting K3s restarts the node's workloads. Wait until the node has no changes or steps in flight, otherwise the steps running on it fail.
:::

Once the node is back, confirm containerd merged the drop-in. Run this as root, as it reads K3s' containerd configuration directly:

```bash
/limepoint/k3s/data/current/bin/containerd \
  -c /limepoint/k3s/agent/etc/containerd/config.toml \
  config dump | grep -E 'discard_unpacked_layers|use_local_image_pull'
```

`config dump` prints the configuration with the drop-in files merged in and every default filled out, so both settings should report `true`. If `discard_unpacked_layers` reports `false`, check that the `imports` line in `/limepoint/k3s/agent/etc/containerd/config.toml` covers the `config-v3.toml.d` directory, and that your file is in it.

### Manual image cleanup

The kubelet's garbage collector handles routine disk reclamation. For one-off admin tasks — reclaiming disk right now, or clearing out a version you have finished with — use `crictl`, which K3s installs alongside containerd. The K3s installation guide sets up a [`crictl` alias](/setup/installing_k3s.md#setup-shell) for the installation user.

#### Removing all unused images

```bash
crictl rmi --prune
```

This removes every image on the node that no container currently references, not only the ones OpsChain built. Images that are still needed are pulled again from the Trow registry on the next step that uses them.

#### Removing images for a particular OpsChain version

List the images for a version:

```bash
crictl images | grep <version>
```

Then remove them:

```bash
crictl images | grep <version> | awk '{print $3}' | xargs crictl rmi
```

:::warning
This command will remove all images with the given version, ensure they are not required for audit purposes and are not being used by any changes or workers.
:::
