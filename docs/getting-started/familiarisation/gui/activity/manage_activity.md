---
sidebar_position: 4
description: ''
---

# Manage activity

## Understanding the manage activity screen

You will see a count next to the **Manage activity** item in the navigation bar whenever there is an activity that requires your or someone on the same LDAP group's attention such as an approval, rejection, or continuation.
Once on the page, you'll find two types of steps that may need action:

1. Steps waiting for approval
2. Steps waiting to be continued

These are organised into separate tabs within the page for easy navigation and clarity.

<p align='center'>
  <img alt='Manage activity screen' src={require('!url-loader!../images/manage-activity.png').default} className='image-border'/>
</p>

Each row includes:

| Column           | Description                                                                                          |
|------------------|-----------------------------------------------------------------------------------------------------|
| **Target**       | The project, environment or asset path of the activity that requires your attention.                 |
| **Step**         | The step that is currently paused, shown with its action or workflow name.                           |
| **Status**       | Whether the step is waiting for approval or continuation, with a live timer showing how long it has been waiting. |
| **Started by**   | The user who initiated the activity.                                                                 |
| **Revision**     | The Git revision - or template/workflow version - the activity is running.                           |
| **Controls**     | Buttons to approve, reject, continue, or cancel the waiting step. Each row also links through to its change or workflow run. |

### Bulk actions

As well as actioning steps one row at a time, you can select multiple rows using their checkboxes and act on them together:

- On the **Waiting to be continued** tab, select waiting steps and choose **Continue selected** or **Cancel selected runs**. Steps that require input arguments cannot be continued in bulk - they are listed in the confirmation dialog and left for you to continue individually.
- On the **Waiting for approval** tab, select waiting steps and choose **Approve selected**, **Reject selected** or **Cancel selected runs**.

The result of a bulk action is reported with a success or error notification.

### Buttons & links

| Buttons & links               | Function                                                               |
|-------------------------------|------------------------------------------------------------------------|
| **Bulk actions**              | Continue, approve, reject or cancel multiple selected steps at once.   |
| **Search bar**                | Filter the contents of the table based on these criteria.              |
| **Columns**                   | Hide or display columns in the table.                                  |
