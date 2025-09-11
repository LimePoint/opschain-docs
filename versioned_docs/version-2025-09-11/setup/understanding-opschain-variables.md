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
You can generate a random key of specific length for the following settings with:

```bash
openssl rand -hex <key_length>
```

You can then copy the value and paste it into your setting's value. DO NOT reuse the same value for different settings.
:::

| Variable name | Description |
| :---  | :--- |
| OPSCHAIN_DETERMINISTIC_KEY    | The key OpsChain will use for encrypting its data, must be at least 32 characters long |
| OPSCHAIN_IMAGE_REGISTRY_PASSWORD    | The password that OpsChain should use when communicating with its internal image registry, must be at least 8 characters long. |
| OPSCHAIN_KEY_DERIVATION_SALT    | The key OpsChain will use for generating its cryptography keys, must be at least 32 characters long. |
| OPSCHAIN_LDAP_PASSWORD    | The password that OpsChain will use when communicating with its LDAP server, must be at least 8 characters long. |
| OPSCHAIN_PRIMARY_KEY    | The primary key OpsChain will use for encryption, must be at least 32 characters long. |
| PGPASSWORD    | The password for accessing OpsChain's database, must be at least 8 characters long. |

## Optional configuration

### API settings

These settings define how the OpsChain API will be exposed on the network. Modifying any of these settings requires a full redeployment of the OpsChain application.

#### OPSCHAIN_API_CERTIFICATE_SECRET_NAME

Default value: _none_

The [Kubernetes TLS secret](https://kubernetes.io/docs/concepts/configuration/secret/#tls-secrets) name containing a custom certificate to be used for the HTTPS listener. When this is set, [OPSCHAIN_API_HOST_NAME](/docs/setup/understanding-opschain-variables.md#opschain_api_host_name) must also be configured. [Learn more](/administration/tls.md#api-certificate).

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

##### OPSCHAIN_IMAGE_REGISTRY_TLS_EXTERNAL_PORT

Default value: _3443_

Port mapping of the TLS port used to connect to the internal image registry.

##### OPSCHAIN_IMAGE_REGISTRY_VOLUME_SIZE

Default value: _10Gi_

Volume claim size for the internal step image registry image storage volume.

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

## Post-install system configuration

When starting OpsChain for the first time, the settings above will be stored in OpsChain's database and might be updated via the OpsChain GUI or API. See the [API documentation](https://docs.opschain.io/api-docs#tag/System-configuration) for more details.
