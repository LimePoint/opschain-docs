---
sidebar_position: 6
description: How to size the memory and CPU reserved for OpsChain's own components, and what to change on a constrained node.
---

# Sizing OpsChain's components

This guide covers the memory and CPU that OpsChain reserves for its own always-on components — the API, the API worker, the log aggregator, LDAP, the build service, the database and the MintModel steps API.

After following this guide you should know:

- why these components reserve resources at all
- how to change the reservations for your server
- what to expect on a node that is already close to full

## Why the components reserve resources

A container with no memory request runs in Kubernetes' `BestEffort` quality-of-service class. The kernel gives such containers the highest out-of-memory score and the kubelet evicts them first, so on a node under memory pressure they are the first things killed — regardless of how important they are. [Learn more](https://kubernetes.io/docs/concepts/workloads/pods/pod-qos/) about quality-of-service classes.

## Changing the values

Every component's reservation is a `resources` block in `values.yaml`, in the same shape Kubernetes uses:

```yaml
api:
  resources:
    requests:
      cpu: 200m
      memory: 2Gi
    limits:
      memory: 6Gi
```

The blocks are `api`, `apiWorker`, `ldap`, `logAggregator`, `buildService`, `mintModelStepsApi`, and `db.cnpg` for the database. Redeploy to apply a change.

A container that exceeds its limit is killed by the kernel, and where several processes share the container — as they do in the API and the database — the one killed is the largest, not necessarily the one that grew.

### Sizing the API

