---
sidebar_position: 11
description: ''
---

# Background tasks

## Understanding the background tasks screen

Some of the work OpsChain performs does not belong to a change or a workflow run, and instead runs in the background against a node — refreshing an asset's available actions, concretising an asset's MintModel, building an agent's image, and starting or stopping an agent.

Each of these tasks is visible on the node it belongs to, but that is only useful if you already know which node to look at. The **Background tasks** tab, in the **System information** section of the administration screen, lists every background task currently running or queued across all projects, environments, assets and agents in one place. It refreshes automatically while you watch it.

<p align='center'>
  <img alt='Background tasks screen' src={require('!url-loader!./images/admin-background-tasks.png').default} className='image-border'/>
</p>

Only tasks that have not yet finished are listed, so an empty table means nothing is currently running. A task disappears from the list as soon as it succeeds, fails or is cancelled — the history of a node's completed tasks remains available on the node itself.

Each row includes:

| Column          | Description                                                                                                                                                  |
|-----------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Task type**   | The kind of work being performed — action generation, MintModel concretisation, agent image build, agent start or agent stop.                                |
| **Owning node** | The project, environment, asset or agent the task is running for. Select it to go to that node.                                                              |
| **Status**      | Whether the task is initialising (accepted, but not yet started — for example, waiting on pod capacity or a concurrency limit) or running, and for how long. |
| **Started at**  | Timestamp for when the task was created.                                                                                                                     |
| **Created by**  | The user who triggered the task, or the system where it was triggered automatically.                                                                         |

### Buttons & links

| Buttons & links  | Function                                                                                              |
|------------------|-------------------------------------------------------------------------------------------------------|
| **Search bar**   | Filter the tasks listed in the table.                                                                 |
| **Columns**      | Hide or display columns in the table.                                                                 |
| **Checkboxes**   | Select one or more tasks to act on together. The number selected is shown at the bottom of the table. |
| **Bulk actions** | Act on every selected task at once. Enabled once at least one task is selected.                       |
| **Cancel**       | Cancel the task on that row, after confirming. Requires administrative privileges.                    |

## Cancelling a background task

Selecting **Cancel** on a row, and confirming, stops that task. This is useful when a task is no longer wanted — for example, an action refresh triggered against the wrong template version, or a task holding a concurrency slot that more urgent work is waiting on.

Cancelling a task does not undo any work it had already completed, and does not affect the node itself. The task is marked as cancelled and removed from this list, and remains visible in the node's own task history.

Cancelling an action generation task also cancels any MintModel concretisation task it started, so a refresh does not leave concretisation work running behind it. A task that has already finished cannot be cancelled.

A long-running task is not necessarily stuck. An agent image build in particular can legitimately take several minutes, and a task shown as initialising may simply be waiting for capacity under a concurrency limit such as [`concurrent.refresh_limit`](/key-concepts/settings.md#concurrentrefresh_limit). Check the task's log on its owning node before cancelling it.

## Cancelling several tasks at once

Tick the checkbox beside each task you want to stop, then choose **Bulk actions** → **Cancel selected tasks**. This is the quicker route when a burst of work needs stopping — for example, after refreshing the actions of many assets that share a template.

The confirmation lists every task it is about to cancel, by task type and owning node, so you can check the selection before committing to it. Only a task that is still initialising or running can be cancelled, so a selected task that has finished in the meantime is left out of the list rather than being reported as a failure.

<p align='center'>
  <img alt='Cancelling several background tasks at once' src={require('!url-loader!./images/admin-background-tasks-bulk-cancel.png').default} className='image-border'/>
</p>

The tasks listed are fixed at the moment the confirmation opens, so a task completing in the background while you read it cannot change what gets cancelled. Each task is cancelled individually, and if some fail the confirmation reports how many of the selected tasks could not be cancelled, along with the reasons — the ones that succeeded stay cancelled.

Cancelling in bulk requires administrative privileges, the same as cancelling a single task. Without them the **Bulk actions** menu says so and the action cannot be chosen.

:::note
The equivalent API endpoint is `GET /api/admin/node_background_tasks`. See the [API reference](pathname:///api-docs/#tag/Admin-operations).
:::
