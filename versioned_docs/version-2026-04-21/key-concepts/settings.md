---
sidebar_position: 13
description: Altering project, environment, agent and asset specific settings.
---

# Settings

The project, environment, agent and asset settings are stored in JSON format and allow you to specify configuration options that apply to changes and events within the node. Settings that are deemed sensitive (e.g. password, tokens) are automatically encrypted when saved. Settings can be configured at the project, environment, agent or asset level.

The following configurations can be included in your project, environment, agent or asset settings:

```json
{
  "allow_parallel": {
    "changes": -- see description below --,
    "runs_of_same_change": -- see description below --
  },
  "requires_approval_from": -- see description below --,
  "log_aggregator_additional_output_settings": -- see description below --,
  "notifications": -- see description below --,
  "repo_folder": -- see description below --,
  "pod_per_change_step": -- see description below --,
  "remove_change_worker_pod": -- see description below --,
  "vault": -- see description below --
}
```

:::note
If a setting is configured at the project, environment and asset levels, the asset setting will override the environment setting, which overrides the project settings.
:::

In addition to the settings listed above (that can be configured at the project, environment or asset level), projects can have an additional setting - `allow_parallel.runs_of_same_workflow` which will affect workflow runs within that project.

```json
{
  ...
  "allow_parallel": {
    "runs_of_same_workflow": -- see description below --
  }
}
```

:::tip
If you have `jq` installed you can use the following command to set the option programmatically:

```bash
opschain project show-settings -p <project code> | jq '. += { "allow_parallel": { "changes": true, "runs_of_same_change": true } }' > /tmp/updated_project_settings.json
opschain project set-settings -p <project code> -f /tmp/updated_project_settings.json -y
```

:::

## Setting descriptions

### agent.disable_host_alias

Default value: _false_

