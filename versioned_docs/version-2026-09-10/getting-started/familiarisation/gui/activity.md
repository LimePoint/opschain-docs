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
| **Revision**        | The Git reference used for the activity either as Git repository + revision name or the template version name for changes. It shows the workflow version for workflow runs. Select the cell to open the full detail behind the truncated label — the Git remote and its URL, the revision, the full commit SHA with a button to copy it, and a link to the commit in the repository. A templated change links to its template and template version, and a workflow run to its workflow and version. While the revision is being fetched, a **Resolving commit** button appears — click it to view the Git fetch logs. |

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

The filters at the top of the activity table allows you to search by various criteria, so you can find every change tagged with (for example) a particular ticket number. Metadata is attached to a change in the [_Metadata_ panel](#panels) of the run change dialog and is also accessible from inside your `actions.rb` via the [OpsChain context](/key-concepts/context.md). See [change metadata](/key-concepts/changes.md#change-metadata) for the underlying concept.

## Running an activity

### Run change

<p align='center'>
  <img alt='Run change screen' src={require('!url-loader!./images/change-create.png').default} className='image-border'/>
</p>

The dialog is laid out in two columns. The left column describes what the change runs - its target, action, run options and schedule - and stays in view. The right column holds the optional panels, one open at a time. Each panel header summarises what it holds, so you can see which panels carry a value without opening them.

To initiate a new change:

1. Click the _run_ -> _run change_ button.
2. Fill in the left column. Opening the dialog from within a project, environment or asset populates the target for you, and you can still change it.
3. Open any of the panels on the right that you need.
4. Click _Run change_ - or _Create change run schedule_ when _Schedule change_ is on.

Once the change is created, it appears in the activity or scheduled activity table, where you can follow its progress and open its [details](/getting-started/familiarisation/gui/activity_details.md).

#### What the change runs

| Section | Description |
|---------|-------------|
| **Project, environment or asset** | The target the change will run against. Properties and settings cascade from project to environment to asset, so the target you pick determines the configuration the change will see. Selecting a project populates the environment dropdown, and selecting an environment populates the asset dropdown. |
| **Git remote and Git revision** | Required when running a change on a project or environment. Assets are already linked to a Git remote and Git revision through their [asset template version](/getting-started/familiarisation/gui/projects/asset_templates.md), so these fields are not shown for asset changes. |
| **Action** | The action defined in your `actions.rb` (or in a MintModel template) that this change will execute. Once the action resolves to a step tree, **Mark steps to skip** appears beneath it - see [marking steps to skip](#marking-steps-to-skip). |
| **Starting step** | Shown, read-only, only when the dialog is opened via _Run \<action\> from here_ from a step's play button in an asset's action tree. It names the step the change will begin executing from, [skipping the steps before it](/key-concepts/changes.md#starting-a-change-partway-through). |
| **Run options** | **Automatically continue wait steps** - wait steps that do not require approval continue automatically rather than pausing for manual continuation, using each input argument's default value or the answer given in the [Input step arguments](#answering-input-steps-up-front) panel. See [automatically continuing wait steps](/key-concepts/actions.md#automatically-continuing-wait-steps). **Build without cache** - the change's runner image is built from scratch, ignoring any cached image layers. It is not available for scheduled changes, so it is disabled when _Schedule change_ is on. |
| **Schedule** | Turn on **Schedule change** to run the change on a schedule rather than now. The [schedule editor](/getting-started/familiarisation/gui/scheduled_activities.md#setting-a-schedule) opens from the schedule line, and the schedule it describes is shown in plain English beside the submit button. A change started partway through an action tree (via _Run \<action\> from here_) cannot be scheduled, so the switch is disabled in that case. Everything else that applies only to a scheduled change is in the **Schedule options** panel. |

#### Panels

| Panel | Description |
|-------|-------------|
| **Input step arguments** | Answer the [input steps](/key-concepts/actions.md#input-steps) in the chosen action before the change runs - see [answering input steps up front](#answering-input-steps-up-front). |
| **Environment variables** | Set the environment variables the change's steps run with, as a table of names and values rather than hand-written JSON - see [setting environment variables](#setting-environment-variables). |
| **Schedule options** | Everything that applies only to a scheduled change: **Run once**, **New commits only**, and the [commit file patterns](/getting-started/familiarisation/gui/scheduled_activities.md#limiting-a-scheduled-change-to-particular-files) that narrow which commits create a change. The controls stay readable but are disabled until _Schedule change_ is on, and the patterns until **New commits only** is on with them. |
| **Property overrides** | Properties that apply only to this change; the target's stored properties are unchanged. The editor provides JSON schema autocomplete and inline validation, suggesting keys and values and flagging invalid keys as you type. |
| **Settings overrides** | Settings that apply only to this change; the target's stored settings are unchanged. The editor provides the same JSON schema autocomplete and inline validation as the [settings editors](/getting-started/familiarisation/gui/projects/properties_and_settings.md#settings). |
| **Notify** | Custom notification settings for this change. |
| **Metadata** | Custom JSON stored against the change, which you can [filter the activity table by](#searching-by-metadata) later. The top-level `opschain` key is reserved for OpsChain's own bookkeeping - supplying it is reported under the editor as you type. |

#### Marking steps to skip

**Mark steps to skip** opens the chosen action's step tree with a tick box against each step, so a change can be started with part of its tree [skipped](/key-concepts/changes.md#skipping-steps). Ticking a step skips its descendants with it, and the count beside the button reads back how many steps the selection covers. Selections are held in the dialog until you choose **Apply**, and the cross beside the count clears them.

The button appears once the action resolves to a step tree with steps in it, so an action typed in by hand rather than chosen from the list has none. Changing the project, environment, asset or action clears the selection, since the steps are paths into one action's tree.

Skipped steps apply to scheduled changes as well. Rerunning a change from its details screen opens the dialog with the steps that run skipped already ticked.

#### Answering input steps up front

The **Input step arguments** panel lists the arguments of every [input step](/key-concepts/actions.md#input-steps) in the chosen action's step tree, grouped by the step that asks for them. An answer supplied here becomes that argument's default value when the step starts waiting, so the form the step presents opens with it already filled in.

Answer every required argument and tick **Automatically continue wait steps**, and the change runs through its input steps without stopping. Leave an argument empty and the step still pauses and asks for it.

Answers are written into the change's property overrides at the path each argument writes to, so the **Property overrides** panel and this one describe the same values - editing the JSON directly updates the fields here, and vice versa. A field is read only where the property overrides already hold a value that the panel cannot show, and the panel says so where the JSON cannot be parsed or where property overrides have been switched off.

#### Setting environment variables

The **Environment variables** panel sets the variables the change's steps run with as a table of names and values, writing them into the change's property overrides under `opschain.env`. A blank row is always kept at the end, and pressing <kbd>Enter</kbd> in a value starts the next one. Duplicate names are held back rather than collapsed into one.

Every other key in the property overrides is left alone, so the panel and the **Property overrides** editor can be used together.

### Run workflow

<p align='center'>
  <img alt='Run workflow screen' src={require('!url-loader!./images/workflow-run-create.png').default} className='image-border'/>
</p>

The run workflow dialog uses the same two column layout as the [run change dialog](#run-change): the workflow and its schedule on the left, the optional panels on the right.

To initiate a new workflow run:

1. Click the _run_ -> _run workflow_ button.
2. Choose the _project_, _workflow_ and _published workflow version_. Selecting a project populates the workflow dropdown with the workflows that have been published at least once, and selecting a workflow populates the version dropdown with its published versions.
3. To run the workflow on a schedule rather than now, turn on **Schedule workflow** and [set the schedule](/getting-started/familiarisation/gui/scheduled_activities.md#setting-a-schedule). **Run once** removes the schedule after its first run.
4. Open any of the panels on the right that you need.
5. Click _Run workflow_ - or _Create workflow run schedule_ when _Schedule workflow_ is on.

| Panel | Description |
|-------|-------------|
| **Environment variables** | The environment variables the workflow run's changes run with, as a table of names and values - see [setting environment variables](#setting-environment-variables). |
| **Property overrides** | Properties that apply only to this workflow run, and the values of any [variables](/key-concepts/workflows.md) the workflow declares. The target's stored properties are unchanged. The editor provides JSON schema autocomplete and inline validation. |
| **Notify** | Custom notification settings for this workflow run. |
| **Metadata** | Custom JSON stored against the workflow run, which you can [filter the activity table by](#searching-by-metadata) later. The top-level `opschain` key is reserved for OpsChain's own bookkeeping - supplying it is reported under the editor as you type. |

Choosing a different workflow or version reseeds the property overrides from that version's sample properties, and flashes the panels holding what it replaced. The version the dialog opens on is left as it is, so repeating a run keeps the overrides and metadata it was started with.

Once the workflow run is created, it appears in the activity or scheduled activity table, where you can follow its progress and open its [details](/getting-started/familiarisation/gui/activity_details.md).
