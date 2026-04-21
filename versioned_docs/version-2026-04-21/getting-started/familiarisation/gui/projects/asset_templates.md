---
sidebar_position: 6
description: ''
---

# Asset templates

## Listing asset templates

This tab lists all the asset templates created for the project.

<p align='center'>
  <img alt='Project asset templates screen' src={require('!url-loader!../images/project-asset-templates.png').default} className='image-border'/>
</p>

Each row includes:

| Column               | Description                                                                          |
|----------------------|--------------------------------------------------------------------------------------|
| **Name**             | The name describing the asset template.                                              |
| **Code**             | Shows the asset template's unique code.                                              |
| **Git remote**       | The Git remote associated with this template.                                        |
| **Newest version**   | The most recent version or Git revision associated with the asset template.          |
| **Enabled**          | A toggle button that enables or disables the asset template.                         |
| **Archived**         | Whether the asset template is archived or not.                                       |

:::note
Asset templates that are in use by an asset cannot be archived.
:::

### Buttons & links

| Buttons & links               | Function                                                               |
|-------------------------------|------------------------------------------------------------------------|
| **Bulk actions**              | Allows you to archive or restore multiple asset templates.             |
| **Search bar**                | Filter the contents of the table based on these criteria.              |
| **Columns**                   | Hide or display columns in the table.                                  |

## Creating a new asset template

<p align='center'>
  <img alt='Project asset template details create screen' src={require('!url-loader!../images/project-asset-templates-create.png').default} className='image-border'/>
</p>

To create a new asset template, follow these steps:

1. Click on the _create asset template_ button.
2. Fill in the mandatory fields in the dialog, including the code and name.
3. (Optional) Add a _description_ to clarify the purpose of the asset template for other users.
4. Select a _Git remote_ from the dropdown.
5. Click the _Create asset template_ button. If successful, the new asset template will appear on the asset templates list of the project.

## Asset template details and versions

Clicking on a specific asset template row will open its details page, where you can manage the template by:

- Editing the asset template name and description
- Adding, editing and archiving its asset template versions
- Enabling/disabling the asset template

<p align='center'>
  <img alt='Project asset template details screen' src={require('!url-loader!../images/project-asset-template-details.png').default} className='image-border'/>
</p>

Each row includes:

| Column              | Description                                                                                         |
|---------------------|-----------------------------------------------------------------------------------------------------|
| **Version**         | The version number or identifier for the asset template.                                            |
| **Description**     | Provides a short summary or purpose of the template version.                                        |
| **Git remote**      | The Git remote associated with the template version.                                                |
| **State**           | The current status of the template version, such as whether it’s ready for use or has issues.       |
| **Created at**      | Timestamp for when the template version was created.                                                |
| **Updated at**      | Timestamp for when the template version was last updated.                                           |
| **Git revision**    | The specific Git commit or revision that this template version points to.                           |

### Buttons & links

| Buttons & links               | Function                                                               |
|-------------------------------|------------------------------------------------------------------------|
| **Bulk actions**              | Allows you to archive or restore multiple asset template versions.     |
| **Search bar**                | Filter the contents of the table based on these criteria.              |
| **Columns**                   | Hide or display columns in the table.                                  |

:::note
Asset template versions that are in use by an asset cannot be archived.
:::

### Editing the asset template

<p align='center'>
  <img alt='Project edit asset template screen' src={require('!url-loader!../images/project-asset-template-edit.png').default} className='image-border'/>
</p>

To edit the asset template, follow these steps:

1. Go to the asset template details page.
2. Click on the pencil icon by the asset template name.
3. Fill in the fields you need to edit. Note that you cannot edit the template's code.
4. Click the _Update asset template_ button. If successful, the asset template will have the updated values that you set.

### Adding/editing an asset template version

<p align='center'>
  <img alt='Project edit asset template version screen' src={require('!url-loader!../images/project-asset-template-version-create.png').default} className='image-border'/>
</p>

To add or update an existing template version, follow these steps:

1. Click on the _Add template version_ button.
2. Fill in the mandatory fields in the dialog, including the version and the Git revision.
3. If the version matches an existing template version, a warning message will appear that the version already exists. If it is not in use by an asset, submiting the form will update the existing version.
4. Click the _Create template version_ button.
