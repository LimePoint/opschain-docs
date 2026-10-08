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
| **Paused**                    | Show only the activities that are [pausing or paused](/key-concepts/changes.md#pausing-and-resuming-a-change).                                   |
| **Search by step**            | Find the changes that ran a particular step, at whatever depth it ran in the change's step tree. See [searching by step](/getting-started/familiarisation/gui/search.md#searching-by-step). |
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

The dialog is laid out in two columns. The left column describes what the change runs - its target, action and run options - and stays in view. The right column holds the optional panels, one open at a time. Each panel header summarises what it holds, so you can see which panels carry a value without opening them.

Clicking outside the dialog does not close it, so a half-filled form is not lost to a stray click. Press <kbd>Esc</kbd> or use the cross to close it.

To initiate a new change:

1. Click the _run_ -> _run change_ button.
2. Fill in the left column. Opening the dialog from within a project, environment or asset populates the target for you, and you can still change it.
3. Open any of the panels on the right that you need. To run the change later, open the **Schedule** panel - see [scheduling the change](#scheduling-the-change).
4. Choose whether the change should [continue its wait steps automatically](#continuing-wait-steps-automatically) with the checkbox beside the submit button.
5. Click _Run change_ - or _Create change run schedule_ when _Schedule change_ is on.

Once the change is created, it appears in the activity or scheduled activity table, where you can follow its progress and open its [details](/getting-started/familiarisation/gui/activity_details.md).

#### What the change runs

| Section | Description |
|---------|-------------|
| **Project, environment or asset** | The target the change will run against. Properties and settings cascade from project to environment to asset, so the target you pick determines the configuration the change will see. Selecting a project populates the environment dropdown, and selecting an environment populates the asset dropdown. |
| **Git remote and Git revision** | Required when running a change on a project or environment. Assets are already linked to a Git remote and Git revision through their [asset template version](/getting-started/familiarisation/gui/projects/asset_templates.md), so these fields are not shown for asset changes. |
| **Action** | The action defined in your `actions.rb` (or in a MintModel template) that this change will execute. Once the action resolves to a step tree, **Mark steps to skip** appears beneath it - see [marking steps to skip](#marking-steps-to-skip). |
| **Starting step** | Shown, read-only, only when the dialog is opened via _Run \<action\> from here_ from a step's play button in an asset's action tree. It names the step the change will begin executing from, [skipping the steps before it](/key-concepts/changes.md#starting-a-change-partway-through). |
| **Run options** | **Build without cache** - the change's runner image is built from scratch, ignoring any cached image layers. It is not available for scheduled changes, so it is disabled when _Schedule change_ is on. |
| **Scheduled** | Shown at the foot of the column while _Schedule change_ is on, describing the schedule in plain English. It turns red and reads **Schedule incomplete**, with the reason, while the schedule cannot be submitted. |

#### Panels

| Panel | Description |
|-------|-------------|
| **Input step arguments** | Answer the [input steps](/key-concepts/actions.md#input-steps) in the chosen action before the change runs - see [answering input steps up front](#answering-input-steps-up-front). |
| **Environment variables** | Set the environment variables the change's steps run with, as a table of names and values rather than hand-written JSON - see [setting environment variables](#setting-environment-variables). |
| **Schedule** | Run the change later rather than now - once on a date you pick, or repeatedly - see [scheduling the change](#scheduling-the-change). Its header reads **Runs immediately** until you turn on _Schedule change_. |
| **Property overrides** | Properties that apply only to this change; the target's stored properties are unchanged. The editor provides JSON schema autocomplete and inline validation, suggesting keys and values and flagging invalid keys as you type. |
| **Settings overrides** | Settings that apply only to this change; the target's stored settings are unchanged. The editor provides the same JSON schema autocomplete and inline validation as the [settings editors](/getting-started/familiarisation/gui/projects/properties_and_settings.md#settings). |
| **Notify** | Custom notification settings for this change. |
| **Metadata** | Custom JSON stored against the change, which you can [filter the activity table by](#searching-by-metadata) later. The top-level `opschain` key is reserved for OpsChain's own bookkeeping - supplying it is reported under the editor as you type. |

#### Marking steps to skip

**Mark steps to skip** opens the chosen action's step tree with a tick box against each step, so a change can be started with part of its tree [skipped](/key-concepts/changes.md#skipping-steps). Ticking a step skips its descendants with it, and the count beside the button reads back how many steps the selection covers. Selections are held in the dialog until you choose **Apply**, and the cross beside the count clears them.

The button appears once the action resolves to a step tree with steps in it, so an action typed in by hand rather than chosen from the list has none. Changing the project, environment, asset or action clears the selection, since the steps are paths into one action's tree.

Skipped steps apply to scheduled changes as well. Rerunning a change from its details screen opens the dialog with the steps that run skipped already ticked.

#### Continuing wait steps automatically

The **Automatically continue wait steps** checkbox beside the submit button decides whether the change stops at its [wait steps](/key-concepts/actions.md#wait-steps). With it ticked, a wait step that does not require approval continues by itself, and an [input step](/key-concepts/actions.md#input-steps) continues with the answers given in the [Input step arguments](#answering-input-steps-up-front) panel or the arguments' default values. See [automatically continuing wait steps](/key-concepts/actions.md#automatically-continuing-wait-steps).

The line beside the checkbox says what the change will do:

| Message | Meaning |
|---------|---------|
| **The change will pause at wait steps until someone continues it** | The checkbox is clear. |
| **The change will continue without pausing** | The checkbox is ticked, and every required input argument has an answer or a default value. |
| **Will still pause for \<arguments\> - required, with no default value** | The checkbox is ticked, but the arguments named have neither an answer nor a default value, so the steps that ask for them still pause. Answer them in the **Input step arguments** panel to run without stopping. |

When you choose an action with input steps, the checkbox is ticked for you if every required argument already has a value, and cleared if not. Answering an argument in the panel ticks it. Once you tick or clear it yourself, the dialog leaves it as you set it.

#### Answering input steps up front

The **Input step arguments** panel lists the arguments of every [input step](/key-concepts/actions.md#input-steps) in the chosen action's step tree, grouped by the step that asks for them. Required arguments are marked with a red `*`. An answer supplied here becomes that argument's default value when the step starts waiting, so the form the step presents opens with it already filled in.

**At input steps**, at the top of the panel, is the same choice as the [Automatically continue wait steps](#continuing-wait-steps-automatically) checkbox, put in terms of the input steps:

- **Continue automatically** - each input step takes the answers given here, or the arguments' defaults, and the change carries on.
- **Pause for review** - each input step waits with the answers given here filled in, until someone continues it.

If the change will still pause because a required argument has no answer and no default, the panel names the missing arguments.

Each argument is answered with a control that suits its type:

- A **boolean** argument is a switch, set to the argument's default value until you move it. Moving it back to the default clears the answer, so only a value that differs from the default is written to the property overrides. Where there is no default, either position is an answer, and the cross clears it.
- A [**sensitive**](/key-concepts/actions.md#sensitive-input-arguments) argument is a masked field. OpsChain encrypts the answer when the change is saved; until then it is sent, and shown in the **Property overrides** editor, in the clear. A value already stored - when repeating a change or editing a schedule - shows as **Value is set** rather than being filled in, and **Replace** lets you enter a new one.
- A date, array or hash argument, or one with a list of valid values, shows its default value under the control.

Answers are written into the change's property overrides at the path each argument writes to, so the **Property overrides** panel and this one describe the same values - editing the JSON directly updates the fields here, and vice versa. Clearing an answer removes it from the property overrides, along with any object it leaves empty. A field is read only where the property overrides already hold a value that the panel cannot show - a boolean switch over a value of `"yes"`, for example - and the panel says so where the JSON cannot be parsed or where property overrides have been switched off.

#### Scheduling the change

The **Schedule** panel runs the change later instead of now. Turn on **Schedule change**, then choose:

- **Once** - run on a date and time you pick, after which the schedule is removed. Pick a day on the calendar and enter a **Time** in your browser's local time zone, or choose one of the **Suggestions**, such as _Tomorrow, 9:00 am_ or _Start of next month_. A date and time that has already passed is refused.
- **Repeating** - run on a [cron schedule](/getting-started/familiarisation/gui/scheduled_activities.md#setting-a-schedule). **Run once** removes a repeating schedule after its next run.

Below these sit the options that apply only to a scheduled change:

- **New commits only** - skip a run when nothing has been committed since the last one. See [triggering on new commits only](/getting-started/familiarisation/gui/scheduled_activities.md#triggering-on-new-commits-only).
- **Run only when matching files have changed** - the [commit file patterns](/getting-started/familiarisation/gui/scheduled_activities.md#limiting-a-scheduled-change-to-particular-files) that narrow which commits create a change, as a row per glob with a **Negate** column and a match mode of **ALL** or **ANY**. They are available once **New commits only** is ticked.

Turning on **Schedule change** clears **Build without cache**, which scheduled changes do not support. A change started partway through an action tree (via _Run \<action\> from here_) cannot be scheduled, so the switch is disabled in that case.

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
3. To run the workflow later rather than now, open the **Schedule** panel, turn on **Schedule workflow** and choose **Once** or **Repeating**, as for a [scheduled change](#scheduling-the-change).
4. Open any of the panels on the right that you need.
5. Click _Run workflow_ - or _Create workflow run schedule_ when _Schedule workflow_ is on.

| Panel | Description |
|-------|-------------|
| **Schedule** | Run the workflow later rather than now - once on a date you pick, or repeatedly. |
| **Environment variables** | The environment variables the workflow run's changes run with, as a table of names and values - see [setting environment variables](#setting-environment-variables). They are written under `opschain.env` in the property overrides, and every change the run creates - including those created by a child workflow run - inherits them. A change step that sets `opschain.env` itself wins for the names it sets. |
| **Property overrides** | The values of any [variables](/key-concepts/properties.md#workflow-run-property-overrides) the workflow declares, plus any `opschain` settings its changes should run with. Only the `opschain` key is passed on to the changes the run creates; every other key is a variable value for the workflow definition and applies to nothing else. Stored properties are unchanged. The editor provides JSON schema autocomplete and inline validation. If OpsChain rejects the overrides when the run is submitted, the panel reopens with the reason shown under the editor. |
| **Notify** | Custom notification settings for this workflow run. |
| **Metadata** | Custom JSON stored against the workflow run, which you can [filter the activity table by](#searching-by-metadata) later. The top-level `opschain` key is reserved for OpsChain's own bookkeeping - supplying it is reported under the editor as you type. |

Choosing a different workflow or version reseeds the property overrides from that version's sample properties, and flashes the panels holding what it replaced. The version the dialog opens on is left as it is, so repeating a run keeps the overrides and metadata it was started with.

Once the workflow run is created, it appears in the activity or scheduled activity table, where you can follow its progress and open its [details](/getting-started/familiarisation/gui/activity_details.md).
