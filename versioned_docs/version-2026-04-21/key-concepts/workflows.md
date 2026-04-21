---
sidebar_position: 16
description: Learn about OpsChain's workflows, how to create them, and how to run them.
---

# Workflows

A workflow is how you can orchestrate a series of steps to be performed as a single unit of work. Workflows can contain any of the following step types:

- changes
- wait steps
- approval steps
- other workflows

These can be grouped into stages and each stage's steps can be executed sequentially or in parallel.

Workflows can be created via the GUI or via the [API](https://docs.opschain.io/api-docs/#tag/Workflows/paths/~1api~1projects~1%7Bproject_code%7D~1workflows/post).

## Create a workflow

You can create a workflow via the GUI by clicking the _New workflow_ button at the top of the [workflows page](/getting-started/familiarisation/gui/workflows.md), which will take you to the [workflow editor](/getting-started/familiarisation/gui/workflows.md#workflow-editor).

## Viewing a workflow's steps

To visualize the step tree of your workflow, go to the _overview tab_ in the [workflow details page](/getting-started/familiarisation/gui/projects/workflows.md#overview).

## Running a workflow

The workflow details page provides the following buttons to control the execution of the workflow::

| Button              | Description                                                                                                                    |
|---------------------|--------------------------------------------------------------------------------------------------------------------------------|
| _Run workflow_      | Run the workflow, supplying an optional run description if required.                                                           |
| _Schedule workflow_ | Schedule running the workflow, providing a cron schedule and conditional options to determine if and when the workflow is run. |

### Workflow execution options

By default, OpsChain will only allow a single instance of each workflow to be running at any time. This restriction relates to the default [change execution options](/key-concepts/changes.md#change-execution-options) for OpsChain changes that restricts running multiple changes in the same OpsChain project, environment or asset. Running the same workflow multiple times may cause this to happen and would slow the execution of the workflow. If you require the ability to run the same workflow multiple times concurrently, you can configure the use [allow parallel runs of same workflow](/key-concepts/settings.md#allow_parallelruns_of_same_workflow) setting in the project's settings.

### Viewing workflow runs

The _runs_ tab of the workflow details page provides a list of each time the workflow has been run. Clicking on a run will take you to the [workflow run details page](/getting-started/familiarisation/gui/activity_details.md#workflow-run-details) to allow you to view each step of the workflow run.

Each step can be viewed or actioned according to its type. If all the workflow's steps complete successfully, the workflow run will be marked as successful. If a workflow step errors or is cancelled, the remaining steps in the workflow run will not execute and the workflow run will be marked as errored or cancelled based on the status of the step that ended the workflow run.

### Viewing workflow scheduled activity

The _scheduled activity_ tab of the workflow details page provides a list of all the scheduled activity that have been created for the workflow. To remove a schedule, click on the checkboxes for the schedules you wish to remove, then select _delete selected_ from the _bulk operations_ drop down.
