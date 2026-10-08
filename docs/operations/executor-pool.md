---
sidebar_position: 8
description: Reusing pods across action-generation requests and changes, and keeping each unit of work's files separate on a shared pod.
---

# Executor pool

By default, OpsChain starts a fresh pod for every unit of work: each action-generation request (deriving an asset's actions for a template version) and each change. Much of that time goes on starting the pod and pulling its image rather than doing the work. The executor pool keeps pods running so later work can use them, sharing them in one of two ways:

- **Action-generation requests take turns.** A pooled pod services one request at a time. When a request finishes, the pod stays running for the next request that can use it.
- **Changes run side by side.** Every running change that can use a pooled pod runs in it at the same time, and the pod stays running for later changes once they finish.

Action-generation requests and changes never share a pod with each other.

The executor pool is off by default, and while it is off, action generation and changes behave exactly as they always have. Turning it on also turns on [filesystem isolation](#filesystem-isolation), which relaxes the security context of the pods it applies to, so read that section before you enable it.

## Turning it on

Set [`executor_pool.enabled`](/key-concepts/settings.md#executor_poolenabled) to `true`. Like most settings, it can be set globally or for a single project, environment or asset, so you can try the pool on one asset, [confirm it is being used](#checking-the-pool-is-being-used), and then widen it.

Every action-generation request uses the pool once it is enabled. A change uses it only when all of these are true:

- [`pod_per_change_step`](/key-concepts/settings.md#pod_per_change_step) is `false`, so the whole change runs in one pod
- [`image_reuse.enabled`](/key-concepts/settings.md#image_reuseenabled) is `true`, so the image a pod was started from can be matched reliably
- [`runner.reuse_actions_rb`](/key-concepts/settings.md#runnerreuse_actions_rb) is `true`

A change chooses its pod when its first step runs, and keeps that pod until it finishes, even if any of the settings on this page change partway through.

## Which work shares a pod

There is at most one pooled pod for each combination of the conditions below. Work joins the pod that matches it, or starts one if none is running. Work only shares a pod if it has the same:

- runner image
- runner secrets and secret masking
- project git remotes mounted
- Kubernetes cluster
- [filesystem isolation scope](#filesystem-isolation)
- [sharing scope](#choosing-how-widely-a-pod-is-shared)
- creator, if [`executor_pool.separate_creators`](#keeping-users-apart) is `true`

Changes must also have the same:

- `change_worker` and `default` [pod template](/key-concepts/settings.md#pod-template-settings) resources and volumes
- [`repo_folder`](/key-concepts/settings.md#repo_folder), [`parallel_change_worker_steps`](/key-concepts/settings.md#parallel_change_worker_steps), `runner.image_pull_policy`, [`runner.action_server_idle_timeout`](/key-concepts/settings.md#runneraction_server_idle_timeout), [`on_failure.dump_properties`](/key-concepts/settings.md#on_failuredump_properties) and [`controller.mask_properties`](/key-concepts/settings.md#controllermask_properties) settings
- MintPress Chef server URL and client key secret
- `opschain.files` contents, if the filesystem isolation scope is `never`

### Choosing how widely a pod is shared

[`executor_pool.sharing_scope`](/key-concepts/settings.md#executor_poolsharing_scope) decides how far apart two units of work can be and still share a pod:

- `asset` (the default) shares a pod only between work for the same asset.
- `environment` and `project` share a pod between work anywhere in that environment or project. Fewer pods are started, but each is shared more widely. Work for one asset can see files that work for another asset leaves in the [locations isolation shares](#what-isolation-keeps-shared), and more changes run in one pod at once (see [sizing pooled change pods](#sizing-pooled-change-pods)).
- `never` stops the pool sharing pods at all, even while `executor_pool.enabled` is `true`.

## Filesystem isolation

Filesystem isolation stops units of work sharing a pod from accidentally interfering with each other's files. It guards against mistakes in trusted `actions.rb`, not against hostile code (see [keeping users apart](#keeping-users-apart)). It gives each unit of work its own view of the pod's filesystem, so its writes are not seen by the requests that run after it in the same pod, or by the other changes running in it. [`executor_pool.filesystem_isolation_scope`](/key-concepts/settings.md#executor_poolfilesystem_isolation_scope) controls it:

- `change` (the default): each change, or action-generation request, gets its own view. A change's own steps share that view.
- `request`: every individual step gets a fresh view. A file written by one step, including a stage's or combo action's child steps, is not visible to later steps of the same change. A change's top-level `actions.rb` code runs before each step's view is created, so it is isolated per change rather than per step.
- `never`: no filesystem isolation at all. Every unit of work in a pod can read and overwrite the files that other work in it writes or has left behind, including work that other users started. OpsChain shares a pod between changes under `never` only when their `opschain.files` are the same.

:::warning[`never` shares one filesystem between users]
With `never`, changes and action-generation requests started by different users can share a pod, and nothing separates their files. Choose it only if your team trusts every `actions.rb` it runs to behave, for example because each one is reviewed before it is used. To keep each user's work in pods of its own, set [`executor_pool.separate_creators`](#keeping-users-apart) to `true`.
:::

While `executor_pool.enabled` is `true`, isolation applies to pooled action-generation pods and to every change pod in the same projects, environments and assets, whether or not that change shares its pod. A change therefore sees the same filesystem behaviour whichever pod it lands in.

To pass a file from one step to a later one, store it as an [artefact](/key-concepts/artefacts.md) and load it in the later step, whatever the scope. Don't rely on a change's steps sharing a filesystem, even under `change`: if the change's pod is replaced partway through, for example during an upgrade or while OpsChain is in maintenance mode, anything written to the old pod's filesystem is gone. A shared filesystem is fine for something you can afford to lose and rebuild, such as a cache.

### What isolation discards

Writes to the container's own filesystem, including `/tmp` and `/var/tmp`, are private to the unit of work and are discarded when it ends. Until then they are held on the node's disk in an `emptyDir` volume that OpsChain adds to the pod, so large files there, such as installers or patch archives, count towards the pod's ephemeral storage rather than its memory.

### What isolation keeps shared

Some locations are deliberately shared by everything in the pod, because OpsChain and your actions rely on them:

- `/opt/opschain`, the home directory, is shared. Don't rely on isolation to clear files your actions write there.
- The trusted certificate store (`/etc/pki/ca-trust/extracted`) is shared.
- Read-write volumes configured in [pod templates](/key-concepts/settings.md#pod-template-settings) behave exactly as they do without isolation: writes reach the volume, and every unit of work in the pod sees them.

In a pooled change pod, each change's own data is also kept apart from the other changes', even in those locations:

- The files written from its [`opschain.files`](/key-concepts/properties.md#file-properties) properties, such as SSH keys, are written into the change's own view, whether they are written directly in the home directory or in a subdirectory such as `~/.ssh`. Under `request` scope, each step, MintModel steps included, gets its own fresh copy of them. The exception is a file written into a read-write pod template volume, which is shared like any other write to that volume. If OpsChain can't work out where a change's files will be written, the step fails rather than writing them somewhere other changes could see them.
- Its step data is kept in its own view.

:::warning[Shared locations in a pooled change pod]
In a pooled change pod, `opschain.files` cannot write into the trusted certificate store, because every change in the pod shares it. A step whose properties declare a file there fails with an error such as:

```text
opschain.files can't write /etc/pki/ca-trust/extracted/pem/my-ca.pem into /etc/pki/ca-trust/extracted in a pooled executor pod, because that trust store is shared with other changes; add the certificate through OpsChain's trusted certificates instead, or turn off executor_pool for this asset
```

Add the certificate authority to OpsChain's [trust store](/setup/configuration/tls/index.md#trusting-additional-certificate-authorities) instead, or turn the executor pool off for that asset.

Writes into a read-write pod template volume are shared by every change in the pod, so changes that write different content to the same path in a volume overwrite each other.
:::

:::note[Isolation assumes trusted actions]
Filesystem isolation, under `change` or `request`, keeps changes in a pooled pod from interfering with each other by accident. It is not a security boundary between them: every change in the pod runs as the same user, so code written deliberately to reach another change's data could do so. It assumes your `actions.rb` is trusted, reviewed code, and changes only share a pod when everything listed under [which work shares a pod](#which-work-shares-a-pod) matches. To keep different users' work apart, see [keeping users apart](#keeping-users-apart). If you need a hard boundary between every change, set [`executor_pool.sharing_scope`](/key-concepts/settings.md#executor_poolsharing_scope) to `never` for them, or leave the executor pool off.
:::

### Keeping users apart

Under every filesystem isolation scope, a pooled pod can be shared by work that different users started. Under `change` and `request`, filesystem isolation keeps each unit of work's files separate, but work sharing a pod still runs as the same operating system user, so code in one user's `actions.rb` could reach another user's work in progress, including the credentials OpsChain issues to it. Under `never`, there is no filesystem isolation at all, so one user's work can read and overwrite files another user's work leaves in the pod. That is acceptable when `actions.rb` is reviewed, which is why pods are shared this way by default.

If different users' work must not share a pod, set [`executor_pool.separate_creators`](/key-concepts/settings.md#executor_poolseparate_creators) to `true`. Pods are then never shared between changes or action-generation requests started by different users, whatever the filesystem isolation scope, while each user's own work still reuses pods. Expect more pooled pods, since each user then has their own. Alternatively, set [`executor_pool.sharing_scope`](#choosing-how-widely-a-pod-is-shared) to `never`, or leave the executor pool off, for the projects, environments or assets concerned. A narrower sharing scope such as `asset` reduces how much work shares a pod, but different users' work for the same asset can still share one.

### Pod security context

To give each unit of work its own view, isolation needs a private user and mount namespace inside the pod. The pods it applies to therefore run with:

- `allowPrivilegeEscalation: true` on the container
- `Unconfined` seccomp and AppArmor profiles on the pod

This is the same relaxation that OpsChain's build service already runs with in its default rootless mode, for the same reason. Isolation drops the capabilities it used to set up the private view before any of your action code runs. On nodes that can't support isolation (for example, kernels older than Linux 5.12), OpsChain logs a warning in the pod log and runs without it.

### Limitations

- **Single-file read-write mounts become read-only.** A single file mounted read-write through pod templates, such as a hostPath file or a volume mounted with `subPath` to a file, is read-only to actions while isolation is active. Mount the containing directory instead.
- **Files owned by other users appear as owned by uid 65534.** Tools that check file ownership can therefore refuse them. For example, SSH rejects a `~/.ssh/config` mounted from a Kubernetes Secret or ConfigMap. Provide SSH configuration through `opschain.files` instead. Avoid Ruby file operations that preserve ownership, such as `FileUtils.cp(preserve: true)`, or `File.atomic_write` over a file your action doesn't own.

## How long pooled pods stay running

A pooled pod is idle when no action-generation request is running in it and no unfinished change is assigned to it. A change waiting at an approval step, a wait step or an input step is unfinished, so its pod is never idle while it waits, however long that is. OpsChain tears an idle pod down when the first of these applies:

- It has been idle for longer than [`executor_pool.idle_timeout`](/key-concepts/settings.md#executor_poolidle_timeout) (30 minutes by default).
- Its cluster has more idle pooled pods than [`executor_pool.max_idle_slots`](/key-concepts/settings.md#executor_poolmax_idle_slots) (10 by default). The least recently used pods beyond that limit are torn down straight away.

Set [`executor_pool.keep_alive`](/key-concepts/settings.md#executor_poolkeep_alive) to `true` for a project, environment or asset whose action generation or changes must always start fast, to keep its idle pods running indefinitely. Those pods keep their memory and CPU reservations the whole time.

Separately, each change in a pooled pod has its own action server. One that has run no step for [`runner.action_server_idle_timeout`](/key-concepts/settings.md#runneraction_server_idle_timeout) (10 minutes by default), such as a change waiting for approval, is stopped and started again when that change's next step runs. The pod itself keeps running.

## Running changes in a pooled pod

Sharing a pod changes how one change affects the others in it:

- **Each change runs its own steps.** A change runs up to its own [`parallel_change_worker_steps`](/key-concepts/settings.md#parallel_change_worker_steps) steps at a time, alongside every other change in the pod.
- **Cancelling a change stops only that change.** OpsChain stops the cancelled change's running steps inside the pod. Other changes in the pod carry on.
- **A pod failure fails every change in it.** If a pooled pod is lost, for example because it runs out of memory, is evicted or its node goes down, every unfinished change running in it fails, not only the one that caused the problem. Each change's log records the failure. The pod's own log is not copied into any change's log, since it holds every change's output.
- **[`remove_change_worker_pod`](/key-concepts/settings.md#remove_change_worker_pod) does not apply.** A pooled pod is never removed when a change finishes, and setting it to `false` does not keep a pooled pod running beyond the [usual teardown rules](#how-long-pooled-pods-stay-running). To debug a change in a pod of its own, turn the pool off for that asset first.
- **Each change still counts towards [`concurrent.runner_limit`](/key-concepts/settings.md#concurrentrunner_limit).** The limit counts running changes, not pods, so sharing pods does not change it.

### Sizing pooled change pods

A pooled change pod gets its resources from the `change_worker` [pod template](/key-concepts/settings.md#pod_templatespod-typeresources), as an unpooled one does, but it runs every matching change at once. There is no separate limit on how many changes a pod runs: all running changes that [share a pod](#which-work-shares-a-pod) run in the same one, up to `concurrent.runner_limit` in total. Size the pod for the most changes you expect to run together within one [sharing scope](#choosing-how-widely-a-pod-is-shared), multiplied by `parallel_change_worker_steps`, multiplied by the memory each step needs.

With the default `asset` scope, only changes to the same asset share a pod, which keeps both the pod's size and the number of changes one pod failure can affect small. A wider scope starts fewer pods, but each pod needs more resources and a failure affects more changes.

## Checking the pool is being used

Each time a request or change reuses a running pod, OpsChain records an `info:executor_pool:pod_reused` [event](/key-concepts/events.md) naming the pod, against the request's background task or against the change. If none appear, check the [conditions for using the pool](#turning-it-on) and for [sharing a pod](#which-work-shares-a-pod).

Pooled pods are named `executor-…` and carry the label `executor-pool=true`, so `kubectl -n opschain get pods -l executor-pool=true` lists them. A change running in a pooled pod has no `change-…` pod of its own, and a pooled action-generation request has no `opschain-tva-…` pod.

If OpsChain cannot read the runner secrets while deciding whether a pod can be shared, it records a `warn:executor_pool:runner_secrets_unavailable` event and gives that request or change a pod of its own rather than risk sharing one.
