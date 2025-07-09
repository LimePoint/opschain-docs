---
sidebar_position: 4
description: An important periodic maintenance task for the OpsChain build service.
---

# Build service certificate renewal (deprecated)

:::note
This manual maintenance is only required in OpsChain 2023-01-13 and older.
:::

The internal OpsChain container build service uses [mutal TLS](https://en.wikipedia.org/wiki/Mutual_authentication#mTLS) certificates for all communication.

These certificates are issued by cert-manager and are automatically renewed every 90 days.

To ensure in-progress changes are not interrupted, the build service is not restarted automatically when the certificate renews.

The current status of the certificate and whether the build service needs to be restarted is available by running the following command:

```bash
opschain server utils check_build_service_certificate_expiry
```

The certificate will be renewed 30 days before the expiry date, providing a window in which the build service can be restarted without interrupting changes.

Before restarting the build service it is recommended that the OpsChain workers are stopped to ensure no new changes are started until the restart is complete. Follow the steps below to halt the workers while you restart the build service:

```bash
# record your current number of worker replicas
REPLICAS="$(kubectl get deploy opschain-api-worker -o jsonpath='{.spec.replicas}')"

# scale the workers to zero
kubectl scale deploy opschain-api-worker --replicas 0

# wait for all workers to exit
# if there are any in-progress changes, the workers will wait for up to one hour for these to complete
kubectl wait --for=delete pod -l app=opschain-api-worker --timeout 1h

# once the workers are stopped, you can restart the build service and wait for it to become available again
kubectl rollout restart deploy opschain-build-service
kubectl wait --for=condition=Available deploy/opschain-build-service --timeout 5m

# scale your workers back up to the original number of replicas
kubectl scale deploy opschain-api-worker --replicas $REPLICAS
```

:::tip
If you have actions that may take longer than one hour to complete, you can customise the time that the workers will wait to stop before being killed. See the [OpsChain workers operations guide](/operations/workers.md) for instructions on configuring this grace period.
:::
