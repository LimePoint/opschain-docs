---
sidebar_position: 1
description: An overview on the various concepts that will help you to understand OpsChain and its uses.
---

# Overview

There are several key OpsChain concepts that are necessary to comprehend in order to understand OpsChain and its uses.

## Organisational structure

To start, let's have a look at the options OpsChain provides to organize your resources.

### Project

Projects are the top-level organization unit in OpsChain. They are used to manage your [Git remotes](#git-remote) and to configure your [asset templates](#asset-template) and [workflows](#workflow). They can contain child environments and assets, which can further help you organize your OpsChain instance.

For simpler setups, a project can also be used for running [changes](/key-concepts/changes.md), given a Git remote and a Git revision are provided.

Since they are the "root" of your OpsChain environments and assets, any properties and settings defined at the project level are available to all environments and assets within it, making it a great place to store your project-wide settings. These properties and settings can be overridden at the environment and asset level, if necessary.

### Environment

Environments are the second level of the OpsChain organization structure. They are used to logically group assets and to provide an intermediate level for overriding your project's properties and settings. They are also capable of running [changes](/key-concepts/changes.md), given a Git remote and a Git revision are provided.

When duty segregation is considered, you can create different environments for different teams (for example _Development_ or _Production_), ensuring that each team only has access to the environments they are responsible for and the set of actions they are allowed to run.

Similar to projects, any properties and settings defined at the environment level are available to all assets within it, making it a great place to store your environment-specific settings. These properties and settings can be overridden at the asset level, if necessary.

### Asset

Assets are the inner-most level of the OpsChain organization structure. They are directly linked to the templates in your Git repository, and should be the closest representation of actual infrastructures or services that you want to manage. They are associated with Git repositories via [templates](/key-concepts/assets.md#asset-templates) and linked to a Git revision via [template versions](/key-concepts/assets.md#asset-template-versions), which makes them the ideal component for running [changes](/key-concepts/changes.md).

Properties and settings configured at the asset level will override the project and environment-level settings, if they exist. As a last resort, you can override the properties at a change level, for custom or one-off purposes.

You can read more about assets in the [assets guide](/key-concepts/assets.md).

## Code sources

The interface between your code and OpsChain is through Git remotes. These are further extended by asset templates to provide control and auditability over your assets. Template versions help you track the changes to your assets over time and avoid any unintended or unexpected changes to them.

### Git remote

In OpsChain, a Git remote is a named reference to an actual [Git remote](https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes). It is used to securely store the credentials to access a Git repository from which you can run changes.

Git remotes are also the basis for [asset templates](/key-concepts/assets.md#asset-templates), which are used to leverage your assets within OpsChain.

See the [Git remotes guide](/key-concepts/git-remotes.md) for more information.

### Asset template

Asset templates are the basis for your assets. They are linked to a named folder in a Git remote, which will contain the code for the specific template.

The terms _asset template_ and _template_ are used interchangeably in the product and this documentation.

See the [asset templates guide](/key-concepts/assets.md#asset-templates) for more information.

### Asset template version

Asset template versions refer to a specific Git revision of an asset template, be that a branch, a tag or a commit SHA.

See the [asset template versions guide](/key-concepts/assets.md#asset-template-versions) for more information.

## Properties

Properties are a JSON-like structure that can be used to store configuration for changes. They are stored in an versioned, auditable and secure manner and can be referenced directly in your `actions.rb` files.

See the [OpsChain properties](/key-concepts/properties.md) guide for more information.

## Settings

Settings are where you can configure how OpsChain will handle the execution of the changes and workflow runs for your projects, environments and assets. Just like properties, they can be overriden at any level, however, they have a pre-defined set of configurations available. They are also stored in an versioned, auditable and secure manner.

See the [OpsChain settings](/key-concepts/settings.md) guide for more information.

## Activities

After connecting your code to OpsChain, you'll execute your actions via changes or workflow runs, which represent the actual execution lifecycle of your code inside OpsChain.

### Change

In OpsChain, a change can be understood as the execution of an action from a specific Git revision on a specific Git remote. The inputs to a change are the source code it should run (provided by the Git information) and the properties it should consider when executing the action, which can come from the Git repository, the project, the environment or the asset.

A change consists of one or more steps, which are the actual units of work that are executed. Steps can be executed sequentially or in parallel, and can have prerequisites that must be completed before they can run.

See the OpsChain [change reference guide](/key-concepts/changes.md) for more information.

### Workflow

OpsChain allows you to organise a number of [changes](#change) across different environments and assets into a workflow. Workflows also provide stages, which allows you to run a group of changes sequentially or in parallel, wait and approval steps as well as the ability to call other workflows.

Workflows are versioned and can be collaboratively edited by multiple users. Besides, OpsChain provides a templating language to enable you to refer to multiple environments and assets with ease, using the properties system.

See the [workflows guide](/key-concepts/workflows.md) for more information.

### Workflow run

A workflow run is the execution of a workflow. It consists of one or more steps, which are the actual units of work that are executed.

### Activity

In OpsChain, an _activity_ is an umbrella term to refer to both changes and workflow runs when either term applies.

### Scheduled activity

Both changes and workflow runs can be scheduled to run on a future date and configured to run on a repeated schedule. This is referred to as a _scheduled activity_.

In particular, scheduled changes can also be configured to only create a change when there are updates to a Git repository.

See the [scheduled changes](/key-concepts/scheduled-changes.md) guide for instructions on how to create a scheduled change or a scheduled workflow run.

## Actions

Actions are the building blocks of your code. They define the actual work that can be performed on your changes.

Below is a list of concepts that OpsChain's DSL provides to help you define your actions.

### Action

An action is a task that can be performed (for example provisioning or restarting a server). Actions can have prerequisites that will run before and steps that will run after the main action itself has completed.

The logic for an action can be provided directly within the action definition, or if the action forms part of a Resource, it can call logic within its associated controller.

See the [actions reference guide](/key-concepts/actions.md#defining-standalone-actions) and the advanced guide on [developing your own resources](/advanced/developer.md#developing-resources) for more information.

### Resource

A resource represents something that OpsChain can perform actions on (e.g. SOA Instance, Confluent Broker, Linux Host, etc.) and is an instance of a resource type. A resource may include:

- A controller class that will provide logic for some (or all) of the resource actions
- Any number of resource properties. These are key value pairs that can be referenced in the action code and are supplied as a hash to the controller's constructor
- Any number of action definitions, allowing you to define actions that can be performed on the resource

See the [actions reference guide](/key-concepts/actions.md#defining-resource-types--resources) and the advanced guide on [developing your own resources](/advanced/developer.md#developing-resources) for more information.

### Resource type

A resource type is a template for creating resources. Rather than duplicating the definition for each instance of a resource, the controller, resource properties and action definitions can be defined in the resource type and automatically configured when the resource is created.

See the [actions reference guide](/key-concepts/actions.md#defining-resource-types--resources) and the advanced guide on [developing your own resources](/advanced/developer.md#developing-resources) for more information.

### Composite resource

A composite resource is a resource that encapsulates child resources. Composite resources also allow you to define actions that will apply to all the composite's children. The _Confluent Broker_ composite in the example defines three actions (configure, start and install). Executing any of these actions on the composite will execute the equivalent action on each of the child brokers.

See the [actions reference guide](/key-concepts/actions.md#defining-composite-resources--resource-types) and the advanced guide on [developing your own resources](/advanced/developer.md#developing-resources) for more information.

### Controller

A controller is a Ruby object that can be configured via properties and provides the logic for completing different actions. A controller class must have:

- an `initialize` method that accepts a hash containing different properties
- one or more action methods (these do not accept parameters)

An example controller is shown in the [actions reference guide](/key-concepts/actions.md#controller).

## Steps

Steps are the definition of how your actions are executed within OpsChain.

### Step

A step is a unit of work that is run by an OpsChain worker. A step typically runs a single action that may have its own prerequisites and child steps.

### Step runner image

By default, all steps are executed within the same isolated container. The step runner image is the base image used for the step containers.

If a custom step runner image (`.opschain/Dockerfile`) is not used, then a default step runner image is created including the Git remote and the resolved Git revision.

See the [OpsChain step runner](/key-concepts/step-runner.md) guide for more information.

:::info
You can configure a change to run each step in an isolated container via the `pod_per_change_step` setting.
:::

### Step context

The step context can be used within the `actions.rb` file and includes information about the current running change. It can be interacted with in a similar manner to [properties](#properties), but the values are automatically populated by OpsChain.

See the [OpsChain step context](/key-concepts/context.md) guide for more information.

## Events

OpsChain tracks events performed as part of the OpsChain system and also allows you to create your own custom events.

See the [OpsChain events](/key-concepts/events.md) guide for more information.
