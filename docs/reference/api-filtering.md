---
sidebar_position: 3
description: A guide to sorting and filtering the API list output.
---

# API filtering & sorting

With the exception of the "list properties versions" endpoint (`/api/properties_versions`), all OpsChain API list endpoints support filtering and sorting by resource attributes. This guide provides an overview of how to filter and sort the API output.

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

:::tip Avoid storing credentials
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

### Supplying multiple values for a filter

The `in` and `not_in` predicates require a list of values to filter by. OpsChain uses the `[]` convention to accept multiple values for the same parameter. For example, to filter for projects whose code is in the list `prod` or `demo`, use the following filters:

```uri
filter[code_in][]=prod
filter[code_in][]=demo
```

### Query examples

The table below lists some examples of how to use filters to query the OpsChain API [events](concepts/events.md) endpoint.

| Example                                                                                      | Description                                                                                                                                        |
|:---------------------------------------------------------------------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------|
| `filter[created_at_lt]=2021-01-01T01:00:00.000000Z`                                          | Events older than 2021-01-01 - this can be useful for paginating back through old events.                                                          |
| `filter[type_eq]=api:projects:create`                                                        | API requests to create a project - the full list of event types is available in the [events documentation](concepts/events.md#system-event-types). |
| `filter[request_body_action_eq]=provision`<br/>`filter[type_eq]=api:changes:create`          | API requests to create a change with the `provision` action.                                                                                       |
| `filter[url_params_project_code_eq]=demo`<br/>`filter[type_eq]=api:git_remotes:update`       | API requests to update the `demo` project Git remote.                                                                                              |
| `filter[type_in][]=api:properties_versions:show`<br/>`filter[type_in][]=api:properties:show` | API requests to show properties, including older versions.                                                                                         |
| `filter[environment_code_eq]=prod`                                                           | API requests for the `prod` environment.                                                                                                           |
| `filter[system_eq]=false`<br/>`filter[name_start]=some`                                      | Custom events with a custom `name` field beginning with `some`.                                                                                    |

## External tools

More complex sorting and filtering of the OpsChain API is possible using external tools. The [`jq`](https://github.com/stedolan/jq) utility provides a robust query language that can be used to parse the API output. e.g.

```bash
curl --user '{{username}}:{{password}}' 'http://localhost:3000/api/changes' | jq '{{jq query}}'
```

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
