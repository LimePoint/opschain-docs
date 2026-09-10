---
sidebar_position: 2
description: Defining actions, resources and resource types in OpsChain.
---

# Actions reference

This guide covers the concept of actions within OpsChain, how to develop standalone and resource specific actions, how they integrate with the API server and options for utilising additional packages that are not in the standard OpsChain runner container.

After reading this guide you should understand:

- what an action is
- how to use the OpsChain logger
- how to define
  - actions
  - controllers
  - resource types
  - resources
  - resource actions
  - composite resource types and resources

## Defining standalone actions

Actions are defined in the `actions.rb` file in the root directory of a Git repository. If required, actions can also be defined in separate files and [required](https://www.rubydoc.info/stdlib/core/Kernel%3Arequire) into the `actions.rb`.

:::note
When your Git repository is used by an [asset template](/getting-started/familiarisation/gui/projects/asset_templates.md), the template's `actions.rb` is loaded from its named folder, and any property files placed in that same folder are loaded automatically - see [template folder properties](/key-concepts/properties.md#template-folder-properties).
:::

The `action` definition extends the Rake `task` definition, so standard [Rake features](https://ruby.github.io/rake/) can be used. In its simplest form, an action requires a name, and the instructions to perform when it is executed (between the `do` and `end` keywords). The term "block" will be used to describe these instructions throughout the OpsChain documentation.

```ruby
require 'opschain'

action :hello_world do
  log.info "hello world!"
end
```

In the example above, the action's name is `hello_world`, and the action's block instructs OpsChain to log "hello world" as an informational message using the [OpsChain Logger](#opschain-logger).

:::info
If you're running the script outside OpsChain, you must include a `require 'opschain'` line at the top of your `actions.rb` file and require it in your repository's `Gemfile` to allow you to use the features described in this reference guide. That is not needed if your code will run only as part of an OpsChain change, given the `opschain` gem is already included by default.
:::

### Change step naming

By default, the step running an action will use the action name as its name (e.g. `hello_world` in the example above). If you would like to provide a more user-friendly name for your action, the `step_name:` option can be used when defining the action, for example:

```ruby
action :hello_world, step_name: 'Hello world action' do
  log.info "hello world!"
end
```

In the example above, the action's name is `hello_world`, but the step name that will be displayed in the OpsChain GUI when the action is run will be "Hello world action".

Alternatively, you can declare the action directly with a human-readable name — including spaces and capitalisation. OpsChain slugifies the name into a valid task name (used when referencing the action, for example on the command line) while retaining the original as the step name displayed in the GUI:

```ruby
action 'Hello world action' do
  log.info "hello world!"
end
```

In the example above, the action is registered under the slugified task name `hello_world_action`, and "Hello world action" is used as the step name. [Prerequisite actions](#prerequisite-actions) can reference the friendly name too. Existing actions defined with a plain name continue to work unchanged.

Two rules apply to step names:

- **A step name must be unique within its namespace.** Defining two actions with the same step name is an error, reported when the template's actions are derived and naming both actions and where each was defined. Names are compared ignoring case, so `Install binaries` and `Install Binaries` count as the same name.
- **A step name occupies exactly one segment of a step's path.** A `/` in the name is replaced with `_` when the path is built, so a step named `Deploy A/B` appears in the step tree at `Deploy A_B` rather than as a step `B` nested under a step `A`. The name itself is displayed unchanged.

### GUI display

When your Git repository (and included `actions.rb`) are used by an [asset template](/getting-started/familiarisation/gui/projects/asset_templates.md) the actions that have a description will be displayed in the GUI. To add a description to an action, include the `description:` option when defining the action, for example:

```ruby
action :hello_world, description: 'An action that logs "hello world"' do
  log.info "hello world!"
end
```

A description can span multiple sentences; the full description is retained and carried through onto the steps of a change, not just the first sentence.

:::note
Actions without a description can still be run via the GUI however the user will need to specify the action manually in the run change dialog.
:::

### Extending an action

By default, OpsChain will raise an error when multiple actions with the same name are defined. You can disable this by setting the `ignore_defined` kwarg to `true` when defining the action, for example:

```ruby
action :hello_world do
  log.info "This is the first hello world action"
end

action :hello_world, ignore_defined: true do
  log.info "This is the second hello world action"
end
```

In the example above, both actions will be defined and the second action will extend the first one. Running the `hello_world` action will output:

```text
This is the first hello world action
This is the second hello world action
```

An extension cannot change the action's [step name](#change-step-naming). Supplying a `step_name:` that differs from the one the action was defined with is an error, and `ignore_defined` does not waive the rule that a step name must be unique within its namespace.

### Ignoring an action failure

Whenever an action raises an unhandled exception, the step (and subsequently the change) status will be set to `error`. You can ignore an action failure by setting the `ignore_failure` option to `true` when defining the action, for example:

```ruby
action :hello_world, ignore_failure: true do
  raise "This action will always fail"
end
```

In the example above, the action will fail, but the change will continue normally and the step will be marked as `success`.

### Reloading `actions.rb` for a step

OpsChain reads a change's `actions.rb` once and reuses it for every step of the change, so code at the top level of the file is evaluated before the first step runs and keeps that value for the rest of the change — see [`runner.reuse_actions_rb`](/key-concepts/settings.md#runnerreuse_actions_rb). An action whose top level reads something a previous step produced, such as a property it set or a file it wrote, therefore sees the state as it was when the change started.

Setting the `reload_actions` option to `true` when defining an action makes that step read `actions.rb` again before it runs, so the top level of the file is evaluated with the current state, for example:

```ruby
hosts = OpsChain.properties.dig('inventory', 'hosts') || []

action :discover_hosts do
  # store the hosts that were discovered in the change's properties
end

action :configure_hosts, reload_actions: true do
  log.info "Configuring #{hosts.size} hosts"
end
```

In the example above `configure_hosts` sees the hosts `discover_hosts` stored. Without `reload_actions` it would see the hosts as they were before the change started.

Only the step the option is set on reads the file again — every other step of the change continues to use the copy loaded at the start. The option is not inherited, so mark each action that needs it, including child steps of an action that is already marked.

Reloading is not free. The step evaluates the whole of `actions.rb` before it starts, which is noticeable for a repository with a large file or expensive top-level code, so set the option only on the actions that need it.

:::note

The option makes no difference where a step already reads `actions.rb` for itself — a change running each step in its own container, via [`pod_per_change_step`](/key-concepts/settings.md#pod_per_change_step), or an instance with [`runner.reuse_actions_rb`](/key-concepts/settings.md#runnerreuse_actions_rb) set to `false`.

A controller action is marked with the [`desc`](#describing-a-controller-action) declaration above the method in a [base controller](#the-base-controller), through its [`available_actions`](#available-actions) entry — where the resource type declares the controller, or where a resource re-declares its available actions — or with the [`reload_actions`](#reloading-actionsrb-for-a-controller-action-on-a-resource) DSL method in the resource definition. Where a resource re-declares its available actions, that list is what applies: an entry that omits `reload_actions` leaves the action unmarked, as it does for `ignore_failure` and `step_name`.

The actions OpsChain generates for you — the [step wrappers](#step-wrapper) and [MintModel actions](#running-mintmodel-actions-as-child-steps) — cannot be marked this way.

:::

## Sequencing actions

In addition to the action name, OpsChain's DSL allows you to specify [prerequisite actions](#prerequisite-actions) (to run before the action's block) and [child steps](#child-steps) (to run after the action's block). In this way you can describe a sequence of actions to perform.

### Referencing actions by name or step name

Wherever an action is referenced — in an action's `steps:` list, in its [prerequisites](#prerequisite-actions), as the action passed to `opschain-action`, or as the action a change runs — it can be named by its action name or its [step name](#change-step-naming). OpsChain resolves the reference to the real action name: an exact match is tried first, then a case-insensitive match against every action's name and step name.

:::note
A reference that matches more than one action is rejected with an ambiguity error. Two actions cannot share a [step name](#change-step-naming), but an action's own name can still collide with another action's step name — OpsChain warns about such a pair when it loads your actions, and rejects the reference if you write it.
:::

A child step that matches no action is treated as a [MintModel action](#running-mintmodel-actions-as-child-steps). A prerequisite cannot be satisfied by a MintModel action, so a prerequisite that matches nothing is reported as an error while your actions are loaded.

Every other place an action is named is matched the same way, so the capitalisation you use is never significant. This includes [`skip_steps`](/key-concepts/changes.md#skipping-steps) patterns and [`starting_step`](/key-concepts/changes.md#starting-a-change-partway-through), the rule that allows only one change with a given action name to run at a time for a project, environment or asset (see [change execution options](/key-concepts/changes.md#change-execution-options)), [event filter](/operations/notifications.md#subscribing-to-events) rules that match on an action or step name, and [authorisation rules](/getting-started/familiarisation/gui/manage_security.md#resource-paths) whose resource path targets an action.

:::note
Sibling steps whose names differ only by capitalisation are treated as colliding, and are given distinct step paths in the same way as exact duplicates. Child steps named `stop`, `STOP` and `Stop` under a `provision` step become `provision/stop`, `provision/STOP-1` and `provision/Stop-2` — each keeps the capitalisation it was defined with.
:::

### Prerequisite actions

Prerequisite actions will run in the same [step runner](/key-concepts/step-runner.md) as the requested action. These behave like standard [Rake prerequisites](https://ruby.github.io/rake/doc/rakefile_rdoc.html#label-Tasks+with+Prerequisites).

```ruby
action go_to_work: ['wake_up', 'get_dressed'] do
  # this optional block will run after get_dressed
end

action :wake_up do
  # this block will run before get_dressed
end

action :get_dressed do
  # this block will run after wake_up
end
```

In the example above, all actions would run in the same [step runner](/key-concepts/step-runner.md), in this order:

1. `wake_up`
2. `get_dressed`
3. `go_to_work`

#### Combining actions on a single step runner

As noted in the prerequisite actions example above, an action with prerequisites (or [child steps](#child-steps)) need not include a block and can be specified as:

```ruby
action holiday: ['wake_up', 'get_dressed']
```

Running the `holiday` action will execute the `wake_up` and `get_dressed` actions in a single [step runner](/key-concepts/step-runner.md).

Grouping actions on a single step runner comes with some advantages and disadvantages:

##### Advantages

1. Improved performance - as there is an overhead to building and launching each [step runner](/key-concepts/step-runner.md), grouping actions can improve overall change performance
2. De-isolation - passing data between actions running in their own [step runners](/key-concepts/step-runner.md) requires you to store the data in OpsChain's [properties](/key-concepts/properties.md) (or in a data store accessible to both runners). Grouping actions on a single [step runner](/key-concepts/step-runner.md) means the actions have access to the same file system and memory. This removes the need to store sensitive (or single use) information in [properties](/key-concepts/properties.md)

##### Disadvantages

1. Execution visibility - prerequisite steps are not displayed in OpsChain's change step tree. This reduces the visibility of their start and stop times, making it harder to follow the change's progress. Similarly, when viewing the change logs, there is no separator in the logs between each prerequisite action's log messages nor with the grouping action's log messages (if any)
2. De-isolation - While it can be an advantage (as described above), care must be taken when deciding to combine actions on a single [step runner](/key-concepts/step-runner.md). The modifications to the file system or memory that one action makes may have unintended effects if subsequent actions have been designed with an expectation that they will run in a "clean" [step runner](/key-concepts/step-runner.md)

### Running other actions within another action

OpsChain actions can also be run from within an another action via OpsChain's `run_action` method (`OpsChain.run_action`). This can be useful for running actions conditionally.

```ruby
action :go_to_work do
  OpsChain.run_action(:get_dressed) unless OpsChain.properties.dressed_already
end

action :get_dressed do
  # this block is run from the go_to_work action
end
```

:::info

This will run the action in same step as the current step. See [here](#combining-actions-on-a-single-step-runner) for more details about the trade-offs involved.

See [dynamic child steps](#dynamic-child-steps) for an alternative approach for conditionally running actions, but in separate steps (and hence will be shown separately in the GUI).

:::

### Child steps

An action definition can include a list of other actions to run as child `steps`. After the parent's block has completed, these child steps will be added to the queue of actions to run. When an OpsChain worker becomes available, it will build and launch a [step runner](/key-concepts/step-runner.md) to run the next action in the queue.

The `steps:` argument accepts:

1. A single action name - e.g. `steps: 'the_next_step'`
2. A list of actions - e.g. `steps: ['first_child', 'second_child']`
3. A Ruby method/proc that returns a single or list of actions - e.g. `steps: generate_step_list`

Actions can be specified as strings or Ruby symbols.

```ruby
action :do_something, steps: ['do_something_after', :do_something_else_after] do
  # this will run before steps
end

action :do_something_after do
  # runs after do_something and before do_something_else_after
end

action :do_something_else_after do
  # runs after do_something_after
end
```

In the example above each action will run in its own [step runner](/key-concepts/step-runner.md), in this order:

1. `do_something`
2. `do_something_after`
3. `do_something_else_after`

#### Dynamic child steps

OpsChain allows you to dynamically alter a parent's child steps from within the action's block.

:::note[NOTES]

- the `append_child_steps` and `replace_child_steps` methods accept any value that can be supplied via the `steps:` argument when defining an action (see the valid argument values under [child steps](#child-steps))

:::

A step added this way is shown in the change's step tree with the same detail as one declared up front — its [step name](#change-step-naming), description, [prerequisites](#prerequisite-actions) and, for a [wait step](#wait-steps) or an [input step](#input-steps), the arguments it asks the user for.

##### Append child steps

The `append_child_steps` method allows you to append additional children into the queue of steps the OpsChain workers will process. E.g.

```ruby
action :do_something, steps: 'do_something_after' do
  if Time.now.strftime("%a") == 'Tue'
    OpsChain.append_child_steps('do_something_on_tuesdays')
  end
end

action :do_something_after do
  # runs after do_something
end

action :do_something_on_tuesdays do
  # runs after do_something_after - on Tuesdays
  log.info "It's Tuesday!"
end
```

In the example above actions would run in this order:

1. `do_something`
2. `do_something_after`
3. `do_something_on_tuesdays` (if the change is run on a Tuesday)

##### Replace child steps

If you wish to replace the list of child steps, it can be overwritten by assigning the new value(s) to `OpsChain.child_steps`. E.g.

```ruby
action :replace_child_steps, steps: ['do_something_after', 'do_something_else'] do
  OpsChain.child_steps = ['do_a_different_thing', 'do_another_thing']
end
```

In the example above actions would run in this order:

1. `replace_child_steps`
2. `do_a_different_thing`
3. `do_another_thing`

:::caution
Care must be taken when directly modifying the `child_steps` value, as this will override all standard OpsChain step handling functionality for the current step runner and may have unintended consequences.
:::

##### Accessing child steps

OpsChain stores the list of actions to run in child steps as a [Set](https://ruby-doc.org/stdlib/libdoc/set/rdoc/Set.html). It is available from within your action blocks via `OpsChain.child_steps`. E.g.

```ruby
action check_for_child_step: ['prereq_with_conditional_step'] do
  if OpsChain.child_steps.include?('conditional_step')
    log.info '"prereq_with_conditional_step" added "conditional_step" to the child steps'
  end
end
```

In the example above, `check_for_child_step` will log an informational message if the `prereq_with_conditional_step` prerequisite has added the `conditional_step` action into the child steps of `check_for_child_step`

:::caution
Modifying the child steps list via any method other than the append and replace methods described above is not supported.
:::

### Running MintModel actions as child steps

An `actions.rb` can also invoke steps defined in the asset's MintModel by adding them as child steps. The MintModel action path is the action name for top-level steps (e.g. `Binaries`), or for a nested step, the path includes each parent action name separated by `/` (e.g. `Binaries/Install Software Binaries/Install Binaries/Install jdk Binaries`). The easiest way to find this value is from the asset's `actions` tab in the GUI — copy it from the `Run or schedule a change` dialogue.

The example below shows how the `Binaries` step from a MintModel could be run as part of an `actions.rb` change.

```ruby
action :infra_provision do
  ...
end
action full_provision: ['infra_provision', 'Binaries']
```

The following example uses a nested MintModel step path instead:

```ruby
action :infra_provision do
  ...
end
action provision_jdk: ['infra_provision', 'Binaries/Install Software Binaries/Install Binaries/Install jdk Binaries']
```

:::note
When a step name contains `/`, OpsChain resolves it by full path rather than by name. This ensures a nested MintModel action is correctly targeted even when a wrapper step (such as one created by `OpsChain.step` or `OpsChain.ignore_failure_step`) has the same name. A `/` written in a [step name](#change-step-naming) rather than a path is not a separator — it occupies a single segment, with the `/` replaced by `_`.
:::

### Name collisions between `actions.rb` and MintModel actions

An asset's available actions combine the actions defined in its `actions.rb` with the actions from its MintModel. If an `actions.rb` action has the same name as a MintModel action at the same position in the tree, the `actions.rb` action takes precedence — it is the action listed for the asset (or the child step, if nested), and the action that runs when a change reaches that name. The MintModel action of the same name is not listed or run separately.

This precedence applies **at any depth**, not just to top-level actions: a nested `actions.rb` action (one reached via another action's [child steps](#child-steps)) takes precedence over a same-named MintModel action just as a top-level one does. It also holds when the colliding action is a change's root step, including when [starting a change partway through](/key-concepts/changes.md#starting-a-change-partway-through) at a nested override.

:::note
Collisions are matched case-insensitively, the same as [referencing an action](#referencing-actions-by-name-or-step-name): `Binaries` and `binaries` collide with each other just as an exact match would, and the `actions.rb` action still wins.
:::

:::note
This precedence only applies to a real, locally-defined `actions.rb` action. Directly [running a MintModel action as a child step](#running-mintmodel-actions-as-child-steps) — a `steps:` entry that names a MintModel path rather than another action defined in `actions.rb` — is not a name collision, so it is unaffected: the MintModel step still runs, exactly as documented above.
:::

### Reading an asset's MintModel actions

`mintmodel_actions` returns the actions the asset's MintModel contributes, so an `actions.rb` can build its step tree from what the MintModel actually contains rather than naming a single MintModel path and leaving OpsChain to graft the subtree in.

It returns an array of hashes, one per top-level MintModel action, in the same shape the asset's [actions endpoint](pathname:///api-docs/#tag/Actions) serves. The keys an `actions.rb` is likely to want are:

| Key | Description |
|---|---|
| `:action` | The action name, as it appears in the asset's action list. |
| `:step_name` | The name the step is given in a change, where the MintModel sets one. |
| `:description` | The action's description, where the MintModel supplies one. |
| `:full_path` | The action's path from the root of the MintModel, with each parent action name separated by `/`. This is the value to use when [running a MintModel action as a child step](#running-mintmodel-actions-as-child-steps). |
| `:children` | The action's child actions, each with the same keys. |
| `:child_execution_strategy` | `sequential` or `parallel`. |
| `:mintpress_ctl_cmdline` | The MintPress command line the action runs, for an action that runs one. |

The example below defines an action that runs every top-level MintModel action in the order the MintModel lists them, and one that runs only those that drive MintPress:

```ruby
action provision_all: mintmodel_actions.map { |mintmodel_action| mintmodel_action[:full_path] }

action provision_mintpress: mintmodel_actions.select { |mintmodel_action| mintmodel_action[:mintpress_ctl_cmdline] }
                                             .map { |mintmodel_action| mintmodel_action[:full_path] }
```

Refer to a MintModel action by its `:full_path` rather than by its `:action`, so a nested action is targeted unambiguously. Naming your own action after a MintModel one takes precedence over it instead of running it — see [name collisions between `actions.rb` and MintModel actions](#name-collisions-between-actionsrb-and-mintmodel-actions).

The keyword is available at the top level of your `actions.rb`, in a [resource definition](#the-opschain-keywords-in-a-resource-definition) and in a [controller](#the-opschain-keywords-in-a-controller). `OpsChain.mintmodel_actions` reaches it as well.

An asset with no MintModel gets an empty array, as does a project, an environment or an agent — so a shared `actions.rb` can call the keyword across a template's assets whether or not each one has a MintModel.

While a change runs, the catalog is the one pinned to the change when it was created, so every step of the change sees the set its step tree was built from.

:::note
An `actions.rb` that calls `mintmodel_actions` builds actions OpsChain cannot reconstruct from the template's actions plus the current MintModel. Its generated actions are therefore not reused by another asset assigned the same template version at the same commit — those actions are derived again for each asset.
:::

If the MintModel's actions cannot be determined while an asset's actions are being generated — its MintModel has not been concretised, or concretising it failed — the generation continues with an empty catalog and a [`warn:mintmodel:actions_unavailable`](/key-concepts/events.md#mintmodel) event records why, so an `actions.rb` that saw nothing can be told apart from one that asked for nothing.

### Child execution strategy

The action definition includes an optional `run_as:` parameter. By default, it is set to `sequential`, meaning the action's child steps will run sequentially across the OpsChain workers.

:::info
Only `sequential` and `parallel` (as strings or Ruby symbols) are valid values for the `run_as:` parameter.
:::

#### Parallel child step execution

To run child steps in parallel, include the `run_as: :parallel` option in your action definition.

```ruby
action :do_something, steps: ['do_something_after', 'do_something_else_after'], run_as: :parallel do
  # this will run before steps
end

action :do_something_after do
  # runs after do_something
end

action :do_something_else_after do
  # runs at the same time as do_something_after (providing there is a free worker)
end
```

In the example above actions would run in this order:

1. `do_something`
2. `do_something_after` and `do_something_else_after`

:::note[NOTES]

- Parallel task execution is limited by the number of available OpsChain workers
- Care must be taken when modifying properties from within parallel steps. See the [changing properties in parallel steps](/key-concepts/properties.md#changing-properties-in-concurrent-steps) section of the [OpsChain properties guide](/key-concepts/properties.md) for more information

:::

#### Mixing parallel and sequential child steps

An action's `run_as:` applies to all of its direct child steps, so a single action cannot by itself run some children in parallel and others sequentially. To mix strategies within one action, nest a group of steps using `OpsChain.steps`:

```ruby
action :deploy, steps: [
  'prepare',
  OpsChain.steps(['deploy_app_1', 'deploy_app_2'], run_as: :parallel, step_name: 'Deploy apps'),
  'verify',
] do
  # this runs before the child steps
end
```

`OpsChain.steps(steps, run_as:, step_name:)` defines a group carrying its own execution strategy and returns its name for embedding in a `steps:` list. Because each group carries its own `run_as:`, independent of its parent and siblings, the example above runs `prepare`, then `deploy_app_1` and `deploy_app_2` in parallel, then `verify` — a sequential sequence with a parallel group nested inside it.

The group is shown in the step tree as a single step, labelled by `step_name:` when given, or `Parallel children` / `Sequential children` otherwise.

#### Modifying the child execution strategy

When using [dynamic child steps](#dynamic-child-steps), it may be necessary to override the child step execution strategy. This is performed by assigning the new value to OpsChain's `child_execution_strategy` property.

:::info
The override value will be used as the execution strategy for all child steps of the action.
:::

```ruby
action :conditional_strategy, steps: ['do_something_after', 'do_something_else_after'], run_as: :parallel do
  if some_condition
    OpsChain.append_child_steps('do_the_final_thing')
    OpsChain.child_execution_strategy = :sequential
  end
end
```

In the example above, `conditional_strategy` has two possible outcomes:

1. If "some_condition" is true, the `do_the_final_thing` action will be added to the child steps of `do_something`. As this action performs the "final thing", we want it to run after `do_something_after` and `do_something_else_after` have completed. To do this, the child execution strategy for `do_something` is altered to run all of its children sequentially and the actions would run in this order:
    1. `conditional_strategy`
    2. `do_something_after`
    3. `do_something_else_after`
    4. `do_another_thing`
2. If "some_condition" is false, the actions would run in this order:
    1. `conditional_strategy`
    2. `do_something_after` and `do_something_else_after`

#### Accessing child execution strategy

The strategy that will be used to run the current action's child steps is available via `OpsChain.child_execution_strategy`.

```ruby
action check_strategy: ['conditional_strategy'], steps: ['child1', 'child2'], run_as: :parallel do
  if OpsChain.child_execution_strategy == :sequential
    log.info "conditional_strategy changed the strategy to sequential"
  end
end
```

In the example above, `check_strategy` executes `conditional_strategy` (from the [modifying the child execution strategy](#modifying-the-child-execution-strategy) example) as a prerequisite. Using `OpsChain.child_execution_strategy`, `check_strategy` can detect if `conditional_strategy` altered the child execution strategy from `parallel` to `sequential`.

### Ignoring child step failure

By default, if any child step fails, the parent step will also be marked as failed. To ignore a child step failure, the `ignore_failure` option can be set to `true` when defining the child action, for example:

```ruby
action :destroy_vms, steps: ['destroy_vm1', 'destroy_vm2', 'destroy_vm3'], run_as: :parallel, ignore_failure: true
```

In the example above, the `destroy_vm` children have been written such that they will error if they cannot find the vm to destroy. As this is a "non-error", as our goal was to remove the vm anyway, setting `ignore_failure: true` on the `destroy_vms` parent means it will be marked as successful regardless of the state of the child steps.

:::note
With `ignore_failure` set to `true`, and `run_as` set to `parallel`, all child steps will be performed regardless of their success or failure. If `run-as` was set to `sequential` (or not specified), then the child steps will abort at the failing step and the `destroy_vms` parent will be marked as success.
:::

## Wait steps

An OpsChain wait step can be used to make an OpsChain change pause at a step and wait for a user to continue the change.

This can be useful to allow for manual verification after some steps have completed, but before subsequent steps start. It also allows a user to undertake manual activities as part of a change - for example steps that can't be automated.

An OpsChain wait step can only be added as part of a step's child steps, for example:

```ruby
action :do_something, steps: [:do_something_before_waiting, OpsChain.wait_step, :do_something_else_after_waiting]
```

Another useful scenario for wait steps is when a [scheduled change](/getting-started/familiarisation/gui/scheduled_activities.md) is used to create a change automatically, but a team member should then allow the change to proceed manually. To achieve this the OpsChain wait step can be used as the first child step of an action:

```ruby
action :do_something, steps: [:do_something_after] do
  # this will run before steps
end

action :do_something_with_acknowledgement, steps: [OpsChain.wait_step, :do_something]
```

:::info
All the sibling steps of a wait step will run immediately when using `run_as: :parallel` - the change will not continue on subsequently until it is manually continued. See the [troubleshooting guide](/troubleshooting.md#opschain-change---parallel-steps-run-before-wait-step) for more info.
:::

:::caution
OpsChain wait steps use the naming convention `opschain_wait_step_{{unique id}}` - do not use this naming convention in your steps unless you intend to create an OpsChain wait step.
:::

### Step continuation auditing

Information about step continuation can be viewed by using the [events endpoint](/key-concepts/events.md). The continue action will be recorded with the type `audit:steps:continue` (these can be fetched via the API by requesting `api/events?filter[type_eq]=audit:steps:continue`). The username of the user who continued the step is available in the API response.

Please [let us know](mailto:opschain-support@limepoint.com) if you would like to suggest improvements in this area.

### Timed wait steps

OpsChain wait steps can be created with a specified duration, for example:

```ruby
action :do_something, steps: [:do_something_before_waiting, OpsChain.wait_step(seconds: 90), :do_something_else_after_waiting]
```

In this example, the step will sleep for 90 seconds before automatically continuing to the next step. The sleep is executed like any other action's code block and so may pause the change for longer than the 90seconds while it waits for an image build (in `pod_per_step` mode) and a worker to become available.

### User-friendly naming

The default action name for a wait step (e.g. `opschain_wait_step_1`) does not provide the user with any information of why the change is waiting and whether it might be safe to continue it. To make it easier for users to understand the reason for the wait and whether they can continue the change, a custom name can be supplied when creating the wait step, for example:

```ruby
action :do_something, steps: [:do_something_before_waiting, OpsChain.wait_step(step_name: 'Wait for network team'), :do_something_else_after_waiting]
```

This will add a step with the name `Wait for network team` into the change's step tree, making it easier for users to understand why the change is waiting and whether they can continue it.

:::note
The `step_name` argument can also be included when creating timed wait steps, for example: `OpsChain.wait_step(seconds: 90, step_name: 'Wait for server restart')`
:::

### Automatically continuing wait steps

A change can be configured to continue its wait steps automatically, rather than pausing for a user. This is useful when you want the structure of a wait step in a change (for example so it can optionally be paused), but do not always need manual intervention.

When a change is created with this option enabled, a wait step continues automatically only when:

- it does not require approval, and
- every required input argument has a value — a `default_value`, or one [supplied with the change](#answering-input-arguments-when-starting-a-change). An optional argument that nobody answered does not hold the step up.

Wait steps that require approval, or that are still missing a required value, pause and wait for a user. Each automatically continued step is recorded in the change's audit history.

Where a step was eligible but could not be continued — a required argument with no value, a value that could not be applied to the change's properties, or a refused transition — the reason is written to the change log immediately above the line reporting that the step is waiting.

The option can be set when running, scheduling, or repeating a change from the GUI — see the [run change dialog](/getting-started/familiarisation/gui/activity.md#run-change).

### Nesting child steps under a wait step

A wait step can be given its own child steps via the `steps:` option, rather than being used only as a sibling within an outer action's `steps:` list. Steps nested this way do not start until the wait step itself is continued or approved — if the wait step is rejected, times out, or errors, they never run.

```ruby
action :destroy, steps: [
  OpsChain.wait_step(step_name: 'Confirm destroy', steps: ['Shutdown']),
  'infra_destroy'
]
```

In this example, the change pauses at the "Confirm destroy" wait step; `Shutdown` only starts once it is continued, and `infra_destroy` runs after `Shutdown` completes as before.

`OpsChain.wait_step` also accepts `ignore_failure:` alongside `steps:` — as with [`OpsChain.step`](#step-wrapper), this means a nested child step's failure does not prevent the wait step itself from being marked successful.

## Input steps

An OpsChain input step can be used to pause an OpsChain change and wait for a user to provide input before continuing the change. As part of defining the input step, you must include the arguments you expect from the user. e.g.

```ruby
action :do_something,
  steps: [
    :do_something_before_input,
    OpsChain.input_step(
      step_name: 'Server details',
      input_arguments: [
        :comments,
        server_name: { path: '/database/server', gui_name: 'Server name', description: 'Name of the server to restart' },
        patch_number: { path: '/patches', gui_name: 'Patch number', description: 'Optional patch to apply before restart', required: false },
        restart_after_hours: { path: '/restart_after_hours', gui_name: 'Restart after hours', required: true, type: :boolean, default_value: true }
      ]
    ),
    :do_something_with_input
  ]
```

In the example above, the `do_something` action has an input step as a child step. When the change runs and reaches the input step, it will pause and display a form to the user with the fields "Comments", "Server name", "Patch number" and "Restart after hours". The user must fill in the required fields and can optionally fill in the patch number field before submitting the form to continue the change.

### Argument options

Each input argument can accept the following options:

| Parameter       | Description                                                                                                                                                                                                                                                                             | Default                                                                  |
|-----------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------|
| `default_value` | The default value to be displayed to the user for the input argument. It is converted to the argument's `type` and, if `valid_values` are supplied, it must be one of them. It is replaced by a value [supplied when the change is started](#answering-input-arguments-when-starting-a-change).                                                                                                             | nil                                                                      |
| `description`   | A description to be displayed to the user for the input argument.                                                                                                                                                                                                                       | nil                                                                      |
| `gui_name`      | The name to be displayed to the user for the input argument.                                                                                                                                                                                                                            | The argument's name in title case (e.g. "Server name" for `server_name`) |
| `overwrite`     | Whether the value provided by the user may replace a value already configured on the project, environment, asset or template version at the specified `path`. Left `false`, the user can still supply the value that is already stored — only a value that would *change* it is rejected — and can always replace a value [supplied when the change was started](#answering-input-arguments-when-starting-a-change).                                                                                                                                  | false                                                                    |
| `path`          | The path in the change override properties that the value will be nested under, by the argument's name. E.g. in the example above, if the user supplied 'db1' for the `server_name` argument, OpsChain will update the change override properties to include `{ database: { server: { server_name: 'db1' } } }`. | `/` (the root path)                                                      |
| `required`      | Whether the user must provide a value for the input argument before they can submit the form to continue the change. Only required arguments hold up a step that is [continuing automatically](#automatically-continuing-wait-steps).                                                                                                                                                                    | true                                                                     |
| `type`          | The data type of the input argument. Available options are :boolean, :date, :float, :integer, :string, :array, :hash.                                                                                                                                                                   | `:string`                                                                |
| `valid_values`  | The list of values the user can select from for the input argument, displayed as a list of choices rather than a free text field. Only available for the :boolean, :date, :float, :integer and :string types.                                                                           | nil                                                                      |

The input arguments must be supplied as an array. Each element of the array is either an argument name, or a hash of argument names and their options. In the example above, the `comments` argument assumes default values for the various parameters. e.g.

```ruby
comments: { default_value: nil, description: nil, gui_name: 'Comments', overwrite: false, path: '/', required: true, type: :string }
```

The remaining arguments in the example override these defaults as needed. For example the `restart_after_hours` argument will require a boolean response from the user rather than a string.

Arguments are free to share a `path` — each value is nested under it by the argument's own name, so nothing is overwritten. What must be unique is the argument name, and a name cannot contain a `/`. Both are reported as an error while your actions are loaded, naming the offending argument and the `actions.rb` line the input arguments were declared on.

### Restricting the values a user can supply

Supplying `valid_values` for an input argument limits the user to a fixed set of values. Rather than being able to type any value, the user selects one of the values you have listed. e.g.

```ruby
action :deploy,
  steps: [
    OpsChain.input_step(
      step_name: 'Deployment options',
      input_arguments: [
        target: { path: '/deploy', gui_name: 'Target environment', valid_values: %w[development test production], default_value: 'test' },
        replicas: { path: '/deploy', type: :integer, valid_values: [1, 2, 4, 8] },
        cutover_date: { path: '/deploy', type: :date, valid_values: ['2026-06-30', '2026-09-30'], required: false }
      ]
    ),
    :deploy_application
  ]
```

Valid values:

- must be supplied as a non empty array
- can only be supplied for the `:boolean`, `:date`, `:float`, `:integer` and `:string` types — the `:array` and `:hash` types do not support them
- are converted to the argument's `type`, with any duplicates removed — e.g. `valid_values: ['1', 1, 2]` for an `:integer` argument becomes `[1, 2]`
- must include the argument's `default_value`, if one is supplied

### Input argument value conversion

The `default_value` and `valid_values` you supply do not need to be written in the argument's `type` — OpsChain converts them when it loads your `actions.rb`. e.g. an `:integer` argument with `default_value: '10'` presents a default of `10`, and a `:boolean` argument with `default_value: 'yes'` presents a default of `true`.

Values that cannot be converted without losing information are rejected as the actions are loaded, allowing you to find the problem before the change reaches the input step. e.g. `default_value: 1.5` for an `:integer` argument, or `valid_values: %w[yes no maybe]` for a `:boolean` argument, will report an error identifying the argument and the offending value.

### Answering input arguments when starting a change

An input step's arguments can be answered when the change is created, rather than only once the change has stopped at the step. Supply each value in the change's property overrides at the `path` the argument writes to, under the argument's own name. When the step starts waiting, the value found there becomes that argument's `default_value`, so the form the step presents to the user opens with it already filled in.

For the `server_name` argument in the [example above](#input-steps), whose `path` is `/database/server`, the value belongs at `/database/server/server_name`:

```json
{ "database": { "server": { "server_name": "db1" } } }
```

Answering every required argument this way, and creating the change with [automatic continuation of wait steps](#automatically-continuing-wait-steps) enabled, lets a change run through its input steps without stopping.

A value supplied this way is converted to the argument's `type`, the same as a `default_value` declared in your `actions.rb`. A value that cannot be converted leaves the argument with no default at all — the declared default is not used in its place — so the step stops rather than continuing with a value the user did not ask for, and the reason is written to the change log.

Each rejected value is reported against its own argument as well, naming the argument, its type and the path the value was read from, so you can tell which of a step's arguments was refused.

:::note
An argument's `valid_values` are not checked when the change is started. A step earlier in the change can rewrite them before the input step is reached, so the list in force at the step is not necessarily the one recorded when the actions were loaded — a value is checked against the list the step itself presents. The GUI's **Input step arguments** panel offers `valid_values` as suggestions rather than a closed list for the same reason. A `:boolean` argument, whose list cannot change, keeps its picker.
:::

An input step is allowed to replace a value the change itself supplied, whatever the argument's `overwrite` setting says. `overwrite` governs the properties configured on the project, environment, asset or template version; a value the user put in the change's own overrides is their input for this run, and the step that asks for it can change it.

The change's property overrides are not the only way an argument gets a value. An input step earlier in the same change writes its answers to those same properties, so it can answer a later step's argument. Retrying a change carries the overrides across, including the answers its input steps merged in, so the retried change continues those steps on the answers already given rather than asking for them again.

In the GUI, the run change dialog's **Input step arguments** panel lists the arguments of every input step in the chosen action and writes the answers into the change's property overrides for you — see [answering input steps up front](/getting-started/familiarisation/gui/activity.md#answering-input-steps-up-front).

### Nesting child steps under an input step

Like [wait steps](#nesting-child-steps-under-a-wait-step), an input step can be given its own child steps via the `steps:` option. Nested steps do not start until the input step is submitted — they never run if the input step is rejected, times out, or errors while still waiting.

```ruby
action :do_something, steps: [
  OpsChain.input_step(
    step_name: 'Server details',
    input_arguments: [:server_name],
    steps: ['do_something_with_input']
  )
]
```

`OpsChain.input_step` also accepts `ignore_failure:` alongside `steps:`, with the same semantics as [`OpsChain.step`](#step-wrapper).

## Ignore failure steps

`OpsChain.ignore_failure_step` is designed for [MintModel actions used as child steps](#running-mintmodel-actions-as-child-steps). MintModel step definitions cannot set `ignore_failure: true` directly, so this helper creates a thin wrapper action around the named step with `ignore_failure: true` applied, allowing the change to continue even if the MintModel step fails.

```ruby
action :destroy, steps: [
  OpsChain.ignore_failure_step('Shutdown'),
  'infra_destroy'
]
```

In this example `Shutdown` will run, but if it raises an error the change continues to completion rather than being marked as failed.

## Step wrapper

`OpsChain.step` is a convenience helper that combines wait, input, and ignore failure behaviours around an existing action in a single call. It takes the name of an existing action and one or more options:

| Option             | Default | Description                                                                                                                                                                                                |
|--------------------|---------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `ignore_failure:`  | `false` | If `true`, the change will continue even if the wrapped action fails.                                                                                                                                      |
| `wait:`            | `false` | If `true`, the wrapped action becomes a **child** of a new wait step — the change pauses for manual continuation before the wrapped action starts. Pass an integer to sleep for that many seconds instead. |
| `input_arguments:` | `nil`   | The wrapped action becomes a **child** of a new input step — the change pauses and prompts the user for input before the wrapped action starts. Mutually exclusive with `wait:`.                           |
| `step_name:`       | `nil`   | A custom display name for the resulting step — the wait/input step when `wait:`/`input_arguments:` is used, or the wrapper step otherwise.                                                                 |
| `wait_step_name:`  | `nil`   | A custom display name for the wait or input step specifically. Only relevant alongside `wait:`/`input_arguments:`; takes precedence over `step_name:` if both are given.                                   |

```ruby
action :destroy, steps: [
  OpsChain.step('Shutdown', wait: true, ignore_failure: true),
  'infra_destroy'
]
```

In this example the change pauses at a wait step, with `Shutdown` nested as its child — `Shutdown` only starts once the wait step is continued or approved. If the wait step itself is rejected, times out, or errors, `Shutdown` never runs, regardless of `ignore_failure:`. `ignore_failure:` here applies to `Shutdown`'s own outcome: if `Shutdown` runs but fails, the wait step is still marked successful and the change continues to `infra_destroy`.

Pass an integer to `wait:` for a timed wait:

```ruby
OpsChain.step('Shutdown', wait: 90, ignore_failure: true)
```

:::note
If no behavioural options are provided, `OpsChain.step` returns the action name unchanged — no wrapper is created.

```ruby
OpsChain.step('Shutdown')  # returns 'Shutdown' — safe no-op
```

:::

When `wait:` or `input_arguments:` is used, `OpsChain.step` returns the wait/input step itself (with the wrapped action nested as its child) rather than a separate wrapper step. Its default display name is derived from the wrapped action name and the active options, for example `Run "Shutdown" waiting for explicit continue, ignoring failures`.

With neither `wait:` nor `input_arguments:` (i.e. `ignore_failure:` alone), `OpsChain.step` still creates a separate wrapper step around the wrapped action, named the same way; subsequent calls with the same action name and options append an incrementing suffix (`Run "Shutdown" ignoring failures 2`, etc.).

## Defining resource types & resources

Resource types can be defined using the `resource_type` keyword:

```ruby
resource_type :city do
  property :name
  property :weather

  desc 'Output how the weather looks in the city'
  action :report_weather do
    puts "The weather in #{name} looks #{weather}"
  end
end
```

The `city` resource type can now be used to create `city` resources:

```ruby
city :melbourne do
  name 'Melbourne'
  weather 'cold'
end
```

These resources will automatically include the `name` and `weather` properties, as well as a `report_weather` action. In this example a `melbourne` resource will be created with a `melbourne:report_weather` action. Running this action will output:

`The weather in Melbourne looks cold`

:::note[NOTES]

1. The resource type name (`city`) and resource name (`melbourne`) should conform to ruby variable naming standards. This means the name can include alphanumeric characters and the underscore character however it cannot start with a number or a capital letter. This ensures it can be easily referenced from other ruby code or the command line.
2. The action description assigned via the `desc` keyword in the example above is optional. To view all actions (with or without a description) the `opschain-action -AT` command can be used. This is useful as internal actions can be hidden by omitting a description, but are discoverable if needed.

:::

### Property value types

Resource properties can accept any valid Ruby value, including strings, numbers, booleans, arrays, and hashes.

#### String and simple value properties

Simple string and numeric properties are set directly:

```ruby
database :app_database do
  host 'db.example.com'
  port 5432
  encrypted true
end
```

#### Array properties

Arrays can be passed directly as property values:

```ruby
server :web_server do
  name 'web1'
  allowed_ports [80, 443, 8080]
end
```

#### Hash properties

To pass a hash (dictionary) as a property value, wrap the hash in parentheses using the property method name as a method call. **The parentheses are required** — without them Ruby will interpret the braces as a block rather than a hash literal, which causes an error.

```ruby
ssh_host :prod_server do
  host 'prod.example.com'
  # Correct — with parentheses:
  host_options({'final_user' => 'oracle', 'connect_user' => 'root', 'keys' => ['/opt/opschain/prod_key']})

  # Incorrect — without parentheses (causes an error):
  # host_options {'final_user' => 'oracle', ...}  # ✗ Error: unexpected block
end
```

In the example above, `host_options` is a hash with three keys: `final_user`, `connect_user`, and `keys` (which contains an array of key file paths).

Within your actions, hash properties are accessed using dot or bracket notation, just like any other property:

```ruby
action :connect do
  options = controller.host_options
  final_user = options['final_user']  # or options.final_user
  connect_user = options['connect_user']
  keys = options['keys']
end
```

### Lazy property evaluation

By default, property values are assigned to resources when the `actions.rb` is first loaded. If a property's value is slow to resolve, (e.g. the result of an API response) then this can have a dramatic effect on the `actions.rb` evaluation time - which is done during every step in a change.

For example, to resolve the `city` resources in the `actions.rb` below, OpsChain will need to make two calls to the weather bureau API (to derive the weather for Sydney and Melbourne):

```ruby
city :melbourne do
  name 'Melbourne'
  weather WeatherBureauAPI.get_melbourne_weather
end

city :sydney do
  name 'Sydney'
  weather WeatherBureauAPI.get_sydney_weather
end
```

The two API calls will be made irrespective of what action is being run from the file. To avoid calling the API unnecessarily, OpsChain provides the `lazy` keyword to instruct OpsChain to derive the property value when the property is first used:

```ruby
city :melbourne do
  name 'Melbourne'
  weather lazy { WeatherBureauAPI.get_melbourne_weather }
end

city :sydney do
  name 'Sydney'
  weather lazy { WeatherBureauAPI.get_sydney_weather }
end
```

Now a call to the weather bureau API for a city's weather will only be made if an action requests the value of its `weather` property.

:::info[Identifying the lazy property's Ruby class]
The [`is_a?`](https://ruby-doc.org/core/Object.html#method-i-is_a-3F), [`kind_of?`](https://ruby-doc.org/core/Object.html#method-i-kind_of-3F) and [`instance_of?`](https://ruby-doc.org/core/Object.html#method-i-instance_of-3F) Ruby methods allow you to test the class of an object. Prior to resolving the lazy property's value, these will all respond with `true` when supplied the argument `LazyPropertyValue` e.g.

```ruby
weather.is_a?(LazyPropertyValue) # => true
weather.is_a?(String) # => false
```

Once the lazy property has been resolved (by calling any other method on the lazy property), the `is_a?`, `kind_of?` and `instance_of?` methods will apply to the resolved value.

```ruby
whether.nil?
weather.is_a?(LazyPropertyValue) # => false
weather.is_a?(String) # => true
```

:::

### The OpsChain keywords in a resource definition

A resource type definition, a resource definition, an [`each_child`](#defining-composite-resources--resource-types) block, an inline [`action`](#defining-resource-type-actions) body and a [`lazy`](#lazy-property-evaluation) property value are all evaluated against the resource being built, so the OpsChain keywords are called directly, without the `OpsChain.` prefix:

| | |
|---|---|
| Logging and commands | `log`, `opschain_cli` |
| Change data | `properties_for`, `repository_properties`, `repository_properties_for`, `context`, `dry_run?` |
| The API and secrets | `query`, `secret_vault` |
| The asset's MintModel | `mintmodel_actions` |
| Other resources | `ref` (or `resource`) |
| Property values | `lazy`, `literal` |

This lets a resource work out its own properties from OpsChain itself. Doing so inside a [`lazy`](#lazy-property-evaluation) block is usually what you want, so the lookup only happens when an action asks for the value:

```ruby
weblogic_domain :wls do
  region lazy { query(:mintmodel, project: 'demo', environment: 'dev', asset: 'wls')[:region] }
  admin_password lazy { secret_vault.get('demo/wls', 'admin_password') }
  debug lazy { context.parents.environment.code == 'dev' }
end
```

Each behaves exactly as it does at the top level of your `actions.rb`, and each is documented in its own section of this guide. `query`, `secret_vault`, `context`, `dry_run?`, `mintmodel_actions`, `properties_for`, `repository_properties` and `repository_properties_for` can still be written with the `OpsChain.` prefix, so an existing resource definition does not have to be rewritten. `log` and `opschain_cli` have no prefixed form — their full paths are `OpsChain.logger` and `OpsChain::Dsl::CliCommand.execute`.

#### Keywords a resource definition does not have

[`exec_command`](#opschain-exec_command) and [`send_email`](#sending-email), and the keywords that add [child steps](#child-steps) or [store files](/key-concepts/properties.md#storing--removing-files) — `step`, `steps`, `wait_step`, `input_step`, `ignore_failure_step`, `append_child_steps`, `child_steps`, `child_execution_strategy`, `run_action`, `store_file!` and `remove_file!` — are deliberately unavailable in a resource definition.

Your `actions.rb` is read in full every time OpsChain needs it: once for every step of a change, and again while OpsChain works out the change's step tree and the actions a template offers. A keyword that acts on something outside OpsChain, or that adds to the step tree, would therefore run far more often than you intend. Call these from an action or a controller method instead, which run only when the step runs.

`properties` is not the change's properties here either — in a resource definition it is the [bulk property setter](#setting-multiple-properties). Read the change's properties with `OpsChain.properties`.

#### When a property has the same name as a keyword

A property always wins. A resource type that declares `property :query`, or a resource that inherits a `context` property from its [composite parent](#defining-composite-resources--resource-types), keeps that property — the keyword of the same name is not available in that resource, and `OpsChain.query` or `OpsChain.context` reaches the keyword instead.

A resource or resource type *named* after one of these keywords is the other way around: the keyword wins, and the resource is reached with [`ref`](#the-ref-or-resource-method) — `ref(:secret_vault)` — or given another name.

A controller can declare a property named after one of these keywords too. Doing so costs the controller that keyword for the whole of the class, so OpsChain logs a warning naming the property when it happens.

### Controller

Defining inline actions as in the example above limits your ability to adequately test the action code. Moving the code into a controller class allows the code to more readily be tested and reduces the need to change your resource type definition to change its action logic.

A controller is a Ruby class. OpsChain builds one instance of it per resource, hands it that resource's properties, and exposes the methods you nominate as actions on the resource.

A controller that inherits from `OpsChain::Dsl::BaseController` gets its constructor, the OpsChain keywords inside its methods, and its actions and properties derived from the class itself. Writing a controller [without the base class](#writing-a-controller-without-the-base-class) is still supported, and is what you need when your controller already has a superclass of its own.

#### The base controller

Re-writing the example above using the base controller:

```ruby
class CityController < OpsChain::Dsl::BaseController
  property :name
  property :weather, default: 'unknown'

  desc 'Output how the weather looks in the city'
  def report_weather
    log.info "The weather in #{name} looks #{weather}"
  end
end

resource_type :city do
  controller CityController
end
```

That is the whole definition. The properties and the action are declared once, in the class, so the `resource_type` block has nothing to repeat, there is no constructor to write, and `log` is called without the `OpsChain.` prefix.

The `city` resource type is used exactly as before:

```ruby
city :melbourne do
  name 'Melbourne'
end
```

Running the resulting `melbourne:report_weather` action logs `The weather in Melbourne looks unknown`.

:::info
`OpsChain::Dsl::BaseController` comes from the `opschain` gem. If your code runs outside OpsChain you need `require 'opschain'` at the top of the file, as described under [defining standalone actions](#defining-standalone-actions).
:::

##### Controller properties

The `property` class method declares a property the resource accepts and, at the same time, defines a private reader for it on the controller:

```ruby
class DatabaseController < OpsChain::Dsl::BaseController
  property :host
  property :port, default: 5432
  property :url, default: -> { "postgres://#{host}:#{port}" }
end
```

- Each declared property is reported to OpsChain as a resource type property, so a resource can set it without the resource type having to repeat `property :host` itself. OpsChain reads that list from the class's `resource_type_properties` method, which the base controller derives from your `property` declarations. A controller [written without the base class](#controller-actions-and-properties) writes the method by hand.
- A `default:` applies when the resource does not set the property, or sets it to `nil`.
- A `default:` that responds to `call` is evaluated against the controller when the property is read, so it can build its value from the other properties. It is evaluated on every read rather than being remembered after the first.
- The readers are private, because they are part of your controller's implementation rather than actions on the resource.

A property name has to be one a resource can actually set, and one that does not collide with your controller's own code, so `property` rejects three kinds of name as the class is defined:

| Rejected name | Example | Why |
|---|---|---|
| An OpsChain keyword the controller relies on | `property :log` | The keyword would no longer be callable inside your methods |
| A resource keyword | `property :controller` | A resource definition could never set it — the name already means something else there |
| A method the controller already defines | `def host` above `property :host` | The reader would replace your method |

Declaring a property a superclass already declared, to give it a different default, is not a collision.

The declared properties are reported as the controller's `dry_run_properties` as well, so they are also available while OpsChain is discovering what your actions are rather than running one of them, and a resource definition that sets them is valid in both cases.

##### The controller properties hash

Whatever the resource sets is also available as a whole, through `controller_properties`:

```ruby
class DatabaseController < OpsChain::Dsl::BaseController
  property :host

  def report
    log.info "#{resource_name} connects to #{controller_properties[:host]}"
  end
end
```

`controller_properties` is the hash OpsChain builds the controller with. It holds every property the resource carries — those declared with `property`, and any the resource sets in bulk with [`properties`](#setting-multiple-properties) — plus `opschain_resource_name`, the name of the resource the controller was built for, which is also available directly as `resource_name`. Keys can be read as symbols or strings.

:::caution[`properties` and `controller_properties` are different things]
Inside a controller, `properties` is the change's [properties](/key-concepts/properties.md) document — the same thing `OpsChain.properties` returns at the top level of your `actions.rb`. `controller_properties` is the resource's own properties. To read the resource's `host` use `host` or `controller_properties[:host]`, never `properties[:host]`.
:::

:::tip
Read the properties when you need them rather than in a constructor. Resource properties can be [lazy](#lazy-property-evaluation), and reading one resolves it, so touching them all up front does work the action may never need. Declaring them with `property` gives you this for free.
:::

##### Controller actions

The base controller derives the resource's actions from the class itself: every **public** instance method that can be called **without arguments** becomes an action on the resource.

| Method | An action? | Why |
|---|---|---|
| `def report_weather` | yes | public, takes no arguments |
| `def deploy(force = false)` | yes | can be called without arguments |
| `def deploy(*args)` | yes | can be called without arguments |
| `def deploy(force)` | no | requires an argument |
| `def deploy(force:)` | no | requires a keyword argument |
| `def resolve_host` under `private` | no | not public |
| `def run_during_dry_run` | no | reserved by OpsChain |
| a method named after a declared `property` | no | that name is the property's reader — OpsChain warns that the method shadows it |
| the methods of `Object` and of the base class | no | not methods you defined |

A method your controller inherits from your own intermediate class, or picks up from a module it includes, counts as one of yours, so a hierarchy of controllers and a module of shared actions both contribute actions to the resource.

OpsChain reads the derived list from the class's `resource_type_actions` method, the counterpart of `resource_type_properties` above. A controller [written without the base class](#controller-actions-and-properties) writes that method by hand too.

:::note
The action list is read when the `controller` line in your `resource_type` block runs, so the class must be complete by that point. Define the controller — or `require` the file that defines it — above the `resource_type` that uses it. A method added to the class after that line has run is not an action.
:::

##### Describing a controller action

Every derived action carries a description, defaulting to the method's own name. The `desc` class method supplies a better one, and applies to the next method defined after it:

```ruby
class CityController < OpsChain::Dsl::BaseController
  desc 'Output how the weather looks in the city'
  def report_weather
    ...
  end

  desc 'Send a postcard from the city', step_name: 'Send a postcard', ignore_failure: true
  def send_postcard
    ...
  end

  def internal_action
    ...
  end
end
```

`desc` accepts the description as its first argument, followed by any of the same options an [`available_actions:`](#available-actions) entry accepts:

| Option | Purpose |
|---|---|
| `step_name:` | The [step name](#change-step-naming) shown in the GUI, in place of the method name |
| `ignore_failure:` | Continue the change when the action raises, rather than failing the step — see [ignoring an action failure](#ignoring-an-action-failure) |
| `reload_actions:` | [Read `actions.rb` again](#reloading-actionsrb-for-a-step) before the action's step runs |

A description can be omitted when you only want the options — `desc step_name: 'Send a postcard'` is valid.

An action defined without a `desc` is described by its own method name, so `internal_action` above is listed and offered in the GUI as `internal_action`. `desc` therefore controls how an action reads to a user, not whether they see it — to keep an action runnable but out of the listings, leave it out of the resource type's [`available_actions:`](#available-actions).

:::note
Because `desc` applies to the next method defined, it must be immediately followed by a method definition. A `property`, a `not_actions`, an `include`, `prepend` or `extend`, or a second `desc` between the two is an error, raised as the class is defined, rather than the description quietly attaching itself to a later method:

```text
Unable to use "not_actions" here - the preceding desc can only annotate a controller action method
```

Other code between the two is not rejected — a constant assignment, say — and the `desc` still annotates whichever method is defined next, so keep a `desc` and the method it describes together.

A `desc` written above a `def self.` class method has nothing it can annotate, and OpsChain logs a warning for it as the class is defined. A `desc` left dangling at the end of the class body is warned about later, when OpsChain works out the resource's actions.

The description is `desc`'s first argument rather than a keyword, so write `desc 'Deploy the server'` and not `desc description: 'Deploy the server'`.
:::

##### Excluding a public method from the actions

A public method that is a helper rather than an action can be excluded with `not_actions`:

```ruby
class CityController < OpsChain::Dsl::BaseController
  desc 'Output how the weather looks in the city'
  def report_weather
    log.info "The weather in #{name} looks #{weather} (#{formatted_coordinates})"
  end

  def formatted_coordinates
    ...
  end

  not_actions :formatted_coordinates
end
```

`not_actions` takes any number of method names and can appear anywhere in the class body — before or after the methods it names — except directly below a `desc`, which has to annotate a method. Its exclusions are inherited by subclasses.

Making the method `private` has the same effect on the action list, so reach for `not_actions` when the method has to stay public — because another controller, a [resource type action](#accessing-the-controller) or a test calls it.

##### The OpsChain keywords in a controller

Inside a base controller the OpsChain keywords are called directly, without the `OpsChain.` prefix:

| | |
|---|---|
| Logging and commands | `log`, `exec_command`, `opschain_cli` |
| The resource | `controller_properties`, `resource_name` |
| Change data | `properties`, `properties_for`, `repository_properties`, `repository_properties_for`, `context`, `dry_run?` |
| Files | `store_file!`, `remove_file!` |
| Child steps | `append_child_steps`, `child_steps`, `child_execution_strategy`, `step`, `steps`, `wait_step`, `input_step`, `ignore_failure_step`, `run_action` |
| The API and secrets | `query`, `send_email`, `secret_vault` |
| The asset's MintModel | `mintmodel_actions` |
| Other resources | `ref` (or `resource`) |

Each behaves exactly as it does at the top level of your `actions.rb`, and each is documented in its own section of this guide. The `OpsChain.` prefixed form keeps working everywhere, so an existing controller does not have to be rewritten to inherit from the base class.

:::note[Assigning to `child_steps`]
`child_steps` and `child_execution_strategy` can be assigned as well as read, and the assignment needs an explicit `self.`:

```ruby
self.child_steps = ['do_a_different_thing']
```

Without it, Ruby reads `child_steps = ...` as a new local variable and nothing is assigned. This is a rule of the Ruby language rather than something specific to OpsChain.
:::

`action` and `resource_type` are deliberately **not** available in a controller. A controller carries out a resource's work; it does not declare resources or resource types. Declare those in your `actions.rb` or `resources.rb`, as described in [defining resource types & resources](#defining-resource-types--resources).

##### Adding the base controller behaviour to an existing class

When a controller already has a superclass it cannot inherit from `OpsChain::Dsl::BaseController`, so the base class's behaviour is also published as three modules that can be adopted separately:

| Module | Adopted with | Provides |
|---|---|---|
| `OpsChain::Mixins::ControllerKeywords` | `include` | The OpsChain keywords, as private methods |
| `OpsChain::Mixins::ControllerActions` | `extend` | `desc`, `not_actions`, and the derived `resource_type_actions` |
| `OpsChain::Mixins::ControllerProperties` | `extend` | `property`, and the derived `resource_type_properties` |

```ruby
class CityController < OurCompany::BaseThing
  include OpsChain::Mixins::ControllerKeywords
  extend OpsChain::Mixins::ControllerActions
  extend OpsChain::Mixins::ControllerProperties

  def initialize(controller_properties)
    @controller_properties = controller_properties
  end

  private

  attr_reader :controller_properties
end
```

`ControllerKeywords` and `ControllerProperties` expect the controller properties to be readable as `controller_properties`, so a class that adopts them supplies the constructor and reader shown above — which is all `OpsChain::Dsl::BaseController` adds on top of the three modules.

#### Writing a controller without the base class

A controller does not have to inherit from the base class, or use any of its modules. Any class works, provided it takes the resource's properties as a single argument and OpsChain is told which of its methods are actions:

```ruby
class CityController
  def initialize(options)
    @options = options
  end

  def report_weather
    puts "The weather in #{name} looks #{weather}"
  end

  private

  def name = @options[:name]
  def weather = @options[:weather]
end

resource_type :city do
  controller CityController, available_actions: [:report_weather]

  property :name
  property :weather
end
```

Resources created from this `city` resource type have the same actions, and produce the same output, as those created from the base controller definition above.

:::note[NOTES]

- The class constructor must accept a single [Ruby hash](https://ruby-doc.org/stdlib/core/Hash.html) parameter, which will include each of the resource properties defined on the resource. This hash is the resource's `properties` at the time the controller is constructed.
- The action methods must not require parameters.
- The resource type has to declare each property itself, because the class does not tell OpsChain about them.

:::

:::tip

To improve performance, it's best to avoid using the options passed to the controller until they are needed (i.e. do `@options = options`, not `@name = options[:name]`).

:::

##### Controller actions and properties

Rather than listing the actions on the resource type, a controller can name its own actions and properties through the `resource_type_actions` and `resource_type_properties` class methods. These are what the base controller derives for you; a class that does not use the base class can define them by hand:

```ruby
class CityController
  def self.resource_type_properties
    %i[name weather]
  end

  def self.resource_type_actions
    %i[report_weather]
  end

  def initialize(options)
    @name = options[:name]
    @weather = options[:weather]
  end

  def report_weather
    puts "The weather in #{name} looks #{weather}"
  end

  private

  attr_reader :name, :weather
end

resource_type :city do
  controller CityController
end
```

Once again, resources created from this `city` resource type would have the same actions (and same action output) as those created from the earlier type definitions.

:::note
`resource_type_actions` can return a mixture of plain action names and the descriptive hashes described under [available actions](#available-actions). E.g.

```ruby
  def self.resource_type_actions
    [{ name: :action_with_description, description: 'An action with a description', step_name: 'GUI step name' }, :action_without_description]
  end
```

:::

A controller can also define `dry_run_properties` to declare the properties a resource may set while OpsChain is discovering what your actions are. The base controller derives this from the declared properties; a class that does not use the base class and omits it will find those resource properties undefined during discovery.

##### Controller action method validation

OpsChain validates that the controller defines all the methods that the resource type references (either via `available_actions` or `resource_type_actions`), and if the method does not exist it will report an error, e.g. `CityController does not define the action method magic`.

If using `method_missing` with an OpsChain controller class then the corresponding `respond_to_missing?` method should be implemented.

If the class defines methods dynamically (or shouldn't be validated for another reason) the `self.validate_action_methods?` method can be defined on the controller class to modify this behaviour:

```ruby
class CityController
  def self.validate_action_methods?
    false
  end

  def initialize(options)
    define_singleton_method(:magic) do
      puts "Who doesn't like magic?"
    end
  end
end

resource_type :city do
  controller CityController, available_actions: [:magic]
end
```

#### Available actions

The `available_actions:` kwarg on `controller` selects which of the controller's actions are described — and so which are listed by `opschain-action --tasks` and offered in the GUI — and lets you set each one's description and options from the resource type rather than the controller class.

```ruby
resource_type :city do
  controller CityController, available_actions: [{ name: :report_weather, description: 'Output how the weather looks in the city' }]
end
```

:::note[NOTES]

1. `available_actions:` will expose each controller method supplied to it as an action on the resource.
2. An entry can be a plain method name, or a [Ruby hash](https://ruby-doc.org/stdlib/core/Hash.html) carrying that method's description. E.g. `available_actions: [{ name: :report_weather, description: 'Output how the weather looks in the city' }]`.
3. Names and descriptive hashes can be mixed as required. E.g. `available_actions: [{ name: :report_weather, description: 'Output how the weather looks in the city' }, :action_without_description]`
4. In addition to a custom description, each action hash can include the optional `step_name:`, `ignore_failure:` and `reload_actions:` keys. `step_name:` overrides the step name displayed in the OpsChain GUI. `ignore_failure:` (boolean) marks the action to continue the change on failure. `reload_actions:` (boolean) makes the action's step [read `actions.rb` again](#reloading-actionsrb-for-a-step) before it runs. E.g. `available_actions: [{ name: :report_weather, description: 'Output how the weather looks in the city', step_name: 'Report the weather', ignore_failure: true }]`
5. Alternatively, `available_actions:` can be supplied as a hash where each key is an action name and the value is its description. E.g. `available_actions: { report_weather: 'Output how the weather looks in the city' }`.

:::

`available_actions:` is optional. Omitted, the resource exposes whatever the controller reports through `resource_type_actions` — which, for a base controller, is [derived from the class](#controller-actions) with the descriptions its `desc` declarations supply.

:::note[`available_actions:` replaces a `desc` rather than adding to it]
An entry in `available_actions:` *is* the definition of that action, so it supplies the description and options in place of the controller's `desc`. Naming an action by its method name alone therefore leaves it with that name as its description and the default options:

```ruby
class DeployController < OpsChain::Dsl::BaseController
  desc 'Deploy the app', step_name: 'Deployment', ignore_failure: true
  def deploy
    ...
  end
end

resource_type :app do
  # deploy is described as 'deploy', with no step name and ignore_failure false
  controller DeployController, available_actions: [:deploy]
end
```

Leave `available_actions:` off to keep what the controller declares, or restate the description and options in the entry. Narrowing the actions [on a resource](#overriding-controller-actions-on-a-resource) behaves differently: it reconciles with what the controller declared instead of replacing it.
:::

:::caution
Supplying `available_actions:` does not remove the controller's other actions. An action the controller reports through `resource_type_actions` but `available_actions:` leaves out is still defined and can still be run; it has no description, so it is hidden from `opschain-action --tasks` and from the GUI.

This matters most for a base controller, where the action list is derived rather than written out: every public no-argument method is an action whether or not `available_actions:` mentions it. To make sure a method is not an action at all, keep it `private` or name it in [`not_actions`](#excluding-a-public-method-from-the-actions).
:::

#### Overriding controller actions on a resource

When a resource type defines a controller with `available_actions:`, each resource created from that type will expose all of those controller actions by default. The `available_actions` DSL method can be called within a resource definition to override which controller actions are visible for that specific resource, and optionally change their descriptions.

```ruby
resource_type :server do
  controller ServerController, available_actions: {
    deploy: 'Deploy the server',
    restart: 'Restart the server',
    shutdown: 'Shutdown the server'
  }

  property :hostname
end

server :production do
  hostname 'prod-server'

  # Only expose deploy and restart for the production server
  available_actions(
    deploy: 'Deploy the production server',
    restart: 'Restart the production server'
  )
end

server :staging do
  hostname 'staging-server'
  # No override — all three actions (deploy, restart, shutdown) remain available
end
```

The `available_actions` method accepts arguments in the same formats as the `available_actions:` kwarg on `controller` (see [available actions](#available-actions)):

- A symbol or string: `available_actions :deploy, :restart`
- A key-value hash of name → description: `available_actions(deploy: 'Deploy the server', restart: 'Restart the server')`
- An array of hashes with a `name:` key (supports `description:`, `step_name:`, `ignore_failure:`, and `reload_actions:`): `available_actions({ name: :deploy, description: 'Deploy the server', step_name: 'Run deployment' })`
- Any mixture of the above formats

:::note
Calling `available_actions` on a resource **replaces** the set of visible controller actions for that resource. In the example above, `production` exposes only `deploy` and `restart`, even though the resource type also defines `shutdown`.
:::

:::note[A resource keeps the options the controller declared]
Narrowing the actions on a resource does not discard the options a base controller's `desc` declarations supply — an entry overrides only the options it states. The description behaves differently: naming an action on its own keeps the description the controller declared, but a hash entry supplies the description of the action it names, so an entry carrying no `description:` leaves that action without one — and so hidden from `opschain-action --tasks` and the GUI — exactly as an explicit `description: nil` would.

Taking the `DeployController` above, whose `deploy` is declared `desc 'Deploy the app', step_name: 'Deployment', ignore_failure: true`:

| On the resource | Description | `step_name:` | `ignore_failure:` |
|---|---|---|---|
| `available_actions :deploy` | `Deploy the app` | `Deployment` | `true` |
| `available_actions({ name: :deploy, description: 'Deploy production' })` | `Deploy production` | `Deployment` | `true` |
| `available_actions({ name: :deploy, ignore_failure: false })` | none | `Deployment` | `false` |

To change one option for a single resource without listing the actions it can run, and without taking their descriptions away, use [`ignore_failures`](#ignoring-controller-action-failures-on-a-resource) or [`reload_actions`](#reloading-actionsrb-for-a-controller-action-on-a-resource) instead. Those mark an action in place, leaving its description and its other options as they were.
:::

#### Ignoring controller action failures on a resource

The `ignore_failures` DSL method can be called within a resource definition to mark specific controller actions as non-fatal. When one of those actions raises an exception, OpsChain logs a warning and continues the change rather than marking the step as failed.

```ruby
server :staging do
  hostname 'staging-server'

  available_actions(
    deploy: 'Deploy the staging server',
    restart: 'Restart the staging server'
  )

  # If restart fails on staging, log a warning but continue the change
  ignore_failures :restart
end
```

Multiple actions can be marked at once: `ignore_failures :restart, :shutdown`.

:::note
`ignore_failures` can only reference actions that are present in `available_actions`. If the specified action name does not exist in the resource's available actions, OpsChain will raise an error.
:::

:::tip
`ignore_failure` can also be specified inline within an `available_actions` entry, avoiding a separate `ignore_failures` call:

```ruby
server :staging do
  hostname 'staging-server'

  available_actions(
    :deploy,
    { name: :restart, description: 'Restart the staging server', ignore_failure: true }
  )
end
```

This is equivalent to the previous example.
:::

#### Reloading `actions.rb` for a controller action on a resource

The `reload_actions` DSL method can be called within a resource definition to make specific controller actions [read `actions.rb` again](#reloading-actionsrb-for-a-step) before they run.

```ruby
server :staging do
  hostname 'staging-server'

  available_actions(
    deploy: 'Deploy the staging server',
    restart: 'Restart the staging server'
  )

  # Read actions.rb again before restart runs, so its top level sees what deploy produced
  reload_actions :restart
end
```

Multiple actions can be marked at once: `reload_actions :restart, :shutdown`. As with `ignore_failures`, the action must be present in `available_actions`, and the option can be specified inline in an `available_actions` entry instead:

```ruby
server :staging do
  hostname 'staging-server'

  available_actions(
    :deploy,
    { name: :restart, description: 'Restart the staging server', reload_actions: true }
  )
end
```

### Defining resource type actions

Any combination of controller actions and locally defined actions can be used within a resource or resource type.

```ruby
resource_type :city do
  controller CityController

  action :send_postcard do
    puts "Sending postcard from #{name}"
  end
end
```

Using this `city` resource type, resources will include the `report_weather` and `send_postcard` actions.

:::note
If you define a resource type action with the same name as a controller action_method, OpsChain will run the controller action, then the resource_type action.
:::

#### Accessing the controller

If a controller class was configured with the `controller` keyword on the resource type, the actions on the resource or resource type can reference the supporting controller instance to invoke methods.

```ruby
resource_type :city do
  controller CityController

  action :send_postcard do |action|
    action.controller.buy_stamp # this method doesn't actually exist in our example, it is just for illustration
    puts "Sending postcard from #{name}"
  end
end
```

The `send_postcard` action defined on the `city` resource type will invoke the controller's `buy_stamp` method. This method needs to be public, and could optionally be exposed as an action by the controller - but it does not need to be.

### Using namespaces to separate resources and actions

You can nest namespaces to organise your resources. Namespaces also allow the same resource name to be used multiple times. You can open the same namespace multiple times and the results will be combined:

```ruby
namespace :earth do
  namespace :australia do
    city :perth do
      name 'Perth'
      weather 'sunny'
    end
  end

  namespace :scotland do
    city :perth do
      name 'Perth'
      weather 'gloomy'
    end
  end
end

namespace :earth do
  namespace :australia do
    city :sydney do
      name 'Sydney'
      weather 'nice'
    end
  end
end
```

This would define the following actions:

- `earth:australia:perth:report_weather`
- `earth:australia:perth:send_postcard`
- `earth:australia:sydney:report_weather`
- `earth:australia:sydney:send_postcard`
- `earth:scotland:perth:report_weather`
- `earth:scotland:perth:send_postcard`

### Referencing resources

#### Assigning resources to properties

Previously defined resources (in the same `actions.rb` or files required previously) can be referenced by name when setting properties in other resources.

```ruby
namespace :australia do
  city :sydney do
    name 'Sydney'
  end

  namespace :victoria do
    city :melbourne do
      name 'Melbourne'

      # OpsChain will search for the 'sydney' resource in the current namespace, then in
      # each parent namespace until the resource is found.
      rival sydney
    end
  end
end
```

If the property value being assigned (in this case the `sydney` resource) is another resource (technically, if it responds to the `controller` method), the property will be assigned the result of the `controller` method. _**Note: if the controller method returns `nil`, the property will be nil.**_

#### Accessing resource properties

The resource properties from previously defined resources can be referenced when setting properties in subsequent resources by using the `properties` keyword:

```ruby
namespace :australia do
  city :sydney do
    name 'Sydney'
  end

  namespace :victoria do
    city :melbourne do
      name 'Melbourne'
      rival "#{name}'s biggest rival is #{sydney.properties.name}."
    end
  end
end
```

#### The `ref` (or `resource`) method

As shown in the previous examples, referencing a resource by name is often sufficient to resolve it. However, when the required resource is defined in an alternate namespace, or where resources with the same name exist, the `ref` method can be used to more explicitly specify the required resource:

```ruby

namespace :australia do
  city :capital do
    name 'Canberra'
  end

  namespace :victoria do
    city :capital do
      name 'Melbourne'
    end
  end

  namespace :new_south_wales do
    city :capital do
      name 'Sydney'
    end

    namespace :hunter_valley do
      city :newcastle do
        state_capital capital
        country_capital ref('^australia:capital')
        victorian_capital ref('victoria:capital') # or ref('^australia:victoria:capital')
      end
    end
  end
end
```

The properties associated with `newcastle` highlight the various ways to access other resources in the `actions.rb`.

-`state_capital` uses the default "by name" feature of the DSL causing the following search sequence:

  1. `australia:new_south_wales:hunter_valley:capital`
  2. `australia:new_south_wales:capital`

-`country_capital` prefixes the resource path with the `^` symbol to instruct `ref` to start its search in the root namespace:

  1. `australia:capital`

-`victorian_capital` includes a namespace in the resource path, causing the following search sequence:

  1. `australia:new_south_wales:hunter_valley:victoria:capital`
  2. `australia:new_south_wales:victoria:capital`
  3. `australia:victoria:capital`

  It also includes an alternative path, using the `^` prefix to request the Victorian capital directly.

:::tip

The `ref` name is also available as `resource` to make it more explicit. E.g. `country_capital resource('^australia:capital')`.

:::

#### Using resources in actions

Before executing a resource action, OpsChain parses the entire `actions.rb` file. For this reason, resource actions can refer to any resource in the `actions.rb` or the files it requires. In the example below, the `state_capital` action refers to the `melbourne` resource, even though its definition appears after it in the file.

```ruby
namespace :victoria do
  city :bacchus_marsh do
    name 'Bacchus Marsh'

    action :state_capital do
      puts "The capital of Victoria is #{melbourne.properties.name}."
      melbourne.controller.report_weather
    end
  end

  city :melbourne do
    name 'Melbourne'
  end
end
```

The `state_capital` action uses:

- the `properties` keyword to incorporate the value of the `melbourne` resource's `name` property in the message
- the `controller` keyword to call the `report_weather` method on `melbourne`'s controller

:::info
Within an `action` block, OpsChain does not allow calling other resource's actions directly (e.g. `melbourne.send_postcard` can not be used from the `state_capital` action above). If the `state_capital` action is required from other resources, it should be moved to a method in the resource type's controller, making it accessible via the `controller` keyword.
:::

:::info
To handle the case where variables are used to define resource names, OpsChain resolves the `controller` or `properties` on a string (or [symbol](https://docs.ruby-lang.org/en/master/Symbol.html)) variable that matches the name of a resource. For example the following code would work:

```ruby
capital = 'melbourne' # or :melbourne
namespace :victoria do
  action :state_capital do
    puts "The capital of Victoria is #{capital.properties.name}."
    capital.controller.report_weather
  end

  city capital do
    name 'Melbourne'
    weather 'good'
  end
end
```

Note: The only fields that are looked up automatically are `controller` and `properties`.

:::

### Setting multiple properties

Multiple resource properties can be assigned values in a single step by taking advantage of the [OpsChain properties](/key-concepts/properties.md) feature. Assuming the OpsChain properties JSON was set to:

```json
{
  "melbourne_resource": {
    "name": "Melbourne",
    "weather": "cold"
  }
}
```

The `melbourne` city resource could be created as follows:

```ruby
city :melbourne do
  properties OpsChain.properties.melbourne_resource
end
```

If the dynamic nature of [OpsChain properties](/key-concepts/properties.md) is not required, you can directly supply a hash containing the property values, keyed with their property names.

```ruby
city :melbourne do
  properties({ name: 'Melbourne', weather: 'cold' })
end
```

If the properties are expensive to compute, they can be provided with the [`lazy` keyword](#lazy-property-evaluation).

```ruby
city :melbourne do
  properties(lazy do
    YAML.safe_load(Net::HTTP.get(URI.parse('http://some-server:8000/config.yaml')))
  end)
end
```

#### Property setting override behaviour

Any combination of individually set properties and calls to `properties` can be used to construct the final set of values used to construct the resource's controller. The set of properties used will follow this behaviour:

- successive calls to `properties` will deep merge into any previously set via that method
- individually set properties will override any set via `properties`
- successive calls to set an individual property will override any previous values set

```ruby
first_props = {
  name: {
    a: 'complex value'
  },
  weather: {
    temp: 'a bit cold',
    wind: 'a bit'
  }
}

second_props = {
  weather: {
    temp: 'ok'
  }
}

city :melbourne do
  name 'coffee capital'
  name 'Melbs'

  properties first_props
  properties second_props
end
```

The example above would result in the creation of a controller with these properties:

```ruby
{
  name: 'Melbs',
  weather: {
    temp: 'ok',
    wind: 'a bit'
  }
}
```

## Defining resource actions

In addition to controller actions and resource type actions, you can also define actions specific to an individual resource:

```ruby
city :melbourne do
  name 'Melbourne'

  action :welcome do |action|
    puts "Welcome to #{action.controller.name}"
  end
end
```

These actions can have prerequisites and initiate subsequent steps like normal actions:

```ruby
city :melbourne do
  name 'Melbourne'

  action :get_coffee do
    puts 'getting coffee'
  end

  action :see_music do
    puts 'seeing music'
  end

  action :visit, steps: ['get_coffee', 'see_music']
end
```

Any actions defined within a resource will run __after__ controller and resource type actions with the same name. The following code can be used to demonstrate:

```ruby
class CityController
  ... # omitted for simplicity
  def report_weather
    puts "The controller weather in #{name} looks #{weather}"
  end
end

resource_type :city do
  controller CityController, available_actions: [:report_weather]

  action :report_weather do
    puts "The resource_type weather in #{name} looks #{weather}"
  end
end

city :melbourne do
  name 'Melbourne'
  weather 'perfect'

  action :report_weather do
    puts "The resource weather in #{name} looks #{weather}"
  end
end
```

This example will output the controller weather, then the resource_type weather, then the resource weather. The `name` and `weather` properties will be the same in all three messages.

The following code creates a `database` resource type with three actions: `copy_installer`, `install_and_startup` and `startup`. (`database_controller` is a hypothetical file containing a `DatabaseController` class.)

```ruby
require 'database_controller'

resource_type :database do
  controller DatabaseController, available_actions: [:copy_installer, :startup]

  property :host
  property :source_path

  action install_and_startup: [:copy_installer], steps: [:startup] do |action|
    action.controller.install
  end
end
```

The `install_and_startup` action will:

1. in the current step runner, execute the `copy_installer` pre-requisite action (to execute the `copy_installer` controller method)
2. in the current step runner, execute the `install` controller method (manually called from within the action body)
3. request the `startup` action be run as a child step (to execute the `startup` controller method) - this child step will be started after the contents of this step complete and will be run in a new step runner

## Defining composite resources & resource types

You can define a composite resource that manages child resources.

- `children` specifies the keys and values to be iterated over, it is supplied when creating a resource
- `each_child` defines a namespace for each child and defines a copy of any configured actions and resources in that namespace
- `child_actions` can be used to reference the actions of each child. This is useful for actions defined at the parent composite resource (or resource type) level that may want to reference these child actions as steps

These can be used in a resource definition to create child resources specific to that resource. More commonly, they can be used in a resource type definition to create child resources for each resource of this type.

```ruby
suburb_properties = {
  richmond: {
    football_team: 'tigers'
  },
  collingwood: {
    football_team: 'magpies'
  }
}

resource_type :team

resource_type :city do
  property :country

  each_child do |suburb, properties|
    team :local_team do
      properties properties
      action :barrack do
        puts "Go #{suburb} #{properties[:football_team]} - the best team in #{country}!"
      end
    end
  end

  action :barrack_all, steps: child_actions('local_team:barrack')
end

city :melbourne do
  country 'Australia'
  children suburb_properties
end
```

This would define the following actions:

- `melbourne:richmond:local_team:barrack`
- `melbourne:collingwood:local_team:barrack`
- `melbourne:barrack_all` - this will call the `local_team:barrack` action on the `city` composite's children (`richmond` and `collingwood`).

:::note[NOTES]

- Each team's `barrack` action makes use of the `country` property defined on the parent `city` composite resource type
- `actions` can't be created directly inside the `each_child` block, and instead must be on a resource

:::

## OpsChain `exec_command`

OpsChain's DSL provides an `exec_command` method to execute shell commands with fine-grained control over environment variables, output streaming, error handling and logging. This is particularly useful for running scripts, system commands or external tools that are not available in the default runner image.

`exec_command` is available wherever the other OpsChain keywords are, including inside a [base controller](#the-base-controller) — with the exception of a [resource definition](#keywords-a-resource-definition-does-not-have), which deliberately does not have it. A class that does not inherit from the base controller — or include [`ControllerKeywords`](#adding-the-base-controller-behaviour-to-an-existing-class) — reaches it through its full path, `OpsChain::Dsl::ExecCommand.execute`.

### Command arguments

The command you want to execute can be passed in two ways:

Multiple arguments (recommended for programmatic use):

```ruby
exec_command('docker', 'run', '-it', 'ubuntu', 'bash')
```

Single string (automatically parsed):

```ruby
exec_command('docker run -it ubuntu bash')
```

The parser handles quoted strings properly:

```ruby
# These are equivalent:
exec_command('echo', 'hello world', '"quoted text"')
exec_command('echo "hello world" "quoted text"')
```

### Keyword Arguments

#### `env`: (Hash, default: \{\})

Set environment variables for the command you want to execute.

```ruby
exec_command('printenv', 'MY_VAR', 'ANOTHER_VAR',  env: { MY_VAR: 'hello', ANOTHER_VAR: 'world' })
```

:::note
The environment variables provided in the `opschain.env` section of the properties are already decrypted and ready for use for all the commands run via `exec_command`.
:::

#### `options`: (Hash, default: \{\})

Pass options to `Open3.popen3`, such as changing the working directory before executing the command.

```ruby
exec_command('pwd', options: { chdir: '/tmp' })
```

#### `log_command`: (Boolean, default: true)

Whether to log the command being executed to the change logs.

```ruby
# Default, will add a log line with the command `pwd` to the change logs
exec_command('pwd')

# Suppress the command from being logged to the change logs
exec_command('pwd', log_command: false)
```

#### `live_stream`: (Boolean, default: true)

Whether to log stdout output in real-time as the command runs.

```ruby
# Stream output to the logger as it happens
exec_command('long-running-command', live_stream: true)

# Suppress live output (still captured in the returned result.stdout)
result = exec_command('curl https://example.com', live_stream: false)
```

#### `logger`: (Logger-like object, default: `OpsChain.logger` or `$stdout`)

Specify a custom logger. The logger should respond to `.info()` and `.debug()` methods (or `.puts()` as fallback):

```ruby
# This is just an example, this class does not actually exist
require 'custom-logger'
custom_logger = CustomLogger.new('command.log')

exec_command('rake test', logger: custom_logger)
```

:::note[Change logs]
The logs shown for a change are any lines emitted to the runner's STDOUT and STDERR. If your custom logger sends the output elsewhere, these will not be shown in the change logs.
:::

#### `abort_on_failure`: (Boolean, default: true)

Whether to raise a `RuntimeError` if the command fails (non-zero exit code):

```ruby
# Raises RuntimeError if command fails (default)
exec_command('fake_command', abort_on_failure: true)

# Returns result with failed? == true, no exception
result = exec_command('fake_command', abort_on_failure: false)
puts result.failed?  # => true
```

### Output

The `exec_command` method returns a `CommandResult` object with:

- `stdout` - String containing all stdout output
- `stderr` - String containing all stderr output
- `status` - a `Process::Status` object with exit information. See the [Process::Status documentation](https://ruby-doc.org/3.4.1/Process/Status.html) for more details.
- `success?` / `succeeded?` - Returns `true` if exit code is 0
- `failed?` - Returns `true` if exit code is non-zero
- `exitstatus` - Integer exit code
- `pid` - Process ID
- Other methods delegated to the status object: `coredump?`, `stopped?`, `stopsig`

### Error handling

When a command fails (non-zero exit code) and `abort_on_failure` is `true` (default):

- a `RuntimeError` is raised with a message like: `Command "fake_command" failed with exit status 1`
- if `live_stream` is `true`, stderr is logged before raising the error.
- if `live_stream` is `false`, stderr is logged only when the command fails
- the step will be marked as failed if the exception is uncaught

When `abort_on_failure` is `false`:

- No exception is raised
- Check `result.failed?` or `result.success?` to determine the outcome of the command
- Access `result.stderr` to see the error messages

## OpsChain logger

OpsChain provides a logger for use in your actions. The OpsChain logger is based on the standard [Ruby Logger object](https://ruby-doc.org/3.4.1/stdlibs/logger/Logger.html). By default, the logger is configured to log all INFO severity (and higher) messages to STDOUT. You can use the OpsChain logger from anywhere in your `actions.rb` or project code:

```ruby
log.info 'Informational message'
log.warn 'Warning message'
log.error 'Error message'
log.fatal 'Fatal message'
```

If required, the logger can be set to also display DEBUG level messages as follows:

```ruby
log.level = ::Logger::DEBUG
log.debug 'Debug message'
```

`log` is available at the top level of your `actions.rb`, within the `action` and `resource_type` blocks you define there, and inside a [base controller](#the-base-controller). If you'd like to alias the `log` object to something else — or you are writing a class that is not a base controller — you can refer to the OpsChain logger using the full path to it, for example:

```ruby
OpsChain.logger.info 'Informational message'
```

:::info[Log levels]

The OpsChain logger supports the following log levels:

- `DEBUG`
- `INFO`
- `WARN`
- `ERROR`
- `FATAL`

Each log level is more severe than the last, so `DEBUG` is the least severe and `FATAL` is the most severe.
:::

:::tip[Change log levels]
The OpsChain logger's default log level can be configured via the `OPSCHAIN_LOG_LEVEL` environment variable using OpsChain's [properties](/key-concepts/properties.md#environment-variables).
:::

## OpsChain secret vault

OpsChain allows you to interact with a secret vault to securely manage sensitive information. The secret vault is accessible from within your actions via OpsChain's `secret_vault` property (`OpsChain.secret_vault`). Inside a [base controller](#the-base-controller) or a [resource definition](#the-opschain-keywords-in-a-resource-definition) it is reached as `secret_vault`, without the prefix.

### `OpsChain.secret_vault.get`

The `get` method allows you to generate, store and retrieve secrets from the secret vault. In its simplest form the `get` method requires two arguments:

1. the path where the secret is (to be) stored.
2. the key the secret is stored under in this path.

E.g.

The following example shows a `terraform` [resource](#defining-resource-types--resources) being defined. The result of the secret vault `get` request is being assigned to the resource's `password` variable.

```ruby
terraform_config :terraform do
  vars(
    namespace: 'opschain-terraform',
    external_port: 8080
    password: OpsChain.secret_vault.get('vault/path/to/secrets', 'secret_key')
  )
end
```

In this form, if a secret has been stored in the vault for this path and key combination it will be returned. If no secret exists for this path and key combination then a new secret will be generated, stored in the vault, and then returned.

#### Customising the secret get

The following keyword arguments can be supplied to customise the `get` request:

| Argument                 | Default value | Description                                                                                     |
|--------------------------|---------------|-------------------------------------------------------------------------------------------------|
| `auto_create:`           | true          | whether to automatically create the secret if it does not exist in the vault                    |
| `default:`               | nil           | The default value to assign to the secret if one does not exist or `override` is true |
| `include_chars:`         | true          | whether to include alphabetic characters in the generated secret value                          |
| `include_numbers:`       | true          | whether to include numeric characters in the generated secret value                             |
| `include_symbols:`       | true          | whether to include special characters in the generated secret value                             |
| `length:`                | 14            | the number of characters to generate for the secret value                                       |
| `must_start_with_char:`  | true          | whether the generated secret value must start with an alphabetic character                      |
| `override:`              | false         | whether to overwrite the secret value if it already exists in the secret vault                  |
| `symbols:`               | '-#_^$%*'     | the special characters to include in the secret value                                           |
| `decrypt_vault_value:`   | false         | whether to decrypt the secret value when fetching it. This is only applicable when using double encryption.                                                                                                                                  |

For example: `OpsChain.secret_vault.get('vault/path/to/secrets', 'secret_key', length: 20, include_numbers: false)`. If the secret does not exist, a new 20 character long secret will be generated that does not include any numeric characters. If the secret already exists, these keyword arguments will be ignored and the existing secret returned.

### `OpsChain.secret_vault.remove`

The `remove` method allows you to remove a secret from the secret vault. It requires two arguments:

1. the path where the secret is stored.
2. the key the secret is stored under in this path.

The example `remove_secret` action below will remove a secret from the secret vault:

```ruby
action :remove_secret do
  OpsChain.secret_vault.remove('vault/path/to/secrets', 'secret_key')
end
```

### `OpsChain.secret_vault.remove_path`

The `remove_path` method allows you to remove a path and all of its children from the secret vault.

The example `cleanup_vault` action below will remove the `vault/path/to/secrets` path (including all secrets and child paths) from the secret vault:

```ruby
action :cleanup_vault do
  OpsChain.secret_vault.remove_path('vault/path/to/secrets')
end
```

:::caution
Care should be taken using the `remove_path` method as there is no way to undo the path removal other than to recover from vault backup or manually recreate the paths and contents.
:::

## Querying the API

Action code can read live data from the OpsChain API server while a change is running using the `query` keyword. This is useful when an action needs information about another node — for example the properties of a related environment, the converged settings of an asset, or the MintModel generated for an asset.

```ruby
query(endpoint_type, **kwargs)
```

The first argument is the type of resource to query and the keyword arguments identify the node (or template version) to query. The supported endpoint types are:

| Endpoint type | Required arguments | Optional arguments | Returns |
|---------------|--------------------|--------------------|---------|
| `:node`       | `project`          | `environment`, `asset`, `agent`, `list` | The project, environment, asset, or agent resource, including its `id`, `type`, and `attributes` — or, when `list` is supplied, an array of the [child node resources](#listing-child-nodes). |
| `:mintmodel`  | `project`, `asset` | `environment`      | The data of the asset's [MintModel](/getting-started/familiarisation/gui/projects/asset_templates.md#asset-templates-with-a-mintmodel). |
| `:properties` | one of the [node combinations](#node-argument-combinations) below | | The converged [properties](/key-concepts/properties.md) document for the node (or template version). |
| `:settings`   | one of the [node combinations](#node-argument-combinations) below | | The converged [settings](/key-concepts/settings.md) document for the node (or template version). |

:::note[Using the full path]
Like the other OpsChain keywords, `query` is available at the top level of your `actions.rb` and `resources.rb` files, within the `action` and `resource_type` blocks you define there, and inside a [base controller](#the-base-controller). Code in a class that does not inherit from the base controller — or include [`ControllerKeywords`](#adding-the-base-controller-behaviour-to-an-existing-class) — must use the full path to it, `OpsChain.query`. The two are equivalent.
:::

Every argument that identifies a node must be supplied with a value. Passing `nil` — `environment: OpsChain.environment_code` in a project level change, for example — raises an error rather than querying the parent node.

### Authentication

`query` authenticates using a short-lived API key that OpsChain injects into the step context. The key is supplied automatically and needs no configuration.

It inherits the permissions of the user that created the change, started the agent, or triggered the derivation of an asset's actions, so a query only succeeds for the nodes that user is authorised to view. Each key is revoked as soon as the change, agent or actions derivation that owns it finishes.

### Querying while your actions are being discovered

OpsChain loads your actions for two different reasons: to run a step, and to discover what your actions are without running any of them — when it derives an asset's actions from its template version, or builds a change's step tree.

A `query` made while your actions are being *discovered* is skipped by default. It returns an empty result — `{}` for a `:node`, `:mintmodel`, `:properties` or `:settings` query, and `[]` for a list query — so the surrounding code has something of the expected shape to work with, and OpsChain logs a warning naming the `actions.rb` line that made the call, the arguments it was given, and what was returned in its place.

Skipping it avoids issuing a request for data that discovery has no intention of using, and avoids failing discovery for a reason that has nothing to do with the actions being discovered. Supply `run_in_dry_run: true` when the answer shapes the actions or the step tree, and the query runs at this point as well:

```ruby
query(:node, project: 'demo', list: :environments, run_in_dry_run: true).each do |environment|
  action :"deploy_#{environment.dig(:attributes, :code)}" do
    OpsChain.logger.info("Deploying #{environment.dig(:attributes, :code)}")
  end
end
```

The arguments are validated whether or not the query runs, so a malformed query is reported while your actions are being discovered rather than only when a step runs.

### Querying a node

Supplying the `:node` endpoint type returns the requested node's resource. Provide just the `project` to query a project, add an `environment` and/or `asset` to query nested nodes:

```ruby
action :show_environment do
  environment = query(:node, project: 'demo', environment: 'dev')
  OpsChain.logger.info("Environment name: #{environment[:attributes][:name]}")
end
```

The arguments supplied must identify a node in the project's node hierarchy, so they must form one of the following combinations:

- `project`
- `project`, `environment`
- `project`, `asset`
- `project`, `environment`, `asset`
- `project`, `agent`

Any other combination raises an error — supplying an `agent` alongside an `environment`, for example, as agents belong directly to a project.

### Listing child nodes

Adding the `list` argument returns every child node of the requested type rather than a single node. This lets action code discover the nodes that exist rather than hard coding their codes:

```ruby
action :show_environments do
  environments = query(:node, project: 'demo', list: :environments)
  codes = environments.map { |environment| environment.dig(:attributes, :code) }
  OpsChain.logger.info("Environment codes: #{codes.join(', ')}")
end
```

The `list` argument accepts `:environments`, `:assets`, or `:agents`, and the arguments supplied alongside it must identify the parent node:

| Arguments | Returns |
|-----------|---------|
| `project`, `list: :environments` | Every environment in the project. |
| `project`, `list: :assets` | Every asset that belongs directly to the project. |
| `project`, `environment`, `list: :assets` | Every asset in the environment. |
| `project`, `list: :agents` | Every agent in the project. |

Any other combination raises an error — supplying an `environment` alongside `list: :environments`, for example.

Each element of the returned array is a node resource with its own `id`, `type`, and `attributes`, in the same form as the single node query returns. A parent with no children of that type returns an empty array.

:::note
`project` with `list: :assets` returns only the assets that belong directly to the project. Assets that belong to an environment are returned by supplying that `environment` as well.
:::

### Querying properties and settings

The `:properties` and `:settings` endpoint types return the fully converged document for a node, with all inherited values resolved exactly as they would be when running a change against that node.

```ruby
action :read_related_properties do
  properties = query(:properties, project: 'demo', environment: 'dev', asset: 'wls')
  database_host = properties.dig(:database, :host)

  settings = query(:settings, project: 'demo', environment: 'dev')
  OpsChain.logger.info("pod_per_change_step: #{settings[:pod_per_change_step]}")
end
```

#### Node argument combinations

The `:properties` and `:settings` endpoint types accept any one of the following keyword argument combinations:

- `project`
- `project`, `agent`
- `project`, `asset`
- `project`, `environment`
- `project`, `environment`, `asset`
- `project`, `template`, `version`

When `template` and `version` are supplied, OpsChain looks up the named template within the project to resolve it and returns the converged document for that template version:

```ruby
action :read_template_properties do
  properties = query(:properties, project: 'demo', template: 'web', version: '1.0.0')
end
```

### Querying a MintModel

The `:mintmodel` endpoint type returns the data of the MintModel generated for an asset. The `project` and `asset` are required, and an `environment` can be supplied to query the asset within a specific environment:

```ruby
action :read_mintmodel do
  mintmodel = query(:mintmodel, project: 'demo', environment: 'dev', asset: 'wls')
  OpsChain.logger.info("MintModel region: #{mintmodel[:region]}")
end
```

### Error handling

`query` raises an `ArgumentError` when the supplied keyword arguments do not form a valid combination for the endpoint type (for example a missing required argument, an unexpected argument, or an incomplete `:properties`/`:settings` combination).

If the request reaches the API server but no matching record is found, or the API request itself fails (for example a network error or an authentication failure), an `OpsChain::Core::Api::Request::Error` is raised. The response code and body are written to the change logs to help with troubleshooting.

:::note
By default `query` connects to the OpsChain API server at `http://opschain-api:3000`. This can be overridden with the `OPSCHAIN_API_URL` environment variable, though the default is correct for actions running inside the OpsChain cluster.
:::

## Sending email

Action code can send an email while a change or agent is running using the `send_email` keyword. This is useful when an action needs to reach someone outside the people who have subscribed to [notifications](/operations/notifications.md) — for example emailing a generated report to a distribution list, or telling a downstream team that an environment is ready for them.

```ruby
send_email(subject:, body:, to:, cc:, bcc:, from:, content_type:, attachments:)
```

The email is sent using the server settings of the [default email channel](/operations/notifications.md#email-channel), so an administrator must have configured one — and left it enabled — before actions can send email. Like `query`, `send_email` [authenticates](#authentication) with the short-lived API key OpsChain injects into the step context, is available wherever the other OpsChain keywords are — including inside a [base controller](#the-base-controller), but excluding a [resource definition](#keywords-a-resource-definition-does-not-have), which deliberately does not have it — and can be reached from a class that is not one using its full path, `OpsChain.send_email`. Only the step context's key can send email this way; a personal API key cannot.

| Argument | Required | Description |
|----------|----------|-------------|
| `subject` | yes | the subject line |
| `body` | yes | the body of the email |
| `to`, `cc`, `bcc` | at least one | the recipients — each accepts a single address or an array of addresses |
| `from` | no | the sender address — defaults to the OpsChain no-reply address |
| `content_type` | no | `text/plain` (the default) or `text/html` |
| `attachments` | no | the files to attach — see [attaching files](#attaching-files) below |

:::note[The sender address is not restricted]
`from` accepts any address. OpsChain does not check that it belongs to your organisation, and the email is relayed by the default email channel whichever change or agent sent it. Where the sender address matters, restrict it at the SMTP server OpsChain relays through rather than relying on action code to be well behaved.

When `from` is omitted, OpsChain's own no-reply address is used. The _from_ address configured on the default email channel applies to notifications only — it is not used for email sent from action code.
:::

```ruby
action :notify_release_team do
  send_email(
    subject: "#{OpsChain.context.parents.project.name} deploy complete",
    body: 'The deploy action completed successfully.',
    to: 'release-team@example.com',
    cc: ['ops@example.com', 'audit@example.com']
  )
end
```

Supplying `content_type: 'text/html'` sends the body as HTML rather than plain text:

```ruby
action :notify_with_summary do
  send_email(
    subject: 'Nightly refresh summary',
    body: '<h1>Nightly refresh</h1><p>All assets converged.</p>',
    content_type: 'text/html',
    to: 'ops@example.com'
  )
end
```

`send_email` returns the details of the sent message — its `from`, `to`, `cc`, `bcc`, `subject`, `attachment_filenames` and `sent_at`:

```ruby
action :notify_and_log do
  email = send_email(subject: 'Deploy complete', body: 'Done.', to: 'ops@example.com')
  OpsChain.logger.info("Notified #{email[:attributes][:to].join(', ')} at #{email[:attributes][:sent_at]}")
end
```

### Attaching files

Each attachment is supplied as a hash with a `filename` and the file's `content`, and may optionally supply a `content_type` telling the recipient's mail client what sort of file it is. The content is supplied as read from disk — OpsChain encodes it for transport, so there is no need to encode it yourself:

```ruby
action :email_converged_properties do
  send_email(
    subject: 'Converged properties',
    body: 'The converged properties are attached.',
    to: 'ops@example.com',
    attachments: [
      { filename: 'properties.json', content: File.read('properties.json'), content_type: 'application/json' },
      { filename: 'summary.csv', content: File.read('summary.csv') }
    ]
  )
end
```

:::note
The combined size of all attachments on a single email must not exceed 5MB.

A filename cannot contain a path separator, a quote character or a control character. A message carrying such an attachment cannot be assembled into a form the recipient's mail client can read, so OpsChain rejects the email rather than delivering a message with the attachment silently missing.
:::

### Handling failures

`send_email` raises an `ArgumentError` before contacting the API server when the supplied keyword arguments are incomplete or unrecognised — a missing `subject` or `body`, an unexpected argument, none of `to`, `cc` and `bcc` being supplied, an unsupported `content_type`, or an attachment that is missing its `filename` or `content`.

If the request reaches the API server but the email cannot be sent, an `OpsChain::Core::Api::Request::Error` is raised. The response code and body are written to the change logs to help with troubleshooting. The most common causes are no default email channel having been configured or enabled, attachments exceeding the size limit, an unusable attachment filename, and the SMTP server rejecting the message.

### Audit trail

Every email sent from action code is recorded as an `api:email:create` [event](/key-concepts/events.md), attributed to the user who started the change or agent. The event captures the address the message was actually sent from, the recipients, the subject, and each attachment's filename and size. The message body and the attachment content are never recorded.

If the message cannot be delivered, an `api:notification:error` event records the same addresses and subject along with the reason the send failed, so an operator can tell which message was lost without needing the change logs.

## Running the OpsChain CLI

Action code can run the [OpsChain CLI](/getting-started/familiarisation/cli/index.md) while a change or agent is running using the `opschain_cli` keyword. This is useful when an action needs to alter something in OpsChain rather than just read from it — starting a change on another node, updating a node's properties, or creating an asset from a template version.

```ruby
action :promote_to_staging do
  opschain_cli('changes', 'create', '-P', 'demo', '-E', 'staging', '-A', 'store', '-a', 'deploy', '-w')
end
```

The arguments are passed to the `opschain` executable in the runner image as supplied. Like [`exec_command`](#opschain-exec_command), a single string is parsed into separate arguments, so `opschain_cli('projects list')` and `opschain_cli('projects', 'list')` are equivalent. `opschain_cli` accepts the same [keyword arguments](#keyword-arguments) — `env`, `options`, `log_command`, `live_stream`, `logger` and `abort_on_failure` — and returns the same [`CommandResult`](#output).

:::note[Using the full path]
Like the other OpsChain keywords, `opschain_cli` is available at the top level of your `actions.rb` and `resources.rb` files, within the `action` and `resource_type` blocks you define there, and inside a [base controller](#the-base-controller). Code in a class that does not inherit from the base controller — or include [`ControllerKeywords`](#adding-the-base-controller-behaviour-to-an-existing-class) — must use the full path to it, `OpsChain::Dsl::CliCommand.execute`. The two are equivalent.
:::

### Authenticating the CLI

`opschain_cli` gives the CLI the credentials and the server address it needs, so a runner requires no config file, profile or login step. It [authenticates](#authentication) with the same short-lived API key as `query`, supplying it to the CLI as `OPSCHAIN_TOKEN`, and points the CLI at the OpsChain API server with `OPSCHAIN_API_URL`.

The key carries the permissions of the user who created the change or started the agent, and the CLI can use it to alter OpsChain as well as read from it. Your project's action code therefore acts with that user's authority, so treat it as privileged automation: review what lands in the project's git repository, and be deliberate about the values you interpolate into a CLI argument.

:::warning
An argument containing `${` causes the whole command to be run through a shell, so a property value holding shell syntax can change the command that is executed. Avoid interpolating values you do not control into `opschain_cli` arguments.
:::

Anything supplied in `env` takes precedence over both variables. Supplying your own `OPSCHAIN_TOKEN` — an API key token held in the [secret vault](#opschain-secret-vault), for example — runs the command as that token's owner instead of as the change's user.

### Non-interactive commands only

A step has no terminal attached, so a subcommand that asks for confirmation never receives an answer and the step waits indefinitely. Pass `--force` to the subcommands that prompt, such as `admin pods delete` and `tokens delete-all`.

### Using the command output

The CLI writes human-readable tables by default. Pass `-o json` when the action needs to work with the result, and read it from the returned result's `stdout`:

```ruby
action :log_environment_codes do
  result = opschain_cli('environments', 'list', '-P', 'demo', '-o', 'json', live_stream: false)

  JSON.parse(result.stdout).each do |environment|
    OpsChain.logger.info("Environment: #{environment.dig('attributes', 'code')}")
  end
end
```

See [output formats](/getting-started/familiarisation/cli/index.md#output-formats) in the CLI guide for the formats available.

### Running the CLI while your actions are being discovered

A command issued while your actions are being [discovered](#querying-while-your-actions-are-being-discovered) rather than run is skipped by default. Nothing is executed, a successful result with empty output is returned, and OpsChain logs a warning naming the `actions.rb` line that made the call and the arguments it was given.

Supply `run_in_dry_run: true` when the command's output shapes the actions or the step tree, and the CLI runs at this point as well. A command that alters OpsChain is best left with the default, so that it only runs when the step does.

### Error handling

`opschain_cli` raises an `OpsChain::Dsl::CliCommand::Error` when it cannot run the CLI at all:

- no API key is available — the keyword works only while a change or agent is running
- the runner image does not contain the OpsChain CLI at `/usr/local/bin/opschain`.

Once the CLI runs, failures behave as they do for `exec_command`. A non-zero exit status raises a `RuntimeError` and fails the step, unless `abort_on_failure: false` is supplied — in which case check `result.failed?` and `result.stderr` to determine the outcome.

## What to do next

Learn about the OpsChain [step runner](/key-concepts/step-runner.md).
