---
sidebar_position: 10
description: Sending notifications to other mediums such as Slack or email.
---

# Notifications

OpsChain can be configured to send notifications via email, [Slack](https://slack.com/), or [Teams](https://teams.microsoft.com/). Notifications can be sent on activity start, success, failure, and cancel events.

<!--
:::note

For enterprise projects, these event notifications include workflow runs. Additionally, notifications can be sent on workflow wait step events (e.g. continue, approve, and reject).

:::
-->

If you would like OpsChain to provide notification for other change or workflow events, please [let us know](mailto:opschain-support@limepoint.com).

## Notifications configuration

OpsChain allows activity `on_failure`, `on_success`, `on_start`, and `on_cancel` notifications to be sent to the following services:

- Email - after configuring the [mail server](/administration/notifications.md#email) in the notification channels
- Slack - after configuring the [Slack](/administration/notifications.md#slack) service url in the notification channels
- Teams - after configuring the [Teams](/administration/notifications.md#teams) service url in the notification channels

`opschain project|environment edit-settings`

```json
{
  "notifications": {
    "channels": [...],
    "events": {
       "change": {
          "all_events": null,
          "notify_to": {
            "via_slack": null,
            "via_email": "workflows@limepoint.com"
          },
          "on_start": {
            "notify_to": {
              "via_teams": null,
              "via_email": "another@limepoint.com"
            }
          },
          "on_success": {
            "notify_to": {
              "via_slack": "another-slack-channel"
            }
          },
          "on_failure": {
            "notify_to": {
              "via_slack": "failure-channel"
            }
          },
          "on_cancel": {
            "notify": false
          }
       },
       "workflow_run": {
          "all_events": {
            "notify": true,
            "notify_to": {
              "via_slack": null,
              "via_teams": null,
              "via_email": {
                 "mail_server": "for-workflow-runs",
                 "address": "workflows@limepoint.com"
              }
            }
          }
       }
    }
  }
  ...
}
```

:::note
For workflow runs, additional events include `on_continue` on a wait step, and `on_reject` and `on_approve` on an approval step.

:::

:::tip
If you prefer to receive notifications on all the events, you can use `all_events` rather than supplying each `on_` event in the notifications.

:::

:::tip
If you have Apprise [installed](https://github.com/caronc/apprise#installation), you can test your notification configuration by running the following command locally:

```bash
apprise -vv --title='Test message' "{{target url}}" # e.g. slack://TokenA/TokenB/TokenC/
```

:::

### Overriding notification events

#### Change notifications

By default, activities that run will inherit the notification configuration of its parent. However, you may prefer to customise the notification on a change level.

You can override the notification event configuration of a change by supplying these in the `notifications -> events` in the `metadata` when creating a change.

e.g.

```json
{
  "metadata": {
    "notifications": {
      "events": {
        "on_failure": null, // or empty string
        "notify_to": {
            "via_email": "changes@limepoint.com"
        }
      }
    }
    ...
  }
}
```

Note that this will override (not merge) the notification event in the settings. In the above example, the newly created change will only send a notification on a `failure` event.
You'll only need to specify the event key (e.g. `on_failure`) to subscribe to that notification event, hence, null or empty string values will be accepted.

#### Workflow notifications

Workflow notifications can also be supplied directly on the workflow.

e.g.

```yaml
name: Sample workflow with notifications
description:
notifications:
  notify_to:
    via_slack: workflow-notifications
    via_teams:
    via_email: workflows@limepoint.com
  on_start:
    notify_to:
      via_slack: workflow-start-notifications
  on_failure:
steps:
  - type: change
    target:
    action:
    notifications:
      on_failure:
      on_start:
        notify_to:
          via_slack: change-notifications
  - type: wait
    name: An approval step
    requires_approval_from:
    notifications:
      notify_to:
        via_email: approvals@limepoint.com
      on_approve:
      on_reject:
  - type: wait
    name: A wait step
    notifications:
      on_continue:
```

| Event                   | Email notification                               | Slack notification                                   | Teams notification    |
| ----------------------- | ------------------------------------------------ | ---------------------------------------------------- | --------------------- |
| Workflow run start      | workflows@limepoint.com                          | workflow-notifications, workflow-start-notifications | Default teams channel |
| Workflow run failure    | workflows@limepoint.com                          | workflow-notifications                               | Default teams channel |
| Change step start       | workflows@limepoint.com                          | workflow-notifications, change-notifications         | Default teams channel |
| Change step failure     | workflows@limepoint.com                          | workflow-notifications                               | Default teams channel |
| Approval step approval  | workflows@limepoint.com, approvals@limepoint.com | workflow-notifications                               | Default teams channel |
| Approval step rejection | workflows@limepoint.com, approvals@limepoint.com | workflow-notifications                               | Default teams channel |
| Wait step continue      | workflows@limepoint.com                          | workflow-notifications                               | Default teams channel |

The email notifications will be sent using the [configured](notifications#email) mailbox in the notifications channels (or the default one if there are multiple mailboxes configured).
If you need to specify a different mailbox for a workflow, you can do so using the following format:

```yaml
notifications:
  notify_to:
    via_email:
      mail_server: mail_server_1
      address: workflows@limepoint.com, another@limepoint.com
```

### Adding another service to a specific event

By default, all `notify_to` configurations are merged. Consider the below example:

```json
{
  "notifications": {
    "events": {
       "change": {
          "all_events": null,
          "notify_to": {
            "via_slack": null,
            "via_email": "workflows@limepoint.com"
          },
          "on_start": {
            "notify_to": {
              "via_teams": null,
              "via_email": "another@limepoint.com"
            }
          }
       }
    }
  }
  ...
}
```

In the above example, when a change `on_start` event triggers, notifications will be sent to the default slack channel, the default teams channel, and an email will be sent to workflows@limepoint.com and another@limepoint.com.
For the other events, it will only send notifications to the default slack channel and the email will be sent only to workflows@limepoint.com.

:::note
For workflow runs, you can declare the `notify_to` services at a workflow level. If notifications are enabled on a workflow step, they will send the notifications to the services defined in the workflow step (if supplied) and in the workflow.

:::

### Example notification configurations

#### Email

1. Configure the SMTP mail server in the notification channels. e.g.

    ```json
    {
      "notifications": {
        "channels": [
          {
            "type": "email",
            "name": "mail_server_1",
            "address": "smtp.gmail.com",
            "port": 587,
            "domain": "example.com",
            "user_name": "user",
            "password": "password",
            "authentication": "plain",
            "enable_starttls": true,
            "open_timeout": 5,
            "read_timeout": 5,
            "default": true
          }
        ],
        ...
      },
      ...
    }
    ```

    :::note
    The `user_name` and `password` fields are automatically encrypted once the settings are saved.

    :::

2. Once configured, send notifications to email addresses using `notify_to` -> `via_email`

    ```json
    {
      "notifications": {
        "events": {
          "change": {
             "notify_to": {
               "via_email": "workflows@limepoint.com" // comma-separated
             }
          }
        }
      },
      ...
    }
    ```

    The notification will attempt to send to workflows@limepoint.com using the default mail server settings.

3. If you have multiple mail servers configured in the notification channels, you can override which mail server to use by using `via_email` -> `mail_server`. In this format, you will need to supply the email addresses in the `via_email` -> `address`.

    ```json
    {
      "notifications": {
        "events": {
          "change": {
             "notify_to": {
               "via_email": {
                 "address": "workflows@limepoint.com", // comma-separated
                 "mail_server": "mail_server_2"
               }
             }
          }
        }
      },
      ...
    }
    ```

    This notification will attempt to send workflows@limepoint.com using the "mail_server_2" mail server configuration.

    :::note
    If you only have one mail server configured, it will automatically be considered as the default email setting. Otherwise, you will need to specify which one is the default so you can use the shortcut version of the `via_email` notification.
    :::

#### [Slack](https://slack.com/)

Slack's incoming webhook URL can be used to receive messages from OpsChain. Complete the following steps to configure OpsChain to send a message to a Slack channel on an activity event:

1. Create an incoming webhook URL. You can create it in different ways, via a [legacy integration](https://my.slack.com/services/new/incoming-webhook/), or via a [Slack app](https://api.slack.com/slack-apps).
2. Save the generated URL or token.
3. Add it to the notification channels.

    ```json
    {
      "notifications": {
        "channels": [
          {
            "type": "slack",
            "name": "a-slack-channel",
            "token": "slack://token/#a-slack-channel",
            "default": true
          },
          ...
        ]
      },
      ...
    }
    ```

    :::note
    The `token` field will be automatically encrypted once the settings are saved.
    :::

4. Once configured, send notifications to the slack channel using `notify_to` -> `via_slack`

    ```json
    {
      "notifications": {
        "events": {
          "change": {
             "notify_to": {
               "via_slack": null
             }
          }
        }
      },
      ...
    }
    ```

    This will send a notification to the default slack channel.

5. If you have multiple slack channels configured, you can supply them as well to send notifications to these channels

    ```json
    {
      "notifications": {
        "events": {
          "change": {
             "notify_to": {
               "via_slack": "slack-channel-1, slack-channel-1" // comma-separated
             }
          }
        }
      },
      ...
    }
    ```

    :::note
    If you only have one slack service configured, it will automatically be considered as the default slack channel.
    :::

#### [Teams](https://teams.microsoft.com/)

Microsoft Teams' incoming webhook URL can be used to receive messages from OpsChain. Complete the following steps to configure OpsChain to send a message to a Teams channel on an activity event:

1. Create an [incoming webhook URL](https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook?tabs=newteams%2Cdotnet#create-an-incoming-webhook).
2. Save the generated URL or token.
3. Add it to the notification channels.

    ```json
    {
      "notifications": {
        "channels": [
          {
            "type": "teams",
            "name": "a-teams-channel",
            "token": "teams://token/#a-teams-channel",
            "default": true
          },
          ...
        ]
      },
      ...
    }
    ```

4. Once configured, send notifications to the teams channel using `notify_to` -> `via_teams`

    ```json
    {
      "notifications": {
        "events": {
          "change": {
             "notify_to": {
               "via_teams": null
             }
          }
        }
      },
      ...
    }
    ```

    This will send a notification to the default teams channel.

5. If you have multiple teams channels, you can supply them as well to send notifications to these channels

    ```json
    {
      "notifications": {
        "events": {
          "change": {
             "notify_to": {
               "via_teams": "teams-channel-1, teams-channel-1" // comma-separated
             }
          }
        }
      },
      ...
    }
    ```

    :::note
    If you only have one teams service configured, it will automatically be considered as the default teams channel.
    :::

### Temporarily suspending a notification

If you need to temporarily suspend a notification (e.g. prevent sending emails, stop sending to a specific channel), you can do so by disabling the service on the applicable notification channel, e.g.

```json
{
  "notifications": {
    "channels": [
      {
        "type": "slack",
        "name": "a-slack-channel",
        "token": "slack://token/#a-slack-channel",
        "default": true,
        "disabled": true
      },
      ...
    ]
  },
  ...
}
```

In the above example, notifications that will supposedly be sent to `a-slack-channel` will be suspended.
