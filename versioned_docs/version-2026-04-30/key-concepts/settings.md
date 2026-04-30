---
sidebar_position: 13
description: Altering project, environment, agent and asset specific settings.
---

# Settings

To help with customizing OpsChain to your needs, a number of settings can be configured at the global, project, environment, asset and change levels, each overriding the previous one. When a _default value_ is mentioned, it usually refers to the value automatically assigned to the global settings, which serve as a fallback and can be configured via the system configuration page in the GUI or at installation time, as described in the [configuration guide](/setup/configuration/index.md). Settings are stored in JSON format and the ones deemed sensitive (e.g. password, tokens) are automatically encrypted when saved.

The settings below can be configured at any level, unless otherwise specified.

:::tip
If you have `jq` installed you can use the following command to set the option programmatically:

```bash
opschain project show-settings -p <project code> | jq '. += { "allow_parallel": { "changes": true, "runs_of_same_change": true } }' > /tmp/updated_project_settings.json
opschain project set-settings -p <project code> -f /tmp/updated_project_settings.json -y
```

:::

## Agent settings

### agent.disable_host_alias

Default value: _false_

OpsChain configures a [`hostAlias`](https://kubernetes.io/docs/tasks/network/customize-hosts-file-for-pods/) for the [API hostname](/setup/configuration/additional-settings.md#envopschain_api_host_name-and-apihostname) in the pod for accessing the OpsChain API ingress from within the pod.

Setting this to `true` means this host alias will not be created. This may be necessary if you have a DNS entry for the API hostname that you want used because it needs to point to a different ingress than the OpsChain Kubernetes ingress.

### agent.script_path

Default value: _/opt/opschain/agent.sh_

The path to the script that will be launched upon starting an [agent](agents.md).

### Agent image settings

These settings modify the base `FROM` agent image, used to build agents. The agent image string is constructed in the following way:

```dockerfile
FROM {repository}/{name}:{image_tag}
```

#### agent.image_override

Default value: _not configured (there is no image override)_

This setting overrides the whole image string used in the `FROM` directive and hence the `name`, `repository`, and `image_tag` settings will be ignored. This allows you to provide an alternative image registry, for example: `https://customer-registry.example.com/customer/agent-image:version` or `ghcr.io/customer/agent-image:version`.

:::info
The `opschain-image-secret` secret in the Kubernetes cluster must have credentials for the registry to allow the OpsChain build service to pull the images.
:::

#### agent.image_tag

Default: _Current version, e.g. `2025-01-01`_.

The tag of the agent image.

#### agent.name

Default: _opschain-runner-enterprise_

The name of the agent image.

#### agent.repository

Default: _limepoint_

The repository where the agent image is stored. Refers to a Docker registry or a container image repository.

## Change and workflow execution settings

### dockerfile

Default value: _Dockerfile_

The filename to use for the `Dockerfile` for building the [custom step runner Dockerfile](/key-concepts/step-runner.md#custom-step-runner-dockerfiles) or the [agent](agents.md) image.

_This setting is ignored when using an agent template or asset template Dockefile because it takes higher priority._

### log_aggregator_additional_output_settings

Default value: _not configured (the default log aggregator configuration is used)_<br/>
Scope: _global_

Refer to the [log forwarding](/operations/log-forwarding.md) guide for the log aggregator configuration.

### parallel_change_worker_steps

Default value: _5_

The number of steps that can be run in parallel for a single change. This is only applicable when `pod_per_change_step` is set to `false`.

### pod_per_change_step

Default value: _false_

Defines whether OpsChain will use a single Kubernetes pod for running the entire change (value set to `false`) or if it will create one pod for each individual step (value set to `true`). This setting has no effect when running a change with a [MintModel](/key-concepts/assets.md#asset-templates-with-a-mintmodel).

:::tip Image settings
To configure the change runner or worker image, refer to the [runner image settings](/key-concepts/settings.md#runner-image-settings) when this is set to `true` or to the [worker settings](/key-concepts/settings.md#worker-settings) when it is `false`.
:::

### repo_folder

Default value: _.opschain_

Folder in the Git repository where OpsChain properties will be imported from when running a change.

### requires_approval_from

Default value: _not configured (changes do not require approval)_

Requires that changes in the relevant environment/project are approved by a specific user or a member of the configured LDAP group before they are executed. A user or a member of the specified LDAP group must approve the change before the change will execute any actions. If required, LDAP group members can use the GUI to reject changes that are waiting for approval.

You can provide multiple approvers containing users or LDAP groups in a comma-separated format. Any user or member of the supplied LDAP group can approve the change.

For example, the following setting will require a change to be approved by the `some_username` user or any user who is a member of the `an_ldap_group` LDAP group.

```json
{
  "requires_approval_from": {
    "user_names": [
      "some_username"
    ],
    "ldap_groups": [
      "an_ldap_group"
    ]
  }
}
```

### Parallelism settings

#### allow_parallel.changes

Default value: _true_<br/>
Scope: _global, project, environment, asset_

Whether to allow multiple changes to run within a single project, environment or asset. See [change execution options](/key-concepts/changes.md#change-execution-options) in the changes reference guide for more information.

#### allow_parallel.runs_of_same_change

Default value: _false_<br/>
Scope: _global, project, environment, asset_

Whether to allow multiple changes with the same name to run in parallel within a single project, environment or asset. See [change execution options](/key-concepts/changes.md#change-execution-options) in the changes reference guide for more information.

:::note
If the `allow_parallel.changes` setting is set to `false`, this setting will have no effect.
:::

:::note
This setting applies to each change’s direct target. For example, when `allow_parallel.runs_of_same_change` is `false` changes with the same name will be allowed to run concurrently in the `dev` and `test` environments of a project (as these are two distinct targets). However, two changes with the same name will not be allowed to run concurrently in the `dev` environment.

You can disable parallel changes entirely by setting `allow_parallel.changes` to `false`.
:::

#### allow_parallel.runs_of_same_workflow

Default value: _false_<br/>
Scope: _global, project_

Whether to allow a workflow to be run multiple times in parallel.

## MintModel executor image settings

These settings modify the base `FROM` MintModel executor image, used to build change step runners. The MintModel executor image string is constructed in the following way:

```dockerfile
FROM {repository}/{name}:{image_tag}
```

:::info
MintModel executor pods are only used when running a change of an [asset with a MintModel](/key-concepts/assets.md#asset-templates-with-a-mintmodel).
:::

### mintmodel_executor.image_override

Default value: _not configured (there is no image override)_

This setting overrides the whole image string used in the `FROM` directive and hence the `name`, `repository`, and `image_tag` settings will be ignored. This allows you to provide an alternative image registry, for example: `https://customer-registry.example.com/customer/mintmodel-image:version` or `ghcr.io/customer/mintmodel-image:version`.

:::info
The Kubernetes cluster running OpsChain must be able to pull images from the specified registry. [Learn more](https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/).

The `opschain-image-secret` secret in the Kubernetes cluster must have credentials for the registry to allow the OpsChain build service to pull the images. This isn't necessary to override the image for a single change.
:::

### mintmodel_executor.image_pull_policy

Default value: _not configured (the Kubernetes cluster default pull policy is used)_

The image pull policy for the MintModel step executor. [Learn more](https://kubernetes.io/docs/concepts/containers/images/#image-pull-policy).

### mintmodel_executor.image_tag

Default: _Current version, e.g. `2025-01-01`_.

The tag of the MintModel executor image.

### mintmodel_executor.name

Default: _opschain-runner-enterprise_

The name of the MintModel executor image.

### mintmodel_executor.repository

Default: _limepoint_

The repository where the MintModel executor image is stored. Refers to a Docker registry or a container image repository.

## Notifications

Refer to [notifications](/operations/notifications.md) for the notifications configuration.

## Runner image settings

These settings modify the base `FROM` runner image, used to build change step runners. The runner image string is constructed in the following way:

```dockerfile
FROM {repository}/{name}:{image_tag}
```

:::info
Change runners are only used when `pod_per_change_step` is set to `true` when running a change.
:::

### runner.image_override

Default value: _not configured (there is no image override)_

This setting overrides the whole image string used in the `FROM` directive and hence the `name`, `repository`, and `image_tag` settings will be ignored. This allows you to provide an alternative image registry, for example: `https://customer-registry.example.com/customer/runner-image:version` or `ghcr.io/customer/runner-image:version`.

:::info
The Kubernetes cluster running OpsChain must be able to pull images from the registry. [Learn more](https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/).

The `opschain-image-secret` secret in the Kubernetes cluster must have credentials for the registry to allow the OpsChain build service to pull the images.
:::

### runner.image_tag

Default: _Current version, e.g. `2025-01-01`_.

The tag of the runner image.

### runner.name

Default: _opschain-runner-enterprise_

The name of the runner image.

### runner.repository

Default: _limepoint_

The repository where the runner image is stored. Refers to a Docker registry or a container image repository.

## Vault settings

Default value: _not configured (will be using the [default vault configuration](/setup/configuration/additional-settings.md#secret-vault-settings))_

Overrides the vault configuration at the node level. This is useful for when you have different vault configurations across different projects and environments (e.g. different vault config for `development` and `production` environments). When running a change, all property secrets will be decrypted using the vault settings of the change's parent.

Some examples of valid vault configurations:

```json
{
  "vault": {
    "address": "http://a-vault-address",
    "auth_method": "token",
    "token": "token-value"
  }
}
```

```json
{
  "vault": {
    "address": "http://a-vault-address",
    "auth_method": "userpass",
    "user": "user",
    "password": "password"
  }
}
```

:::note Credential visibility
The `user`, `password`, and `token` fields will be automatically encrypted once the setting is saved.
:::

### vault.address

Default value: _none_

The address of the vault to use, for example `http://vault.example.com:8200`.

### vault.auth_method

Default value: _none_<br/>
Accepted values: _token, userpass, ldap_

The authentication method to use.

### vault.client_options

Default value: _none_

A JSON object containing options to use when communicating with the external vault client. Available keys include:

- `ssl_pem_file`: The path to the SSL PEM file to use. The file must be in the image used by the OpsChain API deployment.
- `ssl_pem_passphrase`: The passphrase to use when decrypting the SSL PEM file.
- `ssl_ca_cert`: The path to the SSL certificate authority file to use. The file must be in the image used by the OpsChain API deployment.
- `ssl_timeout`: The timeout for the SSL connection in seconds.
- `ssl_verify`: Whether to verify the SSL certificate of the vault server. Defaults to `true`.

### vault.mount_path

Default value: _none_

The mount path for the KV secret store in the external secret vault.

### vault.password

Default value: _none_

The password to use when authenticating with the external secret vault when using the `userpass` authentication method.

### vault.token

Default value: _none_

The token to use when authenticating with the external secret vault.

### vault.username

Default value: _none_

The username to use when authenticating with the external secret vault when using the `userpass` authentication method.

### vault.use_mint_encryption

Default value: _none_

Whether to use OpsChain's encryption to encrypt the values before storing them in the external secret vault. If this is set to true, the values will be encrypted twice.

## Worker settings

These settings only apply when running a change with `pod_per_change_step` set to `false` or when running a change with a [MintModel](/key-concepts/assets.md#asset-templates-with-a-mintmodel).

### remove_change_worker_pod

Default value: _true_

Setting that enables the change worker / MintModel executor pod to be left running once the change finishes so we can execute into them and perform debug operations.

### worker.reuse_actions_rb

Default value: _true_

Improves change performance by only loading the actions defined in the `actions.rb` once. This means that code at the top level of the file can't change - e.g. you can't define a variable at the top level and attempt to change it between steps. This can still be done within an action.

```ruby
top_level_var = rand > 0.5 ? something : something_else # this wouldn't work as expected because the value wouldn't change

action :test do
  var = rand > 0.5 ? something : something_else # this would work because it would be run in the action
end
```

### Worker image settings

These settings modify the base `FROM` worker image, used to build change runners. The worker image string is constructed in the following way:

```dockerfile
FROM {repository}/{name}:{image_tag}
```

:::info
Change workers are only used when `pod_per_change_step` is set to `false` when running a non-MintModel change.
:::

#### worker.image_override

Default value: _not configured (there is no image override)_

This setting overrides the whole image string used in the `FROM` directive and hence the `name`, `repository`, and `image_tag` settings will be ignored. This allows you to provide an alternative image registry, for example: `https://customer-registry.example.com/customer/worker-image:version` or `ghcr.io/customer/worker-image:version`.

:::info
The Kubernetes cluster running OpsChain must be able to pull images from the registry. [Learn more](https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/).

The `opschain-image-secret` secret in the Kubernetes cluster must have credentials for the registry to allow the OpsChain build service to pull the images.
:::

#### worker.image_tag

Default: _Current version, e.g. `2025-01-01`_.

The tag of the worker image.

#### worker.name

Default: _opschain-mintmodel-executor_

The name of the worker image.

#### worker.repository

Default: _limepoint_

The repository where the worker image is stored. Refers to a Docker registry or a container image repository.
