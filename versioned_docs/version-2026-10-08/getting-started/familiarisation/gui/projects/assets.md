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

| Column          | Description                                                                                                      |
|-----------------|------------------------------------------------------------------------------------------------------------------|
| **Name**        | The name describing the asset.                                                                                   |
| **Code**        | Shows the asset's unique code.                                                                                   |
| **Description** | Provides a short summary or purpose of the asset.                                                                |
| **Actions**     | Shows the action-generation status and, where available, when the asset's available actions were last refreshed. |
| **Archived**    | Indicates the archival status of the asset.                                                                      |

## Buttons & links

| Buttons & links               | Function                                                               |
|-------------------------------|------------------------------------------------------------------------|
| **Bulk actions**              | Perform operations on multiple assets, such as archiving, permanently deleting them, running an action across the selected assets, or refreshing their available actions. |
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

You can also select several of the asset's available actions using their checkboxes and choose _Run selected_ to run them together from a single dialog, rather than starting each change one at a time.

See the [run change dialog](/getting-started/familiarisation/gui/activity.md#run-change) for a walkthrough of the form fields.

### The asset's action tree

The **Actions** tab lists the asset's available actions and draws the steps each one will run, using the same tree view, search and controls as the [change step tree](/getting-started/familiarisation/gui/activity_details.md#navigating-the-step-tree-view). The list of actions and the tree can be resized against each other, so a long action name or a wide tree can be given the room it needs. **Search actions**, above the list, and the tree's own search both match a step's name or action.

Each step in the tree carries a play button. Using it on the root step runs the whole action; using it on a step further down opens the run change dialog with that step as the change's [starting step](/key-concepts/changes.md#starting-a-change-partway-through), so the change begins there rather than at the top of the tree.

The **Actions** tab is shown only for the nodes that have an action catalog, which is assets.

## Refreshing an asset's available actions

An asset's available actions are read from its template version's `actions.rb`. To pick up newly added or changed actions, refresh them - either from an individual asset, or for several assets at once by selecting them in the assets table and choosing _Refresh actions_ from the _Bulk actions_ menu. The **Actions** column shows when each asset's actions were last refreshed.

### Refreshing actions in a new image

Refreshing builds the image that generates the asset's actions from the build service's cache, so any layer whose inputs in the repository have not changed is reused. If the `Dockerfile` installs something that has changed outside the repository - a newer version of a gem, for example - the cached layer still holds the old one. Choose **Refresh actions in a new image** from the arrow beside the asset's **Refresh actions** button to rebuild the image from scratch instead. The refresh is marked **New image** in the asset's action generation history.

Rebuilding is available for a single asset's actions refresh, and needs the same permission as refreshing. See [`Dockerfile`](/key-concepts/step-runner.md#custom-step-runner-dockerfiles) for how the image is built.

### When an asset's MintModel actions are unavailable

The actions an asset gets from its [MintModel](/getting-started/familiarisation/gui/projects/asset_templates.md#asset-templates-with-a-mintmodel) are generated for a particular set of properties at a particular commit, so they stop being available when either of those moves. Where they are, OpsChain says which of the following it is rather than only reporting the actions as out of date:

| Reason                                                                          | What to do                                                                                    |
|---------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------|
| The asset's properties have changed since its MintModel was generated             | Refresh the asset's actions to regenerate it against the current properties                   |
| The asset's template version has resolved a new commit since it was generated     | Refresh the asset's actions to regenerate it against the new commit                           |
| The MintModel has not been generated yet                                          | Refresh the asset's actions to generate it for the first time                                 |
| The last attempt to generate the MintModel failed                                 | Address the reported generation failure, then refresh the asset's actions                     |
| The asset's template version does not include a MintModel                         | Nothing - this asset's actions come from its `actions.rb` alone                                |

Properties anywhere above the asset count here, so editing a project's or an environment's properties can take the MintModel actions of every asset beneath it out of date until they are regenerated.

## Artefacts

The **Artefacts** tab lists the [artefacts](/key-concepts/artefacts.md) stored against the asset, whether a change's step stored them or someone uploaded them by hand. Environments have the same tab; projects do not.

<p align='center'>
  <img alt='Asset artefacts tab' src={require('!url-loader!../images/artefact-asset-tab.png').default} className='image-border'/>
</p>

Each row is one artefact code, showing its latest version:

| Column          | Description                                                                                   |
|-----------------|-----------------------------------------------------------------------------------------------|
| **Code**        | The artefact's code. Select it to open the artefact's [versions page](#artefact-versions).    |
| **Latest file** | The file name of the newest version.                                                          |
| **Size**        | The size of that file.                                                                        |
| **Labels**      | The labels on that version.                                                                   |
| **Source**      | The change step that stored the version, or the user who uploaded it.                         |
| **Updated**     | When the newest version was stored.                                                           |
| **Versions**    | How many versions the artefact has.                                                           |

Each row also has buttons to download the latest version, copy a link to it, and open the version history. The list loads more rows as you scroll.

| Filter or button        | Function                                                                                                  |
|-------------------------|-----------------------------------------------------------------------------------------------------------|
| **Exact code**          | Show only the artefact with exactly this code.                                                            |
| **Filter by label**     | Show only artefacts whose latest version has this label.                                                  |
| **Show fully purged**   | Include artefacts whose versions have all been purged by [retention](/key-concepts/artefacts.md#retention). They are hidden by default. |
| **Upload artefact**     | Add an artefact by hand. Shown only if you have permission to update the node.                            |

### Uploading an artefact

<p align='center'>
  <img alt='Upload artefact dialog' src={require('!url-loader!../images/artefact-upload.png').default} className='image-border'/>
</p>

To upload an artefact without running a change - for a hotfix that skips the normal build pipeline, for example:

1. Click **Upload artefact**.
2. Choose the file. The code is filled in from the file name; change it if you want a different one.
3. (Optional) Enter a description of up to 1,000 characters.
4. (Optional) Enter labels, separated by commas.
5. Click **Upload**.

A code may contain only lowercase letters, numbers and underscores. Uploading under a code that already exists adds a new version to that artefact rather than replacing the earlier one. An uploaded artefact can be loaded by an action in the same way as one a change stored. To upload against a project, or from a script, use the [artefacts API](pathname:///api-docs/#tag/Artefacts).

### Artefact versions

Select an artefact's code, or its history button, to see every version of it, newest first.

<p align='center'>
  <img alt='Artefact versions page' src={require('!url-loader!../images/artefact-versions.png').default} className='image-border'/>
</p>

Each version shows its file, size, labels and source. The **Status** column marks the newest version that has not been purged with a **Latest** pill, and shows **Purged** with the date for a version whose file [retention](/key-concepts/artefacts.md#retention) has removed. A purged version stays listed, but its download button is disabled.

| Filter or button        | Function                                                                   |
|-------------------------|----------------------------------------------------------------------------|
| **Filter by label**     | Show only versions with this label.                                        |
| **Show purged versions** | Include purged versions in the list.                                      |
| **Download latest**     | Save the file of the latest version.                                       |
| **Copy link**           | Copy a link to the latest version.                                         |

Use the **Artefacts** breadcrumb above the list to return to the tab. A change's own [**Artefacts** tab](/getting-started/familiarisation/gui/activity_details.md#artefacts) links each artefact code to this page.

## Archiving an asset

Archive an asset by selecting it from the assets table and choosing _Archive_ from the _Bulk actions_ menu.

Archiving an asset:

- disables the asset's scheduled activities - they will not run until the asset is restored
- prevents new changes, workflow runs and scheduled activities from being created against the asset

:::info
An asset cannot be archived if it contains a queued or running activity. Wait for those activities to complete (or cancel them) before archiving.
:::

## Deleting an asset

Delete an asset from its actions menu, or delete several at once by selecting them in the assets table and choosing _Delete assets_ from the _Bulk actions_ menu.

:::warning
Deleting an asset is permanent and irreversible. An asset that has changes recorded against it cannot be deleted - [archive](#archiving-an-asset) it instead.
:::
