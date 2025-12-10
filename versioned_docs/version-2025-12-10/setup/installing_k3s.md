---
sidebar_position: 2
description: Steps to install self hosted K3s
---

# K3s Installation guide

This guide takes you through steps for installing self hosted K3s platform in order to host OpsChain.

## Linux Certification

K3s for OpsChain is tested and supported on RHEL/OEL/AlmaLinux 8.x and 9.x on a VM.

## Access to software media

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

### Installation User

Create a user named `opschain` on the Linux VM. The user need not be called `opschain`, it can be whatever name you want. For purpose of this guide, we will assume the linux user is `opschain`.

```bash
groupadd --gid 1001 opschain
useradd --uid 1001 --gid opschain --create-home opschain
```

### Sudo rules

K3s needs full sudo access for installation and operations purposes.

```bash
vi /etc/sudoers.d/opschain
opschain ALL=(ALL) NOPASSWD:ALL
```

### Kernel & Ulimit settings

```bash
vi /etc/security/limits.d/opschain.conf
root soft nofile 131072
root hard nofile 131072
opschain soft nofile 131072
opschain hard nofile 131072
```

```bash
vi /etc/sysctl.d/99-k3s-inotify.conf
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

## Installation & configuration

Follow the following steps to install K3s, all the steps must be run via the INSTALLATION_USER (defaults to `opschain`).

### Setup proxy

If you are using a proxy, please set the following variables on the shell before starting the next steps.

```bash
export http_proxy=<your_proxy_address>
export https_proxy=<your_proxy_address>
```

### Directory setup

All K3s configuration including data directory will be stored under this path.

```bash
mkdir -p /limepoint/k3s /limepoint/rancher
sudo ln -s /limepoint/rancher /etc/rancher
```

### Firewall setup

If you are using the local Linux firewall, the following rules need to be added.

```bash
firewall-cmd --permanent --add-port=6443/tcp #apiserver
firewall-cmd --permanent --zone=trusted --add-source=10.42.0.0/16 #pods
firewall-cmd --permanent --zone=trusted --add-source=10.43.0.0/16 #services
firewall-cmd --reload
```

### Download & Install K3s

```bash
curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION="v1.32.5+k3s1" INSTALL_K3S_EXEC="--disable traefik --write-kubeconfig-mode 644 --data-dir /limepoint/k3s" sh -

# validate k3s
k3s version
```

### Setup shell

Update your login shell to add the following aliases to make life simpler.

```bash
vi ~/.bash_profile
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
export KUBE_EDITOR=vim
alias crictl='sudo env "PATH=$PATH" crictl --config /limepoint/mint4/agent/etc/crictl.yaml'
alias ctr='sudo env "PATH=$PATH" ctr'
```
