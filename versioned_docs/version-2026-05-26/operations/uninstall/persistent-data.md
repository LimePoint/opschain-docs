---
sidebar_position: 2
description: Persistent data that remains in your Kubernetes cluster post uninstallation.
---

# Persistent data

When uninstalling OpsChain using the `helm uninstall` command, some persistent data will remain in your Kubernetes cluster to make a recovery easier. This data can be deleted manually if desired. These resources may contain secrets or data that you wish to capture before proceeding with the uninstallation. Once you are satisfied that you have captured the necessary data, you can delete these resources.

## Removing all persistent data

You can remove all persistent data by deleting the namespace:

```bash
kubectl delete namespace ${KUBERNETES_NAMESPACE}
```

:::info
This command will remove all resources in the namespace, making the steps below no longer necessary.
:::

## Secrets

The following Kubernetes secrets are also not removed during the uninstallation process and contain the configuration to access the OpsChain secret vault, database credentials and/or secure information used to build and run your OpsChain actions:

| Secret name                      | Description                                                                                                                                                                                                                                                 |
|----------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `opschain-vault-config`          | Contains the connection configuration for the OpsChain secret vault. If OpsChain was configured to use the OpsChain secret vault, then the unique root vault token required to access the vault will be contained in the OPSCHAIN_VAULT_TOKEN in the secret. |
| `opschain-secret-vault-seal-key` | If OpsChain was configured to use the OpsChain secret vault, the unseal key for the vault will be contained in this secret. This is required to unseal the vault prior to accessing the vaults contents using the vault token.                               |
| `opschain-build-env`             | This secret contains environment variables supplied to the OpsChain runner image build.                                                                                                                                                                     |
| `opschain-runner-env`            | This secret contains environment variables supplied to the OpsChain runner when executing actions.                                                                                                                                                          |
| `opschain-db-credentials`        | This secret contains the credentials to access the OpsChain database.                                                                                                                                                                                       |

If you'd like to also remove these secrets, you can do so by running the following command:

```bash
kubectl -n ${KUBERNETES_NAMESPACE} delete secret opschain-vault-config opschain-secret-vault-seal-key opschain-build-env opschain-runner-env opschain-db-credentials
```
