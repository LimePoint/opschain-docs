---
sidebar_position: 3
description: Full guide for manually managing certificates for OpsChain TLS/HTTPS connectivity
---

# Manual certificate management

Learn how to manually manage TLS certificates for the OpsChain services. Please ensure you have read the [introduction](setup/tls/introduction.md) to understand the requirements and options available to you.

## Disabling out-of-the-box support for `cert-manager`

If you do not wish to install and use `cert-manager` to manage any certificate, you must set the `useCertManager` value to `false` in your `values.yaml` file.

```yaml
useCertManager: false
```

## Provided self-signed certificates

LimePoint provides self-signed certificates and a CA issuer certificate that can be used for deploying OpsChain. These are insecure certificates with very long expiry dates and are only meant for trialling.

These certificates are provided as Kubernetes secret resources and are configured for the namespace `opschain`. The namespace can be modified in the JSON files if needed. The certificates are configured for the following hostnames, which you must ensure are set in the corresponding setting in your `values.yaml` file:

| Hostname | Setting |
| :------- | :-------- |
| opschain.local.gd | `api.hostName`, `env.OPSCHAIN_API_HOST_NAME` |
| opschain-image-registry.local.gd | `env.OPSCHAIN_IMAGE_REGISTRY_HOST` |
| opschain-image-registry.local.gd | `trow.trow.domain` |
| opschain-image-registry.local.gd | `trow.ingress.tls[0].hosts[0]` |
| opschain-image-registry.local.gd | `trow.ingress.hosts[0].host` |
| opschain-vault.local.gd | `global.secretVaultExternalHostName` |

Besides the hostname, you must also configure the secret name for the image registry certificate in your `values.yaml` file, in the `trow.ingress.tls[0].secretName` setting. Below is a subset example of how you should configure your `values.yaml` file when using all of these certificates:

```yaml
api:
  hostName: "opschain.local.gd"

trow:
  trow:
    domain: "opschain-image-registry.local.gd"
  ingress:
    hosts:
      - paths: [ "/" ]
        host: "opschain-image-registry.local.gd"
    tls:
      - secretName: opschain-image-registry-cert
        hosts:
          - "opschain-image-registry.local.gd"

global:
  secretVaultExternalHostName: "opschain-vault.local.gd"

env:
  OPSCHAIN_API_HOST_NAME: "opschain.local.gd"
  OPSCHAIN_IMAGE_REGISTRY_HOST: "opschain-image-registry.local.gd"
```

:::warning
This sample `values.yaml` is not complete and is not usable as shown.
:::

To install these certificates, first create the namespace where you'll install OpsChain:

```bash
kubectl create namespace opschain
```

Then download the certificates:

```bash
curl -L https://docs.opschain.io/files/downloads/certs.tar.gz | tar xz
```

Once the certificates are downloaded, you can choose to install all the certificates and the CA issuer, or install them individually.

### Installing all certificates

To install all the certificates and the CA issuer, run the following command:

```bash
for cert in *.json; do kubectl apply -f "${cert}"; done
```

### Installing individual certificates

Alternatively, if you're using `cert-manager` to manage some certificates, you can install each certificate individually. First, install the CA issuer certificate:

```bash
kubectl apply -f opschain-ca-key-pair.json
```

Then, install only the file for the service you want to use the custom certificate for. For example, if you only want the API to use a custom certificate, you can install the `opschain-api-cert.json` file:

```bash
kubectl apply -f opschain-api-cert.json
```

## Bringing your own certificates

If you want to bring your own certificates, you can create [Kubernetes TLS secrets](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_create/kubectl_create_secret_tls/) to store your certificates and private keys. For example, to create a Kubernetes TLS secrets named `my-api-certificate` in the namespace where OpsChain is installed, you can run the following command:

```bash
kubectl -n opschain create secret tls my-api-certificate --cert=path/to/tls.crt --key=path/to/tls.key
```

The secret name for the certificates you provide must be configured in the corresponding setting in your `values.yaml` file, according to the table below.

| Service | Secret name setting |
|---------|---------|
| API | `api.certificateSecretName` |
| Image registry | `imageRegistry.certificateSecretName` |
| Build service | `buildService.certificateSecretName` |
| Secret vault | `secretVault.internalCertificateSecretName` |
| Secret vault | `secretVault.externalCertificateSecretName` |

