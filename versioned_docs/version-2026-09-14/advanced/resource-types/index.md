---
sidebar_position: 1
description: The pre-defined resource types available in OpsChain.
---

# Included resource types

A collection of resource types come pre-installed on the OpsChain step runner image, this guide covers what they are and how to use them.

## Resource type summary

The table below outlines the file to `require` in your resource definition and the resource types that will become available.

| Require                                           | Resource type            | Description                                                                                        |
|:--------------------------------------------------|:-------------------------|:---------------------------------------------------------------------------------------------------|
| [`opschain-chef`](#opschain-chef)                 | `chef_environment`       | Pin cookbook versions on, and update, a Chef environment object                                    |
|                                                   | `chef_node`              | Set the run list of one or more Chef nodes                                                         |
| [_none_](#opschain-git-clone)                     | `git_clone`              | Check out one of the project's configured Git remotes into the step's working environment          |
| [`opschain-kubernetes`](#opschain-kubernetes)     | `kubernetes_resource`    | Manage Kubernetes resources via manifests in your project repo                                     |
|                                                   | `kubernetes_daemonset`   | Perform common operations on a Kubernetes daemonset resource                                       |
|                                                   | `kubernetes_deployment`  | Perform common operations on a Kubernetes deployment resource                                      |
|                                                   | `kubernetes_statefulset` | Perform common operations on a Kubernetes statefulset resource                                     |
| [`opschain-ssh-key-pair`](#opschain-ssh-key-pair) | `ssh_key_pair`           | Generate an SSH public/private key pair and optionally stores the key files in OpsChain properties |
| [`opschain-terraform`](#opschain-terraform)       | `terraform_config`       | Exposes the [RubyTerraform](https://github.com/infrablocks/ruby_terraform/tree/v1.9.0) Gem         |

### Usage

The resource types are pre-installed in the OpsChain step runner image via the `opschain-resource-types` Gem. To use them, simply add the following line to your `Gemfile` in your project Git repository:

```ruby
gem 'opschain-resource-types'
```

Then in your `actions.rb` (or wherever you define your resources) add:

```ruby
# replace 'opschain-infrastructure' with the relevant value from the "Require" column in the table above
require 'opschain-infrastructure'

# replace transport_factory with the required resource type from the "Resource Type" column in the table above
transport_factory :my_transport_factory do
  ...
end
```

## OpsChain infrastructure

Requiring `opschain-infrastructure` currently provides a minimal set of resource types for the [Confluent OpsChain example project](https://github.com/LimePoint/opschain-examples-confluent). More support will be added over time.

## OpsChain Chef

Requiring `opschain-chef` provides two resource types that manage Chef Infra Server objects through `knife`: `chef_environment`, which pins the cookbook versions an environment runs and writes the environment object as a whole, and `chef_node`, which sets the run list of one or more nodes.

Between them they decide what the next `chef-client` run on a host does: the node's run list says which recipes run, and the environment's `cookbook_versions` constraints say which version of each cookbook is resolved. Set both before the hosts run, not after.

Everything runs on the step runner. Nothing runs on a target host, so there is no `host` property.

A Cinc server is managed the same way. `knife` speaks the same API to both, and the resource type does not care which is at the other end.

### Prerequisites

Unlike the Kubernetes and Terraform resource types, this one needs no [custom step runner Dockerfile](/key-concepts/step-runner.md#custom-step-runner-dockerfiles). The `knife` gem (18.5.0) is installed in the OpsChain step runner image and is on the `PATH`.

The knife *configuration* is not, and every action fails with knife's own configuration error until you supply one. Add it as an [OpsChain file property](/key-concepts/properties.md#file-properties) written to `/opt/opschain/.chef/config.rb`, which is the `opschain` user's `~/.chef` and one of the locations knife searches by itself. If you keep it somewhere else, name that path in the `knife_config` property:

```ruby
chef_environment :app_environment do
  environment 'dev'
  knife_config lazy { OpsChain.properties.chef.knife_config_file }
end
```

Read the path from a property rather than hard coding it, so the same actions can run against a different Chef server per environment.

### chef_environment

#### Pinning cookbook versions

```ruby
chef_environment :app_environment do
  environment 'dev'
  cookbooks lazy { { 'deployments-cookbook' => OpsChain.properties.release.cookbook_version } }
  knife_config lazy { OpsChain.properties.chef.knife_config_file }
end
# provides app_environment:show, app_environment:pin and app_environment:update actions
```

Give versions as plain version strings. `'30.0.12'` is written as the exact constraint `= 30.0.12`; a value that already carries an operator, such as `'~> 30.0'`, is used as you wrote it.

`pin` reads the environment, works out the new constraint set and writes it back only when it differs from what is already there, so a change that does not move the pinning writes nothing to the Chef server.

:::warning[A version that was never uploaded fails on the hosts, not in your change]
Pin a version the Chef server does not hold and the pinning itself succeeds. Every `chef-client` run on a host in that environment then fails to resolve the cookbook, hours later and somewhere you are not looking.

That is why `verify_uploaded` defaults to `true`. Before pinning an exact version, OpsChain asks the Chef server for the cookbook and fails the step if that version is not there:

```text
cookbook "app-deployments" version 30.0.12 is not available on the Chef server
```

Only exact constraints can be checked this way. A range such as `~> 30.0` is left for the Chef server to resolve and is not checked.
:::

#### Resource type properties - Chef

The `chef_environment` resource type accepts the following properties:

| Property          | Default value                     | Description                                                                                                                                                                                                                                                                                                          |
|:------------------|:----------------------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `environment`     | the OpsChain environment code     | The Chef environment to act on. The default only fits a project where the Chef environment carries the same name as the OpsChain environment, so set it explicitly whenever the two differ. A change running at project level has no environment to fall back on and fails with `An "environment" property is required`. |
| `cookbooks`       |                                   | The cookbooks `pin` constrains, as a hash of cookbook name to version. `pin` fails with `A "cookbooks" property is required` when it is empty.                                                                                                                                                                        |
| `definition`      |                                   | The environment object `update` writes, as a hash. Mutually exclusive with `definition_file`.                                                                                                                                                                                                                         |
| `definition_file` |                                   | Path to a JSON file holding the environment object `update` writes. A relative path is resolved against the step's working directory, `/opt/opschain`, where your project repository is checked out. Mutually exclusive with `definition`.                                                                             |
| `merge`           | `true`                            | Merge into what the environment already holds rather than replacing it — see [merging or replacing what the environment already holds](#merging-or-replacing-what-the-environment-already-holds).                                                                                                                     |
| `verify_uploaded` | `true`                            | Confirm the Chef server holds an exactly pinned version before pinning it. Applies to `pin` only.                                                                                                                                                                                                                     |
| `ignore_failure`  | `false`                           | Log a warning and return `nil` rather than raising. For the usual case of wanting the change to carry on, use the [`ignore_failures` DSL](/key-concepts/actions.md#ignoring-controller-action-failures-on-a-resource) instead; reach for this property only when later code in the same action has to keep running after knife fails. |
| `knife_binary`    | `knife`                           | The knife executable to run.                                                                                                                                                                                                                                                                                         |
| `knife_config`    |                                   | Passed to knife as `-c`. Leave it unset to use knife's own configuration resolution.                                                                                                                                                                                                                                 |
| `store_in`        |                                   | Copy the environment object into OpsChain properties: `:environment` or `:project`. Nothing is written to properties when this is unset.                                                                                                                                                                              |
| `store_key`       | `chef.environments.<environment>` | The dotted property path `store_in` writes to.                                                                                                                                                                                                                                                                       |

#### Actions

The `chef_environment` resource type provides the following actions:

| Action   | Description                                                                                                                                                        |
|:---------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `show`   | Read the environment object, log it and return it.                                                                                                                 |
| `pin`    | Apply the `cookbooks` constraints to the environment's `cookbook_versions`, writing only when they differ from the pinning already there.                           |
| `update` | Write `definition` (or `definition_file`) to the environment, creating the environment when the Chef server does not hold it yet.                                   |

All three return the environment object they read or wrote, so an action can pick values out of it:

```ruby
action :report_pins do
  versions = resource('app_environment').controller.show['cookbook_versions']
  OpsChain.logger.info versions.inspect
end
```

#### Merging or replacing what the environment already holds

`merge` (default `true`) decides what happens to the values the environment already carries, and means the matching thing for both actions.

For `pin`, the cookbooks you name are merged into the existing pinning: a cookbook that is already pinned takes the new version, and every other existing pin is left alone. Set `merge false` when the versions you supply are the complete set the environment should carry, since any cookbook you do not name then loses its constraint.

For `update`, the definition is deep merged over the existing environment object, so setting one key under `default_attributes` leaves its siblings intact. Set `merge false` to replace the object outright, which is the only way to remove a key.

#### Updating the environment object

`update` writes the whole environment object, taken from either a `definition` hash or the JSON document at `definition_file`:

```ruby
chef_environment :app_environment do
  environment 'dev'
  definition_file 'chef/environments/dev.json'
  knife_config lazy { OpsChain.properties.chef.knife_config_file }
end
```

Supply one or the other. Supplying both fails with `The "definition" and "definition_file" properties are mutually exclusive`, and supplying neither fails with `A "definition" or "definition_file" property is required`.

`update` creates the environment when the Chef server does not hold it yet. `pin` and `show` do not, and both fail with `Chef environment "dev" does not exist`, because an environment missing at pinning time is nearly always a typo in the environment name rather than an environment you meant to create.

The `name` key is set from the `environment` property. A definition naming a different environment fails rather than writing to the wrong object:

```text
The supplied definition is named "test" but the environment property is "dev"
```

#### Copying the environment into OpsChain properties

The Chef server holds the state. The environment object is copied into OpsChain properties only when `store_in` asks for it:

```ruby
chef_environment :app_environment do
  environment 'dev'
  store_in :environment
end
```

Every action then writes the object it read or wrote to `chef.environments.dev` in the environment properties. Set `store_key` to put it somewhere else.

:::note
Like any [modifiable property](/key-concepts/properties.md#modifiable-properties), the copy is saved on step completion. It is available to subsequent steps and changes, not to the step that wrote it. Reading it back within the same step gives you the value from the previous run.
:::

### chef_node

`chef_node` sets the run list of one or more nodes: the recipes and roles a VM runs, and the order it runs them in.

```ruby
chef_node :dev_vms do
  search 'chef_environment:dev'
  run_list ['base::bootstrap', 'base::default', 'app::default']
  knife_config lazy { OpsChain.properties.chef.knife_config_file }
end
# provides dev_vms:show and dev_vms:set_run_list actions
```

Each action reads every target node first and writes only the ones whose run list differs, so a change that does not move a fleet's run list writes nothing to the Chef server.

#### Choosing the nodes

Name the VMs with `nodes`, or select them with a Chef `search` query. Supply one or the other: both together fails with `The "nodes" and "search" properties are mutually exclusive`, and neither with `A "nodes" or "search" property is required`.

```ruby
chef_node :one_vm do
  nodes 'vm1.example.com'
end

chef_node :two_vms do
  nodes ['vm1.example.com', 'vm2.example.com']
end
```

The resolved node names are logged before anything is written, so the change records which VMs were in scope.

:::warning[A search with no field name matches VMs you did not ask for]
knife rewrites a query holding no `:` into a fuzzy match across several node fields, so a query that reads like an environment or a hostname matches by substring instead:

```text
tags:*dev* OR roles:*dev* OR fqdn:*dev* OR addresses:*dev* OR policy_name:*dev* OR policy_group:*dev*
```

The result is a plausible near miss rather than an obvious failure. Measured against one estate, the field query and the bare query returned 46 and 45 nodes: different sets rather than one being a subset of the other, because the bare query also matched the environment name inside fully qualified domain names.

`chef_node` refuses a query with no `:` rather than passing it to knife:

```text
the "search" property must be a field query such as chef_environment:dev; knife expands "dev" into a fuzzy match across tags, roles, fqdn, addresses, policy_name and policy_group
```

:::

A search that matches nothing fails rather than reporting success having touched no VMs, because a mistyped query is otherwise indistinguishable from a fleet that is already correct:

```text
the search "chef_environment:dev" matched no nodes
```

Set `max_nodes` to cap how many VMs one action may touch, so a query that matches more of the estate than you meant stops before writing to any of them:

```text
the search "chef_environment:dev" matched 46 nodes, more than the max_nodes limit of 25
```

#### Run list entries

Entries are normalised the way Chef parses them, so you can write them the short way:

| Written as             | Applied as                     |
|:-----------------------|:-------------------------------|
| `apache`               | `recipe[apache]`               |
| `base::bootstrap` | `recipe[base::bootstrap]` |
| `apache@1.2.0`         | `recipe[apache@1.2.0]`         |
| `recipe[apache]`       | `recipe[apache]`               |
| `role[web]`            | `role[web]`                    |

Normalising what you declare *and* what the Chef server returns is what makes the action idempotent. Without it `run_list ['apache']` would never match the stored `recipe[apache]`, and every change would rewrite every VM in the fleet.

A near miss is rejected before knife is called, rather than being written as a run list entry that only fails when Chef next resolves it:

```text
run list entry "Recipe[apache]" is not valid: expected recipe[name], recipe[name@version] or role[name]
run list entry "apache@1" is not valid: a recipe version must be two or three dot separated numbers, such as apache@1.2 or apache@1.2.0
```

#### Replacing or merging the run list

`run_list` is the complete, ordered list each VM should carry, and `set_run_list` makes each node match it. Anything the node holds that you do not name is dropped.

Set `merge true` to append only the entries a node is missing, leaving the order it already holds alone. Replace is the default here, the opposite way round to `merge` on `chef_environment`, because a run list is ordered: appending moves where a recipe runs relative to the others, and doing that silently is the more surprising behaviour.

```ruby
chef_node :dev_vms do
  search 'chef_environment:dev'
  run_list ['audit::default']
  merge true
end
```

#### Resource type properties

The `chef_node` resource type accepts the following properties:

| Property         | Default value | Description                                                                                                                                                                                  |
|:-----------------|:--------------|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `nodes`          |               | The nodes to act on, as a single name or a list of names. Mutually exclusive with `search`.                                                                                                   |
| `search`         |               | A Chef search query selecting the nodes to act on, such as `chef_environment:dev`. It must name a field, for the reason given above. Mutually exclusive with `nodes`.                         |
| `run_list`       |               | The complete ordered run list the nodes should carry. `set_run_list` fails with `A "run_list" property is required` when it is empty.                                                         |
| `merge`          | `false`       | Append the entries a node is missing rather than replacing its run list.                                                                                                                     |
| `max_nodes`      |               | Fail when more than this many nodes resolve, before writing to any of them. Worth setting on any resource that uses `search`.                                                                 |
| `ignore_failure` | `false`       | Log a warning and return `nil` rather than raising. For the usual case of wanting the change to carry on, use the [`ignore_failures` DSL](/key-concepts/actions.md#ignoring-controller-action-failures-on-a-resource) instead. |
| `knife_binary`   | `knife`       | The knife executable to run.                                                                                                                                                                 |
| `knife_config`   |               | Passed to knife as `-c`. Leave it unset to use knife's own configuration resolution.                                                                                                         |
| `store_in`       |               | Copy the run lists into OpsChain properties: `:environment` or `:project`. Nothing is written to properties when this is unset.                                                              |
| `store_key`      | `chef.nodes`  | The dotted property path `store_in` writes to. The run lists are stored there as one map keyed by node name, rather than a property path per node, because node names are usually fully qualified domain names and every dot would otherwise become another level of nesting. |

#### Actions

The `chef_node` resource type provides the following actions:

| Action         | Description                                                                                                     |
|:---------------|:--------------------------------------------------------------------------------------------------------------------|
| `show`         | Read and return the run list each target node holds, as a map keyed by node name.                               |
| `set_run_list` | Make each target node's run list match `run_list`, writing only the nodes that differ.                          |

:::note[Why there is no action that writes the whole node]
`chef_environment` has an `update` action that writes the whole object. `chef_node` deliberately has no equivalent.

`knife node show NODE --format json` returns a summary holding only `name`, `chef_environment`, `run_list` and the `normal` attributes. The node's `default`, `override` and `automatic` attributes appear only in a long listing. Read that summary and write it back with `knife node from file` and you empty those three attribute trees on the Chef server.

`chef_node` therefore reads the summary, which always carries the run list, and writes through `knife node run_list set`, which modifies the node on the server rather than replacing it wholesale.

One consequence: there is no way to empty a run list through this resource type. `knife node run_list set` requires at least one entry, so an empty `run_list` is rejected rather than clearing the VM.
:::

## OpsChain git clone

The `git_clone` resource type checks a Git repository out into a directory inside the step's working environment. It is loaded before your `actions.rb` is read, so it needs no `require` of its own.

Most often the repository is one of the project's configured [Git remotes](/getting-started/familiarisation/gui/projects/git_remotes.md), referred to by the name the remote was given in OpsChain. OpsChain checks these out from its own server-side mirror of the remote, so no credentials are needed and the checkout is fast — it never has to talk to the actual remote over the network:

```ruby
git_clone 'app-config' do
  branch :main
end
```

A repository that is not configured in the project can be checked out by [supplying its URL and credentials](#checking-out-a-repository-that-is-not-configured-in-the-project) instead.

The checkout happens as OpsChain evaluates the `git_clone` block, so the files are already in place for any code that comes after it — including code that runs while your actions are being loaded. You do not have to invoke anything to make the checkout happen:

```ruby
git_clone 'app-config' do
  branch :main
end

action :show_config do
  config = YAML.load_file('/opt/opschain/app-config/config.yaml')
end
```

### Resource type properties - Git clone

The `git_clone` resource type accepts the following properties:

| Property               | Default value                   | Description                                                                                                                                                                                                                                                                                                                                                                                                                |
|:-----------------------|:--------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `path`                 | `/opt/opschain/<resource name>` | The directory to check the repository out into. A relative value is resolved against `/opt/opschain` — the `opschain` user's home directory, where your project repository is checked out — so `path 'app-config'` checks out into `/opt/opschain/app-config`. Supply an absolute path to check out elsewhere. A value containing `..` is rejected, as is a resource name containing `/` or `..` when the default is used. |
| `branch`               | _(required)_                    | The branch to check out. Omitting this raises an error. A branch is the only thing that can be selected — a tag or a commit SHA is not resolved, and asking for one fails with `Branch "v1.2.3" was not found in the "app-config" git repository`.                                                                                                                                                                         |
| `clone_during_dry_run` | `false`                         | Whether to check the repository out when OpsChain loads your actions to *discover* them rather than to run a step — see [when the repository is checked out](#when-the-repository-is-checked-out). Set this to `true` if the repository holds YAML or similar configuration that your actions need in order to build the actions or the step tree.                                                                         |
| `url`                  |                                 | The URL of a repository that is **not** one of the project's Git remotes. See [checking out a repository that is not configured in the project](#checking-out-a-repository-that-is-not-configured-in-the-project). Supplying this means OpsChain fetches from the real remote rather than from a mirror, so any credentials the repository needs must be supplied too.                                                     |
| `user`                 |                                 | Username to authenticate an HTTPS `url` with. Not needed for a public repository.                                                                                                                                                                                                                                                                                                                                          |
| `password`             |                                 | Password or personal access token to authenticate an HTTPS `url` with.                                                                                                                                                                                                                                                                                                                                                     |
| `ssh_key`              |                                 | The **contents** of the private key to authenticate an SSH `url` with — not a path to a key file. Store the key in an [OpsChain property](/key-concepts/properties.md) and read it back, rather than committing it to your Git repository.                                                                                                                                                                                 |
| `passphrase`           |                                 | The passphrase for `ssh_key`, if it has one.                                                                                                                                                                                                                                                                                                                                                                               |

```ruby
git_clone 'app-config' do
  branch :main
  clone_during_dry_run true
end
```

:::warning[The default directory sits inside your project repository]
`/opt/opschain` is where OpsChain checks your project's Git repository out, so the default target directory — `/opt/opschain/<resource name>` — is a directory *inside* that checkout. If your project repository already contains a directory of that name, OpsChain refuses to check out over it:

```text
"/opt/opschain/app-config" already exists and is not a git working tree; refusing to check out over it
```

Name the resource something your project repository does not already contain, or set `path` to a location outside `/opt/opschain`.
:::

### When the repository is checked out

OpsChain loads your actions for two different reasons, and `clone_during_dry_run` decides what happens in the second of them:

- **To run a step.** The repository is always checked out, whatever `clone_during_dry_run` is set to.
- **To discover what your actions are, without running any of them.** The repository is checked out only if `clone_during_dry_run` is `true`.

OpsChain loads your actions purely to discover them when it generates an [asset template's](/getting-started/familiarisation/gui/projects/asset_templates.md) actions, and when it works out the step tree of a change that runs from one of the project's Git remotes — the step tree of such a change is not known until its first step loads the actions. Running `opschain-action --tasks` (or any of the other task listing options) loads them the same way.

So if your actions read a checked out file *while they are being loaded* — to build the actions or the step tree from it, as in the pattern below — you need `clone_during_dry_run true`. Without it, discovery fails with a missing file error even though the step itself would have run correctly.

:::tip[Declare the resource before the code that reads it]
Because the clone happens as OpsChain evaluates the `git_clone` block, only code appearing *after* the block can read the cloned files. Reading them earlier in the file fails with a missing file error, which looks as though the clone never happened rather than as though it had not happened *yet*.

We suggest declaring your `git_clone` resources at the top of your actions, ahead of anything that depends on their contents:

```ruby
git_clone 'app-config' do
  branch :main
  clone_during_dry_run true
end

config = YAML.load_file('/opt/opschain/app-config/config.yaml')

config['environments'].each do |environment|
  action "deploy_#{environment['name']}" do
    # ...
  end
end
```

<details>
<summary>Sharing repository declarations across several templates in one repository</summary>

A single Git repository often holds the actions for several [asset templates](/getting-started/familiarisation/gui/projects/asset_templates.md), each in a [folder named after its template code](/key-concepts/properties.md#template-folder-properties) - so each template has its own `actions.rb` entry point. When several of them need the same repositories checked out, declare those once in a shared file and require it from each entry point:

```text
git_clones.rb
web-server/actions.rb
database/actions.rb
```

```ruby
# git_clones.rb
git_clone 'app-config' do
  branch :main
  clone_during_dry_run true
end
```

```ruby
# web-server/actions.rb
require_relative '../git_clones'

config = YAML.load_file('/opt/opschain/app-config/config.yaml')
```

Declaring them in one place also removes a failure mode. Two templates that each declared `app-config` with a different branch, both checking out into the same directory, would raise the duplicate target error described below. With a single declaration they cannot disagree.

The ordering rule above still applies, one level further out: the `require_relative` must come before any code that reads the checked out files.

</details>
:::

:::warning[Set `clone_during_dry_run` on its own, not through `properties`]
Setting it through the bulk `properties` form has no effect during a dry run, and fails silently:

```ruby
git_clone 'app-config' do
  properties(clone_during_dry_run: true) # does nothing during a dry run
end
```

OpsChain skips bulk property assignment entirely while loading your actions for a dry run, so the property is never set, the repository is not cloned, and nothing reports a problem - it simply looks as though the setting is being ignored. Set it as its own property instead:

```ruby
git_clone 'app-config' do
  clone_during_dry_run true
end
```

This applies to every resource property rather than only this one, but it matters most here, because this is the property whose whole purpose is to change what happens during a dry run.
:::

### Checking out a repository that is not configured in the project

Supply a `url` instead of naming one of the project's Git remotes. There is no mirror for such a repository, so OpsChain fetches from the real remote over the network and you must supply whatever credentials it needs. Keep those in [OpsChain properties](/key-concepts/properties.md) rather than in your Git repository:

```ruby
# a public repository needs no credentials
git_clone 'opschain-docs' do
  url 'https://github.com/LimePoint/opschain-docs.git'
  branch :master
end

# a private repository over HTTPS
git_clone 'app-config' do
  url 'https://github.com/my-org/app-config.git'
  user OpsChain.properties.github.user
  password OpsChain.properties.github.token
  branch :main
end

# a private repository over SSH - ssh_key takes the key itself, not a path to it
git_clone 'app-config' do
  url 'git@github.com:my-org/app-config.git'
  ssh_key OpsChain.properties.deploy_key
  passphrase OpsChain.properties.deploy_key_passphrase # omit if the key has no passphrase
  branch :main
end
```

:::note
Read the key out of a property directly, as above, rather than reading a [file property](/key-concepts/properties.md#file-properties) from disk. OpsChain does not write file properties out when it loads your actions [to discover them](#when-the-repository-is-checked-out), so a `File.read` of a key file raises `Errno::ENOENT` in exactly the case `clone_during_dry_run true` exists to support.
:::

Credentials are never passed on a command line, and a `url` that embeds credentials (`https://user:password@host/…`) is rejected — use `user` and `password` instead.

A repository checked out from a `url` does not go through the project's Git remotes, so the [`git_remote.mountable`](/key-concepts/settings.md#git_remotemountable) setting does not apply to it. The [`git_remote.ssh`](/key-concepts/settings.md#git_remotesshconnect_timeout) settings do: a checkout over SSH is given the same connection timeout and keepalives as OpsChain's own fetches, so a Git server that stops responding fails the step rather than hanging it.

### Availability

Which of the project's Git remotes OpsChain will mirror into a step is controlled by the [`git_remote.mountable`](/key-concepts/settings.md#git_remotemountable) setting. By default every one of the project's active Git remotes is available, so `git_clone` works without any extra configuration.

The mirrors themselves are exposed to the step read-only — `git_clone` checks out from them, it never writes back to them.

OpsChain refreshes the mirrors of the available Git remotes immediately before creating the runner pod, then mounts them for the life of that pod. `branch :main` therefore resolves to whatever the mirror's tip of `main` was when the pod was created — a commit pushed to the remote while the change is running is not picked up, and neither is a Git remote added to the project after the pod started.

If that refresh fails, because the remote is unreachable for example, OpsChain records a `warn:git_remote:mountable_fetch_failed` [event](/key-concepts/events.md) and carries on rather than failing the change. The mirror the step checks out from may therefore be out of date, or missing altogether if the remote has never been fetched successfully.

### Idempotent checkouts

Checking out a repository is idempotent. If the target directory already holds a checkout at the commit the requested branch currently resolves to, OpsChain leaves it untouched. If the branch has moved on since, or a previous checkout was interrupted partway through, OpsChain checks it out again.

:::note
Two `git_clone` resources in the same step that target the same directory with different configuration (for example, different branches) raise a clear error, rather than one silently overwriting the other.
:::

### Current limitations

- Running on a multi-node Kubernetes cluster is not yet supported for this feature.

## OpsChain Kubernetes

Requiring `opschain-kubernetes` provides several resources for working with Kubernetes. These resources wrap the `kubectl` binary to allow you to perform some common Kubernetes operations.

### Prerequisites

The `kubectl` binary must be available in your runner environment and is not included by default. To install `kubectl`, a [custom Dockerfile](/key-concepts/step-runner.md#custom-step-runner-dockerfiles) must be included in your project's `.opschain` directory.

Below is an example Dockerfile RUN directive for adding `kubectl` to your runner.

```Dockerfile
...
# Run any Dockerfile commands that don't rely on the contents of the Git repository here to avoid rerunning them when the Git repo changes.
RUN curl -L -o /usr/local/bin/kubectl "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" && \
    chmod +x /usr/local/bin/kubectl
...
```

### Authentication

There are multiple options available to authenticate with the Kubernetes cluster that you want to manage.

#### In-cluster service account config

By default, the `opschain-kubernetes` resource will use the `opschain-runner` service account to manage Kubernetes resources in the same cluster that OpsChain runs. You will need to grant the `opschain-runner` additional permissions to manage resources in your desired namespace(s) via additional RoleBindings or ClusterRoleBindings. Managing roles & permissions in your cluster is outside the scope of this documentation. Please see the [Kubenetes RBAC documentation](https://kubernetes.io/docs/reference/access-authn-authz/rbac/) for more details.

#### Kubeconfig via OpsChain file properties

If you need to manage Kubernetes resources in another cluster, or don't want to use the `opschain-runner` service account as your identity, you can provide a custom [kubeconfig file](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/) that will be read by `kubectl`. To do this, add a kubeconfig file via OpsChain file properties with the path `/opt/opschain/.kube/config`. See the [OpsChain properties documentation](/key-concepts/properties.md#file-properties) for more information on adding file properties.

To use an alternative kubeconfig path set the [KUBECONFIG](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/#the-kubeconfig-environment-variable) environment variable via [OpsChain properties](/key-concepts/properties.md#environment-variables).

### Resource types

#### kubernetes_resource

The `kubernetes_resource` type provides a generic type with `apply` and `delete` actions for managing any valid Kubernetes resources via manifest files present in your project repository.

```ruby
kubernetes_resource :nginx do
  manifest_path 'k8s/nginx.yaml'
  namespace 'myapp'
end
# provides nginx:apply and nginx:delete actions
```

#### kubernetes_daemonset, kubernetes_deployment, kubernetes_statefulset

The `kubernetes_daemonset`, `kubernetes_deployment`, and `kubernetes_statefulset` resource types provide actions for performing `restart`, `scale`, and `wait` operations on the standard 'workload' resources running within a Kubernetes cluster.

All three of these resource types provide the same functionality, but are provided as separately named types to account for how the resources are addressed within Kubernetes.

```ruby
kubernetes_deployment :nginx do
  name 'nginx'
  namespace 'myapp'
  replicas 1
  wait_for_condition 'Available'
end
# provides nginx:restart, nginx:scale, and nginx:wait actions
```

### Utilities

#### Logs

The `kubernetes_daemonset`, `kubernetes_deployment`, and `kubernetes_statefulset` types also provide access to a `logs` method on their controller.

The `logs` method requires you to pass a `tail: <number of lines>` argument to specify the number of log lines you would like returned. If you would like to return all log lines for the lifespan of the pod, you can use `tail: -1`. **PLEASE NOTE** that if your workload is a particularly noisy logger, this may result in a large amount of logs being buffered into memory, so use this with caution.

```ruby
kubernetes_deployment :nginx do
  name 'nginx'
  namespace 'myapp'

  desc 'Wait until nginx deployment is available and show logs'
  action logs: ['nginx:wait'] do
    controller.logs(tail: 100).each do |line|
      OpsChain.logger.info line
    end
  end
end
```

By default, logs will return the logs for all containers in a pod, but you can also provide a `container: '<container name>'` argument to only return logs from a single container from within the pod.

```ruby
action :logs do
  logs = controller.logs(tail: 100, container: 'app')
  # do something with logs
end
```

## OpsChain SSH key pair

Requiring `opschain-ssh-key-pair` provides the `ssh_key_pair` resource type.

### Resource type properties - SSH key pair

The `ssh_key_pair` resource type accepts the following properties:

| Property      | Default value        | Description                                                                                                                                                                                                                                                                                                                                                                                                    |
|:--------------|:---------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `key_path`    | `/opt/opschain/.ssh` | The location to generate the SSH key pair. <br/>_Note: the default path is the `opschain` user's default SSH path._                                                                                                                                                                                                                                                                                            |
| `private_key` | `id_rsa`             | The file name of the private key to generate (if a DSA type key is generated, the private key file name will default to `id_dsa`).                                                                                                                                                                                                                                                                             |
| `public_key`  | `id_rsa.pub`         | The file name of the public key to generate (if a DSA type key is generated, the public key file name will default to `id_dsa.pub`).                                                                                                                                                                                                                                                                           |
| `type`        | `RSA`                | The type of key to generate. Valid values are: <br/> - `RSA` <br/> - `DSA`                                                                                                                                                                                                                                                                                                                                     |
| `bits`        | `4096`               | Determines the strength of the key in bits as an integer.                                                                                                                                                                                                                                                                                                                                                      |
| `store_in`    | `:environment`       | The OpsChain properties to store the generated key pair. Valid values are: <br/> - `:environment` the key pair will be stored in the OpsChain environment properties <br/> - `:project`  the key pair will be stored in the OpsChain project properties <br/> - `nil` the key pair will not be automatically stored in OpsChain properties (see notes on key storage in the [actions](#actions) section below) |
| `passphrase`  |                      | Optional passphrase to assign to the private key.                     |

### Actions - SSH key pair

The `ssh_key_pair` resource type provides the following actions:

| Action              | Description                                                                                                                                                                                                                                                                                  |
|:--------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `create`            | Creates an SSH public/private key pair inside the `key_path` folder with the filenames specified by `public_key`/`private_key` and optionally stores the files in OpsChain properties. <br/>_Note: If the `private_key` or `public_key` exists in the `key_path`, they will be overwritten_. |
| `create_if_missing` | Validates that the `private_key` and `public_key` exists in the `key_path`. If either is missing, generates a new key pair and optionally stores the key pair in the OpsChain properties.                                                                                                    |

:::note[Notes on key storage]
The SSH key pair will be generated inside the OpsChain step runner container. By default the key pair will be stored in the OpsChain environment properties, making them accessible to future changes run in this environment (and subsequent steps in the current change). If you wish to use the key pair in other environments within the project, set the `store_in` resource property to `:project`. The key pair will then be stored in the OpsChain project properties and available to all changes run in that project.

If you do not wish to store the key pair in the OpsChain properties, `store_in` can be set to `nil`. _Please note: If you do not store the generated keys in OpsChain properties, they will cease to exist when the step runner container is removed. For this reason, ensure the step stores the keys (e.g. in [Hashicorp Vault](https://www.vaultproject.io), as a [Kubernetes secret](https://kubernetes.io/docs/concepts/configuration/secret/), on another server, etc.) to allow them to be used in the future._
:::

## Examples

The [OpsChain AWS Ansible](https://github.com/LimePoint/opschain-examples-ansible), [OpsChain Confluent](https://github.com/LimePoint/opschain-examples-confluent) and [OpsChain WebLogic](https://github.com/LimePoint/opschain-examples-weblogic) example projects all make use of the `ssh_key_pair` resource type to generate SSH key pairs for their respective target containers.

## OpsChain Terraform

Requiring `opschain-terraform` provides the `terraform_config` resource type. The resource type will accept any of the [RubyTerraform](https://github.com/infrablocks/ruby_terraform/blob/v1.9.0/README.md) command arguments as properties, but will only pass those supported by the command when the action is invoked.

Please see the [RubyTerraform module documentation](https://infrablocks.github.io/ruby_terraform/RubyTerraform.html) for further information about the available actions and their parameters.

:::note
RubyTerraform supplies `vars` to Terraform on the command line via multiple `-var` parameters. OpsChain overrides this logic by placing the [input variables](https://www.terraform.io/docs/language/values/variables.html) in a [var file](https://www.terraform.io/docs/language/values/variables.html#variable-definitions-tfvars-files) and supplying this to Terraform via the `-var-file` parameter to avoid encountering any command line length issues.
:::

### Prerequisites

`opschain-terraform` does not include the Terraform binary. Customers wishing to use the resource type will need to install Terraform in their project's step runner. This can be done by using a [custom step runner Dockerfile](/key-concepts/step-runner.md#custom-step-runner-dockerfiles). An example of this can be found in the [OpsChain Confluent example](https://github.com/LimePoint/opschain-examples-confluent/blob/75473f7fbac4150b3d5c583dfc52c6b22044552f/.opschain/Dockerfile#L8).

### Automatic Terraform initialisation

The `terraform_config` resource type will automatically execute `terraform init` in the OpsChain runner prior to running any Terraform action.

### Automatic state storage

The `terraform_config` resource type will automatically store the `terraform.tfstate` file in the environment properties after running any Terraform action. This ensures that the file is available to subsequent steps in your change.

:::note
If the `state_out` property of Terraform is used, the resource type does not automatically store the file. Please use the [`store_file!` feature](/key-concepts/properties.md#storing--removing-files) (after moving the file to the desired location) to store the file.
:::

### Command argument defaults

Default values will be supplied for the following RubyTerraform command arguments:

| Argument     | Default value | Description                                                                                                                                                                |
|:-------------|:--------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| auto_approve | true          | Indicates that Terraform should not require interactive approval before applying a plan.                                                                                   |
| chdir        | `pwd`         | The root directory of your project Git repository within the OpsChain step runner.                                                                                         |
| input        | false         | Indicates that Terraform should not attempt to prompt for input, and instead expect all necessary values to be provided by either configuration files or the command line. |

:::tip
Resources can override these values if required.
:::

### Terraform automation environment variable

The Terraform `TF_IN_AUTOMATION` environment variable is automatically configured when running `terraform_config` actions. This will indicate to Terraform that there is some wrapping application executing terraform and cause it to make adjustments to its output to de-emphasize specific commands to run next. For further information see [controlling Terraform output in automation](https://learn.hashicorp.com/tutorials/terraform/automate-terraform#controlling-terraform-output-in-automation).

## Examples

The [OpsChain Terraform example project](https://github.com/LimePoint/opschain-examples-terraform) demonstrates how the OpsChain Terraform resource type can be used.

The [OpsChain AWS Ansible example project](https://github.com/LimePoint/opschain-examples-ansible) demonstrates how the OpsChain Infrastructure and OpsChain Terraform resource types can be combined with Ansible to deploy an nginx host on AWS.

The [OpsChain Confluent example project](https://github.com/LimePoint/opschain-examples-confluent) demonstrates how the OpsChain Infrastructure and OpsChain Terraform resource types can be used together.
