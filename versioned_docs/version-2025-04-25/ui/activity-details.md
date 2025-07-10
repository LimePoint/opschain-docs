---
sidebar_position: 6
description: ''
---

# Activity details

The activity details screen is a critical component of MintPress, providing in-depth information about specific changes and workflow runs within a project. This guide will help you navigate these details screens, understand the execution progress of changes and workflows, and manage them effectively.

## Accessing the activity details screen

To view the details of a particular change or workflow run:

1. Access the list of activity by selecting the _activity_ option in the navigation bar.
2. Click on a specific activity ID to open the details screen.

## Understanding the activity details screen

<p align='center'>
  <img alt='Activity details screen' src={require('!url-loader!./activity-details.png').default} className='image-border'/>
</p>

The activity details screen is divided into several sections, providing a comprehensive overview of the activity's lifecycle.

### Header information

<p align='center'>
  <img alt='Activity header details screen' src={require('!url-loader!./activity-header-details.png').default} className='image-border'/>
</p>

| Information                       | Description                                                                                        |
|-----------------------------------|----------------------------------------------------------------------------------------------------|
| **Target (project, environment)** | Indicates the environment and project where the activity is being run.                             |
| **Action name**                   | The name of the action being executed.                                                             |
| **Status & execution duration**   | Displays the status of the change or workflow run, and duration.                                   |
| **Git reference**                 | Shows the Git reference associated with the activity, including the remote, revision, and the SHA. |
| **Metadata**                      | Displays the metadata that was supplied when the activity was created.                             |

### Change tabs: step tree and logs

For changes, two tabs are available: The step tree of the change, and the logs of the change.

#### Step tree

<p align='center'>
  <img alt='Step tree screen' src={require('!url-loader!./activity-step-tree.png').default} className='image-border'/>
</p>

The step tree tab visualises the following:

- Sequence and hierarchy of steps involved in the change or workflow run
- Each step is represented as a node within the tree, with execution progress indicated
- Real time execution progress is shown next to each step, indicating the time each step took or has been taking to execute

The arrangement and execution flow of steps are visually depicted from top to bottom and left to right. MintPress initiates with the foremost step, navigating through to any sub-steps (children) in a left-to-right manner before moving to subsequent steps positioned below (top-down).

##### Navigating the step tree view

Zoom in/zoom out: Use the plus (+) and minus (-) buttons to zoom in or out the step tree for a clearer view.

##### Step execution strategy

The step tree represents all the steps of the change or workflow run and the execution strategy that was defined for the action. Steps can be executed sequentially or in parallel.

| Execution mode | Description                                                                                               |
|----------------|-----------------------------------------------------------------------------------------------------------|
| **Sequential** | Steps follow a linear progression, where each step commences only after the preceding step has concluded. |
| **Parallel**   | Steps occur concurrently, without needing the step to be completed before another begins.                 |

An icon indicating branching represents points where steps are set to execute in parallel, offering a clear visual cue of the execution strategy at play.

:::note
The execution strategy for an action is fixed and determined by the author of the action. Users cannot alter this strategy from sequential to parallel or vice versa. This design choice ensures consistency and reliability in the execution of changes and workflows.
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

Where a change or workflow includes wait steps or approval steps, the following additional statuses are available:

| Status                              | Description                                                                                                                                                                              |
|-------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Waiting for manual continuation** | The step requires a user to manually continue the step, using the continue option in the step's "triple dot" menu.                                                                       |
| **Waiting for approval**            | The step requires approval from a user in the appropriate LDAP group to continue the change/workflow. The step's "triple dot" menu provides approve and reject options for the approver. |

#### Change logs

<p align='center'>
  <img alt='Change logs screen' src={require('!url-loader!./activity-change-log.png').default} className='image-border'/>
</p>

The change logs tab contains detailed logs related to a change. Access this tab to review comprehensive log information that can help in troubleshooting and understanding the change's impact.

#### Step logs

<p align='center'>
  <img alt='Step log screen' src={require('!url-loader!./activity-step-log.png').default} className='image-border'/>
</p>

To view the log for a specific step, click on the icon to the right of the step name. This will then display the step logs for that particular step.

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
  <img alt='Workflow run tree' src={require('!url-loader!./activity-workflow.png').default} className='image-border'/>
</p>
