---
sidebar_position: 7
description: The context information available to your actions when running change steps.
---
# Context

The OpsChain context framework provides a read only set of values. These values enable you to reuse code between projects, environments and assets, conditionally performing logic based on when and where the step is being performed.

After reading this guide you should understand:

- the information available in the OpsChain context
- how to access the OpsChain context values in your actions

## OpsChain context

Within each action, OpsChain context values are available via `OpsChain.context` (which will behave like a [Hashie Mash](https://github.com/hashie/hashie#mash)). The `OpsChain.context` includes the following information:

| Context key        | Description                                                                                                                                                                                                                                                                                     |
|--------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `parents`          | The [project](/key-concepts/overview.md#project), [environment](/key-concepts/overview.md#environment) and [asset](/key-concepts/overview.md#asset) the step is running under, keyed by type - see [parents](#parents) below[^api_docs]                                                       |
| `parent_order`     | The names of the property owners that contributed to the step's [properties](/key-concepts/properties.md), least specific first - see [parent order](#parent-order) below                                                                                                                     |
| `change`           | The [change](/key-concepts/overview.md#change) the currently running step belongs to, including its [metadata](/key-concepts/changes.md#change-metadata), the action requested, the Git remote and revision it was run from, and its current status[^api_docs]                                 |
| `step`             | The currently running [step](/key-concepts/overview.md#step), including its action, full path, [input arguments](/key-concepts/actions.md#input-steps) and current status[^api_docs]                                                                                                       |
| `user`             | Information about the user who submitted the change<br />  `name` - the user who submitted the change<br />  `groups` - an array of LDAP groups that the user is a member of                                                                                                                    |
| `git_remotes`      | The project's [Git remotes](/getting-started/familiarisation/gui/projects/git_remotes.md) the [`git_clone` resource](/advanced/included-resource-types.md#opschain-git-clone) may check out, as controlled by [`git_remote.mountable`](/key-concepts/settings.md#git_remotemountable)<br />Credentials are never included |
| `api_key`          | The short lived API key the [`query`](/key-concepts/actions.md#querying-the-api) and [`send_email`](/key-concepts/actions.md#sending-email) keywords authenticate with - see [API key](#api-key) below                                                                                         |
| `template`         | The [asset template](/key-concepts/overview.md#asset-template) the asset was created from[^api_docs]                                                                                                                                                                                            |
| `template_version` | The [asset template version](/key-concepts/overview.md#asset-template-version) the change is running, including the `git_rev` and `commit_sha` the change resolved to, whether the version [follows its Git revision](/getting-started/familiarisation/gui/projects/asset_templates.md#following-a-git-revision), and why it last failed to do so[^api_docs]                                                                                                                 |
| `mintmodel`        | The asset's concretised [MintModel](/getting-started/familiarisation/gui/projects/asset_templates.md#asset-templates-with-a-mintmodel)                                                                                                                                                           |

[^api_docs]: The attributes available within these context keys are the same as those available to you from the relevant API endpoint. See the [OpsChain API documentation](https://docs.opschain.io/api-docs/) for more details.

The `template`, `template_version` and `mintmodel` keys are only present when the change is running on an asset. `mintmodel` is `nil` when the asset template does not include a MintModel.

### Parents

`OpsChain.context.parents` is keyed by the type of each node the step is running under - `project`, `environment` and `asset` - and always includes the node the change was run on. A change run on an environment therefore has a `project` and an `environment`, while a change run on an asset also has an `asset`.

```ruby
require 'opschain'

action :report_target do
  log.info "Deploying to #{OpsChain.context.parents.environment.name} in #{OpsChain.context.parents.project.name}"
end
```

Test for a key's presence rather than assuming it exists, so the same code can be run at more than one level of your project hierarchy:

```ruby
require 'opschain'

action :report_target do
  log.info "Running on asset #{OpsChain.context.parents.asset.code}" if OpsChain.context.parents.key?('asset')
end
```

### Parent order

`OpsChain.context.parent_order` lists the property owners that contributed to the step's [properties](/key-concepts/properties.md), from the least specific to the most specific. The last entry is `change`, reflecting that any [change properties](/key-concepts/changes.md#change-properties) are applied last.

```yaml
parent_order:
  - project
  - environment
  - change
```

A change running on an asset also includes the asset, the [asset template](/key-concepts/overview.md#asset-template) it was created from, and the [asset template version](/key-concepts/overview.md#asset-template-version) it is running. Properties assigned to the template apply to every asset created from it, and are overridden in turn by the template version and then the asset itself:

```yaml
parent_order:
  - project
  - environment
  - template
  - template_version
  - asset
  - change
```

The same names can be supplied to [`OpsChain.properties_for`](/key-concepts/properties.md#database) to read a single owner's properties rather than the merged set.

### API key

`OpsChain.context.api_key` is a short lived API key scoped to the running change. The [`query`](/key-concepts/actions.md#querying-the-api) and [`send_email`](/key-concepts/actions.md#sending-email) keywords use it automatically, so you rarely need to read it yourself.

OpsChain issues a key for every change, so no configuration is required to use `query` or `send_email` from your actions. The key carries the permissions of the user who created the change, and is revoked as soon as the change finishes - it cannot be used to reach the API once the change is no longer running.

## Accessing the context information

Context information can be accessed using dot or square bracket notation with string or symbol keys. These examples are equivalent:

```ruby
require 'opschain'

OpsChain.context.change.action
OpsChain.context[:change][:action]
OpsChain.context['change']['action']
```

:::note
The `OpsChain.context` structure is read only.
:::

## Example usage

In the example below, running the `main` action in the development environment will set the OpsChain logger to the DEBUG level. When running in any other environment, the OpsChain logger will remain in the default (INFO) level.

```ruby
require 'opschain'

action :enable_logging do
  log.level = ::Logger::DEBUG if OpsChain.context.parents.environment.code == 'dev'
end

action main: ['enable_logging'] do
  .... main process
end
```

### Sample context values

Below is an example of the values available to an action via `OpsChain.context` (formatted as YAML):

import SampleContextValues from '/files/samples/2026-08-14/sample-context-values.md'

<SampleContextValues />
