---
sidebar_position: 4
description: ''
---

# Environments

Environments are used to organise changes and assets within a project.

## Accessing the environments table screen

To view all environments within a project:

1. [Log in](/getting-started/familiarisation/gui/login.md) to the GUI.
2. Click on _projects_ on the navigation bar on the left side.
3. Navigate to your desired project.
4. Click on the _environments_ tab to display the list of environments.

<p align='center'>
  <img alt='Environments screen' src={require('!url-loader!../images/environments.png').default} className='image-border'/>
</p>

:::info
Just as with projects, if you don't see any environments in the list, it is possible that either no environments have been created for this project or you have not been granted access to any environments within it.
:::

### Environment table columns

| Column          | Description                                             |
|-----------------|---------------------------------------------------------|
| **Name**        | Displays the name of each environment.                  |
| **Code**        | Shows a unique identifier for the environment.          |
| **Description** | Provides a short summary or purpose of the environment. |

### Buttons & links

| Buttons & links        | Function                                                        |
|------------------------|-----------------------------------------------------------------|
| **Create environment** | Add a new environment to the project in OpsChain.               |
| **Bulk actions**       | Perform operations on multiple environments, such as archiving. |
| **Pencil icon**        | Allows you to edit the details of associated data.              |

### Managing environments in the table

- Use checkboxes to select multiple environments for bulk operations (archiving or restoring).
- Click on a column heading to sort the contents of the table.
- Click on an environment's row to navigate to its detailed view.

### Creating a new environment

<p align='center'>
  <img alt='Environment create' src={require('!url-loader!../images/environment-create.png').default} className='image-border'/>
</p>

To create a new environment, follow these steps:

1. Click on the _create environment_ button.
2. Fill in the mandatory fields in the dialog, including _name_ and _code_.
3. (Optional) Add a _description_ to clarify the purpose of the environment for other users.
4. Click the _create environment_ button to finalise the creation of your environment. You will then be taken to the environment details screen for the newly created environment.

:::tip
The values entered for name and code must be unique within a project. i.e. There cannot be more than one environment with the same code or name.
:::

### Viewing the environment details

You can view the details of an environment by clicking on its row.

## Environment details screen

<p align='center'>
  <img alt='Environment details screen' src={require('!url-loader!../images/environment-details.png').default} className='image-border'/>
</p>

This screen displays the changes, scheduled activities, assets, properties and settings specific to this particular environment and its child assets.

### Activity tab

Lists the changes that have been deployed in this environment. Refer to the [activities list](/getting-started/familiarisation/gui/activity.md#understanding-the-activity-screen) for a detailed description of this table's contents.

### Scheduled activities tab

This tab lists the scheduled activities defined for this environment. Refer to the [scheduled activity details](/getting-started/familiarisation/gui/scheduled_activities.md#scheduled-activity-details) for a detailed description of this table's contents.

### Assets tab

This tab lists the assets available for this environment. Refer to the [assets page](/getting-started/familiarisation/gui/projects/assets.md) for a detailed description of this table's contents.

### Properties tab

A set of properties can be specified against an environment. The properties are then available to the actions that are executed within the environment and its child assets. This allows the action to query the value and then influence the change. This tab lists the properties available for this environment. Refer to the [properties page](/getting-started/familiarisation/gui/projects/properties_and_settings.md#properties) for a detailed description of this table's contents.

### Settings tab

The settings tab allows you to specify configuration options that apply to the environment and its children. Refer to the [settings page](/getting-started/familiarisation/gui/projects/properties_and_settings.md#settings) for a detailed description of this table's contents.
