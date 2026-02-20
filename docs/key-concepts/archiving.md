---
sidebar_position: 4
description: Details of OpsChain's archive feature.
---

# Archiving

To ensure information about historical changes remains available for audit purposes, OpsChain provides the ability to archive unwanted data. After following this guide you should know:

- the effect archiving has on a project, environment or asset within OpsChain
- how to archive data within OpsChain
- how to unarchive data within OpsChain

## Effect on OpsChain

Archiving a project, environment or asset:

- disables its scheduled activities
- prevents new activities (and scheduled activities) being created in it

Archiving a project has the effect of archiving all its environments and their child assets, as well as the project's own assets.

### Activities and scheduled activities

Once archived, attempts to create an activity or a scheduled activity in an archived project, environment or asset will be rejected with an error reflecting the archived status.

Scheduled activities that exist for an archived project, environment or asset will be disabled and will not run whilst the resource remains archived.

## Archiving via the CLI

The OpsChain CLI provides the `archive` command, that can be applied to a `project`, `environment` or `asset`:

```bash
opschain project archive
```

:::info
Projects, environments and assets cannot be archived if they contain a queued or running activity. Please ensure all relevant activities are complete (or cancelled) prior to executing the command.
:::

### CLI output

Archiving a project, environment or asset will mean the resource no longer appears in:

1. the interactive list presented to users when selecting parameter values.
2. the output of the relevant OpsChain `list` output. e.g. an archived environment will not appear in the `opschain environment list` output. The optional `--include-archived` (`-a`) parameter can be supplied to include archived resources in the output. e.g.

    ```bash
    opschain environment list --project-code demo --include-archived
    ```

If an archived project, environment or asset is specified when running the OpsChain `change list` or `scheduled-change list` command the relevant results will continue to be displayed. The `Next Run At` column in the scheduled changes list will be empty to denote their disabled status._

## API responses

By default, archived resources are included in the results returned from the API endpoints. This ensures the full audit history of all actions performed in the project, environment or asset remains available for enquiry. The `projects`, `environments` and `assets` endpoints include an `archived` attribute for each record that can be used to identify which resources are archived.

### Result filtering

If required, the API endpoints allow you to use result filtering (described in more detail in [API filtering & sorting guide](/advanced/api/api-filtering.md)) to return only active projects, environments or assets. To do this, append the filter `filter[archived_eq]=false` to your API request. e.g.

```text
http://opschain.example.com/api/projects?filter[archived_eq]=false`
```

## Unarchiving projects, environments and assets

Archiving a resource is intended as a one way process and the CLI does not provide an option to unarchive them. In the event that you need to unarchive a project, environment or asset, you will need to interact directly with the API server. The following example patch request will unarchive the `dev` environment in the `demo` project:

```bash
curl -u opschain:password -X PATCH http://opschain.example.com/api/projects/demo/environments/dev -H "Accept: application/vnd.api+json" -H "Content-Type: application/vnd.api+json" --data-binary @- <<DATA
{
  "data": {
    "attributes": {
      "archived": false
    }
  }
}
DATA
```

Note: You will need to edit the example command to replace:

- `opschain:password` with your username and password
- `opschain.example.com` with your OpsChain host and port
- `api/projects/demo/environments/dev` with the appropriate path for the archived resource. e.g.
  - `api/projects/<project code>` to unarchive a project
  - `api/projects/<project code>/environments/<environment code>` to unarchive an environment
  - `api/projects/<project code>/assets/<asset code>` to unarchive an asset
  - `api/projects/<project code>/git_remotes/<git remote id>` to unarchive a git remote
