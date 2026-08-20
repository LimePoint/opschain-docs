---
sidebar_position: 8
description: Learn about the events OpsChain tracks for auditing and reporting purposes.
---

# Events

This guide provides an overview of the event tracking system in OpsChain.

After following this guide you should know:

- how events are handled in OpsChain
- which events are created by OpsChain automatically
- how to query events via the API
- how to create custom events using the API

:::tip
All the examples in this guide assume the OpsChain API server is running on your local machine. Replace `<host>` with your OpsChain server name if connecting to a remote OpsChain server.
:::

## Overview

Any API request that modifies data in OpsChain will be tracked for auditing and reporting purposes, this includes creating and updating data, interacting with activities and more. In future versions, OpsChain will track more events, please [let us know](mailto:opschain-support@limepoint.com) if there are particular events you would like tracked.

:::info
OpsChain does not track API requests to the `api/events` API itself.
:::

The data provided within the `attributes` section of the event API response varies depending on the type of event, but it contains more detailed information about the event context.

All automatically created API events start with the `api:` prefix and are then followed by the API controller, and then the API method. When a failure occurs, OpsChain will create an event with the `error:` prefix.

## System created events

Events created internally by OpsChain can be identified by the `system` property. If `system` is `true` then the event was created by OpsChain, if it is `false` then the event was created by a user using the `api/events` endpoint - the `username` field identifies the user that initiated the request.

