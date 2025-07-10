---
sidebar_position: 7
description: ''
---

# Workflows

## Workflow list

The first tab on this page lists all the workflows of a selected project

<p align='center'>
  <img alt='Workflow list' src={require('!url-loader!./images/workflows-page.png').default} className='image-border'/>
</p>

Each row includes:

| Column              | Description                                                                                             |
|---------------------|---------------------------------------------------------------------------------------------------------|
| **Name**            | Displays the name of each workflow.                                                                     |
| **Version**         | Displays the latest version of the workflow, and whether it is a draft version or a published one.      |
| **Code**            | Shows a unique identifier for the workflow.                                                             |
| **Description**     | Provides a short summary or purpose of the workflow.                                                    |
| **Created by**      | The user who created the workflow.                                                                      |
| **Created at**      | Timestamp for when the workflow was created.                                                            |
| **Last updated**    | Timestamp for when the workflow was last updated.                                                       |
| **Archived**        | Whether the workflow is archived or active.                                                             |

### Buttons & links

| Buttons & links               | Function                                                               |
|-------------------------------|------------------------------------------------------------------------|
| **Columns**                   | Hide or display columns in the table.                                  |
| **Search bar**                | Filter the contents of the table based on these criteria.              |

Clicking on a specific workflow will redirect you to its details page.

## Workflow editor

<p align='center'>
  <img alt='Workflow editor' src={require('!url-loader!./images/workflows-editor.png').default} className='image-border'/>
</p>

To create a new workflow, follow these steps:

1. Click on the _New workflow_ button. If you have an existing workflow, that workflow will be available as a tabbed item in this page.
2. You can use the `Quick add` features located at the bottom of the screen. These are the options that you can add:
  - Action: Adds a blank action to the editor. Fill in the target path and the action.
  - Wait: Adds a wait step. Fill in the name if desired.
  - Approval: Adds an approval step. Fill in the name and the user/Ldap group that needs to approve the step.
  - Sequential: Adds a sequential step. Fill in the actions.
  - Parallel: Adds a parallel step. Fill in the actions.
  - Notification: Adds notification options to the workflow or a workflow step.
3. The editor preview and the resolved preview on the right side of the screen provides a GUI representation of the the editor.

| Buttons & links            | Function                                                               |
|----------------------------|------------------------------------------------------------------------|
| **Save**                   | Saves the workflow in draft format.                                    |
| **Validate**               | Validates the workflow if it conforms to the expected workflow schema. |
| **Publish**                | Creates a new workflow in a published version.                         |
