---
sidebar_position: 3
description: Understanding OpsChain configuration variables
---

# Understanding OpsChain configuration variables

This guide describes the various configuration options that can be modified in OpsChain's `values.yaml` file before installing OpsChain along with their default values. The majority of these settings can be modified post-installation via the OpsChain GUI or API, however, some settings can only be modified before installation and will only have an effect after redeploying OpsChain.

:::warning
Your `values.yaml` file might come with settings that are not mentioned in this document, these are internal OpsChain configuration and SHOULD NOT be modified unless explicitly recommended to do so.
:::

## Mandatory encryption and password settings

The settings to secure your OpsChain installation must be provided before installing the application. These are unique keys that should not be modified after the initial installation and not shared with anyone.

:::info Generating keys and passwords
You can generate a random key of specific `<key_length>` for the following settings with:

```bash
openssl rand -hex $((<key_length>/2))
```

You can then copy the value and paste it into your setting's field value inside the `values.yaml` file. DO NOT reuse the same value for different settings and avoid creating keys longer than 512 characters.
:::

| Variable name | Description | Key length |
| :---  | :--- | :--- |
| OPSCHAIN_DETERMINISTIC_KEY    | The key OpsChain will use for encrypting its data | 32 characters |
| OPSCHAIN_DOCKER_PASSWORD    | The DockerHub password that OpsChain should use when communicating with the external DockerHub registry. Provided with your licence. | At least 8 characters long |
| OPSCHAIN_DOCKER_USER   | The DockerHub username that OpsChain should use when communicating with the external DockerHub registry. Provided with your licence. | At least 8 characters long |
| OPSCHAIN_IMAGE_REGISTRY_PASSWORD    | The password that OpsChain should use when communicating with its internal image registry. This setting should be reflected in the `trow.trow.password` field in your `values.yaml` file, otherwise OpsChain will not be able to access the internal image registry. | At least 8 characters long |
| OPSCHAIN_KEY_DERIVATION_SALT    | The key OpsChain will use for generating its cryptography keys | 32 characters |
| OPSCHAIN_LDAP_PASSWORD    | The password that OpsChain will use when communicating with its LDAP server | At least 8 characters long |
| OPSCHAIN_PRIMARY_KEY    | The primary key OpsChain will use for encryption | 32 characters  |
| PGPASSWORD    | The password for accessing OpsChain's database | At least 8 characters long |

## Configuring OpsChain without cert-manager

```bash
vi /limepoint/values.yaml.example
```

