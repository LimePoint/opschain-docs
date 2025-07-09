---
sidebar_position: 5
description: ''
---

# Assets

This tab lists the assets available for the project. It only shows assets that are immediate children of the project - assets belonging to an environment must be accessed via the environment details screen.

<p align='center'>
  <img alt='Project assets screen' src={require('!url-loader!../images/project-assets.png').default} className='image-border'/>
</p>

Each row includes:

| Column              | Description                                                |
|---------------------|------------------------------------------------------------|
| **Name**            | The name describing the asset.                             |
| **Code**            | Shows a unique identifier for the asset.                   |
| **Description**     | Provides a short summary or purpose of the asset.          |

## Buttons & links

| Buttons & links               | Function                                                               |
|-------------------------------|------------------------------------------------------------------------|
| **Columns**                   | Hide or display columns in the table.                                  |
| **Search bar**                | Filter the contents of the table based on these criteria.              |
| **Bulk actions**              | Perform operations on multiple assets, such as archiving.              |

:::note
_Standard_ type projects do not have the assets tab on the project details page.
:::

## Creating a new asset

<p align='center'>
  <img alt='Create new asset screen' src={require('!url-loader!../images/project-assets-create.png').default} className='image-border'/>
</p>

To create a new asset, follow these steps:

1. Click on the _Create asset_ button.
2. Fill in the mandatory fields in the dialog, including the asset name, template name and template version.
3. Click the _Create asset_ button. The new asset will appear in the assets list of the project.
