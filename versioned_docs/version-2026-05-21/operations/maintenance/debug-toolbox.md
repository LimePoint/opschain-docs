---
sidebar_position: 2
description: A collection of tools to help with debugging and troubleshooting OpsChain.
---

# Debug toolbox

To help with the process of debugging and troubleshooting OpsChain, a Docker image containing a collection of useful tools is provided for your use. This guide will show you the different ways to use this toolbox and how to configure it.

## Image

The image provided by OpsChain is a minimal AlmaLinux-based image that contains a collection of networking, scripting and system tools. This image is used to create the Kubernetes deployment and sidecars, but can also be used as a debug container for any individual pod, allowing you to verify processes within the pod are working as expected.

To configure which image is used for all forms of debugging described in this guide, you can set the `debugToolbox.image` setting in your `values.yaml` file. The default image is `limepoint/opschain-debug-toolbox:<OPSCHAIN_VERSION>`, where `<OPSCHAIN_VERSION>` is the value defined in the `.env` section of your `values.yaml` file.

### As a debug container

To use the image as a debug container to within a specific pod, for example, you can run the following commands:

```bash
# Identify the pod you want to debug - in this case the API pod
api_pod=$(kubectl get pods -n ${KUBERNETES_NAMESPACE} -l app=opschain-api -o jsonpath='{.items[0].metadata.name}')
```

Then create an ephemeral debug container attached to the pod, targeting the `opschain-api` container:

```bash
kubectl -n ${KUBERNETES_NAMESPACE} debug pod/${api_pod} --image=limepoint/opschain-debug-toolbox:<OPSCHAIN_VERSION> --target=opschain-api -it -- bash
```

With this approach, the container you'll be dropped into will share the process namespace of the `opschain-api` container, allowing you to inspect and signal its internal processes.

:::tip Identifying containers
To identify the containers within a pod, you can use the following command:

```bash
kubectl -n ${KUBERNETES_NAMESPACE} get pod/<pod_name> -o jsonpath='{.spec.containers[*].name}'
```

:::

:::info Limitations
Although the debug container is running within the same pod as the `opschain-api` container, it will not have access to the container's image layers, filesystem and environment variables.
:::

## Deployment

OpsChain also provides a Kubernetes deployment that can be enabled and will run within the same Kubernetes namespace as the OpsChain services. To enable this deployment, modify your `values.yaml` file and set the `debugToolbox.enabled` setting to `true`:

```yaml
debugToolbox:
  enabled: true
```

When enabled, every time you deploy OpsChain, a deployment named `opschain-debug-toolbox` will be created or updated, which will instantiate a Kubernetes pod with the debug image.

:::tip Environment variables
The deployment pods will have its environment variables sourced from the `opschain-config` config map - just like most other OpsChain deployments.
:::

### Using the deployment

To make use of the debug deployment, you can execute into the pod and use the tools available to you. For example:

```bash
kubectl exec -n ${KUBERNETES_NAMESPACE} deploy/opschain-debug-toolbox -it -- bash
```

```bash
# Verify DNS resolution
dig opschain-api
nslookup opschain-db-rw

# Connectivity checks
ncat -vz opschain-api 3000
ncat -vz opschain-db-rw 5432
ncat -vz opschain-build-service 50000

# TLS certificate inspection
openssl s_client -connect opschain-api:3000 -servername opschain-api </dev/null
openssl s_client -connect opschain-db-rw:5432 -starttls postgres </dev/null
```

:::info Limitations
Although the deployment pod will have the same environment variables as the OpsChain API, they will not have access to any other service's image layers, filesystem or process namespaces.
:::

## Sidecar

Alternatively, you can mount a sidecar container to most OpsChain services. When mounting to a service, the sidecar will be instantiated with the same volumes as the service, making it easier to debug and verify the service has the correct files and configuration.

To enable the sidecar in a service, modify your `values.yaml` file and set the `debugSidecar` setting within the specific services' settings to `true`. For example, to toggle the sidecar on for the API service, your `values.yaml` would have something like the following:

```yaml
api:
  # ... other settings
  debugSidecar: true
```

Once you deploy OpsChain with these changes, you can execute into the sidecar and use the tools available to you. For example:

```bash
kubectl exec -n ${KUBERNETES_NAMESPACE} deploy/opschain-api -c debug-toolbox -it -- bash
```

:::tip Environment variables
The sidecar containers will have the same environment variables as the OpsChain API.
:::

:::info Limitations
Although the sidecar containers will have the same environment variables as the OpsChain API in this example, they will not share the application container's process namespace or its root filesystem from the service image. Paths that are mounted into the pod and shared with the service (as described above) are available in the sidecar; other files from the application image are not.

The database, image registry and the OpsChain secret vault services do not support this sidecar. To debug these services more thoroughly, you can use the [debug deployment](#deployment) or the [image as a debug container](#image) instead.
:::

## Security risks

It is important to note that the methods described above should be used with caution and for debugging purposes only. Leaving the debug containers or sidecars running unattended for extended periods of time is not recommended and may cause performance issues or security vulnerabilities. Once debugging is complete, redeploy OpsChain without the deployment and the attached sidecars.
