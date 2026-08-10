---
sidebar_position: 13
description: ''
---

# Deployments

## Understanding the deployments screen

The [pods](/getting-started/familiarisation/gui/pods.md) tab answers what is running right now. It cannot answer whether that is what is *meant* to be running — a deployment missing half its pods looks much like one that was only ever asked for half as many.

The **Deployments** tab, in the **System information** section of the administration screen, lists every Kubernetes deployment making up your OpsChain instance, along with what each was asked for and how far Kubernetes has got towards it. A deployment can also be restarted or scaled from here, so recovering a wedged or saturated instance no longer requires `kubectl` access to the cluster. The tab refreshes automatically every ten seconds.

Each row includes:

| Column                   | Description                                                                                                                                         |
|--------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Name**                 | The name of the deployment.                                                                                                                         |
| **Available**            | Whether Kubernetes considers the deployment to have enough available replicas. Hover for the reason it gives.                                       |
| **Ready**                | How many replicas are passing their health probes, against how many were asked for. This matches `kubectl`'s `READY` column.                        |
| **Up-to-date**           | How many replicas are running the current specification. Below the requested count while a rollout is in progress.                                  |
| **Available replicas**   | How many replicas have stayed ready long enough for Kubernetes to count them as available.                                                          |
| **Current replicas**     | How many replicas exist, regardless of whether they are ready.                                                                                      |
| **Observed generation**  | How far the Kubernetes controller has got in observing the deployment's specification, against the current generation. Hidden by default.           |
| **Images**               | The container images the deployment runs.                                                                                                           |
| **Strategy**             | How Kubernetes replaces pods when the deployment changes.                                                                                           |
| **Revision**             | The deployment's current revision number, which increments each time its specification changes.                                                     |
| **Restarted at**         | Timestamp for when the deployment was last restarted, whether from this screen or with `kubectl`. Empty if it has never been restarted.             |
| **Created at**           | Timestamp for when the deployment was created.                                                                                                      |
| **Namespace**            | The Kubernetes namespace the deployment sits in. Hidden by default, as every deployment listed here is in the OpsChain namespace.                   |

### Buttons & links

| Buttons & links  | Function                                                                                                             |
|------------------|--------------------------------------------------------------------------------------------------------------------|
| **Search bar**   | Filter the deployments listed in the table.                                                                          |
| **Columns**      | Hide or display columns in the table.                                                                                |
| **Refresh**      | Fetch the deployments immediately rather than waiting for the next automatic refresh.                                |
| **Checkboxes**   | Select one or more deployments to act on together.                                                                   |
| **Bulk actions** | Act on every selected deployment at once. Enabled once at least one deployment is selected.                          |
| **Restart**      | Perform a rolling restart of the deployment on that row, after confirming. Requires permission to restart deployments. |
| **Scale**        | Change the number of replicas the deployment runs, after confirming. Only shown for a deployment OpsChain will run at more than one replica, and requires permission to scale deployments. |

### Reading the replica counts

The four replica counts are shown separately rather than collapsed into a single ratio, because which of them diverge is what tells you whether a rollout is progressing or stuck.

During a healthy rollout, **Up-to-date** climbs towards the requested count and **Ready** follows it. A rollout where **Up-to-date** has reached the requested count but **Ready** has not is one where the new pods are starting but failing their health probes — the [pods](/getting-started/familiarisation/gui/pods.md) tab will show them restarting. A deployment whose **Observed generation** sits below its generation is one the Kubernetes controller has not yet acted on at all.

## Restarting a deployment

Selecting **Restart** on a row, and confirming, performs a rolling restart of that deployment — the same operation as `kubectl rollout restart`. Each of the deployment's pods is replaced, following the deployment's own rollout strategy rather than all at once, so its surge and unavailability limits are respected.

This is the usual first step when a deployment is running but not serving. Nothing else about the deployment is changed.

The table will not visibly move when the confirmation closes. Kubernetes performs the rollout in the background, and the replica counts update over the following automatic refreshes as it progresses.

:::warning
Restarting the `opschain-api` deployment restarts the pods serving the OpsChain GUI, interrupting your session until they are back. The confirmation says so when you select it.
:::

## Restarting several deployments at once

Tick the checkbox beside each deployment you want to restart, then choose **Bulk actions** → **Restart deployments**. The confirmation lists every deployment it is about to restart along with its current replica count, so you can check the selection before committing to it.

The deployments listed are fixed at the moment the confirmation opens, so a background refresh while you read it cannot change what gets restarted. Each deployment is restarted individually — a deployment that has been deleted since the listing is reported on its own, and does not stop the others from restarting.

## Scaling a deployment

Selecting **Scale** on a row lets you change how many replicas the deployment runs. Use it to add capacity to a saturated instance, or to quiesce a deployment while you work on something else.

Only the deployments OpsChain will run at more than one replica can be scaled, and each has its own ceiling:

| Deployment                     | Maximum replicas | Purpose                                            |
|--------------------------------|------------------|----------------------------------------------------|
| `opschain-api-worker`          | 10               | Runs OpsChain's background jobs.                   |
| `opschain-mintmodel-steps-api` | 5                | Serves MintModel step requests.                    |

Every other OpsChain deployment runs a single instance, so no **Scale** button is offered on its row. Choose the replica count from the dropdown in the confirmation, which runs from zero to that deployment's maximum and reports both the current count and the ceiling.

Three things are worth knowing before you scale:

- **Scaling to zero stops the deployment entirely.** It does no further work until it is scaled back up.
- **Scaling down lets the surplus pods finish first.** They complete the work already in progress before terminating, up to their termination grace period.
- **The count is not written back to your Helm values.** The next `helm upgrade` returns the deployment to its configured replica count, so a change you want to keep must also be made in your `values.yaml`. See [upgrading OpsChain](/operations/upgrading.md).

As with a restart, Kubernetes adds or drains the pods in the background and the replica counts in the table update as it goes.

:::note
Listing the deployments, restarting one and scaling one are each authorised separately, so a user who can read this tab is not necessarily permitted to act on it, and permission to restart a deployment does not confer permission to resize one. Where a user is not permitted, the button is disabled and says so. See [authorisation paths](/getting-started/familiarisation/gui/manage_security.md#top-level-paths).
:::

:::note
The equivalent API endpoints are `GET /api/admin/deployments`, `POST /api/admin/deployments/{name}/restart` and `POST /api/admin/deployments/{name}/scale`. See the [API reference](pathname:///api-docs/#tag/Admin-operations).
:::
