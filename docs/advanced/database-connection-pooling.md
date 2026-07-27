---
sidebar_position: 5
description: A guide to enabling a CNPG session-mode connection pooler in front of the OpsChain database.
---

# Database connection pooling

This guide covers OpsChain's optional CNPG session-mode connection pooler: what it does, when to enable it, how to verify it, and how to roll it back.

## Background

OpsChain's database runs as a [CloudNative PostgreSQL (CNPG)](https://cloudnative-pg.io/) cluster. By default, the API and worker pods connect directly to the cluster's primary service (`<db.cnpg.clusterName>-rw`) — every new database connection pays the cost of a TCP/TLS handshake and password authentication.

Under high connection churn — many worker threads opening and closing connections frequently, for example a large `apiWorker.replicas` multiplied by [`OPSCHAIN_THREADS_PER_WORKER`](/setup/configuration/additional-settings.md#opschain_threads_per_worker), or an elevated [`OPSCHAIN_PARALLEL_CHANGE_WORKER_STEPS`](/setup/configuration/additional-settings.md#opschain_parallel_change_worker_steps) — that per-connection cost adds up. A connection pooler keeps a smaller set of warm connections to Postgres open and hands them out to clients as needed, avoiding repeated handshake/authentication overhead.

:::info[This does not raise the connection ceiling]
The pooler reduces per-connection setup cost; it does not let more concurrent connections reach Postgres than `max_connections` already allows. If you are hitting `max_connections` itself, see the [PostgreSQL parameters](/advanced/ha/index.md#other-settings) setting instead.
:::

### Why session mode

CNPG's `Pooler` resource (backed by PgBouncer) can run in `session` or `transaction` mode. OpsChain only supports **session mode**, because it relies on Postgres session-scoped features that transaction-mode pooling breaks:

- `LISTEN`/`NOTIFY`, used for change cancellation and step status updates.
- Session-scoped advisory locks, used for admission control and image build concurrency.

Session mode keeps one backend connection assigned to a client for the entire session, so these features work exactly as they do with a direct connection — no application changes are required.

## When to use it

The pooler is opt-in and disabled by default. Consider enabling it if you're running a large deployment with many worker threads or elevated change concurrency and want to reduce database-side connection setup overhead. It is not required for typical installations.

## Enabling the pooler

Set `db.cnpg.pooler.enabled` to `true` in your `values.yaml` file:

```yaml
db:
  cnpg:
    pooler:
      enabled: true
      # Number of PgBouncer replicas
      instances: 2
```

:::warning[Mutually exclusive with the primary headless service]
Do not enable this alongside [`db.cnpg.primaryHeadlessService.enabled`](/setup/configuration/additional-settings.md#database-primary-headless-service) — the two settings resolve `PGHOST` differently and are not intended to be combined. The two solve different problems: the pooler reduces per-connection setup cost, while the headless service avoids connections being dropped outright when many pods connect at once.
:::

### Sizing `default_pool_size`

In session mode, PgBouncer assigns one backend connection to each client for the entire time it's connected — `db.cnpg.pooler.pgbouncer.parameters.default_pool_size` caps how many of those it will hand out for the `opschain`/`opschain` database/user pair. If it's set too low relative to actual concurrent usage, clients queue at the pooler for a free slot instead of reaching Postgres — reintroducing the exact contention the pooler is meant to remove, just one layer further out.

The default (`300`) is sized against the chart's default [`db.cnpg.postgresql.parameters.max_connections`](/advanced/ha/index.md#other-settings) (`350`), leaving a 50-connection reserve for connections that don't go through the pooler — CNPG's own internal/replication connections, and any direct `psql`/backup/monitoring sessions. Keep the two settings in proportion:

- **Raising `max_connections`?** Raise `default_pool_size` by roughly the same amount, so the pool actually uses the extra capacity you added — for example, doubling `max_connections` to `700` calls for raising `default_pool_size` to around `650`, keeping the same 50-connection reserve.
- **Lowering `max_connections`?** Lower `default_pool_size` too, by the same amount. Otherwise the pool advertises more sessions than Postgres can actually grant, and the reserve for direct connections shrinks (or goes negative).
- **Not sure how much reserve you need?** Check how many connections are currently made directly (not through the pooler) before shrinking the reserve — run the following from inside the database pod for a rough live count:

  ```bash
  kubectl -n ${KUBERNETES_NAMESPACE} exec ${CLUSTER_NAME}-1 -c postgres -- \
    psql -U postgres -d opschain -c "select count(*) from pg_stat_activity where application_name not like 'pgbouncer%'"
  ```

Apply the change with `helm upgrade`, as you would for any other `values.yaml` change.

:::warning[A rollout restart is required]
Kubernetes does not restart pods automatically when a ConfigMap they read from changes. After the `helm upgrade`, restart the API and worker deployments so they pick up the new `PGHOST`:

```bash
kubectl -n ${KUBERNETES_NAMESPACE} rollout restart deployment/opschain-api deployment/opschain-api-worker
```

:::

This does not cause any database downtime. The CNPG `Pooler` is deployed as a separate resource alongside your existing database cluster — creating or removing it does not touch the `Cluster` resource or restart PostgreSQL. Only the stateless API and worker pods roll, and Kubernetes' rolling update keeps the previous pods serving requests until the new ones are ready.

## Verifying it's working

Confirm the pooler is running:

```bash
kubectl get pooler ${CLUSTER_NAME}-pooler-rw -n ${KUBERNETES_NAMESPACE}
```

Where `${CLUSTER_NAME}` is your `db.cnpg.clusterName` (default `opschain-db`).

Confirm the API and worker pods are pointed at it:

```bash
kubectl -n ${KUBERNETES_NAMESPACE} exec deploy/opschain-api -- printenv PGHOST
```

This should return `${CLUSTER_NAME}-pooler-rw` rather than `${CLUSTER_NAME}-rw`.

## Rolling back

Set `db.cnpg.pooler.enabled` back to `false`, run `helm upgrade`, then repeat the rollout restart above. `PGHOST` reverts to the cluster's primary service directly. The `Pooler` resource itself can be safely left running or removed independently — nothing depends on it once `PGHOST` no longer points at it.

## What to do next

- Review the [additional settings guide](/setup/configuration/additional-settings.md#database-connection-pooling) for the full list of pooler settings.
- See the [CNPG connection pooling documentation](https://cloudnative-pg.io/documentation/1.27/connection_pooling/) for advanced PgBouncer tuning via `db.cnpg.pooler.pgbouncer.parameters`.
