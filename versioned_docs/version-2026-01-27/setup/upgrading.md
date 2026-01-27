---
sidebar_position: 6
description: Upgrading OpsChain to the latest release.
---

# Upgrading

:::caution
Before upgrading OpsChain, make sure you check the [changelog](/changelog.md) for the relevant version - making note of any breaking changes and related pre-upgrade steps.
:::

To upgrade OpsChain, we can simply rerun the same instructions from installation, but using the updated installation package.

After obtaining your new `values.yaml` file, ensure its `env:` section (at the bottom) contains the values you filled last time when installing or upgrading OpsChain. We recommend against copy and pasting over the entire section because the settings might have changed in new releases.

:::warning
If the opschain-build-service appears stuck in a pending state during an upgrade, please check this troubleshooting guide: [opschain-build-service stuck in pending state](/troubleshooting.md#opschain-build-service-pod-stuck-in-pending-state-during-an-upgrade)
:::

## Updating runner images in the OpsChain registry

OpsChain will not automatically remove old images in the registry during the upgrade process. This means that old runner images may still exist in the registry. OpsChain provides some utilities to remove these old images and free up some disk space.

### List runner image tags in the registry

```bash
opschain server utils list_runner_image_tags
```

### Remove a runner image tag from the registry

```bash
opschain server utils 'remove_runner_image_tag[<tag_to_remove>]'
```

The [internal registry garbage collection](/administration/maintenance/container-image-cleanup.md#internal-registry-garbage-collection) will then remove these images from disk.