Puma serves requests in worker processes, and [`api_autoscaler.max_workers`](/key-concepts/settings.md#api_autoscalermax_workers) decides how many it may run. By default, each worker runs 5 threads, so at the default of 14 workers the pod can hold 70 requests at once. With all 14 busy it uses around 3.8Gi, well inside the shipped 6Gi limit, which leaves room for larger requests.

The autoscaler stops adding workers once the pod reaches 70% of its limit, and the [memory protection](/key-concepts/settings.md#api-worker-memory-protection) stops a runaway worker at 80%. Size the limit so that a full pool stays under 70%, allowing roughly:

```text
max_workers x (150Mi + threads x 23Mi) + 200Mi
```

With the defaults that is 14 x (150Mi + 5 x 23Mi) + 200Mi, about 3.8Gi. Lowering `max_workers` lowers the memory the pod can reach, and needs no redeploy. The thread count is set by the `RAILS_MAX_THREADS` environment variable in `api.env`.

### Sizing the database

The database is sized differently from the rest, because PostgreSQL uses the operating system's page cache as its own cache. Its apparent memory use is mostly that cache and is not a requirement.

CloudNativePG recommends sizing container memory consistently with `shared_buffers`, which should be roughly a quarter of the pod's memory. That covers the cache, not the peaks. Three parameters decide how much anonymous memory PostgreSQL may claim on top of it:

| Parameter | Default |
| --- | ---: |
| `shared_buffers` | 256MB |
| `maintenance_work_mem` × `autovacuum_max_workers` | 256MB × 5 |
| `work_mem` × `max_connections` | 4MB × 350 |

The database sets no memory or CPU limit by default. This is to help ensure the database is not killed by the kernel when it's under memory pressure. Instead, the database is given the `system-node-critical` priority class, which makes it the last thing on the node the kernel will stop. The memory request still reserves its place when pods are scheduled, and [reserving resources for the node](/setup/installing_k3s.md#reserving-resources-for-the-node) still protects the server itself.

To bound it instead, add `limits.memory` to the `db.cnpg.resources` block and size it from the table above.

### Sizing the MintModel steps API

The MintModel steps API is deployed only when `mintModelStepsApi.enabled` is `true`. It runs a Java transformer that takes its heap as half the container's memory limit, so the heap follows `limits.memory`:

```yaml
mintModelStepsApi:
  resources:
    requests:
      memory: 256Mi
    limits:
      memory: 1Gi
```

The default 1Gi limit gives the transformer a 512Mi heap. If generating the step tree for a large MintModel fails with an out of memory error, raise the limit and the heap rises with it.

Leave `limits.memory` set. Without a limit the transformer sizes its heap against the node's total memory rather than the pod's share of it. There is no separate setting for the heap — it is always derived from the limit, so the two cannot drift apart.

## What a runner step is allowed to take

Runner pods — the change and step pods that execute your actions, plus actions refresh and MintModel concretisation — are limited through the `pod_templates` settings rather than `values.yaml`, because they are created at run time rather than deployed:

| Pod template | Request | Limit |
| :--- | :---: | :---: |
| `change_worker` | 256Mi, 100m CPU | 4Gi |
| `step_runner` | 256Mi, 100m CPU | 4Gi |
| `generate_actions` | 256Mi, 100m CPU | 4Gi |
| `agent` | 256Mi, 100m CPU | 4Gi |
| `mintmodel_api` | 256Mi | 2Gi |

OpsChain's own machinery inside a runner pod holds about 170Mi of that, so the rest is headroom for what your action does. To configure a change to use more than that, use the [`pod_templates.<pod type>.resources`](/key-concepts/settings.md#pod_templatespod-typeresources) setting, which resolves through the usual override chain, so you can raise the limit for one project, environment, asset or single change without changing it for everything.

A change that exceeds its limit is stopped by the kernel and reported as `OOMKilled` in the change log. A change whose *request* cannot be met is not started at all — see [On a node that is already full](#on-a-node-that-is-already-full).

### The ceiling those overrides cannot pass

Because the override chain reaches down to a single change, anyone who can create a change could otherwise ask for a pod larger than the server can run. The global setting `resource_limits.max_pod_memory` is the bound on that, and it defaults to `8Gi`:

```json
{ "resource_limits": { "max_pod_memory": "8Gi" } }
```

Both `requests.memory` and `limits.memory` are checked against it wherever they are set — global, project, environment, asset or change — and a write that exceeds it is rejected, naming the maximum value allowed. Unlike `pod_templates`, it cannot be set on a project, environment, asset or change. Raise it deliberately, in the global settings, once you are satisfied the servers can carry it.

:::note

- Raising the maximum does not raise any limit by itself. It only widens what an override is allowed to ask for; the defaults in the table above are unchanged until you change them.
- Lowering it does not retire values already stored. A setting that exceeds a newly lowered maximum keeps working until someone edits that pod template again, at which point the write is rejected. Lowering the ceiling is therefore a rule for future writes, not a sweep of existing ones.

:::

### Where limits are advisory

Everything above assumes the host runs cgroups v2, which is what lets the kernel hold a container to its memory limit. On a cgroups v1 host the limits are still recorded and the requests still drive scheduling, but nothing stops a container that exceeds its limit — so a single step can still exhaust the server.

There is no setting that changes this. It is decided by how the operating system boots, before OpsChain is installed. If you are not sure which your servers use, check with `stat -fc %T /sys/fs/cgroup/` — `cgroup2fs` means v2 — and see the [K3s installation guide](../setup/installing_k3s.md#download--install-k3s).

## Scheduling priority

When a node cannot fit everything, Kubernetes decides what to schedule first and what to evict by pod priority. OpsChain installs three priority classes and places everything it runs in one of them. [Learn more](https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/) about pod priority and preemption.

| Class | Priority | Preempts | Applied to |
| :--- | ---: | :---: | :--- |
| `system-node-critical` | built in | yes | The database |
| `opschain-system` | 1000000 | yes | Every OpsChain component |
| `opschain-backup` | 2000 | no | The database backup jobs and the recovery pod |
| `opschain-runner` | 1000 | no | Every runner pod: change workers, step runners, action refreshes, MintModel concretisation and agents |

### What this means on a busy node

- **Runner pods are shed first.** Under memory pressure the kubelet evicts runner pods before any OpsChain component.
- **Runner pods never evict anything.** `opschain-runner` does not preempt, so a runner pod that does not fit waits for room rather than stopping another pod. It stays `Pending`, and if no room frees up within two minutes the step fails with `could not be scheduled within <n> seconds` and can be retried. To make work queue instead, size the [concurrency limits](/key-concepts/settings.md#runner-pod-concurrency-and-limit-settings) to what the node can hold.
- **Backups get room before waiting runners.** A backup is scheduled ahead of any runner pod that is waiting, and outlasts runner pods under pressure. It never preempts, so a backup waits for a running change to finish rather than aborting it.
- **OpsChain components can preempt runner pods.** A component or OpsChain job that cannot be scheduled on a full node may evict a runner pod to take its place, which fails that change/its step.

The runner class's name and value can be changed with `priorityClasses.runner.name` and `priorityClasses.runner.value` in your `values.yaml`.

### Installing without priority classes

Priority classes are cluster-scoped objects. If the account installing OpsChain may not create them, turn them off. The bundled ingress, secret vault, image registry and configuration reloader take the class from their own settings, so clear those as well in your `values.yaml`:

```yaml
priorityClasses:
  enabled: false
kong:
  priorityClassName: ""
trow:
  priorityClassName: ""
openbao:
  server:
    priorityClassName: ""
reloader:
  reloader:
    deployment:
      priorityClassName: ""
```

Until all four are cleared, the deploy is refused, naming the settings still set. With priority classes turned off every pod runs at the cluster's default priority, and runner pods get no class.

:::warning[A priority class cannot be changed in place]
Kubernetes rejects an update to an existing `PriorityClass`'s value or preemption policy. Changing `priorityClasses.runner.value` therefore fails the next deploy with `value: Forbidden: may not be changed in an update`, and upgrading an installation whose `opschain-runner` class predates its preemption policy fails with `preemptionPolicy: Invalid value: "Never": field is immutable`. Delete the class immediately before the deploy:

```bash
kubectl delete priorityclass opschain-runner
```

Deleting it does not disturb running pods — they keep the priority they were admitted with. A runner pod created between the delete and the deploy is refused, so run the two back to back.
:::

## On a node that is already full

Reserving resources means the scheduler must find room for them. On a node that is already close to full, a component that previously always started can now stay `Pending` instead, because the scheduler will not place a pod it cannot honour the request for.

This is the reservation working as intended rather than a fault, but it does mean a first deploy after upgrading needs a little care on a constrained server. If a component stays `Pending`, ask the scheduler why:

```bash
kubectl describe pod -n ${KUBERNETES_NAMESPACE} <pod> | grep -A5 Events
```

A message of the form `0/1 nodes are available: 1 Insufficient memory` means the node genuinely cannot fit the reservation. Either free capacity, or lower that component's request to match what you measured above.

## Reserving memory for the server

Everything above governs pods. None of it holds anything back for the server the pods run on, and by default Kubernetes reserves nothing — the scheduler may fill the machine and leave the kernel to choose what dies. The [K3s installation guide](/setup/installing_k3s.md#reserving-resources-for-the-node) has the settings; this section explains the figures it recommends.

Reserving is also what keeps the priorities above meaningful. The kubelet evicts by quality of service and priority; the kernel's out-of-memory killer ranks only by its own score and can take `sshd` or the container runtime. Keeping memory back keeps the kubelet in charge of the decision.

| Reservation | Default | What it has to cover |
| --- | ---: | --- |
| `system-reserved` | 2Gi | The kernel, which is charged to no pod, plus the OS daemons. On a server running OpsChain the kernel's own unreclaimable memory is a little over 1 GiB by itself. |
| `kube-reserved` | 1500Mi | K3s and the kubelet, around 500 MiB, plus roughly 24 MiB for each pod on the node. The container runtime keeps one process per pod, and those live outside the memory the pods themselves are limited to. |
| `eviction-hard` | 1Gi | The margin the kubelet keeps free so it can evict in order rather than let the kernel act. |

Only `kube-reserved` changes with how you configure OpsChain, because only it scales with pod count. Raising a [pool limit](/key-concepts/settings.md#runner-pod-concurrency-and-limit-settings) adds pods, so add 25 MiB to `kube-reserved` for each one.

### Measuring it on your own server

Memory a process appears to use is mostly page cache, which the kernel hands back on demand. Size a reservation from what cannot be reclaimed:

```bash
# kernel memory charged to no pod
grep -E '^SUnreclaim:|^KernelStack:|^PageTables:' /proc/meminfo

# what K3s and the OS daemons hold, page cache excluded
grep '^anon ' /sys/fs/cgroup/system.slice/memory.stat
```

`kubectl top` and a cgroup's `memory.current` both include page cache and will suggest a figure many times larger than the one you need.
