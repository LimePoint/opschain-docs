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

:::tip Deleting persistent data
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

## Remove LimePoint container images

Remove the LimePoint images on your local machine to clear up disk space.

```bash
docker rmi $(docker images --filter=reference='limepoint/*' -q)
```

Alternatively, you can do a system prune to remove all unused Docker images and containers. Please keep in mind that if you are using Docker for other applications, this action will remove all Docker images and containers on your machine, not just the ones from the LimePoint organisation.

```bash
docker system prune -a
```

## Logout OpsChain from Docker

Run the following command to logout the `opschaintrial` user from Docker Hub. This step is only required if you ran the `docker login` step in the [CLI guide](/advanced/advanced-cli.md#configure-docker-hub-access).

```bash
docker logout
```

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
