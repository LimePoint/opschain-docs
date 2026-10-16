---
sidebar_position: 2
description: Install a remote runner on a host in your own network so an existing OpsChain instance can run changes there, in simple or advanced mode.
---

# Set up a remote runner

:::warning[Feature preview]
Remote runners are complete and supported for evaluation. Settings, file names and the daemon's packaging may still change before general availability.
:::

Set up a [remote runner](index.md) to let an existing OpsChain instance run changes on a host inside your network. The daemon on that host only ever connects outbound to OpsChain, so nothing in your network has to accept a connection from it.

Two people are usually involved, and this guide marks which steps belong to each:

- The **OpsChain administrator** creates the remote runner target in OpsChain. They need permission to manage targets: a superuser for a target that serves the whole instance, or Update on `<node path>/remote_runner_targets` for one owned by a project, environment or asset (see [who can manage targets](index.md#who-can-manage-targets)).
- The **host administrator** installs and runs the daemon on a host in your network. They never need access to OpsChain's own cluster.

## Choose a packaging mode

Both modes run the same daemon and behave the same once installed. They differ in what you install and what it needs:

|                              | Simple mode                                         | Advanced mode                                                        |
|------------------------------|-----------------------------------------------------|----------------------------------------------------------------------|
| What you install             | One disk image and one system service               | RHEL packages, then a small daemon archive in an ordinary account   |
| How it runs                  | A `systemd-nspawn` system service                   | A systemd user service in that account                               |
| Root needed                  | To install, run and upgrade it                      | Only to install the packages, create the account and enable lingering |
| Runtime dependencies         | Inside the image                                    | Your own RHEL 9 packages, installed with `dnf`                       |
| Visible to your CVE scanning | No, the image is opaque                             | Yes, and patched by your own `dnf update`                            |

Choose **simple mode** when you want the fewest moving parts and can run a root service: everything the daemon needs comes in one image, and the host needs only `systemd-nspawn`.

Choose **advanced mode** when your policy does not allow a root-run service, or your security team needs every component the runner relies on to be visible to its package manager and scanning. It takes more setup, but once installed nothing in the runner's lifecycle needs root.

## Prerequisites

For both modes:

- A host running RHEL 9 or a compatible distribution (AlmaLinux, Rocky Linux, Oracle Linux).
- Outbound HTTPS from the host to the OpsChain API's host and port, directly or through a proxy. The daemon pulls runner images through the same host, so nothing else in OpsChain needs to be reachable.
- `/dev/net/tun`, which RHEL 9 provides by default, so each container can be given its own network.
- Network access from the host to whatever the changes it runs will manage.
- Disk space for the runner images the daemon caches. The daemon keeps each image both as downloaded and unpacked, one copy of each layer shared by every image and step that uses it, and the unpacked layers take roughly three times the download size. By default the cache may grow to 20 GiB, enough for about five runner images of 1 GiB. Allow at least 40 GiB if your changes use several runner images, and see [daemon configuration](#daemon-configuration) to raise the limit. A running step needs little space beyond the files it writes, unless the daemon has to fall back to unpacking a whole image for each step (see [how the daemon prepares each step](#how-the-daemon-prepares-each-step)). The cache lives in the daemon's state directory: `/var/lib/opschain-remote-runner/state` in simple mode, `~/opschain-remote-runner/state` in advanced mode.

Simple mode also needs root on the host and these packages, which you can install with `dnf install systemd-container zstd curl`:

- `systemd-container`, for `systemd-nspawn`.
- `zstd`, to decompress the disk image. A minimal RHEL 9 or AlmaLinux 9 install does not include it.
- `curl`, to download the disk image and unit file from OpsChain.

Simple mode also needs an OpsChain API token for a user who can view the target, to download the disk image and unit file. Ask the OpsChain administrator for one if you have no OpsChain login. Advanced mode's requirements are listed in [install advanced mode](#install-advanced-mode).

## Create the target's key pair

_Host administrator._

OpsChain encrypts every secret it sends to a target with that target's public key, so only the daemon holding the private key can read it. Create the key pair on the host, so the private key never leaves it:

```bash
umask 077
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:3072 -out target.pem
openssl pkey -in target.pem -pubout -out target.pub.pem
```

Send `target.pub.pem` to the OpsChain administrator. Keep `target.pem` on the host; you install it with the daemon.

## Create the target in OpsChain

_OpsChain administrator._

1. In the OpsChain GUI, open **Administration > Remote runners** (see [remote runners](/getting-started/familiarisation/gui/administration/remote_runners.md) for a guide to its screens) and click **Add remote runner target**:

   ![Add remote runner target form](../images/remote-runner-targets-create-form.png)

2. Fill in the form:

   - **Code** is the target's unique code. It cannot be changed later.
   - **Owning resource** is the project, environment or asset whose changes the target runs. Leave it as **Global (no owning resource)** only if **every** change in the instance should run remotely. See [which changes run remotely](index.md#which-changes-run-remotely).
   - **Public key (PEM)** is the host administrator's `target.pub.pem`. Choose the file or paste its contents.

3. Click **Add remote runner target** at the bottom of the form. OpsChain shows the daemon's configuration, with the OpsChain URL, the target's ID and its bearer token, ready to paste into the daemon's `env` file, followed by the token on its own:

   ![The daemon configuration and bearer token, shown once after creating a target](../images/remote-runner-targets-create-token.png)

   **The token is only shown on this screen.** Click **Copy daemon configuration** before leaving the page. If the token is lost, delete the target and create a new one.

4. Click **I have copied the token - view target**. The target's page also shows its ID, with a button to copy it.

Send the host administrator the daemon configuration you copied, over a channel you would trust with a password. The token lets its holder act as this remote runner.

The new target shows **Never connected** until its daemon starts. Targets can also be created through the [remote runner targets API](pathname:///api-docs/#tag/Remote-runner-targets): the token is returned only by the create request, in `data.meta.bearer_token`.

## Install simple mode

_Host administrator, as root._ Run every step in this section as root, for example in a `sudo -i` shell: the commands below are written without `sudo`.

Simple mode runs the daemon inside a disk image with `systemd-nspawn`, as a system service. The image contains the daemon, its Ruby runtime and every tool it uses (`crun`, `skopeo`, `slirp4netns`, `git`, `zstd`).

### Download the disk image

OpsChain serves the simple-mode disk image, built for its own version, as a compressed raw image. Download it and decompress it into place:

```bash
mkdir -p /opt/opschain-remote-runner-image
cd /opt/opschain-remote-runner-image
curl -fsS -D image-headers.txt -o simple-mode.raw.zst \
  "https://opschain.example.com/api/remote_runner_targets/<target id>/simple_mode_image" \
  -H "Authorization: Bearer <api token>"
```

Check it against the SHA-256 in the response's `X-Checksum-Sha256` header, then decompress it:

```bash
grep -i '^x-checksum-sha256:' image-headers.txt
sha256sum simple-mode.raw.zst
zstd -d --sparse --rm simple-mode.raw.zst -o simple-mode.raw
rm image-headers.txt
```

A `404` titled `Remote runner simple-mode file not bundled` means your OpsChain build does not include the disk image; contact LimePoint support.

### Configure the daemon

The container runs under a fixed, unprivileged range of host user IDs: user `0` inside it is host UID `524288`, and the daemon runs inside it as UID `10001`, which is host UID `534289`. The configuration and state directories are bind mounted into the container, so create them with matching owners, and install the private key:

```bash
install -d -m 0755 /etc/opschain-remote-runner
install -d -o 534289 -g 534289 -m 0700 \
  /var/lib/opschain-remote-runner/sockets /var/lib/opschain-remote-runner/state
install -o 534289 -g 534289 -m 0600 target.pem /etc/opschain-remote-runner/target.pem
```

Create `/etc/opschain-remote-runner/env`, owned by UID `524288` with mode `0600`, with the details the OpsChain administrator sent:

```bash
OPSCHAIN_SAAS_URL=https://opschain.example.com
OPSCHAIN_TARGET_ID=<target id>
OPSCHAIN_TARGET_TOKEN=<bearer token>
OPSCHAIN_TARGET_PRIVATE_KEY=/etc/opschain-remote-runner/target.pem
OPSCHAIN_SOCKET_DIR=/var/lib/opschain-remote-runner/sockets
OPSCHAIN_STATE_DIR=/var/lib/opschain-remote-runner/state
XDG_RUNTIME_DIR=/var/lib/opschain-remote-runner/state
```

```bash
chown 524288:524288 /etc/opschain-remote-runner/env
chmod 0600 /etc/opschain-remote-runner/env
```

`OPSCHAIN_SAAS_URL` is the address of your OpsChain instance, without the `/api` suffix. See [daemon configuration](#daemon-configuration) for the optional settings, including a proxy.

### Install and start the service

Download the service's unit file from OpsChain to `/etc/systemd/system/opschain-remote-runner.service`:

```bash
curl -fsSo /etc/systemd/system/opschain-remote-runner.service \
  "https://opschain.example.com/api/remote_runner_targets/<target id>/simple_mode_unit" \
  -H "Authorization: Bearer <api token>"
```

The same file is also available to <a href='/files/downloads/opschain-remote-runner.service' download='opschain-remote-runner.service'>download from this site</a>, if that is easier to copy to the host.

It runs the daemon's image with `systemd-nspawn`:

```ini
[Service]
Delegate=yes
ExecStart=systemd-nspawn --quiet --keep-unit --kill-signal=SIGTERM --register=no --private-users=524288:65536 --private-users-ownership=map \
  --bind=/etc/opschain-remote-runner --bind=/var/lib/opschain-remote-runner --bind=/dev/net/tun \
  --image=/opt/opschain-remote-runner-image/simple-mode.raw --chdir=/opt/opschain-remote-runner/daemon -- /bin/bash /root_wrapper.sh
```

`--private-users-ownership=map` needs systemd 252 or later, which RHEL 9 has. On an older systemd, change it to `--private-users-ownership=chown`.

The daemon keeps its temporary files in `tmp` under its state directory, `/var/lib/opschain-remote-runner/state/tmp`, rather than in the disk image, which has little free space. It empties that directory each time it starts. If the host runs short of space, give `/var/lib/opschain-remote-runner` its own file system, or mount a larger one there.

Enable and start the service:

```bash
systemctl daemon-reload
systemctl enable --now opschain-remote-runner
```

Then [check the target is live](#check-the-target-is-live-and-run-a-change).

## Install advanced mode

Advanced mode installs the daemon into an ordinary account and runs it as a systemd user service. Ruby and every tool the daemon uses come from your RHEL 9 repositories; the daemon's own code comes in a small archive downloaded from your OpsChain instance. The archive contains only the daemon, three pure-Ruby gems it uses (`base64`, `logger` and `webrick`, with their licences), a launcher, a preflight script, the systemd user unit and an example configuration file. It contains no Ruby runtime, no container tools and no compiled code.

### Prepare the host

_Host administrator, as root._ These are the only steps that need root.

1. The daemon needs Ruby 3.3, from the `ruby:3.3` module stream; the default `ruby` stream on RHEL 9 is older. Install it and the tools the daemon uses:

   ```bash
   sudo dnf module enable ruby:3.3
   sudo dnf install ruby rubygem-json crun skopeo slirp4netns git-core zstd tar
   ```

   The daemon runs `/usr/bin/ruby`, so a Ruby installed elsewhere, by a version manager for example, is not used. `shadow-utils` and `util-linux`, which every RHEL 9 installation has, provide `newuidmap`, `newgidmap`, `unshare` and `nsenter`.

2. Choose the ordinary account the runner runs as. It needs no group memberships and no `sudo` rights. These examples use `opschain-runner`.

3. The account needs a range of subordinate user and group IDs to map the containers' users into. On RHEL 9, `useradd` adds one automatically. Check with:

   ```bash
   grep "^opschain-runner:" /etc/subuid /etc/subgid
   ```

   If either file has no entry for the account, add one, choosing a range no other account uses:

   ```bash
   sudo usermod --add-subuids 200000-265535 --add-subgids 200000-265535 opschain-runner
   ```

4. Enable lingering, so the account's systemd user manager, and the runner with it, starts at boot and keeps running when nobody is logged in:

   ```bash
   sudo loginctl enable-linger opschain-runner
   ```

5. So the account can read its own logs with `journalctl --user`, make the systemd journal persistent if it is not already. RHEL 9 keeps the journal in memory by default, and an ordinary account cannot read its own entries from it:

   ```bash
   sudo mkdir -p /var/log/journal
   sudo systemctl restart systemd-journald
   ```

Unprivileged user namespaces must be enabled (`user.max_user_namespaces` greater than zero), which is the RHEL 9 default.

### Install the daemon

_Host administrator, as the runner account._ Log in to the account directly, for example over SSH, rather than switching to it with `su` or `sudo`, so `systemctl --user` can reach its user manager.

1. Create the runner's directories and move the private key into place:

   ```bash
   mkdir -p ~/opschain-remote-runner/releases ~/opschain-remote-runner/config ~/opschain-remote-runner/state
   install -m 0600 target.pem ~/opschain-remote-runner/config/target.pem
   ```

2. Download the daemon archive from your OpsChain instance. This needs an OpsChain API token for a user who can view the target; ask the OpsChain administrator for one if you have no OpsChain login.

   ```bash
   cd ~
   curl -fsS -OJ -D archive-headers.txt "https://opschain.example.com/api/remote_runner_targets/<target id>/daemon_archive" \
     -H "Authorization: Bearer <api token>"
   ```

   `-J` saves the file under the name OpsChain gives it, `opschain-remote-runner-<version>.tar.gz`. Check it against the SHA-256 in the response's `X-Checksum-Sha256` header:

   ```bash
   grep -i '^x-checksum-sha256:' archive-headers.txt
   sha256sum opschain-remote-runner-<version>.tar.gz
   ```

   A `404` titled `Remote runner archive not bundled` means your OpsChain build does not include the archive; contact LimePoint support.

3. Extract it and point `current` at it:

   ```bash
   tar -xzf opschain-remote-runner-<version>.tar.gz -C ~/opschain-remote-runner/releases
   ln -sfn releases/opschain-remote-runner-<version> ~/opschain-remote-runner/current
   rm archive-headers.txt opschain-remote-runner-<version>.tar.gz
   ```

   Each release lives in its own directory under `releases`, which makes an [upgrade](#upgrade-the-runner) a symlink swap.

4. Check the prerequisites:

   ```bash
   ~/opschain-remote-runner/current/bin/opschain-remote-runner-preflight
   ```

   It reports the installed packages, whether `/usr/bin/ruby` is Ruby 3.3, the account's subordinate ID ranges, lingering, user namespaces and `/dev/net/tun`, and exits non-zero when anything required is missing.

5. Create `~/opschain-remote-runner/config/env`, with mode `0600`, with the details the OpsChain administrator sent:

   ```bash
   OPSCHAIN_SAAS_URL=https://opschain.example.com
   OPSCHAIN_TARGET_ID=<target id>
   OPSCHAIN_TARGET_TOKEN=<bearer token>
   ```

   The release's `share/env.example` is a starting point. The unit sets the rest: the state directory, the private key's path and the directory for each container's socket. See [daemon configuration](#daemon-configuration) for the optional settings, including a proxy.

6. Install and start the user service:

   ```bash
   mkdir -p ~/.config/systemd/user
   cp ~/opschain-remote-runner/current/share/systemd/opschain-remote-runner.service ~/.config/systemd/user/
   systemctl --user daemon-reload
   systemctl --user enable --now opschain-remote-runner
   ```

:::tip Prefer a system service?
The runner can instead run as a system service that runs as the runner account. It needs no lingering and no login session, and it is managed with `systemctl` and `journalctl -u` as root. In that case skip steps 4 and 5 of [prepare the host](#prepare-the-host) and step 6 above, run the preflight check with `--system`, and, as root, create `/etc/systemd/system/opschain-remote-runner.service`, replacing `opschain-runner` and its home directory with your own:

```ini
[Unit]
Description=OpsChain remote runner
Documentation=https://docs.opschain.io/docs/advanced/remote-runners/setup
Wants=network-online.target
After=network-online.target

[Service]
User=opschain-runner
Type=exec
Environment=OPSCHAIN_STATE_DIR=/home/opschain-runner/opschain-remote-runner/state
Environment=XDG_RUNTIME_DIR=/run/opschain-remote-runner
Environment=OPSCHAIN_SOCKET_DIR=/run/opschain-remote-runner
Environment=OPSCHAIN_TARGET_PRIVATE_KEY=/home/opschain-runner/opschain-remote-runner/config/target.pem
EnvironmentFile=/home/opschain-runner/opschain-remote-runner/config/env
RuntimeDirectory=opschain-remote-runner
RuntimeDirectoryMode=0700
RuntimeDirectoryPreserve=yes
ExecStart=/home/opschain-runner/opschain-remote-runner/current/bin/opschain-remote-runner
Delegate=yes
KillMode=process
TimeoutStopSec=30
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Then run `systemctl daemon-reload` and `systemctl enable --now opschain-remote-runner`. The paths must be absolute: in a system unit, `%h` is root's home directory even with `User=` set. `XDG_RUNTIME_DIR` is required: without it the daemon cannot read its registry credentials and every step fails to start.
:::

## Daemon configuration

Both modes read the same optional settings from the daemon's `env` file:

| Variable                                | Purpose                                                                                                                                                              |
|-----------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `HTTPS_PROXY`, `HTTP_PROXY`, `NO_PROXY` | The proxy the daemon uses to reach OpsChain, also passed into every container. Use a proxy on a non-loopback address. See [network access and proxies](index.md#network-access-and-proxies). |
| `OPSCHAIN_NETWORK`                      | `slirp4netns` (the default) gives each container outbound network access. `none` gives it none, leaving only its connection to OpsChain through the daemon.          |
| `OPSCHAIN_IMAGE_CACHE_BUDGET_BYTES`     | How large the runner image cache, downloaded and unpacked layers together, may grow before the least recently used images are removed. Defaults to 20 GiB.          |
| `OPSCHAIN_LOG_DISK_CAP_BYTES`           | How much output the daemon holds for each piece of work while it cannot reach OpsChain, before dropping the oldest. Defaults to 100 MiB.                             |

:::tip Slow network to OpsChain?
Runner images share large base layers, and the daemon only downloads layers that are not already in its cache. If `OPSCHAIN_IMAGE_CACHE_BUDGET_BYTES` is too small to hold the images you run regularly, those layers are evicted and downloaded again. On a slow link, set the budget to about four times the download size of your usual runner images, to hold them both downloaded and unpacked, plus room for new versions after an OpsChain upgrade, and make sure the state directory has that much free space. The daemon cannot currently pull through a separate registry caching proxy.
:::

How much work a target runs at once, and how often it polls, are set on the target in OpsChain, not in this file. See [concurrency and polling](index.md#concurrency-and-polling).

Restart the service after changing the file.

### How the daemon prepares each step

When it starts, the daemon checks what its state directory's file system supports and picks the fastest way to give each step its own copy of the runner image. The log names the method it chose, in a line starting `preparing step root filesystems by`:

| Method                      | Used when                                                                                              | Cache directory | Space each running step needs                 |
|-----------------------------|--------------------------------------------------------------------------------------------------------|-----------------|-----------------------------------------------|
| An overlay of cached layers | The kernel lets the daemon mount an overlay file system (RHEL 9 does)                                  | `state/layers`  | Only the files the step writes                |
| Reflink copies              | Advanced mode only: overlay mounts are unavailable, but the file system supports reflinks (XFS, Btrfs) | `state/rootfs`  | Only the files the step writes                |
| Unpacking the whole image   | Neither is available                                                                                   | None            | Roughly three times the image's download size |

If the daemon picks a different method on a later start, for example after the state directory moves to another file system, it removes the cache of the method it no longer uses.

## Check the target is live and run a change

1. In **Administration > Remote runners**, the target shows **Live** within a few seconds of the service starting. If it stays **Never connected**, see [troubleshooting](index.md#troubleshooting).
2. Run a change on a node the target serves. The change runs as usual, and the target's claim is recorded as an `info:remote_runner_assignment:claimed` event on the change, naming the target.

From then on, every change on the nodes the target serves runs on this host.

## Upgrade the runner

A daemon keeps working when OpsChain is upgraded, until a release changes the daemon protocol version. Its [changelog](/changelog.md) says when it does; see [daemon compatibility](index.md#daemon-compatibility). Upgrade the runner then, or whenever you want a newer daemon.

Stopping the daemon while it is preparing work loses that work, so drain the target first:

1. _OpsChain administrator._ Turn on [maintenance mode](index.md#maintenance-mode-and-draining) for the target, and wait until it shows **Drained**.
2. _Host administrator._ Replace the daemon:
   - **Simple mode:** stop the service (`systemctl stop opschain-remote-runner`), [download the disk image](#download-the-disk-image) and [the unit file](#install-and-start-the-service) again, replacing `simple-mode.raw` and `opschain-remote-runner.service`, run `systemctl daemon-reload`, and start the service. Keep `/var/lib/opschain-remote-runner`, which holds the daemon's current token.
   - **Advanced mode:** [download the archive](#install-the-daemon) again, then switch to it:

     ```bash
     tar -xzf opschain-remote-runner-<new version>.tar.gz -C ~/opschain-remote-runner/releases
     ln -sfn releases/opschain-remote-runner-<new version> ~/opschain-remote-runner/current
     cp ~/opschain-remote-runner/current/share/systemd/opschain-remote-runner.service ~/.config/systemd/user/
     systemctl --user daemon-reload
     systemctl --user restart opschain-remote-runner
     ```

     Keep the old release in `releases` until the new one is working: switching `current` back and restarting is the rollback.
3. _OpsChain administrator._ Turn maintenance mode off.

## Remove the runner

1. _OpsChain administrator._ Turn on maintenance mode for the target and wait until it shows **Drained**.
2. _Host administrator._ Stop and remove the daemon:
   - **Simple mode:**

     ```bash
     systemctl disable --now opschain-remote-runner
     rm /etc/systemd/system/opschain-remote-runner.service
     systemctl daemon-reload
     rm -rf /opt/opschain-remote-runner-image /etc/opschain-remote-runner /var/lib/opschain-remote-runner
     ```

   - **Advanced mode**, as the runner account:

     ```bash
     systemctl --user disable --now opschain-remote-runner
     rm ~/.config/systemd/user/opschain-remote-runner.service
     systemctl --user daemon-reload
     rm -rf ~/opschain-remote-runner
     ```

     Files inside a container, and the unpacked image layers the daemon caches, belong to the account's subordinate IDs, so `rm` reports `Permission denied` under `state/layers` and `state/rootfs`, and under `state/bundles` if work was interrupted. Have an administrator remove the directory: `sudo rm -rf ~opschain-runner/opschain-remote-runner`. An administrator can then disable lingering with `sudo loginctl disable-linger opschain-runner`.
3. _OpsChain administrator._ Delete the target. Its token stops working once the target is deleted.

## Advanced-mode troubleshooting

See also the [troubleshooting](index.md#troubleshooting) that applies to both modes.

**Start with the preflight script.** `~/opschain-remote-runner/current/bin/opschain-remote-runner-preflight` checks every host prerequisite.

**`journalctl --user` prints `No journal files were opened due to insufficient permissions`.** On a host whose journal is not persistent (no `/var/log/journal` directory), an ordinary account cannot read its own journal. Ask an administrator to make it persistent (`sudo mkdir -p /var/log/journal && sudo systemctl restart systemd-journald`), or to read it with `sudo journalctl _UID=$(id -u opschain-runner)`.

**`systemctl --user` prints `Failed to connect to bus: No medium found`.** The shell was opened with `su` or `sudo`, so it has no connection to the account's systemd user manager. Log in to the account directly, for example over SSH, or set these in the shell first:

```bash
export XDG_RUNTIME_DIR=/run/user/$(id -u)
export DBUS_SESSION_BUS_ADDRESS=unix:path=$XDG_RUNTIME_DIR/bus
```

This only works while lingering is enabled for the account, so that its user manager is already running; otherwise `systemctl --user` reports `No such file or directory` instead. Running the runner as a system service, described in a tip under [install the daemon](#install-the-daemon), avoids `systemctl --user` altogether.

**`newuidmap failed` or `uid range not allowed` in a step's log.** The account has no subordinate ID range, or the range does not match `/etc/subuid` and `/etc/subgid`. See [prepare the host](#prepare-the-host).

**The runner stops when you log out.** Lingering is not enabled for the account. `loginctl show-user opschain-runner --property=Linger` must report `Linger=yes`.

**Looking at containers.** The daemon runs `crun` as the runner account, so `crun list`, run as that account, lists its containers.
