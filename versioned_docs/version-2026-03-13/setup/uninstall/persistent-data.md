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

## Secret vault data

If OpsChain was configured to use the default secret vault, the secret vault data will have been stored in the `opschain-secret-vault-data-claim` persistent volume claim. This volume will remain post installation in case any secrets it contains need to be retrieved. In addition, if OpsChain is re-installed, the same data will once again be available for use.

:::warning
If the persistent volume claim or the vault specific secrets described below have been deleted, all vault data will be lost.
:::

To remove the secret vault data, you can do so by running the following command:

```bash
kubectl -n ${KUBERNETES_NAMESPACE} delete pvc opschain-secret-vault-data-claim
```

## Secrets

The following Kubernetes secrets are also not removed during the uninstallation process and contain the configuration to access the default secret vault, database credentials and/or secure information used to build and run your OpsChain actions:

| Secret name                      | Description                                                                                                                                                                                                                                                 |
|----------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `opschain-vault-config`          | Contains the connection configuration for the OpsChain secret vault. If OpsChain was configured to use the default secret vault, then the unique root vault token required to access the vault will be contained in the OPSCHAIN_VAULT_TOKEN in the secret. |
| `opschain-secret-vault-seal-key` | If OpsChain was configured to use the default secret vault, the unseal key for the vault will be contained in this secret. This is required to unseal the vault prior to accessing the vaults contents using the vault token.                               |
| `opschain-build-env`             | This secret contains environment variables supplied to the OpsChain runner image build.                                                                                                                                                                     |
| `opschain-runner-env`            | This secret contains environment variables supplied to the OpsChain runner when executing actions.                                                                                                                                                          |
| `opschain-db-credentials`        | This secret contains the credentials to access the OpsChain database.                                                                                                                                                                                       |

If you'd like to also remove these secrets, you can do so by running the following command:

```bash
kubectl -n ${KUBERNETES_NAMESPACE} delete secret opschain-vault-config opschain-secret-vault-seal-key opschain-build-env opschain-runner-env opschain-db-credentials
```
