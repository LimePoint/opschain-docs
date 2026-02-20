---
sidebar_position: 4
description: Details of OpsChain's agents, agent templates, and agent template versions
---

# Agents

## Introduction

OpsChain provides a platform for running agents.

Agents can perform long-running tasks in OpsChain (by contrast to [changes](changes.md) or [workflows](workflows.md) which are short-lived).

## Agent templates

OpsChain agents use templates that are based on a Git repository.

An agent template is created by referencing the relevant [Git remote](git-remotes.md) and providing a code and a name.

The agent code is used to allow a single repository to contain the code for multiple agents.

### Asset template versions

To stay in control of the changes made to an agent template, OpsChain allows you to create template versions to lock the source code for a given template to a specific Git revision. A template version always refers directly to a single Git revision in the agent template's Git repository.

If OpsChain is unable to fetch the provided Git revision, the agent template version will be marked as "broken" and it will not be usable until the issue is resolved.

You can only update a template version if no agents are using it. If you have a version being used by multiple agents, it is recommended to create a new template version instead and promote each agent as needed.

:::info
Creating new template versions will not automatically update the agents using the template. You will need to intentionally promote the agent to use the new template version, or create new agents using the new template version. This is done to ensure you are in control of the changes made to your agents and avoids unexpected or unintended changes.
:::

### Assigning an agent template version to an agent

Once an agent has been created its template cannot be changed. To alter the agent's configuration, update the agent's properties or create a new version of the agent template and assign it to the desired agents.

## Agent images

The container image used by an Agent is built based on the Git repository and commit referenced by the agent template.

The image for an agent can be rebuilt manually as needed (for example due to a failure, or due to non-idempotent build steps).

## Interacting with agents

Agents run as Kubernetes pods on the Kubernetes cluster that hosts OpsChain. They can be stopped to remove the pod, and hence any resource utilisation. They can later be restarted as desired.

OpsChain provides access to the logs and audit history for the agent.
