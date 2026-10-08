---
sidebar_position: 6
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

- An OpsChain [project](/key-concepts/overview.md#project), [environment](/key-concepts/overview.md#environment) or [asset](/getting-started/familiarisation/gui/projects/assets.md)
- If running the change on a project or environment, a [Git remote](/getting-started/familiarisation/gui/projects/git_remotes.md) and Git revision (tag/branch/SHA). Assets are already linked to a Git remote and Git revision
- The OpsChain [action](/key-concepts/actions.md) to execute

:::tip[Creating changes]
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

When a change starts executing it enters the `queued` state. Changes and steps stay in the `queued` state while they are waiting for an OpsChain worker to start executing them (e.g. if all workers are already busy, a change will wait until a worker is available). A change or step may also wait here when the cluster has reached its [runner pod concurrency cap](/key-concepts/settings.md#runner-pod-concurrency-and-limit-settings), starting once a running pod completes and frees capacity.

Whilst a change or step is actively executing it is in the `running` state.

If the change/step succeeds it transitions to the `success` state. If the change/step fails it transitions to the `error` state.

A running change can be cancelled by anyone with permission to [execute](/getting-started/familiarisation/gui/manage_security.md#authorisation-rule-actions) its action — the same permission required to start it. If a change is cancelled by a user, all finalised steps (i.e. in the `success` or `error` state) remain in their existing state, and all `pending`, `queued`, or `running` steps are transitioned to the `cancelled` state. There is no rollback of any kind, steps that have not yet started will not start, and steps that are in progress are stopped immediately.

A change may also remain in the `pending` state while waiting for any existing changes in the same project, environment or asset to finish (this behaviour can be overridden using [change execution options](/key-concepts/changes.md#change-execution-options)).

#### Behaviour when a child step fails

Configuring a step's children to run sequentially or in parallel not only impacts how they are executed but also effects how OpsChain processes them in case of a failure. If a child step fails:

- _Sequential:_ OpsChain terminates the change at the completion of the failed child step and any remaining steps will not run
- _Parallel:_ OpsChain allows all siblings of the failed child step to complete and then terminates the change

The change status will transition to `error` when OpsChain terminates the change.

#### Approving a change

A change matched by a [`requires_approval_from`](/key-concepts/settings.md#requires_approval_from) rule does not start until its approvers approve it.

The change's step tree opens with an approval step as its root, and the action you asked for runs as that step's child. Approving the step releases the change and the action starts; rejecting it aborts the change, which then reports the `rejected` status rather than `aborted`. Every requirement in the matched rules must be approved before the action runs — a rule listing several users or LDAP groups is satisfied by the first of them to approve, so requiring two people means writing two rules. A rule that the person who created the change satisfies is dropped rather than applied, because nobody is asked to approve their own change, so a change whose only matching rules name its creator starts without waiting.

While a change is held at an approval step — this one, or one declared in its actions — it reports the `waiting_for_approval` status. The change still reports the action you requested. The activities list, the change's action and the [authorisation rules](/getting-started/familiarisation/gui/manage_security.md#authorisation-rule-actions) that govern who can run it are unaffected by the approval step sitting above it.

Approve and reject from the change page's buttons, from the approval tab of [manage activity](/getting-started/familiarisation/gui/manage_activity.md), or via `POST /api/steps/{id}/approve` and `POST /api/steps/{id}/reject`.

A change can carry two gates: this one, configured by an administrator in the settings, and an [approval step](/key-concepts/actions.md#approval-steps) declared in your `actions.rb` for the action itself. The change stops at each in turn, and the two approver lists are kept separate — someone named in the setting cannot approve the declared step unless they are named there too.

#### Pausing and resuming a change

A running change can be paused by anyone with permission to [execute](/getting-started/familiarisation/gui/manage_security.md#authorisation-rule-actions) its action — the same permission required to start it — using `POST /api/changes/{id}/pause`. Unlike cancelling, pausing does not stop anything already in progress: steps that are `running` or `queued` when the change is paused continue to completion as normal. Pausing only stops the change from admitting further work once those steps finish — no further steps are started, and the change stops waiting to run if it had not started yet. Pausing a change before it has built its [worker pod](/key-concepts/settings.md#pod_per_change_step) prevents that build from happening at all, the same way [maintenance mode](/operations/maintenance/maintenance-mode.md) does.

A paused change reports its `pause_state` as one of:

- `none` — the change is not paused
- `pausing` — the change is paused, but still has steps actively running or waiting
- `paused` — the change is paused and has fully drained; nothing is still executing

`POST /api/changes/{id}/resume` lets the change continue admitting steps again, picking up from wherever it was left. Both requests take an optional `reason` — see the [API reference](pathname:///api-docs/#tag/Changes) for the request format.

Pausing and resuming are recorded as `audit:changes:pause`/`audit:changes:resume` events, returned as the change's `paused_by` attribute alongside who paused or resumed it and any reason supplied. Each is also written to the change's own log, naming who asked and why, so the log shows why the change stopped starting steps.

The [activities](pathname:///api-docs/#tag/Activities) endpoints report `paused`, `paused_at`, `pause_state` and `paused_by` for every change and workflow run, and can be filtered on them: `filter[paused_eq]=true` returns the activities that are pausing or paused, and `filter[pause_state_eq]=paused` only those that have fully drained.

A change that has already finished cannot be paused, and a change that is already paused cannot be paused again.

:::tip
The same pause/resume behaviour is available for workflow runs. See [pausing and resuming a workflow run](/key-concepts/workflows.md#pausing-and-resuming-a-workflow-run).
:::

:::info
An instance-wide equivalent exists too: putting OpsChain into [maintenance mode](/operations/maintenance/maintenance-mode.md) stops every change and workflow run from starting, without needing to pause each one individually.
:::

#### Retrying changes

Changes that have failed or been cancelled can be retried.

When retrying a change, the existing change is duplicated as a new change and started from where the existing change ended. Any successfully completed steps are not rerun - they will stay in the `success` state with their original started and finished times. Steps that were being run by a worker when the change ended are restarted from the start as OpsChain does not track step internals.

As steps are rerun from the start we suggest only retrying changes/steps that are idempotent.

A change's [settings](/key-concepts/settings.md) overrides are fixed when it is created and cannot be edited afterwards. When retrying a change you can supply a new set of override settings, which replaces the overrides copied from the change being retried rather than merging into them. This makes it possible to correct or adjust a setting to get the change through, instead of only being able to rerun it with the settings it already had. Supplying an empty set of overrides clears the copied overrides entirely, returning each affected setting to the value it inherits; omitting them altogether keeps the copy and prune behaviour described below.

:::note[NOTES]

1. When OpsChain retries a change, it will retry it using the code from the resolved Git SHA stored with the original change, so a retry reproduces the code the original change ran rather than picking up later commits. To run the latest code instead, ask for the Git revision to be re-resolved when retrying (`refresh_sha`) — for a change on an asset this also moves the retry onto the asset's current template version.
2. The logs for the original change are not included on the new change. However, they can still be seen in the original change page.
3. A retried change runs with the settings the original change resolved, so the values it ran with do not move underneath it. Settings that did not exist when the original ran are resolved from the current settings, as are the settings that determine where a change is built and deployed and the [`requires_approval_from`](/key-concepts/settings.md#requires_approval_from) approval requirements — a retry cannot target a deployment target that has moved, skip an approval requirement added since, or keep demanding approval from an approver who has since been removed.
4. Override settings copied from the original change that are no longer valid change level settings are dropped, and the dropped settings are recorded in the change's events.
5. A retried change asks for its approvals again — both the change level gate and any [approval step](/key-concepts/actions.md#approval-steps) in the tree that had not already been approved. Steps that completed successfully are not rerun, so an approval step that was approved and whose children finished is not presented again.

:::

#### Skipping steps

When creating or retrying a change, you can supply a `skip_steps` array of glob patterns. Steps whose identifier matches a pattern are automatically skipped at runtime — `full_path` is matched for change steps; MintModel steps are matched by their hierarchical step name as it appears in the step tree (e.g. `**/Install jdk Binaries`). Patterns are matched without regard to case, so `**/install jdk binaries` matches the same step.

The `skip_steps` mask is carried forward automatically on retry — previously-skipped steps remain skipped without needing to be resubmitted. The mask can be overridden at retry time.

:::note
[Approval steps](/key-concepts/actions.md#approval-steps) are always exempt from skipping — a step with `requires_approval_from` set will run regardless of any matching pattern. Creating or retrying a change where `skip_steps` would skip the root step is rejected with a validation error.
:::

In the GUI, **Mark steps to skip** in the [run change dialog](/getting-started/familiarisation/gui/activity.md#marking-steps-to-skip) opens the chosen action's step tree and turns the steps you tick into patterns for you. It is available when starting a change, when scheduling one, and when retrying or rerunning one — a rerun opens with the previous run's selection already ticked.

:::tip
The same `skip_steps` feature is available on workflow runs. See [skipping steps](/key-concepts/workflows.md#skipping-steps) for more information.
:::

#### Starting a change partway through

When a change's step tree is known up front — a templated or asset change whose actions come from a MintModel or an `actions.rb` action with child steps — you can begin execution at a nominated step rather than at the top of the tree. Supply a `starting_step` naming the step to start from: the steps that precede it (its ancestors) are skipped, and the nominated step and its descendants run as usual.

`starting_step` can only be supplied for a change that has a generated step tree, and must name a step within it. It is matched without regard to case.

If `starting_step` names an `actions.rb` action that collides with a same-named MintModel action, the `actions.rb` action's own precedence still applies even though it is now the root step of the change — see [name collisions between `actions.rb` and MintModel actions](/key-concepts/actions.md#name-collisions-between-actionsrb-and-mintmodel-actions).

In the GUI, this is available from a non-root step's play button in an asset's action tree via _Run \<action\> from here_ — see [running an activity](/getting-started/familiarisation/gui/activity.md#run-change).

:::note
A change started partway through an action tree cannot be scheduled.
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

To add metadata to a change via the CLI, see the [changes CLI guide](/getting-started/familiarisation/cli/index.md#11-changes-executing-actions) for more information.

### Query changes by metadata

You can query changes by metadata via the search field in the [activity page](/getting-started/familiarisation/gui/activity.md).

When querying changes via the change API, you can use OpsChain's [API filtering](/advanced/api-filtering.md) feature to limit the response to changes whose metadata matches the value we specified in the metadata, e.g.:

```bash
curl -G --user "{{username}}:{{password}}" 'http://<host>/api/changes' --data-urlencode 'filter[metadata_text_cont]=CR921'
```

:::note[NOTES]
Update the username, password, host and port to reflect your OpsChain server configuration.
:::

:::tip
For more information on filtering the change list output, see the [API filtering & sorting guide](/advanced/api-filtering.md).
:::

### Metadata OpsChain records

OpsChain adds its own entries under the `opschain` key of a change's metadata, which is reserved for this:

| Key | Recorded when |
|-----|---------------|
| `parent_change_id` | The change was created by another change's action through the OpsChain API, with that change's [API key](/key-concepts/context.md#api-key). Holds the ID of the change that created it. |
| `asset_action` | A change on an asset [starts partway through an action](#starting-a-change-partway-through). Holds the name of the action the starting step belongs to. |
| `commit_file_patterns` | A scheduled change was created because [commit file patterns](/getting-started/familiarisation/gui/scheduled_activities.md#seeing-why-a-change-ran) matched. |

The [activity details](/getting-started/familiarisation/gui/activity_details.md#header-information) screen links to the parent change and to the asset action.

### Using metadata in actions

Using the metadata example from above, the change metadata can also be accessed from within your `actions.rb` via [OpsChain context](/key-concepts/context.md). The following action would output the change request key into the change log:

```ruby
action :print_change_request_key do
  log.info "The change request key is: #{OpsChain.context.change.metadata.change_request}"
end
```

## Secrets

You can securely access your secret vault from within your actions. See the [secrets guide](/getting-started/tutorials/secrets.md) for more information.
