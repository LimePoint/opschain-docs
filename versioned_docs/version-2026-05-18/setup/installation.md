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

:::note
The OpsChain CLI is currently in experimental stage and is constantly receveiving updates and improvements.
:::

The OpsChain CLI is a powerful command-line tool for DevOps and platform engineers to manage OpsChain resources including projects, environments, assets, changes, workflows, and authorization policies. Automate operational tasks, interact with your OpsChain instance, and streamline CI/CD workflows all from your terminal.

Follow the [OpsChain CLI guide](/getting-started/familiarisation/cli/index.md) to install the OpsChain CLI.

## What to do next

- Proceed to the [post-deploy configuration of your OpsChain instance](/setup/setup-instance.md).
