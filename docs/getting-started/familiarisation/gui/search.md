---
sidebar_position: 3
description: Find pages, resources, steps and activity from the search dialog, or narrow a search with filters on the full search page.
---

# Search

Search finds the pages and tabs of the GUI, your projects, environments, assets, agents, templates, workflows and policies, the changes that ran a particular step, and changes and workflow runs. It also runs common commands, so most screens are a few keystrokes away wherever you are.

## Opening the search dialog

Select **Search…** in the top pane, or press <kbd>Ctrl</kbd>+<kbd>L</kbd> (<kbd>⌘</kbd>+<kbd>L</kbd> on a Mac) from anywhere in the GUI. <kbd>/</kbd> also opens it while you are not typing in a field or editor. Press <kbd>Ctrl</kbd>+<kbd>L</kbd> again, or <kbd>Esc</kbd>, to close it.

Before you type anything, the dialog lists what applies to the page you are on, the resources you opened recently, shortcuts to the activity, approval, scheduled activity and audit history screens, and a handful of commands.

## What you can search for

The tabs across the top of the dialog narrow the results to one kind of thing. Press <kbd>Tab</kbd> to move to the next tab and <kbd>Shift</kbd>+<kbd>Tab</kbd> to go back. Each tab shows how many results it holds once you have typed something.

