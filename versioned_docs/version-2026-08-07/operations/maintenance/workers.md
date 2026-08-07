---
sidebar_position: 5
description: How to gracefully shutdown the OpsChain workers for maintenance.
---

# OpsChain workers

When performing maintenance on OpsChain, we recommend stopping the workers before you bring down the rest of the stack. This will ensure that any in-progress actions are allowed to complete, but no new actions will be started.

During this period, the API will still be available, allowing the status of changes to be queried, and new changes to be enqueued which will be actioned once the workers are bought back into service.

## Graceful shutdown

When worker pods are signalled to stop, they will wait up to **one hour** by default for any in-progress actions to complete before being forcefully terminated.

If you have actions that may take longer than one hour to complete, you can customise this grace period by setting the `apiWorker.terminationGracePeriodSeconds` Helm value.

Add the following to your `values.yaml` file and redeploy OpsChain with the command used for [patching](/operations/upgrading.md#upgrade-opschain):

```yaml
apiWorker:
  terminationGracePeriodSeconds: 7200 # two hours
```

:::note
This reconfiguration will only apply to actions started within the newly started worker instances. Any in-progress actions running when this value is applied will be subject to the previous grace period.
:::

## Performing maintenance

To gracefully scale down the workers, perform some maintenance, and scale them back to the original state, follow the steps below:

```bash
# record your current number of worker replicas
REPLICAS=$(kubectl get deploy opschain-api-worker -o jsonpath='{.spec.replicas}')

# scale the workers to zero
kubectl scale deploy opschain-api-worker --replicas=0

# wait for all workers to exit
# if you have customised the grace period, substitute the timeout value to match
kubectl wait --for=delete pod -l app=opschain-api-worker --timeout=1h

# PERFORM MAINTENANCE

# scale your workers back up to the original number of replicas
kubectl scale deploy opschain-api-worker --replicas $REPLICAS
```

### Scaling the workers without kubectl

The worker count can also be changed from the **Deployments** tab in the **System information** section of the administration screen, without cluster access. Select **Scale** on the `opschain-api-worker` row and choose the replica count — zero to stop the workers, and the original count to bring them back. See [deployments](/getting-started/familiarisation/gui/deployments.md#scaling-a-deployment).

Scaling down this way is still graceful: the surplus workers finish the actions already in progress before terminating, subject to the same grace period described above. The tab's replica counts show when the last worker has exited, in place of the `kubectl wait` above.

:::note
The replica count is not written back to your Helm values, whether you change it from the administration screen or with `kubectl`. The next `helm upgrade` returns the workers to the count configured in your `values.yaml`, which is worth keeping in mind if maintenance runs long enough to overlap an upgrade.
:::
