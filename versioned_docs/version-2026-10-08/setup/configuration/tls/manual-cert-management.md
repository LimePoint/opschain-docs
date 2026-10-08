---
sidebar_position: 3
description: Full guide for manually managing certificates for OpsChain TLS/HTTPS connectivity
---

# Manual certificate management

Learn how to manually manage TLS certificates for the OpsChain services. Please ensure you have read the [introduction](setup/configuration/tls/index.md) to understand the requirements and options available to you.

## Choosing an approach

There are two ways to manage certificates yourself:

- [Use the certificates LimePoint provides](#provided-self-signed-certificates) - self-signed, with long expiry dates, for trialling OpsChain.
- [Bring your own certificates](#bringing-your-own-certificates) - store each one in a Kubernetes secret, and name that secret in your `values.yaml` file.

Bringing your own certificates can be mixed with `cert-manager`, service by service. Naming a certificate secret for a service stops `cert-manager` managing that service's certificate and leaves it managing the rest, so you only have to supply the certificates you care about.

The certificates LimePoint provides cannot be mixed with `cert-manager`. They are installed under the same secret names `cert-manager` issues into, so they only work with `cert-manager` turned off entirely.

## Provided self-signed certificates

LimePoint provides self-signed certificates and a CA issuer certificate that can be used for deploying OpsChain. These are insecure certificates with very long expiry dates and are only meant for trialling.

:::warning[These certificates require `cert-manager` to be turned off]
Set [`useCertManager`](#turning-cert-manager-off-entirely) to `false` in your `values.yaml` file before installing OpsChain. These certificates are installed under the same secret names `cert-manager` issues into, so while it is enabled it takes ownership of each secret and replaces the certificate you installed with a newly issued one of its own, within seconds.

With `useCertManager: false` you do not need to name any of these secrets in your `values.yaml` file - OpsChain looks for each one under the name its file installs it as. The image registry is the exception: set its secret name in `trow.ingress.tls[0].secretName`, as described below.
:::

These certificates are provided as Kubernetes secret resources and are configured for the namespace `opschain`. The namespace can be modified in the JSON files if needed. The certificates are configured for the following hostnames, which you must ensure are set in the corresponding setting in your `values.yaml` file:

| Hostname | Setting |
| :------- | :-------- |
| opschain.local.gd | `api.hostName`, `env.OPSCHAIN_API_HOST_NAME` |
| opschain-image-registry.local.gd | `env.OPSCHAIN_IMAGE_REGISTRY_HOST`, `trow.trow.domain`, `trow.ingress.tls[0].hosts[0]`, `trow.ingress.hosts[0].host` |
| opschain-vault.local.gd | `global.secretVaultExternalHostName` |

:::warning[These hostnames need an explicit hosts file entry]
These certificates assume `*.local.gd` hostnames resolve to `127.0.0.1`, but that is not guaranteed — `local.gd`'s DNS is controlled by a third party outside LimePoint and does not currently resolve any `*.local.gd` subdomain. Add an explicit entry for each hostname you use to the server's hosts file, for example:

```bash
echo "127.0.0.1 opschain.local.gd" >> /etc/hosts
echo "127.0.0.1 opschain-image-registry.local.gd" >> /etc/hosts
echo "127.0.0.1 opschain-vault.local.gd" >> /etc/hosts
```

:::

Besides the hostname, you must also configure the secret name for the image registry certificate in your `values.yaml` file, in the `trow.ingress.tls[0].secretName` setting. Below is a subset example of how you should configure your `values.yaml` file when using all of these certificates:

```yaml
useCertManager: false

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

Once the certificates are downloaded, you can install all of them, or install them individually and [bring your own certificate](#bringing-your-own-certificates) for the rest.

### Installing all certificates

To install all the certificates and the CA issuer certificate, run the following command:

```bash
for cert in *.json; do kubectl apply -f "${cert}"; done
```

### Installing individual certificates

Install the CA issuer certificate first:

```bash
kubectl apply -f opschain-ca-key-pair.json
```

Install it even if you only use one of the certificates below. OpsChain reads the certificate authority from this secret when it starts and adds it to its [trust store](/setup/configuration/tls/index.md#trusting-additional-certificate-authorities), which is what makes it trust the services presenting the certificates it signed.

Then install the file for each service you want to use a provided certificate for. For example, for the API:

```bash
kubectl apply -f opschain-api-cert.json
```

Every service needs a certificate from one source or the other. With `cert-manager` turned off nothing issues one for a service you skip here, so supply your own for each of the remaining services.

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
| OpsChain secret vault, inside the cluster | `secretVault.internalCertificateSecretName` |
| OpsChain secret vault, at its external hostname | `secretVault.externalCertificateSecretName` |

:::info
When a certificate secret name is configured, `cert-manager` will NOT manage that certificate for the corresponding service.
:::

:::note[Two of these secrets hold more than a certificate and a key]
The build service and the secret vault's internal certificate both need the issuing CA's certificate in the secret as well, so they are created with `kubectl create secret generic` rather than `kubectl create secret tls`. Read [build service certificate](#build-service-certificate) and [secret vault internal certificate](#secret-vault-internal-certificate) before creating either of them.
:::

:::note[Restarting services after updating a certificate]
Updating one of these secrets later - for example, to rotate a certificate before it expires - doesn't necessarily take effect immediately. Some services only read their certificate from disk once, when they start. See [restarting services after renewing a leaf certificate](/setup/configuration/tls/cert-manager.md#restarting-services-after-renewing-a-leaf-certificate) for which services need a manual restart and which pick up the change automatically.
:::

The DNS `subjectAlternativeName` used in your certificates must follow the hostname configuration rules, as described in the [hostname configuration](setup/configuration/tls/index.md#hostname-configuration) section and properly configured in the `values.yaml` file.

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
  OPSCHAIN_API_HOST_NAME: #api-hostname
  OPSCHAIN_IMAGE_REGISTRY_HOST: #image-registry-hostname
```

:::warning
This sample `values.yaml` is not complete and is not usable as shown.
:::

### Turning `cert-manager` off entirely

You do not have to disable `cert-manager` to bring your own certificate for a service - naming that service's certificate secret is enough. To stop it managing any certificate at all, set `useCertManager` to `false` in your `values.yaml` file:

```yaml
useCertManager: false
```

This also stops OpsChain creating its own certificate authority, so nothing issues a certificate for a service you have not named a secret for. Supply a certificate for every service in the table above. OpsChain creates no `cert-manager` resources at all with this set, so `cert-manager` does not need to be installed in your cluster.

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

:::tip[Combining certificate and private key into a single file]
You can combine the certificate and private key into a single file by running the following command:

```bash
cat tls.crt tls.key > tls-combined.pem
```

:::

When overriding the secret vault internal certificate (`internalCertificateSecretName`), you must ensure that all the existing volumes in `.openbao.server.volumes` are still specified in addition to your modifications, otherwise the volume won't be created and your vault won't be able to start.

If you issue the secret vault's [external certificate](/setup/configuration/tls/index.md#secret-vault-hostname) from a different authority to the internal one, OpsChain has to trust both - see [trusting additional certificate authorities](/setup/configuration/tls/index.md#trusting-additional-certificate-authorities). The API contacts the vault as it starts, so supply that authority in your `values.yaml` file rather than uploading it afterwards.

:::info[Default volume configuration]
Use `helm show values oci://docker.io/limepoint/opschain --version ${OPSCHAIN_CHART_VERSION} --jsonpath '{.openbao.server.volumes}'` to show the default values, and provide it as `.openbao.server.volumes` with the `secretName` modified.
:::

## Trusting your CA on the OpsChain host

The certificate authorities that issued your certificates must be trusted by the host running OpsChain because OpsChain will access its image registry via the Kong Ingress proxy load balancer. This is the host's own trust store, and is separate from the [certificate authorities OpsChain trusts](/setup/configuration/tls/index.md#trusting-additional-certificate-authorities) inside its containers - an enterprise authority usually has to be added to both. Follow your host's OS process for trusting certificates and then, if using K3s, restart it for changes to take effect. You can restart K3s by running the following command:

```bash
systemctl restart k3s
```

## What to do next

- With your certificates configured, proceed to the [additional OpsChain settings guide](/setup/configuration/additional-settings.md) to finish configuring OpsChain.
