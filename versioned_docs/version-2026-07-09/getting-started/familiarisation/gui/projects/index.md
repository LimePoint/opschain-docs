---
description: 'Information about the projects screen'
---

# Projects

OpsChain uses projects to organise environments, assets, changes, and workflows. A project can contain environments, agents, assets and workflows. Changes can be deployed against projects, environments, and assets. Workflows can only be executed within a project.

This guide covers the navigation and usage of the projects screen.

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
| **Project type** | The type of project, either _Enterprise_ or _Standard_. Standard projects can only have environments and Git remotes.                                                                                                                |
| **Archived**     | This column indicates the archival status of the project, showing whether it has been archived.    |

:::info
If you don't see any project in the list, it is possible that either no projects have been created or you have not been granted access to any projects.
:::

#### Buttons & links

| Buttons & links               | Function |
|-------------------------------|----------|
| **Bulk actions**              | When projects are selected, allows you to archive or restore the selected projects.   |
| **Search**                    | Allows you to search projects by name, code and description.                        |
| **Show archived projects**    | Toggle to show archived projects in the table. |
| **Columns**                   | Hide or display columns in the table. |
| **Create project**            | Add a new project. |

## Managing projects in the table

- Use checkboxes to select multiple projects for bulk operations.
- Click on a column heading to sort the contents of the table.
- Click on a project's name to navigate to its detailed view.

### Archiving a project

To remove a project from day-to-day visibility without losing its history, you can archive it. Use the checkboxes in the projects table to select one or more projects, then choose _Archive projects_ from the _Bulk actions_ menu. Archived projects are hidden from the table by default - toggle _Show archived_ to bring them back into view.

Archiving a project has knock-on effects across everything it owns:

- All of the project's environments, assets and asset templates are archived too.
- Every scheduled activity in the project (and in its child environments and assets) is disabled and will not run.
- Attempts to create a new change, workflow run or scheduled activity in the project (or any of its children) will be rejected with an error reflecting the archived status.

:::info
A project cannot be archived if it contains a queued or running activity. Wait for those activities to complete (or cancel them) before archiving.
:::

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
