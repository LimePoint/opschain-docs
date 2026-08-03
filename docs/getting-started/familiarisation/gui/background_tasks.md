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

| Buttons & links | Function                                                                           |
|-----------------|------------------------------------------------------------------------------------|
| **Search bar**  | Filter the tasks listed in the table.                                              |
| **Columns**     | Hide or display columns in the table.                                              |
| **Cancel**      | Cancel the task on that row, after confirming. Requires administrative privileges. |

## Cancelling a background task

Selecting **Cancel** on a row, and confirming, stops that task. This is useful when a task is no longer wanted — for example, an action refresh triggered against the wrong template version, or a task holding a concurrency slot that more urgent work is waiting on.

Cancelling a task does not undo any work it had already completed, and does not affect the node itself. The task is marked as cancelled and removed from this list, and remains visible in the node's own task history.

Cancelling an action generation task also cancels any MintModel concretisation task it started, so a refresh does not leave concretisation work running behind it. A task that has already finished cannot be cancelled.

A long-running task is not necessarily stuck. An agent image build in particular can legitimately take several minutes, and a task shown as initialising may simply be waiting for capacity under a concurrency limit such as [`concurrent.refresh_limit`](/key-concepts/settings.md#concurrentrefresh_limit). Check the task's log on its owning node before cancelling it.

:::note
The equivalent API endpoint is `GET /api/admin/node_background_tasks`. See the [API reference](pathname:///api-docs/#tag/Admin-operations).
:::
