---
sidebar_position: 7
description: Orchestrating changes across multiple environments using workflows, with stages, wait and approval steps.
---

# Orchestrating changes with workflows

In the [previous tutorials](./resource-types.md) we built a reusable `managed_server` asset template and created assets in our `Development` and `Staging` environments. Running an action on a single asset is useful, but real operations usually involve a sequence of steps across several environments, with checkpoints where a human needs to verify progress or grant approval before anything touches production.

This is exactly what OpsChain **workflows** are for. A workflow orchestrates a series of steps as a single unit of work: it can run changes across multiple environments and assets, group them into stages that run sequentially or in parallel, and pause for human input midway through.

In this tutorial we'll build a pipeline that backs up and restarts our `managed_server` deployments through three environments:

```text
Development  →  Staging  →  [approval]  →  Production
```

After following this guide you should know how to:

- write and publish a workflow in the workflow editor
- group change steps into sequential and parallel stages
- target the same asset across different environments in a single workflow
- pause a workflow with a wait step so a human can confirm progress manually
- gate a sensitive stage with an approval step so only approved users can continue
- run a workflow and follow its progress

## Prerequisites

This tutorial builds on the [resource types tutorial](./resource-types.md). We recommend following it first so you have the `managed_server` asset template, with its `default`, `disk_check` and `backup` actions, and assets created in the `Development` and `Staging` environments.

You can read more about the concepts used here on the [workflows concept page](/getting-started/familiarisation/gui/workflows.md).

## Adding a production environment

So far our `hello_world` project has `Development` and `Staging` environments. Let's add a `Production` environment so we have a meaningful target for the final, approval-gated stage of our pipeline.

Create a new environment with the code `prod` and create a `managed_server` asset inside it, using the same template version as the other environments. If you need a refresher on creating environments and assets, refer to the [structure tutorial](./structure.md).

Our project structure should now look like this:

```text
Projects/
└── hello_world/
    └── Environments/
        ├── dev/
        │   └── Assets/
        │       └── managed_server
        ├── staging/
        │   └── Assets/
        │       └── managed_server
        └── prod/
            └── Assets/
                └── managed_server
```

Give the production asset properties suited to a live server, for example:

```json
{
  "hostname": "prd-web-01.example.com",
  "disk_check": {
    "disk_threshold": 90
  }
}
```

:::tip[Properties per environment]
Because each environment's asset carries its own `hostname` and `disk_threshold` properties, the same workflow steps behave correctly in every environment without any change to the workflow itself. See the [properties documentation](/key-concepts/properties.md) for how properties are merged across levels.
:::

## Creating the workflow

Workflows are created in the workflow editor. From the sidebar, open the **Workflows** page, select your `hello_world` project and click **New workflow** at the top of the page.

The editor is made up of four sections: the workflow details and action buttons at the top, the YAML editor (with quick-add buttons at the bottom), a live tree preview of how the workflow will run, and a logs panel. You can read more about each section on the [workflows concept page](/getting-started/familiarisation/gui/workflows.md).

<p align='center'>
  <img alt='Workflow editor' src={require('!url-loader!../familiarisation/gui/images/workflows-editor.png').default} className='image-border'/>
</p>

A workflow is defined as a YAML document with a single top-level `steps` list. Let's build ours up one piece at a time.

:::tip[Saving the workflow]
At any moment, you can save the workflow by clicking the **Save** button at the top of the editor. This will prompt you to enter a name, code and project for the workflow. Once a workflow is saved, it will be available to any other user with access to workflows in the project.

If you haven't saved the workflow and lose your browser local storage, your workflow draft might be lost.
:::

### A single change step

The simplest possible step is a change: it runs one action against one target. Let's start by configuring and starting the web server in `Development` by running the `default` action:

```yaml
steps:
  - type: change
    name: Configure and start (development)
    target: /projects/hello_world/environments/dev/assets/managed_server
    action: default
```

The `target` is the full OpsChain path to the asset, and `action` is the action to run on it. As you type, the tree preview on the right updates to show the single step. The autocomplete feature will also help you finding the target path and action name.

### Grouping steps into a sequential stage

Before we start the web server in `Development`, we want to check it has enough disk space. We can group related steps into a **stage** that runs its children either `sequentially` or in `parallel`. A sequential stage runs each child in order, only moving on once the previous step succeeds. Replace the step list with the following:

