---
sidebar_position: 3
description: OpsChain configuration to automate the removal of old activities, events and job history.
---

# Data cleaning

As part of system maintenance, it is recommended that the OpsChain activities, events and job history are cleaned up frequently to limit disk usage. After following this guide you should know how to:

- configure data cleanup definitions
- automatically remove old activities, events and job history on a schedule
- modify if and when a data cleanup definition runs

## Data retention

By default, OpsChain retains all activities logs, events and jobs; i.e. it does not automatically remove this data based upon age.

## Data cleanup definitions

Configuring data cleanup definitions is critical for maintaining OpsChain's data size under control. They allow you to run data cleanups on a schedule, for a pre-defined selection of projects, environments or assets, with a customizable selection of data filters.

### Creating a data cleanup definition

Data cleanup definitions can be created from the **Data cleanup** section of the administration screen, where they are listed as cleanup jobs — see [data cleanup](/getting-started/familiarisation/gui/data_cleanup.md#adding-a-cleanup-job). To create one via the API, refer to the [API documentation](https://docs.opschain.io/api-docs/#tag/Data-cleanup-definitions/).

Below, we'll go over the concepts necessary to understand how they are defined and configured.

### Data purge selection

The data that a single data cleanup definition will purge can be configured via the `purge_activities`, `purge_events` and `purge_jobs` attributes.

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
