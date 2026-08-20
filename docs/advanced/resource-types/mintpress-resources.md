---
sidebar_position: 1
description: The pre-defined MintPress resource types available in OpsChain.
---

# MintPress resources

A collection of MintPress resource types come pre-installed on the OpsChain step runner image, this guide covers what they are and how to use them.

## Resource type summary

The table below outlines the file to `require` in your resource definition and the MintPress resource types that will become available.

| Require                                           | Resource type            | Description                                                                                        |
|:--------------------------------------------------|:-------------------------|:---------------------------------------------------------------------------------------------------|
| `environmint-model-utils`       | `emu_ops_model`              | Represents an asset topology model. Similar to EnvironMintModelUtils::MintModel in MintPress 3.16.0          |
| [`mintpress-oldworld-integration`](#migration-ops-model-processor)     | `migration_ops_model_processor`    | Similar to MintPress::Migration::ModelProcessor in MintPress 3.16.0.                                     |

### Usage

These resource types are pre-installed in the OpsChain step runner image via their respective Gems. To use them, simply require the Gem in your `actions.rb` file:

```ruby
require 'environmint-model-utils'
require 'mintpress-oldworld-integration'
```

Then define the resource by name, for example:

```ruby
emu_ops_model :my_ops_model do
  ...
end
```

## Migration Ops Model Processor

`migration_ops_model_processor` is an OpsChain resource for running targeted actions against a MintPress environment - applying patches, running
transfers or executes, and controlling server/system component lifecycle - without needing to author a full Bamboo plan.

```ruby
migration_ops_model_processor :mp do
  model mintmodel.controller

  host OpsChain.properties.host
  installation  OpsChain.properties.installation
  patch_id OpsChain.properties.patch_id
  stage  OpsChain.properties.stage
  patch_ids OpsChain.properties.patch_ids
  args OpsChain.properties.args
  transfer_name OpsChain.properties.transfer_name
  execute_name OpsChain.properties.execute_name

  host_options({'final_user'=>'oracle','connect_user'=>'root','keys'=>['/opt/opschain/root_key']})
end
```

Once declared, the resource is driven purely by which action you invoke and what you set in your OpsChain properties for that run, for example:

```ruby
opschain-action mp:<action>
```

### Properties

| Property | Purpose |
|---|---|
| `model` | The MintPress model to operate against. Required. |
| `host` | Restricts the action to a single host & servers, system components, node managers, and the admin server not on this host are excluded. Leave unset to target every host in the model. |
| `installation` | The installation to patch. Required for `apply_patch`/`apply_patches`. |
| `patch_id` | The patch to apply or roll back. Required for `apply_patch`. |
| `patch_ids` | A list of patches to apply or roll back together. Required for `apply_patches`. |
| `transfer_name` | The name of a specific file transfer to run. Required for `perform_transfer`. |
| `execute_name` | The name of a specific execute step to run. Required for `perform_execute`. |
| `stage` | The lifecycle stage to run transfers/executes for. Required for `perform_transfers`/`perform_executes`. Not needed for any other action. |
| `args` | Fine-grained overrides for startup/shutdown targeting, e.g. `startup_control.include_pattern=oid2`, `startup_control.exclude_pattern=oidrepl*`. Optional. |
| `host_options` | Connection details (user, keys, etc.) used to reach the target hosts. |

### Actions

#### `apply_patch`

Applies (or rolls back, depending on the patch's own configuration) a singlepatch, identified by `patch_id`, against `installation` regardless of which lifecycle stage it's normally associated with.

Requires: `patch_id`, `installation`

```json
{ "installation": "oid", "patch_id": "34761383" }
```

#### `apply_patches`

Applies (or rolls back) a set of patches together as one combined operation, identified by `patch_ids`, against `installation`. All patches in the list must resolve to the same action (all-apply or all-rollback); mixed sets are rejected.

Requires: `patch_ids`, `installation`

```json
{ "installation": "oid", "patch_ids": ["34761383", "34947852"] }
```

#### `perform_transfer`

Runs a single named file transfer, identified by `transfer_name`, regardless of which stage it's configured for.

Requires: `transfer_name`

```json
{ "transfer_name": "d1_obpoid_truststore" }
```

#### `perform_execute`

Runs a single named execute step, identified by `execute_name`, regardless of which stage it's configured for.

Requires: `execute_name`

```json
{ "execute_name": "SchemaLoad" }
```

#### `perform_transfers`

Runs every transfer configured for a given lifecycle `stage`.

Requires: `stage`

```json
{ "stage": "pre-test" }
```

#### `perform_executes`

Runs every execute step configured for a given lifecycle `stage`.

Requires: `stage`

```json
{ "stage": "pre-test" }
```

### Scoping with `host`

Setting `host` restricts the action to just that host â€” for example, `perform_transfer`/`perform_executes` will only act on items whose own host list includes that host, and patch/lifecycle actions will only touch servers/system components running there. Leaving `host` unset runs the action against every applicable host in the model.

### Narrowing further with `args`

`args` lets you further restrict which servers/system components a lifecycle action (like `start_all_system_components`) targets, beyond what `host` alone selects. Each entry is `"target.property=value"`, and supports comma-separated lists as well as glob (`oidrepl*`) or regex patterns:

```json
{ "args": ["startup_control.include_pattern=oid2", "startup_control.exclude_pattern=oidrepl*"] }
```

`include_pattern` narrows within whatever `host` already selected; it can only make the target set smaller, never add hosts/servers that `host` excluded.

### A note on properties you leave out

If you don't set a property for a given run, just omit it from your properties - an omitted property behaves as if it were never declared at all. There's a difference, though, between omitting a property and setting it to an empty value: an explicitly empty value (e.g. an empty string) is still treated as "set", so if an action would otherwise warn or behave differently when a particular property is provided, that same behavior can still be triggered by an empty value. When in doubt, leave properties you don't need out of your properties file entirely rather than setting them to empty.
