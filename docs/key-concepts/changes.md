---
sidebar_position: 5
description: Learn about OpsChain changes, creating them, and managing their execution.
---

# Changes

This guide covers OpsChain changes, creating them, managing their execution and limitations to be aware of. After reading this guide you should understand:

- how to create a change
- how a change is executed
- configuration options available to control change execution
- adding and using change metadata

## Overview

A change is the application of an action from a specific commit in a Git repository, to a particular project, environment or asset. The action(s) defined in the repository's `actions.rb` file allow you to structure your changes in a variety of ways and will be influenced by the tools you use with OpsChain. You may structure your changes using "desired state" techniques, or by applying explicit actions (e.g. upgrading a single package in response to a security vulnerability).

### Creating a change

OpsChain changes can be created via the OpsChain CLI, GUI, or by directly POSTing to the API changes endpoint. To create an OpsChain change, the following information is required:

- An OpsChain [project](/key-concepts/overview.md#project), [environment](/key-concepts/overview.md#environment) or [asset](/key-concepts/assets.md)
- If running the change on a project or environment, a [Git remote](/key-concepts/git-remotes.md) and Git revision (tag/branch/SHA). Assets are already linked to a Git remote and Git revision
- The OpsChain [action](/key-concepts/actions.md) to execute

:::tip Creating changes
For more information on using the CLI to create a change, see `opschain change create --help`.

For more information on using the GUI to create a change, see [creating a new change](/getting-started/familiarisation/gui/activity.md#run-change).

To learn how to create changes via the API, see OpsChain's API reference by accessing the API documentation on the OpsChain host with your browser (e.g. `http://<host>/api-docs`).
:::

## Change properties

To unlock the true power of OpsChain, your actions should be constructed to take advantage of the OpsChain [properties](/key-concepts/properties.md) framework. This allows the actions to dynamically source hostnames, credentials and other project/environment specific information at runtime rather than being hard-coded into the actions.

### Static properties

The change's Git reference identifies the static [repository properties](/key-concepts/properties.md#git-repository) that will be supplied to the change. As detailed in the [OpsChain properties guide](/key-concepts/properties.md#opschain-properties), repository properties can be overridden by project, environment, asset and change properties.

### Dynamic properties

As each step in your change is constructed, OpsChain will supply it with the latest version of the change's project, environment, asset and change [database properties](/key-concepts/properties.md#database). This ensures any modifications made to the properties in prior change steps (or other changes) are available to the action.

## Change execution

A step will be created for the change action, with additional steps created for each child action. The [child execution strategy](/key-concepts/actions.md#child-execution-strategy) specified by each action will determine whether its child actions are executed serially or in parallel.

:::info
The number of OpsChain worker nodes configured when the OpsChain server is deployed provides a hard limit on the number of steps that OpsChain can execute at a time. For example, with 3 worker nodes, OpsChain can run:

- 3 parallel steps from a single change
- 3 individual steps from 3 distinct changes
- 2 parallel steps from one change, and one step from another

:::

### Change & step lifecycle

Changes, and the steps that make them up, transition between states as they execute.

When a change is created, its state is set to `initializing` whilst the Git revision is resolved and validated. Once the Git revision details are validated, the change moves to the `pending` state. A step remains in the `pending` state until its prerequisites are complete. If a step fails, any steps in the same change that are still `pending` will be set to the `aborted` state.

When a change starts executing it enters the `queued` state. Changes and steps stay in the `queued` state while they are waiting for an OpsChain worker to start executing them (e.g. if all workers are already busy, a change will wait until a worker is available).

Whilst a change or step is actively executing it is in the `running` state.

If the change/step succeeds it transitions to the `success` state. If the change/step fails it transitions to the `error` state.

If a change is cancelled by a user, all finalised steps (i.e. in the `success` or `error` state) remain in their existing state, and all `pending`, `queued`, or `running` steps are transitioned to the `cancelled` state. There is no rollback of any kind, steps that have not yet started will not start, and steps that are in progress are stopped immediately.

A change may also remain in the `pending` state while waiting for any existing changes in the same project, environment or asset to finish (this behaviour can be overridden using [change execution options](/key-concepts/changes.md#change-execution-options)).

#### Behaviour when a child step fails

Configuring a step's children to run sequentially or in parallel not only impacts how they are executed but also effects how OpsChain processes them in case of a failure. If a child step fails:

- _Sequential:_ OpsChain terminates the change at the completion of the failed child step and any remaining steps will not run
- _Parallel:_ OpsChain allows all siblings of the failed child step to complete and then terminates the change

The change status will transition to `error` when OpsChain terminates the change.

#### Retrying changes

Changes that have failed or been cancelled can be retried.

When retrying a change, the existing change is duplicated as a new change and started from where the existing change ended. Any successfully completed steps are not rerun - they will stay in the `success` state with their original started and finished times. Steps that were being run by a worker when the change ended are restarted from the start as OpsChain does not track step internals.

As steps are rerun from the start we suggest only retrying changes/steps that are idempotent.

:::note NOTES

1. When OpsChain retries a change, it will retry it using the code from the resolved Git SHA stored with the original change. If you wish to retry a change using updated Git repository code, a new change must be created so OpsChain can resolve the new Git SHA.
2. The logs for the original change are not included on the new change. However, they can still be seen in the original change page.

:::

### Limitations

The OpsChain properties guide highlights a number of limitations that must be taken into account when [changing properties in concurrent steps](/key-concepts/properties.md#changing-properties-in-concurrent-steps).

### Change execution options

By default, OpsChain will allow multiple changes to execute for a given project, environment or asset, but only one with the same action name. This aims to reduce the likelihood that the limitations described above will impact running changes. If the actions in your Git repository perform logic that can be run concurrently, and they interact with the database properties in a manner that will not be impacted by the limitations, you can configure the project to allow concurrent changes within it and its children.

To do this, you can configure the project, environment or asset by modifying the [allow parallel runs of the same change](/key-concepts/settings.md#allow_parallelruns_of_same_change) setting.

## Change metadata

When creating a change, OpsChain allows you to associate additional metadata with a change. This metadata can then be used:

- when searching for changes (via the web UI)
- when reporting on and searching the change history (via the API)
- from within your `actions.rb` actions

### Adding metadata to a change

On the GUI, you can add metadata to a change by filling in the metadata fields in the metadata tab of the change creation form.

To add metadata to a change via the CLI, you can reate a JSON metadata file to associate with the change:

```bash
cat << EOF > change_metadata.json
{
  "change_request": "CR921"
}
EOF
```

Use the CLI to associate the metadata with a change:

```bash
opschain change create -p project -e environment -m change_metadata.json -a action -g git_rev -G git_remote -y
```

### Query changes by metadata

You can query changes by metadata via the search field in the [activity page](/getting-started/familiarisation/gui/activity.md).

When querying changes via the change API, you can use OpsChain's [API filtering](/advanced/api/api-filtering.md) feature to limit the response to changes whose metadata matches the value we specified in the metadata, e.g.:

```bash
curl -G --user "{{username}}:{{password}}" 'http://<host>/api/changes' --data-urlencode 'filter[metadata_text_cont]=CR921'
```

:::note NOTES
Update the username, password, host and port to reflect your OpsChain server configuration.
:::

:::tip
For more information on filtering the change list output, see the [API filtering & sorting guide](/advanced/api/api-filtering.md).
:::

### Using metadata in actions

Using the metadata example from above, the change metadata can also be accessed from within your `actions.rb` via [OpsChain context](/key-concepts/context.md). The following action would output the change request key into the change log:

```ruby
action :print_change_request_key do
  OpsChain.logger.info "The change request key is: #{OpsChain.context.change.metadata.change_request}"
end

## Secrets

You can securely access your secret vault from within your actions. See the [secrets guide](/docs/getting-started/tutorials/using-secrets-in-your-change.md) for more information.
