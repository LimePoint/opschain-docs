---
sidebar_position: 4
description: An example showing how to use Kubernetes secrets in your change
---

# Using secrets in your change

This example describes how to use Kubernetes secrets in your change. After following this guide you should understand:

- how OpsChain's build secrets configuration can be used to securely pass secrets to your step runner image build
- how OpsChain's runner secrets configuration can be used to export environment variables in your step

:::tip TIPS

1. [Kubernetes secrets](https://kubernetes.io/docs/concepts/configuration/secret/) are, by default, stored unencrypted in the Kubernetes cluster's underlying data store (etcd). See the [good practices for Kubernetes secrets](https://kubernetes.io/docs/concepts/security/secrets-good-practices/) guide for information on how to encrypt them at rest and further restrict user access to them.
2. This guide is for use by non-SaaS OpsChain customers only. [Let us know](mailto:opschain-support@limepoint.com) if you're interested in using secrets in your SaaS instance.

:::

## Prerequisites

- A running OpsChain instance (see the [installation guide](/operations/installation.md) for more information)
- `kubectl` access to the Kubernetes cluster
- A working understanding of [Kubernetes secrets](https://kubernetes.io/docs/concepts/configuration/secret/)
- A [fork](https://docs.github.com/en/get-started/quickstart/fork-a-repo) of the [sample repo](https://github.com/LimePoint/opschain-getting-started) to follow this example in. See the [developer getting started guide](/getting-started/developer.md#create-a-git-repository) for more information.

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

:::tip
You can use SSH authentication if it's easier for you.
:::

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
RUN --mount=type=secret,required=true,id=env_context_json,uid=10001,gid=10001,target=/opt/opschain/.opschain/step_context.json \
    opschain-exec env
```

In order to see the effect your changes are making to the step runner environment, edit the `actions.rb` and add an action to display the current value of all environment variables:

```ruby
action :show_environment do
  sh 'env'
end
```

Add the updated files to your branch and push to GitHub:

```bash
git add .opschain/Dockerfile actions.rb
git commit -m 'Add secret demo.'
git push --set-upstream origin secret-example
```

### Verify your setup

Verify everything is configured properly by running the new `show_environment` action:

```bash
opschain change create --environment-code dev --action show_environment --git-remote-name origin --git-rev secret-example --follow-logs --confirm
```

Watch the logs for the `RUN` command you modified and verify the environment variables available during the build are being displayed in the logs, for example:

```text
#13 [stage-0 5/6] RUN --mount=type=secret,required=true,id=env_context_json,uid=10001,gid=10001,target=/opt/opschain/.opschain/step_context.json     opschain-exec env &     opschain-exec bundle install
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

Continue watching the logs to see the `show_environment` action outputting the runtime environment variables:

```text
...
===> Starting step action "show_environment" (dry_run: false) at 2022-12-20T12:20:21.905+11:00
env
OPSCHAIN_BUILD_SERVICE_PORT_50000_TCP_ADDR=10.43.197.162
OPSCHAIN_DB_SERVICE_PORT_DB=5432
OPSCHAIN_LDAP_SERVICE_PORT=389
...
```

## Default build secrets

The key value pairs configured in the `opschain-build-env` Kubernetes secret are made available as environment variables to all step runner image builds by default. To see this in action, let's add a GitHub personal access token into the `opschain-build-env` secret. This will allow all the projects created in our OpsChain instance to connect to GitHub (and, for example, download a Gem from a private repository).

1. Edit the `opschain-build-env` secret:

    ```bash
    kubectl edit secret -n opschain opschain-build-env # this assumes you are using the default `opschain` Kubernetes namespace for OpsChain
    ```

2. Add the `BUNDLE_GITHUB__COM` key value pair as `stringData` into the secret:

    ```yaml
    apiVersion: v1
    kind: Secret
    ...
    stringData:
      BUNDLE_GITHUB__COM: ghp_zWISaqpAk1mwCrTZl9SKsNVFDekp4f2wgfvx==
    ```

    :::tip
    As we are not actually accessing a secure Gem in this example, there is no need to generate a new access token - you can use the dummy access token in the example YAML above.
    :::

3. Re-run the `show_environment` action and verify:

   1. The `BUNDLE_GITHUB__COM` environment variable is available to the image build
   2. The `BUNDLE_GITHUB__COM` environment variable is not set during the step execution
   3. OpsChain has obfuscated the value in the logs, so it is not visible to anyone with access to the logs:

   ```bash
   opschain change create --environment-code dev --action show_environment --git-remote-name origin --git-rev secret-example --follow-logs --confirm
   ```

   ```text
   #13 [stage-0 5/6] RUN --mount=type=secret,required=true,id=env_context_json,uid=10001,gid=10001,target=/opt/opschain/.opschain/step_context.json     opschain-exec env
       ...
   #13 1.068 BUNDLE_GITHUB__COM=****************************************
   ...
   ```

## Default runner secrets

Follow the same process as the [default build secrets](#default-build-secrets), but modify the `opschain-runner-env` Kubernetes secret instead.

Re-run the `show_environment` action and verify that the obfuscated `BUNDLE_GITHUB__COM` environment variable is now shown during the step execution.

```text
...
===> Starting step action "show_environment" (dry_run: false) at 2022-12-20T12:20:21.905+11:00
env
OPSCHAIN_BUILD_SERVICE_PORT_50000_TCP_ADDR=10.43.197.162
OPSCHAIN_DB_SERVICE_PORT_DB=5432
OPSCHAIN_LDAP_SERVICE_PORT=389
...
BUNDLE_GITHUB__COM=****************************************
...
```

## Project & environment secrets

The secrets used by a change run in a particular project environment can be configured specifically - rather than using the default `opschain-build-env` and `opschain-runner-env` secrets.

To see this in action, let's start by adding some project level credentials to our `secret` project:

### Project build secrets

1. Create a Kubernetes secret containing the project level secrets:

    ```bash
    $ cat << EOF > custom-project-secrets.yaml
    apiVersion: v1
    kind: Secret
    type: Opaque
    metadata:
      name: custom-project-secrets
      namespace: opschain
    stringData:
      CLOUD_SECRET_KEY: cloud-secret-key
      ARTIFACTORY_USER: project-username
      ARTIFACTORY_PASSWORD: project-password
    EOF
    $ kubectl apply -f custom-project-secrets.yaml
    ```

    :::tip
    Alter the namespace if you are using a different namespace for your OpsChain installation.
    :::

2. Update the `secret` project's `opschain` properties to include the Kubernetes secret:

    ```bash
    opschain project edit-properties -p secret
    ```

    ```json
    {
      "opschain": {
        "env:build_secrets": ["custom-project-secrets"],
        "env:runner_secrets": ["custom-project-secrets"]
      }
    }
    ```

3. Re-run the `hello_world` action and verify:

    1. the `BUNDLE_GITHUB__COM` environment variable from the default secret is no longer available to the step
    2. the `CLOUD_SECRET_KEY`, `ARTIFACTORY_USER` and `ARTIFACTORY_PASSWORD` environment variables from the `custom-project-secrets` secret are available at build time
    3. the `CLOUD_SECRET_KEY`, `ARTIFACTORY_USER` and `ARTIFACTORY_PASSWORD` environment variables from the `custom-project-secrets` secret are available in the runner
    4. the secret values are obfuscated

    ```bash
    opschain change create --environment-code dev --action show_environment --git-remote-name origin --git-rev secret-example --follow-logs --confirm
    ```

### Environment secrets

Just like [properties](/reference/concepts/properties.md), OpsChain's secret model allows you to override project level secrets at the environment level. Let's add some developer credentials to our `dev` environment, so the production credentials are not visible to the development team.

1. Create a Kubernetes secret containing specific credentials for the development team:

    ```bash
    $ cat << EOF > dev-secrets.yaml
    apiVersion: v1
    kind: Secret
    type: Opaque
    metadata:
      name: dev-secrets
      namespace: opschain
    stringData:
      ARTIFACTORY_USER: dev-username
      ARTIFACTORY_PASSWORD: dev-password
    EOF
    $ kubectl apply -f dev-secrets.yaml
    ```

    :::tip
    Alter the namespace if you are using a different namespace for your OpsChain installation.
    :::

2. Update your dev environment `opschain` properties to use the new `dev-secrets` secret:

    ```bash
    opschain environment edit-properties -p secret -e dev
    ```

    ```json
    {
      "opschain": {
        "env:build_secrets": ["dev-secrets"],
        "env:runner_secrets": ["dev-secrets"]
      }
    }
    ```

3. Re-run the `show_environment` action and note the obfuscated `ARTIFACTORY` credentials differ to the previous run as they now reflect the `dev-secrets` values - this can only been seen via the change of length due to the obfuscation:

    ```bash
    opschain change create --environment-code dev --action show_environment --git-remote-name origin --git-rev secret-example --follow-logs --confirm
    ```

### Including the default secrets

As shown above, adding `env:build_secrets` or `env:runner_secrets` to your project or environment `opschain` properties disables the default secrets from being supplied to the relevant part of the step. If your project or environment requires the default secrets, simply add the relevant secret to your project configuration:

1. For example, edit the project properties and add the `opschain-build-env` secret to the `env:build_secrets`:

    ```bash
    opschain project edit-properties -p secret
    ```

    ```json
    {
      "opschain": {
        "env:build_secrets": ["opschain-build-env", "custom-project-secrets"]
      }
    }
    ```

2. Run the `show_environment` action and note the `BUNDLE_GITHUB__COM`, project `CLOUD_SECRET_KEY` and environment `ARTIFACTORY_USER` and `ARTIFACTORY_PASSWORD` are all available to the build:

    ```bash
    opschain change create --environment-code dev --action show_environment--git-remote-name origin --git-rev secret-example --follow-logs --confirm
    ```

:::note NOTES

- the `env:build_secrets` are only used when building the image. The secrets are not available to OpsChain actions
- the `env:runner_secrets` are only used when running the action. The secrets are not available when building the image
- when a property and a secret both define the same environment variable, the secret value will be used

:::
