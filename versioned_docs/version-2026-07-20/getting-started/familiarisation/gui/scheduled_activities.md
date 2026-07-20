---
sidebar_position: 6
description: ''
---

# Scheduled activities

## About scheduled activities

Both changes and workflow runs can be scheduled to run on a future date and configured to run on a repeated schedule. This is referred to as a _scheduled activity_.

Scheduled activities are configured in OpsChain to automatically create and deploy changes or workflow runs in a project, environment or asset:

- at a particular time, on a recurring cron schedule
- in response to project Git repository updates (scheduled changes only)

## Understanding the scheduled activity screen

A table view is presented upon accessing the scheduled activity screen. This view organises scheduled changes and scheduled workflows, allowing users to track, review, and manage upcoming activities.

### Scheduled activity details

<p align='center'>
  <img alt='Scheduled activity screen' src={require('!url-loader!./images/scheduled-activity.png').default} className='image-border'/>
</p>

Each row includes:

| Column              | Description                                                                                                                    |
|---------------------|--------------------------------------------------------------------------------------------------------------------------------|
| **Target**          | Indicates the project or environment against which the activity is scheduled to run.                                           |
| **Type**            | Indicates how the schedule is triggered, either by a scheduled run or via a new commit.                                        |
| **Action**          | The action that will be executed.                                                                                              |
| **Next run at**     | Timestamp for when the activity is next scheduled to run.                                                                      |
| **Repeats**         | Whether the scheduled activity is recurring or will run only once.                                                             |
| **Enabled**         | Whether the scheduled activity is enabled or not (e.g. because its parent has been archived).                                  |
| **Scheduled by**    | The user who scheduled the activity.                                                                                           |
| **Created at**      | Timestamp for when the scheduled activity was created.                                                                         |

#### Buttons & links

| Buttons & links               | Function                                                               |
|-------------------------------|------------------------------------------------------------------------|
| **Bulk actions**              | Perform operations on multiple scheduled activities, such as deletion. |
| **Search bar**                | Filter the contents of the table based on these criteria.              |
| **Columns**                   | Hide or display columns in the table.                                  |

## Triggering on new commits only

When creating a scheduled change, you can decide whether it only creates a change if there are new commits in the Git repository since the previous run.

| New commits only | Git revision has new commits | OpsChain change created |
|:-----------------|:-----------------------------|:------------------------|
| true             | true                         | true                    |
| true             | false                        | false                   |
| false            | n/a                          | true                    |

:::note
If the current commit on the relevant Git revision (for example `master`) hasn't been used in a change for the chosen action and target, then a new change will be created straight away as part of this scheduled change.

It can take a minute for OpsChain to detect Git updates and create the new change.
:::

As more commits are added to the Git repository, new changes will be created. Scheduled changes poll the project's Git repository for new commits on the Git revision. If multiple commits occur on the relevant Git revision between polls then only one scheduled change will be created with the latest commit.

## Creating and deleting a scheduled activity

Scheduled changes and workflow runs can be created from the [run dialog](/getting-started/familiarisation/gui/activity.md#run-change) by configuring its schedule in the _Schedule_ tab.

To delete one or more scheduled activities, select the rows you wish to remove using the checkboxes, then choose _delete selected_ from the _bulk actions_ drop down.
