---
sidebar_position: 4
toc_max_heading_level: 2
description: Optional settings that can be configured after installing OpsChain
---

# Additional settings

This guide describes the various optional settings that can be configured in your `values.yaml`, along with their default values. The settings in uppercase are the ones that can be configured in the `env` section of your `values.yaml`, the others are regular YAML keys at the top level of the file.

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

### `api.env`

Default value: _none_

Environment variables to be set for the API container.

## GUI settings

### OPSCHAIN_GUI_BASE_URL

Default value: _none_

The base URL for the OpsChain GUI (e.g. `https://opschain.example.com`). It is required to ensure links within external notifications are valid and the OpsChain API pod will fail to startup if it is not configured.

## API/worker database settings

These settings affect how the OpsChain API and worker interact with the database.

### OPSCHAIN_API_DATABASE_STATEMENT_TIMEOUT

Default values: _50s_ (50 seconds)

Configures the database [`statement_timeout`](https://www.postgresql.org/docs/current/runtime-config-client.html#GUC-STATEMENT-TIMEOUT) for API requests to the OpsChain API. This means queries to the database will be terminated if this timeout is exceeded.

Set to `0` to disable this feature (meaning queries will not be terminated).

Queries are terminated to prevent overloading the database.

:::note
This value would be in milliseconds if no suffix was added. Add the suffix `s` for seconds (as the default does), `min` for minutes, `h` for hours.
:::

### OPSCHAIN_WORKER_DATABASE_STATEMENT_TIMEOUT

Default values: _0_ (do not timeout)

Configures the database [`statement_timeout`](https://www.postgresql.org/docs/current/runtime-config-client.html#GUC-STATEMENT-TIMEOUT) for SQL statements executed within the OpsChain worker. This means queries to the database will be terminated if this timeout is exceeded.

:::note
This value would be in milliseconds if no suffix was added. Add the suffix `s` for seconds, `min` for minutes, `h` for hours.
:::

## Database backup settings

OpsChain can automatically back up its database on a schedule, and again before each upgrade. Scheduled backups are enabled by default. The most commonly adjusted settings are listed below; see the [backup & restore guide](/operations/maintenance/backups.md#automated-backups) for the full backup and recovery procedure, and [obtaining a full `values.yaml` from the chart](/setup/configuration/index.md#obtaining-a-full-valuesyaml-from-the-chart) for every available option (retention by age, storage class, pre-deploy tuning, and more).

### `db.backup.periodic.enabled`

Default value: _true_

Whether scheduled database backups run.

### `db.backup.periodic.schedule`

Default value: _`0 2 * * *`_

The cron expression that controls when scheduled backups run.

### `db.backup.periodic.method`

Default value: _physical_

The method used for scheduled backups: `physical` (a full base backup) or `logical` (a portable dump).

### `db.backup.retention.count`

Default value: _7_

The number of most recent backups to keep.

### `db.backup.storage.size`

Default value: _20Gi_

The size of the volume that stores backups. Size it for your largest database multiplied by the retention count, with some headroom.

### `db.backup.preDeploy.enabled`

Default value: _false_

Whether to take a backup automatically before each `helm upgrade`.

### `db.backup.imagePullPolicy`

Default value: _Always_

The image pull policy for the backup, recovery and init pods. `Always` ensures an updated `opschain-db` image is picked up automatically. Once your nodes have the updated image you may set it to `IfNotPresent` to skip the per-run registry check.

## Authentication settings

### OPSCHAIN_AUTH_STRATEGY

Default value: _ldap_<br/>
Accepted values: _ldap, local_

_This setting can be updated via [system configuration](#post-install-system-configuration) post installation._

Defines which authentication strategy will be used for user authentication. Currently, only one can be active at any given moment.

:::tip[Locked out?]
If a change to this setting prevents you from signing in (for example, switching to a strategy that no users can authenticate against), you can recover by [overriding the setting from a deploy](#overriding-a-database-setting-from-a-deploy).
:::

:::warning
Users that are authenticated via LDAP will not be able to login when this variable is set to _local_ and vice-versa.
:::

### OPSCHAIN_ENABLE_BASIC_AUTH

Default value: _true_

Whether to enable basic authentication for the OpsChain API. When this is disabled, the only authentication method available is bearer token authentication.

:::danger[Security implications]
When basic authentication is used, the username and password for OpsChain are sent in plain text on each request. If the `OPSCHAIN_INSECURE_HTTP_PORT_ENABLED` setting is also set to `true` and a client connects via HTTP, their credentials are in greater risk of being compromised.
:::

:::info[Token authentication and HTTP]
When this setting is `false` and [`OPSCHAIN_TOKEN_ENABLE_COOKIES`](#opschain_token_enable_cookies) is `true`, connecting to the OpsChain GUI should be done via HTTPS. Otherwise, your session will end on [token expiry](#opschain_token_access_expiry) and you'll need to login again.
:::

### OPSCHAIN_TOKEN_ACCESS_EXPIRY

Default value: _240_

The number of minutes before a bearer access token expires.

### OPSCHAIN_TOKEN_ENABLE_COOKIES

Default value: _true_

Whether to enable cookies for bearer tokens. When this is `true`, the bearer tokens will be stored in the client's browser cookies and sent with each request to the OpsChain API. When this is `false`, the bearer tokens will be stored in the client's browser local storage instead.

:::note[Secure cookies]
Secure cookies cannot be stored in the user's browser cookies if the OpsChain GUI is accessed via insecure HTTP. This means that insecure HTTP sessions will end on [token expiry](#opschain_token_access_expiry) and you'll need to login again.

To prevent that, you can set this setting to `false` or connect to the OpsChain GUI via HTTPS.
:::

### OPSCHAIN_TOKEN_REFRESH_EXPIRY

Default value: _10080_

The number of minutes before a bearer refresh token expires.

## Change running settings

### `apiWorker.replicas`

Default value: _1_

The number of worker pods that will be deployed to process change and workflow steps.

:::note
The number of steps that can be processed by OpsChain is limited to the number of [threads per worker](#opschain_threads_per_worker) multiplied by this value. E.g. Two workers with five threads per worker can process ten steps concurrently.
:::

### `apiWorker.terminationGracePeriodSeconds`

Default value: _3600_

The time, in seconds, given to the worker pods to gracefully shutdown before they are forcefully terminated.

### `apiWorker.env`

Default value: _none_

Environment variables to be set for the API worker container.

### `mintModelStepsApi.env`

Default value: _none_

Environment variables to be set for the MintModel Steps API container.

### OPSCHAIN_PARALLEL_CHANGE_WORKER_STEPS

Default value: 10

The number of steps that can be run in parallel for a single change.

:::note
This option should not be set to a value greater than the number of [threads per worker](#opschain_threads_per_worker) multiplied by the [number of workers](#apiworkerreplicas).
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

There are two ways to customise the file: add entries via the `known_hosts` global setting (recommended), or fully replace the file with a custom config map.

#### Adding entries via the `known_hosts` setting

To _add_ trusted hosts without replacing the bundled file, set the [`known_hosts` setting](/key-concepts/settings.md#known_hosts) to an array of `known_hosts` lines. The entries are merged with the bundled defaults and are preserved across upgrades and redeploys. See the [`known_hosts` settings reference](/key-concepts/settings.md#known_hosts) for the full details.

#### Replacing the file with a custom config map

If you'd like to have support for other platforms, you can create a new config map with the desired contents and update this setting to use your custom config map name instead.

:::tip[_known_hosts_ file template]
You can use the following command to export the bundled `known_hosts` file to a YAML file as a template:

```bash
kubectl -n opschain get ConfigMap opschain-ssh-known-hosts -o yaml > custom-opschain-ssh-known-hosts.yaml
```

:::

You can then edit the exported resource, ensure you update the `metadata.name` field to a different config map name, and then update the file contents under the known_hosts key. Once the resource definition has been updated, use `kubectl` to create the custom config map:

```bash
kubectl -n opschain apply -f custom-opschain-ssh-known-hosts.yaml
```

Once the custom config map has been created, you can update the `OPSCHAIN_SSH_KNOWN_HOSTS_CONFIG_MAP` setting to use the custom config map name instead. After doing so, you need to restart the OpsChain API pod for the changes to take effect. In high availability setups, you'll need to make this change on all clusters.

### OPSCHAIN_THREADS_PER_WORKER

Default value: _5_<br/>
Minimum value: _2_

The number of threads each worker process will run. Note that increasing this number further may actually decrease concurrency due to context switching. We recommend that you consider increasing the [number of workers](#apiworkerreplicas) before considering increasing this value.

### OPSCHAIN_TRACE

Default value: _false_

If set to true, additional logging will be generated when changes are run, allowing for more detailed debugging of changes.

## Log aggregator settings

### `logAggregator.env`

Default value: _none_

Environment variables to be set for the log aggregator container.

## Image building settings

These settings define how OpsChain will build the Docker images for running changes.

### `buildService.env`

Default value: _none_

Environment variables to be set for the image build container.

### `buildService.rootless`

Default value: _true_

Whether to use the [Buildkit rootless mode](https://github.com/moby/buildkit/blob/master/docs/rootless.md#rootless-mode) for the image build container. Using rootless mode provides a more secure and isolated environment at the cost of build performance.

:::warning[Kernel version]
If you are using a kernel version older than 5.11, you'll also need to enable the `fuseDevicePlugin.enabled` setting.

You can check your kernel version by running the following command:

```bash
uname -a
```

:::

### `buildService.volume.size`

Default value: _50Gi_

Volume claim size for the image build container cache.

### `fuseDevicePlugin.enabled`

Default value: _false_

Whether to enable the FUSE device plugin used by the image build container. This is required for rootless mode to work on kernels older than 5.11. This will only have an effect if `buildService.rootless` is set to `true`.

:::tip
This will add a daemonset to the cluster. If the build service is stuck in a `Pending` state during an upgrade, delete the pod for the `fuse-device-plugin` and it will recover properly.
:::

### `fuseDevicePlugin.version`

Default value: _0.1.0_

The image tag of the FUSE device plugin to use.

### `fuseDevicePlugin.env`

Default value: _none_

Environment variables to be set for the FUSE device plugin container.

## Image registry settings

### External image registry settings

#### OPSCHAIN_DOCKER_USER

Default value: _none_

Docker Hub username to be used for accessing the OpsChain images on the external image registry.

#### OPSCHAIN_DOCKER_PASSWORD

Default value: _none_

Docker Hub password/token to be used for accessing the OpsChain images on the external image registry.

### Internal image registry settings

#### Image cleanup settings

To enable the automatic image cleanup from the internal image registry. See the [container image cleanup](/operations/maintenance/container-image-cleanup.md) guide for more details.

##### `registryReconcile.enabled`

Default value: _true_

Whether to enable the automatic image cleanup from the internal image registry.

##### `registryReconcile.schedule`

Default value: _`0 3 * * *`_

The cron expression to schedule the automatic image cleanup from the internal image registry.

##### `registryReconcile.successfulJobsHistoryLimit`

Default value: _1_

The number of successful job pods to keep.

##### `registryReconcile.failedJobsHistoryLimit`

Default value: _2_

The number of failed job pods to keep.

##### `registryReconcile.env`

Default value: _none_

Environment variables to be set for the registry reconcile job container.

#### OPSCHAIN_IMAGE_REGISTRY_HOST

Default value: _opschain-image-registry.local.gd_

Internally used hostname that needs to resolve to the Kubernetes node, but be different to the API hostname.

#### `trow.env`

Default value: _none_

Environment variables to be set for the internal image registry.

#### `imageCopyJob.env`

Default value: _none_

Environment variables to be set for the runner image job container.

## Ingress settings

### OPSCHAIN_INGRESS_TLS_PORT

Default value: _3443_

Ingress service port defined in the Kong controller. Used by the internal image registry and for HTTPS access to the API, GUI and the OpsChain secret vault. This should match the value in the `global.ingressTlsPort` setting.

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

:::info[Deploy-managed vs runtime-editable]
The settings that configure the bundled OpsChain LDAP server - `ldap.*`, `env.OPSCHAIN_LDAP_DOMAIN`, `env.OPSCHAIN_LDAP_ORGANISATION` and `env.OPSCHAIN_LDAP_LOG_LEVEL` - are provided via `values.yaml` at install time and are required when the bundled LDAP server is enabled.

The remaining LDAP settings configure how OpsChain connects to a LDAP server. They default to the bundled-server values on first install and can be updated via [system configuration](#post-install-system-configuration) afterwards.
:::

An example of configuring access to an external AD server is shown in the [OpsChain LDAP](/operations/opschain-ldap.md) guide.

### `ldap.env`

Default value: _none_

Environment variables to be set for the LDAP container.

OpsChain provides an LDAP server for authentication out-of-the-box. If you'd prefer to use your own LDAP server, follow the [OpsChain LDAP](/operations/opschain-ldap.md) guide to alter these settings. All the default values shown below refer to the out-of-the-box LDAP server that OpsChain provides.

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

:::warning[High availability setup]
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

:::info[OpsChain secret vault token]
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

When starting OpsChain for the first time, most of the settings above are stored in OpsChain's database and can be updated at any time via the OpsChain GUI or API. See the [API documentation](https://docs.opschain.io/api-docs#tag/System-configuration) for more details.

### Settings managed by the deployment

A defined set of settings is owned by the deployment. These are configured in your `values.yaml` file, applied at install or upgrade time, and cannot be edited via the OpsChain GUI or API. They are:

- API host and port
- Build service host and port
- Default vault settings
- Image registry host and internal host
- Image pull secret name
- Ingress TLS port
- Kubernetes namespace
- Rails environment, log level and max threads
- Server timing
- Timezone
- The bundled OpsChain LDAP server' settings

To change one of these, update your `values.yaml` file and redeploy. Every other setting listed in this guide is editable through the GUI or API after installation.

### Overriding a database setting from a deploy

Once a setting has been stored in the database, the value in your `values.yaml` file is no longer applied to it on subsequent deploys — the database is the source of truth and the setting is managed through the GUI or API. This can leave you stuck if a stored setting holds a value that prevents you from signing in to fix it, for example, a misconfigured authentication setting.

To recover, you can override any database-backed setting from a deploy by adding an environment variable to the `env` section of your `values.yaml` file, named `OPSCHAIN_OVERRIDE_` followed by the setting's variable name. For example, to force `OPSCHAIN_AUTH_STRATEGY` back to `local`:

```yaml
env:
  ...
  OPSCHAIN_OVERRIDE_AUTH_STRATEGY: local
```

For nested settings, use the same name as the setting's environment variable — for example `OPSCHAIN_OVERRIDE_LDAP_HOST` overrides the LDAP host. The override is re-applied to the setting every time the OpsChain API pod restarts.

Each time an override is applied, OpsChain records an event in the audit history, so the change is visible to administrators. Secret values are encrypted in the recorded event; non-secret values are shown in the clear.

:::warning
The override takes precedence while it is set, so any change you make to that setting via the GUI or API will be reverted on the next deploy. To recover, correct the setting via the GUI or API, then remove the `OPSCHAIN_OVERRIDE_` variable from your `values.yaml` file and redeploy so the setting can be managed normally again.
:::

:::note
Only editable (database-backed) settings can be overridden this way. [Settings managed by the deployment](#settings-managed-by-the-deployment) are already applied on every deploy, so they do not use this prefix.
:::

## What to do next

- With your `values.yaml` file ready, [install OpsChain](/setup/installation.md) and start using it.
