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

Select **Add cleanup job** and give the job a name, the resource paths it applies to, the items it removes and a schedule — run it once now, once at a later time, or repeatedly on a [cron schedule](/getting-started/familiarisation/gui/scheduled_activities.md#setting-a-schedule). Before saving, **Preview items for deletion** reports what the job would remove if it ran against the current data, so a job can be checked before it is scheduled rather than after it has run.

### What a cleanup job can remove

A job removes only what you tick, and each option has its own filters. An option with no filter set removes everything it covers for the job's resource paths, and the form says so.

| Option | Removes |
|--------|---------|
| **Delete activities (change and workflow runs)** | Changes and workflow runs, along with their events, logs and steps. |
| **Delete audit history** | [Events](/key-concepts/events.md). |
| **Delete job history** | The records of the background jobs OpsChain has run. |
| **Delete agent images** | Agent container images that are no longer referenced, from the internal registry — see [container image cleanup](/operations/maintenance/container-image-cleanup.md). |
| **Delete superseded background tasks** | Finished [background tasks](/getting-started/familiarisation/gui/background_tasks.md) that a newer task of the same kind has replaced, and their logs. |

**Delete agent images** only removes the image of a build that has finished, so an image a running build is still pushing is left alone. Its filters are checked when the job is saved rather than when it runs, so a filter OpsChain cannot apply is refused with the reason — a job saved with such a filter before this was checked has to have it corrected before the job can be saved again.

Superseded background tasks are worth a note, because an errored MintModel generation can hold a large volume of render logs and nothing else removes them. A task counts as superseded only when a newer task of the same kind exists against the same template version history record — a new record is created whenever a resource's template version or commit changes, so tasks recorded against an earlier record are kept. Tasks that are still needed are kept whatever the filters say: the latest successful action generation, tasks a change or a running agent still references, and agent image build tasks whose image is still in the registry. Those last ones are only removed once **Delete agent images** has removed the image, so tick both to reap them together.

:::caution
Removing an activity destroys everything recorded with it, including its events, logs and steps. Preview a new job before enabling it, and be careful with resource paths ending in `%` — they match a node and every node beneath it.
:::

## Reviewing what a cleanup job has removed

Select a job to open it. The **Cleanup job runs** tab lists each time the job has run, what kind of data each run removed, how many items it removed and the filters that run applied, so you can confirm a job is removing what you intended. The job's own card summarises the filters set against each of its options. The **View/edit job details** tab shows the job's configuration and is where it is changed.

A job that has already run and cannot run again keeps the name and schedule it ran with — both are read only, so its history stays an accurate record of what it did. Create a new job instead.

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
