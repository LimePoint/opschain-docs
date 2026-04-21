---
sidebar_position: 7
description: ''
---

# Workflows

## Workflow list

The first tab on this page lists all the [workflows](/key-concepts/workflows.md) of a selected project.

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
| **Search bar**                | Filter the contents of the table based on these criteria.              |
| **Columns**                   | Hide or display columns in the table.                                  |

Clicking on a specific workflow will redirect you to its details page.

## Workflow editor

<p align='center'>
  <img alt='Workflow editor' src={require('!url-loader!./images/workflows-editor.png').default} className='image-border'/>
</p>

To create a new workflow, follow these steps:

1. Click on the _New workflow_ button. If you have an existing workflow, that workflow will be available as a tabbed item in this page.
2. You can use the `Quick add` features located at the bottom of the screen. These are the options that allow you to add:
  - Action: Adds a blank action to the editor. Fill in the target path and the action name.
  - Wait: Adds a wait step. Fill in the name if desired.
  - Approval: Adds an approval step. Fill in the name and the users/LDAP groups that can approve the step. Multiple values can be added separated by commas.
  - Sequential: Adds a sequential step. Fill in the actions.
  - Parallel: Adds a parallel step. Fill in the actions.
  - Notification: Adds notification options to the workflow or a workflow step.
3. The editor preview and the resolved preview on the right side of the screen provides a GUI representation of the editor.

:::warning
Please proceed with caution when adding child workflows to a workflow as it is possible to create a workflow that indirectly calls itself and hence never ends.
:::

### Buttons & links

| Buttons & links            | Function                                                                                            |
|----------------------------|-----------------------------------------------------------------------------------------------------|
| **Save**                   | Saves the changes made to the workflow as a draft.                                                  |
| **Validate**               | Validates the workflow - will show an error if it does not conform to the expected workflow schema. |
| **Publish**                | Creates a new published version of the workflow. If the current version has not been validated, it will be validated first.                       |
| **Discard changes**        | Discards the changes made to the workflow.                                                          |

When visiting this page with an existing workflow, you will also see the following buttons:

| Buttons & links            | Function                                                                                            |
|----------------------------|-----------------------------------------------------------------------------------------------------|
| **Workflow history**       | Shows the historic versions of the workflow.                                                        |
| **Discard changes**        | Discards the changes made to the workflow.                                                          |

### Using variables in the workflow

On the bottom right side of the editor, you can use [properties](/key-concepts/properties.md) overrides to the workflow, allowing you to dynamically set targets, actions and names based on run-time values.

Properties can be used in the editor by surrounding it with double curly braces, e.g. `{{property_name}}`.

After the workflow is validated, the _Resolved preview_ tab will show you the workflow with the variables replaced by their properties overrides.
