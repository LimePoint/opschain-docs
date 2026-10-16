---
sidebar_position: 4
description: The administration screen's remote runners section - list remote runner targets and their status, add a target, and manage a target's description, scope, settings and maintenance mode.
---

# Remote runners

Select **Administration** in the navigation bar, then **Remote runners**, to list the [remote runner](/advanced/remote-runners/index.md) targets you can access, with their status and maintenance mode. To turn maintenance mode on or off for several targets, or to delete them, select them and open **Bulk actions**.

<p align='center'>
  <img alt='Remote runners screen' src={require('!url-loader!../images/remote-runner-targets-list.png').default} className='image-border'/>
</p>

## Adding a target

1. Click **Add remote runner target**.
2. Enter the target's code, choose its owning resource and attach the daemon's public key.
3. Click **Add remote runner target**.
4. Click **Copy daemon configuration** before you leave the page - the bearer token in it is shown only once.

<p align='center'>
  <img alt='Add remote runner target form' src={require('!url-loader!../images/remote-runner-targets-create-form.png').default} className='image-border'/>
</p>

See [create the target in OpsChain](/advanced/remote-runners/setup.md#create-the-target-in-opschain) for the values to enter.

## Viewing a target

Select a target in the list to open its page. Banners at the top explain what the target's state means for the changes it serves. From this page you can:

<p align='center'>
  <img alt='Remote runner target page' src={require('!url-loader!../images/remote-runner-details.png').default} className='image-border'/>
</p>

- edit the target's **Description**
- limit the resources it serves under **Scope** - see [which changes run remotely](/advanced/remote-runners/index.md#which-changes-run-remotely)
- override the [remote runner settings](/key-concepts/settings.md#remote-runner-settings) for this target under **Settings**
- turn maintenance mode on or off, or delete the target, from the **⋮** menu - see [upgrade the runner](/advanced/remote-runners/setup.md#upgrade-the-runner)
