---
sidebar_position: 6
description: ''
---

# Activity details

The activity details screen is a critical component of OpsChain, providing in-depth information about specific changes and workflow runs. This guide will help you navigate these details screens, understand the execution progress of changes and workflows, and manage them effectively.

## Accessing the activity details screen

To view the details of a particular change or workflow run:

1. Access the list of activity by selecting the _activity_ option in the left sidebar.
2. Click on a specific activity ID to open the details screen.

## Understanding the activity details screen

<p align='center'>
  <img alt='Activity details screen' src={require('!url-loader!./images/activity-details.png').default} className='image-border'/>
</p>

The activity details screen is divided into several sections, providing a comprehensive overview of the activity's lifecycle.

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
| **Blocked by queue**              | If the activity is blocked by other items in the queue, a dropdown will be shown with the name of the activity that is blocking it. |
| **Timing information**            | Displays the relevant timing information for the activity, including the creation date, when the activity started running, when it has finished and how long it took from start to finish. |
| **Git reference**                 | Shows the Git reference associated with the activity, including the remote, revision, and the SHA it resolved to. If the activity is for a templated asset, it will show the template version name used in the change. |

### Change activity tabs

For changes, available tabs include:

- the change's step tree
- the change's logs
- the change's properties and properties overrides
- the change's metadata

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

##### Step lifecycle

Steps transition between status as they execute.

| Status           | Description                                                                                                                                                                                      |
|------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Initializing** | When a change or workflow run is created, its state is set to _initializing_ whilst the Git commit is being validated.                                                                           |
| **Pending**      | A change or workflow run remains in the _pending_ status while waiting for any existing activity in the same environment to finish. A step remains pending until its prerequisites are complete. |
| **Aborted**      | If a step fails or is cancelled, any steps in the same change or workflow run that are still pending will be set to the _aborted_ state.                                                         |
| **Queued**       | When a step starts executing, it enters the _queued_ state. Steps stay queued while waiting for an OpsChain worker to start executing them (e.g. if all workers are already busy).               |
| **Running**      | Whilst a step is actively executing, it is in the _running_ state.                                                                                                                               |
| **Error**        | If the step fails, it transitions to the _error_ state.                                                                                                                                          |
| **Success**      | If the step succeeds, it transitions to the _success_ state.                                                                                                                                     |
| **Removed**      | If the step is removed on another action's execution, it is marked as _removed_.                                                                                                                                   |

When a change or workflow includes wait steps or approval steps, the following additional statuses are available:

| Status                              | Description                                                                                                                                                                              |
|-------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Waiting for manual continuation** | The step requires a user to manually continue the step, using the continue option in the step's "triple dot" menu.                                                                       |
| **Waiting for approval**            | The step requires approval from a user or member of the appropriate LDAP group to continue the change/workflow. The step's "triple dot" menu provides approve and reject options for the approver. |

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

#### Step logs

<p align='center'>
  <img alt='Step log screen' src={require('!url-loader!./images/activity-step-log.png').default} className='image-border'/>
</p>

To view the log for a specific step, click on the icon to the right of the step name. This will then display the step logs for that particular step.

#### Metadata

The metadata tab displays the metadata that the change ran with.

### Managing changes

Depending on the status of the change, you will see either an _approve_, _reject_, _cancel_, or _retry_ button.

| Button             | Description                                                                                      |
|--------------------|--------------------------------------------------------------------------------------------------|
| **Approve/reject** | Visible when a change requires human approval before it runs.                                    |
| **Cancel**         | Visible when a change is currently running. Clicking this will halt the execution of the change. |
| **Retry**          | Shown if a change has failed, allowing you to attempt to re-execute the change.                  |

:::note
If a change is cancelled, all finalised steps (i.e. in the success or error state) remain in their existing state, and all pending, queued, or running steps are transitioned to the aborted state. There is no rollback of any kind; steps that have not yet started will not start, and steps that are in progress are stopped immediately.
:::

### Workflow run details

For a workflow run, the step tree is shown in the same style as the [change step tree](#step-tree).

<p align='center'>
  <img alt='Workflow run tree' src={require('!url-loader!./images/activity-workflow.png').default} className='image-border'/>
</p>
