---
sidebar_position: 2
description: Learn about OpsChain changes, creating them, and managing their execution.
---

# Changes

This guide covers OpsChain changes, creating them, managing their execution and limitations to be aware of. After reading this guide you should understand:

- how to create a change
- configuration options available to control change execution
- adding and using change metadata

## Overview

A change is the application of an action from a specific commit in the project's Git repository, to a particular project environment. The action(s) defined in the repository's `actions.rb` file allow you to structure your changes in a variety of ways and will be influenced by the tools you use with OpsChain. You may structure your changes using "desired state" techniques, or by applying explicit actions (e.g. upgrading a single package in response to a security vulnerability).

### Creating a change

OpsChain changes can be created via the OpsChain CLI, GUI, or by directly POSTing to the API changes endpoint. To create an OpsChain change, the following information is required:

- An OpsChain [project](/reference/concepts/concepts.md#project) and [environment](/reference/concepts/concepts.md#environment)
- A [Git remote](/reference/concepts/git-remotes.md) and related Git reference (tag/branch/SHA)
- The OpsChain [action](/reference/concepts/actions.md) to execute

:::tip Creating changes
For more information on using the CLI to create a change, see `opschain change create --help`.

For more information on using the GUI to create a change, see [creating a new change](/ui/activity.md#run-change)

To learn how to create changes via the API, see OpsChain's API reference by accessing the API host with your browser.
:::

## Change properties

To unlock the true power of OpsChain, your actions should be constructed to take advantage of the OpsChain [properties](/reference/concepts/properties.md) framework. This allows the actions to dynamically source hostnames, credentials and other project/environment specific information at runtime rather than being hard-coded into the actions.

### Static properties

The change's Git reference identifies the static [repository properties](/reference/concepts/properties.md#git-repository) that will be supplied to the change. As detailed in the [OpsChain properties guide](/reference/concepts/properties.md#opschain-properties), repository properties can be overridden by project and environment properties.

### Dynamic properties

As each step in your change is constructed, OpsChain will supply it with the latest version of the change's project and environment [database properties](/reference/concepts/properties.md#database). This ensures any modifications made to the properties in prior change steps (or other changes) are available to the action.

## Change execution

A step will be created for the change action, with additional steps created for each child action. The [child execution strategy](/reference/concepts/actions.md#child-execution-strategy) specified by each action will determine whether its child actions are executed serially or in parallel.

:::info
The number of OpsChain worker nodes configured when the OpsChain server is deployed provides a hard limit on the number of steps that OpsChain can execute at a time. For example, with 3 worker nodes, OpsChain can run:

- 3 parallel steps from a single change
- 3 individual steps from 3 distinct changes
- 2 parallel steps from one change, and one step from another

:::

### Limitations

The OpsChain properties guide highlights a number of limitations that must be taken into account when [changing properties in concurrent steps](/reference/concepts/properties.md#changing-properties-in-concurrent-steps).

### Change execution options

By default, OpsChain will only allow a single change to execute for a given project, environment or asset. This aims to reduce the likelihood that the limitations described above will impact running changes. If the actions in your project's Git repository perform logic that can be run concurrently, and they interact with the database properties in a manner that will not be impacted by the limitations, you can configure the project to allow concurrent changes within it and its children. To do this, use the `opschain project edit-settings` command (or the OpsChain GUI) to set the `allow_parallel.changes` setting to `true` in your project's settings:

```json
{
  ...
  "allow_parallel_changes": true
}
```

:::note
This setting applies to each change’s direct target. For example, when `allow_parallel.changes` is `false` changes will be allowed to run concurrently in the `dev` and `test` environments of a project (as these are two distinct targets). However, two changes will not be allowed to run concurrently in the `dev` environment.
:::
:::tip
If you have `jq` installed you can use the following command to set the option programmatically:

```bash
opschain project show-settings -p <project code> | jq '. += { "allow_parallel": { "changes": true } }' > /tmp/updated_project_settings.json
opschain project set-settings -p <project code> -f /tmp/updated_project_settings.json -y
```

:::

## Change metadata

When creating a change, OpsChain allows you to associate additional metadata with a change. This metadata can then be used:

- when searching for changes (via the web UI)
- when reporting on and searching the change history (via the API)
- from within your `actions.rb` actions

### Adding metadata to a change

Create a JSON metadata file to associate with the change:

```bash
cat << EOF > change_metadata.json
{
  "change_request": "CR921",
  "approver": "A. Manager"
}
EOF
```

Use the CLI to associate the metadata with a change:

```bash
opschain change create -p project -e environment -m prod_change_metadata.json -a action -g git_rev -G git_remote -y
```

### Query changes by metadata

You can query changes by metadata via the search field in the [OpsChain web UI](/getting-started/README.md#visit-the-opschain-web-ui). Metadata searching via the web UI is based on simple string matching. Please [let us know](mailto:opschain-support@limepoint.com) if you're interested in more advanced searching.

When querying changes via the change API, you can use OpsChain's [API filtering](/reference/api-filtering.md) feature to limit the response to changes whose approver matches the value we specified in the metadata, e.g.:

```bash
curl -G --user "{{username}}:{{password}}" 'http://localhost:3000/api/changes' --data-urlencode 'filter[metadata_approver_eq]=A. Manager'
```

:::note NOTES

1. Update the username, password, host and port to reflect your OpsChain server configuration.
2. If you wish to filter on a nested metadata value, separate the keys with a comma. For example, to find all changes with metadata `{ "nested": { "key": "some_value } }`, you could use the following filter:

```bash
curl -G --user "{{username}}:{{password}}" 'http://localhost:3000/api/changes' --data-urlencode 'filter[metadata_nested,key_eq]=some_value'
```

:::

:::tip
For more information on filtering the change list output, see the [API filtering & sorting guide](/reference/api-filtering.md).
:::

### Using metadata in actions

The change metadata can also be accessed from within your `actions.rb` via [OpsChain context](/reference/concepts/context.md). The following action would output the approver into the change log:

```ruby
action :print_approver do
  OpsChain.logger.info "The change approver is: #{OpsChain.context.change.metadata.approver}"
end
```
