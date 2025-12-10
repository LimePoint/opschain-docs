---
sidebar_position: 12
description: Altering project, environment and asset specific settings.
---

# Settings

The project, environment and asset settings are stored in JSON format and allow you to specify configuration options that apply to changes and events within the node. Settings that are deemed sensitive (e.g. password, tokens) are automatically encrypted when saved. Settings can be configured at the project, environment or asset level.

The following configurations can be included in your project, environment or asset settings:

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
If a setting is configured at both the project, environment and asset levels, the asset setting will override the environment setting, which overrides the project settings.
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

The filename to use for the `Dockerfile` for building the [custom step runner Dockerfile](/docs/key-concepts/step-runner#custom-step-runner-dockerfiles).

_This setting is ignored when using an asset template Dockefile because it takes higher priority._

### log_aggregator_additional_output_settings

Refer to [log forwarding](/administration/log-forwarding.md) for the log aggregator configuration.

### notifications

Refer to [notifications](/administration/notifications.md) for the notifications configuration.

### pod_per_change_step

Default value: _false_

Defines whether OpsChain will use a single Kubernetes pod for running the entire change (value set to `false`) or if it will create one pod for each individual step (value set to `true`).

### remove_change_worker_pod

Default value: _false_

Setting that enables the change worker / MintModel executor pod to be left running once the change finishes so we can execute into them and perform debug operations.

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
  "requires_approval_from": "some_username, an_ldap_group"
}
```

### runner.image_tag

Default: _Current version, e.g. `2025-01-01`_.

Override the base `FROM` runner image tag, used to build change step runners.

### runner.name

Default: _opschain-runner_ (or _opschain-runner-enterprise_ for enterprise users)

Override the base `FROM` runner image name, used to build change step runners.

### runner.repository

Default: _limepoint_

Override the base `FROM` runner image repository, used to build change step runners.

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
