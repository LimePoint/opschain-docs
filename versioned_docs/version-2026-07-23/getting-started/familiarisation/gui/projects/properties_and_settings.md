---
sidebar_position: 9
description: ''
---

# Properties and settings

## Properties

A set of properties can be specified against projects, environments, agents and assets. The properties are then available to the actions that are executed within the respective scope. This allows the running actions to query the properties at runtime to influence the change.

<p align='center'>
  <img alt='Project properties screen' src={require('!url-loader!../images/project-properties.png').default} className='image-border'/>
</p>

:::tip[Secure properties]
When editing the properties, you can use the [secret vault](/key-concepts/properties.md#secrets) format to tell OpsChain to fetch the value from the configured secret vault.
:::

The properties editor provides JSON schema autocomplete and inline validation — suggesting keys and values and flagging invalid keys as you type — matching the settings editor. This applies to the current properties editor and the property overrides editors in the [run change](/getting-started/familiarisation/gui/activity.md#run-change) and run workflow dialogs.

### Buttons & links

| Buttons & links               | Function                                                                                                 |
|-------------------------------|----------------------------------------------------------------------------------------------------------|
| **Edit properties**           | Allows you to edit the properties of the project, environment, agent or asset.                           |
| **Upload file**               | Allows you to upload a file as a property of the project, environment, agent or asset.                   |
| **Inherited properties**      | Allows you to view the properties that are inherited from the project, environment or Git remote.        |
| **Compare versions**          | Allows you to compare the properties between two different versions.                                     |

Read more about properties in the [properties concept page](/key-concepts/properties.md).

## Settings

Similar to properties, the settings tab allows you to specify configuration options that apply to projects, environments, agents and assets. Settings alter how OpsChain behaves, thus the only keys allowed are the ones described in the [settings reference](/key-concepts/settings.md).

The most commonly used settings are presented as dedicated form fields - grouped into sections such as node defaults, image reuse, build settings, runner pod concurrency and API worker autoscaling - with a description for each option. The raw JSON advanced editor remains available for any setting not surfaced as a field.

<p align='center'>
  <img alt='Project settings screen' src={require('!url-loader!../images/project-settings.png').default} className='image-border'/>
</p>

:::tip[Override settings]
When creating a change, you can override the settings used only for that change. See the [run change page](/getting-started/familiarisation/gui/activity.md#run-change) for more information.
:::

### Buttons & links

| Buttons & links               | Function                                                                                                 |
|-------------------------------|----------------------------------------------------------------------------------------------------------|
| **Edit settings**             | Allows you to edit the settings of the project, environment, agent or asset.                             |
| **Inherited settings**        | Allows you to view the settings that are inherited from the project or environment.                      |
| **Compare versions**          | Allows you to compare the settings between two different versions.                                       |
