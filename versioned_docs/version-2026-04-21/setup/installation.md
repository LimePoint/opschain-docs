---
sidebar_position: 4
description: A guide to installing OpsChain.
---

# Installation guide

## Install OpsChain

With Helm connected to DockerHub's registry and using your configured `values.yaml` and environment variables, you can install the specific OpsChain version in the desired namespace by running the following command from the same shell where you're running the other commands in previous guides:

```bash
helm upgrade --install opschain "oci://docker.io/limepoint/opschain" --version ${OPSCHAIN_CHART_VERSION} --create-namespace -n ${KUBERNETES_NAMESPACE} -f values.yaml --wait --timeout 30m --insecure-skip-tls-verify --debug
```

This will start the OpsChain server and its dependent services in separate Kubernetes pods. For more information on these containers see the [architecture overview](/getting-started/overview.md#architecture-overview).

:::warning Installation time
The command may take several minutes (up to 30 mins) to start as the OpsChain images are downloaded, especially with slower internet connections.

Do not close or end the shell session while the installation is still ongoing, doing so might render your installation unusable.
:::

The `kubectl` command can be used to see the installation progress:

```bash
kubectl get all -n ${KUBERNETES_NAMESPACE}
```

While the installation is running, you can move to the next step where we'll set up the OpsChain CLI for interacting with the API and create your first OpsChain user.

:::warning
Only proceed to the next steps if your OpsChain instance has been fully deployed and the API is ready. You can verify this by checking the readiness status of the `opschain-api` deployment:

```bash
kubectl get deployments.apps/opschain-api
```

The API is deployed and ready if the output of that command is:

```bash
NAME           READY   UP-TO-DATE   AVAILABLE   AGE
opschain-api   1/1     1            1           10m
```

:::

## Install the OpsChain CLI

:::info kubectl context
For the next steps, we recommend switching your `kubectl` default context to the configured OpsChain namespace. You can achieve that by running:

```bash
kubectl config set-context --current --namespace=${KUBERNETES_NAMESPACE}
```

:::

The OpsChain CLI binary can be downloaded from the `opschain` repository on [GitHub](https://github.com/LimePoint/opschain/releases).

Ensure you only download the build that matches your system's distribution. This tutorial will proceed with installing the OpsChain CLI for a Linux distribution.

After downloading the zip file, we can unzip it and make it executable like so:

```bash
$ unzip opschain-linux.zip
Archive:  opschain-linux.zip
  inflating: opschain

$ chmod +x opschain
```

To validate the CLI is working, run the following:

```bash
./opschain help
```

This should print OpsChain's CLI help guide. If that is not the case, please contact LimePoint support.

:::tip Accessing the OpsChain CLI
We suggest moving the binary to a location in your `PATH` to ensure it is easily accessible. By doing so, we can run the next commands from anywhere by just calling `opschain`.
:::

## What to do next

- Proceed to the [post-deploy configuration of your OpsChain instance](/setup/setup-instance.md).
