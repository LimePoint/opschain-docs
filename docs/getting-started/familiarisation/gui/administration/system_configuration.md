---
sidebar_position: 2
description: The administration screen's configuration section - edit OpsChain's global settings, notification channels, trusted CA certificates, banners and maintenance mode from the GUI.
---

# System configuration

## Understanding the configuration screen

Select **Administration** in the navigation bar, then **Configuration**, to change OpsChain's global settings - the values every project, environment and asset falls back to unless it sets its own.

<p align='center'>
  <img alt='System configuration screen' src={require('!url-loader!../images/system-configuration.png').default} className='image-border'/>
</p>

Each setting the screen edits is described in the [settings reference](/key-concepts/settings.md) or the [additional settings](/setup/configuration/additional-settings.md) guide. The [settings managed by the deployment](/setup/configuration/additional-settings.md#settings-managed-by-the-deployment) are changed in your `values.yaml` file instead, and are not editable here.

Type in **Search in config** to find a section by its name or by the settings it holds. Access is controlled by the `/system_configuration` [resource path](/getting-started/familiarisation/gui/manage_security.md#top-level-paths).

## Saving your changes

Each section saves only its own settings: select **Save changes** before moving to another section, or **Discard** to put back the saved values. Changes apply as soon as they are saved.

## Editing the settings as JSON

Select **Switch to advanced mode** to edit the whole global settings document as JSON - for settings that have no form, or to remove a setting. It works like the [settings editor](/getting-started/familiarisation/gui/projects/properties_and_settings.md#settings) on a project.
