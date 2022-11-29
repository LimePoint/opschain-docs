---
sidebar_position: 8
description: How to gracefully shutdown the OpsChain workers for maintenance.
---

# OpsChain workers

When performing maintenance on OpsChain, we recommend stopping the workers before you bring down the rest of the stack. This will ensure that any in-progress actions are allowed to complete, but no new actions will be started.

During this period, the API will still be available, allowing the status of changes to be queried, and new changes to be enqueued which will be actioned once the workers are bought back into service.

## Graceful shutdown

When worker pods are signalled to stop, they will wait up to **one hour** by default for any in-progress actions to complete before being forcefully terminated.

If you have actions that may take longer than one hour to complete, you can customise this grace period by setting the `apiWorker.terminationGracePeriodSeconds` Helm value.

Add the following values to a values.override.yaml in your OpsChain configuration directory and re-run `opschain server deploy`:

```yaml
apiWorker:
  terminationGracePeriodSeconds: 7200 # two hours
```

_Note: this reconfiguration will only apply to actions started within the newly started worker instances. Any in-progress actions running when this value is applied will be subject to the previous grace period._

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
