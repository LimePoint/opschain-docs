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

### Buttons & links

| Buttons & links | Function                                                                                                     |
|-----------------|----------------------------------------------------------------------------------------------------------------|
| **Search bar**  | Filter the pods listed in the table.                                                                         |
| **State**       | Show only pods in the selected Kubernetes phases.                                                            |
| **Pod type**    | Show only pods belonging to the selected parts of OpsChain.                                                  |
| **Columns**     | Hide or display columns in the table.                                                                        |
| **Refresh**     | Fetch the pods immediately rather than waiting for the next automatic refresh. The tooltip reports how long ago the pods were last fetched. |
| **Logs**        | Open that pod's log. Requires permission to read pod logs.                                                   |

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
