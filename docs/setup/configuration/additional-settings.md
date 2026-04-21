---
sidebar_position: 4
toc_max_heading_level: 2
description: Optional settings that can be configured after installing OpsChain
---

# Additional settings

This guide describes the various optional settings that can be configured in the `env` section of your `values.yaml`, along with their default values.

## API settings

These settings define how the OpsChain API will be exposed on the network. Modifying any of these settings requires a full redeployment of the OpsChain application.

### OPSCHAIN_API_CERTIFICATE_SECRET_NAME

Default value: _none_

The [Kubernetes TLS secret](https://kubernetes.io/docs/concepts/configuration/secret/#tls-secrets) name containing a custom certificate to be used for the HTTPS listener. When this is set, [OPSCHAIN_API_HOST_NAME](#envopschain_api_host_name-and-apihostname) must also be configured. [Learn more](/setup/configuration/tls/index.md).

### OPSCHAIN_API_EXTERNAL_PORT

Default value: _3000_

The port that will be exposed for accessing the OpsChain API service.

### `env.OPSCHAIN_API_HOST_NAME` and `api.hostName`

Default value: _opschain-api_

The host name that will be configured for the OpsChain API HTTPS listener. This is not required for HTTP access to the API, only for HTTPS access. [Learn more](/setup/configuration/tls/index.md)

:::note
These two values must match.
:::

### OPSCHAIN_INSECURE_HTTP_PORT_ENABLED

Default value: _true_

Defines whether the OpsChain Ingress should provide an insecure HTTP port to be used for accessing the OpsChain API. [Learn more](/setup/configuration/tls/index.md#disabling-the-insecure-http-listener).

## GUI settings

### OPSCHAIN_GUI_BASE_URL

Default value: _none_

The base URL for the OpsChain GUI (e.g. `https://opschain.example.com`). It is required to ensure links within external notifications are valid and the OpsChain API pod will fail to startup if it is not configured.

## API/worker database settings

These settings affect how the OpsChain API and worker interact with the database.

### OPSCHAIN_DATABASE_STATEMENT_TIMEOUT

Default values: _50s_ (50 seconds)

Configures the database [`statement_timeout`](https://www.postgresql.org/docs/current/runtime-config-client.html#GUC-STATEMENT-TIMEOUT). This means queries to the database will be terminated if this timeout is exceeded.

Set to `0` to disable this feature (meaning queries will not be terminated).

Queries are terminated to prevent overloading the database.

## Authentication settings

### OPSCHAIN_AUTH_STRATEGY

Default value: _ldap_<br/>
Accepted values: _ldap, local_

_This setting can be updated via [system configuration](#post-install-system-configuration) post installation._

Defines which authentication strategy will be used for user authentication. Currently, only one can be active at any given moment.

For the changes to this setting to take effect, the OpsChain API must be restarted.

:::warning
Users that are authenticated via LDAP will not be able to login when this variable is set to _local_ and vice-versa.
:::

## Change running settings

### OPSCHAIN_API_WORKER_SCALE

Default value: _2_

The number of worker pods that will be deployed to process change and workflow steps.

:::note
The number of steps that can be processed by OpsChain is limited to the number of [threads per worker](#opschain_threads_per_worker) multiplied by this value. E.g. Two workers with five threads per worker can process ten steps concurrently.
:::

### OPSCHAIN_MINTMODEL_API_SCALE

Default value: _5_

The number of parallel MintModel-rendering pods. These are the pods responsible for concretising the MintModels into actionable files. Without them, your instance will not be able to generate MintModels.

### OPSCHAIN_PARALLEL_CHANGE_WORKER_STEPS

Default value: 10

The number of steps that can be run in parallel for a single change.

:::note
This option should not be set to a value greater than the number of [threads per worker](#opschain_threads_per_worker) multiplied by the [number of workers](#opschain_api_worker_scale).
:::

### OPSCHAIN_REPO_FOLDER

Default value: _.opschain_

_This setting can be updated via [system configuration](#post-install-system-configuration) post installation._

Folder in the Git repositories where OpsChain properties and custom Dockerfiles will be imported from when running a change. Can be overriden by projects, environments, assets or on a per-change basis.

### OPSCHAIN_SSH_KNOWN_HOSTS_CONFIG_MAP

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

### OPSCHAIN_THREADS_PER_WORKER

Default value: _5_<br/>
Minimum value: _2_

The number of threads each worker process will run. Note that increasing this number further may actually decrease concurrency due to context switching. We recommend that you consider increasing the [number of workers](#opschain_api_worker_scale) before considering increasing this value.

### OPSCHAIN_TRACE

Default value: _false_

If set to true, additional logging will be generated when changes are run, allowing for more detailed debugging of changes.

## Image building settings

These settings define how OpsChain will build the Docker images for running changes.

### OPSCHAIN_IMAGE_BUILD_ROOTLESS

Default value: _true_

Whether to use the [Buildkit rootless mode](https://github.com/moby/buildkit/blob/master/docs/rootless.md#rootless-mode) for the image build container.

### OPSCHAIN_IMAGE_BUILD_CACHE_VOLUME_SIZE

Default value: _10Gi_

Volume claim size for the image build container cache.

## Image registry settings

### External image registry settings

#### OPSCHAIN_DOCKER_USER

Default value: _none_

Docker Hub username to be used for accessing the OpsChain images on the external image registry.

#### OPSCHAIN_DOCKER_PASSWORD

Default value: _none_

Docker Hub password/token to be used for accessing the OpsChain images on the external image registry.

### Internal image registry settings

#### OPSCHAIN_IMAGE_REGISTRY_HOST

Default value: _opschain-image-registry.local.gd_

Internally used hostname that needs to resolve to the Kubernetes node, but be different to the API hostname.

#### OPSCHAIN_IMAGE_REGISTRY_VOLUME_SIZE

Default value: _10Gi_

Volume claim size for the internal step image registry image storage volume.

## Ingress settings

### OPSCHAIN_INGRESS_TLS_PORT

Default value: _3443_

Ingress service port defined in the Kong controller. Used by the internal image registry and for HTTPS access to the API and the OpsChain secret vault.

## Kubernetes deployment settings

### OPSCHAIN_KUBERNETES_NAMESPACE

Default value: _opschain_

The [Kubernetes namespace](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) where OpsChain will be deployed.

### OPSCHAIN_RUNNER_NODE_SELECTOR

Default value: _\{\}_

_This setting can be updated via [system configuration](#post-install-system-configuration) post installation._

[Kubernetes nodeSelector](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/) value that will be used to select the Kubernetes node where step runner pods will be deployed. Must be specified as a JSON string.

Use the default value unless running on a multi-node cluster.

## LDAP/AD settings

OpsChain provides an LDAP server for authentication out-of-the-box. If you'd prefer to use your own LDAP server, follow the [OpsChain LDAP](/operations/opschain-ldap.md) guide to alter these settings. All the default values shown below refer to the out-of-the-box LDAP server that OpsChain provides.

All these settings can be updated via [system configuration](#post-install-system-configuration) post installation.

### OPSCHAIN_LDAP_ADMIN

Default value: _cn=admin,dc=opschain,dc=io_

LDAP/AD administrator DN to connect to.<br/> _Note: As OpsChain does not write to the LDAP database, this only needs to be a DN with permission to search all users and groups._

### OPSCHAIN_LDAP_BASE_DN

Default value: _dc=opschain,dc=io_

LDAP/AD base DN value.

### OPSCHAIN_LDAP_DOMAIN

Default value: _opschain.io_

LDAP/AD domain.

### OPSCHAIN_LDAP_GROUP_ATTRIBUTE

Default value: _member_

LDAP/AD group attribute containing OpsChain user DNs.

### OPSCHAIN_LDAP_GROUP_BASE

Default value: _ou=groups,dc=opschain,dc=io_

LDAP/AD base DN to search for groups.

### OPSCHAIN_LDAP_GROUPS_FILTER

Default value: _(objectClass=groupOfNames)_

LDAP/AD filter to use when searching for groups.

### OPSCHAIN_LDAP_LOG_LEVEL

Default value: _1024_

The log level the LDAP server should use.

### OPSCHAIN_LDAP_LOGGING_ENABLED

Default value: _true_

Whether to enable logging for the LDAP server.

### OPSCHAIN_LDAP_HC_USER

Default value: _healthcheck_

To verify the LDAP server is available, OpsChain performs a regular query of the LDAP database for the username supplied here. <br/>_Note: If you do not wish to perform this check, leave this blank._

### OPSCHAIN_LDAP_HOST

Default value: _opschain-ldap_

LDAP/AD host name (or IP address).

### OPSCHAIN_LDAP_MAIL_ATTRIBUTE

Default value: _mail_

LDAP/AD user attribute used to fetch LDAP users' email addresses.

### OPSCHAIN_LDAP_PORT

Default value: _389_

LDAP/AD host port to connect to.

### OPSCHAIN_LDAP_USE_ADMIN_TO_BIND

Default value: _false_

Whether to use the LDAP administrator DN to bind to the LDAP server.

### OPSCHAIN_LDAP_USER_ATTRIBUTE

Default value: _uid_

LDAP/AD user attribute used as the OpsChain username.

### OPSCHAIN_LDAP_USER_BASE

Default value: _ou=users,dc=opschain,dc=io_

LDAP/AD base DN to search for users.

### OPSCHAIN_LDAP_USERS_FILTER

Default value: _(objectClass=inetOrgPerson)_

LDAP/AD filter to use when searching for users.

## Secret vault settings

This is an exhaustive list of all the settings in the `values.yaml` file that can be used to configure the global secret vault in OpsChain.

:::warning High availability setup
To support a [high availability setup](/advanced/ha/index.md) using the OpsChain secret vault as the global default, you must configure its service to allow incoming connections from the other instances:

```yaml
secretVault:
  ...
  externalService:
    enabled: true
    # Default value - can be overridden
    nodePort: 30201
```

Make sure that the `nodePort` is accessible from the other instances in the high availability setup.
:::

### OPSCHAIN_VAULT_ADDRESS

Default value: _none_

The address of the external secret vault that OpsChain will use, including the port, e.g `http://vault.example.com:8200`.

### OPSCHAIN_VAULT_AUTH_METHOD

Default value: _none_

Accepted values: _token, userpass, ldap_

The authentication method that OpsChain will use to authenticate with the external secret vault.

### OPSCHAIN_VAULT_TOKEN

Default value: _none_

The token that OpsChain will use to authenticate with the external secret vault. Required if the authentication method is `token`.

:::info OpsChain secret vault token
When using the OpsChain secret vault, the token will be automatically generated by OpsChain and is necessary for root access to the secret vault. You can extract the token from the `opschain-vault-config` secret by running the following command:

```bash
kubectl -n opschain get secret opschain-vault-config -o jsonpath="{.data.OPSCHAIN_VAULT_TOKEN}" | base64 -d
```

Note that this token provides root access to the secret vault and should be kept secure.
:::

### OPSCHAIN_VAULT_USERNAME

Default value: _none_

The username that OpsChain will use to authenticate with the external secret vault. Required if the authentication method is `userpass` or `ldap`.

### OPSCHAIN_VAULT_PASSWORD

Default value: _none_

The password that OpsChain will use to authenticate with the external secret vault. Required if the authentication method is `userpass` or `ldap`.

### OPSCHAIN_VAULT_MOUNT_PATH

Default value: _none_

The mount path for the KV secret store in the external secret vault.

### OPSCHAIN_VAULT_USE_MINT_ENCRYPTION

Default value: _true_

Whether to use OpsChain's encryption to encrypt the values before storing them in the external secret vault. If this is set to true, the values will be encrypted twice.

### OPSCHAIN_VAULT_CLIENT_OPTIONS

Default value: _none_

A hash of options to pass to the external vault client, in JSON format. Refer to the Vault Ruby Client Gem [usage instructions](https://github.com/hashicorp/vault-ruby/tree/master?tab=readme-ov-file#usage) for the available options.

## Post-install system configuration

When starting OpsChain for the first time, the settings above will be stored in OpsChain's database and might be updated via the OpsChain GUI or API. See the [API documentation](https://docs.opschain.io/api-docs#tag/System-configuration) for more details.

## What to do next

- With your `values.yaml` file ready, [install OpsChain](/setup/installation.md) and start using it.
