---
sidebar_position: 2
description: How to configure cert-manager for managing OpsChain certificates for TLS/HTTPS connectivity
---

# Automated certificate management

One of the options for configuring TLS/HTTPS connectivity for OpsChain is to use [`cert-manager`](https://cert-manager.io) to automatically manage the certificates for you.

This guide walks you through setting up `cert-manager` and the considerations you should be aware of when using it.

## Considerations

By default, when using `cert-manager`, a certificate authority (CA) will be created and used to sign the certificates used by OpsChain. Alternatively, `cert-manager` can be configured to issue certificates from an external certificate authority (e.g. Let's Encrypt, Vault, Venafi) - see the [cert-manager documentation](https://cert-manager.io/docs/) for more information.

Whichever CA is used, its certificate will need to be trusted by the container runtime on your Kubernetes nodes, and by any systems from which you will access the OpsChain API, UI and secret vault (if you use `cert-manager` to manage these certificates). This can be done after installing OpsChain, as described in the [trusting the CA certificate](setup/configuration/tls/cert-manager.md#trusting-the-ca-certificate---post-installation) section.

## Installation

:::warning[Ensure Helm is installed]
Please ensure you have installed and validated Helm as described in the [installing K3s](/setup/installing_k3s.md#download-helm) guide.
:::

You can easily install `cert-manager` in your Kubernetes cluster using Helm. This will install the `cert-manager` CRDs and the `cert-manager` controller in the `cert-manager` namespace.

```bash
helm upgrade --install cert-manager oci://quay.io/jetstack/charts/cert-manager --namespace cert-manager --create-namespace --version v1.20.2 --set "crds.enabled=true" --set "featureGates=AdditionalCertificateOutputFormats=true" --set "webhook.extraArgs={--feature-gates=AdditionalCertificateOutputFormats=true}"
```

Verify that the `cert-manager` controller is running:

```bash
kubectl get pods -n cert-manager
```

You should see the `cert-manager` pods running.

```bash
NAME                                      READY   STATUS    RESTARTS   AGE
cert-manager-574b55f49b-7845v             1/1     Running   0          10m
cert-manager-cainjector-5d69f57b7-h57jg   1/1     Running   0          10m
cert-manager-webhook-6b7d7f6f5-d6fjw      1/1     Running   0          10m
```

## Configuration

By default, OpsChain relies on `cert-manager` to manage all of its certificates, but you can still [configure which hostnames you want to use](setup/configuration/tls/index.md#hostname-configuration) for each service and `cert-manager` will issue the appropriate certificates matching these hostnames.

:::tip
Once OpsChain is installed, `cert-manager` will automatically create the CA and use it to issue the certificates for the services it manages.
:::

There is no additional configuration required pre-installation if you're using `cert-manager` to manage all of your certificates. However, if you opted to provide your own certificates for some components, refer to the [manual certificate management guide](setup/configuration/tls/manual-cert-management.md) to configure these certificates before installing OpsChain.

## Trusting the CA certificate - post installation

After installing OpsChain with `cert-manager`, you will need to trust the CA certificate on each client machine and in the one where OpsChain is hosted in order to access the OpsChain API, UI and secret vault via HTTPS.

Once OpsChain is installed, you can extract the CA certificate created by `cert-manager` from the `opschain-ca-key-pair` secret by running the following command:

```bash
kubectl -n ${KUBERNETES_NAMESPACE} get secret opschain-ca-key-pair -o jsonpath="{.data.ca\.crt}" | base64 -d > opschain-ca.pem
```

Each platform has a different way of trusting a certificate. Follow your platform's documentation to trust the certificate so you're able to access the OpsChain API, UI and secret vault via HTTPS.

## Forcing certificate renewal

`cert-manager` automatically renews each certificate before it expires - by default, once two-thirds of its validity period (`duration`) has elapsed. `opschain-ca` and the certificates it issues are all configured with a 10 year `duration`, so this happens rarely. If you need to force a renewal sooner - for example, immediately after an upgrade that changes a certificate's `duration`, or if a certificate needs to be replaced - OpsChain does not install the [`cmctl`](https://cert-manager.io/docs/reference/cmctl/) CLI, so rather than `cmctl renew`, trigger a renewal by deleting the Kubernetes secret backing the certificate. `cert-manager` detects that the secret is missing and reissues it immediately.

You can check a certificate's current status, including its expiry and next scheduled renewal, at any time:

```bash
kubectl -n ${KUBERNETES_NAMESPACE} describe cert opschain-ca
```

### Renewing the CA

```bash
kubectl -n ${KUBERNETES_NAMESPACE} delete secret opschain-ca-key-pair
```

Wait for `cert-manager` to reissue it before continuing:

```bash
kubectl -n ${KUBERNETES_NAMESPACE} get certificate opschain-ca -w
```

Once it shows `READY  True`, re-extract and re-trust the CA certificate as described in [trusting the CA certificate](#trusting-the-ca-certificate---post-installation) above, and if you use K3s, follow the [K3s registry trust](setup/setup-instance.md#setup-the-custom-ca) steps to pick up the change there too.

:::warning[Renew the CA before its leaf certificates]
If you're also renewing the certificates the CA issues (below), always renew the CA first and wait for it to finish before renewing any of the others. Each leaf certificate is signed using whatever is currently in the `opschain-ca-key-pair` secret at the moment it's reissued - renewing a leaf certificate before the CA has finished rotating just signs it with the CA that's about to be replaced, and it will need to be renewed again afterwards. If this happens, there's no lasting harm - once the CA has finished rotating, just delete that leaf certificate's secret again to reissue it correctly.
:::

### Renewing the leaf certificates

Each certificate `cert-manager` issues for OpsChain's services is stored in a secret of the same name: `opschain-api-cert`, `opschain-image-registry-cert`, `opschain-secret-vault-external-cert`, `opschain-secret-vault-cert`, and `opschain-build-service-cert`. Force any of them to be renewed the same way:

```bash
kubectl -n ${KUBERNETES_NAMESPACE} delete secret opschain-api-cert opschain-image-registry-cert opschain-secret-vault-external-cert opschain-secret-vault-cert opschain-build-service-cert
```

Wait for all of them to show `READY  True` before continuing:

```bash
kubectl -n ${KUBERNETES_NAMESPACE} get certificates.cert-manager.io
```

### Restarting services after renewing a leaf certificate

Renewing a certificate updates its Kubernetes secret, but not every service notices the change on its own:

- The API, secret vault UI, and image registry are all served through the Kong ingress, which watches its certificate secrets directly and reloads them automatically - no restart needed.
- The build service reads its certificate from disk once, when it starts, and nothing rolls it for you, so renewing `opschain-build-service-cert` needs a manual restart to take effect:

  ```bash
  kubectl -n ${KUBERNETES_NAMESPACE} rollout restart deployment/opschain-build-service
  ```

- The secret vault also reads its certificate from disk once per pod, but it picks up a renewed `opschain-secret-vault-cert` or `opschain-secret-vault-external-cert` on its own - a change to either secret is detected automatically and the vault's pods are rolled within a few minutes, one at a time, so no manual action is required. If you want the renewed certificate to take effect straight away rather than waiting, you can roll every replica yourself:

  ```bash
  kubectl -n ${KUBERNETES_NAMESPACE} delete pod -l app.kubernetes.io/name=openbao
  ```

  :::info
  The secret vault runs as a multi-replica `StatefulSet` whose pods are only replaced when deleted, not restarted via a rollout. Rolling the pods to pick up a renewed certificate therefore happens by deleting them, which OpsChain does automatically after the certificate changes; deleting them by label yourself simply rolls every replica at once instead of waiting.
  :::

- After renewing `opschain-secret-vault-cert` or `opschain-secret-vault-external-cert`, also restart the API so it stops using its existing connection to the secret vault:

  ```bash
  kubectl -n ${KUBERNETES_NAMESPACE} rollout restart deployment/opschain-api deployment/opschain-api-worker
  ```

## What to do next

- Proceed to the [additional OpsChain settings guide](/setup/configuration/additional-settings.md) to finish configuring OpsChain.
