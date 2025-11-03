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

### Metrics server (optional)

OpsChain uses the Kubernetes [metrics server](https://github.com/kubernetes-sigs/metrics-server) to display metrics from your Kubernetes cluster. If using K3s, the metrics server is installed by default, so this step can be skipped. If using a different Kubernetes distribution, you can install it like so:

```bash
# Download the metrics server components.yaml file
curl -L https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml -o metrics-server.yaml

# In the `metrics-server` Deployment definition, add the `--kubelet-insecure-tls` argument to the `args` array.
vi metrics-server.yaml

# Apply the metrics server
kubectl apply -f metrics-server.yaml
```

Installing the metrics server is optional but necessary if you want to see some of your node's metrics in the OpsChain UI.

## Helm

OpsChain is deployed using Helm. You can download, install and validate it with the following commands:

```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | DESIRED_VERSION="v3.17.2" bash

# validate helm
helm version
```

### Jetstack `cert-manager`

OpsChain uses Jetstack's `cert-manager` to manage authentication within internal components via certificates.

```bash
helm repo add jetstack https://charts.jetstack.io
helm repo update
helm upgrade --install cert-manager jetstack/cert-manager --namespace cert-manager --create-namespace --version v1.16.1 --set "crds.enabled=true" --set "featureGates=AdditionalCertificateOutputFormats=true" --set "webhook.extraArgs={--feature-gates=AdditionalCertificateOutputFormats=true}"
```

Along with internal certificates used by OpsChain, `cert-manager` will issue self-signed certificates for the OpsChain image registry and API server. To use these certificates, the `cert-manager` CA certificate must be trusted by the container runtime on your Kubernetes nodes, and by any systems from which you will access the OpsChain API.

Alternatively, `cert-manager` can be configured to issue certificates from an external certificate authority (e.g. Let's Encrypt, Vault, Venafi) - see the [cert-manager documentation](https://cert-manager.io/docs/) for more information.

If you'd rather bring your own certificates, the OpsChain Helm chart provides settings to configure the image registry and API server certificates.
