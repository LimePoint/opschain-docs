---
sidebar_position: 3
---

# Development environment

The OpsChain Docker-based development environment enables you to list and run individual actions in a manner similar to a running change. After following this guide you should know how to:

- create a `step_context.json` file to provide environment variables and properties for your action(s)
- enter the interactive OpsChain development environment to:
  - list available project resources and actions
  - develop and test your project actions

## Introduction

OpsChain resources and actions can be developed using the OpsChain development environment, accessed via the `opschain dev` CLI command.

## Prerequisites

This guide assumes that you have performed the following steps from the installation guide:

- [Configured Docker Hub access](/advanced/cli/advanced-cli.md#configure-docker-hub-access)
- [Downloaded the OpsChain CLI](/advanced/cli/advanced-cli.md#installation)
- [Created an OpsChain project](/getting-started/tutorials/structure.md#creating-an-opschain-project)
- [Created a project Git repository](/advanced/developer.md#create-a-git-repository) and associated its remote with your OpsChain project.

### Optional prerequisite - secret vault configuration

If you require access to a HashiCorp Vault, or compatible product, via the `OpsChain.secret_vault` keyword you will need to set the following environment variables in your development environment prior to running `opschain-action`:

| Environment Variable               | Description                                                                                                                                                                                                                                                                     |
|------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| OPSCHAIN_VAULT_ADDRESS             | The address for the Vault server - e.g. `http://vault.example.com:8200`                                                                                                                                                                                                         |
| OPSCHAIN_VAULT_AUTH_METHOD         | The method used for authentication - valid values are: `token`, `userpass`, `ldap`                                                                                                                                                                                              |
| OPSCHAIN_VAULT_TOKEN               | The token used for authentication (required if the authorisation method is `token`)                                                                                                                                                                                             |
| OPSCHAIN_VAULT_USERNAME            | The username for `userpass` or `ldap` authentication                                                                                                                                                                                                                            |
| OPSCHAIN_VAULT_PASSWORD            | The password for `userpass` or `ldap` authentication                                                                                                                                                                                                                            |
| OPSCHAIN_VAULT_MOUNT_PATH          | The path to the Vault mount (default: `kv/data`)                                                                                                                                                                                                                                |
| OPSCHAIN_VAULT_USE_MINT_ENCRYPTION | Flag indicating whether to encrypt values before storing them in vault (double encryption) - default: `true`                                                                                                                                                                    |
| OPSCHAIN_VAULT_CLIENT_OPTIONS      | A hash of options to pass to the Vault client, in JSON format. Refer to the Vault Ruby Client Gem [usage instructions](https://github.com/hashicorp/vault-ruby/tree/master?tab=readme-ov-file#usage) for the available options. e.g. `{ "ssl_timeout": 5, "read_timeout": 30 }` |

:::tip
These can be set manually or configured in the [environment variables](/key-concepts/properties.md#environment-variables) section of your `step_context.json`.
:::

### Navigate to the project Git repository

The `opschain dev` command launches an OpsChain step runner Docker container and must be run from an OpsChain project Git repository. The files in that directory will be made available in the container using a [Docker bind mount](https://docs.docker.com/storage/bind-mounts/).

```bash
$ cd /path/to/project/git/repository
$ opschain dev
[dev] $ bundle install
```

:::tip
The `opschain-action` commands below assume the OpsChain development environment is being run in the Git repository created as part of the [getting started - developer edition](/advanced/developer.md). If using a different project, modify these commands to reflect the OpsChain actions available.
:::

#### Create a `step_context.json` (optional)

The `opschain-action` command uses a `.opschain/step_context.json` file if it exists within the project Git repository working directory. For more information about the `step_context.json` file, see the [step runner reference guide](/key-concepts/step-runner.md#step-context-json).

```bash
$ mkdir -p .opschain
$ cat << EOF > .opschain/step_context.json
{
   "properties": {
     "project": $(opschain project show-properties -p web)
     "environment": $(opschain environment show-properties -p web -e test)
   }
}
EOF
```

If your actions rely on [OpsChain context](/key-concepts/context.md) values, include the required values in a "context" section in the file. E.g.

```text
{
  "context": {
    "parents": {
      "project": {
        "code": "demo"
      },
    }
  },
  "properties": {
...
```

A sample `step_context.json` file is available to view [here](/files/samples/step_context.json).

## Using the OpsChain development environment

The `opschain-action` command can be used to run OpsChain actions the same way they are run by the step runner. See the [OpsChain development environment](/advanced/developer.md#developing-actions-locally) section of the getting started guide for instructions on how to list and run individual actions.

Unlike when actions are run as part of an OpsChain change, the OpsChain development environment does not persist changes to the project and environment properties to the OpsChain database. Instead, the properties changes are output into the `.opschain/step_result.json` file. For more information about the `step_result.json` file, see the [step runner reference guide](/key-concepts/step-runner.md#step-result-json).

### Additional configuration

The following variables can be manually set inside the OpsChain development environment or configured in your host environment, and they will be passed through (e.g. in your `~/.zshrc`).

#### OPSCHAIN_ACTION_RUN_CHILDREN

Default value: _false_

Automatically run child steps in the local Docker development environment. See the [Docker development environment guide (child steps)](/advanced/development-environment.md#child-steps) for more details.

### Child steps

#### Viewing step dependencies

Within the OpsChain development environment (accessed via `opschain dev`), the `opschain-action` command can be used to view the expected step tree for an action. Using the `OPSCHAIN_DRY_RUN` environment variable means the step tree will be output without any of the actions running.

:::info
The steps listed may not be accurate during execution because the step information may change dynamically.
:::

```bash
[dev] $ OPSCHAIN_DRY_RUN=true opschain-action deploy_in_maintenance_mode
```

The `step_result.json` will now contain an `expected_step_tree` field showing the complete known step tree for the action.

#### Running child steps

During OpsChain change execution, each child step of an action is executed in its own isolated runner container. As the `opschain-action` command is being run in the OpsChain development environment, it does not execute an action's child steps. This safeguards the child steps from any issues that may arise from running them in the same container as their parent action. Instead, a warning is displayed, detailing the child steps that are not being run.

##### Automatic execution

To enable `opschain-action` to run child steps automatically, configure the `OPSCHAIN_ACTION_RUN_CHILDREN` environment variable:

```bash
[dev] $ OPSCHAIN_ACTION_RUN_CHILDREN=true opschain-action deploy_in_maintenance_mode
```

:::note NOTES

1. The `OPSCHAIN_ACTION_RUN_CHILDREN` variable:
   - can be set in your shell's configuration, e.g. your `.zshrc`, to persist the config
   - is only applicable when using `opschain-action` in the development environment and has no effect on actions running within an OpsChain change
2. The `run_as:` `:serial`/`:parallel` flags are ignored by `opschain-action` when running in the development environment. Child steps will always be executed sequentially.

:::

##### Manual execution

For more granular control of child step execution, actions and their child steps can be listed on the command line directly, and will be executed in the order specified:

```bash
[dev] $ opschain-action deploy_in_maintenance_mode enable_maintenance_mode deploy_war disable_maintenance_mode # manually run deploy_in_maintenance_mode and it's children in sequence
```

## Using the OpsChain linter

OpsChain provides a linting tool for detecting issues in project Git repositories. Currently, it only supports detecting Ruby syntax errors. To reduce the likelihood of committing mistakes into your project repository, the linter can be setup as a pre-commit hook in Git. To create the hook, run the following setup command from inside the OpsChain development environment:

```bash
[dev] $ opschain-lint --setup
```

:::note
The pre-commit hook will automatically ignore untracked files.
:::

If you would like to commit code that fails linting (e.g. incomplete code) the Git `--no-verify` argument can be used when committing, e.g. `git commit --no-verify`.

The hook can be removed permanently by removing the pre-commit hook script:

```bash
rm -f .git/hooks/pre-commit
```

If you would like to suggest a feature for OpsChain's linter please [contact us](mailto:opschain-support@limepoint.com).

### Manual linting

The command to invoke the linter manually differs depending on whether you are working inside or outside the OpsChain development environment.

- outside the OpsChain development environment, the linter can be invoked via the OpsChain CLI `opschain dev lint`
- inside the OpsChain development environment, the linter can be invoked via the `opschain-lint` command

When run manually, the linter tests all not-ignored files in the Git repository. To only lint files tracked by Git set the `OPSCHAIN_LINT_GIT_KNOWN_ONLY` environment variable, e.g.

`[host] $ OPSCHAIN_LINT_GIT_KNOWN_ONLY=true opschain dev lint`.

## Custom runner images

If your project uses a custom Dockerfile (`.opschain/Dockerfile`), the OpsChain CLI allows you to use it as the basis for your OpsChain development environment.

### Bundler credentials

If your custom Dockerfile uses OpsChain environment variables to supply credentials when running bundler, create a [step context JSON](#create-a-step_contextjson-optional) file in the `.opschain` directory that includes the relevant values and this will be used when building your image.

### Building and using a custom runner image

To build a Docker image from your project's Dockerfile and then use the image for your OpsChain development environment, execute the following command:

```bash
[host] $ opschain dev --build-runner-image --tag my_repository_runner:1.0.0
```

As part of this process, the CLI will tag the newly built image with the supplied tag.

:::note NOTES

1. If the `--tag` argument is not supplied with the `--build-runner-image` argument, the newly built image will be assigned the default tag `repository_runner:latest`.
2. When the CLI tags the newly built image (with the supplied tag or the default tag) the tag will be removed from any existing image with that tag.

:::

### Using a custom runner image

Once built, you can use a custom runner image (without rebuilding it) by supplying the tag to the `opschain dev` command:

```bash
[host] $ opschain dev --tag my_repository_runner:1.0.0
```

Alternatively, you can use the `OPSCHAIN_RUNNER_IMAGE` environment variable to specify the tag of the custom runner image. To make the change permanent specify OPSCHAIN_RUNNER_IMAGE in your shell config file, e.g.:

```bash
[host] $ echo export OPSCHAIN_RUNNER_IMAGE=\"my_repository_runner:1.0.0\" >> ~/.zshrc # or ~/.bashrc if using bash
[host] $ exec zsh # reload the shell config by starting a new session (replace zsh with bash as appropriate)
```

Now calls to `opschain dev` will use the custom image by default.

## Enabling tracing

When running OpsChain actions within the OpsChain development environment you can enable tracing by setting the OPSCHAIN_TRACE environment variable.

```bash
[dev] $ OPSCHAIN_TRACE=1 opschain-action hello_world
```

## Removing older runner images

The OpsChain development environment container uses the OpsChain step runner image. Upgrading the CLI will cause a new version of the image to be downloaded. To recover the space used by these older images, the `docker rmi` command can be used to remove them.

:::note
The following commands assume you are not using the OPSCHAIN_RUNNER_IMAGE to specify your runner image.
:::

To list the runner images on your machine, execute the following:

```bash
export OPSCHAIN_BASE_RUNNER="${OPSCHAIN_BASE_RUNNER:-limepoint/opschain-runner}"
docker images --filter "reference=${OPSCHAIN_BASE_RUNNER}:*"
```

Take note of the image ids of the older images and remove them as follows:

:::note
The image ids below are for example purposes only. Replace them with the image ids of the no longer required runner images (from the filtered "docker images" command above)
:::

```bash
docker rmi 62651bfbd35e b05e297066d6
```

## Running commands as root

In some cases, you might want to run commands that require root privileges inside the development environment (e.g. installing a package). However, the `opschain` user does not have root privileges so there are limitations on what you can do inside the step runner container.

To run commands as root in an OpsChain development environment container, use the `docker exec` command. First, identify the ID of the container that you wish to run the commands in by using the following command:

```bash
docker ps --filter label=opschain-dev
```

Next, exec into the container as the root user:

```bash
docker exec -ti -u 0 <container_id> /bin/bash
```

Replace `<container_id>` with the appropriate container ID from the results of the previous command. You now have an interactive Bash shell running as root inside this container and can perform any command you need.

When complete, update your project's `Dockerfile` to reflect any changes that are required in your project's step [runner image](#custom-runner-images).

:::tip
Use the `history` command to see the commands you have executed while running as root, making a note of any additional packages or filesystem changes you have made.
:::

## What to do next

Try [developing your own resources](/advanced/developer.md#developing-resources)
