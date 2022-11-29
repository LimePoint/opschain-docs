---
sidebar_position: 4
description: A deep dive into OpsChain's build secrets feature and how to use it to provide secrets to your step runner image builds
---

# Using secrets in your image build

This example describes how to use Kubernetes secrets in your project's step runner image build. After following this guide you should understand how OpsChain's build secrets configuration can be used to securely pass secrets to your step runner image build.

_Notes:_

1. _[Kubernetes secrets](https://kubernetes.io/docs/concepts/configuration/secret/) are, by default, stored unencrypted in the Kubernetes cluster's underlying data store (etcd). See the [good practices for Kubernetes secrets](https://kubernetes.io/docs/concepts/security/secrets-good-practices/) guide for information on how to encrypt them at rest and further restrict user access to them._
2. _This guide is for use by non-SaaS OpsChain customers only. [Let us know](mailto:opschain-support@limepoint.com) if you're interested in using build secrets in your SaaS instance._

## Prerequisites

- A running OpsChain instance (see the [installation guide](../operations/installation.md) for more information)
- `kubectl` access to the Kubernetes cluster
- A working understanding of [Kubernetes secrets](https://kubernetes.io/docs/concepts/configuration/secret/)
- A [fork](https://docs.github.com/en/get-started/quickstart/fork-a-repo) of the [sample repo](https://github.com/LimePoint/opschain-getting-started) to follow this example in. See the [developer getting started guide](/docs/getting-started/developer.md#create-a-git-repository) for more information.

## Example setup

### Create a project & environments

Start by creating a project and two environments to use for this example:

```bash
opschain project create --code secret --name 'Secret example' -y
export opschain_projectCode=secret # the rest of this guide assumes this environment variable is set
opschain environment create --code dev --name Development -y
opschain environment create --code prod --name Production  -y
```

### Add a project Git remote

Add your fork of the OpsChain getting started guide repository as the Git remote for the `secret` project:

```bash
opschain project add-git-remote --name origin \
  --user '{username}' \
  --password '{personal access token}' \
  --url 'https://github.com/{username}/opschain-getting-started.git' \
  --ssh-key-file '' \
  --confirm
```

_Tip: you can use SSH authentication if it's easier for you._

### Create a branch for the example

To isolate your changes for this example, create a new branch in your fork of the OpsChain getting started repository:

```bash
cd /path/to/fork/of/opschain-getting-started
git checkout -b secret-example origin/developer-guide
```

### Create a project Dockerfile

Use the OpsChain CLI to create a Dockerfile for the project:

```bash
OPSCHAIN_LICENCE=/path/to/opschain.lic opschain dev create-dockerfile
```

In order to see the effect your changes are making to the build environment, edit the `.opschain/Dockerfile` so the image build will display the current value of all environment variables. We suggest adding it above the `RUN` for `opschain-exec bundle install`:

```dockerfile
RUN --mount=type=secret,required=true,id=env_context_json,uid=1000,gid=1000,target=/opt/opschain/.opschain/step_context.json \
    opschain-exec env
```

Add the updated Dockerfile to your branch and push to GitHub:

```bash
git add .opschain/Dockerfile
git commit -m 'Add secret demo Dockerfile.'
git push --set-upstream origin secret-example
```

### Verify your setup

Verify everything is configured properly by running the `hello_world` action:

```bash
opschain change create --environment-code dev --action hello_world --git-remote-name origin --git-rev secret-example --follow-logs --confirm
```

Watch the logs for the `RUN` command you modified and verify the environment variables are being displayed in the logs e.g.:

```text
#13 [stage-0 5/6] RUN --mount=type=secret,required=true,id=env_context_json,uid=1000,gid=1000,target=/opt/opschain/.opschain/step_context.json     opschain-exec env &     opschain-exec bundle install
#13 1.068 LANG=C.UTF-8
#13 1.068 HISTCONTROL=ignoredups
#13 1.068 HOSTNAME=
#13 1.068 OLDPWD=/usr/local/bin
#13 1.068 GIT_REV=secret-example
#13 1.068 BUNDLE_JOBS=20
#13 1.068 GIT_SHA=d4e74b76bf82f3529ab237e430f997ecfe3e4711
#13 1.068 USER=opschain
#13 1.068 RBENV_SHELL=bash
#13 1.068 PWD=/opt/opschain
#13 1.068 HOME=/opt/opschain
#13 1.068 RBENV_DIR=/usr/local/bin
...
```

## Global build secrets

The key value pairs configured in the `opschain-build-env` Kubernetes secret are made available as environment variables to all step runner image builds by default. To see this in action, let's add a GitHub personal access token into the `opschain-build-env` secret. This will allow all the projects created in our OpsChain instance to connect to GitHub (and, for example, download a Gem from a private repository).

1. Edit the `opschain-build-env` secret:

    ```bash
    kubectl edit secret -n opschain opschain-build-env  # this assumes you are using the default `opschain` Kubernetes namespace for OpsChain
    ```

2. Add the `BUNDLE_GITHUB__COM` key value pair as `stringData` into the secret:

    ```yaml
    apiVersion: v1
    kind: Secret
    ...
    stringData:
      BUNDLE_GITHUB__COM: ghp_zWISaqpAk1mwCrTZl9SKsNVFDekp4f2wgfvx==
    ```

    _Note: As we are not actually accessing a secure Gem in this example, there is no need to generate a new access token - you can use the dummy access token in the example yaml above._

3. Re-run the `hello_world` action and verify:

   1. `BUNDLE_GITHUB__COM` environment variable is available to the image build, and
   2. OpsChain has obfuscated the value in the logs, so it is not visible to anyone with access to the logs:

   ```bash
   opschain change create --environment-code dev --action hello_world --git-remote-name origin --git-rev secret-example --follow-logs --confirm
   ```

   ```text
   #13 [stage-0 5/6] RUN --mount=type=secret,required=true,id=env_context_json,uid=1000,gid=1000,target=/opt/opschain/.opschain/step_context.json     opschain-exec env
       ...
   #13 1.068 BUNDLE_GITHUB__COM=****************************************
   ...
   ```

## Project & environment build secrets

Project and environment specific build secrets can be used to override the global build secrets. To see this in action, lets start by adding some project level credentials to our `secret` project:

### Project build secrets

1. Create a Kubernetes secret containing the project level secrets:

    ```bash
    $ cat << EOF > project-build-secrets.yaml
    apiVersion: v1
    kind: Secret
    type: Opaque
    metadata:
      name: project-build-secrets
      namespace: opschain
    stringData:
      CLOUD_SECRET_KEY: cloud-secret-key
      ARTIFACTORY_USER: project-username
      ARTIFACTORY_PASSWORD: project-password
    EOF
    $ kubectl apply -f project-build-secrets.yaml
    ```

    _Note: alter the namespace if you are using a different namespace for your OpsChain installation._

2. Update the `secret` project's configuration to include the Kubernetes secret:

    ```bash
    opschain project edit-properties -p secret
    ```

    ```json
    {
      "opschain": {
        "config": {
          "build_secrets": ["project-build-secrets"]
        }
      }
    }
    ```

3. Re-run the `hello_world` action and verify:

    1. the `BUNDLE_GITHUB__COM` environment variable from the global secret is no longer available to the image build, and
    2. the `CLOUD_SECRET_KEY`, `ARTIFACTORY_USER` and `ARTIFACTORY_PASSWORD` environment variables from the `project-build-secrets` secret are available (and obfuscated).

    ```bash
    opschain change create --environment-code dev --action hello_world --git-remote-name origin --git-rev secret-example --follow-logs --confirm
    ```

### Environment build secrets

Just like [properties](../reference/concepts/properties.md), OpsChain's secret model allows you to override project level configuration at the environment level. Lets add some developer credentials to our `dev` environment, so the production credentials are not visible to the development team.

1. Create a Kubernetes secret containing specific credentials for the development team:

    ```bash
    $ cat << EOF > dev-build-secrets.yaml
    apiVersion: v1
    kind: Secret
    type: Opaque
    metadata:
      name: dev-build-secrets
      namespace: opschain
    stringData:
      ARTIFACTORY_USER: dev-username
      ARTIFACTORY_PASSWORD: dev-password
    EOF
    $ kubectl apply -f dev-build-secrets.yaml
    ```

    _Note: alter the namespace if you are using a different namespace for your OpsChain installation._

2. Update your dev environment configuration to use the new `dev-build-secrets` secret:

    ```bash
    opschain environment edit-properties -p secret -e dev
    ```

    ```json
    {
      "opschain": {
        "config": {
          "build_secrets": ["dev-build-secrets"]
        }
      }
    }
    ```

3. Running the `hello_world` action now, you'll note the environment variables available in the build remain the same, however the obfuscated `ARTIFACTORY` credentials differ to the previous run (as they now reflect the `dev-build-secrets` values):

    ```bash
    opschain change create --environment-code dev --action hello_world --git-remote-name origin --git-rev secret-example --follow-logs --confirm
    ```

### Including global build secrets

As shown above, adding `build_secrets` to your project (or environment) configuration disables the global secrets from being supplied to the image build. If your project (or environment) requires the global secrets, simply add the `opschain-build-env` global secret to your project's configuration.

1. Edit the project properties and add the `opschain-build-env` secret to the `build_secrets`:

    ```bash
    opschain project edit-properties -p secret
    ```

    ```json
    {
      "opschain": {
        "config": {
          "build_secrets": ["opschain-build-env", "project-build-secrets"]
        }
      }
    }
    ```

2. Run the `hello_world` action and note the global `BUNDLE_GIT_HUB__COM`, project `CLOUD_SECRET_KEY` and environment `ARTIFACTORY_USER` and `ARTIFACTORY_PASSWORD` are all available to the build:

    ```bash
    opschain change create --environment-code dev --action hello_world --git-remote-name origin --git-rev secret-example --follow-logs --confirm
    ```

## Notes

- The `build_secrets` configuration is only used when building the image. The secrets are not available to OpsChain actions
- Any OpsChain [environment variable](../reference/concepts/properties.md#environment-variables) configured in your project or environment properties that is also configured as a build secret, will be assigned the value from the build secret
