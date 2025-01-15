---
sidebar_position: 5
description: ''
---

# Activity

Welcome to the activity screen in MintPress. This guide will help you navigate through the activity screen, where you can view the status of activity (changes and workflow runs) in either a card or table view.

## Accessing the activity screen

To view recent activity in MintPress:

1. [Log in](/docs/ui/login.md) to the GUI.
2. Click on _activity_ on the navigation bar on the left side.

## Understanding the activity screen

Upon accessing the activity screen, the default table view is presented. This view organises changes and workflow runs into a structured table that displays key information at a glance. While the default view is the table view, you can switch to the card view for a different visual representation of the same information.

:::tip

- Monitor activity to ensure smooth operations.
- In the card view, use the metadata toggle to gain insights into the business process details for activity. E.g. a change request ID.
- The card view is particularly useful for a visual overview, while the table view can be used for detailed analysis.

:::

### Table view details

<p align='center'>
  <img alt='Activity table view screen' src={require('!url-loader!./activity-table-view.png').default} className='image-border'/>
</p>

Each row includes:

| Column              | Description                                                                                                                    |
|---------------------|--------------------------------------------------------------------------------------------------------------------------------|
| **ID**              | A unique identifier for each change or workflow run. It is also used to navigate to the change or workflow run details screen. |
| **Action**          | The action that was executed.                                                                                                  |
| **Target**          | Indicates the project, environment or asset against which the activity was run.                                                |
| **Status**          | Shows the current status of the change with colour-coded indicators; red:failure, green:success, yellow:running.               |
| **Started**         | Timestamp for when the activity began.                                                                                         |
| **Finished**        | Timestamp for when the activity ended.                                                                                         |
| **Revision**        | The Git reference for the commit used for the activity.                                                                        |
| **Started&nbsp;by** | The user who initiated the activity.                                                                                           |
| **Comments**        | Comments can be added by the initiator of the activity to provide extra context.                                               |

### Card view details

<p align='center'>
  <img alt='Activity card view screen' src={require('!url-loader!./activity-card-view.png').default} className='image-border'/>
</p>

Each card contains the following information:

| Element                                 | Description                                                                                                       |
|-----------------------------------------|-------------------------------------------------------------------------------------------------------------------|
| **Project, environment, action and ID** | The top of the card lists the project name, environment, and action (e.g., `project > environment > action > ID`) |
| **User**                                | Indicates who created, cancelled, or approved the activity.                                                       |
| **Status indicator**                    | A colour-coded icon indicates the current status of the activity (e.g., running, successful).                     |
| **Timestamp**                           | When the activity was started and its duration.                                                                   |
| **Source branch**                       | The source control branch from which the activity was deployed.                                                   |
| **Commit SHA**                          | The specific commit identifier associated with the activity.                                                      |

### Features

| Feature             | Function                                                              |
|---------------------|-----------------------------------------------------------------------|
| **Search**          | Search for specific changes using keywords.                           |
| **Time filter**     | Select a time period to filter the changes displayed.                 |
| **Metadata toggle** | Show or hide metadata for each change. Available in card view only.   |
| **CSV export**      | Export the list of changes to a CSV file.                             |
| **View toggle**     | Switch between card view and table view according to your preference. |

### Navigating to activity details

Click on the _ID_ hyperlink on the table view, or *>* icon on a change card, to be taken to the details screen for more in-depth information about that activity. See the [activity details UI reference guide](/docs/ui/activity-details.md).

:::tip Creating changes or running workflows
To ensure accuracy and relevance, changes and workflows can only be run from within the project, environment, or asset screens. This design is intentional, as each modification needs to be directly associated with a specific project, environment or asset. By navigating to the project, environment or asset screen, you can run changes and workflows and ensure they are correctly applied.
:::
