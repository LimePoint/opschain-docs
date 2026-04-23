---
sidebar_position: 5
description: A guide to setting up your OpsChain instance.
---

# Post-deploy configuration

This guide takes you through setting up your OpsChain instance and configuring the administrator user.

## Creating your first OpsChain user

The OpsChain API server requires a valid username and password for users to interact with its data.

OpsChain supports two authentication modes, but only one can be active at any given moment. See the [authentication strategy setting reference](/setup/configuration/additional-settings.md#opschain_auth_strategy) for more information.

With that in mind, please ensure you follow the next step only for the currently configured `OPSCHAIN_AUTH_STRATEGY` variable in your `values.yaml`.

:::note
Please ensure there are no spaces included in the parameters you supply to `opschain server utils`.
:::

### Creating an LDAP authenticated user

To create a user that is authenticated via the configured LDAP, execute:

```bash
opschain server utils "create_user[opschain,password,email@example.com]"
```

### Creating a locally authenticated user

To create a user that is authenticated locally in OpsChain, execute:

```bash
opschain server utils "create_local_user[opschain,password,email@example.com]"
```

#### Updating a locally authenticated user email address

To update the email address for a user that is authenticated locally in OpsChain, execute:

```bash
opschain server utils "update_local_user_email_address[opschain,new-email@example.com]"
```

### Providing superuser access to a user

By default, users have permissions according to the authorisation policies assigned to them. OpsChain provides a special `superuser` policy that can be assigned for users that should not have their access restricted in any circumstance.

To provide superuser access to the newly created `opschain` user, execute:

```bash
opschain server utils "setup_superuser[opschain,true]"
```

:::caution
Due to security risks, we strongly recommend keeping the number of users with superuser access as minimal as possible.
:::

## Configuring the OpsChain CLI

Create a CLI configuration file in your home directory based on the [example](/files/config_file_examples/opschainrc.example):

```bash
vi ~/.opschainrc
```

The `apiBaseUrl` configuration in `~/.opschainrc` must be updated to reflect the external OpsChain API address. This address reflects the OpsChain listening port specified in your `values.yaml` file in the [previous guide](/setup/configuration/additional-settings.md#opschain_api_external_port). If you accepted the default setting, this will be `http://localhost:3000`.

If you used a different `username` and `password` for the user created in the previous steps, ensure you modify the `.opschainrc` file to reflect your changes.

Learn more about the `opschainrc` configuration in the [advanced CLI configuration guide](/advanced/advanced-cli.md).

:::info
If you create a `.opschainrc` file in your current directory, this will be used in precedence to the version in your home directory.
:::

### Further configuration of the OpsChain CLI

OpsChain has native CLI binaries for Windows, macOS and Linux. See the [advanced CLI configuration guide](/advanced/advanced-cli.md) section of our CLI reference guide to download and configure the `opschain` executable for other operating systems and to have access to more configuration options.

## Validating your CLI and API

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

## Setup the custom CA (macOS only)

On macOS, to ensure that the OpsChain registry certificate is trusted by Kubernetes the following setup is required:

```bash
kubectl -n opschain get secret opschain-ca-key-pair -o jsonpath="{.data.ca\.crt}" | base64 -d > opschain-ca.pem
security add-trusted-cert -k ~/Library/Keychains/login.keychain-db -p ssl opschain-ca.pem
# You will be prompted for your admin password in a macOS dialog
```

:::caution Restart Docker Desktop
You must restart Docker Desktop to complete the custom CA setup.
:::

## Accessing the OpsChain GUI

Using a web browser, you can access the OpsChain GUI by navigating to the address configured in your `values.yaml` file - if using the default installation options this would be locally accessible at [http://localhost:3000/](http://localhost:3000/). If you have configured an HTTPS address for the API, you will need to trust the certificate associated with it and connect to that address instead. The credentials used for the GUI are the same as the CLI.

Once you're able to login, you can [familiarise yourself with the OpsChain GUI](/getting-started/familiarisation/gui/overview.md).

## Accessing the OpsChain vault

If you have opted to use the [OpsChain vault](/setup/configuration/encryption-and-secrets.md#option-1-opschain-secret-vault) as the global default, you can access its UI by navigating to the address configured in your `values.yaml` file.

Refer to the [secret vault settings](/setup/configuration/additional-settings.md#secret-vault-settings) for information on the credentials needed to access the secret vault UI.

## What to do next

- (optional) [Configure the OpsChain CLI further](/advanced/advanced-cli.md) to improve your experience when interacting with OpsChain.
- Go to our [getting started guide](/getting-started/overview.md) to learn more about OpsChain and familiarise yourself with our GUI and other CLI commands.
- Or skip to our tutorial for [understanding the OpsChain structure](/getting-started/tutorials/structure.md) from which you'll be able to run changes.
