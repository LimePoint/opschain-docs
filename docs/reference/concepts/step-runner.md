---
sidebar_position: 9
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

### OpsChain standard runner

The standard OpsChain runner base image is an AlmaLinux-based image that provides a subset of the MintPress controller Gems with an associated Ruby installation and the standard RHEL-packaged base development tooling.

The standard runner image is called `limepoint/opschain-runner` and is configured by default for use in OpsChain.

### OpsChain enterprise runner

The OpsChain enterprise runner is an alternative base runner image that includes the MintPress Oracle controllers, in addition to everything in the standard runner. It is available for use by licenced MintPress customers.

You must be logged in to the [Docker Hub](https://hub.docker.com/) as the `opschainenterprise` user to use the OpsChain enterprise runner - contact [LimePoint](mailto:opschain-support@limepoint.com) to obtain these user credentials.

```bash
docker login --username opschainenterprise
```

Add `OPSCHAIN_RUNNER_NAME='runner-enterprise'` and set `OPSCHAIN_RUNNER_IMAGE='limepoint/opschain-runner-enterprise:latest'` in your `.env` file to use the OpsChain enterprise runner.

After updating the `.env` file, follow the steps from the [upgrading guide](../../operations/upgrading.md) to apply this configuration and fetch the enterprise runner.

## Custom step runner Dockerfiles

If your resources or actions rely on external software, the image used by your project for its step runner containers can be modified to add extra packages or executables. The image may also be modified to optimise the performance of build steps by performing tasks as part of the step image build rather than as part of the step execution.

_Please note: The [Docker development environment](/docs/development-environment.md#using-custom-runner-images) guide provides instructions on using a custom step runner image as your local OpsChain development environment._

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

_Notes:_

1. _commits prior to this point won't use the custom Dockerfile because it is not present in the repository._
2. _if you no longer wish to use the custom Dockerfile, `.opschain/Dockerfile` can be removed from the project repository._

### Customising the Dockerfile

This Dockerfile can be modified and committed like any other file in the project Git repository.

The build context used when building the step runner image has access to the following files:

- `repo.tar` - The complete project Git repository including the .git directory with all commit info. This file will change (and invalidate the build context) when a different commit is used for a change or when there are changes to the project's Git repository
- `step_context_env.json` - The [environment variable properties](properties.md#environment-variables) for the project and environment, along with the project and environment [context](context.md) values for use by `opschain-exec`. This file will change if the environment variables in the project or environment change

The build arguments supplied to [BuildKit](https://docs.docker.com/develop/develop-images/build_enhancements/) when building the image include:

| Argument             | Description                                                                                                                                                                          |
| :------------------- |:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| GIT_REV              | The Git revision supplied to OpsChain as part of the `opschain change create` command.                                                                                               |
| GIT_SHA              | The Git SHA this revision resolved to at the time of creating the change.                                                                                                            |
| OPSCHAIN_BASE_RUNNER | The system default base runner image (including image tag). <br/>(i.e. `limepoint/opschain-runner:<OPSCHAIN_VERSION>` or `limepoint/opschain-enterprise-runner:<OPSCHAIN_VERSION>`). |
| OPSCHAIN_VERSION     | The current OpsChain Docker image version.                                                                                                                                           |

The [Dockerfile reference](https://docs.docker.com/engine/reference/builder/) and the [best practices for writing Dockerfiles](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/) guide provide more information about writing Dockerfiles.

### Supported customisations

Modifying the Dockerfile allows a lot of flexibility.

For maximum compatibility with OpsChain we suggest only using the Dockerfile `RUN`, `COPY`, `ENV`, and `ADD` commands.

More advanced modifications (like modifying the `ENTRYPOINT`) are not supported and may break OpsChain.

Custom Dockerfiles must be based on an OpsChain base runner image (i.e. `limepoint/opschain-runner` or `limepoint/opschain-enterprise-runner`) and we suggest using `FROM ${OPSCHAIN_BASE_RUNNER}` (as per the default Dockerfile) to achieve this.

### Secure build secrets

During the initial deployment, OpsChain creates an empty `opschain-build-env` Kubernetes secret. Any key value pairs added to this secret will be made available as environment variables to commands run via `opschain-exec` in your Dockerfile.

For example, if your custom step runner requires a utility from an AWS S3 drive, you can add your AWS credentials as key value pairs to the `opschain-build-env` secret:

```yaml
AWS_ACCESS_KEY_ID: QUtSQVFJQVpRUTdTRE9BSTM3NkYK
AWS_SECRET_ACCESS_KEY: djNLWll5RWtrbTd2NzBrOUFzRG04ZEFUQ1pZT0xMYWVsNXFwSWZFQwo=
```

_Note: Per Kubernetes requirements, the values in the secret must be base64 encoded._

These environment variables will then be available to the `aws` CLI (when run via `opschain-exec`), so it can authenticate to copy the utility:

```dockerfile
RUN opschain-exec aws s3 cp s3://source-bucket-name/customer-utility /opt/opschain/customer-utility
```

#### Project & environment build secrets

If more granular control over build secrets is required, OpsChain allows you to override the default `opschain-build-env` secret and configure specific Kubernetes secrets to supply to your image build. For example, adding the following to the project and environment properties will cause OpsChain to provide the key value pairs in the `project-build-secrets-1`, `project-build-secrets-2` and `environment-build-secrets` secrets as environment variables to `opschain-exec`:

_Project properties:_

```json
{
  "opschain": {
    "config": {
      "build_secrets": ["project-build-secrets-1", "project-build-secrets-2"]
    }
  }
}
```

_Environment properties:_

```json
{
  "opschain": {
    "config": {
      "build_secrets": ["environment-build-secrets"]
    }
  }
}
```

_Notes:_

1. _Secrets are loaded in the order listed in your configuration, project secrets, then environment secrets. If an environment variable exists in multiple Kubernetes secrets, the value from the most recently loaded secret will be supplied to the image build_
2. _If you have configured `build_secrets` in your project or environment configuration, the default `opschain-build-env` secret will not be supplied to your image build. To include the `opschain-build-env` secret, simply add `opschain-build-env` into your list of `build_secrets`_

See the [using secrets in your image build](/docs/examples/using-secrets-in-your-image-build.md) example for more information.

### Image performance - base images

OpsChain runs the image build for every step within a change.

This is normally performant due to the image build cache - however it is possible to prebuild a custom base image if desired. This may make the image build faster when run for each step.

A custom base image can be created as follows:

1. Create a Dockerfile for the base image that uses `FROM limepoint/opschain-runner` (or `opschain-runner-enterprise` if using the enterprise runner image).

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

OpsChain relies on configuration done as part of the base runner image to work. By basing the custom base image on `limepoint/opschain-runner` or `limepoint/opschain-runner-enterprise` the OpsChain configuration still applies and will work as desired.

Ensure that you rebuild your custom image after upgrading OpsChain.

[Contact us](mailto:opschain-support@limepoint.com) if you would like to express your interest in this feature.

## API - step runner integration

When running the step runner, OpsChain includes:

1. the project's Git repository, reset to the requested revision, in the `/opt/opschain` directory
2. the project and environment [properties](properties.md) to be used by the step, in the `/opt/opschain/.opschain/step_context.json` file

Upon completion, the step will produce a `/opt/opschain/.opschain/step_result.json` file to be processed by the API server, detailing:

1. any changes to the project and environment [properties](properties.md) the action has performed
2. the merged set of properties used by the action
3. any child steps to be run after this action (and their execution strategy)

### Step context JSON

#### File structure

The `step_context.json` file has the following structure:

```text
{
  "context": {
    "project": {
      "code": "demo",
      "name": "Demo Project",
      ...
    },
    "environment": ...
    "change": ...
    "step": ...,
    "user": ...
  },
  "project": {
    "properties": {
      "project_property": "value",
      "files": {
        "/path/to/file.txt": {
          "mode": "0600",
          "content": "contents of the file"
        }
      },
      "env": {
        "VARIABLE_NAME": "variable value"
      }
    }
  },
  "environment": {
    "properties": {
      "environment_property": "value",
      "files": {
        "/path/to/another_file.txt": {
          "mode": "0600",
          "content": "contents of the file"
        }
      },
      "env": {
        "VARIABLE_NAME": "variable value"
      }
    }
  }
}
```

#### File content - step context

The `context` values are derived from the current step. The [OpsChain context guide](context.md) provides more details on the values available.

The `project/properties` value is the output from `opschain project show-properties --project-code <project code>`.

The `environment/properties` value is the output from `opschain environment show-properties --project-code <project code> --environment-code <environment code>`

_Replace the `<project code>` and `<environment code>` in the commands above with the values for the project and environment related to the change._

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
