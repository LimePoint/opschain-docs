---
sidebar_position: 7
description: Stopping new changes, workflow runs and background tasks from starting while OpsChain is otherwise left running.
---

# Maintenance mode

Maintenance mode stops any new change or workflow run from starting, without stopping OpsChain itself or anything already running. It also stops new [background tasks](/getting-started/familiarisation/gui/background_tasks.md) from starting — refreshing an asset's actions, concretising a MintModel, and building or starting/stopping an agent. It is a lighter-weight alternative to [stopping the workers](/operations/maintenance/workers.md) when you need to hold off new work but do not need to free up the CPU or RAM the workers use.

## Enabling and disabling maintenance mode

Maintenance mode is controlled by the [`maintenance_mode`](/key-concepts/settings.md#maintenance_mode) global setting. In the GUI, it has its own **Maintenance mode** section under **Administration > Configuration > System**. **Turn on maintenance mode** asks you to confirm, and whether to hold everyone or let superusers keep running changes. **Turn off maintenance mode** takes effect immediately, and the section can also switch between holding and exempting superusers without turning maintenance mode off first. Changing it needs permission to modify the global configuration. See the [settings API reference](pathname:///api-docs/#tag/Settings) to change it via the API instead. It takes one of three values: `disabled` (the default), `enabled`, or `superuser_override` — see [letting superusers work through maintenance mode](#letting-superusers-work-through-maintenance-mode) below for the last of these.

Turning maintenance mode on (`enabled` or `superuser_override`) or back to `disabled` is recorded on the [audit history page](/getting-started/familiarisation/gui/audit_history.md), as an [`info:maintenance_mode:enabled`/`disabled`](/key-concepts/events.md#properties-and-settings) event, so there is a record of when and by whom it was changed. Switching directly between `enabled` and `superuser_override` while maintenance mode is already on does not raise its own event, since both are equally "on" as far as everything other than a superuser is concerned — check the setting's current value if you need to know which of the two is active.

## Seeing that maintenance mode is on

While maintenance mode is holding your work, the GUI shows a persistent **Maintenance mode is active** banner, the **Run** button's tooltip says that new runs will be created but held, and the run change and run workflow dialogs warn that what you are about to create will be held until maintenance mode is turned off. A superuser exempted under [`superuser_override`](#letting-superusers-work-through-maintenance-mode) is told instead that their own changes and workflow runs will still run.

A script can read the same state from the [`GET /api/info`](pathname:///api-docs/#tag/Info) endpoint's `maintenance_mode` attribute before submitting work.

## What maintenance mode does

While `maintenance_mode` is `enabled` or `superuser_override`, for everyone other than a superuser exempted under `superuser_override` (see [below](#letting-superusers-work-through-maintenance-mode)):

- **No new change or workflow run is admitted.** Creating one still succeeds normally through the API — maintenance mode does not reject the request — but it stays in the `pending` state, the same state it would be in while waiting for a free [runner pod concurrency slot](/key-concepts/settings.md#runner-pod-concurrency-and-limit-settings) or for an older change of the same name to finish. Nothing on the change or workflow run itself distinguishes "waiting because of maintenance mode" from these other ordinary reasons to wait, so a pending change or workflow run during a maintenance window looks the same as one that is simply queued — only the instance-wide [banner](#seeing-that-maintenance-mode-is-on) says why.
- **A change or workflow run already `running` when maintenance mode is turned on is completely unaffected.** It keeps running to completion, exactly as if maintenance mode had never been enabled. Maintenance mode only ever holds back the *next* thing from starting — it never reaches into something already underway.
- **No manual step is needed once maintenance mode is turned off.** A pending change or workflow run automatically retries whether it can start roughly every 30 seconds; once `maintenance_mode` is back to `disabled` the very next retry starts it, with nothing else to trigger.
- **Nothing is built or deployed for a change that is waiting to be admitted.** For a change that runs in a single [change worker pod](/key-concepts/settings.md#pod_per_change_step) (the default), maintenance mode is checked before the runner image is built or the Kubernetes worker pod is deployed, not only before the root step is allowed to start running. A change submitted while maintenance mode is on costs nothing — no image build, no worker pod — until it is admitted.
- **New [background tasks](/getting-started/familiarisation/gui/background_tasks.md) are held the same way** — refreshing an asset's actions, concretising a MintModel, and building an agent's image or starting/stopping it. A task created during a maintenance window shows as `initialising` in the **Background tasks** screen, the same state it would be in while waiting for a free concurrency slot, and starts on its own once maintenance mode is turned off. As with changes, nothing is built (no image build, no MintModel generation) until the task is actually admitted.

Workflow runs and background tasks are gated identically to changes — the same `maintenance_mode` setting blocks them from starting, on the same "wait like any other admission reason" basis described above.

## Checking that nothing is still running

Maintenance mode lets whatever is already running finish, so before an upgrade you need to know when it has. The [`GET /api/admin/drain_status`](pathname:///api-docs/#tag/Admin-operations) endpoint reports `drained`, which is `true` once nothing is in progress, and `active_counts`, the number of changes, workflow runs and background tasks still in progress. Like the other administration endpoints, it needs permission to read `/admin`.

A user with that permission sees the same count in the GUI's maintenance mode banner, which reads **Draining:** followed by what is still in progress, and **Drained - nothing is in progress.** once it is safe to carry on. The banner checks every 15 seconds until it is dismissed.

A change or workflow run counts as in progress while it is queued, running or waiting. One held `pending` by maintenance mode does not count, but one stopped at a [wait step](/key-concepts/actions.md#wait-steps) does, until it is continued or cancelled. A background task counts while it is running, and while it is initialising unless maintenance mode is holding it, so a task that was already under way when maintenance mode was turned on still counts until it finishes. Under `superuser_override`, a task created by a superuser counts too, because it will start on its own. `drained` describes the moment it is read: a superuser can still start new work afterwards, so use `enabled` rather than `superuser_override` if the instance must stay drained for the upgrade.

## Letting superusers work through maintenance mode

Setting `maintenance_mode` to `superuser_override` instead of `enabled` holds everyone else exactly as described above, but lets a superuser keep creating changes, workflow runs and background tasks that start normally — useful when maintenance still needs a superuser able to work while everyone else is held off.

The exemption is based on who **created** the change, workflow run or background task, not who is currently interacting with it. A change created by a superuser starts normally under `superuser_override` even if a non-superuser later reviews or approves it; a change created by a non-superuser stays held even if a superuser later touches it.

Changes and workflow runs that share a name normally start in creation order, oldest first. Under `superuser_override`, a superuser's change or run does not queue behind an older, same-named one that is itself only pending because maintenance mode is holding *its* creator — otherwise it would sit FIFO-blocked behind that held change until maintenance mode is turned off, defeating the exemption. It still queues normally behind an older same-named change or run that is pending for any other reason (for example, a runner pod concurrency limit).

The [`GET /api/info`](pathname:///api-docs/#tag/Info) endpoint's `maintenance_mode_exempts_superusers` attribute reports whether `superuser_override` is the currently active value, distinct from the `maintenance_mode` attribute, which is `true` for `enabled` and `superuser_override` alike.

## Pausing a single change or workflow run instead

If you only need to hold back one specific change or workflow run rather than every new one, [pausing that change](/key-concepts/changes.md#pausing-and-resuming-a-change) (or [workflow run](/key-concepts/workflows.md#pausing-and-resuming-a-workflow-run)) achieves a similar drain — steps already running finish normally, and no new steps start until it is resumed — without needing maintenance mode at all.
