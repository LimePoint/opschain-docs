---
sidebar_position: 6
description: ''
---

# Workflows

[Workflows](/getting-started/familiarisation/gui/workflows.md) belong to a project and can sequence changes, approval steps, wait steps and other workflows across that project's environments and assets.

## Project workflows list

The workflows tab inside a project lists all the workflows that belong to the project.

<p align='center'>
  <img alt='Project workflows screen' src={require('!url-loader!../images/project-workflows.png').default} className='image-border'/>
</p>

Refer to the [workflow list](/getting-started/familiarisation/gui/workflows.md#workflow-list) for a detailed description of this table's contents.

## Workflow details

Clicking on any workflow in the workflows list will open the workflow details page. From here you can run the workflow, schedule it, browse its run history, view its definition, and edit it.

If you'd like to edit the workflow, you can do so by clicking the pencil icon by the workflow name, which will take you to the [workflow editor](/getting-started/familiarisation/gui/workflows.md#workflow-editor).

### Running and scheduling a workflow

Just like changes, workflows can be run or scheduled from the `Run` button at the top of any page. If you open the menu from within a project, it will be pre-populated with the project's workflows.

:::info
By default, OpsChain will only allow a single instance of each workflow to be running at any time. This restriction relates to the default [workflow execution options](/key-concepts/settings.md#allow_parallelruns_of_same_workflow) that prevent the same workflow from running concurrently in the same project. You can modify this setting at any time in the project's settings.
:::

### Runs

The _runs_ tab lists each time the workflow has been run. Clicking on a run takes you to the [workflow run details](/getting-started/familiarisation/gui/activity_details.md#workflow-run-details), where you can inspect each step of the run.

If all the workflow's steps complete successfully, the workflow run is marked as successful. If a workflow step errors or is cancelled, the remaining steps in the workflow run will not execute and the workflow run is marked as errored or cancelled, depending on the status of the step that ended the run.

<p align='center'>
  <img alt='Project workflow runs' src={require('!url-loader!../images/project-workflow-runs.png').default} className='image-border'/>
</p>

Each row includes:

| Column              | Description                                                                        |
|---------------------|------------------------------------------------------------------------------------|
| **Version**         | The workflow version used in the workflow run.                                     |
| **Status**          | Shows the current status of the workflow run with colour-coded indicators.         |
| **Scheduled**       | Whether the workflow run was triggered by a scheduled run or manually by a user.   |
| **Started by**      | The user who initiated the workflow run.                                           |
| **Last updated**    | Timestamp for when the workflow run was last updated - its last status transition. |
| **Metadata**        | Additional metadata attached to this workflow run.                                 |

#### Buttons & links

| Buttons & links               | Function                                                               |
|-------------------------------|------------------------------------------------------------------------|
| **Search bar**                | Filter the contents of the table based on these criteria.              |
| **Columns**                   | Hide or display columns in the table.                                  |

### Scheduled activity

The _scheduled activity_ tab lists every schedule defined for this workflow, enabling you to track, review, and manage its upcoming runs. To remove a schedule, click on the checkboxes for the schedules you wish to remove, then select _delete selected_ from the _bulk operations_ drop down.

<p align='center'>
  <img alt='Project workflow scheduled activities' src={require('!url-loader!../images/project-workflow-scheduled-activity.png').default} className='image-border'/>
</p>

Refer to the [scheduled activity details](/getting-started/familiarisation/gui/scheduled_activities.md#scheduled-activity-details) for a detailed description of this table's contents.

### Overview

The _overview_ tab displays the workflow in both tree and YAML or JSON formats, helping you visualise the workflow structure and confirm that the resolved step tree matches your expectations before running it.

<p align='center'>
  <img alt='Project workflow overview' src={require('!url-loader!../images/project-workflow-overview.png').default} className='image-border'/>
</p>

#### Buttons & links

| Buttons & links               | Function                                                                              |
|-------------------------------|---------------------------------------------------------------------------------------|
| **Run**                       | Opens the workflow run dialog with latest published version of the workflow.          |
| **Open in editor**            | Opens the selected workflow version in the workflow editor.                           |
| **Pencil icon**               | Allows you to edit the workflow name and description.                                 |
| **Bell icon**                 | Allows you configure notifications for this workflow.                                 |
| **Three dots icon**           | Allows you to archive the workflow, delete all draft versions or delete the workflow. |
| **Bulk actions**              | Allows you to archive or restore multiple workflow versions.                          |
| **Search bar**                | Filter for a specific workflow version.                                               |
| **Left and right arrows**     | Navigate between workflow versions.                                                   |

#### Workflow version selector

The workflow version selector is on the left side of the overview tab. It displays every version of the workflow, allowing you to compare the workflow's structure and settings across different versions.

Selecting a version will update both the YAML/JSON view (on the right) and the tree view (in the center).
