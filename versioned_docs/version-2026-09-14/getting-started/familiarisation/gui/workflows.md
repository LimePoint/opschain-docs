---
sidebar_position: 7
description: ''
---

# Workflows

A workflow is how you orchestrate a series of steps to be performed as a single unit of work. Workflows let you sequence work across multiple environments and assets, add human checkpoints, and call other workflows - all from a single starting action.

Workflows are versioned and can be collaboratively edited. They also support a templating language so you can refer to multiple environments and assets using OpsChain's properties.

## Supported step types

A workflow can contain any of the following step types, grouped into stages whose steps run either sequentially or in parallel:

- **Changes** - execute an action against a project, environment or asset.
- **Wait steps** - pause until a user manually continues the step.
- **Approval steps** - pause until a user (or member of an LDAP group) approves or rejects the step.
- **Other workflows** - call a previously published workflow as a child of this one.

See the [step types reference](#step-types-reference) below for the full set of properties each step type accepts.

:::warning
Take care when nesting workflows - it is possible to create a workflow that indirectly calls itself and therefore never ends.
:::

## Workflow list

The first tab on this page lists all the workflows of a selected project.

<p align='center'>
  <img alt='Workflow list' src={require('!url-loader!./images/workflows-page.png').default} className='image-border'/>
</p>

Each row includes:

| Column              | Description                                                                                             |
|---------------------|---------------------------------------------------------------------------------------------------------|
| **Name**            | Displays the name of each workflow.                                                                     |
| **Version**         | Displays the latest version of the workflow, and whether it is a draft version or a published one.      |
| **Code**            | Shows a unique identifier for the workflow.                                                             |
| **Description**     | Provides a short summary or purpose of the workflow.                                                    |
| **Created by**      | The user who created the workflow.                                                                      |
| **Created at**      | Timestamp for when the workflow was created.                                                            |
| **Updated at**    | Timestamp for when the workflow was last updated.                                                       |
| **Archived**        | Whether the workflow is archived or active.                                                             |

### Buttons & links

| Buttons & links               | Function                                                               |
|-------------------------------|------------------------------------------------------------------------|
| **Project dropdown**          | Select the project to filter the workflows by.                         |
| **Search bar**                | Filter the contents of the table based on these criteria.              |
| **Columns**                   | Hide or display columns in the table.                                  |

Clicking on a specific workflow will redirect you to its [details page](/getting-started/familiarisation/gui/projects/workflows.md).

## Workflow editor

The workflow editor page allows you to create and edit workflows. It features a tab system, allowing you to switch between different workflows while editing them. The editor is composed of four main panes: the workflow details and actions at the top, the YAML editor, the tree view preview and the logs pane. Each is described below.

<p align='center'>
  <img alt='Workflow editor' src={require('!url-loader!./images/workflows-editor.png').default} className='image-border'/>
</p>

To create a new workflow, click the _New workflow_ button. Any workflows you already have open are available as tabs on this page. As you edit the YAML definition, the tree view on the right updates to preview how the workflow will run.

### Workflow details and actions

The top of the editor shows the workflow's details and the actions available for it.

When creating a workflow that has not been saved yet, this area displays `Local workflow`, indicating the workflow exists only in your browser and is not yet available to other users. A **Save** button lets you persist it for the first time, prompting you for the workflow's project, name and code.

Once a workflow has been saved, this area shows its project, name, current version and whether that version is a draft or published, along with the following actions:

| Button                     | Function                                                                                                              |
|----------------------------|-----------------------------------------------------------------------------------------------------------------------|
| **Run**                    | Allows you to open the run workflow dialog if the currently loaded workflow in the editor is published.               |
| **Discard changes**        | Discards the changes made to the workflow.                                                                            |
| **Save changes dropdown**  | Allows you to save the changes to the current version or create a new version with these changes.                     |
| **Validate**               | Validates the workflow - will show an error in the logs pane if it does not conform to the expected workflow schema.   |
| **Publish**                | Publishes the current version of the workflow. If the current version has not been validated, it will be validated first. If validation fails, the workflow will not be published. |

:::tip[Local drafts]
Until you save a workflow, its definition is kept only in your browser's local storage. If you clear your local storage before saving, an unsaved draft may be lost.
:::

### Editor pane

The editor pane holds the YAML definition of the workflow. When creating a new workflow, it is pre-populated with a template definition to get you started, and it offers autocompletion for step properties, target paths and action names as you type.

At the bottom of the editor pane, the **Quick add** buttons insert ready-made step snippets so you don't have to write them from scratch:

| Quick add      | Inserts                                                                                       |
|----------------|-----------------------------------------------------------------------------------------------|
| **Action**     | A change step. Fill in the target path and action name.                                       |
| **Workflow**   | A child workflow step. Fill in the target project, workflow and version.                      |
| **Wait**       | A wait step.                                                                                  |
| **Approval**   | An approval step. Fill in the name and the users/LDAP groups that can approve it.             |
| **Sequential** | A sequential stage that you can add child steps to.                                           |
| **Parallel**   | A parallel stage that you can add child steps to.                                             |

See the [step types reference](#step-types-reference) for the full list of properties each step type accepts.

### Tree view

The tree view on the right side of the editor renders a live preview of the workflow as you edit it, showing the stages and steps in the order they will run and how they are nested. This is the same view used to follow a workflow run, so it is a quick way to confirm the structure matches your intent before validating or publishing. When the workflow uses variables, the preview reflects how the workflow resolves with the values you provide.

### Logs pane

The logs pane records events for the current workflow - when it was created, modified, validated and published. When validation fails, the validation error is shown here, pointing you at the part of the definition that needs fixing.

### Using variables in the workflow

You can use properties to dynamically set targets, actions and names based on properties values. In workflows, variables are represented by double curly braces, e.g. `{{property_name}}`. When clicking on the **Validate** button, the _Validate properties overrides_ dialog will show you the identified variables and allow you to validate the workflow with values specified by you.

When running the workflow, the properties overrides will be used to resolve the variables. If the provided overrides are invalid or not provided, an error message will be shown in the `Run workflow` dialog.

Read more about properties in the [properties concept page](/key-concepts/properties.md).

## Step types reference

Every entry in a workflow's `steps` list (and in a stage's `children` list) is a step. The `type` property determines the kind of step. When `type` is omitted, OpsChain infers it from the other properties present - a step with `children` and `run_as` is treated as a stage, and a step with `target` (or `targets`) and `action` is treated as a change. Wait, approval and child workflow steps must always set `type` explicitly.

The sections below list each step type and the properties it accepts. A property marked as required must be present for the step to validate.

### Change step

Executes an action against a single target - a project, environment or asset.

| Property             | Required | Description                                                      |
|----------------------|----------|------------------------------------------------------------------|
| `target`             | yes | The full OpsChain path to the asset to run the action on, e.g. `/projects/hello_world/environments/dev/assets/managed_server`. |
| `action`             | yes | The action to run on the target.                                 |
| `template_version`   | no | The asset template version to source the action from. Defaults to the target's current template version at runtime.  |
| `name`               | no | A human-readable name for the step, shown in the editor and run views. |
| `start_time`         | no | A scheduled start time in ISO8601 format (e.g `2026-06-02T10:00:00Z`). The step waits until this time before running. |
| `property_overrides` | no | Properties to override or add to the target's configured properties for this run. |

### Change step with multiple targets

Runs the same action against several targets. Replace `target` with `targets` and, optionally, `template_version` with `template_versions`.

| Property             | Required | Description                                                       |
|----------------------|----------|-------------------------------------------------------------------|
| `targets`            | yes | A list of OpsChain paths to run the action on.                         |
| `action`             | yes | The action to run on each target.                                      |
| `template_versions`  | no | A list of template versions, in the same order as `targets`.            |
| `run_as`             | no | `sequential` (default) or `parallel` - whether to run the action on the targets one at a time or all at once. |
| `name`               | no | A human-readable name for the step.                                     |
| `start_time`         | no | A scheduled start time in ISO8601 format.                               |
| `property_overrides` | no | Properties to override or add to the targets' configured properties for this run. |

### Wait step

Pauses the workflow until any user with access to the workflow manually continues it.

| Property         | Required | Description                                                                          |
|------------------|----------|--------------------------------------------------------------------------------------|
| `type`           | yes      | `wait`.                                                                              |
| `name`           | no       | A human-readable name for the step. Defaults to `Wait`.                              |
| `reset_on_retry` | no       | When `true`, the step needs to be continued again if the workflow is retried.       |

### Approval step

An approval step is a wait step that can only be continued by specified users or LDAP group members, who have to approve or reject it. Adding `requires_approval_from` to a wait step turns it into an approval step.

| Property                              | Required | Description                                               |
|---------------------------------------|----------|-----------------------------------------------------------|
| `type`                                | yes | `wait`.                                                        |
| `requires_approval_from`              | yes | An object naming who can approve the step. Must contain `user_names` and/or `ldap_groups`. |
| `requires_approval_from.user_names`   | – | A list of usernames allowed to approve the step. Must contain at least one username when defined. |
| `requires_approval_from.ldap_groups`  | – | A list of LDAP groups whose members can approve the step. Must contain at least one LDAP group when defined. |
| `name`                                | no | A human-readable name for the step. Defaults to `Approval`. |
| `reset_on_retry`                      | no | When `true`, the step needes to be approved again if the workflow is retried. |

### Workflow step

Calls a previously published workflow as a child of the current one.

| Property             | Required | Description                                                           |
|----------------------|----------|-----------------------------------------------------------------------|
| `target`             | yes | The OpsChain path of the workflow to run, e.g. `/projects/hello_world/workflows/backup-environment`. |
| `version`            | no | The version of the child workflow to run. If omitted, the latest published version is used. |
| `name`               | no | A human-readable name for the step.                                         |
| `start_time`         | no | A scheduled start time in ISO8601 format.                                  |
| `property_overrides` | no | Property overrides to supply to the child workflow.                         |

By providing the same property in the `property_overrides` key multiple times, the child workflow will be called once for each value. You can then use the `run_as` property to control the execution strategy of these child workflow steps.

:::warning
Take care when nesting workflows - it is possible to create a workflow that indirectly calls itself and therefore never ends.
:::

### Stage

Groups a set of child steps to run sequentially or in parallel. Stages can be nested inside other stages to build more complex structures.

| Property   | Required | Description                                                                       |
|------------|----------|-----------------------------------------------------------------------------------|
| `run_as`   | yes      | `sequential` to run children one at a time, or `parallel` to run them all at once.|
| `name`     | yes      | A human-readable name for the stage.                                              |
| `children` | yes      | The list of steps nested within the stage.                                        |

:::info[Execution strategy conflicts]
The steps generated by the multiple target change and multiple child workflow (via property overrides) steps will follow the execution strategy defined in the step themselves. For example, if a step is defined with `run_as: parallel`, all of its children will run in parallel, regardless of the execution strategy defined in the stage.
:::
