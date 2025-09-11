---
sidebar_position: 7
description: Steps to perform to permanently remove OpsChain.
---

# Uninstalling OpsChain

If at some point you decide that OpsChain is not for you and you no longer wish to continue using the services it provides, follow these steps to permanently remove OpsChain from your machine.

## Remove the OpsChain containers and data

:::danger
Before uninstalling OpsChain we suggest [making a backup](/administration/maintenance/backups.md) in case you would like to restore any OpsChain data in the future.
:::

Terminate and remove the running OpsChain containers (and associated data) by executing the following command:

```bash
opschain server uninstall
```

### Persistent data

The following resource will remain in your Kubernetes cluster post uninstallation. These may contain secrets or data that you wish to capture before proceeding with the uninstallation. Once you are satisfied that you have captured the necessary data, you can delete these resources.

#### Secret vault data

If OpsChain was configured to use the default secret vault, the secret vault data will have been stored in the `opschain/opschain-secret-vault-data-claim` persistent volume claim. This volume will remain post installation in case any secrets it contains need to be retrieved. In addition, if OpsChain is re-installed, the data will once again be available for use.

:::warning
If the persistent volume claim or the vault specific secrets described below have been deleted all vault data will be lost.
:::

#### Secrets

The following Kubernetes secrets contain the configuration to access the default secret vault and/or secure information used to build and run your OpsChain actions:

| Secret name                      | Description                                                                                                                                                                                                                                                 |
|----------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `opschain-vault-config`          | Contains the connection configuration for the OpsChain secret vault. If OpsChain was configured to use the default secret vault, then the unique root vault token required to access the vault will be contained in the OPSCHAIN_VAULT_TOKEN in the secret. |
| `opschain-secret-vault-seal-key` | If OpsChain was configured to use the default secret vault, the unseal key for the vault will be contained in this secret. This is required to unseal the vault prior to accessing the vaults contents using the vault token.                               |
| `opschain-build-env`             | This secret contains environment variables supplied to the OpsChain runner image build.                                                                                                                                                                     |
| `opschain-runner-env`            | This secret contains environment variables supplied to the OpsChain runner when executing actions.                                                                                                                                                          |

## Remove LimePoint Docker images

Remove the LimePoint images on your local machine to clear up disk space.

```bash
docker rmi $(docker images --filter=reference='limepoint/*' -q)
```

Alternatively, you can do a system prune to remove all unused Docker images and containers. Please keep in mind that if you are using Docker for other applications, this action will remove all Docker images and containers on your machine, not just the ones from the LimePoint organisation.

```bash
docker system prune -a
```

## Logout OpsChain from Docker

Run the following command to logout the `opschaintrial` user from Docker Hub. This step is only required if you ran the `docker login` step in the [CLI guide](/advanced/cli/advanced-cli.md#configure-docker-hub-access).

```bash
docker logout
```

## Delete .opschainrc file

Remove the `.opschainrc` file that you created from the [create an OpsChain CLI configuration file](/advanced/cli/advanced-cli.md#complete-opschain-cli-configuration) section in the installation guide.

```bash
rm ~/.opschainrc
```

## Delete the OpsChain configuration files

Remove the configuration files that you created when [configuring Opschain](/setup/installation.md#preparing-configuration)

## Uninstall native CLI

Delete the binary file if you opted to use the native CLI in the [download the native CLI (optional)](/setup/installation.md#installation) section in the installation guide.

## Uninstall prerequisites (optional)

If no longer required, you may opt to uninstall the prerequisites detailed in the [required software](/docs/setup/prerequisites.md) section in the installation guide.
