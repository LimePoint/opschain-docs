---
sidebar_position: 4
description: How to stop the OpsChain pods when not in use, and then restart them.
---

# Stopping and starting OpsChain

This guide takes you through stopping and starting OpsChain without uninstalling.

After following this guide you should know:

- how to stop the OpsChain pods
- how to resume the OpsChain pods
- how to stop K3s when not in use

## Stopping OpsChain

The pods that make up the OpsChain installation can be stopped to halt the OpsChain processes and free up any CPU or RAM that they use. Stopping OpsChain does not delete any persistent volumes (whereas uninstalling does).

The kubectl `scale` command can be used to reduce all the Kubernetes replicas to zero to stop all OpsChain deployments. For example:

```bash
kubectl scale deploy/opschain-api --replicas=0
```

:::caution
Do not scale down the API and workers whilst steps and changes are being executed by OpsChain.
:::

## Starting OpsChain

The kubectl `scale` command can be used to increase the Kubernetes replicas to the desired number to start all OpsChain deployments. For example:

```bash
kubectl scale deploy/opschain-api --replicas=1
```

## Stopping K3s

If you are not using K3s for other purposes, you can stop it to free up any CPU or RAM that it uses.

The `systemctl stop k3s` command will stop the K3s service.

:::caution
Do not stop K3s whilst steps and changes are being executed in OpsChain.
:::

## Starting K3s

If the `systemctl stop k3s` command has been used to stop K3s, then the `systemctl start k3s` command can be used to start it again.
