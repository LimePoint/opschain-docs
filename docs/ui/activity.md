---
sidebar_position: 5
description: ''
---

# Activity

## Understanding the activity screen

A table view is presented upon accessing the activity screen. This view organises changes and workflow runs into a structured table that displays key information at a glance.

### Activity details

<p align='center'>
  <img alt='Activity table view screen' src={require('!url-loader!./images/activity-table-view.png').default} className='image-border'/>
</p>

Each row includes:

| Column              | Description                                                                                                                    |
|---------------------|--------------------------------------------------------------------------------------------------------------------------------|
| **Target**          | Indicates the project, environment or asset against which the activity was run.                                                |
| **Action**          | The action that was executed.                                                                                                  |
| **Status**          | Shows the current status of the change with colour-coded indicators; red:failure, green:success, yellow:running.               |
| **Scheduled**       | Whether the activity was triggered by a scheduled run or by a user.                                                            |
| **Started by**      | The user who initiated the activity.                                                                                           |
| **Created at**      | Timestamp for when the activity was created.                                                                                   |
| **Last updated**    | Timestamp for when the activity was last updated.                                                                              |
| **Started**         | Timestamp for when the activity started.                                                                                       |
| **Finished**        | Timestamp for when the activity ended.                                                                                         |
| **Metadata**        | The metadata for the activity.                                                                                                 |
| **Revision**        | The Git reference for the commit used for the activity.                                                                        |

#### Buttons & links

| Buttons & links               | Function                                                  |
|-------------------------------|-----------------------------------------------------------|
| **Columns**                   | Hide or display columns in the table.                     |
| **Toolbar**                   | Filter the contents of the table based on these criteria. |

### Navigating to activity details

Click on a specific activity in the table and you will be taken to the details screen for more in-depth information about that activity. See the [activity details UI reference guide](/ui/activity-details.md).

### Running an activity

#### Run change

<p align='center'>
  <img alt='Run change screen' src={require('!url-loader!./images/change-create.png').default} className='image-border'/>
</p>

To initiate a new change:

1. Click the _run_ -> _run change_ button.
2. Fill in all the mandatory details in the form, such as _project_, _action_, and _Git remote_.
3. Alternatively, you can run this change on a schedule using the _schedule change_ slider.
4. Confirm the creation by clicking the _Run change_ button.

Once the change is created, it will automatically appear in the activity table. You will be able to see the change being executed and the progress of the execution. You can also view the specific details for any change that is running.

#### Run workflow

<p align='center'>
  <img alt='Run workflow screen' src={require('!url-loader!./images/workflow-run-create.png').default} className='image-border'/>
</p>

To initiate a new change:

1. Click the _run_ -> _run workflow_ button.
2. Fill in all the mandatory details in the form, such as _project_, workflow, and _published workflow version_.
3. Alternatively, you can run this change on a schedule using the _schedule workflow_ slider.
4. Confirm the creation by clicking the _Run workflow_ button.

Once the workflow is run, it will automatically appear in the activity table. You will be able to see the workflow being executed and the progress of the execution. You can also view the specific details for any workflow that is running.

:::note
_Standard_ type projects do not have the workflows so they don't appear in the project list when running a workflow.
:::
