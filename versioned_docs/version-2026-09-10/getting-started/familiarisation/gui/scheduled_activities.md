---
sidebar_position: 6
description: ''
---

# Scheduled activities

## About scheduled activities

Both changes and workflow runs can be scheduled to run on a future date and configured to run on a repeated schedule. This is referred to as a _scheduled activity_.

Scheduled activities are configured in OpsChain to automatically create and deploy changes or workflow runs in a project, environment or asset:

- at a particular time, on a recurring cron schedule
- in response to project Git repository updates (scheduled changes only)

## Understanding the scheduled activity screen

A table view is presented upon accessing the scheduled activity screen. This view organises scheduled changes and scheduled workflows, allowing users to track, review, and manage upcoming activities.

### Scheduled activity details

<p align='center'>
  <img alt='Scheduled activity screen' src={require('!url-loader!./images/scheduled-activity.png').default} className='image-border'/>
</p>

Each row includes:

| Column              | Description                                                                                                                    |
|---------------------|--------------------------------------------------------------------------------------------------------------------------------|
| **Target**          | Indicates the project or environment against which the activity is scheduled to run.                                           |
| **Type**            | Indicates how the schedule is triggered, either by a scheduled run or via a new commit.                                        |
| **Action**          | The action that will be executed.                                                                                              |
| **Next run at**     | Timestamp for when the activity is next scheduled to run.                                                                      |
| **Repeats**         | Whether the scheduled activity is recurring or will run only once.                                                             |
| **Enabled**         | Whether the scheduled activity is enabled or not (e.g. because its parent has been archived).                                  |
| **Scheduled by**    | The user who scheduled the activity.                                                                                           |
| **Created at**      | Timestamp for when the scheduled activity was created.                                                                         |

#### Buttons & links

| Buttons & links               | Function                                                               |
|-------------------------------|------------------------------------------------------------------------|
| **Bulk actions**              | Perform operations on multiple scheduled activities, such as deletion. |
| **Search bar**                | Filter the contents of the table based on these criteria.              |
| **Columns**                   | Hide or display columns in the table.                                  |

## Triggering on new commits only

When creating a scheduled change, you can decide whether it only creates a change if there are new commits in the Git repository since the previous run.

| New commits only | Git revision has new commits | OpsChain change created |
|:-----------------|:-----------------------------|:------------------------|
| true             | true                         | true                    |
| true             | false                        | false                   |
| false            | n/a                          | true                    |

:::note
If the current commit on the relevant Git revision (for example `master`) hasn't been used in a change for the chosen action and target, then a new change will be created straight away as part of this scheduled change.

It can take a minute for OpsChain to detect Git updates and create the new change.
:::

As more commits are added to the Git repository, new changes will be created. Scheduled changes poll the project's Git repository for new commits on the Git revision. If multiple commits occur on the relevant Git revision between polls then only one scheduled change will be created with the latest commit.

## Limiting a scheduled change to particular files

A scheduled change that triggers on new commits only creates a change for every new commit, whatever that commit touched. Commit file patterns narrow it to commits that changed the files you care about, so a schedule that deploys can ignore a commit that only edited documentation.

