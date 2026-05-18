---
sidebar_position: 11
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

The CLI examples in this guide assume you have followed our [getting started guides](../category/getting-started).

## About scheduled changes

Scheduled changes are schedules configured in OpsChain that will automatically create and deploy changes in an environment:

- at a particular time
- in response to project Git repository updates

Refer to the [CLI guide](/getting-started/familiarisation/cli/index.md) for more information on how to create a scheduled change via the CLI.

## Creating a scheduled change for new commits

When creating a scheduled change, you can decide whether it only runs if there are new commits in the Git repository.

| New commits only | Git revision has new commits | OpsChain change created |
|:---------------------|:-----------------------------|:------------------------|
| true                 | true                         | true                    |
| true                 | false                        | false                   |
| false                | n/a                          | true                    |

:::note
If the current commit that `master` points to hasn't been used in a change for the `hello_world` action in the `dev` environment then a new change will be created straight away as part of this scheduled change.

It can take a minute for the OpsChain worker to detect the Git updates and create the new change.
:::

As more commits are added to the Git repository, new changes will be created. Scheduled changes poll the project's Git repository for new commits on the Git revision. If multiple commits occur on the relevant Git revision between polls then only one scheduled change will be created with the latest commit.

## Deleting a scheduled change

Scheduled changes can be deleted via the GUI, the CLI or via the API.

## Scheduled changes events

Scheduled changes create [events](/key-concepts/events.md) in the following error conditions:

- when the Git commit SHA can't be determined for the Git revision in the relevant Git remote. The event will have a type of `error:scheduled_change:git_sha`
- when the change creation fails for the scheduled change. The event will have a type of `error:scheduled_change:change_creation`

All scheduled change error events have a type starting with `error:scheduled_change`, and hence can be fetched from the API using the following filters, `filter[type_start]=error:scheduled_change` and `filter[system_eq]=true`. Learn more in the [API filtering guide](/advanced/api-filtering.md).
