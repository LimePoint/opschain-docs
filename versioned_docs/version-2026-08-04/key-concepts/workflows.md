---
sidebar_position: 7
description: Learn about OpsChain workflows, creating workflow runs, and managing their execution.
---

# Workflows

This guide covers OpsChain workflows, running them, and options available to manage their execution. After reading this guide you should understand:

- what a workflow run is and how it executes
- how to skip steps when starting or retrying a workflow run
- configuration options available to control workflow run execution
- adding and using workflow run metadata

## Overview

A workflow is an ordered series of steps — changes, wait steps, approval steps, and nested workflows — organised into stages. Running a workflow creates a **workflow run**. Unlike a change, which applies a single action from a Git repository, a workflow orchestrates multiple changes across one or more projects, environments, or assets.

:::tip[Learning more]
For a guided walkthrough of building a workflow, see the [workflows tutorial](/getting-started/tutorials/workflows.md).

For information on the GUI workflow editor and the full step type reference, see the [workflows GUI guide](/getting-started/familiarisation/gui/workflows.md).
:::

## Workflow run lifecycle

A workflow run, and the steps that make it up, transition between states as they execute — mirroring the [change & step lifecycle](/key-concepts/changes.md#change--step-lifecycle).

When a workflow run is created its state is set to `initializing` while its initial steps are prepared. Once ready it moves to `pending`. A step remains `pending` until its prerequisites are complete. If a step fails, any steps still `pending` in the same stage will be set to `aborted`.

When a step starts executing it enters the `queued` state while waiting for a worker, then `running` while actively executing. On completion it transitions to `success` or `error`.

If a workflow run is cancelled, all finalised steps remain in their existing state, and all `pending`, `queued`, or `running` steps are transitioned to the `cancelled` state.

### Retrying workflow runs

Workflow runs that have failed or been cancelled can be retried. When retrying, completed steps are not rerun — they remain in the `success` state with their original timings. Steps that were actively running when the workflow run ended are restarted from the beginning.

### Skipping steps

When creating or retrying a workflow run, you can supply a `skip_steps` array of glob patterns. Any workflow step whose `name` matches a pattern is automatically skipped at runtime.

The `skip_steps` mask is carried forward automatically on retry — previously-skipped steps remain skipped without needing to be resubmitted. The mask can be overridden at retry time.

:::note
Approval steps are always exempt from skipping — a step with `requires_approval_from` set will run regardless of any matching pattern.
:::

:::tip
The same `skip_steps` feature is available on changes. See [skipping steps](/key-concepts/changes.md#skipping-steps) for more information, including MintModel step matching.
:::

## Execution options

By default, OpsChain allows only one instance of a given workflow to run at a time. If concurrent execution is appropriate, you can modify the [allow parallel runs of the same workflow](/key-concepts/settings.md#allow_parallelruns_of_same_workflow) setting on the project.

## Workflow run metadata

When creating a workflow run, OpsChain allows you to associate additional metadata with it. This metadata can then be used:

- when searching for workflow runs (via the web UI)
- when reporting on and searching the workflow run history (via the API)

### Adding metadata to a workflow run

On the GUI, you can add metadata to a workflow run by filling in the metadata fields in the run creation form.

### Query workflow runs by metadata

You can query workflow runs by metadata via the search field in the [activity page](/getting-started/familiarisation/gui/activity.md).

When querying workflow runs via the API, you can use OpsChain's [API filtering](/advanced/api-filtering.md) feature to limit the response to runs whose metadata matches a specified value, e.g.:

```bash
curl -G --user "{{username}}:{{password}}" 'http://<host>/api/projects/{{project_code}}/workflow_runs' --data-urlencode 'filter[metadata_text_cont]=CR921'
```

:::note
Update the username, password, host, port and project code to reflect your OpsChain server configuration.
:::
