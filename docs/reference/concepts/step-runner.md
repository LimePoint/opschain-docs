---
sidebar_position: 10
description: Learn more about how OpsChain runs steps within a step runner image.
---

# Step runner

This guide covers how the OpsChain server executes actions within the OpsChain step runner.

After reading this guide you should understand:

- how to create and use a custom step runner image
- how the API server and step runner exchange critical information

## OpsChain runner images

Each step in an OpsChain change is executed inside a container that is based on an OpsChain runner image.

Each container only runs a single step before it is discarded. This ensures that:

- steps running in parallel do not impact each other
- modifications made by previously completed steps do not affect future steps
- the step execution environment contains only the current project's configuration and files

The image used by the step container is built as part of every step's execution and relies on build caching functionality to keep this performant.

The OpsChain runner base image is an AlmaLinux-based image that provides the standard RHEL-packaged base development tooling, a Ruby installation and the required Ruby Gems.

The runner image is called `limepoint/opschain-runner` and is configured by default for use in OpsChain.

## Custom step runner Dockerfiles

If your resources or actions rely on external software, the image used by your project for its step runner containers can be modified to add extra packages or executables. The image may also be modified to optimise the performance of build steps by performing tasks as part of the step image build rather than as part of the step execution.

:::tip
The [Docker development environment](/docs/development-environment.md#building-and-using-a-custom-runner-image) guide provides instructions on using a custom step runner image as your local OpsChain development environment.
:::

### Creating a custom step runner Dockerfile

If your project Git repository contains a Dockerfile in `.opschain/Dockerfile`, this will be used to build the image for your project's step runner containers. It must be based on the default step runner image Dockerfile to ensure compatibility with OpsChain. To make a copy of the default step runner Dockerfile in your repository, execute the `opschain dev create-dockerfile` command:

```bash
cd /path/to/project/git/repository
opschain dev create-dockerfile
```

Using the editor of your choice, make any desired modifications to the Dockerfile. See the [customising the dockerfile](#customising-the-dockerfile) and [supported customisations](#supported-customisations) sections below for more information.

Finally, add and commit the Dockerfile to your project's Git repository

```bash
git add .opschain/Dockerfile
git commit -m "Adding a custom Dockerfile."
```

:::note NOTES

1. commits prior to this point won't use the custom Dockerfile because it is not present in the repository.
2. if you no longer wish to use the custom Dockerfile, `.opschain/Dockerfile` can be removed from the project repository.

:::

### Customising the Dockerfile

This Dockerfile can be modified and committed like any other file in the project Git repository.

The build context used when building the step runner image has access to the following files:

- `repo.tar` - The complete project Git repository including the .git directory with all commit info. This file will change (and invalidate the build context) when a different commit is used for a change or when there are changes to the project's Git repository
- `step_context_env.json` - The [environment variable properties](/docs/reference/concepts/properties.md#environment-variables) for the project and environment, along with the project and environment [context](/docs/reference/concepts/context.md) values for use by `opschain-exec`. This file will change if the environment variables in the project or environment change

The build arguments supplied to [BuildKit](https://docs.docker.com/develop/develop-images/build_enhancements/) when building the image include:

| Argument             | Description                                                                                                             |
|:---------------------|:------------------------------------------------------------------------------------------------------------------------|
| GIT_REV              | The Git revision supplied to OpsChain as part of the `opschain change create` command.                                  |
| GIT_SHA              | The Git SHA this revision resolved to at the time of creating the change.                                               |
| OPSCHAIN_BASE_RUNNER | The system default base runner image (including image tag). <br/>(i.e. `limepoint/opschain-runner:<OPSCHAIN_VERSION>`). |
| OPSCHAIN_VERSION     | The current OpsChain Docker image version.                                                                              |

The [Dockerfile reference](https://docs.docker.com/engine/reference/builder/) and the [best practices for writing Dockerfiles](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/) guide provide more information about writing Dockerfiles.

### Supported customisations

Modifying the Dockerfile allows a lot of flexibility.

For maximum compatibility with OpsChain we suggest only using the Dockerfile `RUN`, `COPY`, `ENV`, and `ADD` commands.

More advanced modifications (like modifying the `ENTRYPOINT`) are not supported and may break OpsChain.

Custom Dockerfiles must be based on an OpsChain base runner image (i.e. `limepoint/opschain-runner`) and we suggest using `FROM ${OPSCHAIN_BASE_RUNNER}` (as per the default Dockerfile) to achieve this.

### Secure secrets

OpsChain allows users to leverage Kubernetes secrets to load sensitive information into the execution of steps and changes as environment variables.

When a property and a secret both define the same environment variable, the secret value will be used.

#### Secure build secrets

By default, OpsChain will supply the key value pairs configured in the `opschain-build-env` Kubernetes secret into the step runner image build. These are made available as environment variables to commands run via `opschain-exec` in your Dockerfile.

For example, if your custom step runner requires a utility from an AWS S3 drive, you can add your AWS credentials as key value pairs to the `opschain-build-env` secret (the default secret created for use by OpsChain image builds):

```yaml
AWS_ACCESS_KEY_ID: QUtSQVFJQVpRUTdTRE9BSTM3NkYK
AWS_SECRET_ACCESS_KEY: djNLWll5RWtrbTd2NzBrOUFzRG04ZEFUQ1pZT0xMYWVsNXFwSWZFQwo=
```

These environment variables will then be available to the `aws` CLI (when run via `opschain-exec`), so it can authenticate to copy the utility, for example:

```dockerfile
RUN opschain-exec aws s3 cp s3://source-bucket-name/customer-utility /opt/opschain/customer-utility
```

More granular control over the secrets that are supplied to the image build is available by configuring the `env:build_secrets` configuration in the project or environment [properties](/docs/reference/concepts/properties.md#secrets). See [project and environment configuration](#project--environment-secret-configuration) for more information.

#### Secure runner secrets

By default, OpsChain will supply the key value pairs configured in the `opschain-runner-env` Kubernetes secret into the step runner container. These will be exported as environment variables when starting the step runner container.

For example, if your step copies a file into an AWS S3 drive, you can add your AWS credentials as key value pairs to the `opschain-runner-env` secret:

```yaml
AWS_ACCESS_KEY_ID: QUtSQVFJQVpRUTdTRE9BSTM3NkYK
AWS_SECRET_ACCESS_KEY: djNLWll5RWtrbTd2NzBrOUFzRG04ZEFUQ1pZT0xMYWVsNXFwSWZFQwo=
```

:::note
Per Kubernetes requirements, the values in the secret must be base64 encoded.
:::

These environment variables will then be available to the `aws` CLI when run as part of the OpsChain action, for example:

```ruby
action :copy_utility do
  sh 'aws s3 cp build.war s3://destination-bucket-name/build.war'
end
```

More granular control over the secrets that are supplied to the step runner container is available by configuring the `env:runner_secrets` configuration in the project or environment[properties](/docs/reference/concepts/properties.md#secrets). See [project and environment configuration](#project--environment-secret-configuration) for more information.

#### Project & environment secret configuration

OpsChain allows you to configure specific secrets to supply to changes in an environment by configuring the `env:build_secrets` and `env:runner_secrets` configuration options in your project or environment [properties](/docs/reference/concepts/properties.md#secrets).

For example, adding the following to the project and environment properties will cause OpsChain to provide the key value pairs in the `project-build-secrets-1`, `project-build-secrets-2` and `environment-build-secrets` secrets as environment variables to `opschain-exec` during the image build:

_Project properties:_

```json
{
  "opschain": {
    "env:build_secrets": ["project-build-secrets-1", "project-build-secrets-2"]
  }
}
```

_Environment properties:_

```json
{
  "opschain": {
    "env:build_secrets": ["environment-build-secrets"]
  }
}
```

:::note NOTES

1. Project and environment secrets are loaded in the order they are specified in your configuration - project secrets then environment secrets. If an environment variable exists in multiple Kubernetes secrets, the value from the most recently loaded secret will be supplied
2. If you have configured `env:build_secrets` in your project or environment configuration, the environment variables in the `opschain-build-env` secret will not be supplied to your image build. To include them, simply add `opschain-build-env` to the project or environment `env:build_secrets` configuration
3. If you have configured `env:runner_secrets` in your project or environment configuration, the environment variables in the `opschain-runner-env` secret will not be supplied to your step runner. To include them, simply add `opschain-runner-env` to the project or environment `env:runner_secrets` configuration

:::

:::caution
The `env:build_secrets` and `env:runner_secrets` configuration options cannot be set in [repository properties](/docs/reference/concepts/properties.md#git-repository). If either option is configured in your project's repository properties, it will be ignored.
:::

See the [using secrets in your image build](/docs/examples/using-secrets-in-your-change.md) example for more information.

### Image performance - base images

OpsChain runs the image build for every step within a change.

This is normally performant due to the image build cache - however it is possible to prebuild a custom base image if desired. This may make the image build faster when run for each step.

A custom base image can be created as follows:

1. Create a Dockerfile for the base image that uses `FROM limepoint/opschain-runner`.

    ```dockerfile
    FROM limepoint/opschain-runner

    # run your custom build commands like any Dockerfile
    # Note: the OpsChain build context files will not be available here
    ```

2. Build and distribute the base image, assigning it a unique tag (the `my-base-image` used below is for example purposes only).

    ```bash
    docker build -t my-base-image .
    ```

3. Use the custom base image in the project custom Dockerfile.

    ```dockerfile
    FROM my-base-image # supply the tag used above

    ... # the rest of the OpsChain custom Dockerfile
    ```

4. Run your change as normal. It will now use the `my-base-image` image as the base for the custom step image.

OpsChain relies on configuration done as part of the base runner image to work. By basing the custom base image on `limepoint/opschain-runner` the OpsChain configuration still applies and will work as desired.

Ensure that you rebuild your custom image after upgrading OpsChain.

## API - step runner integration

When running the step runner, OpsChain includes:

1. the project's Git repository, reset to the requested revision, in the `/opt/opschain` directory
2. an `/opt/opschain/.opschain/step_context.json` file, containing the step's project and environment properties along with the current step's context values

Upon completion, the step will produce an `/opt/opschain/.opschain/step_result.json` file to be processed by the API server, detailing:

1. any changes to the project and environment [properties](/docs/reference/concepts/properties.md) the action has performed
2. the merged set of properties used by the action
3. any child steps to be run after this action (and their execution strategy)

### Step context JSON

The `step_context.json` file supplied to the step includes the following sections:

| JSON path                | Description                                                                                                                                                                     |
|--------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `context`                | The step context values for the current step - see the [OpsChain context guide](/docs/reference/concepts/context.md) for more details                                           |
| `project/properties`     | The [properties](/docs/reference/concepts/properties.md) output from `opschain project show-properties --project-code <project code>`                                           |
| `environment/properties` | The [properties](/docs/reference/concepts/properties.md) output from `opschain environment show-properties --project-code <project code> --environment-code <environment code>` |

:::note
Replace the `<project code>` and `<environment code>` in the commands above with the values for the project and environment related to the change.
:::

A sample `step_context.json` file is available to view [here](/files/samples/step_context.json).

### Step result JSON

The `step_result.json` file has the following structure:

```json
{
  "project": {
    "properties_diff": [
      {
        "op": "add",
        "path": "/new_element",
        "value": "test_value"
      }
    ]
  },
  "environment": {
    "properties_diff": []
  },
  "step": {
    "properties": {
      "opschain": {}
    }
  },
  "steps": {
    "children": [
      {
        "action": "sample:hello_world_1:run"
      }
    ],
    "child_execution_strategy": null
  }
}
```

#### File content - step result

The `project/properties_diff` and `environment/properties_diff` values contain [RFC6902](http://www.rfc-editor.org/rfc/rfc6902.txt) JSON Patch values, describing the changes to apply to the project or environment properties.

The `step/properties` contains the merged set of properties applied to the action. These are linked to the step to support future investigation / debugging.

The `steps/children` value contains the child steps (and execution strategy) the OpsChain workers will execute.

### Log messages for step phases

OpsChain includes log messages in your change logs to allow you to follow each step's progress as OpsChain builds its step runner and executes the step's action. These messages will log when the phase starts, initialises (if relevant), is completing (if relevant), and finishes. These log messages can be used to diagnose how much time the different phases of a change/step are taking.
