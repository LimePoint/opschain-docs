---
sidebar_position: 5
description: ''
---

# Activity

In OpsChain, an _activity_ is an umbrella term that covers both _changes_ and _workflow runs_:

- A **[change](/key-concepts/changes.md)** is the application of an action from a specific Git revision to a particular project, environment or asset. Each change is made up of one or more _steps_ that execute the action and any prerequisites or child actions it defines.
- A **workflow run** is the execution of a [workflow](/getting-started/familiarisation/gui/workflows.md) - an ordered series of changes, wait steps, approval steps and other workflows organised into stages.

The activity screen lists every change and workflow run available to you across all projects, environments and assets.

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
| **Revision**        | The Git reference used for the activity either as Git repository + revision name or the template version name for changes. It shows the workflow version for workflow runs. While the revision is being fetched, a **Resolving commit** button appears — click it to view the Git fetch logs. |

#### Buttons & links

| Buttons & links               | Function                                                                                                                                         |
|-------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| **Bulk actions**              | Allows you to cancel multiple activities at once.                                                                                                |
| **Search bar**                | Filter the contents of the table with free text search based on multiple criteria, such as metadata, parent code, created by, Git revision, etc. |
| **Filters**                   | Filter the contents of the table with dedicated filters for each column.                                                                         |
| **Apply button**              | Applies the filters to the table and refreshes the table contents.                                                                               |
| **Clear button**              | Clears all the filters and refreshes the table contents.                                                                                         |
| **Columns**                   | Hide or display columns in the table.                                                                                                            |

:::tip[Combining filters]
You can combine all these filters to find specific activities. After applying the filters, the URL is easily shareable with other users to allow them to see the same filtered view.

Note that each user will only be able to see the activities they have access to.
:::

### Navigating to activity details

Click on a specific activity row in the table and you will be taken to the details screen for more in-depth information about that activity. See the [activity details UI reference guide](/getting-started/familiarisation/gui/activity_details.md).

### Searching by metadata

The filters at the top of the activity table allows you to search by various criteria, so you can find every change tagged with (for example) a particular ticket number. Metadata is attached to a change in the [_Metadata_ tab](#run-change) of the run-change dialog and is also accessible from inside your `actions.rb` via the [OpsChain context](/key-concepts/context.md). See [change metadata](/key-concepts/changes.md#change-metadata) for the underlying concept.

## Running an activity

### Run change

<p align='center'>
  <img alt='Run change screen' src={require('!url-loader!./images/change-create.png').default} className='image-border'/>
</p>

To initiate a new change:

1. Click the _run_ -> _run change_ button.
2. If you open the run change dialog from within a project, environment or asset, its details will be automatically populated in the form. You can still modify any of these details in the form:
    - **Project, environment or asset** - the target the change will run against. Properties and settings cascade from project to environment to asset, so the target you pick determines the configuration the change will see.
    - **Action** - the action defined in your `actions.rb` (or in a MintModel template) that this change will execute.
    - **Git remote and Git revision** - required when running a change on a project or environment. Assets are already linked to a Git remote and Git revision through their [asset template version](/getting-started/familiarisation/gui/projects/asset_templates.md), so these fields are not shown for asset changes.
3. After selecting a project, the environment and asset dropdowns will be populated with the available environments and assets for the project. If an environment is selected, the asset dropdown will be populated with the available assets for the environment.
4. The _Run options_ section on the _Action_ tab provides two checkboxes:
    - **Automatically continue wait steps** - when enabled, wait steps that do not require approval continue automatically, using the default values for their input arguments, rather than pausing for manual continuation. See [automatically continuing wait steps](/key-concepts/actions.md#automatically-continuing-wait-steps) for more information.
    - **Build without cache** - when enabled, the change's runner image is built from scratch, ignoring any cached image layers. This option is not available for scheduled changes, so it is disabled when the change is scheduled.
5. If you'd like to schedule the change, you can do so by using the _Schedule_ tab.
6. You can add custom notification settings for the change using the _Notify_ tab.
7. You can add properties overrides for the change using the _Properties overrides_ tab. These overrides apply only to this change and do not modify the target's stored properties.
8. You can add settings overrides for the change using the _Settings overrides_ tab. These overrides apply only to this change and do not modify the target's stored settings. The editor provides the same JSON schema autocomplete and inline validation as the [settings editors](/getting-started/familiarisation/gui/projects/properties_and_settings.md#settings), suggesting keys and values and flagging invalid keys as you type.
9. Also, you can add comments and other information in the _Metadata_ tab. You can later use the metadata to filter the activity table.
10. Confirm the creation by clicking the _Run change_ button.

Once the change is created, it will automatically appear in the activity or scheduled activity tables. You will be able to see the change being executed and the progress of the execution. You can also view the specific details for any change that is running.

### Run workflow

<p align='center'>
  <img alt='Run workflow screen' src={require('!url-loader!./images/workflow-run-create.png').default} className='image-border'/>
</p>

To initiate a new workflow run:

1. Click the _run_ -> _run workflow_ button.
2. Fill in all the mandatory details in the form, such as _project_, _workflow_, and _published workflow version_.
3. After selecting a project, the workflow dropdown will be populated with the available workflows for the project. Only workflows that have been published at least once will be available.
4. Once a workflow is selected, the _published workflow version_ dropdown will be populated with the workflow's published versions.
5. If you'd like to schedule the workflow run, you can do so in the _Schedule_ tab.
6. You can add custom notification settings for the workflow run using the _Notify_ tab.
7. You can add properties overrides for the workflow run using the _Properties overrides_ tab. These overrides apply only to this workflow run and do not modify the target's stored properties.
8. Also, you can add comments for this specific workflow run in the _Comments_ text area. You can later filter the activity table by the text in the comments.
9. Confirm the creation by clicking the _Run workflow_ button.

Once the workflow run is created, it will automatically appear in the activity or scheduled activity tables. You will be able to see the workflow run being executed and the progress of the execution. You can also view the specific details for any workflow run that is running.
