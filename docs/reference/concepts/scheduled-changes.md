---
sidebar_position: 4
description: Learn about scheduling the creation and execution of changes with OpsChain.
---

# Scheduled changes

This guide takes you through creating scheduled changes in OpsChain.

After following this guide you should know:

- how scheduled changes work
- how to create, list and delete scheduled changes
- the basics of scheduled changes
- how to diagnose errors in scheduled changes

## Prerequisites

The CLI examples in this guide assume the steps from the [getting started](/docs/getting-started/README.md) guide have been run.

## About scheduled changes

Scheduled changes are schedules configured in OpsChain that will automatically create and deploy changes in an environment:

- at a particular time
- in response to project Git repository updates

The OpsChain CLI provides commands for interacting with scheduled changes via the `opschain scheduled-change` command.

## Creating a scheduled change for new commits

A new scheduled change can be created by using the `opschain scheduled-change create` subcommand in the CLI. The `--cron-schedule` allows you to control how often the scheduled change will run. The `--new-commits-only` and `--git-rev` values determine whether the scheduled change will create an OpsChain change when it runs. The following table outlines the various combinations:

| `--new-commits-only` | Git revision has new commits | OpsChain change created |
|:---------------------|:-----------------------------|:------------------------|
| true                 | true                         | true                    |
| true                 | false                        | false                   |
| false                | n/a                          | true                    |

The following command will create a scheduled change that will create an OpsChain change to run the `hello_world` action whenever the `demo` project's Git repository's `master` branch changes.

```bash
opschain scheduled-change create --project-code demo --environment-code dev --git-remote-name origin --git-rev master --new-commits-only --action hello_world --cron-schedule '* * * * *' --repeat --confirm
```

:::note
If the current commit that `master` points to hasn't been used in a change for the `hello_world` action in the `dev` environment then a new change will be created straight away as part of this scheduled change.
:::

Follow the steps from the [adding a new action](/docs/getting-started/developer.md#adding-a-new-action) guide (or make a change to the existing `hello_world` action) to create the new commit for OpsChain to deploy.

Run the OpsChain change list command to list changes in this environment.

:::note
It can take a minute for the OpsChain worker to detect the Git updates and create the new change.
:::

```bash
opschain change list --project-code demo --environment-code dev
```

The output will now include a new change that has been created in response to our new Git commit.

As more commits are added to the Git repository, new changes will be created. Scheduled changes poll the project's Git repository for new commits on the Git revision. If multiple commits occur on the relevant Git revision between polls then only one scheduled change will be created with the latest commit.

## Listing scheduled changes in an environment

Scheduled changes configured in an environment can be listed by using the `opschain scheduled-change list` subcommand in the CLI.

```bash
opschain scheduled-change list --project-code demo --environment-code dev
```

:::tip
Take note of the ID shown as it will be used to delete the scheduled change rule.
:::

## Deleting a scheduled change

Scheduled changes can be deleted by using the `opschain scheduled-change delete` subcommand in the CLI.

```bash
opschain scheduled-change delete --scheduled-change-id xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx --confirm
```

## Creating a scheduled change

Scheduled changes can be scheduled to create changes at a certain time. They can also be configured to run only if new commits are present or not.

The following command creates a new scheduled change that will create a new change running the `hello_world` action daily at 7pm (based on the OpsChain server time).

```bash
opschain scheduled-change create --project-code demo --environment-code dev --git-remote-name origin --git-rev master --new-commits-only=false --action hello_world --cron-schedule '0 19 * * *' --repeat --confirm
```

If the `--new-commits-only=false` were changed to `--new-commits-only=true` then the new change would only be created if new commits had been added to `master`. If the `--repeat` argument were changed to `--repeat=false` then a single new change would be created at 7pm and then the scheduled change would be deleted - the change would be created once rather than daily.

## Scheduled changes events

Scheduled changes create [events](/docs/reference/concepts/events.md) in the following error conditions:

- when the Git commit SHA can't be determined for the Git revision in the relevant Git remote. The event will have a type of `error:scheduled_change:git_sha`
- when the change creation fails for the scheduled change. The event will have a type of `error:scheduled_change:change_creation`

All scheduled change error events have a type starting with `error:scheduled_change`, and hence can be fetched from the API using the following filters, `filter[type_start]=error:scheduled_change` and `filter[system_eq]=true`. Learn more in the [API filtering guide](/docs/reference/api-filtering.md).
