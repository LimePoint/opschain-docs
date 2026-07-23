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

### Ignoring an action failure

Whenever an action raises an unhandled exception, the step (and subsequently the change) status will be set to `error`. You can ignore an action failure by setting the `ignore_failure` option to `true` when defining the action, for example:

```ruby
action :hello_world, ignore_failure: true do
  raise "This action will always fail"
end
```

In the example above, the action will fail, but the change will continue normally and the step will be marked as `success`.

## Sequencing actions

In addition to the action name, OpsChain's DSL allows you to specify [prerequisite actions](#prerequisite-actions) (to run before the action's block) and [child steps](#child-steps) (to run after the action's block). In this way you can describe a sequence of actions to perform.

### Referencing actions by name or step name

Wherever an action is referenced — in an action's `steps:` list, as the action passed to `opschain-action`, or as the action a change runs — it can be named by its action name or its [step name](#change-step-naming). OpsChain resolves the reference to the real action name: an exact match is tried first, then a case-insensitive match against every action's name and step name.

:::note
A reference that matches more than one action — for example, two actions whose step names differ only by case — is rejected with an ambiguity error, so step names must be unique to be used as a reference.
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
When a step name contains `/`, OpsChain resolves it by full path rather than by name. This ensures a nested MintModel action is correctly targeted even when a wrapper step (such as one created by `OpsChain.step` or `OpsChain.ignore_failure_step`) has the same name.
:::

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
- all of its input arguments have default values (or it has none).

Wait steps that require approval, or that have input arguments without defaults, still pause and wait for a user. Each automatically continued step is recorded in the change's audit history.

The option can be set when running, scheduling, or repeating a change from the GUI — see the run or schedule change dialog.

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
        {
          server_name: { path: '/database/server', gui_name: 'Server name', description: 'Name of the server to restart' },
          patch_number: { path: '/patches', gui_name: 'Patch number', description: 'Optional patch to apply before restart', required: false },
          restart_after_hours: { path: '/restart_after_hours', gui_name: 'Restart after hours', required: true, type: :boolean, default_value: true }
        }
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
| `default_value` | The default value to be displayed to the user for the input argument.                                                                                                                                                                                                                   | nil                                                                      |
| `description`   | A description to be displayed to the user for the input argument.                                                                                                                                                                                                                       | nil                                                                      |
| `gui_name`      | The name to be displayed to the user for the input argument.                                                                                                                                                                                                                            | The argument's name in title case (e.g. "Server name" for `server_name`) |
| `overwrite`     | Whether the value provided by the user for the input argument should overwrite any existing value in the converged properties at the specified `path`.                                                                                                                                  | false                                                                    |
| `path`          | The path in the change override properties where the value will be nested under. E.g. in the example above, if the user supplied 'db1' for the `server_name` argument, OpsChain will update the change override properties to include `{ database: { server: { server_name: db1 } } }`. | `/`                                                                      |
| `required`      | Whether the user must provide a value for the input argument before they can submit the form to continue the change.                                                                                                                                                                    | true                                                                     |
| `type`          | The data type of the input argument. Available options are :boolean, :date, :float, :integer, :string, :array, :hash.                                                                                                                                                                   | `:string`                                                                |

The input arguments field accepts an array or hash of argument definitions. In the example above, the `comments` argument assumes default values for the various parameters. e.g.

```ruby
comments: { default_value: nil, description: nil, gui_name: 'Comments', overwrite: false, path: '/', required: true, type: :string }`.
```

The remaining arguments in the example override these defaults as needed. For example the `restart_after_hours` argument will require a boolean response from the user rather than a string.

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

| Option | Default | Description |
|---|---|---|
| `ignore_failure:` | `false` | If `true`, the change will continue even if the wrapped action fails. |
| `wait:` | `false` | If `true`, the wrapped action becomes a **child** of a new wait step — the change pauses for manual continuation before the wrapped action starts. Pass an integer to sleep for that many seconds instead. |
| `input_arguments:` | `nil` | The wrapped action becomes a **child** of a new input step — the change pauses and prompts the user for input before the wrapped action starts. Mutually exclusive with `wait:`. |
| `step_name:` | `nil` | A custom display name for the resulting step — the wait/input step when `wait:`/`input_arguments:` is used, or the wrapper step otherwise. |
| `wait_step_name:` | `nil` | A custom display name for the wait or input step specifically. Only relevant alongside `wait:`/`input_arguments:`; takes precedence over `step_name:` if both are given. |

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

### Controller

Defining inline actions as in the example above limits your ability to adequately test the action code. Moving the code into a controller class allows the code to more readily be tested and reduces the need to change your resource type definition to change its action logic.

Re-writing the example above to make use of a controller simplifies the resource type definition:

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

:::note[NOTES]

1. The `available_actions:` keyword will expose each controller method supplied to it as an action on the resource.
2. If you would like to provide descriptions for your controller actions, the array supplied to the `available_actions:` keyword can include a [Ruby hash](https://ruby-doc.org/core-2.7.0/Hash.html) for each method. E.g. `available_actions: [{ name: :report_weather, description: 'Output how the weather looks in the city' }]`.
3. If your controller contains multiple actions, `available_actions:` can be supplied a mixture of actions with and without descriptions as required. E.g. `available_actions: [{ name: :report_weather, description: 'Output how the weather looks in the city' }, :action_without_description]`
4. In addition to a custom description, each action hash can include the optional `step_name:` and `ignore_failure:` keys. `step_name:` overrides the step name displayed in the OpsChain GUI. `ignore_failure:` (boolean) marks the action to continue the change on failure. E.g. `available_actions: [{ name: :report_weather, description: 'Output how the weather looks in the city', step_name: 'Report the weather', ignore_failure: true }]`
5. Alternatively, `available_actions:` can be supplied as a hash where each key is an action name and the value is its description. E.g. `available_actions: { report_weather: 'Output how the weather looks in the city' }`.

:::

Resources created from this `city` resource type would have the same actions (and same action output) as those created from the earlier type definition.

:::note[NOTES]

- The class constructor must accept a single [Ruby hash](https://ruby-doc.org/core-2.7.0/Hash.html) parameter, which will include each of the resource properties defined on the resource. This hash is the resource's `properties` at the time the controller is constructed.
- The action methods must not require parameters.

:::

:::tip

To improve performance, it's best to avoid using the options passed to the controller until they are needed (i.e. do `@options = options`, not `@name = options[:name]`).

:::

#### Controller actions and properties

Controllers can define the `resource_type_actions` and/or `resource_type_properties` class methods to expose their default actions and properties to OpsChain. Using these methods, the example above could be re-written as:

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

:::note[NOTES]

1. If you supply the `available_actions:` parameter when defining the resource type's controller, the controller's `resource_type_actions` will be ignored and only those methods passed to `available_actions:` will be exposed.
2. As per the values that can be supplied to the `available_actions:` kwarg described in the previous example, the controller's `resource_type_actions` class method can return an array containing a mixture of action names and descriptive hashes. E.g.

```ruby
  def self.resource_type_actions
    [{ name: :action_with_description, description: 'An action with a description', step_name: 'GUI step name' }, :action_without_description]
  end
end
```

:::

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

The `available_actions` method accepts arguments in the same formats as the `available_actions:` kwarg on `controller` (see [controller notes](#controller)):

- A symbol or string: `available_actions :deploy, :restart`
- A key-value hash of name → description: `available_actions(deploy: 'Deploy the server', restart: 'Restart the server')`
- An array of hashes with a `name:` key (supports `description:`, `step_name:`, and `ignore_failure:`): `available_actions({ name: :deploy, description: 'Deploy the server', step_name: 'Run deployment' })`
- Any mixture of the above formats

:::note
Calling `available_actions` on a resource **replaces** the set of visible controller actions for that resource. In the example above, `production` exposes only `deploy` and `restart`, even though the resource type also defines `shutdown`.
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

If you'd like to alias the `log` object to something else, you can still refer to the OpsChain logger using the full path to it, for example:

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

OpsChain allows you to interact with a secret vault to securely manage sensitive information. The secret vault is accessible from within your actions via OpsChain's `secret_vault` property (`OpsChain.secret_vault`).

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

Action code can read live data from the OpsChain API server while a change is running using the `OpsChain.query` helper. This is useful when an action needs information about another node — for example the properties of a related environment, the converged settings of an asset, or the MintModel generated for an asset.

```ruby
OpsChain.query(endpoint_type, **kwargs)
```

The first argument is the type of resource to query and the keyword arguments identify the node (or template version) to query. The supported endpoint types are:

| Endpoint type | Required arguments | Optional arguments | Returns |
|---------------|--------------------|--------------------|---------|
| `:node`       | `project`          | `environment`, `asset` | The project, environment, or asset resource, including its `id`, `type`, and `attributes`. |
| `:mintmodel`  | `project`, `asset` | `environment`      | The data of the asset's [MintModel](/getting-started/familiarisation/gui/projects/asset_templates.md#asset-templates-with-a-mintmodel). |
| `:properties` | one of the [node combinations](#node-argument-combinations) below | | The converged [properties](/key-concepts/properties.md) document for the node (or template version). |
| `:settings`   | one of the [node combinations](#node-argument-combinations) below | | The converged [settings](/key-concepts/settings.md) document for the node (or template version). |

### Authentication

`OpsChain.query` authenticates using a short-lived API key that OpsChain injects into the step context. This key is only generated when the relevant token expiry setting is enabled — [`token.change_api_key_expiry_days`](/key-concepts/settings.md#tokenchange_api_key_expiry_days) for changes and [`token.agent_api_key_expiry_days`](/key-concepts/settings.md#tokenagent_api_key_expiry_days) for agents. Both default to `0`, which disables key generation.

If no API key is present in the step context, `OpsChain.query` raises an error. The key inherits the permissions of the user that created the change (or started the agent), so a query will only succeed for nodes that user is authorised to view.

### Querying a node

Supplying the `:node` endpoint type returns the requested node's resource. Provide just the `project` to query a project, add an `environment` and/or `asset` to query nested nodes:

```ruby
action :show_environment do
  environment = OpsChain.query(:node, project: 'demo', environment: 'dev')
  OpsChain.logger.info("Environment name: #{environment[:attributes][:name]}")
end
```

### Querying properties and settings

The `:properties` and `:settings` endpoint types return the fully converged document for a node, with all inherited values resolved exactly as they would be when running a change against that node.

```ruby
action :read_related_properties do
  properties = OpsChain.query(:properties, project: 'demo', environment: 'dev', asset: 'wls')
  database_host = properties.dig(:database, :host)

  settings = OpsChain.query(:settings, project: 'demo', environment: 'dev')
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
  properties = OpsChain.query(:properties, project: 'demo', template: 'web', version: '1.0.0')
end
```

### Querying a MintModel

The `:mintmodel` endpoint type returns the data of the MintModel generated for an asset. The `project` and `asset` are required, and an `environment` can be supplied to query the asset within a specific environment:

```ruby
action :read_mintmodel do
  mintmodel = OpsChain.query(:mintmodel, project: 'demo', environment: 'dev', asset: 'wls')
  OpsChain.logger.info("MintModel region: #{mintmodel[:region]}")
end
```

### Error handling

`OpsChain.query` raises an `ArgumentError` when the supplied keyword arguments do not form a valid combination for the endpoint type (for example a missing required argument, an unexpected argument, or an incomplete `:properties`/`:settings` combination).

If the request reaches the API server but no matching record is found, or the API request itself fails (for example a network error or an authentication failure), an `OpsChain::Core::Api::Request::Error` is raised. The response code and body are written to the change logs to help with troubleshooting.

:::note
By default `OpsChain.query` connects to the OpsChain API server at `http://opschain-api:3000`. This can be overridden with the `OPSCHAIN_API_URL` environment variable, though the default is correct for actions running inside the OpsChain cluster.
:::

## What to do next

Learn about the OpsChain [step runner](/key-concepts/step-runner.md).