```yaml
steps:
  - type: stage
    name: Rollout development
    run_as: sequential
    children:
      - type: change
        name: Disk check (development)
        target: /projects/hello_world/environments/dev/assets/managed_server
        action: disk_check
      - type: change
        name: Configure and start (development)
        target: /projects/hello_world/environments/dev/assets/managed_server
        action: default
```

:::tip[Step type coercion]
When the `type` property is not provided, the step type is coerced from the properties it has. For example, a step without a `type` property but with a `children` and `run_as` properties will be treated as a stage.

When the step does not have enough properties to determine its type, a validation error will be raised pointing to which properties you could add to make it into a valid step.
:::

### Running steps in parallel

Some steps are independent and don't need to wait for one another. For example, we can run our disk checks on the `Development`, `Staging` and `Production` servers at the same time as a quick pre-flight check. A **parallel** stage runs all of its children at once:

```yaml
steps:
  - name: Pre-flight disk checks
    run_as: parallel
    children:
      - type: change
        name: Disk check (development)
        target: /projects/hello_world/environments/dev/assets/managed_server
        action: disk_check
      - type: change
        name: Disk check (staging)
        target: /projects/hello_world/environments/staging/assets/managed_server
        action: disk_check
      - type: change
        name: Disk check (production)
        target: /projects/hello_world/environments/prod/assets/managed_server
        action: disk_check
```

The `change` step type also accepts `targets` (instead of `target`) to support specifying multiple targets with the same action. This means that the sample above can be rewritten as:

```yaml
steps:
  - name: Pre-flight disk checks
    run_as: parallel
    children:
      - type: change
        name: Disk check (all environments)
        targets:
          - /projects/hello_world/environments/dev/assets/managed_server
          - /projects/hello_world/environments/staging/assets/managed_server
          - /projects/hello_world/environments/prod/assets/managed_server
        action: disk_check
        run_as: parallel
```

When defining multiple targets, you can specify how you want them to be run via the `run_as` field. By default, a sequential step will be created for each target.

:::note[Step tree preview for multiple targets]
When defining multiple targets, the step tree preview will show the target as `undefined` until the workflow is run.
:::

### Pausing for a human with a wait step

A **wait** step pauses the workflow until someone manually continues it. This is useful when a person needs to perform a check outside OpsChain - such as manually confirming that the previous deployments are working - before the pipeline carries on. We'll add this step below the existing stage:

```yaml
- type: wait
  name: Confirm development and staging are working
```

### Gating production behind an approval step

An **approval** step is a wait step that can only be continued by approving (or rejecting) it. You restrict who can approve using `requires_approval_from`, naming individual users and/or LDAP groups. Here we require approval before anything is deployed to production. Add this step below the existing wait step:

```yaml
- type: wait
  name: Approve the production rollout
  requires_approval_from:
    user_names:
      - opschain
    ldap_groups:
      - release-managers
```

:::tip[Autocomplete]
OpsChain autocompletes the `user_names` and `ldap_groups` fields when you start typing inside either field. The data is retrieved from both the LDAP server and the database. You can type in a username or LDAP group name that do not show up in the autocomplete list if you're sure it exists.
:::

:::note[Wait versus approval]
Both are `wait` steps. A step with no `requires_approval_from` is a plain wait that anyone can continue; a step with `requires_approval_from` becomes an approval gate that only the listed users or LDAP group members can action on.
:::

### The complete pipeline

Putting it all together, our pipeline runs the pre-flight checks in parallel, backs up the development and staging databases sequentially, waits for a human confirmation of the previous deployments, requires approval, and finally deploys to production:

