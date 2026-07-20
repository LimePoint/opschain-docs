---
sidebar_position: 13
description: Altering project, environment, agent and asset specific settings.
---

# Settings

To help with customizing OpsChain to your needs, a number of settings can be configured at the global, project, environment, asset and change levels, each overriding the previous one. When a _default value_ is mentioned, it usually refers to the value automatically assigned to the global settings, which serve as a fallback and can be configured via the system configuration page in the GUI or at installation time, as described in the [configuration guide](/setup/configuration/index.md). Settings are stored in JSON format and the ones deemed sensitive (e.g. password, tokens) are automatically encrypted when saved.

Changes to these settings apply live across all clusters in a [high availability deployment](/advanced/ha/index.md) — there is no need to restart the OpsChain API for an updated setting to take effect.

The settings below can be configured at any level, unless otherwise specified.

## Agent settings

### agent.disable_host_alias

Default value: _false_

OpsChain configures a [`hostAlias`](https://kubernetes.io/docs/tasks/network/customize-hosts-file-for-pods/) for the [API hostname](/setup/configuration/additional-settings.md#envopschain_api_host_name-and-apihostname) in the pod for accessing the OpsChain API ingress from within the pod.

Setting this to `true` means this host alias will not be created. This may be necessary if you have a DNS entry for the API hostname that you want used because it needs to point to a different ingress than the OpsChain Kubernetes ingress.

### agent.script_path

Default value: _/opt/opschain/agent.sh_

The path to the script that will be launched upon starting an [agent](/getting-started/familiarisation/gui/projects/agents.md).

### Agent image settings

These settings modify the base `FROM` agent image, used to build agents. The agent image string is constructed in the following way:

```dockerfile
FROM {repository}/{name}:{image_tag}
```

#### agent.image_override

Default value: _not configured (there is no image override)_

This setting overrides the whole image string used in the `FROM` directive and hence the `name`, `repository`, and `image_tag` settings will be ignored. This allows you to provide an alternative image registry, for example: `https://customer-registry.example.com/customer/agent-image:version` or `ghcr.io/customer/agent-image:version`.

:::info
The `opschain-image-secret` secret in the Kubernetes cluster must have credentials for the registry to allow the OpsChain build service to pull the images.
:::

#### agent.image_tag

Default: _Current version, e.g. `2025-01-01`_.

The tag of the agent image.

#### agent.name

Default: _opschain-runner-enterprise_

The name of the agent image.

#### agent.repository

Default: _limepoint_

The repository where the agent image is stored. Refers to a Docker registry or a container image repository.

## Change and workflow execution settings

### dockerfile

Default value: _Dockerfile_

The filename to use for the `Dockerfile` for building the [custom step runner Dockerfile](/key-concepts/step-runner.md#custom-step-runner-dockerfiles) or the [agent](/getting-started/familiarisation/gui/projects/agents.md) image.

_This setting is ignored when using an agent template or asset template Dockefile because it takes higher priority._

### include_git_history

Default value: _false_

Whether the `.git` directory (including the full commit history) is included in the Git repository tarball supplied to the [custom step runner Dockerfile](/key-concepts/step-runner.md#custom-step-runner-dockerfiles) build. The default Dockerfile does not use `.git`, so leaving this disabled improves build performance. Enable this if your custom Dockerfile relies on the `.git` directory being present, for example to run Git commands during the build.

:::warning[Behaviour change]
Previously, the `.git` directory was always included, even though the default Dockerfile excludes it from the final image. If you have a custom step runner Dockerfile that relies on `.git` being present, set this to `true` after upgrading.
:::

### log_aggregator_additional_output_settings

Default value: _not configured (the default log aggregator configuration is used)_<br/>
Scope: _global_

Refer to the [log forwarding](/operations/log-forwarding.md) guide for the log aggregator configuration.

### on_failure.dump_properties

Default value: _false_

When a resource controller fails to be created during a change, OpsChain can dump the resolved resource properties to the change logs to aid debugging. Setting this to `true` enables the dump.

:::warning
Enabling this will write resolved property values to the change logs. Sensitive values are masked unless [`on_failure.mask_properties`](/key-concepts/settings.md#controllermask_properties) is set to `false`.
:::

### controller.mask_properties

Default value: _true_

When a resource controller is constructed, the key/value pairs supplied to its constructor are checked for possibly sensitive keys and the values added to the logging data masker. Sensitive keys are those that match the regex `/(?:^|_)(?:password|passphrase|passwd|secret|token|pass|key)s?(?:_|\z)/i`. Setting this to `false` disables this masking. In conjunction with the `on_failure.dump_properties` setting, this can be useful for debugging controller creation issues by allowing you to see the actual property values in the change logs.

### parallel_change_worker_steps

Default value: _5_

The number of steps that can be run in parallel for a single change. This is only applicable when `pod_per_change_step` is set to `false`.

### pod_per_change_step

Default value: _false_

Defines whether OpsChain will use a single Kubernetes pod for running the entire change (value set to `false`) or if it will create one pod for each individual step (value set to `true`). This setting has no effect when running a change with a [MintModel](/getting-started/familiarisation/gui/projects/asset_templates.md#asset-templates-with-a-mintmodel).

:::tip[Image settings]
To configure the change runner or worker image, refer to the [runner image settings](/key-concepts/settings.md#runner-image-settings) when this is set to `true` or to the [worker settings](/key-concepts/settings.md#worker-settings) when it is `false`.
:::

### repo_folder

Default value: _.opschain_

Folder in the Git repository where OpsChain properties will be imported from when running a change.

### requires_approval_from

Default value: _not configured (changes do not require approval)_

Allows you to specify the changes that require approval before they can be executed. This setting can be configured at the project, environment and asset levels, allowing you fine-grained control of change approval. The setting accepts an array of approval rules, with each rule specifying a `change_filter` the `user_names` and/or `ldap_groups` that can approve changes matching the filter and an optional `merge_approvers` field that controls rule merging (see below)

#### change_filter

The change filter defines the criteria that determine if the approval rule applies to a change. The filter supports the following fields:

- `actions` - the string constant `all`, or an array of action names. If the change includes at least one of the specified actions, it will match the filter.
- `created_by` - optional array of usernames. If specified, the change must be created by one of the specified users to match the filter.

An approval rule will be applied to a change if the change matches the `actions` and `created_by` criteria specified in the `change_filter`.

:::note
The `actions` array can include fully specified action names (e.g. `deploy`) or it can include action name patterns using the `*` wildcard (e.g. `deploy*` would match `deploy`, `deploy_app`, `deploy_db`, etc.).
:::

:::warning
The `actions` filter is only checked for changes created with an action that is available via the **available actions** tab for the asset.

The `actions` filter is matched against the change's statically defined step tree. Actions added dynamically at runtime (e.g. via `append_child_steps`) will not trigger approval rules.
:::

#### user_names and ldap_groups

The `user_names` and `ldap_groups` fields accept an array of usernames and LDAP group names, respectively. The rule is considered authorised when any member of the ldap groups or usernames listed in the rule approves the change. Array values can also be sourced from properties using the `{{property_name}}` syntax, allowing you to dynamically specify approvers based on the inherited properties of the settings owner. For example:

##### asset settings

```json
{
  "requires_approval_from": [
    {
      "change_filter": {"actions": "all", "created_by": ["john", "peter"]},
      "user_names": ["{{metadata.environment_owner}}", "frank", "{{metadata.asset_owner}}"]
      "ldap_groups": ["managers","{{metadata.approvers.ldap_groups}}"]
    }
  ]
}
```

##### environment properties

```json
{
  "metadata": {
    "environment_owner": "mary",
    "approvers": { "ldap_groups": ["admin","developers"] }
  }
}
```

##### asset properties

```json
{
  "metadata": {
    "asset_owner": "alice"
  }
}
```

##### Merged asset approval rules

The final asset level rule would be as follows:

```json
{
  "requires_approval_from": [
    {
      "change_filter": {"actions": "all", "created_by": ["john", "peter"]},
      "user_names": ["alice", "frank", "mary"],
      "ldap_groups": ["admin", "developers", "managers"]
    }
  ]
}
```

Ensuring all changes created by `john` or `peter` for the asset require approval from `alice`, `frank`, `mary`  or any member of the `admin`, `developers` or `managers` LDAP groups.

:::tip
If you require a change to be approved by two different users before starting, create two separate rules with the same change filter, each with a different username.
:::

#### merge_approvers

A boolean field that controls how approval rules from overriding settings are merged together. This is best described with an example. Consider the following rules:

##### project settings

```json
{
  "requires_approval_from": [
    {
      "change_filter": { "actions": "all" },
      "user_names": ["fred"]
    },
    {
      "change_filter": { "actions": ["provision"] },
      "merge_approvers": true,
      "ldap_groups": ["qa"]
    },
    {
      "change_filter": { "actions": ["destroy"] },
      "merge_approvers": true,
      "ldap_groups": ["admin"]
    }
  ]
}
```

##### Example environment settings

```json
{
  "requires_approval_from": [
    {
      "change_filter": { "actions": "all" },
      "merge_approvers": true,
      "user_names": ["peter"]
    },
    {
      "change_filter": { "actions": ["provision"] },
      "ldap_groups": ["developers"]
    },
    {
      "change_filter": { "actions": ["destroy"] },
      "merge_approvers": true,
      "user_names": ["mary"]
    }
  ]
}
```

##### Example asset settings

```json
{
  "requires_approval_from": [
    {
      "change_filter": { "actions": "all" },
      "user_names": ["john"]
    },
    {
      "change_filter": { "actions": ["provision"] },
      "ldap_groups": ["senior-developers"]
    },
    {
      "change_filter": { "actions": ["destroy"] },
      "merge_approvers": true,
      "user_names": ["jane"]
    }
  ]
}
```

##### Merged asset approval rules

The final asset level rules would be as follows:

```json
{
  "requires_approval_from": [
    {(1)
      "change_filter": { "actions": "all" },
      "user_names": ["fred"]
    },
    {(2)
      "change_filter": { "actions": "all" },
      "merge_approvers": false,
      "user_names": ["peter", "john"]
    },
    {(3)
      "change_filter": { "actions": ["provision"] },
      "merge_approvers": false,
      "ldap_groups": ["qa", "developers"]
    },
    {(4)
      "change_filter": { "actions": ["provision"] },
      "ldap_groups": ["senior-developers"]
    },
    {(5)
      "change_filter": { "actions": ["destroy"] },
      "merge_approvers": true,
      "user_names": ["mary", "jane"],
      "ldap_groups": ["admin"]
    }
  ]
}
```

The table below explains how each of the final rules is derived from the project, environment and asset level rules:

| Rule | Explanation                                                                                                                                                                                                                                        |
|------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| (1)  | This rule is the project `all` rule. It does not allow merging so does not include any values from the environment or asset rules.                                                                                                                 |
| (2)  | This rule is the environment `all` rule, merged with the asset `all` rule (combining their `user_names` lists)                                                                                                                                     |
| (3)  | This rule is the project `provision` rule, merged with the environment `provision` rule. It does not include the asset `provision` rule in the merged result, as the environment rule does not allow merging                                       |
| (4)  | This rule is the asset `provision` rule. The environment `provision` rule does not allow merging so this is a stand-a-lone rule.                                                                                                                   |
| (5)  | This rule is the project `destroy` rule, merged with the environment `destroy` and asset `destroy` rules. The final rule includes all the usernames and LDAP groups from all three rules as the project and environment level rules allow merging. |

:::note
When assigning approval rules to a change, any rule that the change creator is able to approve themselves will be automatically excluded from the rules assigned to the change.
:::

### MintModel generation

#### enable_mintmodel_debug

Default value: _false_

When enabled, the MintModel generation response will include a `phase_output` component, providing the state of the JSON at various points throughout the generation process.

The MintModel render logs are also enriched, adding the MintPress context, the asset's properties, the filtered properties, and the MintPress properties supplied to the MintModel Steps API, making MintModel generation failures easier to diagnose.

### Parallelism settings

#### allow_parallel.changes

Default value: _true_<br/>
Scope: _global, project, environment, asset_

Whether to allow multiple changes to run within a single project, environment or asset. See [change execution options](/key-concepts/changes.md#change-execution-options) in the changes reference guide for more information.

#### allow_parallel.runs_of_same_change

Default value: _false_<br/>
Scope: _global, project, environment, asset_

Whether to allow multiple changes with the same name to run in parallel within a single project, environment or asset. See [change execution options](/key-concepts/changes.md#change-execution-options) in the changes reference guide for more information.

:::note
If the `allow_parallel.changes` setting is set to `false`, this setting will have no effect.
:::

:::note
This setting applies to each change’s direct target. For example, when `allow_parallel.runs_of_same_change` is `false` changes with the same name will be allowed to run concurrently in the `dev` and `test` environments of a project (as these are two distinct targets). However, two changes with the same name will not be allowed to run concurrently in the `dev` environment.

You can disable parallel changes entirely by setting `allow_parallel.changes` to `false`.
:::

#### allow_parallel.runs_of_same_workflow

Default value: _false_<br/>
Scope: _global, project_

Whether to allow a workflow to be run multiple times in parallel.

## Notifications

Refer to [notifications](/operations/notifications.md) for the notifications configuration.

## Runner image settings

These settings modify the base `FROM` runner image, used to build change step runners. The runner image string is constructed in the following way:

```dockerfile
FROM {repository}/{name}:{image_tag}
```

### runner.image_override

Default value: _not configured (there is no image override)_

This setting overrides the whole image string used in the `FROM` directive and hence the `name`, `repository`, and `image_tag` settings will be ignored. This allows you to provide an alternative image registry, for example: `https://customer-registry.example.com/customer/runner-image:version` or `ghcr.io/customer/runner-image:version`.

:::info
The Kubernetes cluster running OpsChain must be able to pull images from the registry. [Learn more](https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/).

The `opschain-image-secret` secret in the Kubernetes cluster must have credentials for the registry to allow the OpsChain build service to pull the images.
:::

### runner.image_tag

Default: _Current version, e.g. `2025-01-01`_.

The tag of the runner image.

### runner.name

Default: _opschain-runner-enterprise_

The name of the runner image.

### runner.repository

Default: _limepoint_

The repository where the runner image is stored. Refers to a Docker registry or a container image repository.

### runner.reuse_actions_rb

Default value: _true_

Improves change performance by only loading the actions defined in the `actions.rb` once.

This means that code at the top level of the file can't change - e.g. you can't define a variable at the top level and attempt to change it between steps. This can still be done within an action.

```ruby
top_level_var = rand > 0.5 ? something : something_else # this wouldn't work as expected because the value wouldn't change

action :test do
  var = rand > 0.5 ? something : something_else # this would work because it would be run in the action
end
```

:::note

This setting is ignored when `pod_per_change_step` is `true`.

:::

### runner.use_fork_for_mintpress_ctl_rb

Default value: _true_

Controls whether the MintModel executor runs `mintpress_ctl.rb` in a forked subprocess or in a new process spawned directly.

When `true` (the default), `mintpress_ctl.rb` is executed via a fork of the running executor process. Forking is both faster and more memory-efficient: the child inherits the already-loaded Ruby runtime and gem environment rather than initialising them from scratch, and the operating system's copy-on-write semantics mean that unmodified memory pages are shared with the parent process rather than duplicated. When `false`, `mintpress_ctl.rb` is spawned as a fresh process, which avoids inheriting the executor's runtime state and can be useful when the forked environment causes compatibility issues with the MintPress runtime.

:::note

This setting only applies to MintModel steps. Standard runner steps are not affected.

:::

## Image build settings

OpsChain builds a container image before running each change step. On busy clusters, many image builds can be triggered simultaneously, competing for build service resources. The image build throttle limits how many builds run at the same time, queuing excess requests and starting them as running builds complete.

When a build is submitted, OpsChain checks whether a concurrency slot is available. If one is free, the build starts immediately. If all slots are occupied, the build waits and re-checks after a configurable delay. Queued builds are started in the order they were submitted (FIFO).

### build_service.max_concurrent_image_builds

Default value: _8_<br/>
Accepted values: _1 or greater_

The maximum number of container image builds that OpsChain will run simultaneously. If more builds are submitted than this limit allows, they are queued and started in submission order (FIFO) as running builds complete.

Reduce this value to limit the load on the image build service; increase it to allow more parallel image builds on well-resourced clusters.

### build_service.image_build_throttle_delay

Default value: _2_<br/>
Accepted values: _1 or greater_

The number of seconds to wait before re-attempting an image build that was deferred because all concurrency slots were in use (see [`build_service.max_concurrent_image_builds`](#build_servicemax_concurrent_image_builds)).

Decrease this value for faster slot acquisition at the cost of higher database polling frequency; increase it to reduce load when builds are frequently queued.

### build_service.max_image_build_retries

Default value: _3_

The number of times OpsChain will retry a container image build when a transient build service error is detected. Retries only occur for known transient errors (such as gRPC connection drops from the BuildKit service); persistent failures are not retried.

Set to `0` to disable retries entirely.

### Image reuse

Rather than rebuilding an identical image for every step or change, OpsChain can reuse a previously built runner image. Each build is identified by a _content key_ derived from the inputs that determine the image (such as the Git commit, the resolved Dockerfile, the base runner image and the build context). When a step or change would build an image whose content key matches one already in the registry, OpsChain reuses the existing image and skips the build.

Concurrent builds of the same image are also de-duplicated: when several identical builds are triggered at once, one build runs while the others wait for it and then reuse the result, rather than each rebuilding the same image. Reusable images are retained for a configurable time-to-live and are not garbage collected while still within it.

#### image_reuse.enabled

Default value: _true_<br/>
Scope: _global, project, environment, asset_

Whether OpsChain reuses previously built runner images. When enabled, a step or change whose content key matches an existing image reuses that image instead of rebuilding it. When disabled, an image is built for every step or change and no reusable images are retained.

#### image_reuse.ttl_days

Default value: _7_<br/>
Accepted values: _0 or greater_<br/>
Scope: _global, project, environment, asset_

The number of days a reusable image is retained after it was last used. Each time an image is reused its retention window is extended by this value; a shorter time-to-live never shortens the retention already granted to an existing image.

#### image_reuse.build_relies_on_parents

Default value: _false_<br/>
Scope: _global, project, environment, asset_

Whether the image content key includes the node's parent environment data. By default (`false`) parent data is excluded from the content key, which allows significantly more reuse, since most builds do not consume parent data. Set to `true` only when a custom [`dockerfile`](#dockerfile) bakes parent data into an image layer, so that a change in that data correctly produces a new image.

## Runner pod concurrency settings

OpsChain runs each change worker, step runner, actions refresh and MintModel concretisation in its own Kubernetes pod. On busy clusters this can create more pods than the cluster can comfortably schedule at once. These settings cap how many runner, actions-refresh and MintModel pods OpsChain will run concurrently on a cluster. When a cap is reached, further pods wait and are admitted as running pods complete.

The runner and actions-refresh caps share capacity: if one pool is not using its full allocation, the other may borrow the spare slots. MintModel pods have their own cap but may also borrow spare runner and actions-refresh capacity. The combined number of running pods never exceeds the sum of the three limits.

### concurrent.runner_limit

Default value: _15_<br/>
Accepted values: _1 or greater_<br/>
Scope: _global_

The maximum number of runner pods — change workers and per-step runners — that OpsChain will run simultaneously on a cluster.

### concurrent.refresh_limit

Default value: _5_<br/>
Accepted values: _1 or greater_<br/>
Scope: _global_

The maximum number of actions-refresh pods — which derive an asset's actions for an assigned template version — that OpsChain will run simultaneously on a cluster.

### concurrent.mintmodel_limit

Default value: _10_<br/>
Accepted values: _1 or greater_<br/>
Scope: _global_

The maximum number of MintModel pods — which concretise an asset's MintModel — that OpsChain will run simultaneously on a cluster.

## Token settings

These settings control the short-lived API keys that OpsChain generates so that running changes and agents can query the OpsChain API server (for example via the [`OpsChain.query`](/key-concepts/actions.md#querying-the-api) action helper).

### token.change_api_key_expiry_days

Default value: _0_ (disabled)<br/>
Accepted values: _0–365_

The number of days before the API key generated for a change's step execution context expires. When set to a positive value, OpsChain generates an API key for each change and injects it into the step context, allowing action code to query the API server with the permissions of the user that created the change.

When set to `0` (the default) no key is generated and [`OpsChain.query`](/key-concepts/actions.md#querying-the-api) cannot be used from within a change.

### token.agent_api_key_expiry_days

Default value: _0_ (disabled)<br/>
Accepted values: _0–365_

The number of days before the API key generated for an agent pod's context expires. When set to a positive value, OpsChain generates an API key for each agent, allowing the agent's action code to query the API server with the permissions of the user that started the agent.

When set to `0` (the default) no key is generated.

## Vault settings

Default value: _not configured (will be using the [default vault configuration](/setup/configuration/additional-settings.md#secret-vault-settings))_

Overrides the vault configuration at the node level. This is useful for when you have different vault configurations across different projects and environments (e.g. different vault config for `development` and `production` environments). When running a change, all property secrets will be decrypted using the vault settings of the change's parent.

Some examples of valid vault configurations:

```json
{
  "vault": {
    "address": "http://a-vault-address",
    "auth_method": "token",
    "token": "token-value"
  }
}
```

```json
{
  "vault": {
    "address": "http://a-vault-address",
    "auth_method": "userpass",
    "user": "user",
    "password": "password"
  }
}
```

:::note[Credential visibility]
The `user`, `password`, and `token` fields will be automatically encrypted once the setting is saved.
:::

### vault.address

Default value: _none_

The address of the vault to use, for example `http://vault.example.com:8200`.

### vault.auth_method

Default value: _none_<br/>
Accepted values: _token, userpass, ldap_

The authentication method to use.

### vault.client_options

Default value: _none_

A JSON object containing options to use when communicating with the external vault client. Available keys include:

- `ssl_pem_file`: The path to the SSL PEM file to use. The file must be in the image used by the OpsChain API deployment.
- `ssl_pem_passphrase`: The passphrase to use when decrypting the SSL PEM file.
- `ssl_ca_cert`: The path to the SSL certificate authority file to use. The file must be in the image used by the OpsChain API deployment.
- `ssl_timeout`: The timeout for the SSL connection in seconds.
- `ssl_verify`: Whether to verify the SSL certificate of the vault server. Defaults to `true`.

### vault.mount_path

Default value: _none_

The mount path for the KV secret store in the external secret vault.

### vault.password

Default value: _none_

The password to use when authenticating with the external secret vault when using the `userpass` authentication method.

### vault.password_auto_create

Default value: _none_

Whether OpsChain automatically generates a password when one is requested but not already present in the vault.

### vault.password_include_chars

Default value: _none_

Whether a generated password may include alphabetic characters.

### vault.password_include_numbers

Default value: _none_

Whether a generated password may include numeric characters.

### vault.password_include_symbols

Default value: _none_

Whether a generated password may include symbols. The symbols used are controlled by [`vault.password_symbols_list`](#vaultpassword_symbols_list).

### vault.password_length

Default value: _none_

The length of a generated password. Must be between 1 and 100.

### vault.password_must_start_with_char

Default value: _none_

Whether a generated password must begin with an alphabetic character.

### vault.password_symbols_list

Default value: _none_

The set of symbol characters a generated password may draw from when [`vault.password_include_symbols`](#vaultpassword_include_symbols) is enabled.

### vault.ssl_verify

Default value: _true_

Whether to verify the TLS certificate presented by the secret vault. Set to `false` to allow connections to a vault using a self-signed or otherwise untrusted certificate.

:::note
The password generation settings above (`vault.password_*`) control the format of passwords that OpsChain generates to store in the secret vault. When a setting is not configured, the vault's own default password policy applies.
:::

### vault.token

Default value: _none_

The token to use when authenticating with the external secret vault.

### vault.username

Default value: _none_

The username to use when authenticating with the external secret vault when using the `userpass` authentication method.

### vault.use_mint_encryption

Default value: _none_

Whether to use OpsChain's encryption to encrypt the values before storing them in the external secret vault. If this is set to true, the values will be encrypted twice.

## Worker settings

These settings only apply when running a change with `pod_per_change_step` set to `false`.

### remove_change_worker_pod

Default value: _true_

Setting that enables the change worker pod to be left running once the change finishes so we can execute into them and perform debug operations.

## LDAP synchronisation settings

### ldap.refresh_interval

Default value: _14,400_ (4 hours)

The interval between executing the LDAP synchronization process, in seconds. This process synchronizes the LDAP groups and users configured in OpsChain with the actual LDAP server.

:::note
The Security page in the OpsChain GUI allows you to trigger an immediate LDAP synchronization outside of the regular interval.
:::

### ldap.refresh_search_timeout

Default value: _300_ (5 minutes)

The timeout for the LDAP synchronization search queries, in seconds. If the LDAP synchronization process is taking a long time to complete, you may want to increase this value to prevent the search queries from timing out.

## Git remote settings

### git_remote.fetch_stale_threshold

Default value: _3_ (seconds)<br/>
Scope: _global_

When multiple callers request a fetch for the same Git remote concurrently, OpsChain ensures only one fetch runs at a time. A caller that was waiting when the lock was released will skip the fetch — the data retrieved by the first caller is used instead.

If the wait exceeded this threshold (in seconds), OpsChain considers the completed fetch potentially stale and performs an additional fetch of its own before proceeding.

Setting this to a higher value reduces the total number of fetch operations at the cost of occasionally working with slightly older data. Setting it to `0` causes every waiter to always re-fetch after waiting.

### known_hosts

Default value: _not configured (only the bundled defaults are trusted)_<br/>
Scope: _global_

An array of additional SSH `known_hosts` entries to trust when connecting to SSH Git remotes. Each element is a single `known_hosts` line, in the format produced by `ssh-keyscan`. These entries are merged with the [bundled `known_hosts` defaults](/setup/configuration/additional-settings.md#opschain_ssh_known_hosts_config_map); where a custom entry's host and key type match a bundled entry, the custom entry takes precedence.

```json
{
  "known_hosts": [
    "git.internal.example.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA...",
    "@cert-authority *.internal.example.com ssh-rsa AAAAB3NzaC1yc2E..."
  ]
}
```

Each entry is validated when the setting is saved — an entry that is not a valid `known_hosts` line is rejected.

:::note
Unlike most settings, updates to `known_hosts` do not apply live to long-running pods. The merged file is rebuilt when the OpsChain API and worker pods start, so a restart is required for newly added entries to take effect on already-running pods. The [`add-git-remote`](/getting-started/familiarisation/gui/projects/git_remotes.md) request is an exception — it always validates against the current setting, so a remote can be added immediately after updating `known_hosts`.
:::
