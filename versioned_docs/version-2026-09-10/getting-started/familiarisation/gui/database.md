---
sidebar_position: 14
description: ''
---

# Database

The **Database** tab, in the **System information** section of the administration screen, describes the database behind your OpsChain instance: the database clusters of every site in the deployment, and the state of the database the API you are connected to is using.

## Topology

OpsChain can be deployed as a single site or as several sites that share their data — see the [high availability guide](/advanced/ha/index.md) for the topologies this supports. A _site_ is one OpsChain deployment: an API, its workers, and its own _database cluster_. One site's database cluster holds the data and the others hold a copy of it, which is how the sites stay in step.

The **Topology** section, at the top of the tab, shows each site's database cluster as a card. The one holding the data the others copy from comes first, marked **Primary**. A site appears here once something in it has reported in — either its API starting up, or its workers picking up work — so a site added to the deployment shows up on its own within a minute or two, with nothing to register by hand.

A non-primary site whose API has never started — one deployed [in stopped mode](/advanced/ha/operations.md#deploy-opschain-in-stopped-mode), holding only a copy of the data — is still listed, using the name its database cluster is known by, but only its replication state can be shown. Everything the site would have to report about itself reads as `-`.

| Field               | Description                                                                                                                                                                                                                                                         |
|---------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Role**            | Whether this site's database cluster was deployed to hold the data the others copy from (**primary**), or to hold a copy of it (**replica**).                                                                             |
| **Replication**     | How this site's database cluster is keeping up, shown as a labelled state. See [replication states](#replication-states) below.                                                                                                                               |
| **Replication lag** | How far behind this site's database cluster is, in seconds. A write made on the primary takes this long to show up here, so a site that is keeping up is normally behind by a fraction of a second. The primary has nothing to be behind, so it reads as `-`. |
| **Workers active?** | Whether workers at this site are currently picking work up. They report in every minute and are treated as stopped once five minutes pass without one, so this can take up to five minutes to catch up after workers stop.                                        |
| **Last seen**       | When a worker at this site last reported in. This tracks the workers only — not the API, and not the database.                                                                                                                                                    |
| **API started**     | When this site's API last started. Useful for confirming that a site restarted when you expected it to.                                                                                                                                                       |

### Replication states

The **Replication** field describes how each site's database cluster is keeping up. Hover over the value to see the same explanation in the screen.

| State                | Meaning                                                                                                                                                                       |
|----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Primary**          | This site's database cluster holds the data the other sites copy from. There is nothing for it to be behind.                                                                            |
| **Up to date**       | This site's database cluster is up to date. One that is keeping up is normally behind by milliseconds, so a small lag alongside this state is expected.               |
| **Behind**           | This site's database cluster is behind and is still catching up. A brief spell here is normal after a burst of activity; a site that stays here needs investigating.  |
| **Disconnected**     | A replication slot for this site exists but nothing is attached to it, so its database cluster is not being updated. It will start catching up once it reconnects.                                        |
| **Needs rebuilding** | This site's database cluster has fallen too far behind to catch up on its own, because the changes it still needs are no longer available. It has to be rebuilt — see [recovering a replica cluster](/advanced/ha/operations.md#recovering-a-replica-cluster). |

The replication state is only known for clusters that the primary database can see, so it reads as `-` for a site that replicates from another site rather than from the primary.

:::tip[Watching a failover]
OpsChain records an event whenever a site's database cluster changes role, so a failover is visible after the fact rather than only while it is happening. Look for `info:database_cluster:role_changed` in the [audit history](/getting-started/familiarisation/gui/audit_history.md) to see which site took over and when. A site joining the deployment for the first time is recorded as `info:database_cluster:registered`.
:::

### Comparing deployment configuration

Each site records the deployment-managed settings that were applied to it at install or upgrade time — values such as service hostnames and ports, the Kubernetes namespace and the time zone. These are the [settings managed by the deployment](/setup/configuration/additional-settings.md#settings-managed-by-the-deployment); they are owned by each site's `values.yaml` file rather than edited through the GUI, so they can differ from one site to another.

The gear icon on the right of a site's card opens the configuration recorded for it. From there you can:

- **Compare two sites.** When you operate more than one site you can compare their configuration side by side to spot the difference between them.
- **Compare a site against itself over time.** OpsChain keeps a history of each site's recorded configuration, so you can see what changed between deploys and when. This is useful when troubleshooting an issue that began after an upgrade.

:::tip
The name of the site you are currently connected to is shown in the [version info dialog](/getting-started/familiarisation/gui/version_info.md).
:::

## Database settings

The **Database settings** section shows how the API you are connected to reaches its database. In a high availability deployment every site's API connects to the same data, so these values describe the connection rather than anything site-specific.

| Field             | Description                                                        |
|-------------------|--------------------------------------------------------------------|
| **Host**          | The hostname the API connects to.                                  |
| **Port**          | The port the API connects on.                                      |
| **Database name** | The name of the database OpsChain stores its data in.              |

## Database info

The **Database info** section reports the state of that database as it stands now.

| Field             | Description                                                                                                                                                        |
|-------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Connections**   | The maximum number of connections the database is configured to accept, with the number currently **active** and **idle** listed beneath it. A count of active connections approaching the maximum is what to look for when the API starts refusing work. |
| **Database size** | The total size of the OpsChain database on disk.                                                                                                                    |
| **Table**         | The five largest tables and their sizes, so a database growing faster than expected can be traced to what is growing.                                               |
| **Uptime**        | How long the database has been running since it last started. A short uptime you did not expect means the database restarted.                                       |
| **Version**       | The PostgreSQL version the database is running.                                                                                                                     |