OpsChain configures a [`hostAlias`](https://kubernetes.io/docs/tasks/network/customize-hosts-file-for-pods/) for the [API hostname](/setup/configuration/additional-settings.md#envopschain_api_host_name-and-apihostname) in the pod for accessing the OpsChain API ingress from within the pod.

Setting this to `true` means this host alias will not be created. This may be necessary if you have a DNS entry for the API hostname that you want used because it needs to point to a different ingress than the OpsChain Kubernetes ingress.

### agent.script_path

Default value: _/opt/opschain/agent.sh_

The path to the script that will be launched upon starting an [agent](agents.md).

### agent.image_tag

Default: _Current version, e.g. `2025-01-01`_.

Override the base `FROM` agent image tag, used to build agents.

### agent.name

Default: _opschain-runner-enterprise_

Override the base `FROM` agent image name, used to build agents.

### agent.repository

Default: _limepoint_

Override the base `FROM` agent image repository, used to build agents.

### agent.image_override

Default value: _not configured (there is no image override)_

Override the base `FROM` agent image.

This overrides the whole image string and hence overrides the `name`, `repository`, and `image_tag`.

This is set to a full image name, e.g. `https://internal-registry/customer/agent-image:version`.

:::info

Note: The `opschain-image-secret` secret in the Kubernetes cluster must have credentials for the registry to allow the OpsChain build service to pull the images.

:::

### allow_parallel.changes

Default value: _true_

Whether to allow multiple changes to run within a single project, environment or asset. See [change execution options](/key-concepts/changes.md#change-execution-options) in the changes reference guide for more information.

### allow_parallel.runs_of_same_change

Default value: _false_

Whether to allow multiple changes with the same name to run in parallel within a single project, environment or asset. See [change execution options](/key-concepts/changes.md#change-execution-options) in the changes reference guide for more information.

:::note
If the `allow_parallel.changes` setting is set to `false`, this setting will have no effect.
:::

:::note
This setting applies to each change’s direct target. For example, when `allow_parallel.runs_of_same_change` is `false` changes with the same name will be allowed to run concurrently in the `dev` and `test` environments of a project (as these are two distinct targets). However, two changes with the same name will not be allowed to run concurrently in the `dev` environment.

You can disable parallel changes entirely by setting `allow_parallel.changes` to `false`.
:::

### allow_parallel.runs_of_same_workflow

Default value: _false_

Whether to allow a workflow to be run multiple times in parallel.

### dockerfile

Default value: _Dockerfile_

The filename to use for the `Dockerfile` for building the [custom step runner Dockerfile](/key-concepts/step-runner.md#custom-step-runner-dockerfiles) or the [agent](agents.md) image.

_This setting is ignored when using an agent template or asset template Dockefile because it takes higher priority._

### log_aggregator_additional_output_settings

Refer to [log forwarding](/operations/log-forwarding.md) for the log aggregator configuration.

### mintmodel_executor.image_tag

Default: _Current version, e.g. `2025-01-01`_.

Override the base `FROM` MintModel executor tag, used to build change step runners.

### mintmodel_executor.name

Default: _opschain-runner_ (or _opschain-runner-enterprise_ for enterprise users)

Override the base `FROM` MintModel executor image name, used to build change step runners.

### mintmodel_executor.repository

Default: _limepoint_

Override the base `FROM` MintModel executor image repository, used to build change step runners.

### mintmodel_executor.image_override

Default value: _not configured (there is no image override)_

Override the `FROM` MintModel executor image, and the MintModel step executor image.

This overrides the whole image string and hence overrides the `name`, `repository`, and `image_tag`.

This is set to a full image name, e.g. `https://internal-registry/customer/mintmodel-image:version`.

:::info

Note: The Kubernetes cluster running OpsChain must be able to pull images from the registry. [Learn more](https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/).

:::

:::info

Note: The `opschain-image-secret` secret in the Kubernetes cluster must have credentials for the registry to allow the OpsChain build service to pull the images. This isn't necessary to override the image for a single change.

:::

### mintmodel_executor.image_pull_policy

Default value: _not configured (the Kubernetes cluster default pull policy is used)_

Override the image pull policy for the MintModel step executor.

### notifications

Refer to [notifications](/operations/notifications.md) for the notifications configuration.

### pod_per_change_step

Default value: _false_

Defines whether OpsChain will use a single Kubernetes pod for running the entire change (value set to `false`) or if it will create one pod for each individual step (value set to `true`).

### remove_change_worker_pod

Default value: _true_

Setting that enables the change worker / MintModel executor pod to be left running once the change finishes so we can execute into them and perform debug operations.

### worker.reuse_actions_rb

Default value: _true_

When `pod_per_change_step` is false, only load the actions defined in the `actions.rb` once. This improves change performance, but means that code at the top level of the file can't change - e.g. you can't define a variable at the top level and attempt to change it between steps. This can still be done within an action.

```ruby
top_level_var = rand > 0.5 ? something : something_else # this wouldn't work as expected because the value wouldn't change

action :test do
  var = rand > 0.5 ? something : something_else # this would work because it would be run in the action
end
```

### repo_folder

Default value: _opschain_

Folder in the Git repository where OpsChain properties will be imported from when running a change.

### requires_approval_from

Default value: _not configured (changes do not require approval)_

Requires that changes in the relevant environment/project are approved by a specific user or a member of the configured LDAP group before they are executed. A user or a member of the specified LDAP group must approve the change (e.g. using `opschain change approve` in the CLI) before the change will execute any actions. If required, LDAP group members can use the CLI command `opschain change reject` to reject changes that are waiting for approval.

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

### runner.image_tag

Default: _Current version, e.g. `2025-01-01`_.

Override the base `FROM` runner image tag, used to build change step runners.

### runner.name

Default: _opschain-runner-enterprise_

Override the base `FROM` runner image name, used to build change step runners.

### runner.repository

Default: _limepoint_

Override the base `FROM` runner image repository, used to build change step runners.

### runner.image_override

Default value: _not configured (there is no image override)_

Override the base `FROM` runner image.

This overrides the whole image string and hence overrides the `name`, `repository`, and `image_tag`.

This is set to a full image name, e.g. `https://internal-registry/customer/runner-image:version`.

:::info

Note: The Kubernetes cluster running OpsChain must be able to pull images from the registry. [Learn more](https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/).

:::

:::info

Note: The `opschain-image-secret` secret in the Kubernetes cluster must have credentials for the registry to allow the OpsChain build service to pull the images.

:::

### vault

Default value: _not configured (will be using the default [vault configuration](/advanced/development-environment.md#optional-prerequisite---secret-vault-configuration))_

Overrides the vault configuration at the node level. This is used when you have different vault configurations across different projects and environments (e.g. different vault config for `development` and `production` environments).
When running a change, all property secrets will be decrypted using the vault settings of the change's parent.

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

### worker.image_tag

Default: _Current version, e.g. `2025-01-01`_.

Override the base `FROM` worker image tag, used to build change step runners.

### worker.name

Default: _opschain-runner_ (or _opschain-runner-enterprise_ for enterprise users)

Override the base `FROM` worker image name, used to build change step runners.

### worker.repository

Default: _limepoint_

Override the base `FROM` worker image repository, used to build change step runners.

### worker.image_override

Default value: _not configured (there is no image override)_

Override the base `FROM` worker image.

This overrides the whole image string and hence overrides the `name`, `repository`, and `image_tag`.

This is set to a full image name, e.g. `https://internal-registry/customer/worker-image:version`.

:::info

Note: The Kubernetes cluster running OpsChain must be able to pull images from the registry. [Learn more](https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/).

:::

:::info

Note: The `opschain-image-secret` secret in the Kubernetes cluster must have credentials for the registry to allow the OpsChain build service to pull the images.

:::
