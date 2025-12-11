---
sidebar_position: 5
description: A guide to installing OpsChain.
---

# Installation guide

This guide takes you through installing OpsChain and configuring the administrator user.

## Supported Platforms

OpsChain needs a container platform to run. It can be deployed on any of the following container platforms:

- Azure Kubernetes Services (AKS)
- Elastic Kubernetes Services (EKS)
- OpenShift Container Platform
- Self hosted Kubernetes (k8s or k3s) either on bare metal or a VM

The rest of this guide will assume that you are installing OpsChain on a self hosted K3s cluster. Please follow steps outlined in  [Installing K3s](/setup/installing_k3s.md) before you continue.

## Access to software media and license

You must have acquired a license from LimePoint before you begin to install. If you don't have one, please reach out to your account manager or drop a note on support@limepoint.com
As part of license acquisition you would also get credentials to download the installers.

You must have access to the following URLs from your network either directly or via a proxy.

- [https://hub.docker.com/](https://hub.docker.com/)

### Preparing configuration

Before you proceed, please ensure you have a valid `values.yaml` file configured. Refer to the [Understanding OpsChain configuration variables guide](/setup/understanding-opschain-variables.md) for more details.

## Installation

### Preparing your environment

To make the installation process more straightforward, let's define some environment variables that are required by the installation script and will be used in subsequent commands.

#### Matching the configured Kubernetes namespace

OpsChain will be deployed in the Kubernetes namespace we pass to Helm's command. To ensure our installation matches the Kubernetes' namespace it is in, we need to use the same value that has been configured in the [`OPSCHAIN_KUBERNETES_NAMESPACE`](/setup/understanding-opschain-variables.md#opschain_kubernetes_namespace) inside the `values.yaml` file.

Using the default namespace of `opschain`, we would set the following environment variable:

```bash
export KUBERNETES_NAMESPACE=opschain
```

#### OpsChain chart version

OpsChain should always be installed with a version defined explicitly. The available OpsChain versions are listed in the [changelog](/changelog.md) page. The Helm chart version is a semver formatted version of the release name/date, with no leading zeros. For example, if you want to install the release named 2025-01-01, the chart version will be 2025.1.1. You can export an environment variable for the version you want to install, like so:

```bash
export OPSCHAIN_CHART_VERSION=2025.1.1
```

#### Log in to DockerHub

With the credentials you received as part of your licence, connect Helm to DockerHub's registry. You'll need to run this command from the same shell where you're running the other commands in this guide:

```bash
helm registry login docker.io
```

The command will prompt you for your DockerHub credentials.

#### Setup shell

To make life easier, add these variables to your shell profile:

```bash
vi ~/.bash_profile
export KUBERNETES_NAMESPACE=opschain
export OPSCHAIN_CHART_VERSION=2025.1.1
```

And then source it for the changes to take effect:

```bash
source ~/.bash_profile
```

### Install OpsChain

With Helm connected to LimePoint's registry and using your configured `values.yaml` and environment variables, we can install the specific OpsChain version in the desired namespace by running the following command:

```bash
helm upgrade --install opschain "oci://docker.io/limepoint/opschain" --version ${OPSCHAIN_CHART_VERSION} --create-namespace -n {KUBERNETES_NAMESPACE} -f values.yaml --wait --timeout 30m --insecure-skip-tls-verify
```

This will start the OpsChain server and its dependent services in separate Kubernetes pods. For more information on these containers see the [architecture overview](/getting-started/overview.md#architecture-overview).

:::warning Installation time
The command may take several minutes (upto 30 mins) to start as the OpsChain images are downloaded, especially with slower internet connections.

Do not close or end the shell session while the installation is still ongoing, doing so might render your installation unusable.
:::

The `kubectl` command can be used to see the installation progress:

```bash
kubectl get all -n ${KUBERNETES_NAMESPACE}
```

While the installation is running, you can move to the next step where we'll set up the OpsChain CLI for interacting with the API and create your first OpsChain user.

#### Configure the hosts file

To allow OpsChain to access its internal image registry, we need to add the following entry to our hosts file:

```text
127.0.0.1 opschain-image-registry.local.gd
```

That can be achieved by running the following command:

```bash
echo "127.0.0.1 opschain-image-registry.local.gd" >> /etc/hosts
```

This may vary if you have used a different [domain name for the internal image registry](/setup/understanding-opschain-variables.md#opschain_image_registry_host) in your `values.yaml` file.

### Install the OpsChain CLI

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

## Setting up your OpsChain instance

Once the OpsChain instance is deployed, you can proceed with setting it up.

### Creating your first OpsChain user

The OpsChain API server requires a valid username and password for users to interact with its data.

OpsChain supports two authentication modes, but only one can be active at any given moment. See the [authentication strategy setting reference](/setup/understanding-opschain-variables.md#opschain_auth_strategy) for more information.

With that in mind, please ensure you follow the next step only for the currently configured `OPSCHAIN_AUTH_STRATEGY` variable in your `values.yaml`.

:::note
Please ensure there are no spaces included in the parameters you supply to `opschain server utils`.
:::

#### Creating an LDAP authenticated user

To create a user that is authenticated via the configured LDAP, execute:

```bash
opschain server utils "create_user[opschain,password]"
```

#### Creating a locally authenticated user

To create a user that is authenticated locally in OpsChain, execute:

```bash
opschain server utils "create_local_user[opschain,password]"
```

#### Providing superuser access to a user

By default, users have permissions according to the authorisation policies assigned to them. OpsChain provides a special `superuser` policy that can be assigned for users that should not have their access restricted in any circumstance.

To provide superuser access to the newly created `opschain` user, execute:

```bash
opschain server utils "setup_superuser[opschain,true]"
```

:::caution
Due to security risks, we strongly recommend keeping the number of users with superuser access as minimal as possible.
:::

### Configuring the OpsChain CLI

Create a CLI configuration file in your home directory based on the [example](/files/config_file_examples/opschainrc.example):

```bash
vi ~/.opschainrc
```

The `apiBaseUrl` configuration in `~/.opschainrc` must be updated to reflect the external OpsChain API address. This address reflects the OpsChain listening port specified in your `values.yaml` file in the [previous guide](/setup/understanding-opschain-variables.md#opschain_api_external_port). If you accepted the default setting, this will be `http://localhost:3000`.

If you used a different `username` and `password` for the user created in the previous steps, ensure you modify the `.opschainrc` file to reflect your changes.

Learn more about the `opschainrc` configuration in the [advanced CLI configuration guide](/advanced/cli/advanced-cli.md).

:::info
If you create a `.opschainrc` file in your current directory, this will be used in precedence to the version in your home directory.
:::

### Validating your CLI and API

To validate your CLI has access to the API, you can run the following:

```bash
opschain info
```

If everything is working, the output will look similar to:

```bash
┌────────────────┬───────────────────────────────────────────┐
│ CLI version    │ 0.0.1                                     │
├────────────────┼───────────────────────────────────────────┤
│ Server version │ edge (f04a3bf)                            │
├────────────────┼───────────────────────────────────────────┤
│ Runner image   │ limepoint/opschain-runner-enterprise:edge │
└────────────────┴───────────────────────────────────────────┘
```

### Further configuration of the OpsChain CLI

OpsChain has native CLI binaries for Windows, macOS and Linux. See the [advanced CLI configuration guide](/advanced/cli/advanced-cli.md) section of our CLI reference guide to download and configure the `opschain` executable for other operating systems and to have access to more configuration options.

### Setup the custom CA (macOS only)

On macOS, to ensure that the OpsChain registry certificate is trusted by Kubernetes the following setup is required:

```bash
kubectl -n opschain get secret opschain-ca-key-pair -o jsonpath="{.data.ca\.crt}" | base64 -d > opschain-ca.pem
security add-trusted-cert -k ~/Library/Keychains/login.keychain-db -p ssl opschain-ca.pem
# You will be prompted for your admin password in a macOS dialog
```

:::caution Restart Docker Desktop
You must restart Docker Desktop to complete the custom CA setup.
:::

### Accessing the OpsChain GUI

Using a web browser, you can access the OpsChain GUI by navigating to the address configured in your `values.yaml` file - if using the default installation options this would be locally accessible at [http://localhost:3000/](http://localhost:3000/). If you have configured an HTTPS address for the API, you will need to trust the certificate associated with it and connect to that address instead. The credentials used for the GUI are the same as the CLI.

Once you're able to login, you can [familiarise yourself with the OpsChain GUI](/getting-started/familiarisation/gui/overview.md).

### Accessing the OpsChain default secret vault

If you have opted to use the default secret vault provided by OpsChain, you can access its UI by navigating to the address configured in your `values.yaml` file. If you haven't provided a custom certificate for it, you'll need to [trust the self-signed certificate](/setup/understanding-opschain-variables.md#self-signed-certificate) generated for it.

Refer to the [secret vault settings](/setup/understanding-opschain-variables.md#secret-vault-settings) for information on the credentials needed to access the secret vault UI.

## What to do next

- (optional) [Configure the OpsChain CLI further](/advanced/cli/advanced-cli.md) to improve your experience when interacting with OpsChain.
- Go to our [getting started guide](/getting-started/overview.md) to learn more about OpsChain and familiarise yourself with our GUI and other CLI commands.
- Or skip to our tutorial for [understanding the OpsChain structure](/getting-started/tutorials/structure.md) from which you'll be able to run changes.
