---
sidebar_position: 6
description: Install Longhorn as OpsChain's storage backend on self-hosted K3s, so persistent volume capacity requests are genuinely enforced.
---

# Longhorn storage on K3s

:::info[Scope]
This guide is for self-hosted K3s. It doesn't apply to managed Kubernetes (AKS, EKS, OpenShift), which already ship a default storage class that enforces capacity.
:::

K3s's default storage class, `local-path`, does not enforce the capacity you request for a persistent volume - see [PV capacity is not enforced](/setup/installing_k3s.md#pv-capacity-is-not-enforced) in the K3s installation guide. [Longhorn](https://longhorn.io/), Rancher's own distributed block storage for K3s, hands out a real block device sized to the request instead, so a volume genuinely cannot grow past it. This guide covers installing Longhorn and making it the cluster's default storage class, with no changes required to the OpsChain chart itself.

## Prerequisites

This guide assumes you have already worked through the [configuration guide](/setup/configuration/index.md) and have a `values.yaml` in hand, and that the [CNPG operator is installed](/setup/configuration/preparing-your-environment.md#install-the-cnpg-operator) in your cluster - the OpsChain chart's pre-install hook blocks on the operator's webhook being available, and nothing in this guide changes that requirement. If you haven't completed those steps yet, do so before continuing here; this guide only covers the storage backend, not the rest of the install.

## Background

Every persistent volume in the OpsChain chart defaults to `storageClass: null` (or an empty string for the `sharedVolumes.*` volumes), and every template wraps the setting in a Helm `{{ with }}` block. A `null` or empty value is therefore omitted from the rendered manifest entirely, which Kubernetes reads as "use the cluster's default storage class". Making Longhorn the default storage class is the entire OpsChain-side change for a **fresh** install - nothing in your `values.yaml` needs to reference Longhorn by name.

You can confirm this yourself once you have a `values.yaml` to hand:

```bash
helm template opschain oci://docker.io/limepoint/opschain --version ${OPSCHAIN_CHART_VERSION} -f values.yaml \
  | grep -c storageClassName
```

A count of `0` confirms no volume pins a storage class, so all of them will follow whatever the cluster's default is.

:::warning[Migrating an existing install?]
If the count above isn't `0`, one or more volumes have an explicit `storageClass` set in your `values.yaml` - most commonly `sharedVolumes.projectGitRepos.storageClass` and `sharedVolumes.stepProperties.storageClass`, if a previous install pinned them to `local-path` as part of the historical `ReadWriteMany`-doesn't-work-on-`local-path` workaround (see the note on `ReadWriteMany` below). Find them with `grep -n storageClass values.yaml`, and set each one back to `null` (or remove the line) so the volume follows the cluster's new default instead of staying pinned to `local-path` forever. This changes what storage class *new* volumes bind against; it does not move data already sitting on `local-path` - see [reinstalling from scratch](#reinstalling-from-scratch) below for that.
:::

:::note[`ReadWriteMany` may work under Longhorn]
The historical guidance for `local-path` was to force the `sharedVolumes.projectGitRepos` and `sharedVolumes.stepProperties` volumes to `ReadWriteOnce`, because `local-path` cannot serve `ReadWriteMany`. Under Longhorn, `ReadWriteMany` volumes are served over NFS by Longhorn's own `share-manager` pods, so the chart's default `ReadWriteMany` access mode can bind and work without that workaround. In practice this isn't fully reliable: a `share-manager` pod can get stuck restart-looping on startup, blocking whichever OpsChain pod depends on it indefinitely - see [`ReadWriteMany` share-manager pods can restart-loop on startup](#readwritemany-share-manager-pods-can-restart-loop-on-startup) below. If you hit that, falling back to `ReadWriteOnce` (the historical `local-path` workaround) is the safe, working option; just be aware `accessMode` is immutable on a bound PVC, so switching after the fact needs a full uninstall and reinstall.
:::

## Size your volumes before you switch

This is the guide's whole point, so it's worth stating the consequence plainly: **on `local-path`, every PVC size in `values.yaml` is advisory - Longhorn makes it a hard limit.** A size nobody has had to think carefully about because `local-path` silently over-committed it becomes an operational ceiling the moment you switch. Review your sizes before you install, not after.

Two chart defaults are worth specifically re-checking:

| Volume | Chart default | Why it matters |
| --- | --- | --- |
| `buildService.volume.size` | `50Gi` | The single largest volume in a stock install - over a third of the chart's default PVC footprint on its own. |
| `db.backup.storage.size` | `20Gi` | Backups accumulate; a hard 20Gi ceiling can be reached in normal operation depending on your retention settings. |
| `logAggregator.volume.size` | `1Gi` | **The dangerous one.** See below. |

A too-small `logAggregator.volume.size` is the one to actually worry about, because when it fills, nothing visible fails. The change still completes `success`, every step still shows `success`, and `GET /api/changes/<id>/log_lines` simply returns `{"data":[]}` - fluentd has silently dropped the logs it couldn't buffer. The only evidence is in the log-aggregator container's own stdout:

```text
[warn]: failed to write data into buffer by buffer overflow action=:drop_oldest_chunk
[error]: no queued chunks to be dropped for drop_oldest_chunk
```

If you rely on step logs (most installs do), size `logAggregator.volume.size` generously rather than leaving it at the chart default.

Add up every volume's `size` in your `values.yaml` (or the chart defaults, if you haven't overridden them) before moving on to [sizing the dedicated disk](#give-longhorn-a-disk-of-its-own) - that sum is the number the next section's arithmetic depends on.

## Node prerequisites

Longhorn needs two things on every node, and one thing to specifically *not* be running. Check rather than assume, and remediate anything missing:

```bash
# Longhorn needs open-iscsi running (RHEL/OEL/AlmaLinux package: iscsi-initiator-utils)
rpm -q iscsi-initiator-utils || sudo dnf install -y iscsi-initiator-utils
systemctl enable --now iscsid

# an NFS client, for ReadWriteMany volumes
rpm -q nfs-utils || sudo dnf install -y nfs-utils

# multipathd must NOT be running - it fights Longhorn for the block devices
systemctl is-active multipathd   # expect: inactive
sudo systemctl disable --now multipathd   # if it was active
```

Longhorn also ships its own preflight tool covering these checks and more (kernel modules, package managers, open-iscsi service state):

```bash
curl -sSfL -o longhornctl https://github.com/longhorn/cli/releases/download/v1.12.1/longhornctl-linux-amd64
chmod +x longhornctl
./longhornctl check preflight
```

## Give Longhorn a disk of its own

Longhorn's own documented best practice is to dedicate a disk or partition to `/var/lib/longhorn`, sized for the sum of your OpsChain persistent volume requests (from the previous section) plus Longhorn's reserve (30% of the disk, by default) - so the disk needs a total capacity of at least `sum / 0.70`.

Using the chart's own default sizes (registry 20Gi, DB 10Gi, DB backup 20Gi, build cache 50Gi, git repos 5Gi, step data 1Gi, LDAP 1Gi, log aggregator 1Gi = **108Gi**), that's a disk of at least **~155GB**. A trimmed-down install (for example, build cache reduced to 5Gi) can be smaller - a set of PVC requests totalling 63GiB needs at least **~90GB**.

Treat that as a floor, not a comfortable margin. It doesn't budget for growth in the volumes you're actually using, and if you expect to repeat installs while evaluating Longhorn, orphaned volumes from a previous attempt can eat into it before you even get to a stable install - see [repeated installs leak Longhorn scheduling budget](#repeated-installs-leak-longhorn-scheduling-budget) below. Give yourself meaningfully more headroom than the bare arithmetic, particularly for anything beyond a one-off evaluation.

This matters more than it looks, because of how Longhorn computes scheduling headroom - see [Longhorn sizes its headroom from the filesystem's total capacity](#longhorn-sizes-its-headroom-from-the-filesystems-total-capacity) below. A disk shared with the OS and container images can look like it has plenty of free space while Longhorn refuses to schedule anything on it, because Longhorn's sums are based on the filesystem's *total* size, not what's free. A dedicated disk keeps that arithmetic honest and avoids the problem outright.

:::info[`/setup/prerequisites.md`'s general disk sizing doesn't apply here]
The general installation prerequisites state a minimum of 30GB of disk, which is nowhere near enough once Longhorn is enforcing the chart's real PVC sizes. Use the sizing above instead when you're installing onto Longhorn.
:::

**If your node has a spare disk or partition**, format and mount it directly:

```bash
sudo mkfs.xfs /dev/sdb
sudo mkdir -p /var/lib/longhorn
sudo mount /dev/sdb /var/lib/longhorn
echo '/dev/sdb  /var/lib/longhorn  xfs  defaults  0 0' | sudo tee -a /etc/fstab
```

**If it doesn't** - for example, a single-disk evaluation VM - a loopback-backed file can stand in for a real disk, sized per the arithmetic above. This is an evaluation-only fallback, not a production recommendation: capacity is still bounded by whatever filesystem the backing file lives on, and it needs a stable `/etc/fstab` entry (or a systemd mount unit) to survive a reboot, since a bare `losetup` attachment does not persist on its own.

```bash
sudo fallocate -l 160G /var/lib/longhorn.img
sudo mkfs.xfs /var/lib/longhorn.img
sudo mkdir -p /var/lib/longhorn
echo '/var/lib/longhorn.img  /var/lib/longhorn  xfs  loop,defaults  0 0' | sudo tee -a /etc/fstab
sudo mount /var/lib/longhorn
```

## Installing Longhorn

```bash
helm repo add longhorn https://charts.longhorn.io
helm repo update longhorn

helm install longhorn longhorn/longhorn \
  --namespace longhorn-system --create-namespace \
  --version 1.12.1 \
  --set persistence.defaultFsType=xfs \
  --set persistence.defaultClassReplicaCount=1 \
  --set defaultSettings.defaultReplicaCount=1 \
  --wait --timeout 15m
```

:::warning[Copy this exactly - a trailing `#` comment after a `\` line continuation breaks the command]
Bash treats `\` followed by a space as an *escaped space*, not a line continuation, so a comment after `\` on the same line ends the command there and runs the rest as separate (invalid) commands. Do not add inline comments to a backslash-continued command like the one above. The three flags do the following:

- `--set persistence.defaultFsType=xfs` - formats every Longhorn volume XFS instead of the default ext4. Do this from the first install: see [ext4's `lost+found` crash-loops the API](#ext4s-lostfound-crash-loops-the-api-on-readwritemany-volumes) below for what happens if you skip it.
- `--set persistence.defaultClassReplicaCount=1` and `--set defaultSettings.defaultReplicaCount=1` - **single-node clusters only.** Longhorn defaults to 3 replicas per volume, which will never schedule successfully with only one node available.

:::

If you have more than one node, drop the two `ReplicaCount` flags and size Longhorn's replication for your cluster - see [Longhorn's own storage documentation](https://longhorn.io/docs/latest/nodes-and-volumes/volumes/replica-count/) for guidance.

`--wait` returns once Longhorn's `Deployment`/`DaemonSet` resources report ready, but that happens before the CSI sidecars have finished settling - confirm with pod readiness rather than trusting the command's exit code:

```bash
kubectl -n longhorn-system get pods
```

Expect the `csi-attacher`, `csi-resizer` and `csi-snapshotter` pods to restart once or twice while they wait on the node plugin's `/csi/csi.sock` - this is normal and they settle on their own. A first install pulling all 19 pods' images cold takes around 13 minutes; a repeat install with the images already cached takes roughly 3.

## Making Longhorn the default storage class

The Longhorn chart annotates its own storage class as the cluster default on install, so the next step is to remove that annotation from `local-path`, leaving the cluster with exactly one default:

```bash
kubectl patch storageclass local-path \
  -p '{"metadata":{"annotations":{"storageclass.kubernetes.io/is-default-class":"false"}}}'

kubectl get storageclass
# local-path           rancher.io/local-path   Delete   WaitForFirstConsumer   false
# longhorn (default)   driver.longhorn.io      Delete   Immediate              true
```

:::danger[This patch does not survive a K3s restart]
K3s re-applies its own bundled `local-path` manifest - including the `is-default-class: "true"` annotation - every time the `k3s` service starts, silently undoing the patch above. You will see **two** default storage classes afterwards:

```text
NAME                   PROVISIONER
local-path (default)   rancher.io/local-path
longhorn (default)     driver.longhorn.io
```

This doesn't fail loudly. Kubernetes breaks a tie between multiple defaults by picking the newest `CreationTimestamp`, so a probe PVC with no `storageClassName` set will likely still bind to `longhorn` - until something recreates `local-path`'s storage class *after* Longhorn's (a Longhorn reinstall, or a K3s upgrade that recreates the addon), at which point new volumes silently switch to landing on unenforced `local-path` storage - the exact failure mode this guide exists to prevent. K3s restarts are routine (the [instance setup guide](/setup/setup-instance.md#setup-the-custom-ca)'s "Setup the custom CA" section requires one), so don't treat this as a one-off edge case.

Fix it durably with one of the following, rather than re-running the `kubectl patch` after every restart:

- **On a fresh K3s install**, add `local-storage` to the K3s server's disabled addons, alongside the existing `traefik` flag in the [K3s installation guide](/setup/installing_k3s.md#download--install-k3s)'s `INSTALL_K3S_EXEC`: `--disable local-storage`. This stops K3s deploying `local-path` (and its storage class) at all, so there's nothing left to re-default.
- **On an already-running K3s node**, create an empty skip file for the bundled manifest - K3s picks this up immediately and removes the `local-path` storage class, no restart needed:

  ```bash
  sudo touch /var/lib/rancher/k3s/server/manifests/local-storage.yaml.skip
  ```

Either option removes `local-path` entirely rather than merely un-defaulting it - if you want to keep `local-path` available as a non-default option instead, you'll need to re-apply the `kubectl patch` after every K3s restart and periodically confirm there's still only one default with `kubectl get storageclass`.
:::

## Deploying OpsChain

Install (or reinstall) OpsChain exactly as described in the [installation guide](/setup/installation.md) - no `values.yaml` changes are required for storage on a fresh install (see the [migration warning](#background) above if you're converting an existing install). Every OpsChain persistent volume claim will bind against the `longhorn` storage class because it is now the cluster default.

:::warning[A failed first attempt can't just be re-run]
The installation guide's command is `helm upgrade --install`. If the first attempt fails partway through, simply re-running the same command makes it an *upgrade* against an incomplete release, which fires `pre-upgrade` hooks that depend on resources the failed install never created, and the release gets stuck in `pending-upgrade`. For example:

```text
Error: configmap "opschain-config" not found
```

Before retrying, either `helm uninstall opschain -n ${KUBERNETES_NAMESPACE}` or delete the namespace outright (see [reinstalling from scratch](#reinstalling-from-scratch) below), then run the install command fresh.
:::

Confirm the storage class once the release is up:

```bash
kubectl -n ${KUBERNETES_NAMESPACE} get pvc
# every PVC should show STORAGECLASS longhorn
```

A pod's own `df` is the clearest proof capacity is genuinely enforced - compare this against `local-path`, where the same command reports the size of the entire node filesystem:

```bash
# inside opschain-image-registry-0, Longhorn-backed
Filesystem                                              Size  Used Avail Use% Mounted on
/dev/longhorn/pvc-8ffd5731-f5af-4560-854b-119346878938   15G  1.4G   14G   9% /data
```

Budget more time than the installation guide's general estimate for a first install on Longhorn - allow up to 35 minutes for OpsChain to come up cold (all image pulls, no cache), on top of the roughly 13 minutes Longhorn itself took. As with the Longhorn install, judge success by pod readiness rather than `helm`'s exit code: a `--wait --timeout` that expires and reports the release as `failed` does not necessarily mean the install failed - the deployment can still converge to healthy a few minutes later on a slow or busy node. Use `--timeout 60m` for a first install so you're not racing the clock unnecessarily.

## Configure the image registry's ingress

**This is the single most important step in this guide, because nothing about it fails at install time.** `env.OPSCHAIN_IMAGE_REGISTRY_HOST` tells OpsChain which hostname to use *for* the registry - it does not configure the registry's own Ingress. Left at its chart defaults, the `trow` subchart's Ingress renders with no ingress class and the upstream placeholder hostname:

```bash
kubectl get ingress opschain-image-registry
# NAME                      CLASS    HOSTS
# opschain-image-registry   <none>   myregistry.mydomain.io
```

Kong only watches the ingress class `opschain-<namespace>` (set via `kong.ingressController.ingressClass`, already covered in the [installation guide](/setup/installation.md)), so it never routes requests for the registry at all. Because the `opschain-api` Ingress carries a catch-all rule with no host, a request for the registry hostname instead falls through to the API and is answered with the GUI's HTML. This is invisible until the first change runs, and then every change fails at the image pull step with something like:

```text
failed to unpack image on snapshotter overlayfs:
  unexpected media type text/html for sha256:...
```

Configure the `trow` subchart's own Ingress explicitly in your `values.yaml`. Note that `kong.ingressController.ingressClass` alone does not fix this - `trow` never sets `spec.ingressClassName`, so the class has to be supplied via the deprecated `kubernetes.io/ingress.class` annotation instead:

```yaml
trow:
  trow:
    domain: opschain-image-registry.local.gd
  ingress:
    enabled: true
    annotations:
      kubernetes.io/ingress.class: opschain-<namespace>
    hosts:
      - paths: ['/']
        host: opschain-image-registry.local.gd
    tls:
      - secretName: opschain-image-registry-cert
        hosts: [opschain-image-registry.local.gd]
```

Set `trow.trow.domain` and the ingress `hosts`/`tls` entries to match your own `env.OPSCHAIN_IMAGE_REGISTRY_HOST` and certificate, and replace `<namespace>` with your `${KUBERNETES_NAMESPACE}`.

:::note[Verifying the fix: check HOSTS and ADDRESS, not CLASS]
After applying the block above, `kubectl get ingress opschain-image-registry` will **still** show `CLASS <none>` - that's expected, not a sign the fix didn't take. `trow` never sets `spec.ingressClassName` (as noted above, the class only ever comes from the annotation), so the CLASS column never reflects it, correctly configured or not. Check that `HOSTS` shows your configured hostname and `ADDRESS` is populated instead:

```bash
kubectl get ingress opschain-image-registry
# NAME                      CLASS    HOSTS                                     ADDRESS
# opschain-image-registry   <none>   opschain-image-registry.local.gd          192.168.30.75
```

:::

## Troubleshooting

### ext4's `lost+found` crash-loops the API on `ReadWriteMany` volumes

Longhorn gives every volume a freshly formatted filesystem. `mkfs.ext4` creates a `lost+found` directory owned `root:root` with mode `0700`. The OpsChain API runs as uid/gid `10001` and scans the git-repos volume at boot, so if that volume was formatted ext4 it fails to start:

```text
Errno::EACCES: Permission denied - opendir @ /opt/opschain/opschain_project_git_repos/lost+found
  from /opt/opschain/config/application.rb:13
```

The API pod does set `fsGroup: 10001`, but the `ReadWriteMany` volumes are mounted over NFS, and Kubernetes does not apply `fsGroup` ownership management to NFS volumes - so `lost+found` stays root-owned regardless. `local-path` never hits this, because it hands out a plain host subdirectory rather than a fresh filesystem.

Install Longhorn with `--set persistence.defaultFsType=xfs` (as shown above) to avoid this entirely - XFS creates no `lost+found`. If you've already installed with ext4, deleting `lost+found` from the affected volume also works, but has to be repeated after every fresh install.

### `ReadWriteMany` share-manager pods can restart-loop on startup

Even with the chart's default `ReadWriteMany` access mode left in place (see the note in [Background](#background)), a `share-manager` pod can fail to come up:

```text
AttachVolume.Attach failed for volume "pvc-7c68...": Waiting for volume share to be available
```

with its own log showing a startup race against Longhorn's recovery backend:

```text
longhorn_recov_init : Failed to perform CURL operation: Could not connect to server
longhorn_recov_init : Failed to initialize recovery backend. HTTP call error: res=-1
main :NFS STARTUP :CRIT :Recovery backend initialization failed!
main :NFS STARTUP :FATAL :Fatal errors.  Server exiting...
```

`longhorn-manager` then marks the share-manager `error` and backs off for two minutes before retrying, even though `longhorn-recovery-backend` itself is healthy throughout - this is a startup race, not a misconfiguration, and it can block whichever OpsChain pod depends on that volume (for example `opschain-api`, stuck in `ContainerCreating`) indefinitely. Deleting the `ShareManager` custom resource to force a fresh one does not reliably help.

If a share-manager doesn't recover after a few backoff cycles, fall back to `ReadWriteOnce` for the affected `sharedVolumes.*` entry - the historical `local-path` workaround. `accessMode` is immutable on a bound PVC, so this needs a full uninstall and reinstall (see [reinstalling from scratch](#reinstalling-from-scratch)), not just a `helm upgrade`.

### Longhorn sizes its headroom from the filesystem's total capacity

Three Longhorn settings govern scheduling, and all three are computed against the *total* size of the filesystem holding `/var/lib/longhorn`, not its free space:

| Setting | Default | Effect |
| --- | --- | --- |
| `storage-reserved-percentage-for-default-disk` | 30 | Reserved at disk-creation time |
| `storage-minimal-available-percentage` | 25 | Refuses to schedule below this |
| `storage-over-provisioning-percentage` | 100 | No over-commit |

On a filesystem that is already more than around 75% full, Longhorn marks the disk `Schedulable=False` / `DiskPressure` and nothing provisions - every OpsChain PVC sits `Pending` indefinitely. This is Longhorn correctly accounting for real capacity where `local-path` silently over-commits, so it isn't a bug, but it is a dead end rather than a warning, and it cannot be tuned away on a filesystem that is already close to full: the arithmetic needs `storageAvailable - storageReserved` to stay positive *and* exceed `storageMaximum × minimalAvailable%`, and no pair of settings satisfies both once the total is far larger than the free space. This is why [giving Longhorn a dedicated disk](#give-longhorn-a-disk-of-its-own), sized with real headroom, is worth doing before you hit this rather than after.

### Repeated installs leak Longhorn scheduling budget

If you're repeating installs while working through this guide (which the disk sizing above already assumes you might), check Longhorn's own volumes after each teardown, not just `kubectl get pvc`. A `helm uninstall` followed by `kubectl delete namespace` can leave PVs behind in `Released` state, each still holding its Longhorn replica's reservation against your dedicated disk. On a disk sized close to the bare-minimum arithmetic above, that's enough on its own to push the *next* install over the edge - and the failure it produces doesn't mention capacity anywhere a user would naturally look:

```text
AttachVolume.Attach failed ... volume is not ready for workloads:
  volume is currently in detached state with some un-schedulable replicas
```

The real cause is only visible on the Longhorn `Volume` custom resource itself:

```text
Scheduled False ReplicaSchedulingFailure precheck new replica failed: insufficient storage
```

A volume created with zero schedulable replicas stays `faulted` and does **not** recover on its own, even after the orphaned `Released` PVs are cleaned up - it needs the underlying capacity problem fixed first (grow the disk, or free up space), at which point Longhorn re-evaluates and the volume flips back to `attached healthy` within well under a minute.

Verify actual headroom directly, rather than inferring it from `kubectl get pvc`:

```bash
kubectl -n longhorn-system get nodes.longhorn.io -o yaml
# compare status.diskStatus.<disk>.storageScheduled against .storageMaximum
```

### Registry CA trust needs re-establishing for each fresh install

Every OpsChain install mints a new self-signed `opschain-ca`, so a fresh install's runner image pulls fail with `x509: certificate signed by unknown authority` until the node trusts the new authority. Follow [setup the custom CA](/setup/setup-instance.md#setup-the-custom-ca) in the instance setup guide for the steps.

A few things are easy to lose time to here, particularly if you are repeating installs while working through this guide:

- **A stale CA from a previous install can still be present**, and because it shares the same subject CN as the new one, it can be picked as the candidate authority ahead of the correct one - producing a genuinely confusing error where the algorithms don't match (for example `x509: signature algorithm specifies an ECDSA public key, but have public key of type *rsa.PublicKey`). Remove the previous install's CA before trusting the new one.
- **The K3s `registries.yaml` route only applies if your node's K3s uses the containerd runtime.** If your node runs K3s with the docker runtime instead, `registries.yaml` has no effect at all - and neither does adding the registry to docker's `insecure-registries` in `daemon.json`, since the docker runtime's containerd-backed image store still verifies TLS on the actual pull path. Trust the CA via docker's own `certs.d` directory (`/etc/docker/certs.d/<registry-host>:<tls-port>/ca.crt`) and the system trust store instead.
- **`dockerd` caches its CA pool at daemon start**, so updating either the `certs.d` file or the system trust store does not take effect for image pulls until docker is restarted - even though `certs.d` is read fresh on most other operations, the CA pool specifically is not. If you can't restart a shared docker daemon (for example, it's also running other tenants' work), pre-load each affected image into the local docker image store with a tool that does its own TLS handling instead of relying on dockerd's cached pool:

  ```bash
  skopeo copy --src-tls-verify=false docker://<registry-host>:<tls-port>/<image> docker-daemon:<image>
  ```

  OpsChain's runner images are content-addressed and pulled with `imagePullPolicy: IfNotPresent`, so a pre-loaded image is used as-is and never re-pulled.

### Reinstalling from scratch

A handful of Kubernetes secrets and the `opschain-db-backup` PVC are deliberately retained across a `helm uninstall` - see [persistent data](/operations/uninstall/persistent-data.md). If you reinstall with a freshly generated `values.yaml` without clearing these first, the retained `opschain-db-credentials` secret leaves the database initialised with the *old* password while the API is configured with the new one, and the API fails to start:

```text
FATAL: password authentication failed for user "opschain"
pg_hba.conf rejects connection for host "10.42.1.14", user "opschain", database "opschain"
```

For a genuinely clean reinstall - for example, to move an existing install from `local-path` onto Longhorn - delete the namespace rather than just uninstalling the release, as described in the [uninstall guide](/operations/uninstall/index.md#remove-the-opschain-containers-and-data). Budget time for it: the namespace sits in `Terminating` until the `ReadWriteMany` volumes detach, and a pod stuck in `Terminating` may need to be force-deleted before its PVC's finalizers clear.

### Backups need a different approach under Longhorn

The [backups guide](/operations/maintenance/backups.md)'s "copying directly from the volume" method reads the backup PV's `.spec.local.path` to find the files on the node's filesystem. A Longhorn-backed PV has no `.spec.local` at all, so that lookup silently returns empty and the copy command runs against an unintended path instead of failing outright - **do not use that method under Longhorn.** Use the guide's other option, the recovery helper pod (`kubectl cp` against a running pod), instead - it works regardless of storage class. The guide's point about volumes not being resizable in place also doesn't apply here: Longhorn's storage class supports volume expansion, unlike `local-path`.

### Uninstalling Longhorn

`helm uninstall longhorn` fails by default, with an error that names the wrong problem:

```text
Error: uninstallation completed with 1 error(s):
  job longhorn-uninstall failed: BackoffLimitExceeded
```

The real cause is only visible in the failed job's own log: `cannot uninstall Longhorn because deleting-confirmation-flag is set to 'false'`. This is a deliberate Longhorn safeguard against accidental data loss - confirm you want to proceed, then:

```bash
kubectl -n longhorn-system patch settings.longhorn.io deleting-confirmation-flag \
  --type=merge -p '{"value":"true"}'
kubectl delete job -n longhorn-system longhorn-uninstall
helm uninstall longhorn -n longhorn-system
```

:::danger[This leaves your cluster with no working default storage class]
`helm uninstall` removes Longhorn's controllers, but **not** its storage classes - and critically, the `longhorn` storage class keeps its `is-default-class: "true"` annotation even though its CSI driver is now gone. Since you un-defaulted `local-path` earlier in this guide, the cluster is left with exactly one default storage class whose driver no longer exists, and every subsequent PVC sits `Pending` forever with no obvious cause.

Delete both storage classes and restore `local-path` as the default:

```bash
kubectl delete sc longhorn longhorn-static
kubectl patch storageclass local-path \
  -p '{"metadata":{"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
```

If you took the durable route in [making Longhorn the default storage class](#making-longhorn-the-default-storage-class) and disabled K3s's `local-storage` addon entirely, `local-path` won't exist to restore at all - re-enable it first (remove `--disable local-storage` and re-run the K3s install script, or delete the `local-storage.yaml.skip` file you created) before running the commands above.

Also note K3s will re-apply `local-path` as default on its own after any restart (see the warning in [making Longhorn the default storage class](#making-longhorn-the-default-storage-class)), so the `kubectl patch` above may turn out to be unnecessary by the time you next check - but don't rely on the timing, verify with `kubectl get storageclass` either way.
:::

`helm uninstall` also leaves orphaned `volumes.longhorn.io` objects and `VolumeAttachment`s behind - these may need deleting by hand before the `longhorn-system` namespace will finish terminating.

## What to do next

- If you're moving an existing install from `local-path` to Longhorn rather than installing fresh, read the [migration warning](#background) and [reinstalling from scratch](#reinstalling-from-scratch) above before you begin.
- The [backups guide](/operations/maintenance/backups.md) covers backing up your data before making a storage backend change - but see [backups need a different approach under Longhorn](#backups-need-a-different-approach-under-longhorn) first if you're relying on its volume-copy method.
