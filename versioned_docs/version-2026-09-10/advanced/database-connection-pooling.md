---
sidebar_position: 5
description: A guide to enabling a CNPG session-mode connection pooler in front of the OpsChain database.
---

# Database connection pooling

This guide covers OpsChain's optional CNPG session-mode connection pooler: what it does, when to enable it, how to verify it, and how to roll it back.

:::warning[Feature preview]
Database connection pooling is a feature preview and is not recommended for production installations. Enable it only in a non-production environment, or where OpsChain support has advised you to.
:::

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

The pooler is opt-in and disabled by default, and while it remains a feature preview it should be left that way on a production installation. It is not required for typical installations. In a non-production environment it may be worth evaluating if you're running a large deployment with many worker threads or elevated change concurrency and want to reduce database-side connection setup overhead.

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

### Sizing the pool

In session mode, PgBouncer assigns one backend connection to each client for the entire time it is connected. `db.cnpg.pooler.pgbouncer.parameters.default_pool_size` caps how many of those it will hand out for the `opschain`/`opschain` database and user pair, and `max_db_connections` caps how many server connections one PgBouncer process will open. Set both to the same number.

Because a client holds its connection for its whole session, `default_pool_size` behaves as a floor on concurrency rather than a fraction of demand. Set it below actual concurrent usage and clients wait at the pooler for a free slot instead of reaching Postgres, reintroducing the contention the pooler is meant to remove one layer further out.

Two things make the arithmetic easy to get wrong.

- **The limits are per PgBouncer process.** With `instances: 2`, the cluster-wide ceiling is `default_pool_size` × 2. That product is what has to fit inside `max_connections`, not `default_pool_size` on its own.
- **Raising [`max_connections`](/advanced/ha/index.md#other-settings)?** Divide the increase by `instances` and add that to both `default_pool_size` and `max_db_connections`, so the pool uses the capacity you added.
- **Adding pods, or raising `concurrent.runner_limit`?** Both grow the reserve. `concurrent.runner_limit` is a runtime setting, so it can be raised without a `helm upgrade` — if you raise it substantially, review the reserve as well.
- **Running replica clusters?** Applications in a replica cluster reach this primary directly rather than through its pooler, so they add to the reserve, not to the pool.
- **Not sure how much reserve you need?** Count the live connections that are not coming through the pooler:

  ```bash
  kubectl -n ${KUBERNETES_NAMESPACE} exec ${CLUSTER_NAME}-1 -c postgres -- \
    psql -U postgres -d opschain -c "select count(*) from pg_stat_activity where application_name not like 'pgbouncer%'"
  ```

Changing these parameters affects the pooler only — the `Cluster` resource is untouched, so PostgreSQL is not restarted.

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
