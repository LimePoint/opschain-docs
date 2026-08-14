---
sidebar_position: 12
description: ''
---

# Pods

## Understanding the pods screen

OpsChain runs its work across a number of Kubernetes pods — the API and its workers, the pods that run each change and step, the pods that refresh an asset's actions or concretise its MintModel, the image build service, the database, and the supporting services such as the secret vault and the log aggregator.

The **Pods** tab, in the **System information** section of the administration screen, lists every pod in the OpsChain namespace in one place, so you can see what is running without reaching for `kubectl`. It refreshes automatically every ten seconds while you watch it.

Each row includes:

| Column            | Description                                                                                                                 |
|-------------------|-----------------------------------------------------------------------------------------------------------------------------|
| **Name**          | The name of the pod. This is how the pod is identified everywhere else, including to `kubectl`.                             |
| **State**         | The pod's Kubernetes phase — running, succeeded, failed or pending.                                                         |
| **Image**         | The container image the pod is running.                                                                                     |
| **Host IP**       | The IP address of the cluster node hosting the pod. Hidden by default.                                                      |
| **Pod IP**        | The IP address assigned to the pod itself.                                                                                  |
| **Node**          | The cluster node the pod is running on.                                                                                     |
| **Start time**    | Timestamp for when the pod started.                                                                                         |
| **Restart count** | How many times the pod's container has restarted. A climbing count is a sign the pod is failing and being restarted.        |
| **Namespace**     | The Kubernetes namespace the pod sits in. Hidden by default, as every pod listed here is in the OpsChain namespace.         |
| **Controlled by** | The Kubernetes controller that owns the pod, such as `ReplicaSet/opschain-api`. It is empty for the pods OpsChain creates itself to run changes, steps, agents, MintModel concretisation and actions generation - the pods that can be [deleted](#deleting-a-pod). |

### Buttons & links

| Buttons & links    | Function                                                                                                  |
|--------------------|---------------------------------------------------------------------------------------------------------------|
| **Search bar**     | Filter the pods listed in the table.                                                                      |
| **State**          | Show only pods in the selected Kubernetes phases.                                                         |
| **Pod type**       | Show only pods belonging to the selected parts of OpsChain.                                               |
| **Columns**        | Hide or display columns in the table.                                                                     |
| **Refresh**        | Fetch the pods immediately rather than waiting for the next automatic refresh. The tooltip reports how long ago the pods were last fetched. |
| **Logs**           | Open that pod's log. Requires permission to read pod logs.                                                |
| **Delete**         | Delete that pod. Shown only on the pods OpsChain creates itself, and requires superuser access.            |
| **Bulk actions**   | Delete the selected pods together. See [deleting a pod](#deleting-a-pod).                                  |

## Filtering the pods listed

A busy instance can hold a few dozen pods at once, so the table opens showing only the pods in the **Running** state. Clear or change the **State** filter to include pods that have succeeded, failed or are still pending — a pod that ran a change and finished is worth finding when you are looking into what that change did.

The **Pod type** filter narrows the list to a particular part of OpsChain:

| Pod type                | Pods it covers                                                       |
|-------------------------|------------------------------------------------------------------------|
| **API**                 | The OpsChain API pods.                                               |
| **Build service**       | The image build service.                                             |
| **Change worker**       | The pods running changes and their steps.                            |
| **Database**            | The PostgreSQL database.                                             |
| **Image registry**      | The internal container image registry.                               |
| **LDAP**                | The LDAP service.                                                    |
| **Log aggregator**      | The log collection service.                                          |
| **MintModel generation**| The pods concretising an asset's MintModel.                          |
| **Refresh actions**     | The pods refreshing an asset's available actions.                    |
| **Secret vault**        | The secret vault (OpenBao).                                          |
| **Workers**             | The API worker pods.                                                 |

:::note
A pod whose name matches none of these types — the ingress and webhook pods among them — is only listed while the **Pod type** filter is left unset. If a pod you expect to see is missing, clear the filter. The [Kubernetes topology reference](/operations/maintenance/kubernetes-topology-reference.md) describes every pod an installation can contain.
:::

Both filters apply as soon as you change them, and both accept more than one value at a time. They also apply on top of each other, so selecting the **Failed** state and the **Change worker** type lists only the change pods that failed.

The **Namespace** and **Host IP** columns start hidden, since every pod listed sits in the OpsChain namespace and a pod's host IP is simply the IP of the node already named in the **Node** column. Both remain one click away in the **Columns** menu, and once you change the column selection your choice is remembered.

## Viewing a pod's log

Selecting **Logs** on a row opens that pod's log in the standard OpsChain log viewer, with the same search, wrapping and download controls used when viewing a change's log.

The log continues to update while the pod is pending or running, and stops once the pod leaves those phases — a change pod's log stops updating when the change finishes, rather than polling a pod that will never write again. Pod logs are polled every ten seconds, more slowly than a change's log, because reading the API's own log through the API adds to the very log being read.

If the pod is running more than one container, a **Container** selector appears above the log. OpsChain shows the first container's log until you choose another.

A pod can disappear while you are reading its log — a change pod that completes and is cleaned up, for example. When that happens the lines already fetched stay on screen and remain downloadable, rather than being replaced by an error.

:::note
Reading a pod's log is authorised separately from listing the pods, so a user who can see this tab is not necessarily permitted to open a log. Where they are not, the **Logs** button is disabled and says so. See [authorisation paths](/getting-started/familiarisation/gui/manage_security.md#top-level-paths).
:::

:::note
The equivalent API endpoints are `GET /api/admin/pods` and `GET /api/admin/pods/{name}/logs`. A pod's whole log can also be downloaded as a text file by adding `?download=<filename>` to the logs endpoint, which is the better option for a log too large to page through in a browser. See the [API reference](pathname:///api-docs/#tag/Admin-operations).
:::

## Deleting a pod

A pod can get stuck - waiting on an image that will not pull, or hanging after the work it was doing has finished. Selecting **Delete** on a row removes that pod immediately, without waiting for it to shut down gracefully, so you can clear it without shell access to the cluster.

Only the pods OpsChain creates to do its own work can be deleted - the pods running changes, steps and agents, and those concretising a MintModel or generating an asset's actions. Every other pod in the namespace belongs to a Kubernetes deployment or stateful set, listed in the **Controlled by** column, and the **Delete** button is not offered on those rows at all. Deleting them would achieve nothing in any case, as Kubernetes replaces a pod it manages as soon as it is removed.

:::warning
Deleting a pod OpsChain is still waiting on fails the step or task that pod was running. Use it to clear a pod that is already stuck, not to stop work in progress - cancel the change, workflow run or background task instead.
:::

To clear several pods at once - a wedged change leaves a pod per step - tick the rows and choose **Bulk actions** → **Delete selected pods**. The confirmation says how many of the selected pods it is about to delete, and how many it is leaving alone because they cannot be deleted, so a selection that sweeps up a deployment's pods does not fail as a whole. Each pod is deleted independently and any that fail are reported individually, so one pod that has already gone does not strand the rest.

:::note
Deleting a pod requires superuser access. It cannot be granted through an authorisation rule, so a user who can otherwise administer OpsChain sees the **Delete** button disabled, with the reason, rather than discovering the restriction after confirming.

The equivalent API endpoint is `DELETE /api/admin/pods/{name}`. It answers `202 Accepted`, as Kubernetes removes the pod asynchronously, and rejects a pod that is not one of OpsChain's own rather than deleting it. See the [API reference](pathname:///api-docs/#tag/Admin-operations).
:::
