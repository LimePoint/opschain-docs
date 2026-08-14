---
sidebar_position: 14
description: Add, schedule, enable, disable and delete the cleanup jobs that remove old activities, events and job history.
---

# Data cleanup

## Understanding the data cleanup screen

OpsChain keeps every activity, event and job it records until something removes them, so an installation that has been running for a while can hold a large amount of history. Cleanup jobs remove that data on a schedule, for a chosen set of projects, environments and assets.

The **Data cleanup** section of the administration screen lists the cleanup jobs configured on your installation, and is where they are added, edited, enabled, disabled and deleted. See the [data cleaning](/operations/maintenance/data-cleaning.md) guide for how a job selects the nodes and the data it removes — a cleanup job is a data cleanup definition in the API.

Each row includes:

| Column         | Description                                                                                        |
|----------------|------------------------------------------------------------------------------------------------------|
| **Name**       | The name given to the job when it was created. Select the row to open the job.                     |
| **Next run**   | When the job is next scheduled to run. Empty for a job that is disabled or has no run left to make. |
| **Created by** | The user who created the job.                                                                      |
| **Created at** | Timestamp for when the job was created.                                                            |
| **Updated at** | Timestamp for when the job was last modified.                                                      |
| **Enabled**    | Whether the job runs on its schedule.                                                              |

### Buttons & links

| Buttons & links      | Function                                                                                             |
|----------------------|--------------------------------------------------------------------------------------------------------|
| **Search bar**       | Filter the jobs listed in the table.                                                                 |
| **Columns**          | Hide or display columns in the table.                                                                |
| **Checkboxes**       | Select one or more jobs to act on together. The number selected is shown at the bottom of the table. |
| **Bulk actions**     | Act on every selected job at once. Enabled once at least one job is selected.                        |
| **Add cleanup job**  | Create a new cleanup job.                                                                            |
| **Actions menu (⋮)** | Enable, disable or delete the job on that row.                                                       |

## Adding a cleanup job

Select **Add cleanup job** and give the job a name, the resource paths it applies to, the items it removes and a schedule — run it once now, once at a later time, or repeatedly on a cron schedule. Before saving, **Preview items for deletion** reports what the job would remove if it ran against the current data, so a job can be checked before it is scheduled rather than after it has run.

:::caution
Removing an activity destroys everything recorded with it, including its events, logs and steps. Preview a new job before enabling it, and be careful with resource paths ending in `%` — they match a node and every node beneath it.
:::

## Reviewing what a cleanup job has removed

Select a job to open it. The **Cleanup job runs** tab lists each time the job has run, what kind of data each run removed, how many items it removed and the filters it applied, so you can confirm a job is removing what you intended. The **View/edit job details** tab shows the job's configuration and is where it is changed.

## Enabling and disabling a cleanup job

Choose **Disable cleanup job** from a job's actions menu to stop it running. The job keeps its configuration and its history, and can be enabled again from the same menu.

**Enable** is unavailable for a job that has no run left to make, and the reason is given as a tooltip on the menu item:

| Reason                                                | What to do                                                                       |
|-------------------------------------------------------|-------------------------------------------------------------------------------------|
| The job has already run and is not set to repeat      | Edit the job to repeat, or give it a new run time                                 |
| The job has reached its maximum number of runs        | Edit the job to raise or clear its maximum run count                              |
| The job was scheduled to run at a time that has passed | Edit the job to give it a run time in the future, or a cron schedule              |
| The job has passed its end date                       | Edit the job to extend or clear its end date                                      |

Saving any of these changes schedules the job again, so it does not need to be recreated.

## Acting on several cleanup jobs at once

Tick the checkbox beside each job you want to act on, then choose **Bulk actions** → **Enable selected jobs**, **Disable selected jobs** or **Delete selected jobs**. Each confirmation lists the jobs it is about to act on, with their schedules, so you can check the selection before committing to it.

Each action applies only to the jobs it can act on — enabling skips the jobs that are already enabled and the jobs with no run left to make, and disabling skips the jobs that are already disabled. Where jobs are skipped because they have nothing left to schedule, the confirmation says how many.

Every selected job is acted on individually, so one failure does not abandon the rest. Each failure is reported separately, naming the job and the reason, and a job that succeeded stays changed. If none of the selected jobs could be changed, the confirmation stays open holding your selection so the action can be tried again.

## Permissions

Adding, editing, enabling and disabling a cleanup job require permission to update cleanup jobs, and deleting one requires permission to delete them. Where you hold neither, or only one of the two, the **Bulk actions** menu names the permission you are missing rather than implying that every action is unavailable.

:::note
The equivalent API endpoints are documented in the [API reference](pathname:///api-docs/#tag/Data-cleanup-definitions/).
:::
