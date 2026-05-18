---
sidebar_position: 5
description: Upgrading OpsChain to the latest release.
---

# Upgrading

This guide takes you through upgrading OpsChain to the latest release.

:::caution
Before upgrading OpsChain, make sure you check the [changelog](/changelog.md) for the relevant version - making note of any breaking changes and related pre-upgrade steps.
:::

## Prerequisites

To patch OpsChain, we must refer to the `values.yaml` file used for [installation](/setup/configuration/preparing-your-environment.md#validate-your-configuration). The patching process should be performed in the same server as the one used for installation.

### Validate Helm and K3s are installed

Before you proceed, please ensure Helm and K3s are installed and configured. You can quickly verify this by running the following commands:

```bash
helm version
k3s --version
```

If you see the version numbers, you are good to go. If you don't, please refer to the [Installing K3s](/setup/installing_k3s.md) guide for more information.

### Validate Helm registry access

With the credentials you received as part of your licence, ensure Helm is connected to DockerHub's registry.

```bash
helm registry login docker.io
```

The command will prompt you for your DockerHub credentials.

### OpsChain chart version

Identify the version of OpsChain you want to upgrade to from the [changelog](/changelog.md) page and set it to your bash profile with the Helm chart version format, for example:

```bash
vi ~/.bash_profile
```

And then add or modify the following line with the version you want to upgrade to:

```bash
export OPSCHAIN_CHART_VERSION=2025.11.12
```

Then source it for the changes to take effect:

```bash
source ~/.bash_profile
```

### Update the `values.yaml` file

Some OpsChain updates might change the settings in the `values.yaml` file. To ensure you don't lose any of your custom settings, carefully update your file, ensuring the new settings are applied and your custom settings are preserved. Refer to the [changelog](/changelog.md) for the version you're upgrading to for any new settings that need to be applied or breaking changes. If you are unsure, refer to the [configuration introduction](/setup/configuration/index.md) guide for more information.

:::note OpsChain version
Ensure all the settings that have an image tag match the OpsChain version you're patching to, otherwise your installation will be running with outdated images.
:::

## Upgrade OpsChain

With the environment variables configured and the `values.yaml` file updated, upgrade OpsChain to the latest version by running the following command:

```bash
helm upgrade --install opschain "oci://docker.io/limepoint/opschain" --version ${OPSCHAIN_CHART_VERSION} --create-namespace -n ${KUBERNETES_NAMESPACE} -f /limepoint/values.yaml --wait --timeout 30m --insecure-skip-tls-verify --debug
```

:::warning Upgrade time
The command may take several minutes (upto 30 mins) to start as the OpsChain images are downloaded, especially with slower internet connections.

Do not close or end the shell session while the upgrade is still ongoing, doing so might render your installation unusable.
:::

Just like with installation, this command will start the OpsChain server and its dependent services in separate Kubernetes pods.

The `kubectl` command can be used to see the upgrade progress:

```bash
kubectl get deployments.apps/opschain-api -n ${KUBERNETES_NAMESPACE}
```

The upgrade will be complete when the `READY` column of the `opschain-api` deployment is set to `1/1`. You can verify the current OpsChain version in the [version info](/getting-started/familiarisation/gui/version_info.md) section of the GUI.

## Update the runner image version

After a successful patch, you may want to update your runner image version to the same version as OpsChain. This can be done via [system configuration](/setup/configuration/additional-settings.md#post-install-system-configuration), modifying the `Resolved image` tag to the version you're patching to.

## Old images in the OpsChain registry

OpsChain will not automatically remove old images in the internal image registry during the patching process. This means that old runner images may still exist in the registry, using up disk space. If you need to remove these old images, refer to the [container image cleanup](/operations/maintenance/container-image-cleanup.md) guide.

## Troubleshooting

If the Helm commands take too long to complete, you can check the status of the deployments with the following command:

```bash
kubectl get deployments.apps -n ${KUBERNETES_NAMESPACE}
```

And verify that all deployments have the `READY` column set to a matching value, for example:

```bash
NAME                                  READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/opschain-api          1/1     1            1           10m
deployment.apps/opschain-api-worker   2/2     2            2           10m
...
```

To check the status of the pods, you can run the following command:

```bash
kubectl get pods -n ${KUBERNETES_NAMESPACE}
```
