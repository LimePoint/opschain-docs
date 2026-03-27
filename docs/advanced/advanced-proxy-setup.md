---
sidebar_position: 7
title: Advanced proxy setup
---

# Advanced proxy setup

This section covers the configuration required when running OpsChain on a k3s cluster behind a restrictive proxy such as [cntlm](https://cntlm.sourceforge.net/), which acts as a forwarder to an upstream corporate proxy.

## Background

cntlm is configured to listen exclusively on `127.0.0.1` and rejects any connections not originating from that address. This works fine when running `helm` commands directly on the host (where you can set `http_proxy` on the command line), but breaks down for workloads running inside the k3s pod network. From within a pod, `127.0.0.1` resolves to the pod's own loopback interface, not the host so cntlm rejects the connection.

## Solution overview

The solution is to deploy a `socat` bridge as a DaemonSet inside the cluster. socat runs in the host network namespace, so when it connects to `127.0.0.1:4125`, cntlm sees the source as `127.0.0.1` and accepts it. A Kubernetes Service and Endpoints object are then used to give pods a stable DNS name to target.

> **This step must be performed after k3s is installed and before running the OpsChain install.**

## Traffic flow

```text
POD (10.42.x.x)
 │
 │  http_proxy=http://cntlm-proxy.default.svc.cluster.local:4125
 │
 ▼
cntlm-proxy:4125                           (Kubernetes Service - ClusterIP)
 │
 │  kube-proxy DNAT: ClusterIP → host gateway
 │
 ▼
10.42.0.1:4126                             (host, flannel bridge interface)
 │
 │  socat listening on 0.0.0.0:4126
 │  accepts connection from pod
 │  opens NEW connection to 127.0.0.1:4125
 │
 ▼
127.0.0.1:4125                             (cntlm, host loopback)
 │  source IP = 127.0.0.1
 │  cntlm accepts connection
 │
 ▼
upstream proxy / internet                  (external network)
```

---

## Step 1 — Deploy the socat DaemonSet

Create `socat-proxy-forwarder.yaml`:

```yaml
# socat-proxy-forwarder.yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: host-proxy-forwarder
  namespace: kube-system
spec:
  selector:
    matchLabels:
      app: host-proxy-forwarder
  template:
    metadata:
      labels:
        app: host-proxy-forwarder
    spec:
      hostNetwork: true
      tolerations:
        - operator: Exists
      containers:
        - name: socat
          image: alpine/socat
          command:
            - socat
            - TCP-LISTEN:4126,fork,reuseaddr,bind=0.0.0.0
            - TCP:127.0.0.1:4125
          securityContext:
            privileged: true
```

Apply it:

```bash
kubectl apply -f socat-proxy-forwarder.yaml
```

---

## Step 2 — Deploy the Kubernetes Service and Endpoints

Create `cntlm-proxy-service.yaml`:

```yaml
# cntlm-proxy-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: cntlm-proxy
  namespace: default
spec:
  ports:
    - port: 4125
      targetPort: 4125
---
apiVersion: v1
kind: Endpoints
metadata:
  name: cntlm-proxy
  namespace: default
subsets:
  - addresses:
      - ip: 10.42.0.1       # host flannel bridge IP — adjust if your cluster CIDR differs
    ports:
      - port: 4126           # socat port, not cntlm's port
```

Apply it:

```bash
kubectl apply -f cntlm-proxy-service.yaml
```

---

## Step 3 — Validate the Setup

```bash
# Check the DaemonSet is running
kubectl get daemonset host-proxy-forwarder -n kube-system

# Check the socat pod is running
kubectl get pods -n kube-system -l app=host-proxy-forwarder

# Check socat pod logs for any errors
kubectl logs -n kube-system -l app=host-proxy-forwarder

# Verify the Service and Endpoints are linked
kubectl get svc cntlm-proxy
kubectl get endpoints cntlm-proxy

# Confirm the correct IP and port on the Endpoint
kubectl describe endpoints cntlm-proxy
```

---

## Step 4 — Update OpsChain Deployment Specs

### Determine the no_proxy service list

Run the following to get a comma-separated list of all OpsChain services:

```bash
kubectl -n opschain get svc | awk 'NR>1 {print $1}' | paste -sd','
```

This will output something like:

```text
opschain-api,opschain-build-service,opschain-db-rw,opschain-image-registry,opschain-ingress-proxy,opschain-ingress-validation-webhook,opschain-ldap,opschain-log-aggregator,opschain-mintmodel-api,opschain-mintmodel-steps-api
```

> **Why this is needed:** The `no_proxy` variable matches against the raw hostname before DNS resolution. Bare hostnames like `opschain-image-registry` do not match wildcard entries like `.svc.cluster.local`, so they must be listed explicitly.

### Add proxy environment variables to deployment specs

Add the following environment variables to each OpsChain deployment, substituting the `no_proxy` values with the output from the command above:

```yaml
env:
  - name: HTTP_PROXY
    value: "http://cntlm-proxy.default.svc.cluster.local:4125"
  - name: HTTPS_PROXY
    value: "http://cntlm-proxy.default.svc.cluster.local:4125"
  - name: NO_PROXY
    value: "localhost,127.0.0.1,10.42.0.0/16,10.43.0.0/16,.svc.cluster.local,.cluster.local,opschain-api,opschain-build-service,opschain-db-rw,opschain-image-registry,opschain-ingress-proxy,opschain-ingress-validation-webhook,opschain-ldap,opschain-log-aggregator,opschain-mintmodel-api,opschain-mintmodel-steps-api"
  - name: http_proxy
    value: "http://cntlm-proxy.default.svc.cluster.local:4125"
  - name: https_proxy
    value: "http://cntlm-proxy.default.svc.cluster.local:4125"
  - name: no_proxy
    value: "localhost,127.0.0.1,10.42.0.0/16,10.43.0.0/16,.svc.cluster.local,.cluster.local,opschain-api,opschain-build-service,opschain-db-rw,opschain-image-registry,opschain-ingress-proxy,opschain-ingress-validation-webhook,opschain-ldap,opschain-log-aggregator,opschain-mintmodel-api,opschain-mintmodel-steps-api"
```

> Both uppercase and lowercase variants are set as different tools and runtimes read one or the other.
