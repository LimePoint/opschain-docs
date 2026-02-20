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

| Context key   | Description                                                                                                                                                                  |
|---------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `project`     | The [project](/key-concepts/overview.md#project) for the currently running step[^api_docs]                                                                                   |
| `environment`* | The [environment](/key-concepts/overview.md#environment) for the currently running step[^api_docs]                                                                           |
| `asset`*       | The [asset](/key-concepts/overview.md#asset) for the currently running step[^api_docs]                                                                                       |
| `change`      | The [change](/key-concepts/overview.md#change) the currently running step belongs to[^api_docs]                                                                              |
| `step`        | The currently running [step](/key-concepts/overview.md#step)[^api_docs]                                                                                                      |
| `user`        | Information about the user who submitted the change<br />  `name` - the user who submitted the change<br />  `groups` - an array of LDAP groups that the user is a member of |
| `metadata`    | The metadata associated with the change[^api_docs]                                                                                                                           |

:::note
The `environment` context key is available when running a change within an environment or a child asset within it.

The `asset` context key is available when running a change on an asset.
:::

[^api_docs]: The attributes available within these context keys are the same as those available to you from the relevant API endpoint. See the [OpsChain API documentation](https://docs.opschain.io/api-docs/) for more details.

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

import SampleContextValues from '/files/samples/sample-context-values.md'

<SampleContextValues />
