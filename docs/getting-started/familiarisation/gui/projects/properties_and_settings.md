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

### Inherited properties

**Inherited properties** shows the converged result of every layer that contributes to the project, environment, agent or asset - the repository properties held in the Git remote alongside the database properties stored against each node in the path.

<p align='center'>
  <img alt='Inherited properties screen' src={require('!url-loader!../images/asset-inherited-properties.png').default} className='image-border'/>
</p>

Above, the project layer's repository half has been excluded, so the two properties it supplies are missing from the document and the **Project** checkbox shows a dash.

The sources panel to the right of the document lists those layers. Untick one and OpsChain converges again without it, so you can find where a value comes from by taking layers away until it changes. Tick several in a row and it waits until you stop before reconverging. Excluding a layer only changes what you are looking at - nothing is saved, and a change run against the node still converges every layer.

A layer holding both repository and database properties has a row for each, so one half can be excluded and the other kept. The layer's own checkbox shows a dash while part of it is excluded, and ticking it restores the whole layer. **All** appears in the panel heading whenever anything is excluded and puts every layer back.

Which layers appear depends on the node. **Common** covers the repository properties that apply to every project, followed by **Project**, **Environment** and then **Asset** or **Agent**, with **Template** and **Template version** for a node using an [asset template](/getting-started/familiarisation/gui/projects/asset_templates.md). A layer that contributes nothing is left out.

**Show sources** annotates each property in the document with where it came from, and hovering a layer in the panel picks out the properties that layer supplied. Hover over an annotation for a button that copies it. A long annotation scrolls with the document rather than being cut off, and copying the document itself never includes the annotations. The button beside it collapses the panel into the right-hand edge. Each of the properties viewers keeps its own collapsed state, so collapsing it here leaves it open on a change.

The excluded layers are held in the page URL, so a narrowed view can be bookmarked or sent to someone else.

Comparing two versions lists the layers twice, under **Left sources** and **Right sources**, so each side of the comparison can be narrowed on its own.

### Comparing versions

**Compare versions** shows two versions of a node's properties side by side, and the settings tab has its own. Each side has its own version selector, listing every version newest first, and opens on the two newest. Only the two versions on screen are loaded, so a node with a long history opens as fast as one with a short one.

Additions are shown in green and removals in red, judged against whichever side is newer - the newer side carries a **Newer** badge. Choosing an older version on the right therefore shows what it lacks in red, rather than treating the left side as the original. **Swap sides** exchanges the two versions.

The same colours, badge and **Swap sides** button are used wherever two versions are compared: a template or template version's properties and settings, an asset's MintModel versions, an asset's inherited properties at two points in time, and the stages of a [change's properties](/getting-started/familiarisation/gui/activity_details.md#properties).

### Editor shortcuts

The **Shortcuts** button at the foot of each JSON editor lists the editor's keyboard shortcuts - folding, find and replace, go to line, formatting and the full command list - and clicking one runs it. A document longer than 150 lines opens with its top-level keys folded, so you can open the section you need. <kbd>Ctrl</kbd>+<kbd>K</kbd> (<kbd>⌘</kbd>+<kbd>K</kbd> on a Mac) begins the editor's folding shortcuts, which is why [search](/getting-started/familiarisation/gui/search.md) opens with <kbd>Ctrl</kbd>+<kbd>L</kbd>.

### Buttons & links

| Buttons & links               | Function                                                                                                 |
|-------------------------------|----------------------------------------------------------------------------------------------------------|
| **Edit properties**           | Allows you to edit the properties of the project, environment, agent or asset.                           |
| **Upload file**               | Allows you to upload a file as a property of the project, environment, agent or asset.                   |
| **Inherited properties**      | Allows you to view the properties that are inherited from the project, environment or Git remote, and to exclude layers from the converge - see [inherited properties](#inherited-properties). |
| **Compare versions**          | Allows you to compare the properties between two different versions - see [comparing versions](#comparing-versions). |

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
| **Compare versions**          | Allows you to compare the settings between two different versions - see [comparing versions](#comparing-versions). |
