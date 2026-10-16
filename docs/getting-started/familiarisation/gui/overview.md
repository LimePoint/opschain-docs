---
sidebar_position: 1
description: The OpsChain GUI's dashboard, top bar and navigation bar, and the shortcuts and downloads that work across every screen.
---

# Overview

After [logging in](/getting-started/familiarisation/gui/login.md) you land on the **Dashboard**. Every screen in the GUI shares the same frame: the top bar, for searching and starting runs, and the navigation bar on the left, for moving between screens.

<p align='center'>
  <img alt='The dashboard, with the top bar and navigation bar' src={require('!url-loader!./images/familiarisation.png').default} className='image-border'/>
</p>

| Key | Element | Key | Element |
|-----|---------|-----|---------|
| A | Navigation bar toggle | G | Navigation bar |
| B | Search | H | Manage activity count |
| C | Active runs | I | Administration |
| D | Run | J | Versions |
| E | Theme toggle | K | Dashboard time range |
| F | User menu | L | Panel controls |

## The top bar

| Element | Function |
|---------|----------|
| **Navigation bar toggle** | Collapse or expand the navigation bar. |
| **Instance name** | Shown beside the logo when your administrator has given the instance a title. Hover over it to see the support contact. See [instance info](/getting-started/familiarisation/gui/administration/system_configuration.md). |
| **Search** | Search pages, resources, steps and activity, or run a command. Press <kbd>Ctrl</kbd>+<kbd>L</kbd> (<kbd>⌘</kbd>+<kbd>L</kbd> on a Mac) to open it from anywhere. See [search](/getting-started/familiarisation/gui/search.md). |
| **Compare** | Shown while you have a project, environment, asset or agent pinned for comparison. See [project details](/getting-started/familiarisation/gui/projects/project_details.md). |
| **Active runs** | The number of changes and workflow runs currently in flight that you can access. Select it to list them. |
| **Run** | Run a [change](/getting-started/familiarisation/gui/activity/index.md#run-change) or a [workflow](/getting-started/familiarisation/gui/activity/index.md#run-workflow), or [run bulk changes](/getting-started/familiarisation/gui/activity/bulk_run_change.md). |
| **Theme toggle** | Switch between the light and dark themes. |
| **User menu** | Your [notification](/operations/notifications.md#user-preferences) preferences and subscriptions, **Secret management** and **Logout**. **Secret management** has a **Secret vault** tab to store or retrieve secret values and files in the secret vault, and an **AES encryption** tab to encrypt values without touching the vault. |

## The navigation bar

| Item | Screen |
|------|--------|
| **Dashboard** | This screen - see [the dashboard](#the-dashboard). |
| **Projects** | Your projects and everything in them: environments, assets, agents, templates, Git remotes, workflows, properties and settings. See [projects](/getting-started/familiarisation/gui/projects/index.md). |
| **Activity** | Every change and workflow run available to you, with filters. See [activity](/getting-started/familiarisation/gui/activity/index.md). |
| **Scheduled activity** | Changes and workflow runs scheduled to run later, on a repeat, or on new commits. See [scheduled activities](/getting-started/familiarisation/gui/activity/scheduled_activities.md). |
| **Workflows** | The workflow list and editor. See [workflows](/getting-started/familiarisation/gui/workflows.md). |
| **Audit history** | Events raised across OpsChain. See [audit history](/getting-started/familiarisation/gui/audit_history.md). |
| **Manage activity** | Steps waiting for your approval or continuation, or for someone in your LDAP groups. A count beside it shows how many are waiting. See [manage activity](/getting-started/familiarisation/gui/activity/manage_activity.md). |
| **Manage security** | Authorisation policies, users and groups. See [manage security](/getting-started/familiarisation/gui/manage_security.md). |
| **Administration** | [System information](/getting-started/familiarisation/gui/administration/system_information/index.md), [configuration](/getting-started/familiarisation/gui/administration/system_configuration.md), [data cleanup](/getting-started/familiarisation/gui/administration/data_cleanup.md), [remote runners](/getting-started/familiarisation/gui/administration/remote_runners.md) and the [licence](/getting-started/familiarisation/gui/administration/licence.md). |

**Manage security** and **Administration** are listed for every user, but some of the actions on those screens are available only to superusers. Below them, **Versions** opens the [version info](/getting-started/familiarisation/gui/administration/version_info.md) dialog.

## The dashboard

The dashboard charts the changes and workflow runs created in a time range you choose, as a grid of panels, alongside panels showing what is happening now, such as the steps waiting for your approval and the most recent activities.

<p align='center'>
  <img alt='Dashboard chart drill-down' src={require('!url-loader!./images/dashboard-drill-down.png').default} className='image-border'/>
</p>

The toolbar above the panels sets the time range - a quick range, or **From** and **To** dates - and can group the charts by hour, day, week or month, limit them to changes or workflows, and limit them to the projects you pick. The refresh button fetches the figures again, and its dropdown refreshes them automatically. On a narrow screen these controls fold into a **Filters** button.

Click a segment, bar or point on a chart to list the changes and workflow runs behind it. Type in **Quick search** to filter the list, and click a run to open its [activity details](/getting-started/familiarisation/gui/activity/activity_details.md).

### Arranging the dashboard

Open **Add panels** to see every panel with its description, and drag a panel onto the dashboard. Drag a panel by its title bar to move it, and by its bottom-right corner to resize it; hover over it and click the cross to remove it. The button beside **Add panels** resets the dashboard to its default layout.

<p align='center'>
  <img alt='Add panels list' src={require('!url-loader!./images/dashboard-add-panels.png').default} className='image-border'/>
</p>

The layout and the toolbar settings are saved in your browser, so the dashboard looks the same next time you open it there. On a narrower screen the panels reflow into fewer columns, and a layout you arrange at that width is kept for it.

## Downloading lists and logs

The activity, projects, environments, assets and agents lists each have a **CSV** button that downloads every row matching the current filters as a CSV file. The activity download lists its changes and workflow runs oldest first, whatever sort the list is using. Each file is named after the project, environment or asset the list belongs to — `bank_dev_assets.csv` for the assets of the `dev` environment in the `bank` project, for example.

Each log viewer, and the log dialog on the pods screen, has a **Download** button that saves the whole log as a `.log` file, oldest line first, with each line's timestamp and category. A change's log download includes its child steps' lines when the viewer is showing them.

Both downloads stream from the server straight to disk, so a large list or log does not have to load in the browser first. The buttons are disabled, with the tooltip **Nothing to download**, while the list or log is empty.

## Keyboard shortcuts

These shortcuts work from any screen in the GUI.

| Shortcut | Action |
|----------|--------|
| <kbd>Ctrl</kbd>+<kbd>L</kbd> (<kbd>⌘</kbd>+<kbd>L</kbd> on a Mac) | Open or close [search](/getting-started/familiarisation/gui/search.md). |
| <kbd>/</kbd> | Open search, while you are not typing in a field or editor. |
| <kbd>Alt</kbd>+<kbd>C</kbd> (<kbd>⌥</kbd>+<kbd>C</kbd> on a Mac) | Open the [run change](/getting-started/familiarisation/gui/activity/index.md#run-change) dialog. |
| <kbd>Alt</kbd>+<kbd>W</kbd> (<kbd>⌥</kbd>+<kbd>W</kbd> on a Mac) | Open the [run workflow](/getting-started/familiarisation/gui/activity/index.md#run-workflow) dialog. |
| <kbd>Alt</kbd>+<kbd>B</kbd> (<kbd>⌥</kbd>+<kbd>B</kbd> on a Mac) | Open the [run bulk changes](/getting-started/familiarisation/gui/activity/bulk_run_change.md) screen, starting from the project, environment or asset you are viewing. |
| <kbd>Alt</kbd>+<kbd>E</kbd> (<kbd>⌥</kbd>+<kbd>E</kbd> on a Mac) | Open **Secret management** on its **Secret vault** tab. Does nothing unless you have access to secret management. |

Some screens add shortcuts of their own:

- The search dialog has shortcuts for moving between tabs and results - see [search keyboard shortcuts](/getting-started/familiarisation/gui/search.md#keyboard).
- The workflow editor's **Quick add** buttons insert step snippets with <kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>1</kbd> to <kbd>6</kbd> - see [editor pane](/getting-started/familiarisation/gui/workflows.md#editor-pane).
- In a step tree, <kbd>Ctrl</kbd>+<kbd>F</kbd> (<kbd>⌘</kbd>+<kbd>F</kbd> on a Mac) jumps to the tree's search box in place of the browser's find, and the search moves between matches with <kbd>Enter</kbd> and <kbd>Shift</kbd>+<kbd>Enter</kbd> - see [navigating the step tree view](/getting-started/familiarisation/gui/activity/activity_details.md#navigating-the-step-tree-view).
- The JSON editors for properties and settings list their shortcuts under **Shortcuts** - see [editor shortcuts](/getting-started/familiarisation/gui/projects/properties_and_settings.md#editor-shortcuts).
