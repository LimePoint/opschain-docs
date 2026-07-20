---
sidebar_position: 7
description: ''
---

# Asset templates

Asset templates let you reuse a single Git repository to manage many different kinds of asset by pointing each template at a named folder containing its own `actions.rb`. For example, a repository laid out like this:

```text
my-project/
  db_server/
    actions.rb
  web_server/
    actions.rb
```

can back two asset templates - one for `db_server` and one for `web_server` - with each asset using the actions of its respective template.

Asset templates are also used to:

- represent an asset
- represent an asset's [ERB template](https://en.wikipedia.org/wiki/ERuby) that conforms to the [MintModel JSON](https://docs.limepoint.com/mintpress/mintpress-SDK/using-mint-press-controllers-sdk-from-json) schema

The terms _asset template_ and _template_ are used interchangeably in the product and in this documentation.

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
| **Template type**    | The type of template, either _Agent_ or _Asset_.                                     |
| **Git remote**       | The Git remote associated with this template.                                        |
| **Newest version**   | The most recent version or Git revision associated with the asset template.          |
| **Archived**         | Whether the asset template is archived or not.                                       |

:::note
Asset templates that are in use by an agent or an asset cannot be archived.
:::

### Buttons & links

| Buttons & links               | Function                                                               |
|-------------------------------|------------------------------------------------------------------------|
| **Bulk actions**              | Allows you to archive or restore multiple asset templates.             |
| **Search bar**                | Filter the contents of the table based on these criteria.              |
| **Show archived**             | Toggle to show archived asset templates in the table.                  |
| **Columns**                   | Hide or display columns in the table.                                  |
| **Create template**           | Add a new asset template to the project.                               |

## Creating a new asset template

<p align='center'>
  <img alt='Project asset template details create screen' src={require('!url-loader!../images/project-asset-templates-create.png').default} className='image-border'/>
</p>

To create a new asset template, first ensure you have a [Git remote](/getting-started/familiarisation/gui/projects/git_remotes.md) configured for the project, and then follow these steps:

1. Click on the _create template_ button.
2. Fill in the mandatory fields in the dialog, including the code and name.
3. (Optional) Add a _description_ to clarify the purpose of the asset template for other users.
4. Select the template type, either _Agent_ or _Asset_. Templates of type _Agent_ are used to define agents, while templates of type _Asset_ are used to define assets. This cannot be changed after the template is created.
5. Select a _Git remote_ from the dropdown.
6. Click the _Create asset template_ button. If successful, the new asset template will appear on the asset templates list of the project.

## Asset template details and versions

Clicking on a specific asset template row will open its details page, where you can manage the template by:

- Editing the asset template name and description
- Adding, editing and archiving its asset template versions
- Enabling/disabling the asset template

### About asset template versions

To stay in control of the changes made to an asset template, OpsChain lets you create template versions that lock the source code for the template to a specific Git revision. A template version always refers directly to a single Git revision in the asset template's Git repository.

Whenever a template version is created or updated, OpsChain fetches the Git revision and identifies the actions available for that version, making them available to any asset that switches to it.

If OpsChain is unable to fetch the provided Git revision or resolve the template actions, the version will be marked as "broken" and it will not be usable until the issue is resolved.

A template version's Git revision can be re-fetched at any time — for example, after resolving a fetch failure, or to pick up new commits on an unlocked floating revision — using the _Fetch revision_ button in the template version header.

You can only update a template version if no assets are using it. If you have a version being used by multiple assets, it is recommended to create a new template version instead and promote each asset as needed.

:::info
Creating new template versions does not automatically update the assets using the template. You must intentionally promote each asset to use the new template version, or create new assets against the new version. This puts you in control of the changes made to your assets and avoids unexpected or unintended changes.
:::

<p align='center'>
  <img alt='Project asset template details screen' src={require('!url-loader!../images/project-asset-template-details.png').default} className='image-border'/>
</p>

Each row includes:

| Column              | Description                                                                                                              |
|---------------------|--------------------------------------------------------------------------------------------------------------------------|
| **Lock icon**       | Allows you to lock the version. This will ensure that it does not float to newer Git revisions until it is unlocked.     |
| **Version**         | The version number or identifier for the asset template.                                                                 |
| **Description**     | Provides a short summary or purpose of the template version.                                                             |
| **Assets**          | Shows the assets that are using this template version.                                                                   |
| **State**           | The current status of the template version, such as whether it’s ready for use or has issues.                            |
| **Git revision**    | The specific Git commit or revision that this template version points to.                                                |
| **Created at**      | Timestamp for when the template version was created.                                                                     |
| **Updated at**      | Timestamp for when the template version was last updated.                                                                |
| **Archived**        | Indicates the archival status of the template version.                                                                   |

### Buttons & links

| Buttons & links               | Function                                                               |
|-------------------------------|------------------------------------------------------------------------|
| **Bulk actions**              | Allows you to archive or restore multiple asset template versions.     |
| **Search bar**                | Filter the contents of the table based on these criteria.              |
| **Show archived**             | Toggle to show archived template versions in the table.                |
| **Columns**                   | Hide or display columns in the table.                                  |
| **Add template version**      | Add a new template version to the asset template.                      |

:::note
Asset template versions that are in use by an agent or an asset cannot be archived.
:::

### Editing the asset template

<p align='center'>
  <img alt='Project edit asset template screen' src={require('!url-loader!../images/project-asset-template-edit.png').default} className='image-border'/>
</p>

To edit the asset template, follow these steps:

1. Go to the asset template details page.
2. Click on the pencil icon at the top-right of the page.
3. Fill in the fields you need to edit. Note that you cannot edit the template's code or type.
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

### Documented template actions

All actions defined in the asset template's `actions.rb` file that include a `description` as part of their definition will be listed in the asset's action list. Actions without a `description` remain available to run, but the user must know their name and key it into the action field manually.

Below is an example of actions with and without a description:

```ruby
action :available_in_dropdown, description: "This action and description will appear in the asset's action tab, and in the actions available in the run change dialog" do
  log.info "Here is the action implementation"
end

action :can_be_run_manually do
  log.info "Here is the action implementation"
end
```

Read more about actions in the [actions reference](/key-concepts/actions.md) page.

### Asset templates with a MintModel

When creating a template version, if the relevant Git revision contains an ERB file at `MintModel/templates/assets/<template_code>.json.erb`, then the template version will be marked as having a MintModel. If the asset's template version includes a MintModel ERB file, then the MintModel actions will be available in the asset's action list, along with any action in the `actions.rb` file.

Each time a change is run for an asset with a MintModel ERB, a concrete MintModel JSON will be generated from the asset's converged properties and the ERB. The MintModel JSON will be linked to the change so it can be viewed via the change details screen in the GUI. Each distinct MintModel created by an asset's changes will also be available to view via the asset's MintModel tab, where it can be viewed and compared with other MintModel JSONs generated for the asset.

:::info
When running an action that is defined both in the `actions.rb` file and through the MintModel associated with the asset, the MintModel action will take precedence over the one defined in the `actions.rb` file.

We suggest not naming any actions in the `actions.rb` file with a name that matches a MintModel action name.
:::

## Archiving asset templates and template versions

Archive one or more asset templates - or individual template versions - by selecting them in their respective table and choosing _Archive_ from the _Bulk actions_ menu.

- Archived asset templates cannot be used to create new assets.
- Archived asset template versions cannot be assigned to assets.
- Asset templates and template versions that are currently in use by an asset cannot be archived. Promote any affected assets to a different version first.
