---
sidebar_position: 5
description: ''
---

# Agents

OpsChain agents perform long-running tasks, in contrast to [changes](/key-concepts/changes.md) and [workflow runs](/getting-started/familiarisation/gui/workflows.md) which are short-lived.

An agent runs as a Kubernetes pod on the same cluster that hosts OpsChain. Agents can be stopped to free up cluster resources and restarted later, and OpsChain provides access to each agent's logs and audit history through the GUI.

## Where an agent runs

Each agent runs at one [site](/advanced/ha/index.md). The agent's overview names it in a **Site** pill, and the agents table shows an agent that is running at another site as running, the same as one running here.

An agent's own logs are held in the database, so they are readable from any site. Its debug logs are the Kubernetes events of its pod, so they can only be read at the site whose Kubernetes holds it — open the agent from that site's GUI to see them. The **Active image SHA** of an agent hosted at another site is the image the agent was started with rather than a reading of the running pod, and its tooltip says so.

## Agent templates

OpsChain agents are based on templates that reference a [Git remote](/getting-started/familiarisation/gui/projects/git_remotes.md). An agent template is created by selecting the relevant Git remote and supplying a code and a name. The agent code allows a single Git repository to contain the code for multiple agents.

### Promoting an agent to a new template version

Once an agent has been created, its template cannot be changed. To alter the agent's configuration, either update the agent's properties or create a new version of the existing agent template and assign it to the desired agent.

## Agent images

The container image used by an agent is built from the Git repository and commit referenced by the agent template version.

An agent's image can be rebuilt manually as needed (for example after fixing a failure, or to pick up the latest layers from a non-idempotent build step).

Agent images live in the image registry of the site that built them. When you start an agent, OpsChain checks that its image is in the registry of the site handling the start, rather than assuming a past successful build is enough — an image can be removed by an [agent image cleanup](/operations/maintenance/data-cleaning.md), and in a high availability deployment it may have been built at a different site.

If the image is not there, OpsChain builds it and automatically starts the agent once that build finishes.

## Interacting with agents

From the agent details page you can:

- start and stop the agent (stopping removes the pod and frees its cluster resources; restarting recreates it)
- view the agent's logs
- view the agent's audit history
- rebuild the agent's container image

## Creating your own agents

See our [agent development guide](/advanced/agent-development.md) for a walkthrough of building your own agent templates from scratch.
