---
sidebar_position: 1
description: Prerequisites needed to install and maintain OpsChain
---

# Prerequisites

## Infrastructure requirements

OpsChain requires a minimum of 2GB of RAM to function. We recommend 4GB if you intend to run our more advanced examples.

OpsChain requires a minimum of 30GB of disk to function. We recommend 100GB if you intend to run our examples without having to perform [manual cleanup activities](/administration/maintenance/container-image-cleanup.md) very frequently.

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