:::info
When a certificate secret name is configured, `cert-manager` will NOT manage that certificate for the corresponding service.
:::

The DNS `subjectAlternativeName` used in your certificates must follow the hostname configuration rules, as described in the [hostname configuration](setup/tls/introduction.md#hostname-configuration) section and properly configured in the `values.yaml` file.

Below is a subset example of how you should configure your `values.yaml` file when using your own certificates for all services:

```yaml
useCertManager: false

api:
  hostName: #api-hostname
  certificateSecretName: #api-cert-name

imageRegistry:
  certificateSecretName: #image-registry-cert

buildService:
  certificateSecretName: #build-service-cert

trow:
  trow:
    domain: #image-registry-hostname
  ingress:
    hosts:
      - paths: [ "/" ]
        host: #image-registry-hostname
    tls:
      - secretName: #image-registry-cert
        hosts:
          - #image-registry-hostname

openbao:
  server:
    volumes:
      - name: opschain-secret-vault-cert
        secret:
          secretName: #secret-vault-cert
      - name: opschain-secret-vault-data-claim
        persistentVolumeClaim:
          claimName: opschain-secret-vault-data-claim


secretVault:
  externalCertificateSecretName: #secret-vault-external-cert
  internalCertificateSecretName: #secret-vault-cert

global:
  secretVaultExternalHostName: #secret-vault-hostname

env:
  OPSCHAIN_API_CERTIFICATE_SECRET_NAME: #api-cert-name
  OPSCHAIN_API_HOST_NAME: #api-hostname
  OPSCHAIN_IMAGE_REGISTRY_HOST: #image-registry-hostname
```

:::warning
This sample `values.yaml` is not complete and is not usable as shown.
:::

### Build service certificate

The build service uses [mutual TLS](https://en.wikipedia.org/wiki/Mutual_authentication#mTLS)
for internal communication with the API. Unlike standard TLS — where only the server
authenticates to the client — mTLS requires both sides to present and verify certificates.

The certificate you provide must:

- Use the fixed hostname `opschain-build-service` as its DNS `subjectAlternativeName`
- Have both `serverAuth` and `clientAuth` set in its Extended Key Usage (EKU)

The CA that issued this certificate must also be included in the Kubernetes secret. To do so, you can create a generic secret containing the CA certificate and private key by running the following command:

```bash
kubectl -n opschain create secret generic build-service-cert --from-file=ca.crt=path/to/ca.crt --from-file=tls.crt=path/to/tls.crt --from-file=tls.key=path/to/tls.key
```

### Secret vault internal certificate

The secret vault's internal certificate also requires the CA's certificate and a `tls-combined.pem` file containing the certificate and private key to be included in the Kubernetes secret. You can use the following command to create a secret containing these files:

```bash
kubectl -n opschain create secret generic secret-vault-cert --from-file=ca.crt=path/to/ca.crt --from-file=tls.crt=path/to/tls.crt --from-file=tls.key=path/to/tls.key --from-file=tls-combined.pem=path/to/tls-combined.pem
```

:::tip Combining certificate and private key into a single file
You can combine the certificate and private key into a single file by running the following command:

```bash
cat tls.crt tls.key > tls-combined.pem
```

:::

When overriding the secret vault internal certificate (`internalCertificateSecretName`), you must ensure that all the existing volumes in `.openbao.server.volumes` are still specified in addition to your modifications, otherwise the volume won't be created and your vault won't be able to start.

:::info Default volume configuration
Use `helm show values oci://docker.io/limepoint/opschain --version ${OPSCHAIN_CHART_VERSION} --jsonpath '{.openbao.server.volumes}'` to show the default values, and provide it as `.openbao.server.volumes` with the `secretName` modified.
:::

## Trusting your CA certificate

The certificate authorities that issued your certificates must be trusted by the host running OpsChain because OpsChain will access its image registry via the Kong Ingress proxy load balancer. Follow your host's OS process for trusting certificates and then, if using K3s, restart it for changes to take effect. You can restart K3s by running the following command:

```bash
systemctl restart k3s
```

## What to do next

- With your certificates configured, proceed with the [configuring OpsChain guide](/setup/understanding-opschain-variables.md) to finish configuring OpsChain.
