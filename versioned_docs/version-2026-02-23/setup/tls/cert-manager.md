---
sidebar_position: 2
description: How to configure cert-manager for managing OpsChain certificates for TLS/HTTPS connectivity
---

# Automated certificate management

One of the options for configuring TLS/HTTPS connectivity for OpsChain is to use [`cert-manager`](https://cert-manager.io) to automatically manage the certificates for you.

This guide walks you through setting up `cert-manager` and the considerations you should be aware of when using it.

## Considerations

By default, when using `cert-manager`, a certificate authority (CA) will be created and used to sign the certificates used by OpsChain. Alternatively, `cert-manager` can be configured to issue certificates from an external certificate authority (e.g. Let's Encrypt, Vault, Venafi) - see the [cert-manager documentation](https://cert-manager.io/docs/) for more information.

Whichever CA is used, its certificate will need to be trusted by the container runtime on your Kubernetes nodes, and by any systems from which you will access the OpsChain API, UI and secret vault (if you use `cert-manager` to manage these certificates). This can be done after installing OpsChain, as described in the [trusting the CA certificate](setup/tls/cert-manager.md#trusting-the-ca-certificate---post-installation) section.

## Installation

:::warning Ensure Helm is installed
Please ensure you have installed and validated Helm as described in the [installing K3s](/setup/installing_k3s.md#download-helm) guide.
:::

You can easily install `cert-manager` in your Kubernetes cluster using Helm. This will install the `cert-manager` CRDs and the `cert-manager` controller in the `cert-manager` namespace.

```bash
helm upgrade --install cert-manager oci://quay.io/jetstack/charts/cert-manager --namespace cert-manager --create-namespace --version v1.16.1 --set "crds.enabled=true" --set "featureGates=AdditionalCertificateOutputFormats=true" --set "webhook.extraArgs={--feature-gates=AdditionalCertificateOutputFormats=true}"
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

By default, OpsChain relies on `cert-manager` to manage all of its certificates, but you can still [configure which hostnames you want to use](setup/tls/introduction.md#hostname-configuration) for each service and `cert-manager` will issue the appropriate certificates matching these hostnames.

:::tip
Once OpsChain is installed, `cert-manager` will automatically create the CA and use it to issue the certificates for the services it manages.
:::

There is no additional configuration required pre-installation if you're using `cert-manager` to manage all of your certificates. However, if you opted to provide your own certificates for some components, refer to the [manual certificate management guide](setup/tls/manual-cert-management.md) to configure these certificates before installing OpsChain.

## Trusting the CA certificate - post installation

After installing OpsChain with `cert-manager`, you will need to trust the CA certificate on each client machine and in the one where OpsChain is hosted in order to access the OpsChain API, UI and secret vault via HTTPS.

Once OpsChain is installed, you can extract the CA certificate created by `cert-manager` from the `opschain-ca-key-pair` secret by running the following command:

```bash
kubectl -n ${KUBERNETES_NAMESPACE} get secret opschain-ca-key-pair -o jsonpath="{.data.ca\.crt}" | base64 -d > opschain-ca.pem
```

Each platform has a different way of trusting a certificate. Follow your platform's documentation to trust the certificate so you're able to access the OpsChain API, UI and secret vault via HTTPS.

## What to do next

- Proceed with the [configuring OpsChain guide](/setup/understanding-opschain-variables.md) to finish configuring OpsChain.
