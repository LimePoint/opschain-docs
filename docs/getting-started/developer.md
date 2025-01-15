---
sidebar_position: 2
description: Learn about the `actions.rb` file, the heart OpsChain changes.
---

# Developer edition

The `actions.rb` in the project Git repository is the core of an OpsChain change. After following this guide you should understand:

- how to add actions to the `actions.rb` file for use in a change
- how to add resource types and resources to the `actions.rb` file for use in a change
- how to create a simple controller to support a resource type

## Prerequisites

If you have not already done so, we suggest completing the main [getting started guide](/docs/getting-started/README.md) before this guide.

This guide assumes that:

- you have access to a running OpsChain API server, either locally or network accessible. See the [getting started installation guide](/docs/operations/installation.md) for more details
- you have installed:
  - the [OpsChain CLI](/docs/reference/cli.md#installation) - including setting up all the [dev dependencies](/docs/reference/cli.md#dev-subcommand-dependencies)
  - [Docker](https://docs.docker.com/engine/install/)
  - [Docker Compose](https://docs.docker.com/compose/install/)

### Create a Git repository

OpsChain projects can use remote Git repositories to centrally manage configuration.

Create a new Git repository for this guide:

```bash
mkdir opschain-git-repo
cd opschain-git-repo
git init
```

This guide uses an [existing repository](https://github.com/LimePoint/opschain-getting-started) that already contains some sample content. [Fork](https://docs.github.com/en/get-started/quickstart/fork-a-repo) the [sample repo](https://github.com/LimePoint/opschain-getting-started) on GitHub and use your own fork to allow you to push your changes and use them from your OpsChain project.

```bash
git remote add origin https://{github username}:{github personal access token}@github.com/{github username}/opschain-getting-started.git
git fetch
git checkout developer-guide
```

#### Repository setup

All OpsChain project Git repositories must contain a `Gemfile` and an `actions.rb`.

```bash
$ tree
├── Gemfile
└── actions.rb
```

By using the existing sample repository these files have already been created - but with normal repositories they will need to be created manually.

## Running OpsChain actions

OpsChain changes run actions from a project's Git repository.

OpsChain actions can be developed interactively in the OpsChain development environment, accessed via the `opschain dev` CLI subcommand.

:::tip
Throughout the documentation, the following prefixes for bash commands will be used to denote where the command should be run.

- `[host] $` execute the command on your local host
- `[dev] $` execute the command inside the OpsChain development environment

:::

### Developing actions locally

Start the OpsChain development environment:

```bash
# From your project repository folder
[host] $ opschain dev
```

The OpsChain development environment opens a Bash prompt within an OpsChain runner container. You can now use the `opschain-action` utility to list the actions available within the current project Git repository:

```bash
[dev] $ opschain-action -AT # this will list all actions - use `opschain-action -T` to show only actions with a description
```

The sample branch we checked out earlier has an `actions.rb` file in the repository that contains a single action, `hello_world`.

You can run this action in the development environment by using the `opschain-action` command as follows:

```bash
[dev] $ opschain-action hello_world
Hello world
```

:::tip
Once an action is ready, the `opschain change create` command should be used to execute it via the OpsChain server to gain the collaboration and auditing benefits that OpsChain provides. This also allows the change to run with secure network access that can be granted to the OpsChain server, without giving that network access directly to developers.
:::

### Adding a new action

Open the `actions.rb` file with your favourite editor so that you can add a new action to the Git repository.

Add the following to the bottom of the file (after the `hello_world` action):

```ruby
desc 'Say goodbye world' # if this line were omitted then this action would not be shown in the tasks displayed by `opschain-action -T`
action :goodbye_world do
  puts 'Goodbye world' # you could write any Ruby in here, but OpsChain provides a friendlier API in addition to this
end
```

You can now manually run the new `goodbye_world` task in addition to the existing `hello_world` task:

```bash
[dev] $ opschain-action hello_world goodbye_world
Hello world
Goodbye world
```

Add the following to the `actions.rb` file to configure the project to run both of these actions as the default action (i.e. when you don't specify which action to run):

```ruby
action default: [:hello_world, :goodbye_world]
```

You can now run the default action:

```bash
[dev] $ opschain-action
Hello world
Goodbye world
```

#### Leveraging OpsChain steps

Splitting OpsChain actions into steps allows OpsChain to:

- isolate the step execution - to avoid concurrency conflicts and improve security
- report on the progress of a change

To help your changes complete faster, steps can also run in parallel - we'll cover this later.

Steps are run in isolated runner containers when run as part of an OpsChain change.

Edit the `actions.rb` file to make the `default` action run its dependent actions as steps:

```ruby
action :default, steps: [:hello_world, :goodbye_world]
```

Child steps are always run automatically when running a change, however to automatically run these child steps when running them in the OpsChain development environment the `OPSCHAIN_ACTION_RUN_CHILDREN` environment variable must be set to `true`:

```bash
[dev] $ opschain-action
2021-01-01 12:05:00.000+1000 WARNING: Child steps (hello_world, goodbye_world) will not be executed - set OPSCHAIN_ACTION_RUN_CHILDREN to run locally.
[dev] $ export OPSCHAIN_ACTION_RUN_CHILDREN=true
[dev] $ opschain-action
Hello world
Goodbye world
```

:::tip
Add `export OPSCHAIN_ACTION_RUN_CHILDREN=true` to your host's shell configuration (e.g. `~/.zshrc`) to avoid needing to set it each time you start the development environment.
:::

#### OpsChain lint pre-commit hook

OpsChain provides a linting command for detecting issues in project Git repositories.

This command is automatically setup as a pre-commit hook for project Git repositories created by OpsChain.

If you would like to commit code that fails linting (e.g. incomplete code) the Git `--no-verify` argument can be used when committing, e.g. `git commit --no-verify`.

See the [OpsChain lint](/docs/development-environment.md#using-the-opschain-linter) documentation to learn more.

#### Commit your action

Commit the changes to the `actions.rb` file to allow them to be used via the OpsChain server:

```bash
[host] $ git add actions.rb
[host] $ git commit -m 'Add a goodbye action and run hello_world and goodbye_world by default.'
```

### Running the action as a change (optional)

Now that you've developed and tested your actions, use the OpsChain server to run them as part of a change. This facilitates collaboration and record keeping, and can also be done to improve security by only executing changes in a secure environment.

This step assumes you have completed the [running sample changes](/docs/getting-started/README.md#setup-opschain-to-run-a-simple-sample-change) steps from the getting started guide - alternatively you could create a new [project](/docs/getting-started/README.md#create-an-opschain-project) and [environment](/docs/getting-started/README.md#create-an-opschain-environment) to run the change in.

#### Push your commit to the remote

Push your new Git commit to the Git repository on GitHub for use by your project Git repository:

```bash
[host] $ git push origin HEAD:hello-goodbye
```

#### Add the project Git remote

Associate your Git repository with the `web` project created during the getting started guide.

```bash
# Note: to avoid potentially storing the repository credentials in the shell history the `-U` (user) and `-P` (password) arguments can be omitted and filled in when prompted
# Option 1: Using password authentication:
$ opschain project add-git-remote -p <project code> -n origin -U '{username}' -P '{password / personal access token}' -u 'https://github.com/{username}/opschain-getting-started.git'
# Option 2: Using SSH authentication:
$ opschain project add-git-remote -p <project code> -n origin -s ./path/to/private/key -u 'git@github.com:{username}/opschain-getting-started.git'
```

#### Run the change

Use the OpsChain CLI to run the change using the OpsChain server. This will run the new steps in isolated containers and will report on the status of each step as it progresses.

```bash
opschain change create -p web -e test -G origin -g hello-goodbye -a '' -y # -a '' is a synonym for -a 'default'
```

Use the `opschain change show-logs` command in another terminal to see the latest log output whilst the change is still executing, or wait until the change completes:

```bash
opschain change show-logs -c xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx # the change ID from the change create output
```

## Developing resources

OpsChain resources and resource types are features of the `actions.rb` file that make your configuration easier to follow and more reusable.

Using resources is very simple, here is an example `temp_file` resource using a non-existent `file` _resource type_ to demonstrate:

```ruby
# this won't work, yet
file :temp_file do
  path '/tmp/testing'
  content 'Hello :-)'
end
```

This `temp_file` resource configures two properties - `path` and `content`. These would need to be supported by the `file` resource type.

Resources can define actions, for example you could define a `create` action as part of this resource:

```ruby
# this won't work, yet
file :temp_file do
  path '/tmp/testing'
  content 'Hello :-)'

  action :create do
    OpsChain.logger.info 'Lets create a file.'
  end
end
```

With a working resource type (which we haven't created yet), you could run this action using `opschain-action temp_file:create` - note how this uses the resource name and the action name.

Resources are instances of resource types. The resource type is the backing definition of the resource.

A basic `file` resource type for the `temp_file` resource above could be:

```ruby
resource_type :file do
  property :path
  property :content
end
```

If we assume all file resources can be created the same way, the `create` action can be moved from the `temp_file` resource to the `file` resource type - this allows it to be reused. Replace the contents of the sample `actions.rb` with the following to demonstrate this:

```ruby
Bundler.require

resource_type :file do
  property :path
  property :content

  action :create do
    OpsChain.logger.info 'Lets create a file.'
  end
end

file :temp_file do
  path '/tmp/testing'
  content 'Hello :-)'
end
```

Now run the `temp_file:create` command:

```bash
[dev] $ opschain-action temp_file:create
2021-01-01 12:05:00.000+1000 Lets create a file.
```

As you can see, this has run the Ruby code in the `create` action. Inside the resource type, modify the action definition to create the file:

```ruby
action :create do
  OpsChain.logger.info "Lets create a file: #{path}"
  File.write(path, content)
end
```

Run the `temp_file:create` command again:

```bash
[dev] $ opschain-action temp_file:create
2021-01-01 12:05:00.000+1000 Lets create a file: /tmp/testing
[dev] $ cat /tmp/testing
Hello :-)
```

## What to do next

### Learn more about OpsChain actions

Read our more comprehensive [actions reference guide](/docs/reference/concepts/actions.md) to learn more about creating actions, resources, resource types and controllers.

### Create OpsChain actions that need manual intervention

Read more about [OpsChain wait steps](/docs/reference/concepts/actions.md#wait-steps) to learn how to create changes that can pause and wait for human intervention before continuing.

### Learn more about the OpsChain step runner

Read our more comprehensive [step runner guide](/docs/reference/concepts/step-runner.md) to learn more about how OpsChain steps are executed - and how to install custom commands and dependencies.

### Learn more about OpsChain properties

Follow the [properties](/docs/reference/concepts/properties.md) guide to try editing some [project](/docs/reference/concepts/concepts.md#project) or [environment](/docs/reference/concepts/concepts.md#environment) properties.

### Try more advanced examples

The [OpsChain examples](/docs/category/examples) include a variety of tutorials and Git repository samples for you to explore.
