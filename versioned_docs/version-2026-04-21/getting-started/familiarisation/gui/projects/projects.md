---
sidebar_position: 1
description: ''
---

# Project details

OpsChain uses projects to organise environments, assets, changes, and workflows. A project can contain environments and assets. Changes can be deployed against projects, environments, and assets. Workflows can only be executed within a project.

This guide covers the navigation and usage of the projects and the individual project details screens.

## Navigating to the projects screen

To view and manage your projects:

1. [Log in](/getting-started/familiarisation/gui/login.md) to the GUI.
2. Access _projects_ from the navigation bar to see a table of all projects.

### Features of the projects screen

<p align='center'>
  <img alt='Projects screen' src={require('!url-loader!../images/projects.png').default} className='image-border'/>
</p>

The projects screen displays a table with several important columns:

| Column           | Description                                                                                        |
|------------------|----------------------------------------------------------------------------------------------------|
| **Name**         | The name of each project.                                                                          |
| **Code**         | A unique identifier for the project.                                                               |
| **Description**  | A brief summary or purpose of the project.                                                         |
| **Archived**     | This column indicates the archival status of the project, showing whether it has been archived.    |

:::info
If you don't see any project in the list, it is possible that either no projects have been created or you have not been granted access to any projects.
:::

#### Buttons & links

| Buttons & links               | Function |
|-------------------------------|----------|
| **Bulk actions**              | When projects are selected, allows you to archive or restore the selected projects.   |
| **Search**                    | Allows you to search projects by name, code and description.                        |
| **Columns**                   | Hide or display columns in the table. |
| **Create project**            | Add a new project. |
| **Show archived projects**    | Toggle to show archived projects in the table. |

## Managing projects in the table

- Use checkboxes to select multiple projects for bulk operations.
- Click on a column heading to sort the contents of the table.
- Click on a project's name to navigate to its detailed view.

## Creating a project

<p align='center'>
  <img alt='Create project screen' src={require('!url-loader!../images/project-create.png').default} className='image-border'/>
</p>

To create a new project, follow these steps:

1. Click on the _create project_ button.
2. Fill in the mandatory fields in the dialog, including the project name and code.
3. (Optional) Add a description to clarify the project's purpose for other users.
4. Click the _create project_ button to finalise the creation of your project. You will then be taken to the project details screen for the newly created project.

:::tip
The values entered for _name_ and _code_ must be unique. i.e. There cannot be more than one project with the same code or name.
:::

## Understanding the project details screen

Once you've selected a project, you'll be taken to its details screen, which includes several features:

### Features of the project details screen

<p align='center'>
  <img alt='Project details screen' src={require('!url-loader!../images/project-details.png').default} className='image-border'/>
</p>

This screen manages and defines the available assets, environments, properties, settings, asset templates, workflows, and Git remotes.

#### Buttons & links

| Buttons & links        | Function                                                  |
|------------------------|-----------------------------------------------------------|
| **Pencil icon**        | Allows you to edit the details of associated data.        |
| **Toolbar**            | Filter the contents of the table based on these criteria. |
| **Columns**            | Hide or display columns in the table.                     |
