---
sidebar_position: 7
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

The `opschain server stop` CLI subcommand will reduce all the Kubernetes replicas to zero to stop all the OpsChain pods.

:::caution
Do not use the `opschain server stop` command whilst steps and changes are being executed by OpsChain.
:::

## Starting OpsChain

If the `opschain server stop` CLI subcommand has been used to stop OpsChain, then the `opschain server start` CLI subcommand can be used to start it again.

## Stopping K3s

If you are not using K3s for other purposes, you can stop it to free up any CPU or RAM that it uses.

The `systemctl stop k3s` command will stop the K3s service.

:::caution
Do not stop K3s whilst steps and changes are being executed in OpsChain.
:::

## Starting K3s

If the `systemctl stop k3s` command has been used to stop K3s, then the `systemctl start k3s` command can be used to start it again.
