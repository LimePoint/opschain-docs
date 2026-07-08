---
sidebar_position: 5
description: ''
---

# Agents

OpsChain agents perform long-running tasks, in contrast to [changes](/key-concepts/changes.md) and [workflow runs](/getting-started/familiarisation/gui/workflows.md) which are short-lived.

An agent runs as a Kubernetes pod on the same cluster that hosts OpsChain. Agents can be stopped to free up cluster resources and restarted later, and OpsChain provides access to each agent's logs and audit history through the GUI.

## Agent templates

OpsChain agents are based on templates that reference a [Git remote](/getting-started/familiarisation/gui/projects/git_remotes.md). An agent template is created by selecting the relevant Git remote and supplying a code and a name. The agent code allows a single Git repository to contain the code for multiple agents.

### Promoting an agent to a new template version

Once an agent has been created, its template cannot be changed. To alter the agent's configuration, either update the agent's properties or create a new version of the existing agent template and assign it to the desired agent.

## Agent images

The container image used by an agent is built from the Git repository and commit referenced by the agent template version.

An agent's image can be rebuilt manually as needed (for example after fixing a failure, or to pick up the latest layers from a non-idempotent build step).

## Interacting with agents

From the agent details page you can:

- start and stop the agent (stopping removes the pod and frees its cluster resources; restarting recreates it)
- view the agent's logs
- view the agent's audit history
- rebuild the agent's container image

## Creating your own agents

See our [agent development guide](/advanced/agent-development.md) for a walkthrough of building your own agent templates from scratch.
