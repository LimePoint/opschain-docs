---
sidebar_position: 2
description: OpsChain configuration to automate the removal of old change logs and events.
---

# Data retention

As part of system maintenance, it is recommended that the OpsChain change logs, events and job history retention periods be enabled and configured to limit disk usage. After following this guide you should know how to:

- automatically remove old change logs, events and job history
- configure change log, event and job history retention period
- change when the removal job runs

## Retention configuration

By default, OpsChain retains all change logs, events and jobs; i.e. it does not automatically remove this data based upon age.

### Event retention

Configuring the event retention setting means that events older than the configured number of days will be removed.

### Change log retention

Configuring the change log storage retention setting means that any logs older than the configured number of days will be removed. The logs are removed based on the change finish time. After a change's logs have been removed, any request for those logs (for example using `opschain change show-logs`) will return an error rather than the logs.

### Job history retention

Configuring the job history retention setting means that any job history older than the configured number of days will be removed. The jobs are removed based on their finish time.

### Global

The global retention setting is used if a project, environment or asset setting is not present. It can be configured by updating the system configuration for `data_retention.change_log_retention_days`, `data_retention.event_retention_days` and/or `data_retention.job_retention_days` settings. See the [system configuration](/operations/configuring-opschain.md#system-configuration) for more details.

```bash
vi .env
opschain server configure
opschain server deploy
```

### Project/environment/asset

The global retention setting, set to `null` by default, can be overridden by creating a `data_retention.change_log_retention_days`, a `data_retention.event_retention_days` or a `data_retention.job_retention_days` setting within the appropriate project, environment or asset. Similar to [properties](/reference/concepts/properties.md), environment settings will override project settings.

Use the `opschain project|environment|asset edit-settings` command to edit the project, environment or asset settings. Below is an example JSON to configure the retention settings:

```json
{
  "data_retention": {
    "change_log_retention_days": 30,
    "event_retention_days": 7,
    "job_retention_days": 90
  }
  ...
}
```

:::note NOTES

- Setting the retention days to `0` will mean the change logs, events or job history will be removed each time the removal job runs.
- Setting the retention days to `null` will disable log, event or job history removal in this project, environment or asset, overriding a higher level setting.

:::

## Removal job configuration

By default, the variable is set as `OPSCHAIN_CLEAN_OLD_DATA_JOB_CRON=never`, which will prevent the log removal job from running.

The `clean_old_data_job_cron` system configuration setting can be updated to change when/how the job runs.

For example, the removal job could be configured to only run on weekends with the following Cron rule: `0 23 * * 6-7`.

[crontab.guru](https://crontab.guru/) is a useful tool for creating cron rules.

:::warning
If an invalid cron string is provided for this variable, the OpsChain API and worker pods will fail to start.
:::

## See also

The OpsChain log aggregator can be configured to forward change logs to external log storage. See the [OpsChain change log forwarding](/operations/log-forwarding.md) guide for details.
