---
sidebar_position: 4
description: A guide to preparing your environment to install OpsChain.
---

# Prepare the environment

## Validate your configuration

Before you proceed, please ensure you have a valid `values.yaml` file configured. Refer to the [configuration introduction](/setup/configuration/index.md) and [TLS configuration](/setup/configuration/tls/index.md) guides for more details.

## Preparing your environment

To make the installation process more straightforward, let's define some environment variables that are required by the installation script and will be used in subsequent commands.

### Matching the configured Kubernetes namespace

OpsChain will be deployed in the Kubernetes namespace given to Helm's `install` command. To ensure our installation matches the Kubernetes' namespace it is in, we need to use the same value that has been configured in the [`OPSCHAIN_KUBERNETES_NAMESPACE`](/setup/configuration/additional-settings.md#opschain_kubernetes_namespace) inside the `values.yaml` file.

Using the default namespace of `opschain`, you can set the following environment variable:

```bash
export KUBERNETES_NAMESPACE=opschain
```

### OpsChain chart version

OpsChain should always be installed with a version defined explicitly. The available OpsChain versions are listed in the [changelog](/changelog.md) page.

:::info
The Helm chart version is a semver formatted version of the release name/date, with no leading zeros.
:::

For example, if you want to install the release named `2025-01-01`, the chart version will be `2025.1.1`. You can export an environment variable for the version you want to install, like so:

```bash
export OPSCHAIN_CHART_VERSION=2025.1.1
```

:::tip Setup shell
To make life easier, you can add these two settings to your shell profile. This will allow you to use the same environment variables in subsequent sessions. For example:

```bash
vi ~/.bash_profile
export KUBERNETES_NAMESPACE=opschain
export OPSCHAIN_CHART_VERSION=2025.1.1
```

And then source it for the changes to take effect:

```bash
source ~/.bash_profile
```

:::

### Log in to DockerHub

With the credentials you received as part of your licence, connect Helm to DockerHub's registry. You'll need to run this command from the same shell where you're running the other commands in this guide:

```bash
helm registry login docker.io
```

The command will prompt you for your DockerHub credentials.

## Install the CNPG operator

OpsChain uses [CloudNative PostgreSQL (CNPG)](https://cloudnative-pg.io/) to provide production-ready database high availability and disaster recovery. CNPG is a Kubernetes-native operator that manages PostgreSQL clusters with automatic failover, multi-cluster replication, and declarative configuration. To install the operator in a Kubernetes cluster, run the following commands:

First, create the operator namespace:

```bash
kubectl create namespace cnpg-system
```

:::warning Operator scope
The CNPG operator is installed at the Kubernetes cluster level, with CRDs, controllers and service accounts deployed in the `cnpg-system` namespace.
:::

Set the `DOCKER_USERNAME` and `DOCKER_PASSWORD` environment variables to the Docker Hub credentials that were provided to you as part of your licence in your shell profile:

```bash
vi ~/.bash_profile
```

```bash
export DOCKER_USERNAME=<username>
export DOCKER_PASSWORD=<password>
```

And source it for the changes to take effect:

```bash
source ~/.bash_profile
```

Then create the secret used by the operator to pull images:

```bash
kubectl create secret docker-registry opschain-operator-secret --docker-server=docker.io --docker-username=$DOCKER_USERNAME --docker-password=$DOCKER_PASSWORD -n cnpg-system
```

Finally, apply the operator's YAML file:

```bash
kubectl apply -f \
  https://docs.opschain.io/files/downloads/cnpg-operator.yaml \
  --server-side
```

Verify the operator is running:

```bash
kubectl get pods -n cnpg-system
```

:::warning
This step is required even if you are not planning to use the high availability features.
:::

## What to do next

- Proceed to [installing OpsChain](/setup/installation.md).
