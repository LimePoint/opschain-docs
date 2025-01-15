---
sidebar_position: 4
description: ''
---

# Environments

Environments are used to organise changes and assets within a project.

:::note
Environments within _standard_ type projects can't contain assets.
:::

## Accessing the environments table screen

To view all environments within a project:

1. [Log in](/docs/ui/login.md) to the GUI.
2. Click on _projects_ on the navigation bar on the left side.
3. Navigate to your desired project.
4. Click on the _environments_ tab to display the list of environments.

<p align='center'>
  <img alt='Environments screen' src={require('!url-loader!./environments.png').default} className='image-border'/>
</p>

:::info
Initially, no environments will be listed, so your next step would be to create an environment for this project.
:::

### Features of the environment table screen

- **Bulk operations**: Performs actions on multiple environments, such as archiving.
- **CSV export**: Exports the table of the environments to a CSV file.

### Environment table columns

| Column          | Description                                                                                                |
|-----------------|------------------------------------------------------------------------------------------------------------|
| **Name**        | Displays the name of each environment, which can be clicked to access the environment details screen.      |
| **Code**        | Shows a unique identifier for the environment.                                                             |
| **Description** | Provides a short summary or purpose of the environment.                                                    |
| **Archived**    | This column indicates the archival status of the environment, showing whether it has been archived or not. |

### Buttons & links

| Buttons & links        | Function                                                                           |
|------------------------|------------------------------------------------------------------------------------|
| **Create environment** | Add a new environment to the project in MintPress.                                 |
| **Bulk operations**    | Perform operations on multiple environments, such as archiving.                    |
| **CSV export**         | Download a CSV file listing environments for reporting or record-keeping purposes. |
| **Pencil icon**        | Allows you to edit the details of associated data.                                 |
| **Bookmarks icon**     | Provides access to the bookmarks defined for the environment.                      |

### Managing environments in the table

- Use checkboxes to select multiple environments for bulk operations.
- Click on a column heading to sort the contents of the table.
- Click on an environment's name to navigate to its detailed view.

### Exporting the environment table

To export the table of environments:

1. Click the _CSV export_ button.
2. The CSV file will be downloaded by your browser. Your browser may ask where to save the file or may save it automatically into your downloads directory.

:::info
The export function outputs all environments (archived and active) regardless of whether you select one or more environments via the checkbox.
:::

### Creating a new environment

<p align='center'>
  <img alt='Environment create' src={require('!url-loader!./environment-create.png').default} className='image-border'/>
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

You can view the details of an environment by clicking on its name.

## Environment details screen

<p align='center'>
  <img alt='Environment details screen' src={require('!url-loader!./environment-details.png').default} className='image-border'/>
</p>

This screen displays the activity (including changes), assets, properties and settings specific to this particular environment.

:::note
Environments within _standard_ type projects do not have the asset tab on the environment details page.
:::

### Activity tab

Lists the changes that have been deployed in this environment.

#### Creating a new change

<p align='center'>
  <img alt='Environment change create screen' src={require('!url-loader!./environment-change-create.png').default} className='image-border'/>
</p>

To initiate a new change:

1. Click the _create change_ button.
2. Fill in all the mandatory details in the form, such as _action_, _Git remote_, and _Git revision_.
3. Confirm the creation by clicking the _create change_ button.

Once the change is created, it will automatically appear in the activity table. You will be able to see the change being executed and the progress of the execution. You can also view the specific details for any change that is running.

:::note

1. The Git remote must be valid for the change creation to commence.
2. The Git revision will also be validated to ensure that it exists during change execution. If it does not, the change will still be executed but will result in a status of _error_.

:::

### Automated changes tab

This tab lists the automated changes defined for this environment.

### Assets tab

This tab lists the assets available for this environment.

:::note
_Standard_ type projects do not have the assets tab on the project details page.
:::

### Properties tab

A set of properties can be specified against an environment. The properties are then available to the actions that are executed within the environment. This allows the action to query the value and then influence the change.

### Settings tab

The settings tab allows you to specify configuration options that apply to the environment and its children.
