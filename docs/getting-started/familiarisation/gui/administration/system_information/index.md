---
sidebar_position: 1
description: The administration screen's system information tabs - a summary of the instance, its Kubernetes nodes, its job queues, pods, deployments, background tasks and database.
---

# System information

## Understanding the system information screen

Select **Administration** in the navigation bar to open the administration screen. Its first section, **System information**, shows the state of the OpsChain instance you are connected to, and refreshes every ten seconds while it is open. It is split into tabs:

<p align='center'>
  <img alt='System information summary' src={require('!url-loader!../../images/system-information.png').default} className='image-border'/>
</p>

| Tab                  | Shows                                                                                                                                                       |
|----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Summary**          | The headline figures from the other tabs on one page.                                                                                                       |
| **Nodes**            | Each Kubernetes node in the cluster. See [nodes](#nodes).                                                                                                   |
| **Queues**           | The job queues the OpsChain workers process. See [queues](#queues).                                                                                         |
| **Pods**             | Every pod in the OpsChain namespace, with their logs. See [pods](/getting-started/familiarisation/gui/administration/system_information/pods.md).                                             |
| **Deployments**      | Every Kubernetes deployment making up the instance, which you can restart or scale. See [deployments](/getting-started/familiarisation/gui/administration/system_information/deployments.md). |
| **Background tasks** | Every background task running or queued against a node. See [background tasks](/getting-started/familiarisation/gui/administration/system_information/background_tasks.md).                  |
| **Database**         | The database clusters of every site, and the database the API is using. See [database](/getting-started/familiarisation/gui/administration/system_information/database.md).                   |

Access is controlled by the `/admin` [resource path](/getting-started/familiarisation/gui/manage_security.md#top-level-paths).

:::info
The **Nodes** and **Pods** tabs describe the site whose OpsChain API you are connected to. In a [high availability deployment](/advanced/ha/index.md) each site runs on its own Kubernetes cluster, so connecting to another site's API shows that site's nodes and pods instead. The queues are held in the database the sites share, so the **Queues** tab is the same from every site.
:::

## Nodes

The **Nodes** tab describes the Kubernetes nodes - the servers - that the cluster running OpsChain is made of. For each node it shows its CPU and memory use, its status and versions, the conditions Kubernetes reports on it, and the container images it holds.

<p align='center'>
  <img alt='System information nodes tab' src={require('!url-loader!../../images/system-information-nodes.png').default} className='image-border'/>
</p>

The CPU and memory figures come from the Kubernetes metrics server. If they cannot be fetched, the tab says so and shows the rest. K3s installs the metrics server by default; on another Kubernetes distribution, see [metrics server](/setup/prerequisites.md#metrics-server-optional).

## Queues

OpsChain's workers take their background work from job queues. The **Queues** tab shows how many jobs of each kind are running, pending, scheduled, failed and finished in each queue, so you can see whether work is waiting, failing or not being picked up at all. See [stopping and starting the workers](/operations/maintenance/workers.md) for what the workers are.

<p align='center'>
  <img alt='System information queues tab' src={require('!url-loader!../../images/system-information-queues.png').default} className='image-border'/>
</p>

A **Pending** count that keeps growing while **Running** stays at zero means no workers are taking jobs from the queue - check the `opschain-api-worker` row on the [deployments](/getting-started/familiarisation/gui/administration/system_information/deployments.md) tab.
