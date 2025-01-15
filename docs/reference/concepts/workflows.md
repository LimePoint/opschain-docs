---
sidebar_position: 13
description: Details of OpsChain's workflow
---

# Workflows

:::note
This feature is only available to _enterprise_ projects.
:::

A workflow is a series of steps to be performed as a single unit of work. Workflows can contain any of the following step types:

- changes
- wait steps
- approval steps
- other workflows

These can be grouped into stages and each stage's steps can be executed sequentially or in parallel.

You will need to add a `workflows` Git remote to your project in order to use workflows. Workflows can be created via the GUI, via the [API](https://docs.opschain.io/api-docs/#tag/Workflows/paths/~1api~1projects~1%7Bproject_code%7D~1workflows/post), or directly in the project's `workflows` Git repository. When created via the GUI or API, the resulting [workflow definition](#workflow-definitions) is then saved into the project's `workflows` Git repository. Any changes to the workflow definitions in the Git repository will be reflected within the GUI and API automatically - although there may be a small delay (up to a minute) whilst the updates are detected.

:::note
The credentials supplied when creating the `workflows` remote must have write permission to the repository to allow the GUI and API to create and edit the workflow definition files.
:::

:::warning
Please proceed with caution when adding child workflows to a workflow as it is possible to create a workflow that indirectly calls itself and hence never ends.
:::

## Creating a workflow

### Adding a change step

#### MintModel actions

To add a new MintModel change step to a workflow:

1. Navigate to the _actions_ tab of the asset the change is for.
2. Select the action to include in the workflow from the dropdown list.
3. Click the _add to workflow editor_ button.

:::tip
If you wish to include only part of the action's step tree, click on the play button in the step you wish to include and then click the _add to workflow editor_ button.

All child steps of the selected step will be executed as part of the change step in the workflow.
:::

#### Non-MintModel actions

To add a non-MintModel change step to a workflow:

1. Navigate to the _activity_ tab of the asset the change is for.
2. Click the _create change_ button.
3. Select the action from the dropdown list or use _advanced mode_ to manually enter the action name.
4. Click the _add to workflow editor_ button.

### Adding a nested workflow step

To add a new workflow step to a workflow:

1. Navigate to the _workflows_ tab of the project.
2. Click on the workflow you wish to add to the workflow.
3. Click the _add to workflow editor_ button.

### Adding an approval/wait step

Wait steps allow you to pause the workflow run and wait until a user manually continues the workflow. Approval steps extend this functionality by specifying that the user (approver) must be a member of a particular LDAP group.

To add a new wait or approval step to a workflow:

1. Click on the _workflow_ button in the top right corner of the GUI to expand the workflow editor.
2. Click on the _add approval/wait step_ button.
3. Specify whether the step should be a _wait_ or an _approval_ step.
4. (Optional) Fill in the _name_ field to provide more context for the wait or approval step. If no name is provided, the step will automatically be assigned a default name based on its type, e.g. _wait_ or _approval_.
5. (Conditional) If the step is an approval step, fill in the _requires approval from_ field with the LDAP group the user must be a member of to continue the workflow.
6. Click the _add step_ button.

### Grouping steps into stages

If no stages are defined in a workflow it will execute all its steps sequentially. Adding stage(s) to a workflow allows you to group steps together and specify whether those steps should be run sequentially or in parallel. In addition, stages can be nested within each other to create complex sequences of sequential and parallel steps to suit almost any business requirement.

To add a stage to a workflow:

1. Click on the _workflow_ button in the top right corner of the GUI to expand the workflow editor.
2. Click on the _add stage_ button.
3. Specify whether the steps in this stage should be executed sequentially or in parallel.
4. (Optional) Fill in the _name_ field to provide more context for the stage step. If no name is provided, the stage will automatically be assigned a default name based on its execution type, e.g. _sequential stage_ or _parallel stage_.
5. Click the _add stage_ button.

Once you have added the stage into the editor, drag the relevant steps into the stage.

### Saving the workflow

Once you have added and sequenced the required workflow steps you can save it to your `workflows` Git repository.

To save the workflow:

1. Click on the _next_ button in the workflow editor.
2. Provide a name and code for the workflow.
3. (Optional) Provide a workflow description to be displayed on the workflow details page.
4. (Optional) Provide a version description to be used as the commit message when the workflow is stored in the Git repository.
5. Click the _save_ button to save the updated workflow definition.

:::note
If the workflow code provided matches an existing workflow a warning message will be displayed that clicking save will overwrite the existing workflow definition. The old definition will be available in the Git repository history if required.
:::

## Editing a workflow

To edit an existing workflow perform the following steps:

1. Ensure the workflow editor is empty by clicking the _clear editor_ button in the editor.
2. Navigate to the _workflows_ tab of the project and click on the workflow to navigate to the workflow details page.
3. Click the _update workflow_ button to copy the workflow's definition into the workflow editor.
4. Use the editor to make the desired changes to the workflow.
5. Follow the [saving the workflow](#saving-the-workflow) steps to update the workflow definition in the Git repository.

:::note
The workflow definition YAML files in the `workflows` Git repository can be directly modified and committed using your preferred editor and Git. The YAML structure will be validated when it is parsed by OpsChain and further validated when you attempt to run it. We recommend using the OpsChain GUI editor to ensure only valid YAML are committed to the repository.
:::

## Viewing a workflow's steps

To visualize the step tree of your workflow, go to the _overview tab_ in the workflow details page.

:::note
Be aware that when visualizing an existing workflow, nameless steps will be displayed with a name related to their type, e.g. _wait_ or _approval_ for wait steps and _sequential stage_ or _parallel stage_ for stage steps.
:::

## Running a workflow

The workflow details page provides the following buttons to control the execution of the workflow::

| Button              | Description                                                                                                                    |
|---------------------|--------------------------------------------------------------------------------------------------------------------------------|
| _Run workflow_      | Run the workflow, supplying an optional run description if required.                                                           |
| _Automate workflow_ | Automate running the workflow, providing a cron schedule and conditional options to determine if and when the workflow is run. |

### Viewing workflow runs

The _runs_ tab of the workflow details page provides a list of each time the workflow has been run. Clicking on the _run ID_ of an individual run will take you to the [workflow run details page](/docs/ui/activity-details.md#workflow-run-details) to allow you to view each step of the workflow run.

Each step can be viewed or actioned according to its type. If all the workflow's steps complete successfully, the workflow run will be marked as successful. If a workflow step errors or is cancelled, the remaining steps in the workflow run will not execute and the workflow run will be marked as errored or cancelled based on the status of the step that ended the workflow run.

### Viewing workflow automation

The _automation_ tab of the workflow details page provides a list of all the automation schedules that have been created for the workflow. To remove a schedule, click on the checkboxes for the schedules you wish to remove, then select _delete selected_ from the _bulk operations_ drop down.

## Adding an existing workflow into a new workflow

Workflows can be nested within each other to create complex sequences of steps. Use the _add to workflow editor_ button on the workflow details page to add the current workflow as a new workflow step in the editor.

:::note
Validation rules exist to ensure a workflow cannot directly include itself as a workflow step (as this would cause an endless loop). However, the validation does not encompass indirect inclusion of the workflow (e.g. via another workflow) so please proceed with caution when adding child workflows to a workflow.
:::

## Workflow definitions

Below is an example of a workflow definition YAML that will be stored in the `workflows` Git repository:

```yaml
name: Provision & deprovision, with an approval step for the "qa" group
steps:
  - type: change
    target: /assets/bpm
    action: provision
  - type: wait
    name: wait for qa approval
    requires_approval_from: qa
  - type: change
    target: /assets/bpm
    action: destroy
```

The above workflow will perform the following when it is executed on an _enterprise_ project with workflows enabled:

- Create a change for the `provision` action against the project's `bpm` asset
- Pause the workflow and wait for a user from the `qa` LDAP group to either approve or reject the workflow
- If approved, it will create a change for the `destroy` action against the project's `bpm` asset
- If rejected, it cancels the workflow at that point and will not execute the `destroy` action

:::tip
Workflow YAML files can be created and edited directly in the `workflows` Git repository. The GUI and API will automatically detect changes to the workflow YAML files and update the workflow definitions accordingly.
:::
