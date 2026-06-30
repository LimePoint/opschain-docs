---
sidebar_position: 2
description: Steps to install self hosted K3s
---

# K3s installation guide

This guide takes you through steps for installing self hosted K3s platform in order to host OpsChain.

## Linux Certification

K3s for OpsChain is tested and supported on RHEL/OEL/AlmaLinux 8.x and 9.x on a VM.

## Access to software media and licence

You must have acquired a license from LimePoint before you begin to install. If you don't have one, please reach out to your account manager or drop a note on support@limepoint.com. As part of license acquisition you would also get credentials to download the installers.

You must have access to the following URLs from your VM network either directly or via a proxy.

- [https://hub.docker.com/](https://hub.docker.com/)
- [https://get.k3s.io/](https://get.k3s.io/)
- [https://charts.jetstack.io/](https://charts.jetstack.io/)
- [https://raw.githubusercontent.com/](https://raw.githubusercontent.com/)
- [https://kubernetes.github.io/](https://kubernetes.github.io/)

## Infrastructure requirements

The infrastructure requirements includes minumum configuration required for K3s along with requirements for OpsChain. The requirements for OpsChain are calculated based on the number of parallel executions you wish to do.

| # of Parallel Steps | Memory (GB) | CPU | Storage (GB) |
| :---  | :---: |  :---: | ---: |
| 10    |  4    |  2  | 100 |
| 100   |  8     |  4  | 100 |
| 1000  |  32   |  8  | 300 |

You can add more storage if you intend to save logs for longer within OpsChain. We recommend externalizing logs to Splunk or a file system for better management.

:::warning[Kernel version]
To support native rootless image builds, you must have a Kernel version newer than 5.11. In systems older than 5.11, you can have rootless image builds by enabling the [FUSE device plugin](/setup/configuration/additional-settings.md#fusedevicepluginenabled) in the settings.

More details are provided later in the [image build settings](/setup/configuration/additional-settings.md#image-building-settings) documentation.
:::

## Supported Platforms

OpsChain needs a container platform to run. It can be deployed on any of the following container platforms:

- Azure Kubernetes Services (AKS)
- Elastic Kubernetes Services (EKS)
- OpenShift Container Platform
- Self hosted Kubernetes (k8s or k3s) either on bare metal or a VM

The following setup guides will assume that you are installing OpsChain on a self hosted K3s cluster.

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

```bash
curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION="v1.35.3+k3s1" INSTALL_K3S_EXEC="--disable traefik --write-kubeconfig-mode 644 --data-dir /limepoint/k3s --secrets-encryption true" sh -
```

Validate K3s:

```bash
k3s --version
```

:::tip[Tuning K3s]
With K3s installed, you can configure it to your needs. See the [K3s configuration documentation](https://docs.k3s.io/installation/configuration) for more details on how to configure it.

A recommended configuration is to tune the image garbage collection settings to your needs. See the [container image cleanup](/operations/maintenance/container-image-cleanup.md) guide for more details.
:::

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
The `crictl` and `ctr` aliases call the K3s-bundled subcommands (`k3s crictl` / `k3s ctr`), which talk to the root-owned container runtime socket and work via the [scoped sudoers allowlist](#scoped-sudo-for-the-installation-user) configured during host provisioning.
:::

And then source the file for changes to take effect:

```bash
source ~/.bash_profile
```

## What to do next

- Proceed with the [TLS configuration guide](/setup/configuration/tls/index.md) to configure TLS/HTTPS connectivity for OpsChain.
