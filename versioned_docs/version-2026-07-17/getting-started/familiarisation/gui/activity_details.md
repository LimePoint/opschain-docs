---
sidebar_position: 6
description: ''
---

# Activity details

The activity details screen is a critical component of OpsChain, providing in-depth information about specific changes and workflow runs. This guide will help you navigate these details screens, understand the execution progress of changes and workflows, and manage them effectively.

## Accessing the activity details screen

To view the details of a particular change or workflow run:

1. Access the list of activity by selecting the _activity_ option in the left sidebar.
2. Click on a specific activity row in the table to open the details screen.

## Understanding the activity details screen

<p align='center'>
  <img alt='Activity details screen' src={require('!url-loader!./images/activity-details.png').default} className='image-border'/>
</p>

The activity details screen is divided into several sections, providing a comprehensive overview of the activity's lifecycle.

While a change or workflow run is open, the browser tab's title and icon also reflect its current status, so you can keep track of progress even when working in another tab.

### Header information

<p align='center'>
  <img alt='Activity header details screen' src={require('!url-loader!./images/activity-header-details.png').default} className='image-border'/>
</p>

From left to right:

| Information                       | Description                                     |
|-----------------------------------|-------------------------------------------------|
| **Status icon**                   | An icon representing the activity's status.     |
| **Action name**                   | The name of the action being executed.          |
| **Started by**                    | The name of the user that initiated the action. |
| **Status**                        | The current status of the activity. |
| **Blocked by queue**              | If the activity is blocked by other items in the queue, a dropdown will be shown with the name of the activities that are blocking it. |
| **Timing information**            | Displays the relevant timing information for the activity, including the creation date and all the status transitions such as when the activity started running, when it has finished, etc. |
| **Git reference**                 | Shows the Git reference associated with the activity, including the remote, revision, and the SHA it resolved to. If the activity is for a templated asset, it will show the template version name used in the change. |

### Change activity tabs

For changes, available tabs include:

- the change's step tree
- the change's logs
- the change's properties
- the change's settings
- the change's MintModel, if any was used
- the change's metadata, if any was added

#### Step tree

<p align='center'>
  <img alt='Step tree screen' src={require('!url-loader!./images/activity-step-tree.png').default} className='image-border'/>
</p>

The step tree tab visualises the following:

- Sequence and hierarchy of steps involved in the change or workflow run
- Each step is represented as a node within the tree, with the execution progress being indicated via the node's colour
- Real time execution progress is shown next to each step, indicating the time each step took or has been taking to execute.

The arrangement and execution flow of steps are visually depicted from top to bottom and left to right. OpsChain initiates with the foremost step, navigating through to any sub-steps (children) in a left-to-right manner before moving to subsequent steps positioned below (top-down).

##### Step execution strategy

The step tree represents all the steps of the change or workflow run and they are organised based on the execution strategy that was defined for the action. Steps can be executed sequentially or in parallel.

| Execution mode | Description                                                                                               |
|----------------|-----------------------------------------------------------------------------------------------------------|
| **Sequential** | Steps follow a linear progression, where each step commences only after the preceding step has concluded. |
| **Parallel**   | Steps occur concurrently, without needing the step to be completed before another begins.                 |

When a step's children run in sequential mode, its children will be connected by a single arrow line, top to bottom. When a step's children run in parallel mode, its children will be connected by parallel arrow lines.

:::note
The execution strategy for an action is fixed and determined by the author of the action. Users cannot alter this strategy from sequential to parallel or vice versa. This design choice ensures consistency and reliability in the execution of changes and workflow runs.
:::