```yaml
steps:
  - name: Pre-flight disk checks
    run_as: parallel
    children:
      - type: change
        name: Disk check (all environments)
        targets:
          - /projects/hello_world/environments/dev/assets/managed_server
          - /projects/hello_world/environments/staging/assets/managed_server
          - /projects/hello_world/environments/prod/assets/managed_server
        action: disk_check
        run_as: parallel

  - name: Rollout development
    run_as: sequential
    children:
      - type: change
        name: Back up the development database
        target: /projects/hello_world/environments/dev/assets/managed_server
        action: backup
      - type: change
        name: Configure and start (development)
        target: /projects/hello_world/environments/dev/assets/managed_server
        action: default

  - name: Rollout staging
    run_as: sequential
    children:
      - type: change
        name: Back up the staging database
        target: /projects/hello_world/environments/staging/assets/managed_server
        action: backup
      - type: change
        name: Configure and start (staging)
        target: /projects/hello_world/environments/staging/assets/managed_server
        action: default

  - type: wait
    name: Confirm development and staging are working

  - type: wait
    name: Approve the production rollout
    requires_approval_from:
      user_names:
        - opschain
      ldap_groups:
        - release-managers

  - name: Rollout production
    run_as: sequential
    children:
      - type: change
        name: Back up the production database
        target: /projects/hello_world/environments/prod/assets/managed_server
        action: backup
      - type: change
        name: Configure and start (production)
        target: /projects/hello_world/environments/prod/assets/managed_server
        action: default
```

The tree preview shows the full shape of the run: the parallel pre-flight stage, the sequential rollout stages, the two wait steps and the sequential production stage at the end.

<p align='center'>
  <img alt='Workflow editor' src={require('!url-loader!./images/workflow-editor-pipeline.png').default} className='image-border'/>
</p>

## Validating and publishing

While you're editing, your changes are saved as a **draft** version. Before a workflow can be run it must be **published**.

Click **Validate** to check the workflow against the expected schema. Any errors show up in the logs panel to help you fix them and validate again. Once the workflow is validated, click **Publish** to make this version available to run. Publishing validates the workflow first, so an invalid workflow won't be published.

## Running the workflow

With the workflow published, you can run it. Open the **Run** dialog from the top of the page and choose **Run workflow**, then select the workflow you just created. If your workflow uses [workflow property overrides](/getting-started/familiarisation/gui/workflows.md#using-variables-in-the-workflow), this is where you provide the property overrides in its respective tab.

<p align='center'>
  <img alt='Workflow run dialog' src={require('!url-loader!./images/workflow-run-dialog.png').default} className='image-border'/>
</p>

Once the run reaches the wait step, it pauses. Open the step options and click to continue it and optionally add a confirmation message.

<p align='center'>
  <img alt='Workflow run wait' src={require('!url-loader!./images/workflow-continue-dialog.png').default} className='image-border'/>
</p>

Next, the run pauses again at the approval step. Because we're a member of the approving users, we can approve the production rollout to let the final stage run. A user who isn't named or a member of the LDAP groups in `requires_approval_from` would not be able to approve it.

Once approved, the production stage runs and the workflow completes. The completed step tree gives you a full, auditable record of everything the rollout did and when. You can drill into any step to see its logs, just like an individual change.

## Composing workflows

As pipelines grow, you can keep them manageable by calling one workflow from another with a `workflow` step. The child workflow runs as part of the parent, which lets you build small, reusable building blocks - for example, suppose a workflow named "backup environment" that is parametrized to run a `backup` action on a given environment's asset using [workflow property overrides](/getting-started/familiarisation/gui/workflows.md#using-variables-in-the-workflow):

```yaml
steps:
  - type: change
    name: Backup the {{ env }} environment
    target: /projects/hello_world/environments/{{ env }}/assets/managed_server
    action: backup
```

This simple workflow can be called by another workflow to backup all environments in parallel, for example:

```yaml
steps:
  - type: workflow
    target: /projects/hello_world/workflows/backup-environment
    version: 1
    run_as: parallel
    property_overrides:
    - env: 'dev'
    - env: 'staging'
    - env: 'prod'
```

This step uses the `property_overrides` property to supply the `env` multiple times, which results in the child workflow being called once for each value.

:::note[Published workflow only]
Remember that only published workflow versions can be run and thus called by other workflows.
:::

:::tip[Workflow version]
If the workflow step's `version` property is omitted, the latest published version of the workflow is used.
:::

:::warning
Take care when nesting workflows - it is possible to create a workflow that indirectly calls itself and therefore never ends.
:::

## What to do next

- Schedule your workflow to run automatically using a [scheduled activity](/getting-started/familiarisation/gui/scheduled_activities.md).
- Dive deeper into the [workflow editor page](/getting-started/familiarisation/gui/workflows.md).
- See more advanced features of resource types in our [actions reference guide](/key-concepts/actions.md).
