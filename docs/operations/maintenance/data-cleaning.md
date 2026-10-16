---
sidebar_position: 3
description: OpsChain configuration to automate the removal of old activities, events and job history, and to keep the database's query planner statistics fresh.
---

# Data cleaning

As part of system maintenance, it is recommended that the OpsChain activities, events and job history are cleaned up frequently to limit disk usage. After following this guide you should know how to:

- configure data cleanup definitions
- automatically remove old activities, events and job history on a schedule
- refresh the database's query planner statistics on a schedule
- modify if and when a data cleanup definition runs

## Data retention

By default, OpsChain retains all activities logs, events and jobs; i.e. it does not automatically remove this data based upon age.

## Data cleanup definitions

Configuring data cleanup definitions is critical for maintaining OpsChain's data size under control. They allow you to run data cleanups on a schedule, for a pre-defined selection of projects, environments or assets, with a customizable selection of data filters.

### Creating a data cleanup definition

Data cleanup definitions can be created from the **Data cleanup** section of the administration screen, where they are listed as cleanup jobs — see [data cleanup](/getting-started/familiarisation/gui/data_cleanup.md#adding-a-cleanup-job). To create one via the API, refer to the [API documentation](https://docs.opschain.io/api-docs/#tag/Data-cleanup-definitions/).

Below, we'll go over the concepts necessary to understand how they are defined and configured.

### Data purge selection

The data that a single data cleanup definition will purge is configured through the attributes below. Each defaults to `false`, so a definition removes only what you ask it to.

| Attribute | Purges |
|-----------|--------|
| `purge_activities` | Changes and workflow runs, along with their events, logs and steps. |
| `purge_events` | Events. |
| `purge_jobs` | The records of the background jobs OpsChain has run. |
| `purge_agent_images` | Unreferenced agent container images, from the internal registry. |
| `purge_node_background_tasks` | Finished node background tasks that a newer task of the same kind has replaced, and their logs. |
| `purge_artefacts` | [Artefacts](/key-concepts/artefacts.md) that fall outside their retention rule. |

`purge_node_background_tasks` covers action generation, MintModel concretisation, agent image build, and agent start and stop tasks. Nothing else removes these, and an errored MintModel concretisation can carry a large volume of render logs, so an instance that has been running for a while can hold a lot of them.

### Size-tiered artefact retention

`purge_artefacts` is configured differently from the other purge attributes above: instead of an API filter, it takes a `size_tiers` array, because a sensible retention rule for an artefact usually depends on its own size — keep many versions of a small config artefact, but only the last one or two of a large build artefact. Each tier is an object with an `up_to` size, and the same `keep_versions`/`keep_days` pair a plain retention rule would use:

```json
{
  "artefacts": {
    "size_tiers": [
      { "up_to": "10Mi", "keep_versions": 20, "keep_days": 90 },
      { "up_to": "200Mi", "keep_versions": 5, "keep_days": 30 },
      { "up_to": null, "keep_versions": 1, "keep_days": 7 }
    ]
  }
}
```

In the GUI, tick **Delete old artefact versions** on a [cleanup job](/getting-started/familiarisation/gui/data_cleanup.md#what-a-cleanup-job-can-remove) and set the tiers in its **Artefact retention** table.

Every artefact version is matched to the smallest tier whose `up_to` is still at least its own size, so the tiers above keep 20 versions (or 90 days) of anything up to 10Mi, 5 versions (or 30 days) of anything up to 200Mi, and only the single most recent version (kept for at most 7 days) of anything larger. Give the last tier an `up_to` of `null` as a catch-all for artefacts larger than every other tier - without one, artefacts above the largest `up_to` are not matched by any tier and so are never purged. A version is removed only once it falls outside both its tier's `keep_versions` and `keep_days`, the same rule a flat, untiered retention setting uses.

A definition with `purge_artefacts` set to `true` must include `size_tiers`. One without them is rejected.

To check a retention rule before saving it, send the definition's `node_paths` and `filters` to `POST /api/data_cleanup_definitions/artefacts_preview`. Nothing is removed. The response's `meta.tiers` gives, for each tier, the number of artefact versions and bytes a purge would remove now, and `meta.totals` gives the sum. See the [API reference](pathname:///api-docs/#tag/Data-cleanup-definitions) for the request format.

A task counts as superseded only when a newer task of the same kind exists against the same template version history record. A new record is created whenever the resource's template version or resolved commit changes, so tasks recorded against an earlier record are kept. Tasks that are still needed are kept regardless of the filters — the latest successful action generation for a template version history, tasks still referenced by a change or a running agent, and agent image build tasks whose image is still in the registry. Enable `purge_agent_images` over the same node paths to remove the image first, so the build task becomes reapable.

### Refreshing database statistics

A data cleanup definition can also refresh the statistics the database's query planner uses, by setting its `analyze_statistics` attribute to `true` — **Refresh database statistics** in the GUI. It defaults to `false`, like the purge attributes, and can be set on its own or alongside them.

| Attribute | Does |
|-----------|------|
| `analyze_statistics` | Analyses the tables whose query planner statistics have gone stale. |

The database plans every query from statistics it gathers about each table in the background, and it gathers them in proportion to how much of the table has changed. That leaves three cases where the statistics the planner is working from no longer describe the data, and queries are planned badly as a result:

- a purge has removed a large number of rows, so the statistics still describe data that is no longer there;
- a table is written to rarely or has stopped being written to altogether, so it is never re-analysed however stale its statistics become; and
- the database has been restored from a backup, so it has no statistics at all until they are gathered.

When it runs, OpsChain analyses only the tables that are actually stale — a table that has never been analysed, one with more modifications since its last analysis than the greater of 1,000 rows and 2% of its estimated row count, or one last analysed more than a week ago. A single run takes at most the 25 tables with the most modifications, so an instance that is stale throughout catches up over consecutive runs rather than in one long one.

A few things follow from this being a database-wide operation rather than a purge:

- the definition's node paths and filters do not apply to it — it covers every table in the instance whatever they are set to;
- it runs after the definition's purges, so a definition that both purges and refreshes leaves the planner describing the data the purge left behind;
- nothing is deleted or changed, and the tables stay readable and writable throughout; and
- only one refresh runs at a time across a high availability deployment. A run that finds another site already refreshing records that it was skipped rather than waiting.

Each run records an [`info:data_cleanup:statistics`](/key-concepts/events.md) event listing the tables it analysed with their estimated row count before and after, so the effect of a run can be seen without querying the database. The **Database** administration screen reports how fresh each table's statistics are — see [query planner statistics](/getting-started/familiarisation/gui/database.md#query-planner-statistics).

:::tip[Give the refresh its own definition]
Because it ignores node paths and filters, and removes nothing, the refresh is best configured as a definition of its own — no node paths, `analyze_statistics` set, `repeat` set, and a `cron_schedule` that runs it daily. It is then scheduled independently of whatever you purge, and stays in place unchanged as your retention rules change.
:::

### Schedule

Data cleanup definitions can be configured to run on a cron schedule via the `cron_schedule` attribute. You can also specify how many times the definition should run, via the `maximum_run_count` attribute, or up until when it should run, via the `end_at` attribute. For the definition to be run more than once, always set the `repeat` attribute to `true`.

If you'd like to run a data purge in an ad-hoc way, you could instead provide the `run_at` attribute with a timestamp for when it should run and the `repeat` attribute set to `false`.

### Node selection

To define what needs to be purged, data cleanup definitions use a list of node selection paths. These paths can either be an exact path to a specific node (e.g., `/projects/demo`), or a path ending with a `%` wildcard to match the node and all of its descendants (e.g., `/projects/demo%`). The latter format is specially useful when creating data cleanup definitions for all child nodes of a type for a project, including ones that are yet to be created.

There are some rules for how the paths must be defined. Each node path:

- must start with "/projects";
- must only contain forward slashes, lowercase letters, numbers and underscores; and
- can optionally contain a single "%" at the end of the path.

For example, the path to select everything under project `demo`'s `dev` environment to be cleaned up, including the `dev` environment's own data is:

```json
"/projects/demo/environments/dev%"
```

If you'd like to clean everything under a node, except the data for the node itself:

```json
"/projects/demo/environments/dev/%"
```

However, if you want to clean up only the asset `bank` under that same environment, use the exact path:

```json
"/projects/demo/environments/dev/assets/bank"
```

:::note
If no nodes are provided to a data cleanup definition or if no nodes are found with the given path, the cleanup will execute either way, but nothing will be removed.
:::

:::caution
When removing activities, all associated information will also be destroyed. That includes the activities' events, logs and steps.
:::

### Filters

By default, the data cleanup definitions will delete all the data for the matching nodes. However, you can limit what gets removed by adding API filters to each data type. These will be used when searching for the data to be purged.
Refer to the [API filtering](/advanced/api-filtering.md) documentation on how the filters can be used.

For example, if you want to remove all data that is older than a certain date, a possible combination of filters would be:

```json
{
  "changes": { "created_at_lt": "2025-12-12" },
  "workflow_runs": { "created_at_lt": "2025-12-12" },
  "events": { "created_at_lt": "2025-12-12" },
  "jobs": { "run_at_lt": "2025-12-12" },
  "node_background_tasks": { "created_at_lt": "2025-12-12" },
}
```

:::caution
All data types for the matching nodes are removed if no filters are provided. Ensure you specify the filters to be used for *each* data type individually.
:::

### Enabling/disabling a data cleanup definition

If you'd like to stop a data cleanup definition from running, disable it from its actions menu in the **Data cleanup** section of the administration screen, or disable several at once from the table's bulk actions — see [enabling and disabling a cleanup job](/getting-started/familiarisation/gui/data_cleanup.md#enabling-and-disabling-a-cleanup-job). The definition keeps its configuration and its history, and can be enabled again the same way. To do this via the API, modify its `enabled` attribute — refer to the [API documentation](https://docs.opschain.io/api-docs/#tag/Data-cleanup-definitions/).

A definition with no run left to make — one that has already run and is not set to `repeat`, that has reached its `maximum_run_count`, or whose `run_at` or `end_at` has passed — is disabled by OpsChain and cannot be enabled as it stands. Give it a run it can still make, by editing its schedule, run count or end date, and it is scheduled again when saved.

## See also

The OpsChain log aggregator can be configured to forward change logs to external log storage. These are not removed by the data cleanup definitions.
See the [OpsChain change log forwarding](/operations/log-forwarding.md) guide for details.
