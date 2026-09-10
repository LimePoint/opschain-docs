---
sidebar_position: 8
description: A guide to sorting and filtering the API list output.
---

# API filtering & sorting

Except for the "list properties versions" endpoint (`/api/properties_versions`), all OpsChain API list endpoints support filtering and sorting by resource attributes. This guide provides an overview of how to filter and sort the API output.

## Querying the API

The sorting and filtering examples throughout this document assume you are accessing the API via the `curl` CLI. A sample `curl` command appears below:

```bash
curl -G --user '{{username}}:{{password}}' '{{protocol}}://{{opschain host}}:{{opschain port}}/api/projects' --data-urlencode '{{filter}}'
```

Replace the following placeholders with the appropriate values:

| Parameter           | Description                                                                                     |
|---------------------|-------------------------------------------------------------------------------------------------|
| `{{username}}`      | The username of the OpsChain user you are authenticating as.                                    |
| `{{password}}`      | The password of the OpsChain user you are authenticating as.                                    |
| `{{protocol}}`      | The protocol to use when connecting to the OpsChain API server. For example, `http` or `https`. |
| `{{opschain host}}` | The hostname of the OpsChain API server.                                                        |
| `{{opschain port}}` | The port number of the OpsChain API server.                                                     |
| `{{filter}}`        | The filter to apply to the API results (see examples below).                                    |

E.g.

```bash
curl --user 'opschain:password' 'http://localhost:3000/api/projects' -G --data-urlencode 'filter[sorts]=archived desc'
```

:::tip[Avoid storing credentials]
To avoid potentially storing credentials in the shell history the password can be omitted and filled in when prompted.
:::

### Combining filters

If you wish to include multiple filters, you can use the `--data-urlencode` parameter multiple times. The following example filters for any archived projects with a description containing `prod`.

```bash
curl --user 'opschain:password' 'http://localhost:3000/api/projects' -G --data-urlencode 'filter[description_cont]=prod' --data-urlencode 'filter[archived_eq]=true'
```

By default, multiple filters will be combined using a "logical and". To use a "logical or" add `filter[m]=or` to the query. The following example filters for projects with a description containing `prod` or any project that has been archived.

```bash
curl --user 'opschain:password' 'http://localhost:3000/api/projects' -G --data-urlencode 'filter[description_cont]=prod' --data-urlencode 'filter[archived_eq]=true' --data-urlencode 'filter[m]=or'
```

### Response limits

The list endpoints return a limited number of records. Pass `limit` to ask for a different number:

```bash
curl --user 'opschain:password' 'http://localhost:3000/api/events' -G --data-urlencode 'limit=500'
```

Each endpoint has its own default and its own maximum, and a `limit` above the maximum is capped rather than rejected. Most endpoints default to 100 records and cap at 10,000. The exceptions are:

| Endpoint | Default | Maximum |
|---|---|---|
| `/api/events` | 10 | 1000 |
| `/api/steps` and `/api/workflow_steps` | 1000 | 1000 |
| `/api/admin/jobs` | 100 | 1000 |
| `/api/activities` | 100 | 1000 |

