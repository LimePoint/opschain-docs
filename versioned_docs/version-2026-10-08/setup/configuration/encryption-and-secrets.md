---
sidebar_position: 2
description: Mandatory encryption and secret vault settings that must be provided before installing OpsChain
---

# Encryption and secrets

This guide describes the various encryption and secret vault settings that must be defined in OpsChain's `values.yaml` file before installing OpsChain, along with their default values.

:::warning
Your `values.yaml` file might come with settings that are not mentioned in this document, these are internal OpsChain configuration and SHOULD NOT be modified unless explicitly recommended to do so.
:::

## Mandatory deployment settings

The following setting must also be defined in the `env` section of your `values.yaml` file before installing OpsChain, otherwise Helm's chart schema validation will fail.

| Variable name | Description | Key length |
| :---  | :--- | :--- |
| OPSCHAIN_VERSION | The OpsChain container image tag to deploy. Refer to the [OpsChain chart version](/setup/configuration/preparing-your-environment.md#opschain-chart-version) section for the required format. | N/A |

## Mandatory encryption and password settings

The settings to secure your OpsChain installation as well as sensitive credentials must be provided before installing the application. These are unique keys that should not be modified after the initial installation and not shared with anyone. All these keys should be alpha-numeric and should not contain any special characters.

:::info[Generating keys and passwords]
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
| OPSCHAIN_ENCRYPTION_SEED_KEY | The key OpsChain will use for seeding the encryption of sensitive data, and for deriving the [MintPress transportable key](#mintpress-transportable-key) | 32 characters |
| OPSCHAIN_KEY_DERIVATION_SALT    | The key OpsChain will use for generating its cryptography keys | 32 characters |
| OPSCHAIN_PRIMARY_KEY    | The primary key OpsChain will use for encryption | 32 characters  |
| OPSCHAIN_TOKEN_SECRET_KEY | The key OpsChain will use for generating bearer tokens for authentication, and from which it derives the key that signs artefact links. Changing it invalidates existing bearer tokens and artefact links | 64 characters |

:::danger
Modifying any of these settings after installation will result in data loss.
:::

### MintPress transportable key

OpsChain encrypts properties, settings, secrets and sensitive input arguments with the MintPress transportable key. The key is stored in the `mintpress-transportable-key` Kubernetes secret, and is created when you first install OpsChain:

- if `mintPressTransportableKey` is set in your `values.yaml` file, OpsChain uses that key
- otherwise, OpsChain derives the key from `OPSCHAIN_ENCRYPTION_SEED_KEY`

To use an existing MintPress key, set `mintPressTransportableKey` (outside the `.env` section) to the base64 encoded contents of your MintPress `localKey` file:

```bash
base64 -w0 ~/.limepoint/localKey
```

If the value of `mintPressTransportableKey` is not a key MintPress can use, OpsChain derives the key from `OPSCHAIN_ENCRYPTION_SEED_KEY` instead, and the `opschain-transportable-key` job log records that the supplied key was replaced.

Once the key has been created, it does not change:

- a later change to `mintPressTransportableKey` is ignored, and the job log records a warning
- a later change to `OPSCHAIN_ENCRYPTION_SEED_KEY` fails the `helm upgrade`, with the error `OPSCHAIN_ENCRYPTION_SEED_KEY has changed since the transportable key was derived from it`. Restore the original value and run the upgrade again.

In [high availability mode](/advanced/ha/index.md), every instance derives the same key from the same `OPSCHAIN_ENCRYPTION_SEED_KEY`.

Values that an earlier OpsChain version encrypted with the MintPress built-in key remain readable, and are not re-encrypted.

If you run MintPress outside OpsChain, for example on your target hosts, and it needs to decrypt values that OpsChain encrypted, copy the key to its `localKey` file:

```bash
kubectl -n ${KUBERNETES_NAMESPACE} get secret mintpress-transportable-key -o jsonpath='{.data.localKey}' | base64 -d > ~/.limepoint/localKey
```

:::danger
Do not delete the `mintpress-transportable-key` secret, and do not roll back to an OpsChain version whose chart creates the secret itself. Either one replaces the key, and the values encrypted with it can no longer be decrypted.
:::

### Credentials

The credentials used across OpsChain and its services. All of these settings are in the `.env` section in your `values.yaml` file.

| Variable name | Description | Key length |
| :---  | :--- | :--- |
| OPSCHAIN_DOCKER_PASSWORD    | The DockerHub password that OpsChain should use when communicating with the external DockerHub registry. Provided with your licence. | At least 8 characters long |
| OPSCHAIN_DOCKER_USER   | The DockerHub username that OpsChain should use when communicating with the external DockerHub registry. Provided with your licence. | At least 8 characters long |
| `trow.trow.password`   | The password that OpsChain should use when communicating with its internal image registry. This setting is set in the `trow.trow.password` field in your `values.yaml` file - outside the `.env` section. | At least 8 characters long |
| OPSCHAIN_LDAP_PASSWORD    | The password that OpsChain will use when communicating with its internal LDAP server | At least 8 characters long |
| PGPASSWORD    | The password for accessing OpsChain's database | At least 8 characters long |

:::danger
Modifying the `PGPASSWORD` setting after installation will result in data loss if you do not have access to the previous password.
:::

## Mandatory secret vault settings

As you'll see in future guides, OpsChain has a cascading [settings system](/key-concepts/settings.md) that allows you to override settings at a global, project, environment or asset level. This is also applicable to the secret vault settings, meaning that you can use the OpsChain secret vault as the global default and override it for specific projects, environments or assets. Alternatively, if you have an external secret vault already in place, you can use it and fully disable the OpsChain vault to simplify your setup.

### Option 1. OpsChain secret vault

To install the OpsChain vault along with OpsChain, you must define a seal key for it by configuring the `secretVault.unsealKey` setting in your `values.yaml` file. The key must be 32 random bytes, base64 encoded, which makes a 44 character string. Any other value fails the install. The key must be the same across all OpsChain instances in a [high availability setup](/advanced/ha/index.md). You can use the following command to generate a random key:

```bash
openssl rand -base64 32
```

:::info[OpsChain secret vault token]
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