If you elected not to use [cert-manager](/setup/installing_k3s.md#option-1-deploy-cert-manager) then you will need to update all the [TLS certificate configuration](#configuring-opschain-without-cert-manager).

After filling in all the mandatory settings, you can rename the file to `values.yaml` and proceed with the installation in the [installation guide](/setup/installation.md).

```bash
cp /limepoint/values.yaml.example /limepoint/values.yaml
```

## Configuring OpsChain without cert-manager

:::warning
You can skip this section if you're deploying OpsChain with cert-manager.
:::

If you want to deploy OpsChain without using cert-manager, you have two options to do so.

### Option 1: Using the LimePoint provided certificates

The [LimePoint provided certificates](/setup/installing_k3s.md#option-2a-using-provided-self-signed-certificates) configure the following addresses/secrets that you need to match in your `values.yaml` file:

| Address / secret name | Related `values.yaml` setting |
| :---  | :--- |
| opschain.local.gd | `api.hostName` |
| opschain-image-registry.local.gd | `trow.trow.domain` |
| opschain-image-registry.local.gd | `trow.ingress.tls[0].hosts[0]` |
| opschain-image-registry-cert | `trow.ingress.tls[0].secretName` |
| opschain-image-registry.local.gd | `trow.ingress.hosts[0].host` |
| opschain-vault.local.gd | `global.secretVaultExternalHostName` |
| opschain-image-registry.local.gd | `OPSCHAIN_IMAGE_REGISTRY_HOST` |

A subset example of how you should configure your `values.yaml` file using these certificates is:

```yaml
useCertManager: false

api:
  hostName: "opschain.local.gd"

trow:
  trow:
    domain: "opschain-image-registry.local.gd"
  ingress:
    hosts:
      - paths: [ "/" ]
        host: "opschain-image-registry.local.gd"
    tls:
      - secretName: opschain-image-registry-cert
        hosts:
          - "opschain-image-registry.local.gd"

global:
  secretVaultExternalHostName: "opschain-vault.local.gd"

env:
  OPSCHAIN_IMAGE_REGISTRY_HOST: "opschain-image-registry.local.gd"
```

:::warning
This sample `values.yaml` is not complete and is not usable as shown.
:::

### Option 2: Using your own certificates

If you want to use your own certificates to install OpsChain, then you must create [Kubernetes TLS](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_create/kubectl_create_secret_tls/) secrets for the follow configurations:

- `api.certificateSecretName`: This certificate is used for the API ingress. The certificate you provide must include a DNS `subjectAlternativeName` that matches the `api.hostName` value.
- `buildService.certificateSecretName`: This certificate is for [mTLS](https://en.wikipedia.org/wiki/Mutual_authentication#mTLS) authentication internally.
- `imageRegistry.certificateSecretName` and `trow.ingress.tls[0].secretName`: This certificate is for the image registry ingress and must be trusted by the Kubernetes cluster and the build service.
- `secretVault.internalCertificateSecretName` and `openbao.server.volumes[0].secret.secretName`: Used if using the internal secret vault.
- `secretVault.externalCertificateSecretName`: If using the internal secret vault, then the certificate you provide must include a DNS `subjectAlternativeName` that matches the `global.secretVaultExternalHostName` value.

You also need to set `useCertManager: false` in your `values.yaml`.

:::tip Overriding the secret vault internal certificate (`internalCertificateSecretName`)
The Helm `values.yaml` needs all the existing volumes in `.openbao.server.volumes` defined in addition to the modification, otherwise they will be removed.

Use `helm show values oci://docker.io/limepoint/opschain --version ${OPSCHAIN_CHART_VERSION} --jsonpath '{.openbao.server.volumes}'` to show the default values, and provide it as `.openbao.server.volumes` with the `secretName` modified.
:::

A subset example of the `values.yaml` for these values is:

```yaml
useCertManager: false

api:
  hostName: #api-hostname
  certificateSecretName: #api-cert-name

imageRegistry:
  certificateSecretName: #image-registry-cert

buildService:
  certificateSecretName: #build-service-cert

trow:
  trow:
    domain: #image-registry-hostname
  ingress:
    hosts:
      - paths: [ "/" ]
        host: #image-registry-hostname
    tls:
      - secretName: #image-registry-cert
        hosts:
          - #image-registry-hostname

openbao:
  server:
    volumes:
      - name: opschain-secret-vault-cert
        secret:
          secretName: #secret-vault-cert
      - name: opschain-secret-vault-data-claim
        persistentVolumeClaim:
          claimName: opschain-secret-vault-data-claim


secretVault:
  externalCertificateSecretName: #secret-vault-external-cert
  internalCertificateSecretName: #secret-vault-cert

global:
  secretVaultExternalHostName: #secret-vault-hostname

env:
  OPSCHAIN_API_CERTIFICATE_SECRET_NAME: #api-cert-name
  OPSCHAIN_API_HOST_NAME: #api-hostname
  OPSCHAIN_IMAGE_REGISTRY_HOST: #image-registry-hostname
```

:::warning
This sample `values.yaml` is not complete and is not usable as shown.
:::

## Mandatory secret vault settings

### Option 1. Internal default secret vault

If you are using the default secret vault provided by OpsChain (default configuration), you must define the host name its UI will be accessible at. You should do so by modifying the `global.secretVaultExternalHostName` setting in your `values.yaml` file.

:::warning
The default secret vault uses the same ingress as the API. Ensure that the host name you provide for the secret vault is different than the API host name.
:::

On the client machines that need to access the secret vault UI, you must create a DNS entry for the host name you provided in your `values.yaml` file. To do so, you'll need to obtain the external address of the `opschain-ingress-proxy` load balancer. Once OpsChain is installed, you can run the following command to obtain the external address:

```shell
kubectl get svc -n opschain opschain-ingress-proxy -o jsonpath='{.status.loadBalancer.ingress[]}'
```

Depending on your Kubernetes load balancer implementation, the command will either return an IP address or a host name that you can use to create a DNS entry for the secret vault host name like so:

```bash
echo "<load balancer address> <secret vault external host name>" >> /etc/hosts
```

#### Self-signed certificate

By default, OpsChain will issue a self-signed certificate for accessing the default secret vault on the host name you provided, this certificate must be trusted by anyone who will be accessing the secret vault UI. Once OpsChain is installed, you can extract the self-signed certificate from the `opschain-ca-key-pair` secret by running the following command:

```bash
kubectl -n opschain get secret opschain-ca-key-pair -o jsonpath="{.data.ca\.crt}" | base64 -d > opschain-ca.pem
```

Each platform has a different way of trusting a certificate. Follow your platform's documentation to trust the certificate so you're able to access the secret vault UI.

#### Custom certificate

Alternatively, you can provide a custom certificate that will be used for accessing the default secret vault by creating a Kubernetes secret containing the certificate and private key and modifying the `secretVault.externalCertificateSecretName` setting in your `values.yaml` file to the name of your secret. The certificate you provide must include a DNS subjectAlternativeName that matches the value in `global.secretVaultExternalHostName`.

:::tip Custom certificate
With the certificate and private key in your server, you can use the following command to create a Kubernetes secret containing the certificate and private key:

```bash
kubectl -n opschain create secret tls my-custom-certificate --cert=path/to/tls.cert --key=path/to/tls.key
```

:::

### Option 2. Using an external secret vault as the default

If you would like to use an external secret vault as the default secret vault, you can set the `openbao.global.enabled` and the `openbao.server.enabled` settings to `false` and provide the external secret vault settings in the `values.yaml` file.

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

:::warning
By using an external secret vault as the default secret vault, OpsChain will not provision the default secret vault on installation.
:::

## Optional configuration

### API settings

These settings define how the OpsChain API will be exposed on the network. Modifying any of these settings requires a full redeployment of the OpsChain application.

#### OPSCHAIN_API_CERTIFICATE_SECRET_NAME

Default value: _none_

The [Kubernetes TLS secret](https://kubernetes.io/docs/concepts/configuration/secret/#tls-secrets) name containing a custom certificate to be used for the HTTPS listener. When this is set, [OPSCHAIN_API_HOST_NAME](/setup/understanding-opschain-variables.md#opschain_api_host_name) must also be configured. [Learn more](/administration/tls.md#api-certificate).

#### OPSCHAIN_API_EXTERNAL_PORT

Default value: _3000_

The port that will be exposed for accessing the OpsChain API service.

#### OPSCHAIN_API_HOST_NAME

Default value: _none_

The host name that will be configured for the OpsChain API HTTPS listener. This is not required for HTTP access to the API, only for HTTPS access. [Learn more](/administration/tls.md#accessing-the-opschain-api-via-https)

#### OPSCHAIN_INSECURE_HTTP_PORT_ENABLED

Default value: _true_

Defines whether the OpsChain Ingress should provide an insecure HTTP port to be used for accessing the OpsChain API. [Learn more](/administration/tls.md#disable-the-insecure-http-listener).

### Authentication settings

#### OPSCHAIN_AUTH_STRATEGY

Default value: _ldap_<br/>
Accepted values: _ldap, local_

_This setting can be updated via [system configuration](#post-install-system-configuration) post installation._

Defines which authentication strategy will be used for user authentication. Currently, only one can be active at any given moment.

For the changes to this setting to take effect, the OpsChain API must be restarted.

:::warning
Users that are authenticated via LDAP will not be able to login when this variable is set to _local_ and vice-versa.
:::

### Change running settings

#### OPSCHAIN_API_WORKER_SCALE

Default value: _2_

The number of worker pods that will be deployed to process change and workflow steps.

:::note
The number of steps that can be processed by OpsChain is limited to the number of [threads per worker](#opschain_threads_per_worker) multiplied by this value. E.g. Two workers with five threads per worker can process ten steps concurrently.
:::

#### OPSCHAIN_MINTMODEL_API_SCALE

Default value: _5_

The number of parallel MintModel-rendering pods. These are the pods responsible for concretising the MintModels into actionable files. Without them, your instance will not be able to generate MintModels.

#### OPSCHAIN_PARALLEL_CHANGE_WORKER_STEPS

Default value: 10

The number of steps that can be run in parallel for a single change.

:::note
This option should not be set to a value greater than the number of [threads per worker](#opschain_threads_per_worker) multiplied by the [number of workers](#opschain_api_worker_scale).
:::

#### OPSCHAIN_REPO_FOLDER

Default value: _.opschain_

_This setting can be updated via [system configuration](#post-install-system-configuration) post installation._

Folder in the Git repositories where OpsChain properties and custom Dockerfiles will be imported from when running a change. Can be overriden by projects, environments, assets or on a per-change basis.

#### OPSCHAIN_SSH_KNOWN_HOSTS_CONFIG_MAP

Default value: _none_

OpsChain uses a bundled SSH `known_hosts` file for authentication. It has certificates for a number of common source code hosting platforms, including:

- Bitbucket
- GitHub
- GitLab

If you'd like to have support for other platforms, you can create a new config map with the desired contents and update this setting to use your custom config map name instead.

:::tip _known_hosts_ file template
You can use the following command to export the bundled `known_hosts` file to a YAML file as a template:

```bash
kubectl -n opschain get ConfigMap opschain-ssh-known-hosts -o yaml > custom-opschain-ssh-known-hosts.yaml
```

:::

You can then edit the exported resource, ensure you update the `metadata.name` field to a different config map name, and then update the file contents under the known_hosts key. Once the resource definition has been updated, use `kubectl` to create the custom config map:

```bash
kubectl -n opschain apply -f custom-opschain-ssh-known-hosts.yaml
```

Once the custom config map has been created, you can update the `OPSCHAIN_SSH_KNOWN_HOSTS_CONFIG_MAP` setting to use the custom config map name instead.

#### OPSCHAIN_THREADS_PER_WORKER

Default value: _5_<br/>
Minimum value: _2_

The number of threads each worker process will run. Note that increasing this number further may actually decrease concurrency due to context switching. We recommend that you consider increasing the [number of workers](#opschain_api_worker_scale) before considering increasing this value.

#### OPSCHAIN_TRACE

Default value: _false_

If set to true, additional logging will be generated when changes are run, allowing for more detailed debugging of changes.

### Image building settings

These settings define how OpsChain will build the Docker images for running changes.

#### OPSCHAIN_IMAGE_BUILD_ROOTLESS

Default value: _true_

Whether to use the [Buildkit rootless mode](https://github.com/moby/buildkit/blob/master/docs/rootless.md#rootless-mode) for the image build container.

#### OPSCHAIN_IMAGE_BUILD_CACHE_VOLUME_SIZE

Default value: _10Gi_

Volume claim size for the image build container cache.

### Image registry settings

#### External image registry settings

##### OPSCHAIN_DOCKER_USER

Default value: _none_

Docker Hub username to be used for accessing the OpsChain images on the external image registry.

##### OPSCHAIN_DOCKER_PASSWORD

Default value: _none_

Docker Hub password/token to be used for accessing the OpsChain images on the external image registry.

#### Internal image registry settings

##### OPSCHAIN_IMAGE_REGISTRY_HOST

Default value: _opschain-image-registry.local.gd_

Internally used hostname that needs to resolve to the Kubernetes node, but be different to the API hostname.

##### OPSCHAIN_IMAGE_REGISTRY_VOLUME_SIZE

Default value: _10Gi_

Volume claim size for the internal step image registry image storage volume.

### Ingress settings

#### OPSCHAIN_INGRESS_TLS_PORT

Default value: _3443_

Ingress service port defined in the Kong controller. Used by the internal image registry and for HTTPS access to the API and the default secret vault.

### Kubernetes deployment settings

#### OPSCHAIN_KUBERNETES_NAMESPACE

Default value: _opschain_

The [Kubernetes namespace](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) where OpsChain will be deployed.

#### OPSCHAIN_RUNNER_NODE_SELECTOR

Default value: _\{\}_

_This setting can be updated via [system configuration](#post-install-system-configuration) post installation._

[Kubernetes nodeSelector](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/) value that will be used to select the Kubernetes node where step runner pods will be deployed. Must be specified as a JSON string.

Use the default value unless running on a multi-node cluster.

### LDAP/AD settings

OpsChain provides an LDAP server for authentication out-of-the-box. If you'd prefer to use your own LDAP server, follow the [OpsChain LDAP](/administration/opschain-ldap.md) guide to alter these settings. All the default values shown below refer to the out-of-the-box LDAP server that OpsChain provides.

All these settings can be updated via [system configuration](#post-install-system-configuration) post installation.

#### OPSCHAIN_LDAP_ADMIN

Default value: _cn=admin,dc=opschain,dc=io_

LDAP/AD administrator DN to connect to.<br/> _Note: As OpsChain does not write to the LDAP database, this only needs to be a DN with permission to search all users and groups._

#### OPSCHAIN_LDAP_BASE_DN

Default value: _dc=opschain,dc=io_

LDAP/AD base DN value.

#### OPSCHAIN_LDAP_DOMAIN

Default value: _opschain.io_

LDAP/AD domain.

#### OPSCHAIN_LDAP_GROUP_BASE

Default value: _ou=groups,dc=opschain,dc=io_

LDAP/AD base DN to search for groups.

#### OPSCHAIN_LDAP_GROUP_ATTRIBUTE

Default value: _member_

LDAP/AD group attribute containing OpsChain user DNs.

#### OPSCHAIN_LDAP_HC_USER

Default value: _healthcheck_

To verify the LDAP server is available, OpsChain performs a regular query of the LDAP database for the username supplied here. <br/>_Note: If you do not wish to perform this check, leave this blank._

#### OPSCHAIN_LDAP_HOST

Default value: _opschain-ldap_

LDAP/AD host name (or IP address).

#### OPSCHAIN_LDAP_PORT

Default value: _389_

LDAP/AD host port to connect to.

#### OPSCHAIN_LDAP_USER_BASE

Default value: _ou=users,dc=opschain,dc=io_

LDAP/AD base DN to search for users.

#### OPSCHAIN_LDAP_USER_ATTRIBUTE

Default value: _uid_

LDAP/AD user attribute used as the OpsChain username.

### Secret vault settings

OpsChain provides an out-of-the-box secret vault that can be used to store secure property information. However, you can also use an external secret vault by providing the settings below.

Vault settings can be overriden at a project, environment or asset level, allowing you to use different vaults for each of these.

:::tip Multiple vaults
You can provision the default secret vault on installation and configure individual projects, environments or assets to access external vaults.
:::

#### OPSCHAIN_VAULT_ADDRESS

Default value: _none_

The address of the external secret vault that OpsChain will use, including the port, e.g `http://vault.example.com:8200`.

#### OPSCHAIN_VAULT_AUTH_METHOD

Default value: _none_

Accepted values: _token, userpass, ldap_

The authentication method that OpsChain will use to authenticate with the external secret vault.

#### OPSCHAIN_VAULT_TOKEN

Default value: _none_

The token that OpsChain will use to authenticate with the external secret vault. Required if the authentication method is `token`.

:::info Default secret vault token
When using the default secret vault, the token will be automatically generated by OpsChain and is necessary for root access to the secret vault. You can extract the token from the `opschain-vault-config` secret by running the following command:

```bash
kubectl -n opschain get secret opschain-vault-config -o jsonpath="{.data.OPSCHAIN_VAULT_TOKEN}" | base64 -d
```

Note that this token provides root access to the secret vault and should be kept secure.
:::

#### OPSCHAIN_VAULT_USERNAME

Default value: _none_

The username that OpsChain will use to authenticate with the external secret vault. Required if the authentication method is `userpass` or `ldap`.

#### OPSCHAIN_VAULT_PASSWORD

Default value: _none_

The password that OpsChain will use to authenticate with the external secret vault. Required if the authentication method is `userpass` or `ldap`.

#### OPSCHAIN_VAULT_MOUNT_PATH

Default value: _none_

The mount path for the KV secret store in the external secret vault.

#### OPSCHAIN_VAULT_USE_MINT_ENCRYPTION

Default value: _true_

Whether to use OpsChain's encryption to encrypt the values before storing them in the external secret vault. If this is set to true, the values will be encrypted twice.

#### OPSCHAIN_VAULT_CLIENT_OPTIONS

Default value: _none_

A hash of options to pass to the external vault client, in JSON format. Refer to the Vault Ruby Client Gem [usage instructions](https://github.com/hashicorp/vault-ruby/tree/master?tab=readme-ov-file#usage) for the available options.

## Post-install system configuration

When starting OpsChain for the first time, the settings above will be stored in OpsChain's database and might be updated via the OpsChain GUI or API. See the [API documentation](https://docs.opschain.io/api-docs#tag/System-configuration) for more details.
