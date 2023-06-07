---
sidebar_position: 10
description: Sending notifications to other mediums such as Slack or email.
---

# Notifications

OpsChain can be configured to send notifications via a [wide variety](https://github.com/caronc/apprise#supported-notifications) of channels. Currently, notifications will only be sent when a change has failed.

If you would like OpsChain to provide notification for other change events, please [let us know](mailto:opschain-support@limepoint.com).

## Notifications configuration

OpsChain allows notifications to be sent to any endpoint supported by [Apprise](https://github.com/caronc/apprise). This includes common endpoints like Slack, Microsoft Teams, email servers, and many more. To enable notifications, update your project or environment settings to include the failure notification `target_url`:

`opschain project|environment edit-settings`

```json
{
  "notifications": {
    "failure": {
      "target_url": "{{target url}}"
    }
  },
  ...
}
```

Replace `{{target url}}` with the notification service URL.

:::tip
If you have Apprise [installed](https://github.com/caronc/apprise#installation), you can test your notification configuration by running the following command locally:

```bash
apprise -vv --title='Test message' "{{target url}}" # e.g. slack://TokenA/TokenB/TokenC/
```

:::

:::caution Credential visibility

Note that any users that have permission to access these settings (i.e. access to this project and environment) can view the credentials stored in the `target_url`. See the [restricting user access](restricting-user-access.md) guide for information on limiting user access to projects and environments.

The credentials are encrypted at rest, so they will not be viewable by anyone who does not have permission.

We plan to add additional security in this area, please [contact us](/docs/support.md#how-to-contact-us) if you are interested in this feature.
:::

### Example notification configurations

#### [Slack](https://slack.com/)

Slack's incoming webhook URL can be used to receive messages from OpsChain. Complete the following steps to configure OpsChain to send a message to a Slack channel when any change fails:

1. Create an incoming webhook URL. You can create it in different ways, via a [legacy integration](https://my.slack.com/services/new/incoming-webhook/), or via a [Slack app](https://api.slack.com/slack-apps).
2. Save the generated URL. The link should be generated in the following format: `https://hooks.slack.com/services/{{TokenA}}/{{TokenB}}/{{TokenC}}`
3. Setup the `target_url` to send the notification to the incoming webhook URL

```json
{
  "notifications": {
    "failure": {
      "target_url": "https://hooks.slack.com/services/{{TokenA}}/{{TokenB}}/{{TokenC}}"
    }
  },
  ...
}
```

:::tip
Learn more in the [Apprise documentation](https://github.com/caronc/apprise/wiki/Notify_slack).
:::

#### Email

If you are using an email service supported natively by [Apprise](https://github.com/caronc/apprise#email-notifications) (e.g. [Gmail](https://gmail.com/) or [Yahoo](https://mail.yahoo.com/), [among others](https://github.com/caronc/apprise/wiki/Notify_email)), you can set up your notifications to send to any email address. The following is an example of using your Gmail account to send the notifications to another email address:

1. Login to the Gmail account - we suggest using a system one (rather than a personal one) for security reasons
2. Add an [app password](https://security.google.com/settings/security/apppasswords) on the Gmail account to be used to send the notifications
3. Setup the `target_url` to send the notification to the target email address

```json
{
  "notifications": {
    "failure": {
      "target_url": "mailto://{{user}}:{{app_password}}@gmail.com?to={{receivingAddress@example.com}}"
    }
  },
  ...
}
```

:::caution Using a system email account

As described [above](#notifications-configuration), these credentials can be viewed by other OpsChain users.

For this reason, we suggest using a system account to send notifications.
:::
