---
sidebar_position: 8
description: ''
---

# Workflows

## Project workflows list

Workflows can be used to sequence changes, approval steps, wait steps, and other workflows. The workflows tab inside a project will list all the workflows that belong to the project.

<p align='center'>
  <img alt='Project workflows screen' src={require('!url-loader!../images/project-workflows.png').default} className='image-border'/>
</p>

Refer to the [workflow list](/getting-started/familiarisation/gui/workflows.md#workflow-list) for a detailed description of this table's contents.

## Workflow details

Clicking on any workflow in the workflows list will open the workflow details page.

If you'd like to edit the workflow, you can do so by clicking the pencil icon by the workflow name, which will take you to the [workflow editor](/getting-started/familiarisation/gui/workflows.md#workflow-editor).

### Runs

This tab lists the runs associated with this workflow.

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

This tab lists the scheduled activities for this workflow, enabling users to track, review, and manage its upcoming scheduled runs.

<p align='center'>
  <img alt='Project workflow scheduled activities' src={require('!url-loader!../images/project-workflow-scheduled-activity.png').default} className='image-border'/>
</p>

Refer to the [scheduled activity details](/getting-started/familiarisation/gui/scheduled_activities.md#scheduled-activity-details) for a detailed description of this table's contents.

### Overview

This tab displays the workflow in both tree and YAML or JSON formats, helping users better visualize and understand its structure.

<p align='center'>
  <img alt='Project workflow overview' src={require('!url-loader!../images/project-workflow-overview.png').default} className='image-border'/>
</p>

#### Workflow version selector

The workflow version selector is on the right side of the overview tab. It allows you to see every version of the workflow, so you can see how the workflow has changed over time.

Selecting a version will update both the YAML/JSON view (on the left) and the tree view (on the right).
