---
sidebar_position: 6
description: ''
---

# Scheduled activities

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
