---
sidebar_position: 2
description: Mandatory encryption and secret vault settings that must be provided before installing OpsChain
---

# Encryption and secrets

This guide describes the various encryption and secret vault settings that must be defined in OpsChain's `values.yaml` file before installing OpsChain, along with their default values.

:::warning
Your `values.yaml` file might come with settings that are not mentioned in this document, these are internal OpsChain configuration and SHOULD NOT be modified unless explicitly recommended to do so.
:::

## Mandatory encryption and password settings

The settings to secure your OpsChain installation as well as sensitive credentials must be provided before installing the application. These are unique keys that should not be modified after the initial installation and not shared with anyone. All these keys should be alpha-numeric and should not contain any special characters.

:::info Generating keys and passwords
You can generate a random key of specific `<key_length>` for the following settings with:

```bash
openssl rand -hex $((<key_length>/2))
```

You can then copy the value and paste it into your setting's field value inside the `values.yaml` file. DO NOT reuse the same value for different settings and avoid creating keys longer than 512 characters.
:::

When using OpsChain in [high availability mode](/advanced/ha/index.md), these values must be the same across all instances.

### Encryption keys

The settings that secure your OpsChain installation. These settings are located in the `.env` section in your `values.yaml` file.

| Variable name | Description | Key length |
| :---  | :--- | :--- |
| OPSCHAIN_DETERMINISTIC_KEY    | The key OpsChain will use for encrypting its data | 32 characters |
| OPSCHAIN_ENCRYPTION_SEED_KEY | The key OpsChain will use for seeding the encryption of sensitive data | 32 characters |
| OPSCHAIN_KEY_DERIVATION_SALT    | The key OpsChain will use for generating its cryptography keys | 32 characters |
| OPSCHAIN_PRIMARY_KEY    | The primary key OpsChain will use for encryption | 32 characters  |
| OPSCHAIN_TOKEN_SECRET_KEY | The key OpsChain will use for generating bearer tokens for authentication | 64 characters |

Modifying any of these settings after installation will result in data loss.

### Credentials

The credentials used across OpsChain and its services. All of these settings are in the `.env` section in your `values.yaml` file.

| Variable name | Description | Key length |
| :---  | :--- | :--- |
| OPSCHAIN_DOCKER_PASSWORD    | The DockerHub password that OpsChain should use when communicating with the external DockerHub registry. Provided with your licence. | At least 8 characters long |
| OPSCHAIN_DOCKER_USER   | The DockerHub username that OpsChain should use when communicating with the external DockerHub registry. Provided with your licence. | At least 8 characters long |
| OPSCHAIN_IMAGE_REGISTRY_PASSWORD    | The password that OpsChain should use when communicating with its internal image registry. This setting should be reflected in the `trow.trow.password` field in your `values.yaml` file, otherwise OpsChain will not be able to access the internal image registry. | At least 8 characters long |
| OPSCHAIN_LDAP_PASSWORD    | The password that OpsChain will use when communicating with its internal LDAP server | At least 8 characters long |
| PGPASSWORD    | The password for accessing OpsChain's database | At least 8 characters long |

## Mandatory secret vault settings

As you'll see in future guides, OpsChain has a cascading [settings system](/key-concepts/settings.md) that allows you to override settings at a global, project, environment or asset level. This is also applicable to the secret vault settings, meaning that you can use the OpsChain secret vault as the global default and override it for specific projects, environments or assets. Alternatively, if you have an external secret vault already in place, you can use it and fully disable the OpsChain vault to simplify your setup.

### Option 1. OpsChain secret vault

To install the OpsChain vault along with OpsChain, you must define a seal key for it by configuring the `secretVault.unsealKey` setting in your `values.yaml` file. The key must be a 32 characters long, base64 encoded string and it must be the same across all OpsChain instances in a [high availability setup](/advanced/ha/index.md). You can use the following command to generate a random key:

```bash
openssl rand -base64 32
```

:::info OpsChain secret vault token
Be aware that the seal key is NOT the same as the token used to access the secret vault. An access root token will be generated and stored in the `opschain-vault-config` secret when the OpsChain application starts up for the first time. Refer to the [OpsChain vault settings](/setup/configuration/additional-settings.md#secret-vault-settings) for more information.
:::

You must also must define the hostname that its UI will be accessible at, as described in the [TLS/HTTPS configuration guide](/setup/configuration/tls/index.md).

### Option 2. Using an external secret vault as the default

If you would like to use an external secret vault as the default secret vault, you must set the `openbao.global.enabled` and the `openbao.server.enabled` settings to `false` and provide the external secret vault settings in the `values.yaml` file.

For example:

```yaml
openbao:
  global:
    enabled: false
  server:
    enabled: false
...

vaultAddress: "http://vault.example.com:8200"
vaultAuthMethod: token
vaultToken: "my_token"
vaultUsername:
vaultPassword:
vaultMountPath: "/secrets"
vaultUseMintEncryption: true
vaultClientOptions: {}

env:
  ...
  # Ensure these match what is set in the settings above
  OPSCHAIN_VAULT_ADDRESS: "http://vault.example.com:8200"
  OPSCHAIN_VAULT_AUTH_METHOD: token
  OPSCHAIN_VAULT_TOKEN: "my_token"
  OPSCHAIN_VAULT_USERNAME:
  OPSCHAIN_VAULT_PASSWORD:
  OPSCHAIN_VAULT_MOUNT_PATH: "/secrets"
  OPSCHAIN_VAULT_USE_MINT_ENCRYPTION: true
  OPSCHAIN_VAULT_CLIENT_OPTIONS: {}
  ...
```

## What to do next

- Configure [TLS/HTTPS](/setup/configuration/tls/index.md) to secure communications between OpsChain, its services and clients.