A response that was truncated by the limit is returned with the `206 Partial Content` status code and reports `"partial_response": true` under its `meta` key. Narrow the result with a filter, or [page through it](/key-concepts/events.md#paginating-through-events), rather than raising the limit to fit everything into one response.

## Resource attributes

To determine the attributes available to filter and sort by, review the resource's API response. In addition to the `id` attribute, the fields listed under the `attributes` key can be used to filter and sort the API results. For example the `api/projects` endpoint produces a response similar to the following:

```json
{
  "data": [
    {
      "id": "1ab9c897-8d7d-45db-a72b-3b8073e54241",
      "type": "project",
      "attributes": {
        "code": "demo",
        "name": "Demo Project",
        "description": "The description of my demo project",
        "archived": false
      },
      ...
    }
  ]
}
```

This means for the project resource, you can use the `id`, `code`, `name`, `description` and `archived` attributes for filtering and sorting.

## Filtering

To filter the results of a list API request, append one or more `filter[{{attribute}}_{{predicate}}]={{value}}` parameters to your request. The value of the parameter should be the value you want to filter by. For example, use the following filter to return all archived OpsChain projects:

```uri
filter[archived_eq]=true
```

The table below lists some of the common filter predicates you can use to filter the API results.

| Predicate  | Description                                                                                                   |
|:-----------|:--------------------------------------------------------------------------------------------------------------|
| `eq`       | Equal to.                                                                                                     |
| `not_eq`   | Not equal to.                                                                                                 |
| `lt`       | Less than.                                                                                                    |
| `lteq`     | Less than or equal to.                                                                                        |
| `gt`       | Greater than.                                                                                                 |
| `gteq`     | Greater than or equal to.                                                                                     |
| `in`       | In a list of values - see [below](#supplying-multiple-values-for-a-filter) how to supply a list of values.    |
| `not_in`   | Not in a list of values - see [below](#supplying-multiple-values-for-a-filter) how to supply the a of values. |
| `start`    | Starts with.                                                                                                  |
| `end`      | Ends with.                                                                                                    |
| `cont`     | Contains.                                                                                                     |
| `null`     | Is null. (usage: `filter[{{attribute}}_null]=1`)                                                              |
| `not_null` | Is not null. (usage: `filter[{{attribute}}_not_null]=1`)                                                      |

The full list of supported predicates can be seen [here](https://github.com/activerecord-hackery/ransack/blob/v3.2.1/lib/ransack/locale/en.yml#L16).

### Named filters

Some list endpoints also accept named filters. These are not built from an attribute and a predicate - each is a single, fixed name that filters on something the resource's attributes do not expose directly, such as a relationship or a derived state. They are supplied the same way as any other filter:

```uri
filter[for_change]=b5bf89b6-d5ed-4f9c-a1a7-4e6c9c8f0d21
```

The example above returns every event belonging to a change *and* to its steps - something the `source_id` attribute alone cannot express, because a step's events are recorded against the step rather than the change.

A named filter that does not take a value acts as a switch, and is enabled by giving it a truthy value. For example, to list only the steps that are waiting on input arguments:

```uri
filter[with_input_arguments]=true
```

Because a named filter is a fixed name rather than a convention you can apply to any attribute, the set available differs per endpoint. Each list endpoint documents its own named filters in the description of its `filter[<query/sort filter>]` parameter in the [API reference](pathname:///api-docs/).

### Filtering by status

Changes, steps, workflow runs, workflow steps and activities accept `status_code` filters, and match on the status OpsChain reports for the record — the one shown in the GUI and returned by the API:

```uri
filter[status_code_eq]=waiting
```

The statuses a change, workflow run or step is stored with are `initializing`, `pending`, `queued`, `running`, `waiting`, `success`, `skipped`, `error`, `cancelled`, `aborted` and `system_error`. Four of the statuses reported are worked out when the record is read rather than taken from what is stored on it:

| Status                 | What it covers                                                                                                                |
|:-----------------------|:------------------------------------------------------------------------------------------------------------------------------|
| `pending`              | Has not started, or is waiting to be restarted after a retry.                                                                 |
| `waiting`              | A step paused on a wait or input step, and a change or workflow run whose outstanding steps are all waiting.                   |
| `waiting_for_approval` | Waiting with approvers, so a person has to approve or reject it before it can go on.                                          |
| `rejected`             | Aborted because somebody rejected it.                                                                                         |

The last two are reported in place of the status underneath them, so `filter[status_code_eq]=waiting` does not return what is waiting for approval, and `filter[status_code_eq]=aborted` does not return what was rejected. Ask for `waiting_for_approval` or `rejected` instead.

### Supplying multiple values for a filter

The `in` and `not_in` predicates require a list of values to filter by. OpsChain uses the `[]` convention to accept multiple values for the same parameter. For example, to filter for projects whose code is in the list `prod` or `demo`, use the following filters:

```uri
filter[code_in][]=prod
filter[code_in][]=demo
```

### Query examples

The table below lists some examples of how to use filters to query the OpsChain API [events](/key-concepts/events.md) endpoint.

| Example                                                                                      | Description                                                                                                                                                        |
|:---------------------------------------------------------------------------------------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `filter[created_at_lt]=2021-01-01T01:00:00.000000Z`                                          | Events older than 2021-01-01 - this can be useful for paginating back through old events.                                                                          |
| `filter[type_eq]=api:projects:create`                                                        | API requests to create a project - the full list of event types is available in the [events documentation](/key-concepts/events.md#system-event-types).      |
| `filter[request_body_action_eq]=provision`<br/>`filter[type_eq]=api:changes:create`          | API requests to create a change with the `provision` action.                                                                                                       |
| `filter[url_params_project_code_eq]=demo`<br/>`filter[type_eq]=api:git_remotes:update`       | API requests to update the `demo` project's Git remotes.                                                                                                           |
| `filter[type_in][]=api:properties_versions:show`<br/>`filter[type_in][]=api:properties:show` | API requests to show properties, including older versions.                                                                                                         |
| `filter[parent_code_eq]=prod`<br/>`filter[parent_node_type_eq]=environment`                  | API requests for the `prod` environment.                                                                                                                           |
| `filter[system_eq]=false`<br/>`filter[name_start]=some`                                      | Custom events with a custom `name` field beginning with `some`.                                                                                                    |

## External tools

More complex sorting and filtering of the OpsChain API is possible using external tools. The [`jq`](https://github.com/stedolan/jq) utility provides a robust query language that can be used to parse the API output. e.g.

```bash
curl --user '{{username}}:{{password}}' 'http://localhost:3000/api/changes' | jq '{{jq query}}'
```

## Sparse fieldsets

By default, OpsChain API responses include all fields for each resource. Use sparse fieldsets to restrict the response to only the fields you need.

### Syntax

```uri
fields[resource_type]=field1,field2,field3
```

The value of `resource_type` is the JSONAPI `type` of the resource (e.g. `change`, `project`, `event`). Multiple resource types can be restricted in the same request.

### Example

To return only the `code`, `status`, and `action` fields for changes:

```bash
curl --user 'opschain:password' 'http://localhost:3000/api/changes' -G --data-urlencode 'fields[change]=code,status,action'
```

To restrict both the primary resource and an included resource in the same request:

```bash
curl --user 'opschain:password' 'http://localhost:3000/api/changes/abc123' \
  -G \
  --data-urlencode 'include=steps' \
  --data-urlencode 'fields[change]=code,status' \
  --data-urlencode 'fields[step]=name,status'
```

### Relationships and sparse fieldsets

Relationships are treated as fields — if a relationship name is omitted from a `fields[type]` value, that relationship is removed from the `relationships` key of the response.

To include a relationship in the response, list it explicitly alongside attributes:

```uri
fields[change]=code,status,steps
```

### Available fields

The available fields for a resource match what appears in the `attributes` and `relationships` keys of a standard API response. See [resource attributes](#resource-attributes) above for how to discover them.

## Sorting

To sort the API results, include the `filter[sorts]` parameter in your request. The value of the parameter should be the name of the attribute you wish to sort by, followed by the sort direction (`asc` or `desc`). For example, to return all OpsChain projects with the archived projects at the top of the list, use the following filter:

```uri
filter[sorts]=archived desc
```

### Sorting by multiple attributes

The `[]` syntax used when [supplying multiple values for a filter](#supplying-multiple-values-for-a-filter) also applies when sorting by multiple attributes. For example, to sort by `attribute1` in descending order, then by `attribute2` in ascending order, use the following filters:

```uri
filter[sorts][]=attribute1 desc
filter[sorts][]=attribute2
```
