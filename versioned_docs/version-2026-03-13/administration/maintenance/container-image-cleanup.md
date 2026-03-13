---
sidebar_position: 1
description: Regular maintenance tasks to run (or schedule) on your OpsChain host to cleanup container images.
---

# Container image cleanup

As part of regular system maintenance it is recommended that the OpsChain runner images are regularly pruned to limit disk usage. After following this guide you should know how to:

- remove older OpsChain images
- remove images for a specific change

## Removing images by tag

OpsChain uses runner images to run changes. These images are built whenever a change is run. OpsChain provides some utilities to help with cleanup.

### List runner image tags in the registry

```bash
kubectl exec -n ${KUBERNETES_NAMESPACE} deploy/opschain-api -- /usr/bin/container_start.sh "rake release:list_runner_image_tags"
```

### Remove a runner image tag from the registry

```bash
kubectl exec -n ${KUBERNETES_NAMESPACE} deploy/opschain-api -- /usr/bin/container_start.sh "rake release:remove_runner_image_tag[<tag_to_remove>]"
```

The [internal registry garbage collection](#internal-registry-garbage-collection) will then remove these images from disk.

## Removing images

OpsChain adds Docker labels to runner images to allow for simplified cleanup. If no cleanup is performed then these images will continue to consume disk space.

### With Docker

#### Removing older OpsChain images

The following command will remove unused OpsChain Docker images (`label=opschain=true`) that were created over 72 hours ago (`until=72h`).

```bash
docker image prune --filter 'label=opschain=true' --filter 'until=72h'
```

If these images are not required for audit purposes it is suggested a cron job (or similar) is created to execute this command to free up disk space.

#### Removing OpsChain images for a particular change

The change ID is shown during change creation. The following command will remove unused OpsChain Docker images that exist for change `abc123`.

```bash
docker image prune --filter 'label=opschain.change_id=abc123'
```

### With crictl

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

### Internal registry garbage collection

Step runner images are built whenever a change runs a step. OpsChain runs a garbage collection process to remove these images after 24 hours. If you need more control of this process please [contact us](/support.md#how-to-contact-us).
