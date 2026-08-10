---
sidebar_position: 9
---

# Troubleshooting

After following this guide you should understand:

- how to resolve known OpsChain issues
- workarounds for known OpsChain limitations

## General advice

When errors are encountered with OpsChain, the following high-level checklist may be useful:

- check the log output from any relevant changes
- check the log output from Kubernetes, e.g. via [`kubetail -n opschain --since 0`](https://github.com/johanhaleby/kubetail)
  - to see the logs for a specific OpsChain service using `kubetail`, run `kubetail {{service}} -n opschain` (use `kubectl get deployments -n opschain` to see the list of OpsChain services)
- check the [audit history](/getting-started/familiarisation/gui/audit_history.md) for system-generated error events — scheduled changes that silently failed to fire, git fetch failures, action generation errors, and unexpected settings changes are all recorded there
- ensure the OpsChain [hardware/VM prerequisites](/setup/prerequisites.md) are met
  - ensure that adequate disk space is still available
- ensure the system time is accurate
- check [known issues](#known-issues) below
- restart OpsChain and try again
- [contact us](/support.md#how-to-contact-us) for support

### Checking the audit history

The audit history records system-generated errors that do not appear in change logs — for example, a scheduled change that failed to create, a git remote that couldn't be fetched, or an action generation failure. These are often the first sign of a problem that hasn't yet produced a visible failed change.

When diagnosing unexpected system behaviour, filter the audit history by event type prefix `error:` to isolate failures. The detail page for each error event includes a `data` payload containing the actual error message.

A few event types are particularly useful during troubleshooting:

| Event type                                   | What it signals                                              |
|----------------------------------------------|--------------------------------------------------------------|
| `error:git_remote:fetch`                     | A git remote couldn't be reached — connectivity or credentials |
| `error:scheduled_changes:change_creation`    | A scheduled change failed to create                          |
| `error:scheduled_changes:git_sha`            | A scheduled change couldn't resolve its git ref              |
| `error:generate_actions_request:generate`    | Action generation failed for an asset                        |
| `error:api:controller:unhandled`             | The UI hit an unexpected error — details in the event's data payload |
| `api:settings:update`                        | A setting was changed — includes who and what                |
| `warn:settings:override`                     | An `OPSCHAIN_OVERRIDE_*` deployment variable was applied at boot |

:::note
Repeated errors of the same type are deduplicated — OpsChain records them at most once per hour, so a single event entry may represent multiple occurrences.
:::

:::tip
Seeing unexpected behaviour or an error in the OpsChain UI? Filter the audit history for `error:api:controller:unhandled` — this captures unhandled errors from any API request the UI made, and the event's `data` payload includes the underlying error message.
:::

### Identifying running OpsChain processes

OpsChain sets meaningful process titles so that active steps are identifiable in process monitoring tools such as `ps` or `top`:

| Process title                 | Description                                               |
|-------------------------------|-----------------------------------------------------------|
| `OpsChain action server`      | The action server that coordinates step execution         |
| `opschain-action <action>`    | A forked step process running the named action            |
| `mintpress_ctl.rb run_action` | A forked MintModel step process                           |

To list these processes on an OpsChain worker pod:

```bash
kubectl exec -n ${OPSCHAIN_KUBERNETES_NAMESPACE} deploy/opschain-api-worker -- ps -eo pid,args
```

This is useful for correlating a resource-consuming process with the specific step or action currently executing.

### Output resource attributes on error

By default, OpsChain will output the resource type and resource attributes of the resource whose action has failed during a change. If you would like OpsChain to output all the resources defined in your `actions.rb` when an error occurs, set the `OPSCHAIN_LOG_RESOURCES_ON_ERROR` environment variable to `true` in your change properties.

## Known issues

### OpsChain change - `BUG: error: failed to solve`

OpsChain changes may fail with the following error: `BUG: error: failed to solve: opschain-image-registry:8000/limepoint/opschain-runner:2022-05-25 opschain-image-registry:8000/limepoint/opschain-runner:2022-05-25: not found`.

#### Solution - `BUG: error: failed to solve`

Run the following command in your OpsChain server configuration directory (e.g. `~/opschain-configuration`) and then retry your change:

```bash
source .env
kubectl exec -ti -n ${OPSCHAIN_KUBERNETES_NAMESPACE} deploy/opschain-api-worker -- /usr/bin/container_start.sh 'rake opschain:copy_runner_image'
```

### Container "xxxxxxxxxxxx" is unhealthy

The most likely cause of this issue is an invalid or expired licence file, although other scenarios can cause a container to be flagged as unhealthy. To view the container log files execute:

```bash
kubetail -n opschain --since 0
```

:::tip
If you would like to view the logs of a single service, include the service name in the command e.g. `kubetail opschain-api -n opschain --since 0`. A complete list of the OpsChain services is available via `kubectl get deployments -n opschain`.
:::

#### Expired / invalid licence

If your licence file is invalid or has expired when you attempt to start the OpsChain containers, the `opschain-api` will be _unhealthy_ and the service logs will include a message reflecting the licence state:

```text
OpsChain licence file (opschain.lic) has expired.

To obtain a valid licence, please contact LimePoint via:
  - Slack: https://limepoint.slack.com/messages/opschain-support
  - E-mail: opschain-support@limepoint.com
```

#### Other errors

If the logs reflect a different error, please use the [`#opschain-support` Slack channel](https://limepoint.slack.com/messages/opschain-support) or [email](mailto:opschain-support@limepoint.com) for further assistance.

### `opschain-exec` / `opschain-action` - Argument list too long

When using the `opschain-exec` or `opschain-action` commands (for example during an OpsChain step runner image build or from within the OpsChain development environment) the command may fail with the following error:

```bash
.../bin/opschain-exec:4:in `exec': Argument list too long - ... (Errno::E2BIG)
```

This error indicates that the [Environment Variable](/key-concepts/properties.md#environment-variables) properties stored in the OpsChain properties linked to your project and/or environment are too large.

Linux systems have a limit on the size of arguments and environment variables when executing commands. This is the `ARG_MAX` property. `opschain-exec` and `opschain-action` are limited by this system limit.

The `Limits on size of arguments and environment` section in `man 2 execve` talks more about this limit, or more details can be found via your favourite search engine.

#### Solution - E2BIG

You will need to reduce the size of the environment variables in your project or environment [properties](/key-concepts/properties.md)

To resolve this issue remove environment variables (or reduce the size of environment variable names/values) until the error stops appearing - we recommend limiting the size of the environment variables structure to smaller than 64KB to be safe. This is the combined total of project and environment environment variables.

### Poor image build performance

The OpsChain image build service relies on the snapshotting features of the overlayfs or fuse-overlayfs file systems to provide fast layer caching. If the overlayfs and fuse-overlayfs filesystems are unavailable, the build service will fall back to a native snapshotter, causing image build times to be considerably slower. Use the following command to search the build service logs to see if the native snapshotter is in use:

```bash
kubectl logs service/opschain-build-service -n opschain | grep 'native'
```

If the results include output similar to the example below, the build service is using the non-performant snapshotter. E.g.

```text
fuse-overlayfs is not available for /home/user/.local/share/buildkit, falling back to native: fuse-overlayfs not functional, make sure running with kernel >= 4.18: failed to mount
auto snapshotter: using native
```

#### Solution - enable privileged build-service

To configure the build-service to run in a privileged container (that will be able to use overlayfs), edit your `.env`, setting:

```dotenv
OPSCHAIN_IMAGE_BUILD_ROOTLESS=false
```

## Known errors/limitations

### Special characters in resource names

When an OpsChain resource name contains special characters it can't be referenced normally.

The following error may be shown in these cases (however it is not the only type of error that may be reported):

```ruby
NameError: undefined local variable or method `...' for #<OpsChain::Dsl::ResourceConfiguration:...>
```

This error can occur in code like the following:

```ruby
infrastructure_host 'test.opschain.io'

some_resource 'something' do
  host test.opschain.io # attempt to reference the infrastructure_host above
end
```

This code will fail because the `test.opschain.io` resource can't be looked up directly due to the special characters in the resource name.

#### Solution - `ref`

A `ref` method is provided to handle the case where a resource name contains special characters

```ruby
infrastructure_host 'test.opschain.io'

some_resource 'something' do
  host ref('test.opschain.io')
end
```

The `ref` (short for reference) method looks up the resource in the same way as [referencing previous resources](/key-concepts/actions.md#referencing-resources).

### Null bytes in log messages

OpsChain does not support storing null bytes in log message due to an underlying database limitation.

OpsChain replaces all instances of null bytes with a replacement character [U+FFFD](https://en.wikipedia.org/wiki/Specials_(Unicode_block)#Replacement_character) in the log instead. This value would be returned when fetching the log message.

Please [contact us](/support.md#how-to-contact-us) if you have any issues with this limitation or need any extra information.

### Updates made to properties in change "...", step "..." could not be applied

The following error highlights that actions running in concurrent steps have made incompatible modifications to project and/or environment properties and OpsChain is unable to successfully apply the JSON Patch with these property updates.

```ruby
Failed processing step: /opt/opschain/app/commands/process_step_result_command.rb:17:in `rescue in call': Failed processing step "bar" (ProcessStepResultCommand::Error)
# ...
rescue in apply_properties_diff!': Updates made to properties in change "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", step "[xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx] bar" could not be applied - see change logs for more details. (ProcessStepResultCommand::Error)
# ...
in `remove_operation': JSON::PatchObjectOperationOnArrayException (JSON::PatchObjectOperationOnArrayException)
# ...
```

#### Solution - updates made to properties could not be applied

The change logs of the change specified in the error will include a number of JSON documents containing the necessary information to manually correct the OpsChain properties. See the [resolving conflicts](/key-concepts/properties.md#resolving-conflicts) section of the properties reference guide for more information.

##### Preventing future properties update failures

The [properties reference guide](/key-concepts/properties.md#changing-properties-in-concurrent-steps) includes a number of examples of properties updates that will cause JSON Patch failure. Review the code in your `actions.rb` and where possible avoid these types of updates.

### OpsChain change - `OpsChain wait steps can't be created as actions - they can only be used as steps.`

OpsChain [wait steps](/key-concepts/actions.md#wait-steps), and the associated `OpsChain.wait_step` method, can't be used as an action name. This means that the following code is invalid:

```ruby
# invalid, don't do this
action OpsChain.wait_step, steps: [:do_something]
```

#### Solution - use `OpsChain.wait_step` as the first child of the change action

```ruby
action :do_something_with_acknowledgement, steps: [OpsChain.wait_step, :do_something]
```

### OpsChain change - `OpsChain wait steps can't be used as prerequisites.`

OpsChain [wait steps](/key-concepts/actions.md#wait-steps), and the associated `OpsChain.wait_step` method, can't be used as [prerequisite actions](/key-concepts/actions.md#prerequisite-actions). This means that the following code is invalid:

```ruby
# invalid, don't do this
action do_something: [OpsChain.wait_step] do
  # after wait step
end
```

#### Solution - only use `OpsChain.wait_step` within `steps`

OpsChain wait steps can only be used within the `steps` definition. Restructuring the example above allows the code to use the `OpsChain.wait_step` in the `steps` definition rather than as a prerequisite:

```ruby
action :do_something_with_acknowledgement, steps: [OpsChain.wait_step, :do_something]

action :do_something do
  # after wait step
end
```

### OpsChain change - parallel steps run before wait step

OpsChain [wait steps](/key-concepts/actions.md#wait-steps), and the associated `OpsChain.wait_step` method, can be used with parallel `steps` - however this means that all the sibling parallel steps will kick off whilst the wait step is waiting, not before. For example:

```ruby
# warning - the `do_something_1` and `do_something_2` steps will run before the wait step has been continued
action :broken_acknowledgement_example, steps: [OpsChain.wait_step, :do_something_1, :do_something_2], run_as: :parallel
```

#### Solution - parallel steps with wait step

To make the change pause before the parallel steps, add a step that runs before the parallel steps:

```ruby
action :do_something_with_acknowledgement, steps: [OpsChain.wait_step, :do_something_parallel]

action :do_something_parallel, steps: [:do_something_1, :do_something_2], run_as: :parallel
```

### OpsChain Gemfile conflicting with existing Gemfile

If using OpsChain with a Ruby project, the OpsChain Gemfile may conflict with the existing Gemfile in the repo - for example it may include dependency conflicts, or it may slow down the OpsChain steps as additional dependencies are installed that aren't required by the OpsChain step.

#### Solution - use the `BUNDLE_GEMFILE` configuration

To avoid the conflict, OpsChain can be configured to look for the Gemfile at a different path - e.g. `.opschain/Gemfile` - to avoid conflicting with the main repo Gemfile.

To do so, add `ENV BUNDLE_GEMFILE=/opt/opschain/.opschain/Gemfile` to your project's custom runner image before the `RUN bundle install` lines. Adjust the path as required and then ensure you create the OpsChain Gemfile at the new path in the repo. An example of the Dockerfile may be:

```dockerfile
...
USER opschain
ENV BUNDLE_GEMFILE=/opt/opschain/.opschain/Gemfile
RUN --mount=type=secret,required=true,id=env_context_json,uid=10001,gid=10001,target=/opt/opschain/.opschain/step_context.json \
    opschain-exec bundle install
...
```

### OpsChain build service pod stuck in 'pending' state during an upgrade

If the configuration option [OPSCHAIN_BUILD_SERVICE_ROOTLESS](/setup/configuration/additional-settings.md#buildservicerootless) is set to true and the `opschain-build-service` pod is stuck in a 'pending' state during an upgrade, it may be that the `fuse-device-plugin-daemonset` daemonset is not running or requires a restart. This pod is responsible for making the required FUSE devices on the node, available to the `opschain-build-service` pod when running in rootless mode.

If this is the case, the `opschain-build-service` pod will show events similar to the following:

```bash
Warning  FailedScheduling  22m                  default-scheduler  0/1 nodes are available: 1 Insufficient github.com/fuse. preemption: 0/1 nodes are available: 1 No preemption victims found for incoming pod.
Warning  FailedScheduling  6m23s (x7 over 22m)  default-scheduler  0/1 nodes are available: 1 Insufficient github.com/fuse. preemption: 0/1 nodes are available: 1 No preemption victims found for incoming pod.
```

#### Solution - restart the `fuse-device-plugin-daemonset` daemonset

To restart the `fuse-device-plugin-daemonset` daemonset, run the following command:

```bash
kubectl rollout restart daemonset/fuse-device-plugin-daemonset -n opschain
```

### Step build failing with `failed to convert whiteout file`

When building a step runner image the change logs report:

```text
#10 [stage-0 2/6] ADD ./repo.tar .
#10 ERROR: mount callback failed on /run/user/1000/containerd-mount1276938060: failed to convert whiteout file "tmp/.wh.setup": unlinkat /run/user/1000/containerd-mount1276938060/tmp/setup: input/output error
------
 > [stage-0 2/6] ADD ./repo.tar .:
------
Dockerfile:11
--------------------
   9 |
  10 |     # The step below adds the Project Git repository (including the .git directory).
  11 | >>> ADD ./repo.tar .
  12 |
  13 |     # Optional - the Git rev this change was created with. Useful when running scheduled changes to know the current branch.
--------------------
error: failed to solve: failed to compute cache key: mount callback failed on /run/user/1000/containerd-mount1276938060: failed to convert whiteout file "tmp/.wh.setup": unlinkat /run/user/1000/containerd-mount1276938060/tmp/setup: input/output error
Failed to build step runner image
```

#### Solution - enable building with fuse-overlayfs via settings

Your Kernel version might not support `overlayfs` and couldn't find a compatible snapshotter. You can enable the out-of-the-box `fuse-overlayfs` snapshotter via your `values.yaml` file.

Refer to the [image building settings](/setup/configuration/additional-settings.md#image-building-settings) section of the configuration guide for more information.

### Image build failing with `p11-kit: couldn't create file`

When running a change or generating actions, the step runner image build may fail with a log entry such as:

```text
#14 26.53 p11-kit: couldn't create file: /etc/pki/ca-trust/extracted/openssl/ca-bundle.trust.crt: Unknown error 13
```

#### Solution - update the FROM image version

Enable the `system logs` option in the activity details to view the full image build output. Look for the `FROM` line in the build log, e.g.:

```dockerfile
FROM opschain-image-registry:8000/limepoint/opschain-runner-enterprise:{{version}}
```

The image tag must be `2026-06-17` or greater. Update your project's Dockerfile to reference an image at that version or later and retry the change.

:::note

This error most commonly occurs with [custom runner images](/key-concepts/step-runner.md#custom-step-runner-dockerfiles). After upgrading OpsChain (including to `2026-06-17`), ensure any custom runner images are rebuilt against the new base image before running changes.

In that case, the `FROM` line would look like:

```dockerfile
FROM {{custom-runner-image}}
```

:::

### Error - Decode error on login

This likely means `token.secret_key` is unset.

#### Solution - Update the value of `token.secret_key`

To update the value from the backend, run the following:

```bash
kubectl exec -n ${KUBERNETES_NAMESPACE} deploy/opschain-api -- /usr/bin/container_start.sh "rails runner 'ConfigurationService.update({ %(token) => { %(secret_key) => SecureRandom.hex(64) } })'"
```

:::info

After doing this, all users will need to log back in.

:::

#### Solution - Clear cookies

Clearing your browser cookies may be required after updating the `token.secret_key` value (although this is unlikely).

### CNPG service unavailable - `no endpoints available for service "cnpg-webhook-service"`

:::note

If this error appears while running `helm install` or `helm upgrade`, see [CNPG webhook not ready during installation or upgrade](#cnpg-webhook-not-ready-during-installation-or-upgrade) instead. OpsChain waits for the webhook before creating its database resources, so an installation that fails this way has a different cause and a different diagnostic path.

:::

This error might occur when patching MintPress or during regular operations. This is likely due to the CNPG operator leader election failing. The issue usually resolves itself after a few minutes.

Run these commands to obtain useful information:

- check the operator pods: `kubectl get pods -n cnpg-system`
- check the nodes in the cluster: `kubectl get nodes -o wide`
- check if the K3s API is up: `kubectl exec -n ${KUBERNETES_NAMESPACE} deploy/opschain-api -- curl -kv --max-time 5 https://10.43.0.1:443/healthz`
- check K3s logs: `journalctl -u k3s --since "1 hour ago" | tail -200`

#### Solution - restart the K3s service

Ultimately, if the issue persists, you may need to restart the K3s service.

```bash
systemctl restart k3s
```

### CNPG webhook not ready during installation or upgrade

Before creating any database resources, OpsChain waits for the CNPG operator's webhook to be accepting connections. If it never becomes ready, the installation stops with a failed pre-install hook naming the `opschain-cnpg-webhook-ready-check` job, rather than proceeding and failing with a `no endpoints available for service "cnpg-webhook-service"` error part way through.

The job's log identifies which check failed:

```bash
kubectl logs -n ${KUBERNETES_NAMESPACE} job/opschain-cnpg-webhook-ready-check --all-containers
```

- `deployments.apps "cnpg-controller-manager" not found` - the CNPG operator is not installed. Follow [install the CNPG operator](/setup/configuration/preparing-your-environment.md#install-the-cnpg-operator).
- `timed out waiting for the condition on deployment/cnpg-controller-manager` - the operator is installed but is not running. Run `kubectl get pods -n cnpg-system` - a pod stuck pulling its image usually means the `opschain-operator-secret` pull secret is missing, or holds Docker Hub credentials that cannot access the operator image.
- `timed out waiting for the condition on endpoints/cnpg-webhook-service` - the operator is running but has not registered its webhook. Run `kubectl get endpoints cnpg-webhook-service -n cnpg-system` to confirm it has no addresses, then check the operator's own log with `kubectl logs -n cnpg-system deploy/cnpg-controller-manager`.

:::note

If the hook fails, Helm leaves the job in place so it can be inspected. A successful run is also kept, so `kubectl get job -n ${KUBERNETES_NAMESPACE} opschain-cnpg-webhook-ready-check` confirms whether the last installation or upgrade passed this check. Either way, the job is replaced the next time you install or upgrade.

:::

#### Solution - re-run the installation or upgrade

Once `kubectl get pods -n cnpg-system` shows the operator running, re-run the same `helm install` or `helm upgrade` command. No cleanup is required first - the check runs again from the start.

### `helm upgrade` fails with `context deadline exceeded`

An OpsChain `helm upgrade` may run for the full `--timeout` period and then fail with no explanation beyond:

```text
Error: UPGRADE FAILED: context deadline exceeded
```

Running the upgrade with `--debug` shows what Helm was waiting for, repeated until the deadline expired:

```text
Deployment is not ready: opschain/opschain-api. 0 out of 1 expected pods are ready
client rate limiter Wait returned an error: rate: Wait(n=1) would exceed context deadline
```

:::warning[The rate limiter messages are not the cause]

`client rate limiter Wait returned an error` appears whenever Helm's `--wait` deadline expires, whatever the underlying reason. It is a consequence of the timeout, not an explanation for it, and investigating it will not lead anywhere. The line to act on is the one above it - `opschain-api` never became ready.

:::

One reason for `opschain-api` not becoming ready is that the OpsChain secret vault is unavailable. The API pod configures the vault as part of its startup and cannot complete that step unless the vault is running and unsealed, so the pod ends up in `CrashLoopBackOff`, the deployment never reaches `1/1`, and the upgrade eventually times out.

A vault that has sealed itself is detected and restarted automatically, and it unseals itself as it starts, so it recovers within about three minutes without intervention. An upgrade still blocked on the vault therefore points to one of two situations:

- the vault cannot start at all - almost always because the OpsChain database is unreachable. The vault pod will be restarting repeatedly rather than sitting sealed.
- the deployment is on an earlier release, from before a sealed vault was restarted automatically. There, a vault that seals stays sealed indefinitely.

:::caution[On earlier releases the vault may have sealed long before the upgrade]

The API only contacts the vault when it starts, so an OpsChain instance that is already running keeps working normally after the vault seals. Where a sealed vault is not restarted automatically, nothing is visibly wrong until the next time the API pod restarts - which can be hours or days later, during an otherwise unrelated upgrade. Do not assume the vault sealed when the upgrade began; check the vault's log to establish when it actually happened.

:::

#### Diagnosis - sealed secret vault

Start with the pods:

```bash
kubectl -n ${KUBERNETES_NAMESPACE} get pods
```

`opschain-api` will be restarting repeatedly, usually reported as `CrashLoopBackOff`. What `opschain-secret-vault-0` is doing alongside it distinguishes the two situations above:

- `0/1` in the `READY` column while its status stays `Running` - the vault is up but reporting itself as not ready, which is what a sealed vault does. Expect this to clear by itself within a few minutes; if it persists, the deployment is on a release that does not restart a sealed vault automatically.
- `CrashLoopBackOff` - the vault cannot start at all. Its log will say why, and an unreachable OpsChain database is by far the most likely reason.

Confirm the seal state directly:

```bash
kubectl -n ${KUBERNETES_NAMESPACE} exec opschain-secret-vault-0 -- bao status -tls-skip-verify
```

Look for `Sealed  true` in the output.

:::note[Why `-tls-skip-verify` is required]

The vault's certificate is issued for its internal DNS name and does not include an IP subject alternative name, so a connection made to `127.0.0.1` from inside the pod cannot validate it. `-tls-skip-verify` is expected here, and the certificate error reported without it is not itself a problem - the certificate is valid for the name the OpsChain API actually connects to.

:::

To establish when and why the vault sealed, search its log:

```bash
kubectl -n ${KUBERNETES_NAMESPACE} logs opschain-secret-vault-0 | grep -i "seal\|storage"
```

The entries immediately before `core: marked as sealed` identify the trigger - typically a storage or PostgreSQL connection error.

Finally, confirm the API is failing in vault setup rather than for some other reason:

```bash
kubectl -n ${KUBERNETES_NAMESPACE} logs <api pod name> --previous
```

:::note[The API error is not self-explanatory in current releases]

Rather than reporting that the vault is sealed, current releases surface this as a type error raised while the vault is being configured:

```text
Tasks: TOP => opschain:setup_vault
TypeError: no implicit conversion of Symbol into Integer
/opt/opschain/app/services/secret_vault_service.rb
```

If you see this trace, treat it as confirmation that the vault is sealed. A clearer message is planned for a future release.

:::

#### Why the vault seals

The OpsChain secret vault stores its data in the OpsChain PostgreSQL database. If the database becomes unreachable - even briefly - the vault loses its lock on that storage, cannot restore its leases, and seals itself to protect its contents.

The database does not have to stop for this to happen. If the database pod is marked as not ready for long enough to be removed from the `opschain-db-rw` service's endpoints, that service's cluster IP refuses connections even though PostgreSQL itself never stopped. From the vault's point of view this is indistinguishable from an outage.

Once sealed, the vault cannot unseal itself where it stands. It unseals from its mounted seal key automatically, but only while the vault process is starting, so restarting the vault is what unseals it. OpsChain now does that for you - a sealed vault fails its health check and Kubernetes restarts the container, bringing it back unsealed. The thresholds are deliberately relaxed so that a vault that is merely slow is left alone, which is why a genuinely sealed one takes about three minutes to be restarted rather than seconds.

What an automatic restart cannot do is unseal a vault whose database is still unreachable. The restarted vault has nothing to start against, so it fails and is restarted again, appearing as `CrashLoopBackOff`. That is a loud, visible failure rather than a silent one, and it clears by itself once the database is reachable again.

On releases before this behaviour was introduced, nothing restarted a sealed vault. It sat at `0/1` indefinitely, with no failed pod and no ongoing errors to draw attention to it, and had to be restarted by hand.

#### Solution - restart the secret vault

If the vault is sealed and has not already restarted itself, restarting it by hand has the same effect - it unseals from its mounted seal key as it starts:

```bash
kubectl -n ${KUBERNETES_NAMESPACE} delete pod opschain-secret-vault-0
```

Wait for the replacement pod to report `1/1 Running`, then confirm it came back unsealed:

```bash
kubectl -n ${KUBERNETES_NAMESPACE} exec opschain-secret-vault-0 -- bao status -tls-skip-verify
```

`Sealed` should now be `false`. Once it is, re-run the `helm upgrade` command that failed. An upgrade that fails this way leaves the release in `failed` status rather than `pending-upgrade`, so the retry is not blocked and there is no need to `helm rollback` first - `helm -n ${KUBERNETES_NAMESPACE} list -a` confirms the release's current status.

:::caution[Restore database connectivity first]

If the database is still unreachable, the restarted vault will not be able to start at all and will crash-loop instead of coming back unsealed, so restarting it achieves nothing until the database is back. Verify the database is reachable from inside the cluster first - the [debug toolbox](/operations/maintenance/debug-toolbox.md#using-the-deployment) provides `ncat -vz opschain-db-rw 5432` and related checks for exactly this. Once the database is reachable again, a crash-looping vault recovers on its own.

:::

:::note

If `opschain-api` becomes ready but the `opschain-api-worker` pods remain unavailable after an upgrade, that is a separate problem with a separate fix - the runner image for the new version may not yet have been copied into the internal image registry. See [`BUG: error: failed to solve`](#opschain-change---bug-error-failed-to-solve) for the command that copies it in.

:::
