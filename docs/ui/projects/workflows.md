---
sidebar_position: 8
description: ''
---

# Workflows

## Project workflows

Workflows can be used to sequence changes, approval steps, wait steps, and other workflows.

<p align='center'>
  <img alt='Project workflows screen' src={require('!url-loader!../images/project-workflows.png').default} className='image-border'/>
</p>

Refer to the [workflow list](/ui/workflows.md#workflow-list) for a detailed description of this table's contents.

:::note
_Standard_ type projects do not have the workflows tab on the project details page.
:::

## Workflow runs

This tab lists the runs associated with this workflow.

<p align='center'>
  <img alt='Project workflow runs' src={require('!url-loader!../images/project-workflow-runs.png').default} className='image-border'/>
</p>

Each row includes:

| Column              | Description                                                                                                               |
|---------------------|---------------------------------------------------------------------------------------------------------------------------|
| **Version**         | The template version that the workflow ran against.                                                                       |
| **Status**          | Shows the current status of the workflow run with colour-coded indicators; red:failure, green:success, yellow:running.    |
| **Scheduled**       | Whether the workflow run was triggered by a scheduled run or by a user.                                                   |
| **Started by**      | The user who initiated the workflow run.                                                                                  |
| **Last updated**    | Timestamp for when the workflow run was last updated.                                                                     |
| **Metadata**        | Additional metadata attached to this workflow run.                                                                        |

### Buttons & links

| Buttons & links               | Function                                                               |
|-------------------------------|------------------------------------------------------------------------|
| **Columns**                   | Hide or display columns in the table.                                  |
| **Toolbar**                   | Filter the contents of the table based on these criteria.              |

## Workflow scheduled activities

This tab lists the scheduled activities for this workflow, enabling users to track, review, and manage its upcoming schedule.

<p align='center'>
  <img alt='Project workflow scheduled activities' src={require('!url-loader!../images/project-workflow-scheduled-activity.png').default} className='image-border'/>
</p>

Refer to the [scheduled activity details](/ui/scheduled_activities.md#scheduled-activity-details) for a detailed description of this table's contents.

## Workflow overview

This tab displays the workflow in both tree and YAML formats, helping users better visualize and understand its structure.

<p align='center'>
  <img alt='Project workflow overview' src={require('!url-loader!../images/project-workflow-overview.png').default} className='image-border'/>
</p>

## Workflow versions

This tab displays the workflow's version history, providing a clear audit trail for tracking changes over time.

<p align='center'>
  <img alt='Project workflow versions' src={require('!url-loader!../images/project-workflow-versions.png').default} className='image-border'/>
</p>

Each row includes:

| Column              | Description                                                                                             |
|---------------------|---------------------------------------------------------------------------------------------------------|
| **Version**         | The version number assigned to this workflow version.                                                   |
| **Status**          | Whether the workflow version is a draft or has been published.                                          |
| **Description**     | Provides a short summary or purpose of the workflow.                                                    |
| **Created by**      | The user who created the workflow.                                                                      |
| **Created at**      | Timestamp for when the workflow version was created.                                                    |
| **Updated at**      | Timestamp for when the workflow version was last updated.                                               |
| **Steps JSON**      | The workflow steps associated with this version, represented in JSON format (if applicable).            |

### Buttons & links

| Buttons & links               | Function                                                               |
|-------------------------------|------------------------------------------------------------------------|
| **Columns**                   | Hide or display columns in the table.                                  |
| **Search bar**                | Filter the contents of the table based on these criteria.              |
