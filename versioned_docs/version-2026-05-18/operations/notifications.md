---
sidebar_position: 2
description: Sending notifications to other mediums such as Slack or email.
---

# Notifications

OpsChain can be configured to send notifications via email and [Slack](https://slack.com/). Notifications can be sent in response to any [event](/key-concepts/events.md) relating to changes, workflow runs, properties and settings. Additional notification events may be added in the future as new features are added to OpsChain.

## Configuring channels

You can configure notification channels in the _notification settings_ section of the administration configuration tab.

:::info Default channels
You can configure as many channels as necessary. However, only one channel can be marked as the default channel for each notification type.

To change the default channel for a notification type, untick and save the current default channel's default checkbox and then tick the checkbox for the new default channel.
:::

### Email channel

Select _add email channel_ from the _new channel_ dropdown to add an email channel. Use the dialog to configure and save the server settings, marking the server as the default email channel if you wish to use this server as the primary outbound server for user email notifications. Once saved, you can test the settings to confirm they can be used to send email by editing the channel and using the _send test message_ feature in the edit channel dialog.

### Slack channel

Select _add Slack channel_ from the _new channel_ dropdown to add a Slack channel. Use the dialog to configure and save the Slack bot settings, marking the server as the default Slack channel if you wish to use this server as the primary outbound server for user Slack notifications. Once saved, you can test the settings to confirm they can be used to send messages by editing the channel and using the _send test message_ feature in the edit channel dialog.

:::tip Creating a Slack bot
To create a Slack bot in your organisation's Slack workspace, follow the instructions provided [here](https://appriseit.com/services/slack/#method-2-create-a-bot).
:::

## User preferences

From the user menu in the top right corner, select the _notification preferences_ option to view and edit your notification preferences. Here you can use the checkboxes to select which channel(s) should be used to notify you when requesting notifications.

:::note
If no default channel is configured, OpsChain will default to sending emails when asked to notify you.
:::

### Email

If your LDAP entry contains an email address it will be displayed in the email field and will not be modifiable. If no LDAP email is configured, the field will be empty and will allow you to configure an email address to receive notifications.

:::note
A default email channel must be configured in the administration notification settings before you can receive email notifications.
:::

### Slack

To receive Slack messages you will need to supply your Slack member ID. To obtain it, view your Slack profile and then select _Copy member ID_ from the three dot menu.

:::note
A default Slack channel must be configured in the administration notification settings before you can receive Slack notifications.
:::

## Subscribing to events

### Changes

#### When creating

When running a change, users can choose to receive notifications on specific events that occur during its execution. For example, you may want to receive a notification when the change completes, or if it fails. To do this, navigate to the _notify_ tab in the run change dialog and select the events to be notified about. Once you have specified the relevant events, use the _notify me_ checkbox to enable notifications to be sent to you or use the _users_ and _groups_ lists to specify the users and/or LDAP groups to send the notifications to.

#### For a specific action

When viewing the actions for an asset, OpsChain includes a notifications tab where you can request to be notified when changes for each action raise specific events. For example, you may which to know any time a `shutdown` action is run in production, or a `build` fails in development. Select the relevant events for the actions you wish to be notified about and OpsChain will send you notifications when these events occur.

#### For a project, environment or asset

When viewing a project, environment or asset, OpsChain includes a bell icon on the right hand side of the header that opens the notifications dialog. On the _change_ tab you can specify the relevant events to be notified about for any change that runs within that project, environment or asset. For example, you may want to receive a notification for any change that fails in production, or any change that starts in a specific asset. When viewing this dialog for a project, an optional checkbox will be displayed allowing you to apply the setting to all environments and assets within that project. Similarly, when viewing the dialog for an environment, an optional checkbox will be displayed allowing you to apply the setting to all assets within that environment.

### Workflows

#### When creating

When running a workflow, users can choose to receive notifications on specific events that occur during its execution. For example, you may want to receive a notification if the workflow fails or if it is cancelled. To do this, navigate to the _notify_ tab in the run workflow dialog and select the events to be notified about. Once you have specified the relevant events, use the _notify me_ checkbox to enable notifications to be sent to you or use the _users_ and _groups_ lists to specify the users and/or LDAP groups to send the notifications to.

#### For a specific workflow

When viewing the workflows for a project, OpsChain includes a notifications tab where you can request to be notified when workflow runs for each workflow raise specific events. For example, you may which to know any time the `patch_assets` workflow is run in development, or when the `backup` workflow fails in production. Select the relevant events for the workflows you wish to be notified about and OpsChain will send you notifications when these events occur.

#### For a project

When viewing a project, OpsChain includes a bell icon on the right hand side of the header that opens the notifications dialog. On the _workflow runs_ tab you can specify the relevant events to be notified about for any workflow that runs within that project. For example, you may want to receive a notification for any workflow that fails in production.

### Properties & settings

When viewing a project, environment or asset, OpsChain includes a bell icon on the right hand side of the header that opens the notifications dialog. The _properties_ and _settings tabs allow you to enable notifications any time these are updated for the project, environment or asset. When viewing this dialog for a project, an optional checkbox will be displayed allowing you to apply the setting to all environments and assets within that project. Similarly, when viewing the dialog for an environment, an optional checkbox will be displayed allowing you to apply the setting to all assets within that environment.

## Managing user notifications

From the user menu in the top right corner, select the _manage all notifications_ option to view and edit all the events you have configured to receive notifications for. Notifications are grouped by the project, environment or asset they are associated with and provide the following columns of information:

| Column Name         | Description                                                                                                                     |
|---------------------|---------------------------------------------------------------------------------------------------------------------------------|
| Change events       | These are the events described in the [for a project, environment or asset](#for-a-project-environment-or-asset) section above. |
| Action events       | These are the events described in the [for a specific action](#for-a-specific-action) section above.                            |
| Workflow run events | These are the events described in the [for a project](#for-a-project) section above.                                            |
| Workflow events     | These are the events described in the [for a specific workflow](#for-a-specific-workflow) section above.                        |
| Properties events   | These are the events described in the [properties & settings](#properties--settings) section above.                             |
| Settings events     | These are the events described in the [properties & settings](#properties--settings) section above.                             |

:::tip editing notifications from the manage notifications page

- The _change events_, _workflow run events_, _properties events_ and _settings events_ can be modified by clicking the edit icon to the left of the row. This will open the notifications dialog for the relevant project, environment or asset.
- The _action events_ and _workflow events_ can be modified by clicking the entry in the column for the specific action or workflow you wish to modify the notifications for.

:::
