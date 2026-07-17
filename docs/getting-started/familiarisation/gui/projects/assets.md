---
sidebar_position: 4
description: ''
---

# Assets

Assets are the inner-most level of OpsChain's organisational structure. They are linked to an [asset template](/getting-started/familiarisation/gui/projects/asset_templates.md) and an [asset template version](/getting-started/familiarisation/gui/projects/asset_templates.md#about-asset-template-versions), which give them their `actions.rb` and their Git revision. An asset should be the closest representation of an actual infrastructure component or service that you want to manage with OpsChain.

Assets can be created inside a project or an environment. Properties and settings configured at the asset level override those defined on the project and the parent environment, so the asset is the most specific place to put configuration that only applies to one instance.

This tab lists the assets available for the project. It only shows assets that are immediate children of the project - assets belonging to an environment must be accessed via the [environment details screen](/getting-started/familiarisation/gui/projects/environments.md#environment-details-screen), but will show a similar view.

<p align='center'>
  <img alt='Project assets screen' src={require('!url-loader!../images/project-assets.png').default} className='image-border'/>
</p>

Each row includes:

| Column              | Description                                                |
|---------------------|------------------------------------------------------------|
| **Name**            | The name describing the asset.                             |
| **Code**            | Shows the asset's unique code.                             |
| **Description**     | Provides a short summary or purpose of the asset.          |
| **Actions**         | Shows the action-generation status and, where available, when the asset's available actions were last refreshed. |
| **Archived**        | Indicates the archival status of the asset.                |

## Buttons & links

| Buttons & links               | Function                                                               |
|-------------------------------|------------------------------------------------------------------------|
| **Bulk actions**              | Perform operations on multiple assets, such as archiving.              |
| **Search bar**                | Filter the contents of the table based on these criteria.              |
| **Show archived**             | Toggle to show archived assets in the table.                           |
| **Columns**                   | Hide or display columns in the table.                                  |
| **Create asset**              | Add a new asset to the project or environment                          |

## Creating a new asset

<p align='center'>
  <img alt='Create new asset screen' src={require('!url-loader!../images/project-assets-create.png').default} className='image-border'/>
</p>

To create a new asset, first create an [asset template](/getting-started/familiarisation/gui/projects/asset_templates.md) and an associated [asset template version](/getting-started/familiarisation/gui/projects/asset_templates.md#about-asset-template-versions), and then follow these steps:

1. Click on the _Create asset_ button.
2. Fill in the mandatory fields in the dialog, including the asset name, code, template name and template version.
3. (Optional) Add a _description_ to clarify the purpose of the asset for other users.
4. Click the _Create asset_ button. The new asset will appear in the assets list of the project.

## Promoting an asset to a new template version

Once an asset has been created, its template cannot be changed. To alter the asset's configuration, either update the asset's properties or create a new version of the existing asset template and assign it to the asset:

1. Open the [asset template details page](/getting-started/familiarisation/gui/projects/asset_templates.md#asset-template-details-and-versions) and create a new template version pointing at the desired Git revision.
2. Open the asset details page.
3. Select the new template version from the version dropdown.

This intentional two-step promotion ensures you're in control of when a new code revision starts being used by the asset.

## Running changes on an asset

The _run_ button at the top of the page lets you run any of the template version's MintModel or documented actions by selecting it from the dropdown. Use the _advanced mode_ option to manually enter an action defined in `actions.rb` that does not include a `description` (and is therefore not listed in the dropdown).

See the [run change dialog](/getting-started/familiarisation/gui/activity.md#run-change) for a walkthrough of the form fields.

## Archiving an asset

Archive an asset by selecting it from the assets table and choosing _Archive_ from the _Bulk actions_ menu.

Archiving an asset:

- disables the asset's scheduled activities - they will not run until the asset is restored
- prevents new changes, workflow runs and scheduled activities from being created against the asset

:::info
An asset cannot be archived if it contains a queued or running activity. Wait for those activities to complete (or cancel them) before archiving.
:::