:::info
By default, all steps of a change run inside the same isolated container. You can configure a change to run each step in its own isolated container by enabling the [`pod_per_change_step`](/key-concepts/settings.md#pod_per_change_step) setting on the project, environment or asset.
:::

###### Behaviour when a child step fails

The execution strategy also determines how OpsChain handles failures among sibling steps:

- _Sequential:_ OpsChain terminates the change at the completion of the failed child step and any remaining sibling steps will not run.
- _Parallel:_ OpsChain allows all siblings of the failed child step to complete and then terminates the change.

The change status will transition to `error` when OpsChain terminates the change. See [behaviour when a child step fails](/key-concepts/changes.md#behaviour-when-a-child-step-fails) for the underlying concept.

##### Step lifecycle

Steps transition between status as they execute. The table below lists the statuses shown in the GUI; see the [change and step lifecycle](/key-concepts/changes.md#change--step-lifecycle) reference for the underlying transitions.

| Status           | Description                                                                                                                                                                                      |
|------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Initializing** | When a change or workflow run is created, its state is set to _initializing_ whilst the Git commit is being validated.                                                                           |
| **Pending**      | A change or workflow run remains in the _pending_ status while waiting for any existing activity in the same environment to finish. A step remains pending until its prerequisites are complete. |
| **Aborted**      | If a step fails or is cancelled, any steps in the same change or workflow run that are still pending will be set to the _aborted_ state.                                                         |
| **Queued**       | When a step starts executing, it enters the _queued_ state. Steps stay queued while waiting for an OpsChain worker to start executing them (e.g. if all workers are already busy).               |
| **Running**      | Whilst a step is actively executing, it is in the _running_ state.                                                                                                                               |
| **Error**        | If the step fails, it transitions to the _error_ state.                                                                                                                                          |
| **Success**      | If the step succeeds, it transitions to the _success_ state.                                                                                                                                     |
| **Skipped**      | If the step is skipped either because it was successfully run previously or was marked for skipping during a change retry.                                                                                                                                     |
| **Removed**      | If the step is removed on another action's execution, it is marked as _removed_.                                                                                                                                   |

When a change or workflow includes wait steps or approval steps, the following additional statuses are available:

| Status                              | Description                                                                                                                                                                              |
|-------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Waiting for manual continuation** | The step requires a user to manually continue the step, using the continue option in the step's "triple dot" menu.                                                                       |
| **Waiting for approval**            | The step requires approval from a user or member of the appropriate LDAP group to continue the change/workflow. The step's "triple dot" menu provides approve and reject options for the approver. |

:::info
By default, OpsChain allows multiple changes to execute for a given project, environment or asset, but only one with the same action name. This reduces the risk of concurrent changes interfering with each other's properties updates. If your actions can safely run concurrently, you can relax this restriction via the [allow parallel runs of the same change](/key-concepts/settings.md#allow_parallelruns_of_same_change) setting.
:::

###### Filtering steps by status

On the left side of the step tree, you can filter the steps by their respective statuses. Use the forward and backward buttons to navigate through the steps that match the selected status.

##### Navigating the step tree view

On the right side of the step tree, you will see the following buttons:

- Search: Toggle the search bar to search for a specific step in the step tree. You can use the forward and backward buttons to navigate through the search results.
- Fit to width: Use the fit to width button to adjust the step tree to the width of the screen.
- Fit entire tree: Use the fit entire tree button to adjust the step tree to fit entirely within the screen.
- Zoom in/zoom out: Use the plus (+) and minus (-) buttons to zoom in or out the step tree for a clearer view.

#### Change logs

<p align='center'>
  <img alt='Change logs screen' src={require('!url-loader!./images/activity-change-log.png').default} className='image-border'/>
</p>

The change logs tab contains detailed logs related to a change. Access this tab to review comprehensive log information that can help in troubleshooting and understanding the change's impact.

You can toggle the `System logs` option to show or hide OpsChain-specific logs, such as image building, etc.

#### Step logs

<p align='center'>
  <img alt='Step log screen' src={require('!url-loader!./images/activity-step-log.png').default} className='image-border'/>
</p>

To view the log for a specific step, click on the icon to the right of the step name. This will then display the step logs for that particular step and its children. You can disable children logs by toggling the `Include child logs` checkbox. You can also toggle the `Status logs` option to show or hide the pod status logs for that step.

#### Metadata

The metadata tab displays the metadata that the change ran with.

#### Properties

The properties tab displays all properties that the change ran with, converged from its parent project, environment, asset and Git repository. This tab also allows you to compare the properties between all its stages during the change's lifecycle, allowing you to see how each step modified the properties.

:::tip[Show sources button]
When looking at the properties, you can click the "Show sources" button to see the source of each property.
:::

Read more about properties in the [properties concept page](/key-concepts/properties.md).

#### Settings

The settings tab displays the settings overrides that the change ran with, converged from its parent project, environment and asset. You can read more about settings in the [settings concept page](/key-concepts/settings.md).

#### MintModel

The MintModel tab displays the MintModel that was used to run the change. You can read more about MintModel changes in the [MintModel asset templates guide](/getting-started/familiarisation/gui/projects/asset_templates.md#asset-templates-with-a-mintmodel).

### Managing changes

Depending on the status of the change, you will see either an _approve_, _reject_, _cancel_, _retry_, or _watch_ button.

| Button             | Description                                                                                                                                                                                      |
|--------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Approve/reject** | Visible when a change requires human approval before it runs.                                                                                                                                    |
| **Cancel**         | Visible when a change is currently running. Clicking this will halt the execution of the change.                                                                                                 |
| **Retry**          | Shown if a change has failed, allowing you to attempt to re-execute the change.                                                                                                                  |
| **Watch (bell)**   | Visible while a change or workflow run is active. Click to receive a browser desktop notification when the run completes. See [browser notifications](#browser-notifications) for setup details. |

:::note
If a change is cancelled, all finalised steps (i.e. in the success or error state) remain in their existing state, and all pending, queued, or running steps are transitioned to the aborted state. There is no rollback of any kind; steps that have not yet started will not start, and steps that are in progress are stopped immediately.
:::

#### Retrying a change

When you retry a change, OpsChain duplicates the existing change as a new change and starts it from where the previous attempt ended. A dialog is presented with all the steps in a hierarchical order allowing you to mark steps to skip during a retry. You can only skip the ones that have failed or have not run yet. The retry uses the resolved Git SHA stored with the original change, and the logs from the original change remain on the original change's details page.

See [retrying changes](/key-concepts/changes.md#retrying-changes) for the full set of caveats - including which steps are rerun and when you should instead create a new change.

#### Repeating a change

When you repeat a change, OpsChain starts a fresh change using the same properties, settings and Git revision. When repeating a change for an asset, the new change will use the asset's current template version. The change's [run options](/getting-started/familiarisation/gui/activity.md#run-change) - whether to automatically continue wait steps and whether to build without cache - are carried over into the repeat dialog, where you can adjust them before running.

#### Browser notifications

OpsChain can show a browser desktop notification when a watched change or workflow run completes, so you can navigate away and be alerted without checking the page.

To set up browser notifications:

1. Open the user menu (top right) and select _notification preferences_.
2. In the _browser notifications_ section, enable the toggle and click _request permission_ to grant the browser the required permission.

Once enabled, a bell icon appears in the actions bar of any active change or workflow run. Click it to start watching that run — the bell turns highlighted to confirm. Click again to stop watching. When the run completes, a notification pops up with a link back to the details page.

:::tip[Auto-watch]
Enable the _auto-watch active runs_ option in Notification preferences to automatically watch every active change or workflow run you open, without needing to click the bell each time.
:::

:::note[Limitations]

- **Tab must stay open.** Notifications are driven by polling in the browser tab. Closing the browser or all OpsChain tabs stops the watcher — there is no background service that can deliver notifications when no tab is open.
- **Per-browser, per-device.** The watch list and settings are stored in browser local storage and are not synced across devices or browsers. You need to enable the feature separately in each browser you use.
- **Browser permission is required.** If you dismiss the permission prompt or your browser is set to block notifications, you must re-enable it in your browser's site settings — OpsChain cannot prompt you again automatically once permission has been denied.
- **OS-level do-not-disturb.** Your operating system's focus assist or do-not-disturb mode may suppress browser notifications regardless of browser settings.
- **Multiple tabs deduplicated.** If you have the same run open in more than one tab, only one notification fires. OpsChain coordinates across tabs automatically.

:::

### Workflow run details

For a workflow run, the step tree is shown in the same style as the [change step tree](#step-tree).

<p align='center'>
  <img alt='Workflow run tree' src={require('!url-loader!./images/activity-workflow.png').default} className='image-border'/>
</p>
