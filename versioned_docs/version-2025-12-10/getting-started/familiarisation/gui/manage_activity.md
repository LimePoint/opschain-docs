---
sidebar_position: 9
description: ''
---

# Manage activity

## Understanding the manage activity screen

You will see a notification icon next to the Manage Activity item in the sidebar whenever there is an activity that requires your or someone on the same LDAP group's attention such as an approval, rejection, or continuation.
Once on the page, you'll find two types of steps that may need action:

1. Steps waiting for approval
2. Steps waiting to be continued

These are organized into separate tabs within the page for easy navigation and clarity.

<p align='center'>
  <img alt='Manage activity screen' src={require('!url-loader!./images/manage-activity.png').default} className='image-border'/>
</p>

Each row includes:

| Column              | Description                                                                                |
|---------------------|--------------------------------------------------------------------------------------------|
| **Source**          | The path to the activity that requires your attention.                                     |
| **Step id**         | The step id that is currently paused and waiting to be actioned.                           |
| **Created by**      | The user who initiated the activity.                                                       |
| **Controls**        | Buttons to either approve, reject, continue, or cancel the waiting step.                   |

### Buttons & links

| Buttons & links               | Function                                                               |
|-------------------------------|------------------------------------------------------------------------|
| **Search bar**                | Filter the contents of the table based on these criteria.              |
| **Columns**                   | Hide or display columns in the table.                                  |
