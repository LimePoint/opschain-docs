---
sidebar_position: 1
description: Introduction to how TLS/HTTPS connectivity is configured for OpsChain
---

# Introduction

OpsChain requires TLS certificates for its internal communication with its services, such as the image registry and the build service. It can also be configured to use TLS/HTTPS connectivity for its API and web UI, ensuring that all communication is encrypted and secure.

This guide will walk you through the necessary information to understand how to configure TLS/HTTPS connectivity for OpsChain and the options available to you.

## Networking

OpsChain uses Kong Ingress proxy to route traffic to its services, this means that the hostname on which OpsChain and its services are accessible defaults to the hostname of the VM it is installed on. It is your responsibility to ensure that this server's hostname is reachable from your machine/network by creating the appropriate DNS entries for it.

If you are using the internal secret vault, you should add two DNS entries pointing to the server's hostname, one with the [API hostname](#api-and-web-ui-hostname) and the other with the [secret vault's external hostname](#secret-vault-hostname).

### Port mapping

All services sit behind the Kong Ingress proxy, which listens on port 3000 for HTTP and port 3443 for HTTPS connections. The requests are then forwarded to the appropriate services based on the request hostname.

OpsChain services listen on the following ports by default:

| Service | Port(s) |
|---------|---------|
| API and UI | 3000 for HTTP, 3443 for HTTPS |
| Build service | 50000 |
| Database | 5432 |
| Image registry | 8000 |
| LDAP | 389 |
| Log aggregator | 24220, 24224 |
| Secret vault | 8200, 8201 |

:::info
These ports are only accessible internally from the Kubernetes cluster and the machine it is hosted on. Unless you expose them via an external service, they won't be accessible from outside the cluster.
:::

#### Disabling the insecure HTTP listener

You can disable the Kong Ingress proxy's insecure HTTP listener on port 3000 by setting the `env.OPSCHAIN_INSECURE_HTTP_PORT_ENABLED` environment variable to `false` in your `values.yaml` file.

```yaml
env:
  OPSCHAIN_INSECURE_HTTP_PORT_ENABLED: false
```

:::warning
Only disable the insecure HTTP listener after ensuring you can reach the API, UI and secret vault via HTTPS.
:::

## Certificates

OpsChain requires the following certificates for its services to function correctly:

- Image registry certificate: this certificate is for the internal communication between the image registry and the API. The default image registry hostname is `opschain-image-registry.local.gd`.
- Build service certificate: this certificate is for the internal communication between the build service and the API. The build service hostname is `opschain-build-service` and cannot be changed.

If you use the internal secret vault (default configuration), then you will also need the following certificates:

- Secret vault internal certificate: this certificate is for the internal communication between the secret vault and the API. The secret vault internal hostname is `opschain-secret-vault-0.opschain-secret-vault-internal` and cannot be changed.
- Secret vault external certificate: this certificate is for accessing the secret vault's UI from the client machines.

:::tip
The `*.local.gd` is a special hostname that automatically resolve to `127.0.0.1`.
:::

### Optional certificates

Optionally, you can also use HTTPS for OpsChain's API and web UI, which will require an additional API certificate, used exclusively for external access to the API and UI.

:::tip
You can first install OpsChain without HTTPS connectivity for the API, and then configure it to use HTTPS later.
:::

## Hostname configuration

You can configure the hostnames that your certificates use (or should be issued for) by each service in your `values.yaml` file. After configuring your hostnames, follow one of the [available options](#available-options) guide to configure your certificates.

:::warning
When using your own certificates or provided self-signed certificates, it is your responsibility to ensure that the certificates include a DNS `subjectAlternativeName` that matches the hostnames you defined in your `values.yaml` file.
:::

### API and web UI hostname

By default, the OpsChain API will use the `opschain-api` hostname, which points to its Kubernetes service, meaning it will be accessible at your server's external IP address/hostname. You can change the hostname used by the API to something more friendly by setting the `api.hostName` and the `env.OPSCHAIN_API_HOST_NAME` values in your `values.yaml` file.

```yaml
api:
  hostName: "opschain.my-company.com"

env:
  OPSCHAIN_API_HOST_NAME: "opschain.my-company.com"
```

:::info
The OpsChain API and UI always share the same hostname.
:::

### Build service hostname

The default build service hostname is `opschain-build-service` and cannot be changed.

### Image registry hostname

The default image registry hostname is `opschain-image-registry.local.gd` and can be changed by setting the `trow.trow.domain`, `trow.ingress.hosts[0].host`, `trow.ingress.tls[0].hosts[0]` and the `env.OPSCHAIN_IMAGE_REGISTRY_HOST` values in your `values.yaml` file. For example:

```yaml
trow:
  trow:
    domain: "image-registry.my-company.com"
  ingress:
    hosts:
      - paths: [ "/" ]
        host: "image-registry.my-company.com"
    tls:
      - secretName: "opschain-image-registry-cert"
        hosts:
          - "image-registry.my-company.com"

env:
  OPSCHAIN_IMAGE_REGISTRY_HOST: "image-registry.my-company.com"
```  

### Secret vault hostname

:::note
This section is only relevant if you are using the internal secret vault.
:::

The OpsChain secret vault has two hostnames:

- Internal hostname: `opschain-secret-vault-0.opschain-secret-vault-internal` - This hostname cannot be changed.
- External hostname: the hostname you'll use to access the secret vault's UI.

The external hostname must be configured in your `values.yaml` file by setting the `global.secretVaultExternalHostName` value:

```yaml
global:
  secretVaultExternalHostName: "vault.my-company.com"
```

:::warning
The default secret vault uses the same ingress as the API, ensure that the host name you provide for the secret vault is different than the [API host name](#api-and-web-ui-hostname).
:::

For the clients that need to access the secret vault UI, you must configure your DNS to map the secret vault hostname to the server where OpsChain is installed.

## Available options

There are a few options available for configuring TLS/HTTPS connectivity for OpsChain, each with their own advantages and disadvantages:

1. Using `cert-manager` to [automatically manage certificates for you](setup/tls/cert-manager.md). This is the recommended approach if you want to quickly setup your instance and don't want to manage certificates manually.
2. Using the [provided self-signed certificates](setup/tls/manual-cert-management.md). This option is useful if you want to trial OpsChain without `cert-manager` and don't have your own certificates yet.
3. Bringing [your own certificates](setup/tls/manual-cert-management.md). This option is the most flexible if you are running in an enterprise environment and can only trust your own certificates.
4. Using a combination of `cert-manager` and your own certificates. You can use `cert-manager` to automatically manage certificates for the internal services while providing your own certificates for the API, UI and secret vault, for example. Refer to the [cert-manager guide](setup/tls/cert-manager.md) to install cert-manager and then refer to the [manual certificate management guide](setup/tls/manual-cert-management.md) to configure your own certificates.

:::note Considerations
Remember that TLS certificates expire and need to be renewed. Depending on your chosen option, you will need to manually renew your certificates before they expire to ensure that your instance continues to function properly. Check the relevant guide for more information on how to renew your certificates.
:::

## What to do next

- Follow the guide for your chosen option to configure your certificates and proceed with the installation of OpsChain.