| Tab | Finds |
|-----|-------|
| **All** | Everything below, ranked together. |
| **Pages** | The screens of the GUI, and the tabs of a particular resource - type `abc properties` to go straight to the properties of the ABC project. Superusers also find the administration screens and each section of the system configuration page, so `ldap` opens the LDAP configuration. |
| **Resources** | Projects, environments, assets, agents, templates and workflows, matched on their name, code and path, and the authorisation policies you are permitted to list. |
| **Steps** | Step actions and step names. Opening one lists every change that ran that step - see [searching by step](#searching-by-step). |
| **Activity** | Changes and workflow runs. Phrases such as `failed today` or `my running changes` become a filter on the [full search page](#the-full-search-page). |
| **Commands** | Run a change or workflow, manage secrets, switch theme, copy a link to the page you are on, open the documentation, log out, and so on. Commands that act on the page you are on - running a change on the resource you are viewing, pinning it to compare, or watching the change you have open - are listed under **For this page**. |

Results match as you type, and minor typos are tolerated once you have typed three characters - `enviroment` still finds your environments. A tab name on its own, such as `git remotes`, offers that tab on the resource you are viewing and on the resources you opened recently, then **Git remotes of…** to choose another project.

### Examples

The examples below use an ABC project with a `dev` environment, a `web` asset template, a `deploy` workflow and a `build-01` agent. Substitute your own names or codes.

#### Resources and their tabs

Type a resource's name or code to open it, or follow it with the name of a tab to go straight to that tab. A resource is matched on its name, its code and its path, so `abc dev` finds the `dev` environment of ABC rather than every environment called `dev`.

| Search | Opens |
|--------|-------|
| `dev` | The `dev` environment, and any other resource whose name or code matches. |
| `abc envs` | ABC's environments. |
| `abc repos` | ABC's Git remotes. `remotes`, `git`, `repository` and `repositories` work too. |
| `abc templates` | ABC's asset templates. |
| `abc agents` | ABC's agents. |
| `dev env vars` | The properties of the `dev` environment. `props`, `variables` and `vars` work too. |
| `dev schedules` | The scheduled activities of the `dev` environment. `cron` works too. |
| `dev audit` | The audit history of the `dev` environment. `events` works too. |
| `web template versions` | The versions of the `web` asset template. `web properties` and `web settings` open its other tabs. |
| `deploy editor` | The `deploy` workflow in the workflow editor. `deploy runs` lists its runs, and `deploy overview` opens its overview. |
| `build-01 logs` | The `build-01` agent's logs. `build-01 lifecycle` opens its lifecycle events. |
| `<asset> actions` | An asset's [actions](/getting-started/familiarisation/gui/projects/assets.md#the-assets-action-tree). `<asset> model` opens its MintModel. |
| `production access` | An authorisation policy whose name or description matches, if you are permitted to list policies. |

Pasting a template's ID opens that template.

#### Pages

| Search | Opens |
|--------|-------|
| `approvals` | The activity waiting for your approval. |
| `continue` | The activity waiting to be continued. |
| `cron` | The scheduled activity screen. |
| `who changed` | The audit history screen. |
| `alerts` | Your notification subscriptions. |
| `bulk` | The bulk run changes screen. |

Superusers also find the administration and security screens and the sections of the system configuration page, by their names or by the settings they hold:

| Search | Opens |
|--------|-------|
| `pods`, `queues`, `database` | That tab of the system information screen. |
| `purge` or `retention` | The data cleanup screen. `new cleanup job` adds a job. |
| `license` | The licence screen. |
| `users`, `groups`, `rbac` | The security screens. |
| `ldap` | The LDAP configuration. |
| `slack` or `email` | The notification settings. |
| `memory limit` or `pod resources` | The node settings. |
| `max pod memory` or `concurrency` | The runner pod limits. |
| `max workers` | The API autoscaling settings. |
| `maintenance` or `freeze` | The maintenance mode section. |
| `trust store` | The CA certificates. |
| `banner` | The banner settings. |

#### Activity

A phrase built from statuses, times, kinds of activity and users becomes a filter on the full search page. Words such as `my`, `this`, `by` and `show` can be left in.

| Search | Finds |
|--------|-------|
| `failed today` | Changes and workflow runs that failed in the last 24 hours. `error` and `broken` also mean failed. |
| `my running changes` | Your changes that are running now. |
| `waiting runs this week` | Workflow runs waiting for approval or continuation, started in the last 7 days. `stuck` and `blocked` also mean waiting. |
| `approval` | Activity waiting for approval. |
| `queued` or `pending` | Activity waiting to start. |
| `jsmith cancelled month` | Activity started by the user `jsmith` and cancelled in the last 30 days. A unique start of a username, three characters or more, also works. |
| `rejected quarter` | Activity rejected in the last 90 days. |

In advanced mode, other words are searched for in the text of changes and workflow runs - their metadata, action and Git revision, for example - so a ticket number such as `CR921` finds the changes tagged with it.

#### Steps

| Search | Finds |
|--------|-------|
| `db:backup` | Suggests the step actions and step names beginning with `db:backup`. Open one to list the changes that ran it. |

#### Commands

| Search | Runs |
|--------|------|
| `dark` | Switch to the dark theme, or back to light. |
| `secrets` or `vault` | Open the secret tool. |
| `share` | Copy a link to the page you are on. |
| `copy id` | Copy the ID of the change, workflow run or other item on the page you are on. |
| `compare` | Pin the resource you are viewing to compare it with another, then open the other resource and compare the two. |
| `watch` | Get a browser notification when the change or workflow run you are viewing finishes. |
| `reload` | Pick up projects and resources created elsewhere, from the CLI for example. |
| `help` | Open this documentation. |

### Looking up an ID

Paste the ID of a change, workflow run, step, audit event or scheduled activity - on its own or as part of a link - to open it directly. A step opens in its change's step tree, with the step selected. Only items you are permitted to see are found.

The start of an ID, eight characters or more, is matched against recent activity instead.

### Basic and advanced mode

The dialog starts in basic mode, which searches everything except the free text of changes and workflow runs. Switch to **advanced**, or press <kbd>Ctrl</kbd>+<kbd>/</kbd> (<kbd>⌘</kbd>+<kbd>/</kbd> on a Mac), to search activity text as well and to show two filters:

- **In** limits the search to one project. <kbd>Alt</kbd>+<kbd>P</kbd> opens it.
- **Activity from** sets how far back activity is searched - 24 hours, 7 days, 30 days (the default), 90 days or all time. <kbd>Alt</kbd>+<kbd>T</kbd> cycles through them. Searching all time is slower.

The mode you choose is remembered in your browser.

### Keyboard

| Key | Action |
|-----|--------|
| <kbd>↑</kbd> / <kbd>↓</kbd> | Move between results. |
| <kbd>Enter</kbd> | Open the selected result. |
| <kbd>Shift</kbd>+<kbd>Enter</kbd> | Open the selected result in a new tab. |
| <kbd>Ctrl</kbd>+<kbd>Enter</kbd> (<kbd>⌘</kbd>+<kbd>Enter</kbd>) | Open the search on the [full search page](#the-full-search-page). |
| <kbd>Esc</kbd> | Clear the search, then close the dialog. |

## Searching by step

The **Steps** tab finds the changes that ran a given step, however deep in the change's step tree it ran. As you type, it suggests the step actions and step names that begin with what you have typed, for example `db:backup`. Choose one to list every change that ran a step with that action or name.

The match against changes is exact, ignoring case, so a step filter of `deploy` does not find a change whose only matching step is `deploy_app`. Only changes you are permitted to see are listed.

The **Search by step** link above the [activity table](/getting-started/familiarisation/gui/activity.md#buttons--links) opens the same search.

## The full search page

The full search page has room for more results and more filters. Open it with **Search for "…" on the full page** at the foot of the dialog's results, with <kbd>Ctrl</kbd>+<kbd>Enter</kbd> from the dialog, or by searching for **Advanced search**. It always searches activity text, as advanced mode does.

The **Filters** sidebar holds:

| Filter | Description |
|--------|-------------|
| **Project** | Limit every tab to one project. |
| **Activity from** | How far back changes and workflow runs are searched. |
| **Type** | Changes and workflow runs, changes only, or workflow runs only. |
| **Started by** | The users who started the change or workflow run. |
| **Status** | One or more statuses. |

**Activity from**, **Type**, **Started by** and **Status** apply to the **All** and **Activity** tabs.

Each filter in use is shown as a pill in the search box, with a cross to remove it. <kbd>Backspace</kbd> in an empty search box removes the last one, and **Clear** removes them all.

On the **Steps** tab, type a step action or name and press <kbd>Enter</kbd>, or choose a suggestion, to add it as a filter. Add more than one to find changes that ran any of them. The **Activity** and **Steps** tabs list 50 results at a time, newest first, with a button to load older ones.

The search and its filters are held in the page URL, so a search can be bookmarked or sent to someone else. They see only the results they are permitted to see.
