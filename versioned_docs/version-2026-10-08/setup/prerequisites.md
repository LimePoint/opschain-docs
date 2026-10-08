---
sidebar_position: 1
description: Prerequisites needed to install and maintain OpsChain
---

# Prerequisites

## Infrastructure requirements

OpsChain requires a minimum of 16GB of RAM, which runs two changes at a time once its limits have been lowered after installation. With its default settings OpsChain needs 96GB to support all features with comfortable limits. See the [infrastructure requirements](/setup/installing_k3s.md#infrastructure-requirements) in the K3s installation guide for how these figures are reached and what each additional change, action refresh or agent adds.

OpsChain requires 100GB of disk, which also leaves room to run our examples without having to perform [manual cleanup activities](/operations/maintenance/container-image-cleanup.md) very frequently.

:::note[Using a storage class that enforces capacity, such as Longhorn?]
The figures above assume a storage class that doesn't enforce the capacity requested for a persistent volume, such as Docker Desktop's default storage or K3s's default `local-path` - see [PV capacity is not enforced](/setup/installing_k3s.md#pv-capacity-is-not-enforced). Where capacity genuinely is enforced, for example after installing [Longhorn](/advanced/longhorn-storage.md), the real minimum is driven by the sum of the chart's persistent volume sizes, not this figure - see [give Longhorn a disk of its own](/advanced/longhorn-storage.md#give-longhorn-a-disk-of-its-own) for the numbers (around 155GB for the chart's default sizes).
:::

If using Docker for Mac the [configuration UI](https://docs.docker.com/desktop/mac/#advanced) allows you to adjust the RAM and disk allocation for Docker. After changing the configuration you will need to restart the Docker service.

If using Docker for Windows the [WSL configuration](https://docs.microsoft.com/en-us/windows/wsl/wsl-config#global-configuration-options-with-wslconfig) (or the per [distribution configuration](https://docs.microsoft.com/en-us/windows/wsl/wsl-config#per-distribution-configuration-options-with-wslconf)) allows you to modify the RAM allocation. There is no need to adjust the disk allocation. If WSL is already running it will need to be restarted.

:::tip
When using macOS or Windows we suggest ensuring that your Docker installation is not allocated too much of your system RAM - or the rest of your system may struggle. As a rough guide, we suggest not allocating more than 50% of your system RAM.
:::

## Create a GitHub personal access token

To access the private OpsChain repositories used in the examples, you will need to create a [GitHub personal access token](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token).

This token will also be used for accessing the example OpsChain Git repositories that has been created to provide sample code for the getting started guide, and examples of how you might implement different types of changes.

## Kubernetes

OpsChain requires Kubernetes and will operate on any Kubernetes cluster providing certain minimum requirements are met.

For a single-node evaluation or test environment, we recommend using [Docker Desktop](https://www.docker.com/products/docker-desktop) (Windows or macOS) or [K3s](https://k3s.io) (Linux).

For a multi-node production environment, your cluster _must_ be able to provide the following:

- a default [storage class](https://kubernetes.io/docs/concepts/storage/storage-classes/) which supports the [`ReadWriteOnce` access mode](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#access-modes)
- a [storage class](https://kubernetes.io/docs/concepts/storage/storage-classes/) which supports the [`ReadWriteMany` access mode](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#access-modes)
- a [LoadBalancer](https://kubernetes.io/docs/concepts/services-networking/service/#loadbalancer) service type
- a [TLS certificate](https://kubernetes.io/docs/concepts/configuration/secret/#tls-secrets) for the OpsChain internal container registry that is trusted by the container runtime on your Kubernetes nodes

:::note[Self-hosted K3s]
If you are self-hosting on K3s, its default storage class does not enforce the capacity you request for a volume. See [PV capacity is not enforced](/setup/installing_k3s.md#pv-capacity-is-not-enforced) in the K3s installation guide.
:::

### Metrics server (optional)

OpsChain uses the Kubernetes [metrics server](https://github.com/kubernetes-sigs/metrics-server) to display simplified metrics from your Kubernetes cluster. If using K3s, the metrics server is installed by default, so this step can be skipped. If using a different Kubernetes distribution, you can install it like so:

```bash
# Download the metrics server components.yaml file
curl -L https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml -o metrics-server.yaml

# In the `metrics-server` Deployment definition, add the `--kubelet-insecure-tls` argument to the `args` array.
vi metrics-server.yaml

# Apply the metrics server
kubectl apply -f metrics-server.yaml
```

Installing the metrics server is optional, but it is recommended if you want to see some of your node's metrics in the OpsChain UI.

## What to do next

- Proceed with the [installing K3s guide](/setup/installing_k3s.md) to configure your server and install K3s and Helm.
