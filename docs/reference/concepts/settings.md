---
sidebar_position: 8
description: Altering project and environment specific settings.
---

# Settings

The project, environment and asset settings are stored in JSON format and allow you to specify configuration options that apply to changes and events within the node. Settings that are deemed sensitive (e.g. password, tokens) are automatically encrypted when saved.

The following configurations can be included in your project, environment or asset settings:

```json
{
  "data_retention": {
    "change_log_retention_days": -- see description below --,
    "event_retention_days": -- see description below --,
  },
  "notifications": -- see description below --
}
```

:::note
If a setting is configured at both the project, environment and asset levels, the asset setting will override the environment setting, which overrides the project settings.
:::

In addition to the settings listed above (that can be configured at the project, environment or asset level), projects can have an additional setting - `allow_parallel` which will be applied to all environments and assets in the project.

```json
{
  ...
  "allow_parallel": {
    "changes": -- see description below --,
    "runs_of_same_workflow": -- see description below --
  }
}
```

## Setting descriptions

### data_retention.change_log_retention_days

Default value: _not configured (OpsChain will retain all change logs)_

The number of days to retain change logs. See [change log retention](/operations/maintenance/data-retention.md#change-log-retention) for more information.

### data_retention.event_retention_days

Default value: _not configured (OpsChain will retain all events)_

The number of days to retain events. See [event retention](/operations/maintenance/data-retention.md#event-retention) for more information.

### job_retention_days

Default value: _not configured (OpsChain will retain all job history)_

The number of days to retain job history for a node. See [job history retention](/operations/maintenance/data-retention.md#job-history-retention) for more information.

### allow_parallel.changes

Default value: _false_

Whether to allow multiple changes to run within a single project, environment or asset. See [change execution options](/reference/concepts/changes.md#change-execution-options) in the changes reference guide for more information

### allow_parallel.runs_of_same_workflow

Default value: _false_

Whether to allow a workflow to be run multiple times in parallel. See [workflow execution options](/reference/concepts/workflows.md#workflow-execution-options) in the workflows reference guide for more information.

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

### notifications

Refer to [notifications](/operations/notifications.md) for the notifications configuration.

### vault

Default value: _not configured (will be using the default [vault configuration](/development-environment.md#optional-prerequisite---secret-vault-configuration))_

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
