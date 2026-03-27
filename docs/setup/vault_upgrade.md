---
sidebar_position: 7
description: Upgrading the secret vault to the latest version.
---

# Secret vault upgrade guide

OpsChain's secret vault storage backend has changed to be database-based rather than file-based, allowing the secret vault to operate in high availability setups. Follow this guide to upgrade to this version. Failure to do so might result in data loss.

:::warning
This process is only required if you're upgrading from an OpsChain version prior to 2026-03-25 and you are using or want to use the default secret vault.
:::

## Stop OpsChain

To avoid potential data loss, you should stop the OpsChain API and workers before upgrading the secret vault.

```bash
kubectl scale deployment opschain-api --replicas=0 -n ${KUBERNETES_NAMESPACE}
```

```bash
kubectl scale deployment opschain-api-worker --replicas=0 -n ${KUBERNETES_NAMESPACE}
```

## Backup the existing secret vault data

:::danger
Skipping this step might result in permanent data loss. Do not proceed without a working backup of your secret vault data.
:::

Ensure your secret vault instance is running and accessible. You can check this by accessing the secret vault UI and verifying that you can access the secrets.

You can create a backup of all secrets in your vault by running the following commands:

1. Obtain the secret vault root token

   ```bash
   kubectl get secrets/opschain-vault-config -o jsonpath='{.data.OPSCHAIN_VAULT_TOKEN}' | base64 -d
   ```

   Copy the root token to your clipboard.

2. Enter the secret vault container

   ```bash
   kubectl exec -it pod/opschain-secret-vault-0 -n ${KUBERNETES_NAMESPACE} -- /bin/sh
   ```

3. Create a directory to store the backup on the vault filesystem

   ```bash
   mkdir -p /tmp/backup
   ```

4. From within the vault pod, download the [medusa](https://github.com/jonasvinther/medusa) tool to export the secrets from the vault:

   ```bash
   cd /tmp
   ```

   ```bash
   wget https://github.com/jonasvinther/medusa/releases/download/v0.7.3/medusa_0.7.3_linux_amd64.tar.gz
   ```

   ```bash
   tar -xzvf ./medusa_0.7.3_linux_amd64.tar.gz
   ```

   ```bash
   chmod +x /tmp/medusa
   ```

5. Export the secrets from the vault. Replace `<root-token>` with the root token you obtained in step 1.

   ```bash
   ./medusa export secrets -m "kv1" --address="https://0.0.0.0:8200" --token="<root-token>" --format="json" -k > backup/secrets.json
   ```

6. Exit the vault pod

   ```bash
   exit
   ```

7. Make a directory to store the backup on the host filesystem

   ```bash
   mkdir -p /limepoint/backup
   ```

8. Copy the backup file to the host filesystem

   ```bash
   kubectl cp opschain-secret-vault-0:/tmp/backup/ /limepoint/backup/ -n ${KUBERNETES_NAMESPACE}
   ```

9. Verify the backup file is created and is not empty (given you have secrets in your vault)

   ```bash
   ls -lah /limepoint/backup/secrets.json
   ```

10. Remove every `.data` key from your backup file. For example, if you have the following structure:

   ```json
   {
      "my_secret_1": {
         "data": {
            "secret": "value"
         }
      }
   }
   ```

   It should be transformed into the following structure:

   ```json
   {
      "my_secret_1": {
         "secret": "value"
      }
   }
   ```

## Update the `values.yaml` file

Besides the regular configuration changes to your `values.yaml` file, you must make the following changes to your configuration file:

- Add the `secretVault.unsealKey` setting. You can generate the unseal key as described in the [OpsChain configuration variables](/setup/understanding-opschain-variables.md#option-1-internal-default-secret-vault) guide.

```yaml
secretVault:
  unsealKey: "<unseal-key>"
  # ... other settings
```

- Remove the `secretVault.volume` section.

With these settings, OpsChain will setup a new secret vault instance using the given seal key when you deploy it.

## Delete the existing secret vault instance

Assuming your backup is safe and valid, remove the existing secret vault instance by running the following command:

```bash
kubectl delete statefulset/opschain-secret-vault -n ${KUBERNETES_NAMESPACE}
```

## Deploy OpsChain

Deploy OpsChain using the regular Helm upgrade command. Once deployed, the new secret vault with database storage will be created and will be available in your Kubernetes namespace.
Once the API runs again, it will initialize the new secret vault and save the configuration for it.

You can check the logs of the new secret vault pod to verify the secret vault is working:

```bash
kubectl -n ${KUBERNETES_NAMESPACE} logs pod/opschain-secret-vault-0 -f
```

You can also verify the logs for the API pod to verify it's successfully initialized the new secret vault.

```bash
kubectl -n ${KUBERNETES_NAMESPACE} logs deployment/opschain-api -f
```

:::warning
Redeploying OpsChain will bring the API and workers back online. If you do not want anything to happen while you update your secrets, you should scale the API and workers to 0 again before continuing.
:::

## Import the backup secrets into the new secret vault

Once the API has successfully initialized the new secret vault, you can import the backup secrets into the new secret vault by running the following commands:

1. Obtain the new root token

   ```bash
   kubectl get secrets/opschain-vault-config -o jsonpath='{.data.OPSCHAIN_VAULT_TOKEN}' | base64 -d
   ```

   Copy the new root token to your clipboard.

2. Copy the backup file to the vault pod

   ```bash
   kubectl cp /limepoint/backup/secrets.json opschain-secret-vault-0:/tmp/secrets.json -n ${KUBERNETES_NAMESPACE}
   ```

3. Enter the vault pod and re-install the medusa tool inside it

   ```bash
   kubectl exec -it pod/opschain-secret-vault-0 -n ${KUBERNETES_NAMESPACE} -- /bin/sh
   ```

   ```bash
   cd /tmp
   ```

   ```bash
   wget https://github.com/jonasvinther/medusa/releases/download/v0.7.3/medusa_0.7.3_linux_amd64.tar.gz
   ```

   ```bash
   tar -xzvf ./medusa_0.7.3_linux_amd64.tar.gz
   ```

   ```bash
   chmod +x /tmp/medusa
   ```

4. Import the secrets into the vault. Replace `<root-token>` with the new root token you obtained in step 1.

   ```bash
   ./medusa import secrets -m "kv1" --address="https://0.0.0.0:8200" --token="<root-token>" --format="json" -k /tmp/secrets.json
   ```

   You should see logs like `Secret successfully written to Vault [https://0.0.0.0:8200] using path ...` for each secret that was imported.

5. Exit the vault pod

   ```bash
   exit
   ```

6. Verify the secrets are imported by logging in to the vault UI and checking the secrets are present.
7. For each secret that has been imported, edit the secret in JSON mode and re-add the `.data` key around the secret value. For example, if you have the following secret in the UI:

   ```json
   {
      "secret": "value"
   }
   ```

   It should become the following:

   ```json
   {
      "data": {
         "secret": "value"
      }
   }
   ```

   :::tip
   You should only see one "data" key per secret. For example, if your secret has multiple keys, all of them will be wrapped in the same "data" key.
   :::

You can save the secret and verify it's working by accessing it from your actions and properties. Once all secrets have been properly imported, OpsChain will be fully operational again and you can resume your work. If you have scaled down the API and workers again, you can scale them back up:

```bash
kubectl scale deployment opschain-api --replicas=1 -n ${KUBERNETES_NAMESPACE}
```

Change the number of replicas to the original number of replicas. You can see what's configured in your `values.yaml` file.

```bash
kubectl scale deployment opschain-api-worker --replicas=3 -n ${KUBERNETES_NAMESPACE}
```
