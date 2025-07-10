---
sidebar_position: 3
description: Explore the available configuration options that can be included in the `.env` file.
---

# Configuring OpsChain

This guide describes the various configuration options that can be included in your `.env` file when installing OpsChain, along with their default values.

It is possible to update some of these settings via the system configuration.

## Configuration variables

The following configuration variables can be set in your `.env` file and will be saved as the system configuration on OpsChain's first startup.

:::info
After making changes to your `.env` file, you must run `opschain server configure` and then re-deploy OpsChain (e.g. `opschain server deploy`).
:::

### Common configuration

#### OPSCHAIN_API_CERTIFICATE_SECRET_NAME

Default value: _none_

The [Kubernetes TLS secret](https://kubernetes.io/docs/concepts/configuration/secret/#tls-secrets) name containing a custom certificate to be used for the HTTPS listener. [OPSCHAIN_API_HOST_NAME](https://docs.opschain.io/docs/operations/configuring-opschain#opschain_api_host_name) must also be configured. [Learn more](/operations/tls.md#api-certificate)

#### OPSCHAIN_API_EXTERNAL_PORT

Default value: _3000_

The port that will be exposed for accessing the OpsChain API service.

#### OPSCHAIN_API_HOST_NAME

Default value: _none_

The host name that will be configured for the OpsChain API HTTPS listener. This is not required for HTTP access to the API, only for HTTPS access. [Learn more](/operations/tls.md#accessing-the-opschain-api-via-https)

#### OPSCHAIN_DOCKER_USER

Default value: _none_

_This setting can be updated via [system configuration](#system-configuration) post installation._

Docker Hub username for accessing the OpsChain images.

#### OPSCHAIN_DOCKER_PASSWORD

Default value: _none_

_This setting can be updated via [system configuration](#system-configuration) post installation._

Docker Hub password/token for accessing the OpsChain images.

#### OPSCHAIN_GID

Default value: _GID of the current user (i.e. the output of the `id -g` command)_

Group ID on the host that should own the OpsChain files.

#### OPSCHAIN_GITHUB_USER

Default value: _none_

_This setting can be updated via [system configuration](#system-configuration) post installation._

OpsChain username for accessing the OpsChain Helm charts via GitHub.

#### OPSCHAIN_GITHUB_TOKEN

Default value: _none_

_This setting can be updated via [system configuration](#system-configuration) post installation._

[GitHub personal access token](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token) for accessing the OpsChain Helm charts via GitHub.

#### OPSCHAIN_INSECURE_HTTP_PORT_ENABLED

Default value: _true_

Enable/Disable the HTTP ingress port. [Learn more](/operations/tls.md#disable-the-insecure-http-listener).

#### OPSCHAIN_IMAGE_REGISTRY_HOST

Default value: _opschain-image-registry.local.gd_

_This setting can be updated via [system configuration](#system-configuration) post installation._

Internally used hostname that needs to resolve to the Kubernetes node, but be different to the API hostname.

#### OPSCHAIN_IMAGE_BUILD_ROOTLESS

Default value: _true_

Whether to use the [Buildkit rootless mode](https://github.com/moby/buildkit/blob/master/docs/rootless.md#rootless-mode) for the image build container.

#### OPSCHAIN_IMAGE_BUILD_CACHE_VOLUME_SIZE

Default value: _10Gi_

Volume claim size for the image build container cache.

#### OPSCHAIN_IMAGE_REGISTRY_VOLUME_SIZE

Default value: _10Gi_

Volume claim size for the step image registry image storage volume.

#### OPSCHAIN_KUBERNETES_NAMESPACE

Default value: _opschain_

[Kubernetes namespace](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) to deploy OpsChain into.

#### OPSCHAIN_MINTPRESS_PARALLEL_STEPS_PER_CHANGE

Default value: 10

The number of MintModel steps that can be run in parallel for a single change.

:::note
This option should not be set to a value greater than the number of [threads per worker](#opschain_threads_per_worker) multiplied by the [number of workers](#opschain_api_worker_scale).
:::

#### OPSCHAIN_RUNNER_NODE_SELECTOR

Default value: _{}_

_This setting can be updated via [system configuration](#system-configuration) post installation._

[Kubernetes nodeSelector](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/) value that will be used for step runner pods. Must be specified as a JSON string.

#### OPSCHAIN_API_WORKER_SCALE

Default value: _2_

The number of worker pods that will be deployed to process change and workflow steps.

:::note
The number of steps that can be processed by OpsChain is limited to the number of [threads per worker](#opschain_threads_per_worker) multiplied by this value. E.g. Two workers with five threads per worker can process ten steps concurrently.
:::

#### OPSCHAIN_THREADS_PER_WORKER

Default value: _5_<br/>
Minimum value: _2_

_This setting can be updated via [system configuration](#system-configuration) post installation._

The number of threads each worker process will run. Note that increasing this number further may actually decrease concurrency due to context switching. We recommend that you consider increasing the [number of workers](#opschain_api_worker_scale) before considering increasing this value.

#### OPSCHAIN_TLS_EXTERNAL_PORT

Default value: _3443_

The HTTPS listener port on the Kubernetes node. It is also used by OpsChain from the Kubernetes runtime.

#### OPSCHAIN_UID

Default value: _UID of the current user (i.e. the output of the `id -u` command)_

User ID on the host that should own the OpsChain files.

#### OPSCHAIN_SSH_KNOWN_HOSTS_CONFIG_MAP

Default value: _none_

A custom config map name to use for the `.ssh/known_hosts` file. [Learn more](/reference/project-git-repositories.md#customising-the-ssh-known_hosts-file).

### LDAP configuration

All these settings can be updated via [system configuration](#system-configuration) post installation.

#### OPSCHAIN_LDAP_ADMIN

Default value: _cn=admin,dc=opschain,dc=io_

LDAP/AD administrator DN to connect to.<br/> _Note: As OpsChain does not write to the LDAP database, this need only be a DN with permission to search all users and groups._

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

#### OPSCHAIN_LDAP_PASSWORD

Default value: _none_

OPSCHAIN_LDAP_ADMIN password.

#### OPSCHAIN_LDAP_PORT

Default value: _389_

LDAP/AD host port to connect to.

#### OPSCHAIN_LDAP_USER_BASE

Default value: _ou=users,dc=opschain,dc=io_

LDAP/AD base DN to search for users.

#### OPSCHAIN_LDAP_USER_ATTRIBUTE

Default value: _uid_

LDAP/AD user attribute used as the OpsChain username.

### Authentication configuration

#### OPSCHAIN_AUTH_STRATEGY

Default value: _ldap_
Accepted values: _ldap, local_

_This setting can be updated via [system configuration](#system-configuration) post installation._

Which authentication strategy OpsChain will use for user authentication.

### Development environment

The following variables can be manually set inside the OpsChain development environment or configured in your host environment, and they will be passed through (e.g. in your `~/.zshrc`).

#### OPSCHAIN_ACTION_RUN_CHILDREN

Default value: _false_

Automatically run child steps in the local Docker development environment. See the [Docker development environment guide (child steps)](/development-environment.md#child-steps) for more details.

#### OPSCHAIN_TRACE

Default value: _false_

If set to true, additional logging will be generated when actions are run

## System configuration

After starting OpsChain for the first time, some settings will be stored and can later be updated via the OpsChain API. See the [API documentation](https://docs.opschain.io/api-docs#tag/System-configuration) for more details.

The following settings can be managed via the system configuration settings post installation:

- OPSCHAIN_ALLOW_PARALLEL_CHANGES
- OPSCHAIN_ALLOW_PARALLEL_RUNS_OF_SAME_WORKFLOW
- OPSCHAIN_AUTH_STRATEGY
- OPSCHAIN_CLEAN_OLD_DATA_JOB_CRON
- OPSCHAIN_CREATE_LOGS_API_PASSWORD
- OPSCHAIN_CREATE_LOGS_API_USERNAME
- OPSCHAIN_DATA_RETENTION_CHANGE_LOG_RETENTION_DAYS
- OPSCHAIN_DATA_RETENTION_EVENT_RETENTION_DAYS
- OPSCHAIN_DATA_RETENTION_JOB_RETENTION_DAYS
- OPSCHAIN_GITHUB_TOKEN
- OPSCHAIN_GITHUB_USER
- OPSCHAIN_IMAGE_PULL_SECRET
- OPSCHAIN_IMAGE_REGISTRY_HOST
- OPSCHAIN_IMAGE_REGISTRY_INTERNAL_HOST
- OPSCHAIN_IMAGE_REGISTRY_USER
- OPSCHAIN_IMAGE_REGISTRY_PASSWORD
- OPSCHAIN_IGNORE_EMPTY_TENANTS
- OPSCHAIN_LDAP_ADMIN
- OPSCHAIN_LDAP_BASE_DN
- OPSCHAIN_LDAP_CACHE_TTL
- OPSCHAIN_LDAP_DOMAIN
- OPSCHAIN_LDAP_ENABLE_SSL
- OPSCHAIN_LDAP_HOST
- OPSCHAIN_LDAP_GROUP_BASE
- OPSCHAIN_LDAP_GROUP_ATTRIBUTE
- OPSCHAIN_LDAP_HC_USER
- OPSCHAIN_LDAP_LOG_LEVEL
- OPSCHAIN_LDAP_ORGANISATION
- OPSCHAIN_LDAP_PORT
- OPSCHAIN_LDAP_USER_BASE
- OPSCHAIN_LDAP_USER_ATTRIBUTE
- OPSCHAIN_NOTIFICATIONS_EVENTS_CHANGE
- OPSCHAIN_NOTIFICATIONS_EVENTS_WORKFLOW_RUN
- OPSCHAIN_NOTIFICATIONS_TARGETS
- OPSCHAIN_DOCKER_USER
- OPSCHAIN_DOCKER_PASSWORD
- OPSCHAIN_REQUIRES_APPROVAL_FROM
- OPSCHAIN_RUNNER_NODE_SELECTOR
- OPSCHAIN_RUNNER_NAME
- OPSCHAIN_RUNNER_IMAGE
- OPSCHAIN_TENANT_BASE_URLS
- OPSCHAIN_THREADS_PER_WORKER
- OPSCHAIN_TLS_EXTERNAL_PORT
- OPSCHAIN_VAULT_ADDRESS
- OPSCHAIN_VAULT_AUTH_METHOD
- OPSCHAIN_VAULT_CLIENT_OPTIONS
- OPSCHAIN_VAULT_MOUNT_PATH
- OPSCHAIN_VAULT_PASSWORD
- OPSCHAIN_VAULT_TOKEN
- OPSCHAIN_VAULT_USERNAME
- OPSCHAIN_VAULT_USE_MINT_ENCRYPTION
- OPSCHAIN_VERSION
