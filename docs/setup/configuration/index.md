---
sidebar_position: 1
description: Introduction to how OpsChain is configured
---

# Introduction

OpsChain is deployed using [Helm](https://helm.sh/), a package manager for Kubernetes. Helm is used to deploy the OpsChain application and its dependencies to your Kubernetes cluster, under a configurable namespace.

## Configuration

The OpsChain installation is customized by modifying a `values.yaml` file, which is then used by Helm to deploy the OpsChain application and its dependencies to your Kubernetes cluster. This file contains all the configuration options for OpsChain and its services, including encryption keys, passwords, TLS and hostname settings, database configuration, LDAP settings and more.

:::info Setting management
When making changes to your `values.yaml` file, the changes will only take effect when you deploy OpsChain. Some deployment settings can only be configured at installation time, meaning that changing them after installation will have no effect, these settings are marked as such throughout the documentation.

Settings that change the application's behaviour can be modified at any time via dedicated pages in the OpsChain GUI and endpoints in the OpsChain API.
:::

The settings defined in this file overwrite the default values defined in the OpsChain Helm chart.

:::tip Patching
By running the installation command with a modified `values.yaml` file, you'll be patching OpsChain to use these new settings. Refer to the [patching guide](/operations/upgrading.md) for more information.
:::

As OpsChain receives new releases, the Helm chart might be updated to include new settings or modify the existing ones. Refer to the [changelog](/changelog.md) page to see all such modifications made to the Helm chart and the OpsChain application.

### Obtaining a full `values.yaml` from the chart

:::warning Advanced usage
This method is recommended for advanced users who are familiar with the OpsChain Helm chart and its configuration options. If you are unsure about any configuration, we recommend removing them from the file and falling back to the default values.
:::

Once you have [logged in to Helm](/setup/configuration/preparing-your-environment.md#log-in-to-dockerhub), you can obtain a full `values.yaml` file for a version of the OpsChain Helm chart by running the following command:

```bash
helm show values oci://docker.io/limepoint/opschain --version ${OPSCHAIN_CHART_VERSION} > values.yaml
```

## What to do next

- Configure the [encryption and secrets](/setup/configuration/encryption-and-secrets.md) settings to secure your OpsChain installation.
