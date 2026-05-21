---
sidebar_position: 5
description: Details of OpsChain's asset templates and template versions
---

# Assets and templates

## Asset templates

To allow users to have different resources (defined by `actions.rb` files) within the same Git repository, OpsChain allows you to define asset templates. Asset templates in OpsChain can be seen as a way of referring to different `actions.rb` files within the same Git repository.

For example, if you have a Git repository with the following structure:

```text
my-project/
  db_server/
    actions.rb
  web_server/
    actions.rb
```

You can create two asset templates, one for `db_server` and one for `web_server`. The actions in `db_server` will be available for the assets using the `db_server` template and the actions in `web_server` will be available for the assets using the `web_server` template.

More than that, asset templates are also used to:

- represent an asset
- represent an asset's [ERB template](https://en.wikipedia.org/wiki/ERuby) that conforms to the [MintModel JSON](https://docs.limepoint.com/mintpress/mintpress-SDK/using-mint-press-controllers-sdk-from-json) schema.

### Documented template actions

All actions defined in the asset template's `actions.rb` file that include a `description` as part of their definition, will be listed in the action dropdown list on the asset's "run or schedule a change" dialog. Actions that do not include a `description` remain available to run, however the user must know their name and manually key it into the action field.

Below is an example of actions with and without a description:

```ruby
action :available_in_dropdown, description: "This action and description will appear in the asset's action tab, and in the actions available in the run or schedule a change dialog" do
  log.info "Here is the action implementation"
end

action :can_be_run_manually do  # This action can be run from the UI, but won't appear in the dropdown list
  log.info "Here is the action implementation"
end
```

### Asset template versions

To stay in control of the changes made to an asset template, OpsChain allows you to create template versions to lock the source code for a given template to a specific Git revision. A template version always refers directly to a single Git revision in the asset template's Git repository.

Whenever a template version is created or updated, OpsChain will fetch the Git revision and try to identify the actions available for the given template version, making them available for any asset that switches to the new version.

If OpsChain is unable to fetch the provided Git revision or resolve the template actions, the version will be marked as "broken" and it will not be usable until the issue is resolved.

You can only update a template version if no assets are using it. If you have a version being used by multiple assets, it is recommended to create a new template version instead and promote each asset as needed.

:::info
Creating new template versions will not automatically update the assets using the template. You will need to intentionally promote the assets to use the new template version, or create new assets using the new template version. This is done to ensure you are in control of the changes made to your assets and avoids unexpected or unintended changes.
:::

### Asset templates with a MintModel

When creating a template version, if the relevant Git revision contains an ERB file at `MintModel/templates/assets/<template_code>.json.erb`, then the template version will be marked as having a MintModel. If the asset's template version includes a MintModel ERB file, then the MintModel actions will be available in the dropdown list on the asset's create change dialog, along with any action in the `actions.rb` file.

Each time a change is run for an asset with a MintModel ERB, a concrete MintModel JSON will be generated from the asset's converged properties and the ERB. The MintModel JSON will be linked to the change so it can be viewed via the change details screen in the GUI. Each distinct MintModel created by an asset's changes will also be available to view via the asset's MintModel tab, where it can be viewed and compared with other MintModel JSONs generated for the asset.

:::info
When running an action that is defined both in the `actions.rb` file and through the MintModel associated with the asset, the MintModel action will take precedence over the one defined in the `actions.rb` file.

We suggest not naming any actions in the `actions.rb` file with a name that matches a MintModel action name.
:::

## Assets

Assets are the inner-most level of OpsChain's structure. They are used to represent a specific instance of an asset template. Assets can be created inside projects or environments.

### Assigning an asset template version to an asset

Once an asset has been created its template cannot be changed. To alter the asset's configuration, update the asset's properties or create a new version of the asset template and assign it to the desired assets.

### Running changes on an asset

The create change button, available from the asset's activity tab allows you to run any of the template version's MintModel or documented actions by selecting it from the dropdown list. In addition, you can use the `advanced mode` option to manually enter an action from the `actions.rb` to run.