Further down we present a [list of the event types created by OpsChain](#system-event-types).

## Viewing events

You can view events in the OpsChain web UI by navigating to the [audit history page](/getting-started/familiarisation/gui/audit_history.md).

On the API, the OpsChain `api/events` endpoint can be queried to see events in the OpsChain system.

```bash
curl -u "{{username}}:{{password}}" http://<host>/api/events
```

The response is a [JSON:API](https://jsonapi.org/) payload containing a list of the most recent events. The response will include the relevant events from oldest to newest in the response `data` array, i.e. `data[0]` will be the oldest event in the result set.

### Example change start event

Below is an example of a change start event returned by the `api/events` endpoint.

```json
{
  "id": "43404b06-e265-4d4e-a387-4fc83320a778",
  "type": "event",
  "attributes": {
    "username": "opschain",
    "system": true,
    "type": "api:changes:start",
    "created_at": "2021-01-01T01:00:00.000000Z"
  },
  "relationships": {
    "source": {
      "links": {
        "source": "/api/projects/hello_world/changes/d57edfd7-7536-40fc-9c5b-9492faa0a6fd"
      }
    }
  },
  "links": {
    "self": "/api/events/43404b06-e265-4d4e-a387-4fc83320a778"
  }
}
```

### Filtering events on the API

The query to the `api/events` endpoint can be filtered by providing the relevant query parameters.

For example, the following query will return up to 100 events that were created after 2021-01-01.

:::info
By default, the response is limited to only 10 events, and there is a hard limit of 1000 events. The response status code will be 206 Partial Content when the response has been truncated by the limit.
:::

```bash
curl --globoff --user "{{username}}:{{password}}" 'http://<host>/api/events?filter[created_at_gt]=2021-01-01T01:00:00.000000Z&limit=100'
```

:::note
The `--globoff` argument is required when using the filtering queries using `curl`.
:::

#### Filtering examples with the API

The API filtering and sorting guide includes a variety of [examples](/advanced/api-filtering.md#query-examples) that highlight OpsChain's filtering feature and how it can be used to find specific events.

#### More complex examples using the event API endpoint

Below are some more complex examples of querying the `api/events` API.

:::note
The examples require the `jq` and `curl` utilities, and have been tested with Zsh and Bash 4.
:::

#### Waiting for an event to occur

The following is an example of watching the events API waiting for a change start event to occur.

```bash
user='{{username}}:{{password}}'
since="$(date --iso-8601=ns)"
event='api:changes:start'

while true; do
  response="$(curl -s -G --user "${user}" http://<host>/api/events --data-urlencode "filter[created_at_gt]=${since}" --data-urlencode "filter[type_eq]=${event}")"
  if jq -e '.data | length > 0' <<<"${response}" >/dev/null; then
    echo "${response}"
    break
  fi
  sleep 1
done
```

:::tip
Don't forget to add `--data-urlencode "filter[system_true]=yes"` if you wish to wait for a `system` event.
:::

#### Paginating through events

The following is an example of paginating backwards through the events API. It will output the newest event to the oldest.

```bash
user='{{username}}:{{password}}'

while true; do
  response="$(curl -s -G --user "${user}" http://<host>/api/events --data-urlencode "filter[created_at_lt]=${before}")"
  before="$(jq -r '.data[0].attributes.created_at // empty' <<<"${response}")"
  if [[ -z "${before}" ]]; then
    break
  fi
  jq '.data | reverse[]' <<<"${response}"
done
```

## Creating custom events

Events can be created in the OpsChain events framework by sending a `POST` request to the `api/events` endpoint.

The request needs to be a valid [JSON:API](https://jsonapi.org/) request. E.g.

```bash
curl --fail --user {{username}}:{{password}} http://<host>/api/events -H 'content-type: application/vnd.api+json' -d '{ "data": { "type": "Event", "attributes": { "type": "custom", "some": "value", "nesting": { "also": "works" } } } }'
curl --fail --user {{username}}:{{password}} http://<host>/api/events -H 'content-type: application/vnd.api+json' -d @event-file.json
```

OpsChain responds with a 201 status code and no response body when the event is created successfully.

### Linking events

Events can be linked to data within OpsChain. Below is an example of linking a project with the path `/projects/bank` (this is the same as a project with the code `bank`) to a custom event.

```bash
curl --fail --user {{username}}:{{password}} http://<host>/api/events -H 'content-type: application/vnd.api+json' -d '{ "data": { "type": "Event", "attributes": { "type": "linked:to:project:example", "project_path": "/projects/bank" } } }'
```

Events can be linked to:

- Projects via a path or an ID, e.g. `"project_path": "/projects/bank"`, or `"node_path": "/projects/bank"`, or `"project_id": "ff1bf781-4fe0-4b14-b0d2-20ef8cb1be80"`
- Environments via a path or an ID, e.g. `"node_path": "/projects/bank/environments/dev"`, or `"node_id": "969a2b4c-a700-40d2-a25c-1f4f68cf6d54"`
- Assets via a path or an ID, e.g. `"node_path": "/projects/bank/environments/dev/assets/obp"`, or `"node_id": "2f988308-325d-4a41-bdab-4cf0b8c3103a"`
- In addition, the following models can be linked via an ID, (e.g. `"{{model_type_id}}": "ff1bf781-4fe0-4b14-b0d2-20ef8cb1be80"`):
    - Scheduled changes (via `scheduled_change_id`)
    - Changes (via `change_id`)
    - Steps (via `step_id`)
    - Workflow steps (via `workflow_step_id`)
    - Workflow runs (via `workflow_run_id`)
    - Bookmarks (via `bookmark_id`)
    - Templates (via `template_id`)
    - Template versions (via `template_version_id`)
    - Git remotes (via `git_remote_id`)
    - Properties (via `properties_id`)
    - Properties versions (via `properties_version_id`)
    - Settings (via `settings_id`)
    - Settings versions (via `settings_version_id`)

### System event types

Every system event type is made up of a level, a subject and an action, separated by colons. The level tells you how to react to the event:

- `api:` — a normal operation was carried out, usually via the API.
- `audit:` — a user made an approval decision. These are kept as a record of who approved or rejected what.
- `info:` — OpsChain did something in the background worth knowing about.
- `warn:` and `warning:` — something was not right, but OpsChain carried on.
- `error:` — an operation failed. The reason is in the event's `error` data key, and a `backtrace` is often included.

Some events are throttled, meaning OpsChain records at most one of them in the stated period no matter how often the underlying condition occurs. This keeps a repeating failure from filling the event history.

#### Changes

- `api:changes:create` — a change was created.
- `api:changes:start` — a change was started.
- `api:changes:success` — every step in the change completed successfully.
- `api:changes:error` — the change stopped because one of its steps failed.
- `api:changes:cancel` — the change was cancelled.
- `api:changes:abort` — the change was aborted.
- `api:changes:retry_settings_pruned` — an incomplete change was retried and some of its settings overrides were dropped because they are no longer valid for a change. The `dropped_settings` data key lists them.
- `warn:changes:catalog_not_refreshed` — a change was retried asking for the latest Git revision, but the actions derived from that revision were not available, so the retry ran the actions and step tree the original change ran. The `action`, `template_version` and `catalog_request_status` data keys record which action was affected and why.
- `api:changes:destroy` — a change was deleted.
- `api:change_listener:error` — the listener that picks up change cancellations failed.
- `error:change_worker:delete` — the change's runner pod could not be removed after the change finished. The pod may need to be removed by hand.

#### Steps

- `api:steps:start` — a step was started.
- `api:steps:approve` — a step was approved.
- `api:steps:reject` — a step was rejected.
- `api:steps:continue` — a waiting step was continued.
- `api:steps:success` — the step's action completed successfully.
- `api:steps:error` — a step transition could not be applied.
- `api:steps:cancel` — the step was cancelled.
- `api:steps:abort` — the step was aborted.
- `error:step:action` — the step's action raised an error.
- `error:step:processing` — OpsChain could not process the step at all, so it was failed.
- `error:step:aasm_failure` — a step status transition raised an error.
- `error:steps:transient_error` — a temporary database error stopped a step transition being applied. OpsChain retries, and moves the step to `system_error` if the retries are exhausted. Throttled to one event per hour.
- `api:assign_system_error_job:error` — the job that moves a step to `system_error` failed.

#### Step approvals

- `audit:steps:approve` — a user approved a step that was waiting for approval.
- `audit:steps:reject` — a user rejected a step that was waiting for approval, aborting it.
- `audit:steps:continue` — a user continued a step that was waiting.
- `audit:steps:approve:denied` — a user tried to approve a step they are not an approver for.
- `audit:steps:reject:denied` — a user tried to reject a step they are not an approver for.
- `audit:workflow_steps:approve` — a user approved a workflow step that was waiting for approval.
- `audit:workflow_steps:reject` — a user rejected a workflow step that was waiting for approval, aborting it.
- `audit:workflow_steps:continue` — a user continued a workflow step that was waiting.
- `audit:workflow_steps:approve:denied` — a user tried to approve a workflow step they are not an approver for.
- `audit:workflow_steps:reject:denied` — a user tried to reject a workflow step they are not an approver for.
- `warn:approval_identity_unresolved` — identities stored in a `requires_approval_from` setting no longer exist as OpsChain users or LDAP groups. Steps waiting on them cannot be approved until the setting is corrected. Throttled to one event per hour.
- `warn:approval_identity_validation_skipped` — `requires_approval_from` identities were accepted without being checked because the LDAP directory could not be reached. Throttled to one event per hour.

#### Workflows

- `api:workflows:create` — a workflow was created.
- `api:workflows:update` — a workflow was updated.
- `api:workflow_runs:create` — a workflow run was created.
- `api:workflow_runs:start` — a workflow run was started.
- `api:workflow_runs:success` — every step in the workflow run completed successfully.
- `api:workflow_runs:error` — the workflow run stopped because one of its steps failed.
- `api:workflow_runs:cancel` — the workflow run was cancelled.
- `api:workflow_runs:abort` — the workflow run was aborted.
- `api:workflow_runs:destroy` — a workflow run was deleted.
- `api:workflow_steps:start` — a workflow step was started.
- `api:workflow_steps:approve` — a workflow step was approved.
- `api:workflow_steps:reject` — a workflow step was rejected.
- `api:workflow_steps:continue` — a waiting workflow step was continued.
- `api:workflow_steps:success` — the workflow step completed successfully.
- `api:workflow_steps:error` — the workflow step failed.
- `api:workflow_steps:cancel` — the workflow step was cancelled.
- `api:workflow_steps:abort` — the workflow step was aborted.
- `error:workflow_step:aasm_failure` — a workflow step status transition raised an error.
- `error:workflow_step:run_failure` — running the workflow step raised an error.

#### Scheduled changes and workflows

- `api:scheduled_changes:create` — a scheduled change was created.
- `api:scheduled_changes:destroy` — a scheduled change was deleted.
- `api:scheduled_workflows:create` — a scheduled workflow was created.
- `api:scheduled_workflows:destroy` — a scheduled workflow was deleted.
- `api:scheduled_changes:change_creation:create` — a scheduled change came due and started creating its change.
- `api:scheduled_changes:change_creation:success` — a scheduled change created its change successfully.
- `api:scheduled_workflows:workflow_run_creation:create` — a scheduled workflow came due and started creating its workflow run.
- `api:scheduled_workflows:workflow_run_creation:success` — a scheduled workflow created its workflow run successfully.
- `error:scheduled_changes:change_creation` — a scheduled change could not create its change.
- `error:scheduled_changes:git_sha` — the Git SHA for a scheduled change could not be resolved, so no change was created.
- `error:scheduled_workflows:workflow_run_creation` — a scheduled workflow could not create its workflow run.
- `warning:scheduled_activity:skipped` — a scheduled change or workflow was skipped because one it created earlier was still running and it does not allow parallel execution. Throttled to one event per hour.

#### Projects, environments and assets

- `api:projects:create` — a project was created.
- `api:projects:update` — a project was updated.
- `api:projects:destroy` — a project was deleted.
- `api:nodes:create` — an environment, asset or agent was created.
- `api:nodes:update` — an environment, asset or agent was updated.
- `api:nodes:destroy` — an environment, asset or agent was deleted.
- `api:bookmarks:create` — a bookmark was created.
- `api:bookmarks:update` — a bookmark was updated.
- `api:bookmarks:destroy` — a bookmark was deleted.

#### Properties and settings

- `api:properties:update` — properties were updated.
- `api:settings:update` — settings were updated.
- `warn:settings:override` — a setting was overridden by an `OPSCHAIN_OVERRIDE_` environment variable supplied by the deployment, so it takes precedence over the value stored in OpsChain.

#### Templates and template versions

- `api:templates:create` — a template was created.
- `api:templates:update` — a template was updated.
- `api:template_versions:update` — a template version was updated.
- `api:action_refresh:warn` — an asset's actions could not be refreshed after its template version changed. The asset keeps its previous actions, and the `error` data key holds the reason.
- `info:template_version:fetch_initialize` — a template version was created and queued for its first fetch.
- `info:template_version:fetch` — the fetch of a template version's Git repository started. Its `progress` data key is updated as the fetch produces output, so this event doubles as the live fetch log.
- `info:template_version:fetch_complete` — the fetch finished. The `success` data key records whether it worked.
- `info:template_version:refresh_cancelled` — an in-progress actions refresh was cancelled.
- `info:template_version:refresh_superseded` — a Git revision refresh finished after a newer refresh had replaced it, or after it was cancelled, so the revision it resolved was discarded. Nothing failed - the refresh that replaced it decides the version's revision.
- `warn:template_version:float_refresh_failed` — a template version that [follows its Git revision](/getting-started/familiarisation/gui/projects/asset_templates.md#following-a-git-revision) could not be refreshed. The version keeps serving the commit it already had, and the reason is reported against the version until it successfully follows its revision again.
- `error:template_version:fetch` — the template version's Git repository could not be fetched. The `fetch_output` data key holds the Git output.
- `error:template_version:commit_verification` — the template version's Git remote and revision could not be verified.
- `error:template_version:broken` — the template version was marked broken and cannot be used until it is corrected.
- `error:template_version:build_agent_image` — the agent image for the template version could not be built.
- `error:template_version:refresh_actions` — the template version's actions could not be refreshed.
- `error:template_version:refresh_cancelled` — cancelling an in-progress actions refresh failed.

#### MintModel

- `api:generate_actions_request:create` — a request to generate an asset's actions was created. The `trigger` data key records what prompted it.
- `error:generate_actions_request:generate` — an actions generation request failed.
- `error:mintmodel:generate` — the MintModel API could not generate the asset's MintModel. The converged properties sent to the API are included to help diagnose the failure.
- `error:mintmodel:derive_actions` — the asset's actions could not be derived from its MintModel.
- `error:mintmodel:actions_cache_not_persisted` — the generated actions could not be cached, so they will be regenerated every time they are needed until this is resolved. Throttled to one event per hour.
- `error:mint_model_concretise_task:concretise` — a MintModel concretisation task failed.

#### Agents

- `api:agent:start` — an agent was asked to start and the task to create its container was created.
- `api:agent:started` — the agent's container is running.
- `api:agent:stop` — an agent was asked to stop and the task to remove its container was created.
- `api:agent:stopped` — the agent's container was removed.
- `error:agent:start` — the agent's container could not be created.
- `error:agent:stop` — the agent's container could not be removed.
- `error:build_agent_image_task:build` — building the agent's image failed.

#### Image builds

- `info:image_build:queued` — an image build was held back because the configured number of concurrent image builds was already running. The `queued_behind` data key lists the builds ahead of it.
- `info:image_build:started` — an image build started.
- `info:image_build:completed` — an image build finished successfully.
- `info:image_build:failed` — an image build failed.
- `warn:image_build:content_key_error` — the key used to recognise an equivalent existing image could not be calculated, so the image was built again instead of being reused.
- `warn:image_build:required_check_error` — OpsChain could not work out whether an image build was needed, so it built one to be safe.

#### Runner base image

- `info:runner_base_image_warm:completed` — the runner base image was pulled into the build service cache ahead of time, so the next runner image build does not have to wait for it. The `duration_seconds` data key records how long it took.
- `warn:runner_base_image_warm:failed` — the runner base image could not be pulled into the build service cache. Runner image builds still work, but the first one pays the download cost. Throttled to one event per hour.

#### Image registry

- `info:registry_reconcile:summary` — the image registry was reconciled against the images OpsChain still needs, and unused images were removed.
- `error:registry_reconcile:failure` — reconciling the image registry failed.

#### Git remotes

- `api:git_remotes:create` — a Git remote was created.
- `api:git_remotes:update` — a Git remote was updated.
- `api:git_remotes:destroy` — a Git remote was deleted.
- `error:git_remote:create` — the Git remote could not be reached when it was created. It is still created, but changes using it will fail until it is reachable.
- `error:git_remote:update` — the Git remote could not be reached after it was updated.
- `error:git_remote:fetch` — fetching from the Git remote failed.
- `warn:git_remote:mountable_fetch_failed` — OpsChain could not refresh its copy of the Git remote before mirroring it into a runner pod for the [`git_clone` resource](/advanced/resource-types/index.md#opschain-git-clone). The pod is still started, so the mirror the step checks out from may be out of date, or missing altogether if the remote has never been fetched successfully. Throttled to one event per hour.
- `warn:git_remote:periodic_fetch:failed` — the scheduled background fetch that keeps OpsChain's copy of the Git remote up to date failed. The remote is retried progressively less often while it keeps failing, as described in [`git_remote.periodic_fetch_interval`](/key-concepts/settings.md#git_remoteperiodic_fetch_interval). Throttled to one event per hour.
- `info:git_remote:periodic_fetch:recovered` — the scheduled background fetch of a Git remote succeeded again after previously failing. The message records how many consecutive failures preceded it.
- `info:git_remote:periodic_fetch:summary` — a periodic summary of background Git remote fetching across all active Git remotes: how many there are, how many have been fetched at least once, how many are currently failing, when the least recently fetched one was last fetched, and the fastest, median, 95th percentile and slowest fetch durations. Recorded once a day by default — see [`git_remote.periodic_fetch_summary.enabled`](/key-concepts/settings.md#git_remoteperiodic_fetch_summaryenabled).

#### Secrets and the secret vault

- `api:secrets:encrypt` — a value was encrypted and stored in the secret vault.
- `api:secrets:resolve` — a stored secret was decrypted and returned.
- `info:secret_vault_pod_roll:summary` — secret vault pods running out-of-date configuration were restarted.
- `error:secret_vault_pod_roll:failure` — restarting out-of-date secret vault pods failed.

#### Authorisation

- `api:authorisation_policies:create` — an authorisation policy was created.
- `api:authorisation_policies:update` — an authorisation policy was updated.
- `api:authorisation_policies:destroy` — an authorisation policy was deleted.
- `api:authorisation_rules:create` — an authorisation rule was created.
- `api:authorisation_rules:update` — an authorisation rule was updated.
- `api:authorisation_rules:destroy` — an authorisation rule was deleted.
- `api:policy_assignments:create` — a policy was assigned to a user or group.
- `api:policy_assignments:destroy` — a policy assignment was removed.
- `api:policy_rules:create` — a rule was added to a policy.
- `api:policy_rules:destroy` — a rule was removed from a policy.

#### Users and LDAP

- `api:ldap_refresh:user_start` — a refresh of the cached LDAP user entries started. The search base and filter used are included.
- `api:ldap_refresh:group_start` — a refresh of the cached LDAP group entries started.
- `api:ldap_refresh:success` — the LDAP refresh completed, and the entry counts are recorded in the event data.
- `api:ldap_refresh:warn` — the LDAP refresh completed but something was not right. The cached entries were left as they were.
- `api:ldap_refresh:error` — the LDAP refresh failed, or completed with problems serious enough that stale cached entries were removed.

#### Events and notifications

- `api:event_filter:error` — an event filter could not be evaluated, so its subscribers were not notified.
- `api:event_subscriber:error` — an event subscriber could not be notified. Throttled to one event per hour.
- `api:event_processor:error` — an event could not be processed. Throttled to one event per hour.
- `api:notification:error` — a notification could not be delivered. Throttled to one event per hour.

#### Data cleaning

- `info:data_cleanup:activities` — a data cleaning rule removed finished changes and workflow runs. The `removed_count` and `filters` data keys record how many were removed and the rule that removed them.
- `info:data_cleanup:events` — a data cleaning rule removed old events.
- `info:data_cleanup:jobs` — a data cleaning rule removed old job history.
- `info:data_cleanup:agent_images` — a data cleaning rule removed unused agent images.
- `error:data_cleanup:activities` — removing finished changes and workflow runs failed.
- `error:data_cleanup:events` — removing old events failed.
- `error:data_cleanup:jobs` — removing old job history failed.
- `error:data_cleanup:agent_images` — removing unused agent images failed.

#### Resource slots

- `warn:resource_slot_pool:full` — every slot in a resource slot pool was in use, so work that needed one had to wait. The `pool` and `configured_limit` data keys identify which pool and its limit. Throttled per cluster and pool.
- `api:resource_slot_freed_listener:error` — the listener that wakes work waiting on a freed resource slot failed. Waiting work still runs, but starts later than it could have.

#### API autoscaler

- `info:api_autoscaler:grow` — an API worker was added because the request backlog stayed high.
- `info:api_autoscaler:shrink` — an API worker was removed because the request backlog had cleared.
- `warn:api_autoscaler:grow_blocked_connections` — the autoscaler wanted to add an API worker but did not, because too few database connections were spare. Throttled to one event every five minutes.
- `warn:api_autoscaler:grow_blocked_memory` — the autoscaler wanted to add an API worker but did not, because the pod had too little spare memory. Throttled to one event every five minutes.
- `error:api_autoscaler:tick_failed` — an autoscaler evaluation failed. Throttled to one event every five minutes.

#### Platform and background jobs

- `error:api:controller:unhandled` — an API request failed with an error OpsChain did not expect. The `request_method` and `request_path` data keys identify the request.
- `api:job:error` — a recurring background job could not be re-queued, so it may not run until the next attempt.
- `error:fluentd:log_failure` — step logs could not be sent to the log aggregator and were written straight to the database instead. The logs are not lost, but log queries may be slower.

Custom (i.e. user created) events can have any `type` as it is specified when the event is created.

## Removing events

Older OpsChain events can be removed to free up space, see the [OpsChain data cleaning](/operations/maintenance/data-cleaning.md) guide for more details.
