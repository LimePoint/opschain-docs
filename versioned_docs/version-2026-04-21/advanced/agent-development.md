---
sidebar_position: 2
description: Learn about creating agents and agent templates in OpsChain
---

# Agent development

The agent's Git repository is the core of an OpsChain agent. After following this guide you should understand:

- the purpose of the `agent.sh` script within the repository
- how to run a simple agent

## Prerequisites

If you have not already done so, we suggest completing the main [getting started guides](../category/getting-started) before this guide.

This guide assumes that:

- you have access to a running OpsChain API server, either locally or network accessible. See the [getting started installation guide](/setup/installation.md) for more details

### Create a Git repository

OpsChain projects can use remote Git repositories to centrally manage configuration.

Create a new Git repository for this guide:

```bash
mkdir opschain-git-repo
cd opschain-git-repo
git init
```

This guide uses an [existing repository](https://github.com/LimePoint/opschain-getting-started) that already contains some sample content. [Fork](https://docs.github.com/en/get-started/quickstart/fork-a-repo) the [sample repository](https://github.com/LimePoint/opschain-getting-started) on GitHub and use your own fork to allow you to push your changes and use them from your OpsChain project. _When forking the repository, ensure that you fork all branches._

```bash
git remote add origin https://{github username}:{github personal access token}@github.com/{github username}/opschain-getting-started.git
git fetch
git checkout agent-guide
```

#### Repository setup

All OpsChain agent script entrypoint called `agent.sh` by default (unless overridden with the [agent.script_path setting](../key-concepts/settings.md#agentscript_path)).

```bash
$ tree
└── agent.sh
```

By using the existing sample repository, this file has already been created - but with normal repositories it will need to be created manually.

:::note
Ensure the `agent.sh` script is executable, e.g. `chmod +x agent.sh` and then adding and committing the file.
:::

:::note
The `agent.sh` file doesn't need to be a shell script, and could be another type of executable.
:::

## Agent repository overview

The agent repository can also contain a custom `Dockerfile`. This can be placed in the `.opschain` directory for use by all agent templates contained within this repository.

```bash
$ tree
├── agent.sh
├── .opschain/
└──── Dockerfile
```

### Agent template code folder

If the agent repository contains a directory with a code matching the template code, then the `Dockerfile` in that directory will be used instead. For example, if the agent template was added to OpsChain with the code `sample`, and the repository contains a file at `sample/Dockerfile` then it will be used as the Dockerfile for this agent.

```bash
$ tree
├── agent.sh
├── sample/
└──── Dockerfile
└──── agent.sh (optional - see note below)
```

:::note
This does not affect the `agent.sh` path, and by default the `agent.sh` from the Git repository root would still be used.
Using the custom Dockefile will allow you to use an alternative `agent.sh` by copying it to `/opt/opschain/agent.sh`, for example by adding the following to the end of the custom Dockerfile:

```dockerfile
COPY --chown opschain:opschain --link --from=repo --chmod=755 /sample/agent.sh /opt/opschain/agent.sh
```

:::

See [the sample repository](https://github.com/LimePoint/opschain-getting-started/tree/agent-guide/sample) for an example.

### `agent.sh`

The `agent.sh` script (or file referenced by the [agent.script_path setting](../key-concepts/settings.md#agentscript_path)) is run as the main entrypoint for the agent.

This script can be used to run any commands as desired, before potentially `exec`-ing into another command.

The OpsChain runner base image contains the following commands to assist with agent development:

- `opschain-exec` - Load the OpsChain environment variable properties before starting a subsequent command, e.g. `opschain-exec env`). Note: The OpsChain OpsChain environment variable properties are loaded into the `agent.sh` entrypoint automatically.
- `opschain-write-files` - Write the OpsChain file properties to disk.
- `opschain-show-properties` - Writes the OpsChain properties to standard out, as JSON.
- `opschain-show-context` - Writes the OpsChain context to standard out, as JSON.

:::note
OpsChain secret properties are decrypted for use by the agent.

Any secret value output to stdout/stderr will be masked as they are in changes.
:::

## Adding the agent

To run this sample agent, it needs to be setup in OpsChain. To do this:

1. Navigate to (or create) the project you wish to run this agent.
2. Create a new Git remote using this Git remote address (e.g. `https://github.com/{{your-username}}/opschain-getting-started`).
3. Create a new agent template using the created Git remote.
4. Create a new agent template version for the template using the Git revision `agent-guide`.
    a. Use any `version` name you like, for example `Agent guide`.
5. Navigate to the project screen and access the `agents` tab.
6. Add the new agent using the earlier created template.

## Interacting with the agent

### Running the agent

Before running the agent via the UI the image must be built successfully.

While the agent is running, the logs and Kubernetes events for the pod can be viewed in the UI.

### Stopping the agent

The agent can be stopped via the UI which will stop it using any computing resource.

### Managing the agent version

A new template version can be added on the agent's template version screen.

After adding the new version, the agent will need to be restarted (i.e. stopped and started) to use the latest agent image.

## Accessing the OpsChain API from an agent

OpsChain agents are a powerful tool that can be combined with the other features provided by OpsChain, such as changes and workflows.

An OpsChain agent can use the [OpsChain API](https://docs.opschain.io/api-docs/) to perform any OpsChain function.

To support this, OpsChain agents are provided with an environment variable, `OPSCHAIN_API_ADDRESS`, which is configured with the address of the OpsChain API.

This allows this environment variable to be used in the agent script to perform actions. This can be used from tools such as the OpsChain CLI or curl to interact with the API. E.g. `curl "${OPSCHAIN_API_ADDRESS}"/api/changes -u <username>:<password>` - note you will need to provide credentials, we suggest using [OpsChain secrets](../key-concepts/properties.md#secrets) to provide these to the agent.

:::note
The default API address configured won't be usable in complex deployments (for example where traffic to OpsChain must traverse a specific load balancer).

The API address can be overridden by setting an [OpsChain property environment variable](../key-concepts/properties.md#environment-variables) called OPSCHAIN_API_ADDRESS, e.g.

```json
{
  "env": {
    "OPSCHAIN_API_ADDRESS": "https://custom_address/"
  }
}
```

:::

:::note
The agent pod is given a [`hostAlias`](https://kubernetes.io/docs/tasks/network/customize-hosts-file-for-pods/) to ensure it can access the OpsChain API via the [`api.hostName` setting value](/setup/configuration/additional-settings.md#envopschain_api_host_name-and-apihostname) that is configured for the API pod and ingress. This is to ensure that the ingress can present the correct certificate to the request. If this is not desired (e.g. the `api.hostName` setting value should resolve to another host, such as a reverse proxy or similar) this `hostAlias` can be disabled via the [`agent.disable_host_alias` setting](/key-concepts/settings.md#agentdisable_host_alias).
:::

:::tip Testing API access
The OpsChain API includes a simple healthcheck endpoint. This endpoint is useful for verifying agent API access as it does not require any authentication. An example of accessing this endpoint is `curl "${OPSCHAIN_API_ADDRESS}"/api/healthcheck`.
:::

:::tip
The generated `OPSCHAIN_API_ADDRESS` value may not work with the TLS certificate configuration in OpsChain. If this is the case, disabling TLS certificate verification may be an acceptable workaround, for example using the `-k` argument with curl like `curl -k "${OPSCHAIN_API_ADDRESS}"/api/healthcheck`.
:::

### Events

OpsChain agents can use the OpsChain API to create [OpsChain events](../key-concepts/events.md). This allows an OpsChain agent to use OpsChain event automations to trigger other OpsChain activities.

See the [event documentation](/key-concepts/events.md#creating-custom-events) for more information about creating events, or see the [API docs](https://docs.opschain.io/api-docs/#tag/Events) to learn more.

## What to do next

### Modify the agent code

Modify the existing agent script, for example:

  1. Make your changes to `agent.sh`
  2. Commit the changes
  3. Push the new commit
  4. Create a new template version for the new commit
  5. Upgrade your agent template version to the newly created one
  6. Wait for the agent build image task to complete
  7. Restart the agent to upgrade to the latest image

### Create your own agent

Try creating your own repository and create your own agent from scratch.

### Learn more about OpsChain properties

Follow the [properties](/key-concepts/properties.md) guide to try editing some [project](/key-concepts/overview.md#project) or [environment](/key-concepts/overview.md#environment) properties.
