---
sidebar_position: 1
description: Steps to permanently remove OpsChain from your machine.
---

# Uninstall

If at some point you decide that OpsChain is not for you and you no longer wish to continue using the services it provides, follow these steps to permanently remove OpsChain from your machine.

:::danger
Before uninstalling OpsChain we suggest [making a backup](/operations/maintenance/backups.md) in case you would like to restore any OpsChain data in the future.
:::

## Remove the OpsChain containers and data

Terminate and remove the running OpsChain containers (and associated data) by executing the following command:

```bash
helm uninstall opschain -n ${KUBERNETES_NAMESPACE}
```

This command might take a few minutes to complete as all the OpsChain containers will be terminated and their associated data will be removed.

OpsChain will be uninstalled, but some persistent data will remain in your Kubernetes cluster in case you would like to reinstall OpsChain in the future. This is described in more detail in the [persistent data](/operations/uninstall/persistent-data.md) guide.

:::tip[Deleting persistent data]
To fully clear the OpsChain installation from your Kubernetes cluster, you can also delete the OpsChain namespace. This will delete all persistent data:

```bash
kubectl delete namespace ${KUBERNETES_NAMESPACE}
```

:::

## Remove the CNPG namespace

If you are not using the CNPG operator for any other purposes, delete the CNPG namespace:

```bash
kubectl delete namespace cnpg-system
```

## Remove the cached container images

Uninstalling the chart stops the containers, but the images it pulled stay in each K3s node's containerd image store. Remove the LimePoint images to reclaim that disk, using the [`crictl` alias](/setup/installing_k3s.md#setup-shell) from the K3s installation guide:

```bash
crictl images | grep limepoint/ | awk '{print $3}' | xargs crictl rmi
```

If nothing else runs on the cluster, remove every image that no container references instead:

```bash
crictl rmi --prune
```

Run this on every K3s node — each one keeps its own image cache.

## Logout from the Helm registry

You can logout of the Helm registry by running the following command:

```bash
helm registry logout docker.io
```

## Uninstall the native CLI

Delete the binary file if you opted to use the native CLI in the [download the native CLI (optional)](/setup/installation.md#install-the-opschain-cli) section in the installation guide.

## Delete the OpsChain configuration files

Remove the configuration files that you created when [configuring OpsChain](/setup/configuration/preparing-your-environment.md#validate-your-configuration). For example:

```bash
rm -f /limepoint/values.yaml
```

## Uninstall prerequisites (optional)

If no longer required, you may opt to uninstall the prerequisites detailed in the [required software](/setup/prerequisites.md) section in the installation guide.
