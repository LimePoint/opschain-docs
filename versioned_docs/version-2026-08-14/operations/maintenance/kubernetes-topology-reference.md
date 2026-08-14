---
sidebar_position: 6
description: A reference of the Kubernetes objects that make up an OpsChain installation.
---

# Kubernetes topology reference

OpsChain is deployed to Kubernetes as a set of workloads in a single namespace, together with a small number of objects that live outside it. This page lists those objects and explains what each one does, so that you can tell at a glance whether what is running in your cluster is what you expect.

Not every object listed here is present in every installation. Several are optional, and are noted as such along with the `values.yaml` setting that controls them. Others are created only while OpsChain is doing work and disappear again afterwards — see [pods created while OpsChain runs](#pods-created-while-opschain-runs).

To see what your own installation is running:

```bash
kubectl -n ${KUBERNETES_NAMESPACE} get deployment,statefulset,daemonset,cronjob,job
kubectl -n ${KUBERNETES_NAMESPACE} get pods
```

## Deployments

| Name                           | Purpose                                                                                                                    | Present                                                        |
|--------------------------------|----------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------|
| `opschain-api`                 | Serves the OpsChain API, which the GUI and the CLI both use.                                                                | Always                                                            |
| `opschain-api-worker`          | Runs OpsChain's background jobs — starting changes, refreshing actions, requesting image builds, sending notifications. Despite the name, it does not run your steps — those run in separate pods. | Always                                   |
| `opschain-build-service`       | Builds the runner and agent container images. Builds run inside this pod rather than in a pod of their own.                 | Always                                                            |
| `opschain-log-aggregator`      | Collects log output from the pods running your changes and forwards it to the API and any configured outputs.               | Always                                                            |
| `opschain-ingress`             | The cluster's entry point for the API, the GUI and the image registry. Runs the ingress controller and its proxy.           | Always                                                            |
| `opschain-ldap`                | The bundled LDAP directory used to authenticate users.                                                                      | Optional — `ldap.enabled`. Disable it when using your own LDAP directory |
| `opschain-mintmodel-steps-api` | Serves MintModel step tree requests for templated assets.                                                                   | Optional — `mintModelStepsApi.enabled`                            |
| `opschain-reloader`            | Watches the secret vault's TLS certificates and marks the vault for restart when one is renewed.                            | Optional — installed with the secret vault                        |
| `opschain-db-pooler-rw`        | A connection pooler in front of the database primary. See [database connection pooling](/advanced/database-connection-pooling.md). | Feature preview — `db.cnpg.pooler.enabled`                  |
| `opschain-db-recovery`         | An idle pod with the backup volume mounted read only, used to restore a backup. See [database recovery](/operations/maintenance/backups.md#database-recovery). | Optional — `db.backup.recovery.enabled`     |
| `opschain-debug-toolbox`       | An idle pod containing diagnostic tooling. See [debug toolbox](/operations/maintenance/debug-toolbox.md).                    | Optional — `debugToolbox.enabled`                                 |

## Stateful sets

| Name                      | Purpose                                                                                          | Present                                    |
|---------------------------|----------------------------------------------------------------------------------------------------|------------------------------------------------|
| `opschain-image-registry` | The internal container image registry that holds your built runner and agent images.              | Always. Its pod is `opschain-image-registry-0` |
| `opschain-secret-vault`   | The bundled secret vault, which stores your OpsChain secrets. Its data is kept in the database rather than on a volume of its own. | Optional — `openbao.global.enabled`. Disable it when using your own vault |

:::note[Secret vault replicas]
The secret vault runs three replicas — `opschain-secret-vault-0`, `-1` and `-2` — so that a certificate renewal or a restart does not interrupt vault requests. One holds leadership at a time and the other two stand by. They prefer to run on separate nodes but will share a node where they must, so all three run on a single-node cluster.
:::

## The database

The database is managed by the CloudNativePG operator rather than by a stateful set in the OpsChain Helm chart, so it does not appear in a `kubectl get statefulset` listing. It is created from a `Cluster` resource named `opschain-db`, which produces one pod per instance:

```bash
kubectl -n ${KUBERNETES_NAMESPACE} get cluster
kubectl -n ${KUBERNETES_NAMESPACE} get pods -l cnpg.io/cluster=opschain-db
```

| Name                      | Purpose                                                                       |
|---------------------------|---------------------------------------------------------------------------------|
| `opschain-db`             | The `Cluster` resource describing the database.                                |
| `opschain-db-1`, `opschain-db-2`, … | One pod per database instance. A single instance installation has only `opschain-db-1`. |

The operator itself runs outside the OpsChain namespace — see [objects outside the OpsChain namespace](#objects-outside-the-opschain-namespace).

## Cron jobs and jobs

| Name                                    | Kind     | Purpose                                                                                                              | Present                                                |
|-----------------------------------------|----------|------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------|
| `opschain-db-backup`                    | Cron job | Takes a scheduled database backup. See [automated backups](/operations/maintenance/backups.md#automated-backups).      | Optional — `db.backup.periodic.enabled`                     |
| `opschain-registry-reconcile`           | Cron job | Removes image tags from the internal registry that OpsChain no longer needs. See [container image cleanup](/operations/maintenance/container-image-cleanup.md). | Optional — `registryReconcile.enabled`  |
| `opschain-roll-stale-secret-vault-pods` | Cron job | Restarts any secret vault replica still running a superseded TLS certificate. Runs every five minutes.                 | Optional — installed with the secret vault                  |
| `opschain-cnpg-webhook-ready-check`     | Job      | Runs at the start of every install and upgrade, and waits for the CloudNativePG operator to be reachable before OpsChain's database resources are created or updated. | Always |
| `opschain-runner-image-job`             | Job      | Copies the runner image into the internal image registry during an install or upgrade.                                 | Always                                                       |
| `opschain-db-pre-deploy-backup`         | Job      | Takes a backup before an upgrade begins. A failure stops the upgrade.                                                   | Optional — `db.backup.preDeploy.enabled`                    |

:::note[Completed pods you will see]
`opschain-cnpg-webhook-ready-check` leaves its pod in the namespace in a `Completed` state after it finishes, so that its outcome can be inspected if an upgrade fails. The next install or upgrade replaces it. The cron jobs above also leave a small number of completed pods behind, according to their history limits. Completed pods of either kind are expected and do not need to be cleaned up.
:::

## Pods created while OpsChain runs

This is where your changes actually run. The deployments listed above start and monitor this work rather than performing it themselves, so an installation can be busy without any of them looking any different.

OpsChain creates these pods directly while it works. They are not created by a deployment, stateful set or job, so they never appear in a `kubectl get deployment` or `kubectl get job` listing — only in `kubectl get pods`, and only while they are running. A listing taken while an installation is idle therefore shows none of them.

| Name                                        | Created for                                                                                     |
|---------------------------------------------|---------------------------------------------------------------------------------------------------|
| `change-<change id>`                         | Each running [change](/key-concepts/changes.md). This pod orchestrates the change and its steps, and is the only OpsChain pod whose name does not begin with `opschain-`. |
| `opschain-step-<step id>`                    | Running a step's [action](/key-concepts/actions.md) in the [step runner](/key-concepts/step-runner.md). A dry run adds a `-dry` suffix. A step that runs no action of its own does not create one. |
| `opschain-mm-<random>`                       | Each MintModel concretisation.                                                                    |
| `opschain-tva-<template version history id>` | Each refresh of an [asset](/getting-started/familiarisation/gui/projects/assets.md)'s available actions. |
| `opschain-agent-<node id>`                   | Each running [agent](/getting-started/familiarisation/gui/projects/agents.md). Unlike the others, this pod is long lived. |

Building a runner or agent image does not create a pod — image builds run inside the `opschain-build-service` pod.

These pods can be seen in the GUI as well as with `kubectl`, including after they have finished. See [pods](/getting-started/familiarisation/gui/pods.md).

## Services

| Name                                   | Purpose                                                                              | Present                                          |
|----------------------------------------|----------------------------------------------------------------------------------------|------------------------------------------------------|
| `opschain-api`                         | The API.                                                                              | Always                                                |
| `opschain-build-service`               | The image build service.                                                              | Always                                                |
| `opschain-image-registry`              | The internal image registry.                                                           | Always                                                |
| `opschain-log-aggregator`              | The log aggregator.                                                                    | Always                                                |
| `opschain-ingress-proxy`               | The external entry point for all OpsChain traffic.                                     | Always                                                |
| `opschain-ingress-validation-webhook`  | Used by Kubernetes to validate ingress configuration.                                  | Always                                                |
| `opschain-db-rw`                       | The database primary.                                                                  | Always                                                |
| `opschain-ldap`                        | The bundled LDAP directory.                                                            | With `opschain-ldap`                                  |
| `opschain-mintmodel-steps-api`         | The MintModel steps API.                                                               | With `opschain-mintmodel-steps-api`                   |
| `opschain-db-pooler-rw`                | The database connection pooler.                                                        | With `opschain-db-pooler-rw`                          |
| `opschain-secret-vault`                | The secret vault.                                                                      | With the secret vault                                 |
| `opschain-secret-vault-internal`       | Addresses the vault replicas individually.                                             | With the secret vault                                 |
| `opschain-secret-vault-active`         | Addresses whichever vault replica currently holds leadership.  | With the secret vault                                 |
| `opschain-secret-vault-standby`        | Addresses the vault replicas that do not hold leadership.                              | With the secret vault                                 |
| `opschain-db-external`                 | Direct access to the database from outside the cluster.                                | Optional — `db.cnpg.externalService.enabled`          |
| `opschain-secret-vault-external`       | Direct access to the secret vault from outside the cluster.                            | Optional — `secretVault.externalService.enabled`      |

## Storage

Each of these is a persistent volume claim. Deleting one loses the data it holds, so treat them as you would any other persistent data — see [persistent data](/operations/uninstall/persistent-data.md).

| Name                                 | Holds                                                                     | Present                                     |
|--------------------------------------|-----------------------------------------------------------------------------|-------------------------------------------------|
| `opschain-db-1`, `opschain-db-2`, …  | The database's data — one volume per database instance.                    | Always                                           |
| `opschain-project-git-repos-claim`   | The Git repositories OpsChain has cloned for your projects.                 | Always                                           |
| `opschain-step-data-claim`           | Data shared between the pods running a change's steps.                      | Always                                           |
| `opschain-build-service-cache-claim` | The image build cache.                                                      | Always                                           |
| `opschain-log-aggregator-volume`     | Log output buffered before it reaches the API.                              | Always                                           |
| `data-vol-opschain-image-registry-0` | The images in the internal registry.                                        | Always                                           |
| `opschain-ldap-claim`                | The bundled LDAP directory's data.                                          | With `opschain-ldap`                             |
| `opschain-db-backup`                 | Database backups.                                                           | With backups enabled                             |

The secret vault has no volume of its own — it stores its data in the OpsChain database.

## Configuration and secrets

`opschain-config` is the config map holding the settings your installation was deployed with, and nearly every OpsChain workload reads it. The other config maps hold configuration for a single component: `opschain-build-service-config`, `opschain-log-aggregator-additional-output-config`, `opschain-secret-vault-config`, `opschain-ssh-known-hosts` (the Git host keys OpsChain trusts) and `opschain-trust-store` (the certificate authorities you have uploaded).

Secrets are created both by the installation and by the components that manage certificates, so the set present in your namespace varies. The ones that hold data you supplied, and that are preserved across an uninstall, are described in [persistent data](/operations/uninstall/persistent-data.md).

## Objects outside the OpsChain namespace

| Component                    | Namespace      | Installed by                                                                                              |
|------------------------------|----------------|-------------------------------------------------------------------------------------------------------------|
| CloudNativePG operator       | `cnpg-system`  | Applied with `kubectl`, separately from the OpsChain Helm chart. See [install the CNPG operator](/setup/configuration/preparing-your-environment.md#install-the-cnpg-operator). |
| cert-manager                 | `cert-manager` | Installed with Helm, separately from the OpsChain Helm chart, when OpsChain manages its own certificates.    |

Because the CloudNativePG operator is installed separately, a `helm upgrade` does not update it. An OpsChain release that changes the operator says so in its release notes, under **Before upgrading** in the [changelog](/changelog.md).

## Cluster-scoped objects

A small number of objects are not namespaced. These matter mainly when uninstalling, and when deciding how many OpsChain installations a cluster can host.

- `opschain-api-cluster-role` and `opschain-api-cluster-role-binding` — the cluster-wide access the API needs.
- An ingress class and a validating webhook configuration for the ingress.
- Custom resource definitions for the ingress, and for the CloudNativePG operator.

:::warning[One OpsChain installation per cluster]
The cluster role and cluster role binding above are named without reference to the Helm release, so a second OpsChain release in the same cluster fails to install because those names are already taken. Install at most one OpsChain release per cluster.
:::