Patterns are set in the **Schedule options** panel of the [run change dialog](/getting-started/familiarisation/gui/activity.md#run-change), as a row per glob with a **Negate** column and a match mode of ALL or ANY. Over the API they are supplied as `commit_file_patterns` when creating or updating a scheduled change:

```bash
curl --fail --user {{username}}:{{password}} http://<host>/api/scheduled_activities -H 'content-type: application/vnd.api+json' \
  -d '{ "data": { "attributes": { "parent_path": "/projects/bank/assets/simple_sn", "action": "deploy", "cron_schedule": "*/5 * * * *", "repeat": true, "new_commits_only": true, "commit_file_patterns": [{ "match": "**/*.md", "negate": true }] } } }'
```

Each pattern is an object carrying a `match` glob and an optional `negate` flag, which defaults to `false`. Patterns describe what changed between two commits, so they require `new_commits_only` - supplying them without it is rejected with `can only be supplied when new_commits_only is enabled`.

A scheduled change accepts up to 20 patterns, each glob up to 500 characters, and 1000 bytes of globs across all of them. OpsChain stores them sorted and de-duplicated, so the response to your request can list them in a different order to the one you sent.

### Pattern syntax

Globs are matched against each path a commit changed, relative to the root of the repository. `*` and `?` match within a single path segment, and `**/` crosses directories. Alternatives in braces and character classes in brackets both work. A file whose name begins with a `.` is matched like any other.

| Glob                | Matches                             | Does not match      |
|:--------------------|:------------------------------------|:--------------------|
| `**/*.rb`           | `actions.rb`, `lib/deploy.rb`       | `README.md`         |
| `docs/*`            | `docs/index.md`                     | `docs/api/v1.md`    |
| `docs/**/*`         | `docs/index.md`, `docs/api/v1.md`   | `README.md`         |
| `**/*.{yml,yaml}`   | `config/app.yml`                    | `config/app.json`   |
| `.opschain/**/*`    | `.opschain/properties/bank.json`    | `actions.rb`        |

:::note
A trailing `**` matches a single path segment rather than everything beneath it - `docs/**` matches `docs/index.md` but not `docs/api/v1.md`. Write `docs/**/*` to cover a directory and everything under it.
:::

### Negating a pattern

A negated pattern is satisfied by a changed path its glob does **not** match. It asks for a file outside the glob rather than excluding a commit that touched the glob, so `{ "match": "docs/**/*", "negate": true }` is satisfied by a commit that changed `lib/deploy.rb` and `docs/index.md` together, because `lib/deploy.rb` sits outside `docs`.

A single negated pattern on its own therefore reads as "run unless the commit touched nothing but the files this glob covers", which is what the example above asks for.

### Requiring every pattern to match

`commit_file_pattern_match` controls how a set of patterns is combined:

- `any` - the default. The change is created as soon as one pattern is satisfied.
- `all` - every pattern must be satisfied. Matches accumulate across polls, so a pattern satisfied by an earlier commit stays satisfied while OpsChain waits for the rest, and a set of patterns can be met by commits that arrive hours apart. The accumulated matches are cleared once the change is created, ready for the next round.

`all` with the patterns `{ "match": "**/*.rb" }` and `{ "match": "config/**/*" }` waits until it has seen a commit that changed a Ruby file and a commit that changed something under `config`. Either one alone leaves the schedule waiting.

### Which commits are examined

Each poll examines the commits between the last one the schedule evaluated and the commit the change would run against. Every path those commits added, modified, deleted or renamed is offered to the patterns, including both the old and the new name of a renamed file.

The first poll has no last-evaluated commit, so it walks back to the commit of the most recent change the schedule created. A schedule that has never created a change has nothing to compare against: it creates its first change, then compares from that commit onwards.

### Seeing why a change ran

A change created this way records the patterns that were satisfied under the `opschain` key of its metadata, alongside whatever metadata the schedule carries:

```json
{
  "opschain": {
    "commit_file_patterns": [{ "match": "**/*.md", "negate": true, "path": "lib/deploy.rb", "sha": "9f2c1d4e8b7a6f5c4d3e2b1a09f8e7d6c5b4a392" }]
  }
}
```

`path` names a file that satisfied the pattern, and `sha` the earliest commit in the range that touched it. Both are absent when the patterns were not evaluated against a range of commits - on the schedule's first change, or when OpsChain could not read the range.

### When the patterns cannot be evaluated

If OpsChain cannot work out what changed, it creates the change rather than skipping it, and raises a `warning:scheduled_changes:commit_file_patterns` event recording why. It does this when more than 1000 commits lie between the two commits, when the repository cannot be read, and when it cannot get exclusive access to the repository within [`git_remote.fetch_lock_timeout`](/key-concepts/settings.md#git_remotefetch_lock_timeout). The event is throttled to one event per hour.

A schedule whose patterns are never satisfied creates no change. If it reaches the end of its schedule that way, it raises the same event type to record that it never ran.

## Setting a schedule

Everywhere OpsChain asks for a repeating schedule — the run change and run workflow dialogs, a scheduled activity you are editing, and a [cleanup job](/getting-started/familiarisation/gui/data_cleanup.md) — the schedule is set the same way. There are three ways to arrive at one, and they all edit the same cron expression, so you can start with one and finish with another.

- **Pick a common schedule.** The dropdown lists the schedules most often wanted, from every minute up to the first day of the month. Choosing one fills in the rest of the editor.
- **Build one.** The builder reads as a sentence — every _N_ minutes or hours, or daily, weekly or monthly at a time you choose. A weekly schedule takes any combination of days.
- **Write the expression.** Choose **Expression** to type a standard five field cron expression directly: minute, hour, day of month, month, day of week.

Whichever you use, the schedule is described in plain English beneath the editor, so you can confirm it means what you intended before saving.

An expression the builder cannot represent — steps on more than one field, a restriction on the month, or the `L` and `#` operators — opens in **Expression** and leaves the builder unavailable rather than being rewritten into something simpler.

An invalid expression is reported in the form, and on the schedule's header and summary so it is visible without opening the editor. It is refused before it is submitted rather than being sent and rejected by the API.

## Creating and deleting a scheduled activity

Scheduled changes and workflow runs are created from the [run dialog](/getting-started/familiarisation/gui/activity.md#run-change): turn on **Schedule change** (or **Schedule workflow**) and set the schedule. For a scheduled change, the **Schedule options** panel holds **Run once**, **New commits only** and the [commit file patterns](#limiting-a-scheduled-change-to-particular-files).

To delete one or more scheduled activities, select the rows you wish to remove using the checkboxes, then choose _delete selected_ from the _bulk actions_ drop down.

## Editing a scheduled activity

Open a scheduled activity from the table and choose **Edit schedule**. The form uses the same panels as the [run change dialog](/getting-started/familiarisation/gui/activity.md#run-change), so everything the schedule carries can be changed in place.

What the schedule runs is a read-only summary — the project, environment, asset, action, Git remote and revision, or the workflow and version for a scheduled workflow run. To run something else, create a new scheduled activity.

Everything else is editable:

| Setting | Scheduled change | Scheduled workflow run |
|---------|:----------------:|:----------------------:|
| [Schedule](#setting-a-schedule) and **Run once** | ✓ | ✓ |
| Property overrides, and the [environment variables](/getting-started/familiarisation/gui/activity.md#setting-environment-variables) within them | ✓ | ✓ |
| Notify and metadata | ✓ | ✓ |
| Settings overrides | ✓ | |
| **Automatically continue wait steps** | ✓ | |
| [Input step arguments](/getting-started/familiarisation/gui/activity.md#answering-input-steps-up-front) | ✓ | |
| **New commits only** and [commit file patterns](#limiting-a-scheduled-change-to-particular-files) | ✓ | |
| [Steps to skip](/getting-started/familiarisation/gui/activity.md#marking-steps-to-skip) | ✓ | |

Steps to skip and input step arguments appear only where the scheduled action resolves to a step tree that has them.

Saving sends every editable value, not only the ones you changed, so an override, a pattern list or a notify target can be emptied as well as amended.
