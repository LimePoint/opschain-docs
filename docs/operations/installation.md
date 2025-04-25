---
sidebar_position: 1
description: A guide to installing the OpsChain API server.
---

# Installation guide

This guide takes you through installing and configuring OpsChain.

After following this guide you should know how to:

- install OpsChain pre-requisites
- install, configure and start OpsChain
- create an OpsChain user
- download the OpsChain CLI

## Prerequisites

### Kubernetes

OpsChain requires Kubernetes and will operate on any Kubernetes cluster providing certain minimum requirements are met.

For a single-node evaluation or test environment, we recommend using [Docker Desktop](https://www.docker.com/products/docker-desktop) (Windows or macOS) or [K3s](https://k3s.io) (Linux).

For a multi-node production environment, your cluster _must_ be able to provide the following:

- a default [storage class](https://kubernetes.io/docs/concepts/storage/storage-classes/) which supports the [`ReadWriteOnce` access mode](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#access-modes)
- a [storage class](https://kubernetes.io/docs/concepts/storage/storage-classes/) which supports the [`ReadWriteMany` access mode](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#access-modes)
- a [LoadBalancer](https://kubernetes.io/docs/concepts/services-networking/service/#loadbalancer) service type
- a [TLS certificate](https://kubernetes.io/docs/concepts/configuration/secret/#tls-secrets) for the OpsChain internal container registry that is trusted by the container runtime on your Kubernetes nodes

### Helm

You must have [Helm](https://helm.sh/docs/intro/install/) version 3 installed.

### Hardware/VM requirements

OpsChain requires a minimum of 2GB of ram to function. We recommend 4GB if you intend to run our more advanced examples.

OpsChain requires a minimum of 30GB of disk to function. We recommend 100GB if you intend to run our examples without having to perform [manual cleanup activities](/docs/operations/maintenance/container-image-cleanup.md) very frequently.

If using Docker for Mac the [configuration UI](https://docs.docker.com/desktop/mac/#advanced) allows you to adjust the ram and disk allocation for Docker. After changing the configuration you will need to restart the Docker service.

If using Docker for Windows the [WSL configuration](https://docs.microsoft.com/en-us/windows/wsl/wsl-config#global-configuration-options-with-wslconfig) (or the per [distribution configuration](https://docs.microsoft.com/en-us/windows/wsl/wsl-config#per-distribution-configuration-options-with-wslconf)) allows you to modify the ram allocation. There is no need to adjust the disk allocation. If WSL is already running it will need to be restarted.

:::tip
When using macOS or Windows we suggest ensuring that your Docker installation is not allocated too much of your system ram - or the rest of your system may struggle. As a rough guide, we suggest not allocating more than 50% of your system ram.
:::

### Image registry hostname (Linux only)

The OpsChain image registry requires a hostname different to the OpsChain API hostname (that will resolve to the Kubernetes host) to allow it to route the registry traffic.

By default, OpsChain will attempt to use `opschain-image-registry.local.gd` which resolves to `127.0.0.1`. If your Kubernetes host does not resolve this address (e.g. if `host opschain-image-registry.local.gd` fails), add `127.0.0.1 opschain-image-registry.local.gd` to your hosts file.

[`hostctl`](https://guumaster.github.io/) can be used to achieve this with the `hostctl add domains opschain opschain-image-registry.local.gd` command.

:::note
A hostname other than `opschain-image-registry.local.gd` can be used if desired - the value would need to be manually updated in the `.env` file and `values.yaml` file after the `opschain server configure` script below has been run. Alternatively the value could be added to a [`values.override.yaml` configuration override file](/docs/reference/cli.md#configuration-overrides) - [see an example](/files/config_file_examples/values.override.yaml.example).
:::

## Installation

### Install the OpsChain licence

Copy the `opschain.lic` licence file into the current folder or set the `OPSCHAIN_LICENCE` environment variable to the path where you stored `opschain.lic`.

### Create a GitHub personal access token

To access the private OpsChain repositories you will need to create a [GitHub personal access token](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token).

This token will also be used for access to the example OpsChain Git repositories that been created to provide sample code for the getting started guide, and examples of how you might implement different types of changes.

### Install `cert-manager`

OpsChain depends on [`cert-manager`](https://cert-manager.io/) to manage its internal SSL/TLS certificates.

```bash
helm repo add jetstack https://charts.jetstack.io
helm repo update
helm upgrade --install cert-manager jetstack/cert-manager --namespace cert-manager --create-namespace --version v1.16.1 --set "crds.enabled=true" --set "featureGates=AdditionalCertificateOutputFormats=true" --set "webhook.extraArgs={--feature-gates=AdditionalCertificateOutputFormats=true}"
```

Along with internal certificates used by OpsChain, `cert-manager` will issue self-signed certificates for the OpsChain image registry and API server. To use these certificates, the `cert-manager` CA certificate must be trusted by the container runtime on your Kubernetes nodes, and by any systems from which you will access the OpsChain API.

Alternatively, `cert-manager` can be configured to issue certificates from an external certificate authority (e.g. Let's Encrypt, Vault, Venafi) - see the [cert-manager documentation](https://cert-manager.io/docs/) for more information.

:::note
Please [contact OpsChain support](/docs/support.md#how-to-contact-us) if you would like the option to use OpsChain without installing `cert-manager`.
:::

### Install the OpsChain CLI

OpsChain has native CLI binaries for Windows, macOS and Linux. See the [installation](/docs/reference/cli.md#installation) section of our CLI reference guide to download and configure the `opschain` executable.

The OpsChain CLI is used to configure the OpsChain server installation.

### Configure OpsChain

OpsChain needs to be configured before first run (and when upgrading) by executing the `opschain server configure` command. This command will generate (or update) a number of configuration files in the current directory. For this reason we recommend creating a specific OpsChain configuration folder that should be used whenever you execute any `opschain server` subcommands.

```bash
mkdir ~/opschain-configuration # use another directory as desired
cd ~/opschain-configuration
opschain server configure
```

You will be asked to confirm whether you would like to use certain features and provide your credentials for the OpsChain installation. The values that will be configured via the `opschain server configure` command are suitable for an evaluation or test environment, however for a production environment we recommend reviewing the [configuration guide](/docs/operations/configuring-opschain.md) to ensure the configuration is suitable for your needs.

:::caution
All future `opschain server` commands must be run in the `~/opschain-configuration` (or equivalent) directory to ensure that the right configuration is used.
:::

### Deploy the OpsChain containers

```bash
opschain server deploy
```

This will start the OpsChain server and its dependent services in separate Kubernetes pods. For more information on these containers see the [architecture overview](/docs/reference/architecture.md).

The command may take several minutes to start, especially with slower internet connections as the OpsChain images are downloaded.

The `kubectl` command can be used to see the deployment progress:

```bash
kubectl get all -n opschain
```

Once the `opschain server deploy` script has returned you can continue with the rest of the setup process.

### Creating an OpsChain user

The OpsChain API server requires a valid username and password for users.

:::note No spaces
Please ensure there are no spaces included in the parameters you supply to `opschain server utils`.
:::

#### LDAP authenticated users

To create a user that is authenticated via LDAP, execute:

```bash
opschain server utils "create_user[opschain,password]"
```

#### Locally authenticated users

To create a user that is authenticated locally in OpsChain, execute:

```bash
opschain server utils "create_local_user[opschain,password]"
```

:::note Authentication strategy
The active authentication strategy is set via the `OPSCHAIN_AUTH_STRATEGY` environment variable, available in the `.env` file.
:::

#### Resetting a local user's password

To reset the password for a locally authenticated user in OpsChain, execute:

```bash
opschain server utils "reset_local_user_password[opschain,new_password]"
```

### Setting up superuser access

By default, users have permissions according to the authorisation policies assigned to them. OpsChain provides a special `superuser` policy that can be assigned for users that should not have their access restricted in any circumstance. To setup the `opschain` user as a superuser, execute:

```bash
opschain server utils "setup_superuser[opschain,true]"
```

:::caution
Due to security risks, it is not recommended to provide superuser access for a large number of users.
:::

### Configure the OpsChain CLI's API access

Create a CLI configuration file in your home directory based on the [example](/files/config_file_examples/opschainrc.example):

```bash
vi ~/.opschainrc
```

If you changed the username or password in the `create_user` command above, ensure you modify the `.opschainrc` file to reflect your changes.

In addition, the `apiBaseUrl` configuration in `~/.opschainrc` must be updated to reflect the external OpsChain API address. This address reflects the OpsChain listening port specified as part of the `opschain server configure` script. If you accepted the default setting, this will be `http://localhost:3000`.

Learn more about the `opschainrc` configuration in the [CLI configuration guide](/docs/reference/cli.md#opschain-cli-configuration).

:::info
If you create a `.opschainrc` file in your current directory, this will be used in precedence to the version in your home directory.
:::

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

### OpsChain development environment setup (optional)

If you intend to use the OpsChain development environment (used when creating new action definitions) you will need to setup the [CLI dev subcommand dependencies](/docs/reference/cli.md#dev-subcommand-dependencies).

## What to do next

- (optional) OpsChain is supplied with an LDAP server for authentication. If you'd prefer to use your own LDAP server, follow the [OpsChain LDAP](/docs/operations/opschain-ldap.md) guide to alter the OpsChain authentication configuration.
- Return to the [getting started guide](/docs/getting-started/README.md) to learn more about OpsChain.
