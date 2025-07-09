---
sidebar_position: 10
description: Sending notifications to other mediums such as Slack or email.
---

# Notifications

OpsChain can be configured to send notifications via a [wide variety](https://github.com/caronc/apprise#supported-notifications) of channels. Notifications can be sent on activity start, success, and failure.

:::note
For enterprise projects, these event notifications include [workflow runs](/reference/concepts/workflows.md#running-a-workflow).

:::

If you would like OpsChain to provide notification for other change or workflow events, please [let us know](mailto:opschain-support@limepoint.com).

## Notifications configuration

OpsChain allows activity `failure`, `success`, and `start` notifications to be sent to any endpoint supported by [Apprise](https://github.com/caronc/apprise). This includes common endpoints like Slack, Microsoft Teams, email servers, and many more. To enable notifications, update your project or environment settings to include the notification options:

`opschain project|environment edit-settings`

```json
{
  "notifications": {
    "targets": {
      "all_slack_channels": ["{{target url}}", "{{target url}}"],
      "slack_channel_1": ["{{target url}}"],
      "teams":  ["{{target url}}"],
      "email": ["{{target url}}"]
    },
    "events": {
       "change": {
          "all_events": {
            "notify": false
          },
          "start": {
            "notify": true,
            "notify_to": ["msteams", "email"]
          },
          "success": {
            "notify": true,
            "notify_to": ["slack_channel_1"]
          },
          "failure": {
            "notify": true,
            "notify_to": ["all_slack_channels"]
          }
       },
       "workflow_run": {
          "all_events": {
            "notify": true,
            "notify_to": ["slack_channel_1"]
          }
       }
    }
  }
  ...
}
```

Replace `{{target url}}` with the notification service URL.

:::caution Credential visibility
As the `{{target url}}` contains credentials, it is strongly recommended to store these credentials in the secret vault and reference the vault path in the settings (e.g. `secret-vault://path/to/a/slack/token`).
:::

:::tip
If you have Apprise [installed](https://github.com/caronc/apprise#installation), you can test your notification configuration by running the following command locally:

```bash
apprise -vv --title='Test message' "{{target url}}" # e.g. slack://TokenA/TokenB/TokenC/
```

:::

### Overriding notification events

By default, activities that run will inherit the notification configuration of its parent. However, you may prefer to customise the notification on a change level.

You can override the notification event configuration of a change by supplying these in the `notifications -> events` in the `metadata` when creating a change.

e.g.

```json
{
  "metadata": {
    "notifications": {
      "events": {
        "failure": {
          "notify": true,
          "notify_to": ["all_slack_channels"]
        }
      }
    }
    ...
  }
}
```

Note that this will override (not merge) the notification configuration in the settings. In the above example, the newly created change will only send a notification on a `failure` event.

### Example notification configurations

#### [Slack](https://slack.com/)

Slack's incoming webhook URL can be used to receive messages from OpsChain. Complete the following steps to configure OpsChain to send a message to a Slack channel on an activity event:

1. Create an incoming webhook URL. You can create it in different ways, via a [legacy integration](https://my.slack.com/services/new/incoming-webhook/), or via a [Slack app](https://api.slack.com/slack-apps).
2. Save the generated URL. The link should be generated in the following format: `https://hooks.slack.com/services/{{TokenA}}/{{TokenB}}/{{TokenC}}`
3. Add it on the list of notification targets. It is strongly recommended to store this url in your secret vault.

    ```json
    {
      "notifications": {
        "targets": {
          "slack": ["https://hooks.slack.com/services/{{TokenA}}/{{TokenB}}/{{TokenC}}"]
        }
      },
      ...
    }
    ```

4. Reference the target on the event(s) to send the notification to the incoming webhook URL.

    ```json
    {
      "notifications": {
        "events": {
          "change": {
             "start": {
               "notify": true,
               "notify_to": ["slack"]
             }
          }
        }
      },
      ...
    }
    ```

:::tip
Learn more in the [Apprise documentation](https://github.com/caronc/apprise/wiki/Notify_slack).
:::

#### [Teams](https://teams.microsoft.com/)

Microsoft Teams' incoming webhook URL can be used to receive messages from OpsChain. Complete the following steps to configure OpsChain to send a message to a Teams channel on an activity event:

1. Create an [incoming webhook URL](https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook?tabs=newteams%2Cdotnet#create-an-incoming-webhook).
2. Save the generated URL. The link should be generated in the following format: `https://team-name.office.com/webhook/{tokenA}/IncomingWebhook/{tokenB}/{tokenC}`
3. Add it on the list of notification targets. It is strongly recommended to store this url in your secret vault.

    ```json
    {
      "notifications": {
        "targets": {
          "msteams": "https://team-name.office.com/webhook/{tokenA}/IncomingWebhook/{tokenB}/{tokenC}"
        }
      },
      ...
    }
    ```

4. Reference the target on the event(s) to send the notification to the incoming webhook URL.

    ```json
    {
      "notifications": {
        "events": {
          "change": {
             "start": {
               "notify": true,
               "notify_to": ["msteams"]
             }
          }
        }
      },
      ...
    }
    ```

:::tip
Learn more in the [Apprise documentation](https://github.com/caronc/apprise/wiki/Notify_msteams).
:::

#### Email

If you are using an email service supported natively by [Apprise](https://github.com/caronc/apprise#email-notifications) (e.g. [Gmail](https://gmail.com/) or [Yahoo](https://mail.yahoo.com/), [among others](https://github.com/caronc/apprise/wiki/Notify_email)), you can set up your notifications to send to any email address. The following is an example of using your Gmail account to send the notifications to another email address:

1. Login to the Gmail account - we suggest using a system one (rather than a personal one) for security reasons
2. Add an [app password](https://security.google.com/settings/security/apppasswords) on the Gmail account to be used to send the notifications
3. Add it on the list of notification targets. It is strongly recommended to store this credential in your secret vault.

    ```json
    {
      "notifications": {
        "targets": {
          "email": "mailto://{{user}}:{{app_password}}@gmail.com?to={{receivingAddress@example.com}}"
        }
      },
      ...
    }
    ```

4. Reference the target on the event(s) to send the notification to the incoming webhook URL.

    ```json
    {
      "notifications": {
        "events": {
          "change": {
             "start": {
               "notify": true,
               "notify_to": ["email"]
             }
          }
        }
      },
      ...
    }
    ```
