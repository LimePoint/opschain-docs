---
sidebar_position: 1
description: Overview of OpsChain.
---

# What is OpsChain?

OpsChain is a GitOps-driven orchestration and change automation platform developed by LimePoint. It enables organizations to define, execute, and track changes across local, hybrid, and multi-cloud environments in a consistent, auditable, and repeatable way. OpsChain structures change using key concepts such as projects, environments, assets, and actions, providing teams with a standardized approach to manage infrastructure, application, and configuration changes.

## Why OpsChain?

Modern organizations typically rely on automation, ranging from shell scripts to advanced tools like Terraform, Ansible, or Chef. However, as automation evolves within different teams, it often results in disconnected silos. For example, a database team may use scripts, an infrastructure team may use Terraform and Ansible, and a deployment team might use Gradle or similar tools.

These fragmented approaches can make end-to-end change management difficult. A typical application release might involve infrastructure provisioning, database updates, and service orchestration—each owned by a different team and executed using different tools. While each step might be automated, the coordination between them is often manual, error-prone, or undocumented.

![OpsChain Change Overview](/img/oc_overview.png)

## How OpsChain Helps

OpsChain solves this problem by acting as a tool-agnostic orchestration layer. It doesn’t replace your existing automation—it integrates with it. By allowing teams to plug in their existing scripts and tools, OpsChain enables organizations to unify change across the entire delivery lifecycle without needing to rebuild automation from scratch. It provides visibility and governance over complex, cross-functional change processes while letting teams continue to use the tools they know best.
