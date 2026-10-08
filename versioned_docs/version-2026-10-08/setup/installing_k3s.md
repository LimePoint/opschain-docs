---
sidebar_position: 2
description: Steps to install self hosted K3s
---

# K3s installation guide

This guide takes you through steps for installing self hosted K3s platform in order to host OpsChain.

## Linux Certification

K3s for OpsChain is tested and supported on RHEL/OEL/AlmaLinux 9.x on a VM.

## Access to software media and licence

You must have acquired a license from LimePoint before you begin to install. If you don't have one, please reach out to your account manager or drop a note on support@limepoint.com. As part of license acquisition you would also get credentials to download the installers.

You must have access to the following URLs from your VM network either directly or via a proxy.

- [https://hub.docker.com/](https://hub.docker.com/)
- [https://get.k3s.io/](https://get.k3s.io/)
- [https://charts.jetstack.io/](https://charts.jetstack.io/)
- [https://raw.githubusercontent.com/](https://raw.githubusercontent.com/)
- [https://kubernetes.github.io/](https://kubernetes.github.io/)
- [https://quay.io/](https://quay.io/) — cert-manager, if you use it for certificates
- [https://docs.opschain.io/](https://docs.opschain.io/) — the sample `values.yaml` and certificate files

## Infrastructure requirements

The infrastructure requirements include the minimum configuration required for K3s along with the requirements for OpsChain and the amount of memory the server must be able to hold for your workload.

OpsChain's memory requirement is not driven by how many changes you submit. What the server must be able to hold is how many pods of each kind may run at once multiplied by the memory limit of those pods, plus what OpsChain's own always-on components reserve and what the node itself needs:

```text
  runner_limit                  x change_worker / step_runner memory limit
+ refresh_limit                 x generate_actions memory limit
+ mintmodel_limit               x mintmodel_api memory limit
+ agent_limit                   x agent memory limit
+ the always-on component requests
+ node overhead
```

How many of each run at once is set by the [concurrency limits](/key-concepts/settings.md#runner-pod-concurrency-and-limit-settings), and how much each may use by [`pod_templates.<pod type>.resources`](/key-concepts/settings.md#pod_templatespod-typeresources). Work beyond a concurrency limit queues rather than failing, so these settings decide how much parallel work the server can carry, not whether OpsChain runs.

### Minimum requirements

The smallest server OpsChain supports runs two changes at a time, alongside two action refreshes, one MintModel concretisation and one agent. Each pod is given 512Mi of memory, except MintModel concretisation, which keeps its 2Gi:

| | Concurrency | Per-pod limit | Total |
| :--- | :---: | :---: | ---: |
| Runner (change and step pods) | 2 | 512Mi | 1 GiB |
| Actions refresh | 2 | 512Mi | 1 GiB |
| MintModel concretisation | 1 | 2Gi | 2 GiB |
| Agents | 1 | 512Mi | 0.5 GiB |
| Always-on components | — | — | 6.1 GiB |
| Node overhead — operating system, kernel, K3s | — | — | 4.5 GiB |
| **Total** | | | **15.1 GiB** |

:::tip[Fixed requirements]
The always-on row is what OpsChain's components request with the chart's defaults. See [sizing OpsChain's components](/operations/component-resources.md) for more information.

The node overhead row is memory kept back for the server itself, which OpsChain is not allowed to use, and it is held back by [reserving resources for the node](#reserving-resources-for-the-node). Everything above it has to fit in what remains.
:::

| Memory (GB) | CPU | Storage (GB) |
| :---: | :---: | ---: |
| 16 | 4 | 100 |

At this size a third change waits until one of the first two finishes. OpsChain's own runner processes use around 130Mi, so 512Mi leaves room for actions that run scripts and command line tools. An action that loads more, such as a large Terraform plan or a full application build, needs a higher limit.

:::note[These are not the default settings]
A fresh installation ships with higher limits, described under [default requirements](#default-requirements). To run within the minimum, change these settings in the system configuration page after installing OpsChain.

- [`concurrent.runner_limit`](/key-concepts/settings.md#concurrentrunner_limit) set to `2`, [`concurrent.mintmodel_limit`](/key-concepts/settings.md#concurrentmintmodel_limit) to `1` and [`concurrent.agent_limit`](/key-concepts/settings.md#concurrentagent_limit) to `1` — [`concurrent.refresh_limit`](/key-concepts/settings.md#concurrentrefresh_limit) already defaults to `2`
- [`pod_templates.<pod type>.resources`](/key-concepts/settings.md#pod_templatespod-typeresources) memory limit set to `512Mi` for `change_worker`, `step_runner`, `generate_actions` and `agent`

Until they are changed, OpsChain records a `warn:resource_budget:exceeds_node_capacity` event, because the default settings require more memory than the server has available.
:::

### Running more work at the same time

The minimum server runs two changes at a time. To run more at once, add memory to the server for each extra one, then, once OpsChain is installed, raise the matching setting on the system configuration page:

| To run one more at the same time | Extra memory | Setting to raise |
| :--- | ---: | :--- |
| Change | 512 MiB | [`concurrent.runner_limit`](/key-concepts/settings.md#concurrentrunner_limit) |
| Action refresh | 512 MiB | [`concurrent.refresh_limit`](/key-concepts/settings.md#concurrentrefresh_limit) |
| MintModel concretisation | 2 GiB | [`concurrent.mintmodel_limit`](/key-concepts/settings.md#concurrentmintmodel_limit) |
| Agent | 512 MiB | [`concurrent.agent_limit`](/key-concepts/settings.md#concurrentagent_limit) |

For example, to run six changes at once instead of two, set `concurrent.runner_limit` to `6` and give the server 4 × 512 MiB = 2 GiB more memory: 17.1 GiB in total.

These figures assume each change keeps the 512 MiB it has in the minimum. With the default settings each change may use up to 4 GiB, so each extra one needs 4 GiB more memory — see [default requirements](#default-requirements).

If the server is short of memory, run fewer things at once rather than giving each one less memory. Work beyond the limit waits its turn and then runs, but a change that runs out of memory may fail during execution.

### Default requirements

A new installation ships with these limits, which are also what we recommend for a production instance:

| | [Concurrency](/key-concepts/settings.md#runner-pod-concurrency-and-limit-settings) | [Per-pod limit](/key-concepts/settings.md#pod_templatespod-typeresources) | Total |
| :--- | :---: | :---: | ---: |
| Runner (change and step pods) | 6 | 4Gi | 24 GiB |
| Actions refresh | 2 | 4Gi | 8 GiB |
| MintModel concretisation | 5 | 2Gi | 10 GiB |
| Agents | 5 | 4Gi | 20 GiB |
| Always-on components | — | — | 6.1 GiB |
| Node overhead — operating system, kernel, K3s | — | — | 4.5 GiB |
| **Total** | | | **72.6 GiB** |

| Memory (GB) | CPU | Storage (GB) |
| :---: | :---: | ---: |
| 96 | 16 | 100 |

This is the figure at which every pool can be saturated at once without the node running short, which is what a production instance has to survive rather than what it usually runs. The MintModel and agent rows are only reached if you use those features and can be zeroed out if you do not. Lowering [`concurrent.mintmodel_limit`](/key-concepts/settings.md#concurrentmintmodel_limit) or [`concurrent.agent_limit`](/key-concepts/settings.md#concurrentagent_limit), respectively, reclaims their share. The 72.6 GiB total is rounded up to 96 GB, the next common server size, which also leaves room for the server's own file cache.

The storage must be available to the filesystem holding `/limepoint`, where K3s keeps all of OpsChain's data (see [directory setup](#directory-setup)). You can add more storage if you intend to save logs for longer within OpsChain. We recommend externalizing logs to Splunk or a file system for better management.

### PV capacity is not enforced

:::warning[PV capacity is not enforced]
K3s's default storage class, `local-path` ([Rancher's local-path-provisioner](https://github.com/rancher/local-path-provisioner)), does not enforce the capacity you request for a persistent volume — a volume can grow past its requested size with no error or rejected write. Size `/limepoint` with headroom above the figures in the table above, and monitor actual on-disk usage under `/limepoint/k3s/storage` (for example with `du -sh`) rather than treating a PVC's requested size as a hard cap.

This is an upstream limitation of local-path-provisioner, not something OpsChain configures. If your node's filesystem is XFS (mounted with the `prjquota` option), you can enforce a hard limit yourself with an XFS project quota against the PV's backing directory, for example:

```bash
# Cap a single PV's backing directory to 10G using an XFS project quota
# (requires the filesystem under /limepoint to be XFS, mounted with `prjquota`)
echo "100:/limepoint/k3s/storage/<pv-directory>" >> /etc/projects
echo "opschain-pv:100" >> /etc/projid
xfs_quota -x -c 'project -s opschain-pv' /limepoint
xfs_quota -x -c 'limit -p bhard=10g opschain-pv' /limepoint
```

This is the same mechanism Kubernetes itself uses to enforce `emptyDir`/ephemeral-storage limits — it isn't wired into local-path-provisioner, so it has to be applied manually against the PV's backing directory.

If you'd rather have capacity enforced by the storage class itself, see the [Longhorn storage](/advanced/longhorn-storage.md) guide.
:::

:::warning[Kernel version]
To support native rootless image builds, you must have a Kernel version newer than 5.11. In systems older than 5.11, you can have rootless image builds by enabling the [FUSE device plugin](/setup/configuration/additional-settings.md#fusedevicepluginenabled) in the settings.

More details are provided later in the [image build settings](/setup/configuration/additional-settings.md#image-building-settings) documentation.
:::

## Supported platforms

OpsChain needs a container platform to run. It can be deployed on any of the following container platforms:

- Azure Kubernetes Services (AKS)
- Elastic Kubernetes Services (EKS)
- OpenShift Container Platform
- Self hosted Kubernetes (k8s or k3s) either on bare metal or a VM

These guides document one of them: a self hosted K3s cluster on a VM, running containers through the containerd runtime that K3s bundles. Every host path, command and configuration file from here on assumes that setup — the `/limepoint` data directory, the `crictl` and `ctr` aliases, and the [node-level image cleanup settings](/operations/maintenance/container-image-cleanup.md#host-side-image-cleanup) among them. Installing OpsChain itself is the same on any of the platforms above; only these host-level steps differ.

### Privilege model

OpsChain itself does not require root. The only privileged steps are host-level tasks needed to install and run K3s. To support enterprise environments that prohibit unrestricted (`NOPASSWD:ALL`) sudo, this guide splits the work into two phases:

- **Host provisioning (performed once as root, or by your platform team)** — creating the installation user, applying kernel/ulimit settings, creating the data directories, configuring the firewall, and installing K3s and Helm. These are described in the [host provisioning](#host-provisioning) section below.
- **Installation and operation (performed by the unprivileged `opschain` user)** — everything from [installing OpsChain](/setup/installation.md) onwards uses only `helm`, `kubectl` and the OpsChain CLI against the cluster's kubeconfig, and needs **no sudo at all**.

A small number of ongoing operations (restarting the K3s service, reloading the firewall, inspecting containers) still require root. Rather than granting blanket sudo, grant the installation user a **scoped sudoers allowlist** covering only those commands (see [scoped sudo for the installation user](#scoped-sudo-for-the-installation-user)).

:::tip[Managed Kubernetes]
If you are deploying onto a managed Kubernetes platform (AKS, EKS, OpenShift) instead of self-hosted K3s, this entire host-provisioning phase does not apply — there is no host sudo requirement at all. You only need Helm and `kubectl` with permission to install the chart and the CNPG operator. Skip to the [configuration guide](/setup/configuration/index.md).
:::

## Host provisioning

The commands in this section must be run as `root` (or by your platform team during VM provisioning). Once they are complete, all remaining steps are performed by the unprivileged installation user.

### Installation user

Create a user named `opschain` on the Linux VM. The user does not need to be called `opschain`, it can be whatever name you want. For the purpose of this guide, we will assume the Linux user is `opschain`. If you decide to use any other username, please replace all occurrences of the `opschain` user in this guide to the name of your choice.

```bash
groupadd --gid 1001 opschain
useradd --uid 1001 --gid opschain --create-home opschain
```

:::note[UID & GID]
If there are any existing users or groups with the same UID or GID, please change these to unique values.
:::

### Scoped sudo for the installation user

K3s service control and a few container-inspection tasks require root on an ongoing basis. Grant the installation user a scoped, passwordless allowlist containing only the control commands. Create the sudoers file as root:

```bash
visudo -f /etc/sudoers.d/opschain
```

And paste in the following (adjust binary paths to match your distribution if needed):

```bash
opschain ALL=(ALL) NOPASSWD: /usr/local/bin/k3s-killall.sh, \
  /usr/bin/systemctl start k3s, /usr/bin/systemctl stop k3s, \
  /usr/bin/systemctl restart k3s, \
  /usr/local/bin/k3s crictl *, /usr/local/bin/k3s ctr *, \
  /usr/bin/firewall-cmd
```

Then grant the installation user read-only access to the system journal so it can inspect K3s logs and service status without sudo. The recommended way is to add it to the `systemd-journal` group:

```bash
usermod -aG systemd-journal opschain
```

After this, `journalctl -u k3s` and `systemctl status k3s` work for the `opschain` user with no sudo.

:::note[If the `systemd-journal` group isn't honoured]
Where identities are managed centrally (LDAP/SSSD) and local membership in `systemd-journal` is not applied, the `usermod` above may not take effect. Instead, add a scoped, pager-disabled `journalctl` entry to the sudo allowlist:

```bash
opschain ALL=(ALL) NOPASSWD: /usr/bin/journalctl --no-pager *
```

The command will then be available for the `opschain` user via `sudo journalctl --no-pager <arguments>`.
:::

:::danger[Every entry in the sudo allowlist is a security decision]
Commands granted via `NOPASSWD` run as root, so each must be safe against privilege escalation before you add it.

The allowlist above covers everything OpsChain's documented operations need. If you require additional root access for some commands, add these specific commands to the allowlist at your discretion.
:::

:::note[Installation user]
After the host-provisioning steps below are complete, switch to the `opschain` user with `su - opschain`. From the [installation guide](/setup/installation.md) onwards, most steps run as that unprivileged user — but a few later operations (for example the post-deploy CA-trust setup and backups) still require root, and are flagged where they occur.
:::

### Kernel & Ulimit settings

Update the kernel and ulimit settings to ensure the system has enough resources to run OpsChain.

:::tip
The `opschain` in the lines below refer to the installation user.
:::

Update the limits by running the following command and pasting in the following lines:

```bash
vi /etc/security/limits.d/opschain.conf
```

```bash
root soft nofile 131072
root hard nofile 131072
opschain soft nofile 131072
opschain hard nofile 131072
```

Either log out and back in with the root user, or reboot the system to apply the changes:

```bash
reboot
```

Update the kernel settings by running the following command and pasting in the following lines:

```bash
vi /etc/sysctl.d/99-k3s-inotify.conf
```

```bash
# for k3s
fs.inotify.max_user_instances=8192
fs.inotify.max_user_watches=1048576
fs.inotify.max_queued_events=32768
fs.file-max = 2097152

# for fluentd
net.core.somaxconn = 1024
net.core.netdev_max_backlog = 5000
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_wmem = 4096 12582912 16777216
net.ipv4.tcp_rmem = 4096 12582912 16777216
net.ipv4.tcp_max_syn_backlog = 8096
net.ipv4.tcp_slow_start_after_idle = 0
net.ipv4.tcp_tw_reuse = 1
net.ipv4.ip_local_port_range = 10240 65535
net.ipv4.ip_local_reserved_ports = 24224
```

Load the updated kernel settings:

```bash
sysctl -p /etc/sysctl.d/99-k3s-inotify.conf
```

## Installing K3s and Helm

These steps complete the host-provisioning phase: they create the data directories, configure the firewall, and install the K3s and Helm binaries. They write to system locations (`/`, `/etc`, `/usr/local/bin`) and register a systemd service, so they must be run as root. After Helm is installed, switch to the unprivileged `opschain` user for the steps that follow.

### Setup proxy

If you are using a proxy, please set the following variables on the shell before starting the next steps.

```bash
export http_proxy=<your_proxy_address>
export https_proxy=<your_proxy_address>
```

### Directory setup

All K3s configuration and data is stored under `/limepoint`. Create the directories and the `/etc/rancher` symlink as root, and leave them root-owned — K3s and its embedded containerd run as root and manage this tree as root.

```bash
mkdir -p /limepoint/k3s /limepoint/rancher
ln -s /limepoint/rancher /etc/rancher
```

:::warning[Keep the K3s data directory root-owned]
The unprivileged `opschain` user does not need to own this directory. It reads the cluster's kubeconfig (world-readable at mode `644`) via its own [`~/.kube/config` copy](#setup-shell), and the few operations that write under `/limepoint` (trusting the registry CA, editing `registries.yaml`) are tasks that should be performed by the root user, not the installation user.
:::

### Firewall setup

If you are using the local Linux firewall, the following rules need to be added. First, check if the Linux firewall is running:

```bash
ps -ef|grep -i firewall
```

If you see a process, run the following commands, otherwise skip this step.

```bash
sudo firewall-cmd --permanent --add-port=6443/tcp # API server - # skip if no firewall is running
sudo firewall-cmd --permanent --add-port=30432/tcp # database replication - # skip if no firewall is running
sudo firewall-cmd --permanent --zone=trusted --add-source=10.42.0.0/16 # pods - # skip if no firewall is running
sudo firewall-cmd --permanent --zone=trusted --add-source=10.43.0.0/16 # services - # skip if no firewall is running
sudo firewall-cmd --reload # skip if no firewall is running
```

### Download & install K3s

:::info[K3s version]
We recommend installing K3s version `v1.35.3+k3s1` or later, but this requires that your operating system uses cgroups v2, given cgroups v1 is deprecated in Kubernetes versions beyond v1.35. If your operating system does not support cgroups v2, you can proceed with installing K3s version `v1.34.6+k3s1` instead.

In most Linux distributions, you can check if your system uses cgroups v2 by running the following command:

```bash
stat -fc %T /sys/fs/cgroup/
```

If the output contains `cgroup2fs`, your system uses cgroups v2. If the command does not work, refer to your operating system's documentation for how to check if your system uses cgroups v2.

[Learn more](https://kubernetes.io/docs/concepts/architecture/cgroups/) about cgroups.
:::

:::warning[Memory limits are only enforced on cgroups v2]
Choose cgroups v2 if you can, because it is what makes OpsChain's memory limits real. On a cgroups v1 host the limits are still recorded and the scheduler still honours the requests, but the kernel does not stop a container that exceeds its limit.

This cannot be changed after installation: it is a property of how the operating system boots, so it is worth settling before you provision the server rather than after.
:::

```bash
curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION="v1.35.3+k3s1" INSTALL_K3S_EXEC="--disable traefik --write-kubeconfig-mode 644 --data-dir /limepoint/k3s --secrets-encryption true" sh -
```

Validate K3s:

```bash
k3s --version
```

:::tip[Tuning K3s]
With K3s installed, you can configure it to your needs. See the [K3s configuration documentation](https://docs.k3s.io/installation/configuration) for more details on how to configure it.

Two settings are worth applying before you run anything on the server: [reserving resources for the node](#reserving-resources-for-the-node) below, and the image garbage collection thresholds in the [container image cleanup](/operations/maintenance/container-image-cleanup.md) guide.
:::

### Reserving resources for the node

By default K3s reserves nothing for the server itself: the node reports its *allocatable* memory as equal to its total capacity, so pods may fill the machine to the last byte. When that happens the Linux kernel chooses what to stop, and it does not rank by importance — it can take `sshd` or the container runtime. Reserving resources keeps the kubelet making that decision instead, [evicting pods in a defined order](https://kubernetes.io/docs/concepts/scheduling-eviction/node-pressure-eviction/) while the server stays reachable.

Reserving does not cap what K3s may use. It subtracts a slice from what the scheduler is allowed to hand out. See the Kubernetes guide to [reserving compute resources](https://kubernetes.io/docs/tasks/administer-cluster/reserve-compute-resources/) for the full model.

| Setting | Covers |
| --- | --- |
| `system-reserved` | the operating system and the kernel — kernel memory is charged to no pod |
| `kube-reserved` | K3s, the kubelet, and the container runtime, including one process per running pod |
| `eviction-hard` | the margin the kubelet keeps so it can evict before the kernel intervenes |

Add them to K3s' configuration file, `/limepoint/rancher/k3s/config.yaml`, creating it and its parent directory if they are not there yet:

```bash
mkdir -p /limepoint/rancher/k3s
```

:::warning[`kubelet-arg` is a single list]
If you have already set [image garbage collection thresholds](/operations/maintenance/container-image-cleanup.md#kubelet-image-gc-thresholds), add these entries to the existing `kubelet-arg` list. YAML keeps only one value for a repeated key, so a second `kubelet-arg` block discards the first.
:::

```yaml
kubelet-arg:
  - "system-reserved=cpu=500m,memory=2Gi"
  - "kube-reserved=cpu=500m,memory=1500Mi"
  - "eviction-hard=memory.available<1Gi,nodefs.available<10%"
```

That reserves 4.5 GiB, which suits the default [pool limits](/key-concepts/settings.md#runner-pod-concurrency-and-limit-settings). Part of `kube-reserved` scales with how many pods the node runs, so **if you raise a pool limit, add 25 MiB per additional pod**. For example, raising [`concurrent.runner_limit`](/key-concepts/settings.md#concurrentrunner_limit) from 6 to 20 requires adding around 350 MiB to the reserved memory.

Restart K3s to apply it:

```bash
sudo systemctl restart k3s
```

:::warning[Restarting K3s interrupts running work]
Restarting K3s restarts the node's workloads. Wait until the node has no changes or steps in flight, otherwise the steps running on it fail.
:::

Confirm the reservation by comparing capacity with allocatable:

```bash
kubectl get node -o jsonpath='{range .items[*]}{.metadata.name}{"  capacity="}{.status.capacity.memory}{"  allocatable="}{.status.allocatable.memory}{"\n"}{end}'
```

Allocatable is lower than capacity by the amount reserved. Two equal figures mean the settings were not read — check that K3s restarted and that you edited the file it loads.

These settings apply per node, so apply them on every K3s node. In a high-availability topology that is every node in each cluster. [Sizing OpsChain's components](/operations/component-resources.md#reserving-memory-for-the-server) explains where the figures come from and how to measure them on your own server.

### Download Helm

```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | DESIRED_VERSION="v3.20.2" bash
```

Validate Helm:

```bash
helm version
```

### Download Stern

Stern is a CLI tool for Kubernetes that allows you to view logs from multiple pods at once. Head to Stern's [webpage](https://github.com/stern/stern#installation) to download and install it with your preferred method.

### Setup shell

Switch to the unprivileged `opschain` user (`su - opschain`). The kubeconfig that K3s generates at `/etc/rancher/k3s/k3s.yaml` is owned by root, so the installation user can read it but cannot write to it. Give the user its own copy so that `kubectl` commands that update local configuration, such as setting a default namespace, work:

```bash
mkdir -p ~/.kube
cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
chmod 600 ~/.kube/config
```

Then update the login shell to point at that copy and add a couple of aliases to make life simpler.

```bash
vi ~/.bash_profile
```

```bash
export KUBECONFIG=$HOME/.kube/config
# Replace with your preferred installed editor.
export KUBE_EDITOR=vim
alias crictl='sudo /usr/local/bin/k3s crictl --config /limepoint/k3s/agent/etc/crictl.yaml'
alias ctr='sudo /usr/local/bin/k3s ctr'
```

:::note[Your copy of the kubeconfig]
`~/.kube/config` is a snapshot taken now. If you later regenerate the cluster's kubeconfig (for example after rotating the cluster CA), copy `/etc/rancher/k3s/k3s.yaml` again to refresh it.

Working as `root` instead? Point `KUBECONFIG` straight at `/etc/rancher/k3s/k3s.yaml` - root can write to it directly.
:::

:::note[Scoped sudo]
The `crictl` and `ctr` aliases call the K3s-bundled subcommands (`k3s crictl` / `k3s ctr`), which talk to the root-owned containerd socket and work via the [scoped sudoers allowlist](#scoped-sudo-for-the-installation-user) configured during host provisioning.
:::

And then source the file for changes to take effect:

```bash
source ~/.bash_profile
```

## What to do next

- Proceed with [obtaining and configuring your `values.yaml` file](/setup/configuration/index.md).
