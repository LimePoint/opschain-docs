---
sidebar_position: 12
description: Details of OpsChain's assets and asset templates
---

# Assets and asset templates

:::note
This feature is only available to _enterprise_ projects.
:::

## Asset template

Within OpsChain, asset templates are similar to [Git remotes](/reference/concepts/git-remotes.md). Any Git revisions in the template's repository can be referenced as a [template version](#template-version).
In addition to the functionality of a Git remote, an asset template can also do the following:

- provide a list of documented actions that you can run
- represent an asset
- represent an asset's [ERB template](https://en.wikipedia.org/wiki/ERuby) that conforms to the [MintModel JSON](https://docs.limepoint.com/mintpress/mintpress-SDK/using-mint-press-controllers-sdk-from-json) schema

## Template version

A template version represents a specific commit in the template's Git repository which in turn refers to a specific release or revision of the asset template. Each asset must be assigned a template version to ensure that all changes run on the asset will use the actions, controller logic and (optionally) MintModel JSON specific to that template version.

### Asset template with a MintModel schema

When creating a template version, if the relevant Git commit contains an ERB file at `MintModel/templates/assets/<template_code>.json.erb`, then the template version will be marked as having a MintModel.

Each time a change is run for an asset with a MintModel ERB, a concrete MintModel JSON will be generated from the asset's converged properties and the ERB. The MintModel JSON will be linked to the change so it can be viewed via the change details screen in the GUI. Each distinct MintModel created by an asset's changes will also be available to view via the asset's MintModel tab, where it can be viewed and compared with other MintModel JSONs generated for the asset.

## Template actions

### Documented actions

The actions available in the `actions.rb` for an asset can be documented via an `opschain.yaml` file in the asset's repository. Any actions listed in the `opschain.yaml` file will be available in the dropdown list on the asset's create change dialog.

Below is an example of an `opschain.yaml`:

```yaml
actions:
  - name: provision
    description: Provision an instance on existing infrastructure
  - name: destroy
    description: Destroy the installation (but not the infrastructure)
  - name: soa:apply_patches
    description: Apply patches listed in the ERB file to each of the SOA installations
```

:::note
It is not necessary to document an action to use it. Undocumented actions can be run by manually entering the action via the `advanced mode` option when creating a change for the asset.
:::

### MintModel actions

If the asset's template version includes a MintModel ERB file, then the MintModel actions will  be available in the dropdown list on the asset's create change dialog.

## Asset

Once an asset has been created its template cannot be changed. To alter the asset's configuration, update the asset's properties or create a new version of the asset template and assign it to the asset.

### Running changes on an asset

The create change button, available from the asset's activity tab allows you to run any of the template version's MintModel or documented actions by selecting it from the dropdown list. In addition, you can use the `advanced mode` option to manually enter an action from the `actions.rb` to run.

For assets with a MintModel, the actions tab allows you to view the steps of each MintModel action. The run action button allows you to run the complete MintModel action. Alternatively, clicking the play icon on any of the steps within the tree allows you to run just the highlighted subsection of the overall action.
