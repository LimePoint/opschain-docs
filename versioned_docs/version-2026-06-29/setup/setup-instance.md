---
sidebar_position: 5
description: A guide to setting up your OpsChain instance.
---

# Post-deploy configuration

This guide takes you through setting up your OpsChain instance and configuring the administrator user.

## Creating your first OpsChain user

The OpsChain API server requires a valid username and password for users to interact with its data.

OpsChain supports two authentication modes, but only one can be active at any given moment. See the [authentication strategy setting reference](/setup/configuration/additional-settings.md#opschain_auth_strategy) for more information.

With that in mind, please ensure you follow the next step only for the currently configured `OPSCHAIN_AUTH_STRATEGY` variable in your `values.yaml`.

### Creating an LDAP authenticated user

To create a user that is authenticated via the configured LDAP, execute:

```bash
kubectl exec -n ${KUBERNETES_NAMESPACE} deploy/opschain-api -- /usr/bin/container_start.sh "rake release:create_user[opschain,password,email@example.com]"
```

This will create an `opschain` user with the password `password`.

### Creating a locally authenticated user

To create a user that is authenticated locally in OpsChain, execute:

```bash
kubectl exec -n ${KUBERNETES_NAMESPACE} deploy/opschain-api -- /usr/bin/container_start.sh "rake release:create_local_user[opschain,password,email@example.com]"
```

This will create an `opschain` user with the password `password`.

#### Updating a locally authenticated user email address

To update the email address for a user that is authenticated locally in OpsChain, execute:

```bash
kubectl exec -n ${KUBERNETES_NAMESPACE} deploy/opschain-api -- /usr/bin/container_start.sh "rake release:update_local_user_email_address[opschain,new-email@example.com]"
```

### Providing superuser access to a user

By default, users have permissions according to the authorisation policies assigned to them. OpsChain provides a special `superuser` policy that can be assigned for users that should not have their access restricted in any circumstance.

To provide superuser access to the newly created `opschain` user, execute:

```bash
kubectl exec -n ${KUBERNETES_NAMESPACE} deploy/opschain-api -- /usr/bin/container_start.sh "rake release:setup_superuser[opschain,false]"
```

:::caution
Due to security risks, we strongly recommend keeping the number of users with superuser access as minimal as possible.
:::

### Configuring the OpsChain CLI

The CLI can be configured by using the `opschain config init` command. It will prompt you for the user created in the previous steps and the API address.

#### Validating your CLI and API

To validate your CLI has successfully connected to the API, you can run the following:

```bash
opschain info
```

If everything is working, the output will look similar to:

```bash
--------------------
Instance Title       : OpsChain
License Issuer       : LimePoint Pty Ltd (support@limepoint.com)
Licensee             : Engineering
License Start Date   : 2025-11-12 00:00:00 +0000 UTC
License Expiry Date  : 2026-10-17 00:00:00 +0000 UTC
version              : 2025-11-12 (9be060c7)
runner_image         : limepoint/opschain-runner-enterprise:2025-11-12
db_version           : 17.5
api_version          : 7.1.5.1
```

## Setup the custom CA

:::warning[Privileged access required]
You must run the commands below as sudo or root user with access to the `/limepoint/rancher/k3s` directory.
:::

To ensure that the OpsChain image registry certificate is trusted by Kubernetes, you must trust the CA certificate within K3s' registry configuration. If you opted to use [cert-manager](/setup/configuration/tls/cert-manager.md), you can extract the CA certificate from the `opschain-ca-key-pair` secret into a stable location by running the following commands:

```bash
mkdir -p /limepoint/rancher/k3s/certs
```

```bash
kubectl -n ${KUBERNETES_NAMESPACE} get secret opschain-ca-key-pair -o jsonpath="{.data.ca\.crt}" | base64 -d > /limepoint/rancher/k3s/certs/opschain-ca.pem
```

And add the OpsChain image registry to K3s' registry configuration by editing the `/limepoint/rancher/k3s/registries.yaml` file. Note that the port used must be the one you configured in the [Ingress TLS port setting](/setup/configuration/additional-settings.md#opschain_ingress_tls_port).

```yaml
configs:
  "opschain-image-registry.local.gd:443":
    tls:
      ca_file: /limepoint/rancher/k3s/certs/opschain-ca.pem
```

:::tip[Certificate renewal and skipping TLS verification]
Note that you will need to update the CA certificate file and restart K3s every time the OpsChain image registry certificate is renewed. You can check the certificate expiry and renewal dates by running the following command:

```bash
kubectl describe cert opschain-ca -n ${KUBERNETES_NAMESPACE}
```

If instead you'd like to just skip TLS verification for the local image registry, you can do so by adding the `tls.insecure_skip_verify` option to the configuration.

```yaml
configs:
  "opschain-image-registry.local.gd:443":
    tls:
      insecure_skip_verify: true
```

[Learn more](https://docs.k3s.io/installation/private-registry#registries-configuration-file) about registry configuration in the K3s documentation.
:::

:::warning[Restart K3s]
You must restart K3s to complete the custom CA setup.

```bash
sudo systemctl restart k3s
```

:::

Each platform has a different way of trusting a certificate. Follow your client's platform documentation to trust the certificate so you're able to access the OpsChain API, UI and secret vault via HTTPS.

## Accessing the OpsChain GUI

Using a web browser, you can access the OpsChain GUI by navigating to the address configured in your `values.yaml` file - if using the default installation options this would be locally accessible at [http://localhost:3000/](http://localhost:3000/). If you have configured an HTTPS address for the API, you will need to trust the certificate associated with it and connect to that address instead. The credentials used for the GUI are the same as the CLI.

Once you're able to login, you can [familiarise yourself with the OpsChain GUI](/getting-started/familiarisation/gui/overview.md).

:::info[Basic authentication and HTTP]
If you have configured the `OPSCHAIN_ENABLE_BASIC_AUTH` setting to `false`, it's recommended you connect to the OpsChain GUI via HTTPS. Refer to the [basic authentication and HTTP](/setup/configuration/additional-settings.md#opschain_enable_basic_auth) setting reference for more information.
:::

## Accessing the OpsChain vault

If you have opted to use the [OpsChain vault](/setup/configuration/encryption-and-secrets.md#option-1-opschain-secret-vault) as the global default, you can access its UI by navigating to the address configured in your `values.yaml` file.

Refer to the [secret vault settings](/setup/configuration/additional-settings.md#secret-vault-settings) for information on the credentials needed to access the secret vault UI.

## What to do next

- Go to our [getting started guide](/getting-started/overview.md) to learn more about OpsChain and familiarise yourself with our GUI and other CLI commands.
- Or skip to our tutorial for [understanding the OpsChain structure](/getting-started/tutorials/structure.md) from which you'll be able to run changes.
