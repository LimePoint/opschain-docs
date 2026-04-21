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

| Column              | Description                                                                     |
|---------------------|---------------------------------------------------------------------------------|
| **Target**          | Indicates the project, environment or asset against which the activity was run. |
| **Action**          | The action that was executed. |
| **Status**          | Shows the current status of the activity with colour-coded indicators. |
| **Scheduled**       | Whether the activity was triggered by a schedule or manually by a user. |
| **Started by**      | The user who initiated the activity. |
| **Last updated**    | Timestamp for when the activity was last updated - its last status transition. |
| **Metadata**        | The metadata for the activity. |
| **Revision**        | The Git reference used for the activity either as Git repository + revision name or the template version name for changes. It shows the workflow version for workflow runs. |

#### Buttons & links

| Buttons & links               | Function                                                  |
|-------------------------------|-----------------------------------------------------------|
| **Search bar**                | Filter the contents of the table based on these criteria. |
| **Columns**                   | Hide or display columns in the table.                     |

### Navigating to activity details

Click on a specific activity row in the table and you will be taken to the details screen for more in-depth information about that activity. See the [activity details UI reference guide](/getting-started/familiarisation/gui/activity_details.md).

### Running an activity

#### Run change

<p align='center'>
  <img alt='Run change screen' src={require('!url-loader!./images/change-create.png').default} className='image-border'/>
</p>

To initiate a new change:

1. Click the _run_ -> _run change_ button.
2. Fill in all the mandatory details in the form, such as _project_, _action_, and _Git remote_.
3. After selecting a project, the environment and asset dropdowns will be populated with the available environments and assets for the project. If an environment is selected, the asset dropdown will be populated with the available assets for the environment.
4. If you'd like to schedule the change, you can do so by using the _Schedule_ tab.
5. You can add custom notification settings for the change using the _Notify_ tab.
6. You can add properties overrides for the change using the _Properties overrides_ tab.
7. Also, you can add comments and other information in the _Metadata_ tab. You can later use the metadata to filter the activity table.
8. Confirm the creation by clicking the _Run change_ button.

Once the change is created, it will automatically appear in the activity table. You will be able to see the change being executed and the progress of the execution. You can also view the specific details for any change that is running.

#### Run workflow

<p align='center'>
  <img alt='Run workflow screen' src={require('!url-loader!./images/workflow-run-create.png').default} className='image-border'/>
</p>

To initiate a new workflow run:

1. Click the _run_ -> _run workflow_ button.
2. Fill in all the mandatory details in the form, such as _project_, _workflow_, and _published workflow version_.
3. After selecting a project, the workflow dropdown will be populated with the available workflows for the project. Only workflows that have been published at least once will be available.
4. Once a workflow is selected, the _published workflow version_ dropdown will be populated with the workflow's published versions.
5. If you'd like to schedule the workflow run, you can do so by enabling the _Schedule workflow_ slider.
6. You can add properties overrides for the workflow run by enabling the _Properties overrides_ slider.
7. Also, you can add comments for this specific workflow run in the _Comments_ text area. You can later filter the activity table by the text in the comments.
8. Confirm the creation by clicking the _Run workflow_ button.

Once the workflow run is created, it will automatically appear in the activity table. You will be able to see the workflow run being executed and the progress of the execution. You can also view the specific details for any workflow run that is running.
