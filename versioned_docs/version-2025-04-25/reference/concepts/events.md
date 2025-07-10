---
sidebar_position: 6
description: Learn about the events OpsChain tracks for auditing and reporting purposes.
---

# Events

This guide gives an overview of event tracking with OpsChain.

After following this guide you should know:

- what events are created by OpsChain automatically
- how to query events via the API
- how to create custom events using the API

:::tip
All the examples in this guide assume the OpsChain API server is running on your local machine. Replace `localhost` with your OpsChain server name if connecting to a remote OpsChain server.
:::

## Overview

Any API request that modifies data in OpsChain will be tracked for auditing and reporting purposes. In future versions OpsChain will track more events, please [let us know](mailto:opschain-support@limepoint.com) if there are particular events you would like tracked.

:::info
OpsChain does not track API requests to the `api/events` API itself.
:::

The data provided within the `attributes` section of the event API response varies depending on the type of event.

All automatically created API events start with the `api:` prefix and are then followed by the API controller, and then the API method. The `index` method is analogous to `list`.

A full list of API events is available [below](/reference/concepts/events.md#system-event-types).

## Viewing events

The OpsChain `api/events` endpoint can be queried to see events in the OpsChain system.

```bash
curl -u "{{username}}:{{password}}" http://localhost:3000/api/events
```

The response is a [JSON:API](https://jsonapi.org/) payload containing a list of the most recent events. The response will include the relevant events from oldest to newest in the response `data` array, i.e. `data[0]` will be the oldest event in the result set.

### Example project index event

Below is an example of a project index event returned by the `api/events` endpoint.

```json
{
  "id": "43404b06-e265-4d4e-a387-4fc83320a778",
  "type": "event",
  "attributes": {
    "username": "opschain",
    "system": true,
    "type": "api:projects:index",
    "created_at": "2021-01-01T01:00:00.000000Z"
  },
  "relationships": {},
  "links": {
    "self": "/events/43404b06-e265-4d4e-a387-4fc83320a778"
  }
}
```

### Filtering events

The query to the `api/events` endpoint can be filtered by providing the relevant query parameters.

For example, the following query will return up to 100 events that were created after 2021-01-01.

:::info
By default, the response is limited to only 10 events, and there is a hard limit of 1000 events. The response status code will be 206 Partial Content when the response has been truncated by the limit.
:::

```bash
curl --globoff --user "{{username}}:{{password}}" 'http://localhost:3000/api/events?filter[created_at_gt]=2021-01-01T01:00:00.000000Z&limit=100'
```

:::note
The `--globoff` argument is required when using the filtering queries using `curl`.
:::

#### Filtering examples

The API filtering and sorting guide includes a variety of [examples](/reference/api-filtering.md#query-examples) that highlight OpsChain's filtering feature and how it can be used to find specific events.

#### More complex examples

Below are some more complex examples of querying the `api/events` API.

:::note
The examples require the `jq` and `curl` utilities, and have been tested with Zsh and Bash 4.
:::

#### Waiting for an event to occur

The following is an example of watching the events API waiting for an event to occur.

```bash
user='{{username}}:{{password}}'
since="$(date --iso-8601=ns)"
event='api:changes:create'

while true; do
  response="$(curl -s -G --user "${user}" http://localhost:3000/api/events --data-urlencode "filter[created_at_gt]=${since}" --data-urlencode "filter[type_eq]=${event}")"
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
  response="$(curl -s -G --user "${user}" http://localhost:3000/api/events --data-urlencode "filter[created_at_lt]=${before}")"
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
curl --fail --user {{username}}:{{password}} http://localhost:3000/api/events -H 'content-type: application/vnd.api+json' -d '{ "data": { "type": "Event", "attributes": { "type": "custom", "some": "value", "nesting": { "also": "works" } } } }'
curl --fail --user {{username}}:{{password}} http://localhost:3000/api/events -H 'content-type: application/vnd.api+json' -d @event-file.json
```

OpsChain responds with a 201 status code and no response body when the event is created successfully.

### Linking events

Events can be linked to data within OpsChain. Below is an example of linking a project with the path `/projects/bank` (this is the same as a project with the code `bank`) to a custom event.

```bash
curl --fail --user {{username}}:{{password}} http://localhost:3000/api/events -H 'content-type: application/vnd.api+json' -d '{ "data": { "type": "Event", "attributes": { "type": "linked:to:project:example", "project_path": "/projects/bank" } } }'
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

## System created events

Events created internally by OpsChain can be identified by the `system` property. If `system` is `true` then the event was created by OpsChain, if it is `false` then the event was created by a user using the `api/events` endpoint - the `username` field identifies the user that created the request.

### System event types

Currently, the following system events are supported. These values will be present in the `type` field for an event:

- `api:authorisation_policies:create`
- `api:authorisation_policies:destroy`
- `api:authorisation_policies:update`
- `api:authorisation_rules:create`
- `api:authorisation_rules:destroy`
- `api:authorisation_rules:update`
- `api:bookmarks:create`
- `api:bookmarks:update`
- `api:bookmarks:destroy`
- `api:changes:create`
- `api:changes:start`
- `api:changes:success`
- `api:changes:error`
- `api:changes:cancel`
- `api:changes:abort`
- `api:changes:destroy`
- `api:nodes:create`
- `api:nodes:update`
- `api:nodes:destroy`
- `api:git_remotes:create`
- `api:git_remotes:update`
- `api:git_remotes:destroy`
- `api:templates:create`
- `api:templates:update`
- `api:template_versions:update`
- `api:policy_assignments:create`
- `api:policy_assignments:destroy`
- `api:policy_rules:create`
- `api:policy_rules:destroy`
- `api:projects:create`
- `api:projects:update`
- `api:projects:destroy`
- `api:properties:update`
- `api:scheduled_changes:create`
- `api:scheduled_workflows:create`
- `api:scheduled_changes:destroy`
- `api:scheduled_workflows:destroy`
- `api:settings:update`
- `api:steps:start`
- `api:steps:approve`
- `api:steps:approve:denied`
- `api:steps:continue`
- `api:steps:success`
- `api:steps:error`
- `api:steps:cancel`
- `api:steps:abort`
- `api:workflow_runs:create`
- `api:workflow_runs:start`
- `api:workflow_runs:success`
- `api:workflow_runs:error`
- `api:workflow_runs:cancel`
- `api:workflow_runs:abort`
- `api:workflow_runs:destroy`
- `api:workflow_steps:start`
- `api:workflow_steps:success`
- `api:workflow_steps:error`
- `api:workflow_steps:cancel`
- `api:workflow_steps:abort`
- `api:workflows:create`
- `api:workflows:update`
- `error:scheduled_changes:change_creation`
- `error:scheduled_changes:git_sha`
- `error:scheduled_workflows:skipped`

Custom (i.e. user created) events can have any `type` as it is specified when the event is created.

## Removing events

Older OpsChain events can be removed, see the [OpsChain data retention](/operations/maintenance/data-retention.md) guide for more details.
