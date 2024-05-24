---
sidebar_position: 8
description: Altering project and environment specific settings.
---

# Settings

The project and environment settings are stored in JSON format and allow you to specify configuration options that apply to changes and events within the project or environment. The following settings can be included in your project or environment:

```json
{
  "change_log_retention_days": -- see description below --,
  "event_retention_days": -- see description below --,
  "notifications": {
    "failure": {
      "target_url": -- see description below --
    }
  }
}
```

:::note
If a setting is configured at both the project and environment level, the environment setting will override the project setting.
:::

In addition to the settings listed above (that can be configured at the project or environment level), the project settings can also include an `environments` key, with configuration options that will be applied to all environments in the project. Currently, the `allow_parallel_changes` option is the only setting that can be configured under the `environments` key:

```json
{
  ...
  "environments": {
    "allow_parallel_changes": -- see description below --
  }
}
```

## Setting descriptions

### change_log_retention_days

Default value: _not configured (OpsChain will retain all change logs)_

The number of days to retain change logs. See [change log retention](/docs/operations/maintenance/data-retention.md#change-log-retention) for more information.

### event_retention_days

Default value: _not configured (OpsChain will retain all events)_

The number of days to retain events. See [event retention](/docs/operations/maintenance/data-retention.md#event-retention) for more information.

### allow_parallel_changes

Default value: _false_

Whether to allow multiple changes to run within a single environment or not. See [change execution options](changes.md#change-execution-options) in the changes reference guide for more information

### requires_approval_from

Default value: _not configured (changes do not require approval)_

Requires that changes in the relevant environment/project are approved by a member of the configured LDAP group before they are executed. A member of the specified LDAP group must approve the change (e.g. using `opschain change approve` in the CLI) before the change will execute any actions. If required, LDAP group members can use the CLI command `opschain change reject` to reject changes that are waiting for approval.
