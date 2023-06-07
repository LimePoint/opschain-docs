---
sidebar_position: 2
description: OpsChain configuration to automate the removal of old change logs and events.
---

# Data retention

As part of system maintenance, it is recommended that the OpsChain change logs and event retention periods be enabled and configured to limit disk usage. After following this guide you should know how to:

- automatically remove old change logs and events
- configure change log and event retention
- change when the removal job runs

## Retention configuration

By default, OpsChain retains all change logs and events; i.e. it does not automatically remove this data based upon age.

### Event retention

Configuring the event retention setting means that events older than the configured number of days will be removed.

### Change log retention

Configuring the change log storage retention setting means that any logs older than the configured number of days will be removed. The logs are removed based on the change finish time. After a change's logs have been removed, any request for those logs (for example using `opschain change show-logs`) will return an error rather than the logs.

### Global

The global retention setting is used if a project or environment setting is not present. It can be configured by setting the `OPSCHAIN_CHANGE_LOG_RETENTION_DAYS` and/or `OPSCHAIN_EVENT_RETENTION_DAYS` environment variables in the `.env` file.

:::note
Update OPSCHAIN_CHANGE_LOG_RETENTION_DAYS or OPSCHAIN_EVENT_RETENTION_DAYS in your `.env` to the desired value - adding the key if it is not present.
:::

```bash
vi .env
opschain server configure
opschain server deploy
```

### Project/environment

The global retention setting can be overridden by creating a `change_log_retention_days` or an `event_retention_days` setting within the appropriate project or environment. Similar to [properties](../../reference/concepts/properties.md), environment settings will override project settings.

Use the `opschain project|environment edit-settings` command to edit the project or environment settings. Below is an example JSON to configure the retention settings:

```json
{
  "change_log_retention_days": 30,
  "event_retention_days": 7,
  ...
}
```

:::note NOTES

-Setting the retention days to `0` will mean the change logs or events will be removed each time the removal job runs.
-Setting can retention days to `null` will disable log or event removal in this project or environment, overriding a higher level setting.

:::

## Removal job configuration

The change log and event removal job runs daily by default.

The `OPSCHAIN_CLEAN_OLD_DATA_JOB_CRON` environment variable can be set in `.env` to change when/how the job runs.

For example, the removal job could be configured to only run on weekends as follows:

```bash
echo "OPSCHAIN_CLEAN_OLD_DATA_JOB_CRON='0 23 * * 6-7'" >> .env
opschain server configure
opschain server deploy
```

[crontab.guru](https://crontab.guru/) is a useful tool for creating cron rules.

Setting `OPSCHAIN_CLEAN_OLD_DATA_JOB_CRON=never` will prevent the log removal job from running.

## See also

The OpsChain log aggregator can be configured to forward change logs to external log storage. See the [OpsChain change log forwarding](../log-forwarding.md) guide for details.
