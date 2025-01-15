---
sidebar_position: 3
description: Explore the available configuration options that can be included in the `.env` file.
---

# Configuring OpsChain

This guide describes the various configuration options that can be included in your `.env` file, along with their default values.

## Configuration variables

The following configuration variables can be set in your `.env` file:

:::info
After making changes to your `.env` file, you must run `opschain server configure` and then re-deploy OpsChain (e.g. `opschain server deploy`).
:::

### Common configuration

#### OPSCHAIN_API_CERTIFICATE_SECRET_NAME

Default value: _none_

The [Kubernetes TLS secret](https://kubernetes.io/docs/concepts/configuration/secret/#tls-secrets) name containing a custom certificate to be used for the HTTPS listener. [OPSCHAIN_API_HOST_NAME](https://docs.opschain.io/docs/operations/configuring-opschain#opschain_api_host_name) must also be configured. [Learn more](/docs/operations/tls.md#api-certificate)

#### OPSCHAIN_API_EXTERNAL_PORT

Default value: _3000_

The port that will be exposed for accessing the OpsChain API service.

#### OPSCHAIN_API_HOST_NAME

Default value: _none_

The host name that will be configured for the OpsChain API HTTPS listener. This is not required for HTTP access to the API, only for HTTPS access. [Learn more](/docs/operations/tls.md#accessing-the-opschain-api-via-https)

#### OPSCHAIN_DOCKER_USER

Default value: _none_

Docker Hub username for accessing the OpsChain images.

#### OPSCHAIN_DOCKER_PASSWORD

Default value: _none_

Docker Hub password/token for accessing the OpsChain images.

#### OPSCHAIN_GID

Default value: _GID of the current user (i.e. the output of the `id -g` command)_

Group ID on the host that should own the OpsChain files.

#### OPSCHAIN_GITHUB_USER

Default value: _none_

OpsChain username for accessing the OpsChain Helm charts via GitHub.

#### OPSCHAIN_GITHUB_TOKEN

Default value: _none_

[GitHub personal access token](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token) for accessing the OpsChain Helm charts via GitHub.

#### OPSCHAIN_INSECURE_HTTP_PORT_ENABLED

Default value: _true_

Enable/Disable the HTTP ingress port. [Learn more](/docs/operations/tls.md#disable-the-insecure-http-listener).

#### OPSCHAIN_IMAGE_REGISTRY_HOST

Default value: _opschain-image-registry.local.gd_

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

The number of threads each worker process will run. Note that increasing this number further may actually decrease concurrency due to context switching. We recommend that you consider increasing the [number of workers](#opschain_api_worker_scale) before considering increasing this value.

#### OPSCHAIN_TLS_EXTERNAL_PORT

Default value: _3443_

The HTTPS listener port on the Kubernetes node. It is also used by OpsChain from the Kubernetes runtime.

#### OPSCHAIN_UID

Default value: _UID of the current user (i.e. the output of the `id -u` command)_

User ID on the host that should own the OpsChain files.

#### OPSCHAIN_SSH_KNOWN_HOSTS_CONFIG_MAP

Default value: _none_

A custom config map name to use for the `.ssh/known_hosts` file. [Learn more](/docs/reference/project-git-repositories.md#customising-the-ssh-known_hosts-file).

### LDAP configuration

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

### Development environment

The following variables can be manually set inside the OpsChain development environment or configured in your host environment, and they will be passed through (e.g. in your `~/.zshrc`).

#### OPSCHAIN_ACTION_RUN_CHILDREN

Default value: _false_

Automatically run child steps in the local Docker development environment. See the [Docker development environment guide (child steps)](/docs/development-environment.md#child-steps) for more details.

#### OPSCHAIN_TRACE

Default value: _false_

If set to true, additional logging will be generated when actions are run
