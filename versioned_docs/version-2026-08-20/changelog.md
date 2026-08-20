---
sidebar_position: 1
description: Learn about new releases of OpsChain, including new features and updates.
---

# Changelog

:::warning
OpsChain should be upgraded sequentially, one version at a time. Skipping versions may result in data loss and unexpected behaviour.

Follow the [upgrade guide](operations/upgrading.md) for more information on how to upgrade OpsChain.
:::

## [2026-08-20]

### Important breaking changes {/* #2026-08-20-important-breaking-changes */}

- A step name containing `/` is now confined to a single segment of a step's path, with the separator replaced by `_`. Previously it contributed a segment per `/`, so a step named `Deploy A/B` was indistinguishable from a step `B` nested under a step `A`. Existing changes are updated when you upgrade, but any [`skip_steps`](/key-concepts/changes.md#skipping-steps) pattern or [`starting_step`](/key-concepts/changes.md#starting-a-change-partway-through) you supply from now on must use the new form. See [change step naming](/key-concepts/actions.md#change-step-naming).
- Two actions in the same namespace can no longer share a step name. Defining both now fails when a template's actions are derived, naming the two actions and where each was defined, rather than quietly moving one of them to a different path in the step tree. Step names are compared ignoring case, so `Install binaries` and `Install Binaries` count as the same name — rename one of any such pair before upgrading. Extending an action with `ignore_defined` no longer waives this, and cannot give the action a second step name. See [change step naming](/key-concepts/actions.md#change-step-naming).

### Added {/* #2026-08-20-added */}

- The full `values.yaml` shipped with each release can now be downloaded straight from the documentation, so a new installation can start from the release's defaults and an upgrade can be compared against them without logging in to Helm first. Each version of the documentation links to the `values.yaml` of its own release. See [obtaining a full `values.yaml` from the chart](/setup/configuration/index.md#obtaining-a-full-valuesyaml-from-the-chart).
- Action code can now run the OpsChain CLI while a change or agent is running, using the new `opschain_cli` keyword. The CLI is authenticated automatically with the change's own short-lived credentials, so an action can alter OpsChain — starting a change on another node, or updating a node's properties — with no API key stored in the project's repository. See [running the OpsChain CLI](/key-concepts/actions.md#running-the-opschain-cli).
- A Git remote can now be fetched on its own schedule instead of following the interval set for its project. The interval can be set on a single remote or across a selection of them, and the remotes list shows which carry an override and which are inheriting one. See [`git_remote.periodic_fetch_interval`](/key-concepts/settings.md#git_remoteperiodic_fetch_interval).
- Permission to create a secret can now be granted on a node, so a user administering one project can store secrets against it without also being able to write secrets anywhere else in the instance. The existing instance-wide grant is unchanged.

### Changed {/* #2026-08-20-changed */}

- The port an external client dials to reach the OpsChain secret vault is now set as `global.secretVaultExternalPort`. It was previously called `global.ingressTlsPort`, which was easily confused with `OPSCHAIN_INGRESS_TLS_PORT` — a different port, despite the similar name. The old name still works, reporting a warning after each deploy, so rename it in your `values.yaml`. See [`global.secretVaultExternalPort`](/setup/configuration/additional-settings.md#globalsecretvaultexternalport).
- A fresh install now stops with an error when `OPSCHAIN_INGRESS_TLS_PORT` and `kong.proxy.tls.servicePort` disagree, rather than leaving the mismatch to surface later as a node that cannot pull a runner image. An existing instance is upgraded rather than blocked — it has evidently been reaching Kong on the port it resolves — but the upgrade reports a warning asking you to confirm the difference is deliberate. See [`OPSCHAIN_INGRESS_TLS_PORT`](/setup/configuration/additional-settings.md#opschain_ingress_tls_port).
- A periodic fetch interval above one day is now rejected when it is saved, rather than accepted and quietly reduced to a day. See [`git_remote.periodic_fetch_interval`](/key-concepts/settings.md#git_remoteperiodic_fetch_interval).
- A change or MintModel render no longer waits on a large image download before it can start. The runner and MintModel API images are pulled during installation rather than when they are first needed, and a released version's MintModel API image is taken from the node's cache rather than downloaded again for every render. See [`imageWarmJob.enabled`](/setup/configuration/additional-settings.md#imagewarmjobenabled).
- Improved the performance of deriving a template's actions — a template declaring a large number of actions took several minutes, and now completes in well under a second.
- Data returned by the [`query`](/key-concepts/actions.md#querying-the-api) keyword in action code can now be read with either string or symbol keys.

### Fixed {/* #2026-08-20-fixed */}

- A runner image is no longer reused by a change whose base runner image may genuinely differ. OpsChain identifies the base runner by its image digest, but when that digest could not be resolved it fell back to the image's name and tag — which is the same string even when the image behind it has changed, as it does on a moving tag such as `edge`. Two changes then produced the same image content key and the second reused the first's image instead of building its own. Such a build now builds its own image rather than reusing one, and records a `warn:image_build:base_runner_digest_unavailable` event against the change or template version so the lost reuse is visible.
- Setting `runner.image_override` is treated as a deliberate pin, so images are still reused between changes that share the same override. If you point an override at a moving tag, OpsChain will continue to reuse an image built from an earlier version of it — pin the override to a digest or an immutable tag if you need each change to rebuild. See [`runner.image_override`](/key-concepts/settings.md#runnerimage_override).
- Shortening the periodic fetch interval now takes effect on the next fetch, rather than only after the previously configured interval had elapsed — up to a day later.
- Fixed a fresh install failing to complete while the runner images were copied into the internal registry. The copy no longer waits behind the readiness of the pods that are waiting on it, an instance that lets the runner image name derive from `OPSCHAIN_RUNNER_NAME` no longer leaves the API worker unable to start, and a copy that cannot succeed now fails promptly and names the image rather than waiting indefinitely.
- Approving, continuing or rejecting a step required only permission to see the step, so a rule denying execute on a node was ignored and any user who could view a waiting step could resume the change. Step and workflow step transitions now require execute permission.
- Uploading a file property is now authorised against the node that owns the properties, so a rule granting update on that node permits it. The check was previously made against a path no rule could name, so in practice only a superuser could upload one.
- Triggering an LDAP directory refresh now requires a superuser; any authenticated user could previously start it.
- A step name used by one action in each of several resources is now resolved in the resource that references it, rather than reported as ambiguous and left unusable from its own resource.
- Cancelling a change or workflow run no longer requires `delete` permission — anyone who can run the action can now stop it. Previously the only practical way to let a user cancel their own changes was to grant `delete` across the whole project, which also allowed them to delete every environment, template and asset in it. See [authorisation rule actions](/getting-started/familiarisation/gui/manage_security.md#authorisation-rule-actions).

## [2026-08-14]

### Before upgrading {/* #2026-08-14-before-upgrading */}

:::warning[Template codes must now be unique within a project]
A template's code previously only had to be unique per template type, so a project could hold an asset template and an agent template sharing a code. That is no longer allowed, and the upgrade stops with an error listing every project that still holds such a pair rather than choosing which one to archive for you.

Any project created from the OpsChain sample data has one — an asset template and an agent template both coded `simple`. Archive or rename one template of each listed pair before upgrading.
:::

:::warning[The secret vault hostname must now resolve inside the cluster]

- The secret vault now runs as several replicas. A request that lands on a standby replica is redirected to the active one at `global.secretVaultExternalHostName`, so that hostname must now resolve **from inside the Kubernetes cluster**, not only from client machines.
- If it does not, the OpsChain API can fail to start after upgrading, reporting that it cannot resolve the vault hostname. See [secret vault requests fail with `Name or service not known`](/troubleshooting.md#secret-vault-requests-fail-with-name-or-service-not-known) to diagnose and recover.
- Before upgrading, confirm it resolves from within the cluster — see [secret vault hostname](/setup/configuration/tls/index.md#secret-vault-hostname) for the check, and for the `coredns-custom` ConfigMap to add it to CoreDNS if it does not.
- In a [high availability setup](/advanced/ha/index.md#external-service), each cluster's CoreDNS must resolve the external hostname of **every** cluster's secret vault, since the active vault can move between clusters.

:::

:::warning[Load balancers that translate the ingress port must now set `global.ingressTlsPort`]

- `global.ingressTlsPort` builds the address a standby secret vault replica redirects callers to. It previously defaulted to `443`; it now follows `kong.proxy.tls.servicePort`, so the two cannot be configured inconsistently.
- Set it explicitly before upgrading **if a load balancer in front of your cluster translates the port** — if it accepts connections on 443 and forwards to Kong on 17001, set `global.ingressTlsPort: 443`. Otherwise leave it unset.
- Without it, reading secrets fails intermittently with `no route to host`. See [secret vault requests fail with `no route to host`](/troubleshooting.md#secret-vault-requests-fail-with-no-route-to-host) to diagnose and recover.

:::

### Important breaking changes {/* #2026-08-14-important-breaking-changes */}

- This release changes the step context format used by every runner image. Rebuild any _custom runner images_ after upgrading — because OpsChain can reuse a previously built custom runner image, an already-upgraded instance can still pick up an image built before the upgrade and fail. See [step context JSON](/key-concepts/step-runner.md#step-context-json).

### Added {/* #2026-08-14-added */}

- Each project's Git remotes are now fetched periodically in the background, so OpsChain's copy of a repository is already close to up to date when it is needed — creating or starting a change, generating an asset's actions, or reading properties committed to the repository. Fetches are spread out rather than all falling due at once, and a remote that cannot be reached is retried progressively less often and recorded as an event, rather than being retried at full rate indefinitely. How often this happens can be changed globally or for an individual project. OpsChain also records a periodic event summarising how the background fetching is going across all of your Git remotes — how many are failing, how stale the least recently fetched one is, and how long fetches are taking — which is written once a day by default and can be adjusted or turned off. See [`git_remote.periodic_fetch_interval`](/key-concepts/settings.md#git_remoteperiodic_fetch_interval) and [`git_remote.periodic_fetch_summary.enabled`](/key-concepts/settings.md#git_remoteperiodic_fetch_summaryenabled).
- Action code can now check out one of a project's configured Git remotes into a step's working environment via the new `git_clone` resource, without needing credentials or a fresh clone — OpsChain checks it out from its own local mirror of the remote. Which remotes are available for this is controlled by the new [`git_remote.mountable` setting](/key-concepts/settings.md#git_remotemountable). See the [`git_clone` resource](/advanced/included-resource-types.md#opschain-git-clone).
- A directory on the Kubernetes node can now be bind mounted into the pods that run your changes, so a change can reach large staging areas — installation media, for example — that are impractical to commit to a Git repository or bake into an image. Each mount names the directory on the node and the path it appears at inside the pod, which do not have to match, and can be read only or writable. Mounts can be configured for the change worker, step runner and agent pods individually, or once for all of them, and are set at any level of the settings hierarchy — most usefully on a template version, so every asset built from it inherits the mount, with an individual asset able to adjust or remove it. Note that the directory must already exist on the Kubernetes node - on every node a runner pod may be scheduled onto, and must be readable by user ID `10001`. See [`pod_templates.<pod type>.volumes`](/key-concepts/settings.md#pod_templatespod-typevolumes).
- Properties and settings can now be set on an asset template itself, so values shared by every version of the template no longer have to be repeated on each one. They resolve between the environment and the template version, and an individual version can still override them. Edit them from the template's **Properties** and **Settings** tabs. See [template and template version properties](/key-concepts/properties.md#template-and-template-version-properties).
- A template version can now follow the Git branch or tag it was created with, rather than staying pinned to the commit that revision first resolved to. When the revision moves, OpsChain refreshes the version and rebuilds the actions of the assets using it without being asked. A version that follows its revision cannot also be locked, and one whose revision cannot be resolved keeps serving the commit it already had and reports why it last failed to follow it. Following can be turned on or off from the template versions list or a version's page, individually or for several versions at once. See [following a Git revision](/getting-started/familiarisation/gui/projects/asset_templates.md#following-a-git-revision).
- The CPU and memory each type of pod requests, and is limited to, can now be configured — the change worker, step runner, agent, action generation and MintModel API pods. They can be set at any level of the settings hierarchy, including as a per change override, so a single large change can be given more without raising the limit for the whole instance. See [`pod_templates.<pod type>.resources`](/key-concepts/settings.md#pod_templatespod-typeresources).
- The pods OpsChain creates to run its own work can now be deleted from the administration screen's **Pods** tab, individually or several at once, so an operator can clear a wedged pod without needing access to the cluster. Only the pods OpsChain creates itself can be deleted, deleting one requires superuser access, and the list now names the Kubernetes controller managing each pod so it is clear which are which. See [deleting a pod](/getting-started/familiarisation/gui/pods.md#deleting-a-pod) and the [API reference](pathname:///api-docs/#tag/Admin-operations).
- Action code can now query the OpsChain API while an asset's step tree is being derived, by passing `run_in_dry_run: true` — previously such a query failed, as no API key reached the pod that generates the actions. By default a query made at this point is skipped, returning an empty result and warning, naming the `actions.rb` line that made the call and what it returned in place of the response. See [querying while your actions are being discovered](/key-concepts/actions.md#querying-while-your-actions-are-being-discovered).
- An asset now reports why its MintModel actions are unavailable — its properties or its template version have moved since the actions were generated, the MintModel was never concretised, generating it failed, or the template version carries no MintModel — rather than only that they are. See [when an asset's MintModel actions are unavailable](/getting-started/familiarisation/gui/projects/assets.md#when-an-assets-mintmodel-actions-are-unavailable).
- A secret can now be stored by someone whose permission covers only the node the secret belongs to, rather than requiring a permission that writes secrets anywhere in the instance. Someone administering a single project can therefore store secrets against their own project without also being able to write secrets against every other one. An existing instance-wide permission keeps working exactly as before, so this only widens who may store a secret, and the error reported when the permission is missing now names both the node's secrets path and the instance-wide one. See [writing to the vault](/getting-started/familiarisation/gui/manage_security.md#writing-to-the-vault).

### Changed {/* #2026-08-14-changed */}

- A template's code must now be unique within its project regardless of the template's type, rather than only unique amongst templates of the same type. Addressing a template by its code — when creating an asset or an agent, or when a repository directory named after the template code supplies a custom `Dockerfile` — is now unambiguous. The agent template in the OpsChain sample data is now coded `simple_agent` accordingly.
- The changes, workflows, workflow runs, MintModels and MintModel history list endpoints now return 100 records by default, rather than up to 10,000. A request that omitted `limit` previously fell back to the endpoint's *maximum* page size, so it could return up to 10,000 fully serialised records — slow to build, and large enough to consume a substantial amount of memory in the OpsChain API. Pass a higher `limit` to request more, up to each endpoint's maximum, and use `meta.partial_response` to detect when further records match. Every other list endpoint is unchanged, including the log line endpoints (step, workflow run, node background task and agent log lines), which continue to default to 10,000.
- When two authorisation rules apply to the same path with equal precedence — the same specificity, and neither more specific by user, group or system — the actions they permit are now combined so that the more restrictive rule wins. Previously the rule that happened to be evaluated last decided the outcome, which meant a deny could be overridden by an equally precedent allow, and the result was not guaranteed to be the same from one request to the next. This makes deny rules reliable at equal precedence, and it applies to secret decryption and encryption permissions as well. Two rules that each *grant* a different action at equal precedence are also combined, so access may be narrower than before in that case — if you rely on complementary grants at the same specificity, make one of them more specific than the other.
- Improved the performance of the GUI's activities and jobs pages by capping the total record count they show at `1000+`, rather than counting every matching record on every request. A new `exact_count` parameter requests the exact total where it is needed — see the [activities API reference](pathname:///api-docs/#tag/Activities).
- Improved the performance of the dashboard and the activity pages, most noticeably a project's, environment's or asset's activity page on an installation with a large change history. The dashboard also downloads considerably less data than before.
- Improved the performance of listing projects, environments and assets, which could take several seconds on an installation holding a large number of nodes.
- Improved the performance of reading a change's or workflow run's log, most noticeably on an installation holding a large number of log lines. The database index this needs is built as part of the upgrade without taking the table offline, but it can take a while to complete on a large installation.
- Improved the performance of cancelling and retrying a change, most noticeably on a change carrying a large number of steps.
- Action code running in a change, in an agent, or while an asset's actions are generated is now always supplied with an API key, so [`query`](/key-concepts/actions.md#querying-the-api) and [`send_email`](/key-concepts/actions.md#sending-email) can be used without any configuration. The `token.change_api_key_expiry_days` and `token.agent_api_key_expiry_days` settings have been removed accordingly, and are pruned from your existing settings as part of the upgrade. Each key is issued with the longest expiry OpsChain permits and is revoked as soon as the change, agent or task that owns it finishes.
- A template version that has never resolved a Git revision, or whose last refresh failed, can no longer be assigned to an asset or an agent, and a change can no longer be created against one. Previously the assignment succeeded and every change against that node was then refused until the version was repaired. See [about asset template versions](/getting-started/familiarisation/gui/projects/asset_templates.md#about-asset-template-versions).
- The [`runner.node_selector`](/key-concepts/settings.md#runnernode_selector) setting is now read each time a pod is created rather than when OpsChain starts, so a change to it takes effect without restarting the OpsChain API and a value OpsChain cannot read no longer stops OpsChain starting. Node selectors, and `vault.client_options`, must now be JSON objects and are rejected when saved if they are not.
- Approving, continuing or rejecting a waiting step now requires permission to `execute` the step's action, rather than only permission to see the step. Anyone who could view a step waiting for approval could previously continue it and resume the change, and a rule denying `execute` on a node had no effect on these operations. Check that whoever approves steps in your instance is granted `execute` on the actions they approve. See [authorisation rule actions](/getting-started/familiarisation/gui/manage_security.md#authorisation-rule-actions).
- A workflow run's override properties can no longer be edited once the run has been created. They record the property overrides the run was started with, so changing them afterwards misrepresented what the run was given. Editing them, or uploading a file property against them, is now rejected.

### Fixed {/* #2026-08-14-fixed */}

- Listing steps is now fast regardless of how many steps an instance holds. Authorisation was evaluated once per step, so on an instance with a large number of steps a request could spend tens of seconds in the database and, if it exceeded the API's statement timeout, fail outright rather than returning the list. Because a step's authorisation depends only on the action it runs, it is now evaluated once per distinct action and applied to every step sharing it — typically a hundred times fewer evaluations. Filtered requests benefit too, so the steps shown on a change's step tree arrive sooner.
- Listing workflow steps no longer issues a separate database query per step for the change, node, workflow version and child workflow run each step refers to. A page of workflow steps previously cost a couple of thousand queries and several seconds of processing; the related records are now loaded together, so the number of queries no longer grows with the number of steps in the response.
- Fixed an issue where a user viewing a project, environment or asset could be shown another user's permissions for its parent nodes — the actions listed in `meta.authorisations`, the links gated on those actions, and the parents' children. This revealed that those resources exist and their shape, but not their contents, as the endpoints behind those links authorise every request in their own right.
- Fixed an issue where the queue a change or workflow run is waiting behind could be shown with another user's permissions applied to it, or with each waiting entry's action and path missing altogether.
- Fixed an issue where the event recorded when one of the `concurrent` setting's capacity pools is full was not throttled to one event per minute as intended, so a burst of work recorded an event for each attempt — and, where an event subscription matched, sent a notification for each.
- Fixed an issue where re-enabling the API autoscaler immediately added a worker that was not needed. The request backlog it samples records the highest value seen rather than the current one, and nothing drained it while the autoscaler was switched off, so the first sample after re-enabling read a peak that could be hours or days old as though it had just happened.
- Refreshing a template version's Git revision is now atomic. The version keeps serving the commit it already had until the new one has fully resolved, so nothing ever reads a version without a usable revision, and a refresh that fails leaves the version on the commit it had rather than losing it.
- A change that is already running is no longer disturbed by a refresh of its template version's Git revision. Previously its steps could be given different revisions from one step to the next, lose their step names, descriptions and planned children, and be left with no MintModel actions. A change now runs against the actions and the revision that were resolved when it was created, and retrying it with `refresh_sha` re-sources both from the template's current revision.
- An asset no longer briefly refuses new changes while its actions are being regenerated — the actions generated previously are served until the new ones are ready.
- Fixed an issue where properties set on an agent's template version were silently dropped rather than being merged into the properties the agent's action code sees.
- Fixed an issue where editing a template version's settings left every node using that version serving the previous values until something else happened to refresh them.
- Fixed an issue where a `requires_approval_from` entry declared on a template version failed to resolve its approvers.
- Fixed an issue where a step could fail reporting that properties could not be applied, naming a level the step had sent no changes for.
- The [`agent.node_selector`](/key-concepts/settings.md#agentnode_selector) setting is now applied to agent pods — it had never been read, so agent pods were always scheduled using the runner's node selector. It is resolved when the agent pod is created, so it can be set for an individual project, environment or asset. An agent whose node selector cannot be read now reports a configuration error rather than making the agent's status unreadable.
- Fixed an issue where encrypting a secret containing non-ASCII characters failed with a server error.
- `log.info`, and the other log methods, can now be called from within a resource or resource type definition rather than failing with an undefined method error.
- Fixed an issue where the API key issued to a change could be created again after that change had already finished, and where deleting a project or an asset with a change still running left that change's API key valid.
- Fixed an issue where a template version whose verification failed could be left initializing indefinitely, with nothing able to recover it.
- Fixed intermittent secret vault failures on an installation running several vault replicas, where a request could be redirected from one replica to another repeatedly, or redirected to a port nothing was serving. Requests are now routed to the active replica, and the vault's external address is derived from the ingress TLS port OpsChain is actually serving on.
- Fixed an issue where a MintModel step passed only the last of a repeated `--otdargs` or `--args` value to `mintpress_ctl`, silently dropping the others. The command shown in the step log and the step description no longer escapes the `=` in each argument either, so it now matches the command that ran.
- Fixed an issue on the administration screen's **Deployments** tab where a bulk restart that failed for every deployment was reported as though it had succeeded, and where the table refreshing underneath an open dialog could apply a scale or restart to a different deployment.
- Fixed an issue where an email channel with STARTTLS explicitly turned off had it silently re-enabled, so mail was sent over a STARTTLS connection despite the channel's configuration.
- Fixed an issue where [`send_email`](/key-concepts/actions.md#sending-email) failed with a `wrong authentication type` error when the email channel it used was configured with no authentication, even though notifications sent through the same channel were delivered.
- Fixed an issue in the administration screen's **Data cleanup** section where a bulk action reloaded the whole page, discarding the table's filters, sorting and selection, and where a failure part way through a batch silently abandoned the jobs behind it. Each failure is now reported individually, naming the job.
- **Enable** is no longer offered for a data cleanup job that has no runs left — one that has already run without repeating, is at its maximum run count, or is past its scheduled time or end date. Enabling such a job previously reported success while leaving it disabled, and a bulk enable counted it among the jobs it had changed. See [enabling and disabling a cleanup job](/getting-started/familiarisation/gui/data_cleanup.md#enabling-and-disabling-a-cleanup-job).
- Fixed an issue where an authorisation rule covering a node granted nothing towards uploading a file property to it, so in practice only a superuser, or a rule granting everything, could upload one. Uploading is now authorised against the properties of the node that owns them, in the same way as editing those properties directly, so the rules described in [resource paths](/getting-started/familiarisation/gui/manage_security.md#resource-paths) apply as documented.
- Fixed an issue where any authenticated user could trigger a full resynchronisation of the LDAP directory, an expensive operation that rewrites OpsChain's copy of the directory and refreshes user email addresses. It now requires superuser access, matching the other directory maintenance operations.

## [2026-08-10]

### Before upgrading {/* #2026-08-10-before-upgrading */}

:::warning[Re-apply the CNPG operator manifest]
The CloudNativePG operator is installed directly with `kubectl` rather than by the OpsChain Helm chart, so `helm upgrade` does not pick up the operator changes in this release. Re-apply the operator manifest before upgrading:

```bash
kubectl apply -f \
  https://docs.opschain.io/files/downloads/cnpg-operator.yaml \
  --server-side
```

This restarts the operator only - your PostgreSQL cluster keeps running and is not restarted. See [install the CNPG operator](/setup/configuration/preparing-your-environment.md#install-the-cnpg-operator) for more information.
:::

### Added {/* #2026-08-10-added */}

- Several background tasks can now be cancelled together from the administration screen's **Background tasks** tab — select the tasks and choose **Bulk actions** → **Cancel selected tasks**. The confirmation lists the tasks it is about to cancel, and reports how many could not be cancelled if any fail. See [cancelling several tasks at once](/getting-started/familiarisation/gui/background_tasks.md#cancelling-several-tasks-at-once).
- The administration screen's **System information** section now has a **Pods** tab, replacing the **Workers** tab. It lists every pod in the OpsChain namespace — runner, MintModel, image build, database and API worker pods — rather than only the API workers, and each pod's log can be opened from the list. The table can be filtered by pod state and pod type, and refreshed on demand. See [pods](/getting-started/familiarisation/gui/pods.md).
- New admin endpoints list the pods running in the OpsChain namespace and return an individual pod's log, which can also be downloaded in full as a text file (`GET /api/admin/pods`, `GET /api/admin/pods/{name}/logs`). Listing the pods and reading their logs are authorised separately, so the pod list can be granted without granting access to what the pods have logged. See the [API reference](pathname:///api-docs/#tag/Admin-operations).
- The administration screen's **System information** section now has a **Deployments** tab, showing each OpsChain deployment's replica counts — requested, existing, ready and available — alongside its rollout state and availability. A deployment can be restarted or scaled from the tab, individually or in bulk, so recovering a wedged or saturated instance no longer requires `kubectl` access to the cluster. A replica count set this way is not written back to your Helm values, so the next upgrade returns the deployment to its configured count. See [deployments](/getting-started/familiarisation/gui/deployments.md).
- New admin endpoints list the OpsChain deployments and allow one to be restarted or scaled (`GET /api/admin/deployments`, `POST /api/admin/deployments/{name}/restart`, `POST /api/admin/deployments/{name}/scale`). Restarting and scaling are each authorised separately from listing, and from each other. See the [API reference](pathname:///api-docs/#tag/Admin-operations).
- Action code can now send email while a change or agent is running, with optional attachments, reaching people who have not subscribed to notifications. Messages are sent through the default email channel configured in the administration notification settings, and every send is recorded as an event. See [sending email](/key-concepts/actions.md#sending-email).
- The `query` and `send_email` action helpers are now available as keywords, so action code can call `query` and `send_email` directly rather than `OpsChain.query` and `OpsChain.send_email`. See [querying the API](/key-concepts/actions.md#querying-the-api).
- Projects, environments and assets can now be permanently deleted from the GUI - individually from the node's actions menu, or several at once from the table's bulk actions - in addition to being archived. Deletion is irreversible, and a node that has changes recorded against it cannot be deleted. See deleting [a project](/getting-started/familiarisation/gui/projects/index.md#deleting-a-project), [an environment](/getting-started/familiarisation/gui/projects/environments.md#deleting-an-environment) or [an asset](/getting-started/familiarisation/gui/projects/assets.md#deleting-an-asset).
- Asset templates can now be deleted from the GUI, individually from a template's actions menu or several at once from the table's bulk actions. A template that is still assigned to a node or referenced by a change cannot be deleted. See [deleting asset templates](/getting-started/familiarisation/gui/projects/asset_templates.md#deleting-asset-templates).
- A template version's Git revision can now be fetched in bulk - a **Fetch revision** bulk action on the template versions list, and a **Fetch revision for newest version** bulk action on the templates list, each with a force option for versions that are in use. The templates list now also shows the state and Git revision of each template's newest version. See [about asset template versions](/getting-started/familiarisation/gui/projects/asset_templates.md#about-asset-template-versions).
- An input argument can now offer a fixed list of values to choose from rather than accepting free text. The user picks one of the listed values, and a value outside the list is rejected. See [restricting the values a user can supply](/key-concepts/actions.md#restricting-the-values-a-user-can-supply).
- Child steps declared while an action is running now appear in the change's step tree with their step name, description, prerequisites and input arguments, rather than only the action they run.
- Action code can now list every environment, asset or agent in a project, or every asset in an environment, rather than fetching one node at a time. An individual agent can also be queried by name. See [listing child nodes](/key-concepts/actions.md#listing-child-nodes).
- The time allowed for an asset's MintModel to render can now be adjusted — globally, or for an individual project, environment or asset — so an asset with a large MintModel can be given longer without raising the limit for every other node. Previously a large MintModel could have its render abandoned part way through after two minutes, with no way to allow it more time and the render's own diagnostics lost. See [`mintmodel_render_timeout`](/key-concepts/settings.md#mintmodel_render_timeout).

### Changed {/* #2026-08-10-changed */}

- Existing installations now gain the full benefit of the UUIDv7 primary keys introduced in 2026-08-04, rather than only newly inserted rows doing so. The primary key indexes of the affected tables are rebuilt once after upgrading, which is what allows the reduced index page-split churn and improved cache locality to apply to the data an installation already holds. The rebuilds run in the background once the upgrade has finished rather than delaying it, starting with the largest table, and they neither stop changes from running nor take the API offline while they proceed. On a large installation the biggest may take a while to complete, and an event is recorded if one does not succeed.
- Improved the performance of the activity feed, most noticeably for users who are not superusers, where fetching a page of activity could previously take tens of seconds on a large installation. Each activity's project, commit and git remote details are now resolved only for the rows actually being returned, the feed's freshness checks no longer repeat the same queries within a single request, and a user's administrator status is looked up once per request rather than once for every kind of resource the request touches.
- Improved the performance of determining whether a step's children have all finished or succeeded, most noticeable on a step with a large number of children.
- Reduced the memory used while running steps, most noticeable on an installation running many steps concurrently.
- The CloudNativePG operator now runs two replicas rather than one, and tolerates a temporarily slow or busy cluster before considering itself unhealthy. Previously, a brief period of Kubernetes API slowness could make the single operator replica shut down and take its admission webhook with it, causing an install or upgrade to fail part way through with a `502 Bad Gateway` error while creating or updating the database cluster. The second replica continues serving the webhook while the first restarts, reducing the interruption from the length of a full restart to a fraction of a second. On a multi-node cluster the two replicas are placed on different nodes where possible. Creating and updating the database resources now also waits for the operator and its webhook to be reachable first, rather than assuming they are — a new `opschain-cnpg-webhook-ready-check` pod performs this check at the start of every install and upgrade. It finishes within a few seconds and is then left in the OpsChain namespace in a completed state, so its outcome can be inspected if an upgrade fails; the next upgrade replaces it.
- The CloudNativePG operator no longer re-downloads its image every time it restarts, so restarting it no longer depends on the container registry being reachable. A restart during a registry outage previously left the operator stuck and unable to start.
- A notification channel marked as the default is now only used while it is enabled. If the only default channel for a notification type is disabled, notifications of that type are not sent and an event records that the default is missing — and a disabled default no longer prevents another channel being nominated in its place. See [notifications](/operations/notifications.md).
- The message logged while a background task waits for capacity now reports how long it has been waiting and how many jobs are ahead of it, and says whether the task is waiting to start or to resume, rather than repeating an identical line every minute.
- When a stuck background task is automatically recovered, the event recorded now identifies the background job that abandoned it and the error that caused it, rather than only reporting that the task was stuck.
- Failures detected by OpsChain's background workers — such as the log collector being unavailable — are now recorded as ordinary events, so they can trigger event subscriptions and notifications like any other event.
- The first image build after an upgrade is no longer slow. An upgrade changes the base image every image build starts from, so the next build a user triggered paid the whole cost of fetching and unpacking it — on a large installation over 30 minutes, with every other request for an asset's actions queued behind it, while subsequent builds finished in seconds. That base image is now prepared in the background ahead of time, and re-prepared if it is later evicted from the build cache. Doing so does not consume any of the `concurrent` setting's image build capacity, and a failure to prepare it is recorded as an event rather than affecting the build itself.
- An input argument's value is now nested under its `path` by the argument's own name, rather than being stored at that path. E.g. `server_name: { path: '/database/server' }` now adds `{ database: { server: { server_name: 'db1' } } }` to the change override properties rather than `{ database: { server: 'db1' } }`. Arguments can therefore share a `path` without overwriting each other, and a `path` of `/` — the new default — nests the value at the top level. See [argument options](/key-concepts/actions.md#argument-options).
- Declaring two input arguments with the same name, or an argument whose name contains a `/`, is now reported as an error while your actions are loaded, rather than only the first argument of that name ever receiving the value the user supplied. Two arguments sharing a property path is no longer an error.
- An error in an input argument declaration now names the `actions.rb` line the input arguments were declared on, rather than only describing the problem.

### Fixed {/* #2026-08-10-fixed */}

- Fixed an issue where a TLS certificate renewal for the secret vault (OpenBao) was never picked up without manually restarting its pod, since Kubernetes has no way to detect and act on a certificate change like this on its own. The secret vault now runs 3 replicas instead of 1, and automatically detects and rolls any replica running a stale certificate. Rolling a replica causes a brief leader failover (typically a few seconds) for any in-flight vault request during the restart, rather than the certificate renewal being silently ignored indefinitely. The replicas prefer to run on separate nodes but will share a node where they must, so all three run on a single-node cluster. On a cluster with more than one node they start straight away and nothing needs to be done; on a single-node cluster, delete the existing secret vault pod after upgrading (`kubectl delete pod opschain-secret-vault-0 -n <opschain namespace>`) — it keeps running with the previous configuration until it is rolled, and until it has been the other two replicas cannot start alongside it. If you do not, OpsChain rolls it for you after about fifteen minutes, recording a failure event each time it tries a replica that cannot start until then; those events are expected and need no action. Two new workloads in the OpsChain namespace provide this detection: an `opschain-reloader` pod, which watches the secret vault's TLS certificates for a renewal, and an `opschain-roll-stale-secret-vault-pods` cron job, which runs every five minutes and replaces any replica still running a superseded certificate.
- Fixed an issue where OpsChain always reached the secret vault (OpenBao) through one specific replica rather than through whichever replica currently holds leadership, so vault requests failed outright whenever that replica was unavailable — during a rolling restart, for example — defeating the point of running more than one. Requests now go to the active replica. Existing installations are corrected automatically as part of the upgrade; the address was recorded when the installation was first set up and could not previously be changed.
- Fixed an issue where listing audit events failed with a server error for a user who is not a superuser, on an instance holding a large number of events. Working out which events the user is allowed to see was evaluated against every event in the table before the requested page size was applied, so a request cost the same whether it asked for one event or fifty, and on a large instance it exceeded the database query timeout and returned nothing at all. Only as many events as are needed to fill the requested page are now examined. If that examination is exhausted before the page fills, the response reports itself as partial rather than appearing complete, and narrowing the request with a filter reaches events further back.
- Fixed an issue where the `OpsChain.query` action helper could not be called at all, raising a `NoMethodError` whenever action code used it.
- Fixed an issue where OpsChain's internal scheduled jobs never ran on a newly installed instance, so periodic housekeeping — including the automatic recovery of stuck background tasks — silently never happened.
- Fixed an issue where a background job that failed was never retried, and a single error in the internal job scheduler could permanently stop every scheduled job in the instance. A job waiting to be retried is also now reported as pending rather than failed.
- Fixed an issue where work waiting for one of the `concurrent` setting's capacity pools was duplicated each time a slot was freed. The backlog grew continuously until every worker was saturated, and the work being waited on — such as refreshing an asset's actions — never completed.
- Fixed an issue where a background job that failed could leave no record of what went wrong, making the failure impossible to diagnose after the fact.
- Fixed an issue where users and groups nested below the configured LDAP user and group bases were not found, so their email addresses were not synchronised and their group names were not recognised.
- Fixed an issue where a certificate uploaded to the trust store was not trusted by the Ruby code running in a step, so an action connecting to a host presenting that certificate failed to verify it — even though Git operations over HTTPS to the same host succeeded.
- Fixed an issue where the API worker autoscaler continuously grew and shrank the worker count on an otherwise idle instance, recording a large number of scaling events. A single queued request — a Kubernetes readiness probe was enough — was treated as grounds to add a worker regardless of how much idle capacity was available.
- Fixed an issue where an asset's template version history reported the template version's current Git commit for every period in its history, rather than the commit that was actually in effect at the time. Refetching a template version's Git revision therefore rewrote what every earlier period claimed to have run against.
- Fixed an issue where the OpsChain secret vault could seal itself after a brief interruption to the OpsChain database — including the database pod merely becoming unready for a moment — and then stay sealed indefinitely. Because OpsChain only contacts the vault while it is starting up, a running instance carried on working and nothing indicated a problem until the next upgrade or API restart, which then failed. A sealed vault is now restarted automatically and unseals itself as it starts. See [`helm upgrade` fails with `context deadline exceeded`](/troubleshooting.md#helm-upgrade-fails-with-context-deadline-exceeded).
- Fixed an issue where a sealed secret vault caused OpsChain to fail to start with an internal error that gave no hint of the real problem — `no implicit conversion of Symbol into Integer` — rather than reporting that the vault was sealed. The vault's own message, such as `Vault is sealed`, is now reported instead.
- Fixed an issue where the runner images were copied into the internal image registry only once an upgrade had completed successfully, so an upgrade that timed out left them uncopied and every worker waiting indefinitely on an image that would never arrive. The images are now also copied before the upgrade begins.
- Fixed an issue where the `concurrent` setting's limits could admit more work than they allow, letting more pods run at once than configured. Work was treated as already holding a slot whenever anything else had claimed one for the same resource, including a claim held for a different capacity pool or in a different cluster.
- Fixed an issue where a step or task waiting on an image build already running elsewhere stopped naming the template, version and asset that build is for once the build had been going for 30 minutes, falling back to a generic message at exactly the point that information is most useful.
- Fixed an issue where generating an asset's available MintModel actions concurrently cached a separate copy of the outcome per attempt, and a later read then picked an arbitrary one. A cached entry records either a result or a failure and never both, so an asset with a perfectly good cached result could intermittently report no actions at all. Duplicates are collapsed on upgrade and can no longer be created, and an entry that cannot be stored is now reported as an event rather than silently leaving that asset with an empty cache.
- Fixed an issue where an asset's MintModel could be rendered many times over concurrently. Each render runs in its own pod and occupies a CPU core for a couple of minutes, so one asset retrying repeatedly could saturate an entire installation — a single asset was observed producing 22 complete sets of retries within four minutes. Renders for an asset are now serialised, and a retry whose failure has already been recorded reuses it instead of rendering again. The message logged while a step waits for another render of the same asset to finish is also now throttled to once every 30 seconds rather than logged on every retry.
- Fixed an issue where a workflow run's log could report the same message twice when a step's children all completed, or all finished with some having failed.
- Fixed an issue where listing changes (`GET /api/changes`) failed with a server error for a user who is not a superuser, on an instance holding a large number of changes and authorisation rule matches. The database query used to decide which changes the user could see was occasionally mis-planned in a way that examined many times more rows than intended, and on a large installation this exceeded the database query timeout and returned nothing at all.
- Fixed a related issue where filtering a list endpoint by an attribute of a related collection — for example, filtering workflows by their versions' status — could still return duplicate records for a user who is not a superuser with more than one authorisation rule matching a record, displacing real results from the page. This affected a number of resources, including bookmarks, git remotes, notification channels, templates, authorisation rules, workflows, event subscribers, authentication tokens and MintModel history.
- Fixed an issue where an `actions.rb` action was still shadowed by a MintModel action of the same name when it was the change's root step, rather than partway down the tree — for example when starting a change directly at a nested `actions.rb` override, or when a top-level `actions.rb` action's underlying MintModel action data carried no explicit override marker at all. An `actions.rb` action now takes precedence as the root step exactly as it does elsewhere in the tree. See [name collisions between `actions.rb` and MintModel actions](/key-concepts/actions.md#name-collisions-between-actionsrb-and-mintmodel-actions).
- Fixed an issue where an input argument's default value had to be a string. An argument defaulting to a boolean, number, array or hash caused every step of the change to fail to start.
- Fixed an issue where several input arguments writing to nearby paths overwrote each other, so only the last value the user supplied was kept in the change's properties.
- Fixed an issue where an action naming a prerequisite by its step name, rather than its action name, failed with `Don't know how to build task`, which also stopped the project's actions being listed. See [referencing actions by name or step name](/key-concepts/actions.md#referencing-actions-by-name-or-step-name).
- Fixed an issue where a step that had already succeeded could be processed a second time and reported as failed, with a misleading message about its properties not being applied. Details its children had since reported for themselves were also overwritten with the values originally planned for them.
- Fixed an issue where a step's properties history was discarded when the step reported its result, leaving no record of what the step was given as against what it reported.
- Fixed an issue where the step tree recorded for a change run from a project or environment Git remote showed no prerequisites between its steps, so the ordering the change actually ran under was not visible.
- Fixed an issue where supplying an input step's arguments as a hash rather than a list failed with an unhelpful error instead of reporting the problem.

## [2026-08-04]

### Important breaking changes {/* #2026-08-04-important-breaking-changes */}

- If an asset's MintModel action tree includes a nested action whose full path coincidentally matched one defined in its `actions.rb` (a name collision below the top level), the MintModel action previously ran there instead, silently discarding the `actions.rb` action's own work. The `actions.rb` action now takes precedence at any depth, consistent with the existing top-level behaviour — see [name collisions between `actions.rb` and MintModel actions](/key-concepts/actions.md#name-collisions-between-actionsrb-and-mintmodel-actions). Check your assets' action trees for any such incidental nested collisions before upgrading if this could affect you.
- Execute access for changes, workflow runs and workflow steps is now reported under its own `execute` key in a response's authorisation metadata rather than under `update`. Any client gating run or retry controls on `update` for these resources must move to `execute`.
- `change_filter.created_by` within [`requires_approval_from`](/key-concepts/settings.md#requires_approval_from) is now a nested object with `user_names` and `ldap_groups` keys rather than a flat list of usernames. Stored settings are migrated automatically, but settings written from now on must use the new shape.

### Added {/* #2026-08-04-added */}

- A new admin endpoint (`GET /api/admin/resource_slots`) shows the live status of each internal concurrency pool — action generation, MintModel concretisation, step/change runner work, and agent image builds — including how many slots are currently claimed, by what, and for how long. See the [API reference](pathname:///api-docs/#tag/Admin-operations).
- A new admin endpoint (`GET /api/admin/node_background_tasks`) lists every background task that has not yet finished, across all nodes — refreshing an asset's actions, concretising a MintModel, building an agent image, and starting or stopping an agent. It is no longer necessary to know which node a task belongs to in order to see that it is running or queued. See the [API reference](pathname:///api-docs/#tag/Admin-operations).
- The administration screen's **System information** section now has a **Background tasks** tab, listing the background tasks currently running or queued across every node, along with the node each belongs to, how long it has been going, and who started it. A task can be cancelled from the list — including an agent image build, which previously could not be cancelled from the GUI at all. See [background tasks](/getting-started/familiarisation/gui/background_tasks.md).
- An event is now recorded when one of the `concurrent` setting's internal capacity pools (action generation, MintModel concretisation, step/change runner work, or agent image builds) is observed completely full, to help with diagnosing and planning for capacity limits.
- Approval requirements can now be scoped to the change creator's LDAP group membership as well as to named users. See [`requires_approval_from`](/key-concepts/settings.md#requires_approval_from).
- The user and group names in an approval requirement are now validated against the LDAP directory when settings are saved, so a misspelled approver is rejected at that point rather than silently never applying.
- It is now possible to supply new settings overrides when retrying a change, so a setting can be corrected or adjusted for the retry rather than only carried forward from the change being retried. See [retrying changes](/key-concepts/changes.md#retrying-changes).
- List and detail responses now report whether the current user may delete the resource, so the GUI only offers delete controls where the user actually holds delete access — including whether a running node background task may be cancelled.
- The LDAP directory refresh event now reports how many user email addresses it synchronised and which users the directory did not return, making a too-narrow user filter or a missing mail attribute diagnosable from the event alone.

### Changed {/* #2026-08-04-changed */}

- The API worker autoscaler now shrinks the worker count back down more readily. It previously waited for the request queue to be completely empty across every worker for ten consecutive checks before scaling down, which real traffic rarely allows once scaled up. It now scales down once the queue is at or near zero, rather than waiting for exactly zero.
- The `concurrent` setting's `refresh_limit`, `runner_limit`, and `mintmodel_concretise` limits are now each enforced independently, rather than allowing one to temporarily borrow unused capacity from another. A limit now always means exactly what it says.
- Primary keys for changes, workflow runs, nodes, steps, and other frequently-inserted tables are now generated as UUIDv7 instead of UUIDv4, so new rows insert with roughly-ascending keys instead of scattering randomly across the primary key index, reducing index page-split churn and improving cache locality at scale. Existing rows are unaffected; only newly created rows use the new format.
- API responses no longer include the `X-Runtime` header. It reported how long the server spent processing the request, and identified the underlying web stack to anyone probing the API. Any tooling relying on it will need to measure request duration on the client side instead.
- Improved the performance of listing resources as a user who is not a superuser. Authorisation checks on a filtered list now consider only the rows the request asked for, rather than every row in the table. On a large installation, such a request could previously take tens of seconds, or time out entirely.
- Improved the performance of listing and viewing audit events as a user who is not a superuser. Each event names the resource it was raised against, and the authorisation check for those resources now covers only the ones the returned events actually reference, rather than every row of every resource type an event can be raised against. On a large installation this previously added well over a second to each request, whether fetching a page of events or a single event by ID.
- Improved the performance of the activity feed. Each activity's enclosing project name is now resolved only for the page of results being returned, rather than for every change matching the filter first.
- Improved the performance of purging job history under a data retention policy, and of other queries over it spanning a wide range of dates.
- Improved the performance of polling a change's or workflow run's step list, used by the GUI's swim lane, step tree and logs views. Deciding whether anything had changed since the previous poll evaluated the same authorisation-filtered step query several times over, and now evaluates it once — on a large installation, around 25 seconds rather than 75. A change to a user's authorisation rules now also invalidates a cached poll response.
- The last usage timestamp reported for an authentication token is now updated periodically rather than on every request that uses it. Writing it on every request made concurrent requests authenticating with the same token queue behind one another for that row, which on a busy installation was the single largest consumer of database time.
- Work waiting for one of the `concurrent` setting's capacity pools to free up is now picked up immediately when a slot becomes available, rather than only being retried on its next periodic check.
- A retried change now runs with the settings the change it replaces converged, rather than re-resolving every setting against current values. Settings introduced since, deployment-critical settings and approval requirements still come from the current settings — see [retrying changes](/key-concepts/changes.md#retrying-changes).
- A scheduled workflow that supplies settings overrides is now rejected rather than accepting a value that can have no effect — settings overrides apply to scheduled changes only.
- LDAP directory refreshes now request only the attributes OpsChain reads, reducing the load on the directory and the size of the cached directory data.
- Significantly improved the caching of the node hierarchy behind the GUI's navigation — creating a change no longer invalidates it, editing a workflow rebuilds only the workflow portion, and users with the same group access share one cached copy. The hierarchy response now always includes workflows.
- Improved the performance of fetching every event for a change and its steps in one request, which no longer slows down as the change ages or as the instance accumulates events.

### Fixed {/* #2026-08-04-fixed */}

- Fixed an issue where triggering action generation, MintModel concretisation, or step/change runner work for many assets or changes at once (for example, force-refreshing several templates) could cause the configured `concurrent` limits to be far less effective than configured, with individual requests waiting tens of seconds just to be admitted even when capacity was available. All admission decisions for these limits are now made independently and immediately, instead of queueing behind a single shared lock.
- Fixed an issue where a change belonging to an asset or agent could be missing its template version, causing every attempt to view that asset's or agent's changes to fail with a server error. This can no longer happen for a newly created change, and an existing change already left in this state can now be viewed normally instead of causing an error.
- Fixed a case where installing or upgrading OpsChain could fail with a `no endpoints available for service "cnpg-webhook-service"` error, if the CNPG operator's webhook was not yet ready when the chart created its database resources.
- Fixed an issue where an `actions.rb` action sharing its name with a MintModel action was shadowed by the MintModel action. The asset's action list showed a duplicate entry for the name, and starting a change for that name ran the MintModel action rather than the `actions.rb` action — the change succeeded, but the `actions.rb` action's own work never ran. An `actions.rb` action now takes precedence in both the action list and when the change runs, at any depth within the action tree and regardless of how the two names are capitalised. Embedding a MintModel step beneath an action that is not itself defined in `actions.rb` continues to work as before. See [name collisions between `actions.rb` and MintModel actions](/key-concepts/actions.md#name-collisions-between-actionsrb-and-mintmodel-actions).
- Fixed an issue where an error raised while creating an audit event could log that event's data to the internal Rails log verbatim, including decrypted git remote credentials or scheduled activity property and setting overrides. The internal log now only records that the event failed to be created, referencing its source by type and ID rather than including its data, and a git remote's or scheduled activity's sensitive fields are no longer included when logged elsewhere either.
- Fixed a security issue where an unexpected internal error could return the underlying exception's class name, message and full backtrace in the response body — on any request, including an unauthenticated one or one for a route that does not exist. Such a response now reports only that an internal server error occurred and the identifier of the request that failed, with the exception detail recorded in the internal log instead.
- Fixed an issue where an error occurring before a node background task (refreshing an asset's actions, building an agent image, or concretising a MintModel) started its real work — for example, while waiting on pod capacity or an image build slot — left it stuck in progress indefinitely, with no error raised and no way to detect it. The task is now failed with a clear message instead, and a new watchdog job also detects and fails any background task left stuck with no active job behind it.
- Fixed an issue where the admin queues page failed with a database error whenever a refresh of an asset's actions was waiting to start — for example, on pod capacity, an image build, or a MintModel concretisation. Listing jobs and the admin queues page now also tolerate any other queued job that is labelled with something other than a node, rather than failing for every user for as long as such a job is queued.
- Fixed an issue where filtering a list endpoint by an attribute of a related collection — for example, filtering steps by their children's status — returned each matching record once for every child that matched. For a user who is not a superuser the duplicates also displaced real results, so a request could report a full page of records while covering only a small fraction of the records that actually matched.
- Fixed an issue where authorisation rules were matched against the capitalisation an action was submitted with rather than the action it resolved to, so a change submitted with different capitalisation could evade a rule denying that action. The resolved action is now re-authorised before it runs.
- Fixed an issue where a certificate could be deleted from the trust store with only read access to it — deleting a certificate now requires delete access.
- Fixed an issue where referring to an action with different capitalisation than it is defined with was not honoured everywhere — skipped steps, the starting step, the concurrent-change guard and event filter action rules now all match an action regardless of case.
- Fixed an issue where sibling steps whose names differ only by capitalisation were given the same step path.
- Fixed an issue where a change created from a Git repository did not report its expected step tree until its first step had completed.
- Fixed an issue where retrying a change re-resolved the Git revision, so the retry ran the latest code on the branch instead of the commit the original change ran.
- Fixed an issue where retrying a change created by a workflow could detach the original change from its workflow run.
- Fixed an issue where an event filter rule matched against a list or object attribute — such as the changed property paths on a property update event — could discard the event being evaluated and return an error to the request that raised it. List attributes are now matched element by element, and rules using the `null`, `false` and blank predicates now match.
- Fixed an issue where a malformed step status notification could stop step status updates being processed for the life of the API process, leaving steps appearing to hang until the fallback poll caught up.
- Fixed an issue where background work could be attributed to the wrong user in audit events and created records, having inherited the identity left behind by an unrelated earlier job.
- Fixed an issue where generating an asset's available MintModel actions could retry indefinitely without ever reporting the failure. A failure that cannot succeed on retry is now reported immediately, and retries are otherwise bounded and admitted through the usual pod concurrency limits.
- Fixed an issue where an asset's cached MintModel actions could keep reporting a stale success after generation had failed, or a stale failure after generation had recovered.
- Fixed an issue where LDAP identities were compared case sensitively, so a policy assignment, approval requirement or LDAP group name recorded in a different case than the directory reports silently granted nothing.
- Fixed an issue where a user's directory entry was only matched to their account when the entry sat directly under the configured base and was named by the login attribute — other users received no LDAP group access, had no email address synchronised, and appeared twice in the user list.
- Fixed an issue where an LDAP directory refresh failed completely when the directory returned a value that could not be stored, or a name containing an escaped comma such as `cn=Smith\, John`.
- Fixed an issue where an LDAP directory refresh that succeeded but returned no entries deleted the cached directory, withdrawing every LDAP group membership so group-based policies granted nothing and LDAP group approvals could not be satisfied. The cache is now retained and the refresh reports a warning.
- Fixed an issue where logging in with leading or trailing whitespace in the username was rejected even though the directory accepted the credentials.
- Fixed an issue where the email addresses resolved for an LDAP group's members could include unrelated addresses from elsewhere in the directory, including on the mail notifying an approver that a change is waiting on them.

## [2026-07-28]

### Added {/* #2026-07-28-added */}

- OpsChain can now optionally run a session-mode database connection pooler (a [CloudNative PostgreSQL](https://cloudnative-pg.io/) `Pooler`) in front of the database, reducing per-connection setup overhead for deployments with many worker threads or elevated change concurrency. See the [database connection pooling](/advanced/database-connection-pooling.md) guide for when to use it, how to enable it, and how to roll it back.
- The API worker autoscaler now also checks available PostgreSQL connection headroom before growing the worker count, alongside the existing memory check.
- Property update events now record which properties changed, so an event subscriber can be triggered by a change to one specific property rather than by any property update — for example, starting a change whenever a particular password is rotated.
- A template version that becomes stuck refreshing no longer stays that way. A stalled refresh is now detected and re-attempted automatically, and an in-progress refresh can also be cancelled explicitly, returning the version to its previous commit.
- New API list filters make it possible to fetch every event for a change and its steps in one request, and to filter steps by whether they define input arguments. See [API filtering & sorting](/advanced/api-filtering.md).
- It is now possible to run several of an asset's actions at once - select the actions you want on the asset's actions list and choose **Run selected** to run them together from a single dialog. See [running changes on an asset](/getting-started/familiarisation/gui/projects/assets.md#running-changes-on-an-asset).
- The available actions for several assets can now be refreshed in one go by selecting the assets and choosing **Refresh actions** from the assets table's bulk actions menu. See [refreshing an asset's available actions](/getting-started/familiarisation/gui/projects/assets.md#refreshing-an-assets-available-actions).
- Changes now have an **Audit history** tab listing the events raised for the change and its steps, using the same filters as the other audit history screens. See [change audit history](/getting-started/familiarisation/gui/activity_details.md#audit-history).

### Changed {/* #2026-07-28-changed */}

- Raised the default database `max_connections` from 300 to 350, giving more headroom for connection-heavy deployments.
- Improved the performance of the activity feed and audit history by removing a redundant, unindexed database query used to look up each change's ancestor breadcrumb.
- Eliminated a redundant join in the change details endpoint that could unnecessarily multiply returned rows for changes with many audit events or child steps.
- Improved the performance of authorisation checks used when listing a node's children and viewing the activity feed, by removing a redundant subquery from node child-authorisation lookups and computing the activity feed's authorised rule set once per request instead of up to four times.
- Improved the performance of listing a change's audit events, used by the activity feed.
- Improved the performance of admitting steps to run under pod capacity limits.
- Improved the performance of viewing a change or workflow run with many steps — resolving each step's full path during serialisation now costs a flat number of queries regardless of step count, instead of one extra query per step still awaiting its path.
- Improved the performance of node path lookups by bounding a recursive database query to only the requested paths instead of scanning the entire node tree.
- The [`api_autoscaler.mode`](/key-concepts/settings.md#api_autoscalermode) setting now defaults to `active` instead of `dry_run`, so new installs automatically scale API worker processes in response to request queuing instead of only recording what they would do. Existing installs still on the previous `dry_run` default are migrated to `active` automatically; installs that have already explicitly chosen a mode (including `dry_run`) are left unchanged.
- Improved the performance of polling a change's or workflow run's step list — used by the GUI's swim lane, step tree, and logs views while an activity is in progress — by adding HTTP conditional GET support. A poll that finds nothing new now costs a couple of cheap aggregate queries instead of the full step query and serialization.
- Permission to decrypt a secret is now inherited down the node tree, so granting a team secret access on a project covers every environment and asset beneath it instead of needing a rule on each. The closest matching rule still decides, so a deny lower down overrides a grant above it, and secret access remains governed by `execute` — widening a user's read access grants none.
- Significantly improved the performance of starting a change or workflow run with a large step tree — an 81 step change now takes around 3,000 database queries to admit, down from over 12,000.
- Refreshing the actions of many assets that share a template is now far faster, as those assets no longer queue behind one another waiting for an image build that never runs for MintModel-only templates.
- While a step waits on an image build that is already running elsewhere, the log now names the template, version and asset that build is for, instead of only reporting that an identical build is in progress.
- The concretisation log now reports progress while an asset's MintModel is being rendered, rather than falling silent until the render finishes.
- The change and workflow run swim lane view has been refined in response to early feedback: the step tree is once again the view that opens by default, the lane previously labelled **Finished** is now **Incomplete**, and the **Completed** lane always appears last. See [swim lane](/getting-started/familiarisation/gui/activity_details.md#swim-lane).

### Fixed {/* #2026-07-28-fixed */}

- Fixed an issue where a failure to send an approval-required email notification (for example, an email channel configured with the wrong credentials) was not recorded anywhere. The approver still saw the notification in the OpsChain console, but no email arrived and no audit event indicated why.
- Fixed an issue where a transient database connectivity blip could permanently stop the API worker autoscaler from ticking for the remainder of the pod's lifetime, with no record of the failure.
- Fixed an issue where viewing authorisation policies and rules required update permission instead of read permission. Viewing is now granted by `read` on [`/authorisation_policies`](/getting-started/familiarisation/gui/manage_security.md#top-level-paths), which must be granted explicitly — a blanket rule on the root path no longer covers it.
- Fixed an issue where properties and settings owned by a change, a workflow run or a template version were invisible to anyone but a superuser — a workflow run's property overrides returned a not found error, and resolving a secret from them failed outright.
- Fixed an issue where uploading a file property into the secret vault required only permission to update properties, letting a user without secret vault write access overwrite any secret the node's configuration resolves to.
- Fixed an issue where cancelling a change could leave one of its steps running, or return an already cancelled step to the queue, when the cancellation raced a step that was starting.
- Fixed an issue where cancelling or failing a change while it was still initialising left its runner pod running.
- Fixed an issue where cancelling a running change or workflow run that a queued retry was waiting on left that retry stuck instead of starting it.
- Fixed two issues that could leave a change stalled indefinitely: the workers inside a shared runner pod dying while the pod itself stayed alive, and a queued change at the head of its queue losing the job responsible for starting it. Both are now detected and the change failed or restarted.
- Fixed an issue where refreshing the actions of many assets of one template at once could fail some of those refreshes, because the simultaneous image pulls were throttled by Kubernetes and treated as a permanent failure.
- Fixed an issue where an error response from the container image registry caused image reconciliation and the registry maintenance tasks to fail outright, instead of reporting that no images were found.
- Fixed an issue where an asset whose MintModel took longer than 60 seconds to render could never be concretised, and the render's own log output was lost when it failed.
- Fixed an issue where rendering a large MintModel could run out of memory and fail the concretisation.
- Fixed an issue where a properties conflict reported while processing a step's results could be replaced by a bare error backtrace, hiding the patch and the before and after properties needed to diagnose it.
- Fixed an issue where steps could still intermittently fail with a database connection error when many ran in parallel — this time because the action server process inherited, and then corrupted, the database connections of the worker that forked it.
- Fixed an issue where the system configuration screen offered to decrypt secret settings to every user, regardless of their permissions.
- Fixed an issue where a workflow run's property overrides tab showed nothing at all. It now lists the run's overrides, and secret values within them can be decrypted.
- Fixed an issue where an action's prerequisite failed with `Don't know how to build task '...'` if it referenced a file task whose path contained an uppercase letter (for example a version string like `3.99.0-SNAPSHOT`). The prerequisite was incorrectly treated as a friendly display name and slugified, so it no longer matched the file task actually defined for it. Prerequisites that already match a defined task are now left unchanged.

## [2026-07-23]

### Important breaking changes {/* #2026-07-23-important-breaking-changes */}

- Skipping individual steps via `PATCH /api/steps/{step_id}` and `PATCH /api/workflow_steps/{step_id}` is no longer supported. These endpoints have been removed. Use `skip_steps` on the change or workflow run to control which steps are skipped — see the [skipping steps](/key-concepts/changes.md#skipping-steps) documentation for more information.
- Step and workflow step API responses no longer include a `skip_on_retry` attribute. Each step now has a `skip_requested` boolean instead, indicating whether that step currently matches a pattern in the owning change's or workflow run's `skip_steps` array.
- [`OpsChain.step`](/key-concepts/actions.md#step-wrapper) with `wait:` or `input_arguments:` no longer wraps the wait/input step and the wrapped action as sibling steps under a separate wrapper step. Instead, the wrapped action is now a child of the wait/input step, and only starts once the wait/input step is continued or approved — it never runs if the wait/input step itself is rejected, times out, or errors. `step_name:`/`wait_step_name:` now both name the same single step rather than two separate steps.

### Added {/* #2026-07-23-added */}

- The number of API worker processes running in each `opschain-api` pod can now scale automatically in response to request queuing, instead of always running a fixed count. This is controlled by the new [`api_autoscaler`](/key-concepts/settings.md#api-worker-autoscaling-settings) setting, which defaults to a safe mode that only records what it would do without changing anything.
- [`OpsChain.wait_step`](/key-concepts/actions.md#nesting-child-steps-under-a-wait-step) and [`OpsChain.input_step`](/key-concepts/actions.md#nesting-child-steps-under-an-input-step) now accept a `steps:` option, nesting the given steps as children that only start once the wait/input step is continued, approved, or submitted.
- It is now possible to start a change partway through, beginning execution at a nominated step and skipping its ancestors. In the GUI, non-root step play buttons in an asset's action tree offer **Run branch from here** (the existing subtree-only behaviour) and **Run _\<action\>_ from here**, which runs the whole action starting at the chosen step. Partial action trees started this way cannot be scheduled. See [starting a change partway through](/key-concepts/changes.md#starting-a-change-partway-through).
- Secret values stored in the OpsChain secret vault can now be auto-generated by the vault instead of being entered — available as a **generate** mode in the GUI's secret vault tool and by omitting the value in the API, and works when overwriting an existing secret too.
- A single action can now mix parallel and sequential groups of child steps, using the new `OpsChain.steps(steps, run_as:, step_name:)` helper to nest a group with its own execution strategy inside an action's `steps:` list. See [mixing parallel and sequential child steps](/key-concepts/actions.md#mixing-parallel-and-sequential-child-steps).
- Actions can now be referenced by their task name or their step name, in any case, wherever an action is referenced — in an action's `steps:` list, as the action passed to `opschain-action`, and as the action a change runs. See [referencing actions by name or step name](/key-concepts/actions.md#referencing-actions-by-name-or-step-name).
- The editable properties editors — the node's current properties, and the property overrides in the run change and run workflow dialogs — now provide JSON schema autocomplete and inline validation, matching the settings editors.
- Projects, environments, assets and agents now have an **Audit history** tab showing the most recent events scoped to that node. See [node audit history](/getting-started/familiarisation/gui/audit_history.md#node--agent-audit-history).
- The change and workflow run details screens now offer a **swim lane** view - the new default - that groups an activity's steps into status lanes (up next, waiting, running, completed and finished) for an at-a-glance summary alongside the existing step tree and logs views. A show/hide wrapper steps toggle lets you hide steps that exist only to group their children, and you can choose which view opens first. See [swim lane](/getting-started/familiarisation/gui/activity_details.md#swim-lane).
- The GUI header now shows an **active runs** indicator with the number of changes and workflow runs currently in flight; selecting it lists those runs with a link to each. See [the GUI overview](/getting-started/familiarisation/gui/overview.md).
- The [manage activity](/getting-started/familiarisation/gui/manage_activity.md#bulk-actions) screen can now action multiple waiting steps at once - continue or cancel on the continue tab, and approve, reject or cancel on the approval tab - by selecting rows and choosing a bulk action. Its rows now also show the target path, step, waiting status and time, and link through to their change or workflow run.

### Changed {/* #2026-07-23-changed */}

- The GUI's secret vault tool has been reorganised: the **Store** and **Decrypt** actions are now combined into a single **Secret vault** tab with a Store | Retrieve toggle that keeps the shared owner and path fields populated when switching, and the encrypt/decrypt-only tool is relabelled **AES encryption** to make clear it does not touch the vault. Input and results are now preserved when switching between the tools, and existing `?tool=store` and `?tool=decrypt` links continue to work.
- More node and instance settings are now editable through dedicated GUI form fields - including image reuse, API worker autoscaling, runner pod concurrency, and additional build and node-default options - each with a description, rather than only through the raw JSON advanced editor, which remains available. See [settings](/getting-started/familiarisation/gui/projects/properties_and_settings.md#settings).
- Running an action across multiple assets from the bulk action dialog now offers the same run options as running a single change, so options such as building the runner image without the Docker cache can be set for the whole batch. See [run change](/getting-started/familiarisation/gui/activity.md#run-change).
- The `opschain-ca` certificate managed by `cert-manager`, and the leaf certificates it issues (`opschain-api-cert`, `opschain-image-registry-cert`, `opschain-secret-vault-external-cert`, `opschain-secret-vault-cert`, `opschain-build-service-cert`), now all have a 10 year duration instead of the previous ~90 days, so they renew far less often. Upgrading to this version changes each certificate's spec, and `cert-manager` will reissue them to match at some point on its own — to avoid that landing as a surprise maintenance task within the next 90 days, force it immediately after upgrading by [renewing the CA](setup/configuration/tls/cert-manager.md#renewing-the-ca) followed by [renewing the leaf certificates](setup/configuration/tls/cert-manager.md#renewing-the-leaf-certificates), then, if you manually trust the CA on a host (for example a self-hosted K3s node's registry configuration), re-extract and re-trust it once, following the [certificate renewal](setup/setup-instance.md#setup-the-custom-ca) steps.
- Reduced the memory footprint of the `opschain-api` pod by loading the application once before forking its worker processes, rather than after.
- Improved the performance of loading projects, environments, and assets by removing redundant database queries: authorised child nodes are only preloaded when actually requested via `include`, and repeated template version history and background task lookups within the same request are now cached instead of re-queried.
- Improved the performance of viewing a change or workflow run — particularly for large step trees, or while its status is being polled repeatedly — by removing redundant database queries fired when serializing each step's children, change, and properties.
- Improved the performance of listing projects, environments, and assets by removing redundant per-item database queries for template versions, templates, and bookmarks.
- Reduced the database load of the recurring background check that clears stale step-status records, which had previously scanned the entire steps table on every run.

### Fixed {/* #2026-07-23-fixed */}

- Fixed an issue where webhook notifications configured on an event subscriber were never delivered. The notification job failed before it could send the request, and the failure was not recorded anywhere, so the notification appeared to have simply been dropped.
- Fixed an issue where input and wait steps added to a non-templated change lost their custom name and, for input steps, their input arguments once created — the step fell back to its generated action name and, for input steps, showed no fields to fill in.
- Fixed an issue where steps could intermittently fail with a database connection error when many steps of the same change ran in parallel. Running a step's script forks a new process from the change worker, and that process could corrupt a database connection another step was still using, causing an unrelated step to fail.
- Fixed an issue where the error raised when an action was defined more than once (for example, an `action` call in `actions.rb` colliding with a resource's built-in default action) reported the same file and line for both the new and the existing definition, making it difficult to find the actual duplicate. The error now reports the correct, distinct location for each.
- Fixed an issue where retrying a workflow run whose steps a user no longer has permission to execute would create a new workflow run that only failed once execution reached the unauthorised step, instead of being rejected immediately with a permission error when the retry was requested.
- Fixed an issue where the runner's database connection pool released idle connections almost immediately instead of after the intended two-minute idle period, causing unnecessary Postgres reconnections during change and workflow run execution.
- Fixed an issue where a step named in a change's or workflow run's `skip_steps` was not skipped when its name contained glob metacharacters such as `[`, `*`, or `?`, because the name was treated as a pattern rather than matched literally. See [skipping steps](/key-concepts/changes.md#skipping-steps).
- Fixed an issue in the GUI step tree where the descendants of a skipped step were shown with the change's overall status (for example, success) rather than as skipped.
- Fixed an issue where being logged out by an expired session discarded the page you were on, so logging back in always returned you to the home page instead of the page you were viewing.
- Fixed an issue where cancelling a blocked or pending change — particularly a retry of a single-pod change — could fail to take effect, with the change briefly running or being driven back through initialisation and started again despite the cancellation.

## [2026-07-20]

### Added {/* #2026-07-20-added */}

- It is now possible to use the GUI or API to store secret values and files directly in the OpsChain secret vault. Previously this required using the secret vault's own GUI.
- The GUI's encrypt/decrypt tool has been renamed **Secret management** and gained a **Store** tab for writing a text value or a file to a vault path, and the same capability is available through the API.

### Fixed {/* #2026-07-20-fixed */}

- Fixed an issue where property and setting values whose names merely began with a sensitive prefix — such as the vault password-generation descriptors `password_length` and `password_include_chars` — were masked in step logs as though they were secrets. Only genuine `password`, `passphrase`, and `passwd` keys are now masked.

## [2026-07-17]

### Upgrade notes {/* #2026-07-17-notes */}

- See the warning added to the [upgrade guide](operations/upgrading.md#upgrade-opschain) regarding upgrading from versions prior to `2026.07.09`. Failure to scale down the `opschain-api-worker` deployment before upgrading may result in error events being generated in the audit history during the upgrade process.
- The standalone MintModel API deployment has been removed now that MintModel requests run in short-lived, on-demand pods. Remove any `mintModelApi` settings (for example `mintModelApi.enabled`, `mintModelApi.replicas`, and `mintModelApi.env`) from your `values.yaml` before upgrading, as they are no longer recognised.
- If you configured a proxy following the [advanced proxy setup](advanced/advanced-proxy-setup.md#determine-the-no_proxy-service-list) guide, remove the `opschain-mintmodel-api` entry from your `no_proxy` service list, as that service no longer exists.

### Important breaking changes {/* #2026-07-17-important-breaking-changes */}

- The `name` field on the change and step API resources — and in the step context passed to actions — has been renamed to `step_name`. Any integrations or action code that read a step's or change's `name` from these payloads must be updated to read `step_name` instead. Existing `actions.rb` files are otherwise unaffected.
- Step runner and template action image builds no longer include the Git repository's `.git` directory by default. The default step runner Dockerfile never used it, but if you have a custom Dockerfile that relies on `.git` being present (for example, to run Git commands during the build), enable the new [`include_git_history`](/key-concepts/settings.md#include_git_history) setting after upgrading.

### Added {/* #2026-07-17-added */}

- It is now possible to have a change's wait steps continue automatically. When enabled, wait steps that require no approval and whose input arguments all have defaults progress on their own instead of pausing for manual input. The option is available when running, scheduling, or repeating a change.
- Actions can now be declared directly with human-readable display names — including spaces and capitalisation — which OpsChain slugifies into a valid task name while keeping the friendly name as the step's label. Prerequisites can reference these friendly names too, and existing actions continue to work unchanged. See [actions](/key-concepts/actions.md) for more information.
- The run and schedule change dialogs now let you build the runner image without the Docker cache directly from the GUI, and the setting is carried over when repeating a change.
- Templates can now be deleted. A template cannot be deleted while it is still assigned to a node or referenced by a change.
- The settings overrides editor in the [run change dialog](/getting-started/familiarisation/gui/activity.md#run-change) now provides JSON schema autocomplete and inline validation — suggesting keys and values and flagging invalid keys as you type — matching the behaviour of the [settings editors](/getting-started/familiarisation/gui/projects/properties_and_settings.md#settings).
- A _Fetch revision_ button is now available in the template version header, so a version's Git revision can be re-fetched directly from its details page. See [asset template versions](/getting-started/familiarisation/gui/projects/asset_templates.md#about-asset-template-versions) for more information.
- The browser tab's title and icon now reflect the status of the workflow run you are viewing — matching the existing behaviour for changes — so you can keep track of progress from another tab. See [activity details](/getting-started/familiarisation/gui/activity_details.md#understanding-the-activity-details-screen) for more information.
- The assets table now shows when each asset's available actions were last refreshed, so you can see at a glance how current the action list is.

### Changed {/* #2026-07-17-changed */}

- Improved step runner and template action image build performance by no longer archiving and hashing the Git repository's full commit history on every build unless it's actually needed — see the new [`include_git_history`](/key-concepts/settings.md#include_git_history) setting.
- Step logs now clearly indicate when a runner image is being built without the Docker cache, making it obvious that caching has been disabled for that build.
- Improved the performance of retrying a change or workflow run. Retries are processed in the background instead of synchronously, and the retry cascade itself is more efficient — it no longer re-queries each step's children individually — so retrying a large action tree is faster and no longer makes the API wait for every step to be reset before responding.
- Reduced the number of database queries performed during step transitions (for example, starting, completing, or entering a waiting state), improving throughput for changes and workflow runs with many steps.
- Improved performance when saving global settings on an instance with a large number of nodes.
- Reduced background processing load when transitioning asynchronous workflow steps, such as nested workflow runs or changes running as part of a workflow.
- Generating an asset's MintModel is now non-blocking — the request returns immediately and the model is concretised in the background, which you can follow for progress. If concretisation fails, its render logs are surfaced against the task so the failure can be diagnosed.
- Breadcrumb dropdowns now sort their entries naturally (for example, `asset-2` before `asset-10`) and are context aware — selecting a sibling project, environment or asset now takes you to the equivalent page for that resource where one exists, rather than always returning to its landing page.
- Long action descriptions in an asset's available actions list and expected actions tree are now truncated to keep the lists compact; hover over a description to see the full text.
- Improved load time for a project's page when it has a large number of bookmarks or child nodes.
- Improved load time for the workflow runs list when a run has a large step tree.
- Reduced the frequency of garbage-collection pauses on the API server and background worker by pre-sizing the Ruby heap at boot, improving responsiveness for large requests such as fetching a change with a big step tree or generating a MintModel diff.
- Step logs now show the full commit context banner — Git revision, SHA, author and message — when a cached runner image is reused, not only when an image is built, so you can always see which commit a step's image corresponds to.

### Fixed {/* #2026-07-17-fixed */}

- Fixed an issue where a momentary database connection or transaction fault during a step transition could permanently fail the step, and its parent change, with a system error. Such transient faults are now retried automatically for a short period before the step is failed.
- Fixed an issue where the MintModel API could enter a crash loop (`CrashLoopBackOff`) under load. MintModel requests now run in short-lived, on-demand pods, with the number running at once bounded by the new `concurrent.mintmodel_limit` setting — see [runner pod concurrency settings](/key-concepts/settings.md#runner-pod-concurrency-settings) for more information.
- Fixed an issue where saving OpsChain secret vault settings without specifying every option could fail validation, because unset numeric and boolean options were stored as empty strings.
- Fixed an issue where a failed install could leave behind image-pull-secret resources that blocked every subsequent install with a `rolebindings … already exists` error; these resources are now cleared before each install.
- Fixed slow performance when viewing an asset with a broken MintModel template — generation failures are now cached, so a deterministically broken template no longer re-runs the full MintModel generation against the external API on every request.
- Fixed a rare race condition where deleting a resource at the same moment it became in use could fail with a system error; the deletion is now handled cleanly — either reporting that the resource is in use, or archiving it instead.
- Fixed the internal application caching of generated MintModels because they were incorrectly shared across assets in some situations previously. This was done by removing this cache.
- Fixed an issue where the change and workflow run detail pages could stop refreshing automatically, leaving the page stale until it was reloaded. Details now continue to refresh even while the browser tab is in the background.
- Fixed an issue where switching the workflow version in the run workflow dialog did not update the sample properties pre-populated in the properties overrides tab.
- Fixed an issue where the template, template version and actions columns in a template version's linked assets table were displayed empty.
- Fixed an issue where a MintModel node reached through an `actions.rb` combo action's `steps:` list could fail with a "Don't know how to build task" error instead of running, because it was misclassified as a regular runner step.
- Fixed an issue where generating a MintModel with debug output enabled (`enable_mintmodel_debug`) could crash with a server error, because the debug logs were returned as a raw list rather than the expected categorized structure.
- Fixed a rare issue where using `skip_steps` on a workflow run could leave a skipped step's sibling permanently stuck "queued" and the parent step (and the run) stuck "running" indefinitely, when the skip targeted a step running in parallel with others.
- Fixed an issue where listing changes for a project, environment, or asset with a large number of steps could fail with a database timeout error.
- Fixed an issue where an action's description was truncated at its first sentence. The full description defined with `description:` — including multi-sentence descriptions — is now retained and carried through to the steps of a change. See [actions](/key-concepts/actions.md#gui-display) for more information.
- Fixed a security issue where the OpsChain secret vault session token could appear unmasked in MintModel render logs; this token is now scrubbed before the logs are returned.

## [2026-07-09]

### Added {/* #2026-07-09-added */}

- Notification emails now include a formatted HTML body. Change, workflow run, step, property, settings and waiting notifications render as a readable table — showing the project/environment/asset hierarchy, the action or workflow, the initiator and relevant links — instead of the terse text still used for Slack and Teams messages. See [notifications](/operations/notifications.md) for more information.
- Git remotes can now record a public URL, used as the prefix when generating links to individual commits in the source repository. See [git remotes](/getting-started/familiarisation/gui/projects/git_remotes.md) for more information.
- The OpsChain secret vault can now be configured with password-generation options (length, character classes, symbol set, auto-creation) and TLS certificate verification. See [vault settings](/key-concepts/settings.md#vault-settings) for more information.
- OpsChain can now back up its database automatically. Scheduled backups run on a configurable cron schedule, and a backup can also be taken automatically before each upgrade. Backups run inside the cluster and stay on your local network, write to a dedicated volume, are pruned according to a retention policy, and only run on the primary cluster. An optional recovery helper pod can also be enabled to restore from a backup with a single `kubectl exec`. See [automated backups](/operations/maintenance/backups.md#automated-backups) and [database recovery](/operations/maintenance/backups.md#database-recovery) for details.
  - :::warning[Backup storage size]
    Ensure you configure the backup volume size in your `values.yaml` to accommodate the amount of space you have available. See [backup storage size](/setup/configuration/additional-settings.md#dbbackupstoragesize) for more information.
    :::
  - The backup utilities' `imagePullPolicy` is set to `Always` by default to ensure your cluster will pull the latest database image. **Leave this setting as-is** on the first deployment to this version. Once your nodes have the updated `opschain-db` image you may set it to `IfNotPresent` to skip the per-run registry check.
- Bulk run actions from the assets table — You can now select multiple assets and run a chosen action across all of them at once using the new “Bulk run action” option in the assets table. The dialog lets you pick a shared action to apply to all selected assets, or assign a different action per asset. Results are tracked and reported individually as each change is created.
- Notifications tab on change details — When a change was started with notification targets configured (users, email addresses, LDAP groups, or specific events), a “Notifications” tab now appears on the [change detail page](/getting-started/familiarisation/gui/activity_details.md), giving you a clear view of who will be notified and when.
- Repeat a change with its notifications preserved — When repeating a change, any notification settings from the original change are now carried over into the repeat dialog, so you don’t have to reconfigure them each time.
- Time selectors in activity date range filters — The date range filters on the activity log and audit history now include time-of-day pickers, allowing you to narrow results to a specific hour, minute, and second — not just a day.
- Email hints for usernames in the [workflow editor](/getting-started/familiarisation/gui/workflows.md#workflow-editor) — When editing workflow YAML, usernames listed under user_names: now display the associated user’s email address as a subtle inline hint, helping you confirm you have the right person without leaving the editor.
- API cache management in admin settings — A new “API Cache” section is available in the admin settings page (superusers only) with a button to manually clear the backend API cache. Useful when cached data needs to be refreshed immediately.
- Commit links use the Git remote’s public URL — Where a Git remote has a public_url configured, commit links in the UI (on change detail and template version pages) now use that URL, allowing links to open in a publicly accessible web interface (e.g. GitHub or GitLab) even when the remote itself uses an internal SSH address.

### Changed {/* #2026-07-09-changed */}

- MintModel render logs are now grouped into labelled categories (step generation, MintModel API, property convergence, command errors) rather than a flat list. The GUI displays them as formatted JSON and automatically collapses all but the most relevant section, so failures and output are visible without scrolling.
- When pre-populating sample properties in the _Run workflow_ dialog, the values are now left empty (only the property keys are provided) so you are prompted to enter each value rather than passively accepting pre-filled defaults.

### Fixed {/* #2026-07-09-fixed */}

- Fixed a security issue where decrypted secret values could appear in MintModel render logs and downloaded debug archives; these values are now masked.
- Fixed an issue where notifications sent to external (non-OpsChain) email addresses were added as blind-carbon-copy recipients rather than direct recipients.
- Fixed an issue where retrying a change did not carry over its notification (event subscription) settings; retried changes now reuse the original change's settings unless new ones are supplied.
- Fixed a rare race condition that could leave a workflow run stuck _running_ indefinitely when several parallel steps finished at almost the same moment.
- Fixed a rare race condition on a single-pod runner where a completed step could be processed twice, logging an "Unable to construct a step result processor" error.
- Fixed an issue where supplying an explicit `null` value for a property override returned a server error instead of a clear validation error.
- Workflow overview correctly shows multiple-target steps — Step nodes in the workflow overview now display a count of targets when a step runs across multiple targets. Hovering the node shows the full target list in a tooltip.
- MintModel render logs focused on the relevant section on error — When viewing render logs after a generation failure, the log viewer now automatically collapses less relevant sections and expands the most meaningful one (e.g. step generation details), saving you from scrolling through noise to find the failure detail.

## [2026-07-03]

### Added {/* #2026-07-03-added */}

- A bell icon in the change and workflow run actions bar lets you watch an active run and receive a browser desktop notification when it completes. The bell is always visible while a run is in progress: clicking it when browser notifications are not yet configured opens the Notification preferences dialog. Settings are persisted per-browser in local storage. An optional _auto-watch_ setting in Notification preferences automatically watches any active run you open, so you never need to click the bell manually. See [browser notifications](getting-started/familiarisation/gui/activity_details.md#browser-notifications) for more information.
- When retrying a failed change, you can now choose which steps to skip. The retry dialog shows the full step tree with checkboxes — select individual steps or entire subtrees to bypass on the next run. Skipped steps appear with a "Skipped" badge in the step tree, and steps that already ran successfully in a previous attempt are labelled "Ran previously" to help you see what still needs to complete.
- A "Run" button is now available in the workflow editor toolbar, letting you run the currently loaded published workflow version directly from the editor without navigating away. See [Workflow details and actions](getting-started/familiarisation/gui/workflows#workflow-details-and-actions).
- A "Run" button is now also available in the [workflow details page](getting-started/familiarisation/gui/projects/workflows#buttons--links-1).
- The "Trust host" option — which scans and accepts the server's SSH host key — is now available when editing an existing Git remote, not only when creating a new one. See [Editing a git remote](getting-started/familiarisation/gui/projects/git_remotes#editing-a-git-remote).
- When selecting a workflow version in the "Run workflow" dialog, any sample properties defined for that version are now automatically pre-populated in the properties override tab, giving you a ready-to-use starting point.
- Change input arguments now support array and hash (JSON object) types. Arrays display a list of string values with add and remove controls; hashes display a JSON editor with inline validation.
- The email notification channel configuration now includes a "from" field, allowing you to set a custom sender address for OpsChain email notifications.
- Step nodes in the change tree now show a small copy icon next to the truncated action name. Clicking it copies the full action name to your clipboard. [More details about step lifecycle](getting-started/familiarisation/gui/activity_details#step-lifecycle).
- Runner images are now reused across changes and steps: when a step or change would build an image identical to one already built, OpsChain reuses the existing image instead of rebuilding it, reducing build times and load on the image build service. Reuse is on by default and configurable via the new `image_reuse` setting — see [image build settings](/key-concepts/settings.md#image-build-settings).
- OpsChain now caps how many runner and actions-refresh pods run at once on a cluster, so busy clusters don't create more pods than they can schedule. The caps share capacity between the two pools and are configurable via the new `concurrent` setting — see [runner pod concurrency settings](/key-concepts/settings.md#runner-pod-concurrency-settings).

### Fixed {/* #2026-07-03-fixed */}

- Fixed an issue where a MintModel action's connect-user override (`mintpress.sudo.username`) could be silently ignored on some steps, causing the action to run as the wrong user.
- Fixed an issue where running a MintModel action as a workflow step could fail because the acting user was not set from the workflow run's creator.
- Fixed an issue where redundant MintModel history records could be created for an asset; existing duplicate history entries are collapsed on upgrade.
- Fixed an issue where image build throttling and reuse could incorrectly block or throttle builds across separate OpsChain clusters that share a single PostgreSQL database.
- MintModel step logs now show the exact `mintpress_ctl.rb` command that was run, including the resolved MintModel JSON path and SSH key path, instead of the raw (unresolved) command template — making it easier to diagnose issues by reproducing the command directly.
- Fixed mouse wheel zoom and panning on the step tree canvas in Firefox. Delta values are now normalised and clamped, eliminating the large unexpected jumps that could occur when scrolling.
- Fixed an issue where opening a properties comparison dialog followed by a settings comparison dialog (or vice versa) could cause the wrong data to be displayed in the second dialog.
- Fixed an issue where retrying an incomplete change could fail with an error, or silently miss newly-added default settings, when the settings schema had changed since the change first ran. Retried changes now reconcile their settings against the current schema, dropping any override settings that are no longer valid (recorded in the change's events).

### Changed {/* #2026-07-03-changed */}

- The global search bar now uses fuzzy matching, producing more relevant results even when your search term doesn't exactly match a node's name or code. Results appear immediately as you type with no delay.
- You can now supply custom sample properties when validating a workflow that has already been run.
- Changes and workflow runs that are queued behind another run — because parallel execution is disabled, or because they must run in creation order — now start promptly when the run ahead of them finishes, instead of waiting for the next poll.

## [2026-06-29]

### Added {/* #2026-06-29-added */}

- The Git fetch command is now logged at the start of the fetch output, making it easier to diagnose connectivity and authentication failures by showing the exact command OpsChain ran. See [activity details](/getting-started/familiarisation/gui/activity.md#activity-details) for more information.
- The FUSE device plugin daemonset now supports additional environment variables via `fuseDevicePlugin.env` in `values.yaml`. See [fuseDevicePlugin.env](/setup/configuration/additional-settings.md#fusedevicepluginenv) for details.
- Administrators now have a _Clusters_ tab in the system information area that shows every high availability cluster's deployment configuration. You can compare two clusters against each other to spot configuration drift, and compare versions of a cluster's recorded configuration over time.
- Authentication settings can now be configured via the GUI in the system configuration page.
- The name of the cluster you are currently connected to is now shown in the [version info dialog](/getting-started/familiarisation/gui/version_info.md).
- If an editable setting is misconfigured in a way that prevents you from signing in, an operator can now recover by overriding it from the deployment. Setting `OPSCHAIN_OVERRIDE_<SETTING>` in your `values.yaml` re-applies the supplied value to the matching setting on the next boot, and the override is recorded in the audit history. See [overriding a database setting from a deploy](/setup/configuration/additional-settings.md#overriding-a-database-setting-from-a-deploy) for more information.
- Concurrent image builds can now be throttled to improve performance on busy clusters. See [image build settings](/key-concepts/settings.md#image-build-settings) for details.
- Forked step processes now set a meaningful process title (e.g. `opschain-action deploy`, `mintpress_ctl.rb run_action`) so that active steps are identifiable by their script and action in process monitoring tools such as `ps` or `top`. See [identifying running OpsChain processes](troubleshooting.md#identifying-running-opschain-processes) for more information.
- The expected actions tree for an asset now expands MintModel steps in an `actions.rb` change to include their full tree — matching what will execute at runtime. For more information about running MintModel steps from an `actions.rb`, see [running MintModel actions as child steps](/key-concepts/actions.md#running-mintmodel-actions-as-child-steps).
- It is now possible to skip specific steps when starting or retrying a change or workflow run. Set a `skip_steps` array of glob patterns on the change, workflow run, scheduled change, or scheduled workflow — any step whose identifier matches a pattern is automatically skipped at runtime (`full_path` is matched for change steps; MintModel steps are matched by their hierarchical step name as it appears in the step tree (e.g. `**/Install jdk Binaries`); `name` for workflow steps). See [skipping steps](/key-concepts/changes.md#skipping-steps) for more information.
  - The mask is carried forward automatically on retry, so previously-skipped steps remain skipped without needing to be resubmitted. It can also be overridden at retry time.
  - Approval steps are always exempt — a step with `requires_approval_from` set will run regardless of any matching pattern.
  - Creating or retrying a change where `skip_steps` would skip the root step is rejected with a validation error.
- A new [`runner.use_fork_for_mintpress_ctl_rb`](/key-concepts/settings.md#runneruse_fork_for_mintpress_ctl_rb) setting controls whether the MintModel executor forks or spawns a new process when running `mintpress_ctl.rb`. The default (`true`) preserves existing behaviour; set to `false` to run in a new process instead.
- Assigning a [template version](/getting-started/familiarisation/gui/projects/asset_templates.md#asset-template-details-and-versions) to multiple assets at once now automatically refreshes each asset's actions, so the available actions reflect the newly assigned version without a manual refresh. If an asset's actions cannot be refreshed, the assignment still succeeds and the affected assets are reported in the response warnings.
- The [settings editors](/getting-started/familiarisation/gui/projects/properties_and_settings.md#settings) now provide JSON schema autocomplete and inline validation. As you edit the settings for a project, environment, asset, agent, or template version (or the system configuration), you now get key and value suggestions and invalid keys are flagged, matching the schema the server enforces on save.
- The image build logs now show the commit author alongside the commit SHA and message, making it easier to identify who authored the code an image was built from.
- It is now possible to update an existing [Git remote's](/getting-started/familiarisation/gui/projects/git_remotes.md) URL, allowing its credentials, scheme, or port to be changed without recreating the remote. The host and repository path are immutable — a URL that points the remote at a different repository is rejected, since the existing clone and recorded commit SHAs are tied to the original. As when creating a remote, superusers can opt to scan and trust the new host's SSH key when switching to an SSH URL.
- Git remotes that use an SSH URL now accept a dedicated passphrase for the SSH key, kept separate from HTTP(S) passwords. SSH key data is required when using an SSH URL, and supplying a passphrase for a non-SSH remote (or a password for an SSH remote) is rejected with a clear error.
- Two additional settings are now configurable from the admin settings page in the GUI: `git_remote.fetch_stale_threshold`, which controls how long OpsChain waits before retrying a stale in-progress Git fetch, and `log.step_pod_events`, which controls whether Kubernetes pod events are included in step logs.
- When a MintModel generation fails, a "View generated MintModel" button is now shown alongside the error, allowing you to inspect whatever partial output was produced before the failure.
- The [workflow editor](/getting-started/familiarisation/gui/workflows.md#workflow-editor) now offers autocomplete suggestions when configuring child steps, making it easier to select the correct step name without having to remember exact identifiers.

### Fixed {/* #2026-06-29-fixed */}

- Fixed an issue where cancelling the generation of an asset's actions could leave the asset displaying actions belonging to a different asset.
- Fixed a rare issue where registering a value for sensitive-data masking could cause a step to hang indefinitely if the masker was unavailable. Masking now uses a bounded timeout with retries, so the step fails promptly instead of hanging.
- You can now trust additional SSH hosts for Git authentication via the new [`known_hosts` global setting](/key-concepts/settings.md#known_hosts), without replacing the bundled `known_hosts` file. Entries are merged with the bundled defaults, and because they are stored in the database they are preserved across Helm upgrades and redeploys and replicate across high availability clusters. Each entry is validated when saved, so malformed lines are rejected. See [adding entries via the `known_hosts` setting](/setup/configuration/additional-settings.md#adding-entries-via-the-known_hosts-setting) for more information.
- When [creating a Git remote](/getting-started/familiarisation/gui/projects/git_remotes.md), superusers can now opt to automatically scan and trust the remote's SSH host key. OpsChain registers the scanned key in the `known_hosts` setting before testing connectivity (trust on first use), so a remote can be added even when its host was not previously trusted. The scanned entry is returned in the response, and the operation is restricted to superusers.
- Fixed an issue where the step input arguments form was not rendering correctly after an API response format change, causing arguments to be displayed incorrectly or not at all.
- Fixed an issue where MintModel generation errors were not correctly surfacing any partial results or the phase output and render log viewer buttons.
- Fixed an issue in the workflow step tree where an incorrect change label was shown in the tooltip on workflow run steps.

### Changed {/* #2026-06-29-changed */}

- The [installation guide](/setup/installing_k3s.md) has been updated to limit access to the installation user and clarify the required sudo privileges.
- Settings that can be configured via the GUI or API no longer require a restart of the OpsChain API to take effect.
- A defined set of settings is now managed by the deployment. These are only configurable via your `values.yaml` file and apply at install and upgrade time. See [settings managed by the deployment](/setup/configuration/additional-settings.md#settings-managed-by-the-deployment) for the full list.
- The `skip_on_retry` attribute on steps is now computed from the owning change's or workflow run's `skip_steps` array. Patching a step with `skip_on_retry: true/false` continues to work and translates into an update to that array. _`skip_on_retry` is deprecated and will be removed in a future release. Migrate to `skip_steps` on the change or workflow run._ See [skipping steps](/key-concepts/changes.md#skipping-steps) for more information.
- Image builds now pull `docker.io` base images through the bundled in-cluster registry mirror rather than reaching out to Docker Hub directly, reducing external egress and avoiding Docker Hub rate limits.
- When debug mode is enabled for an asset, the MintModel render logs now also include the MintPress context, the asset's properties, the filtered properties, and the MintPress properties supplied to the MintModel Steps API, making MintModel generation failures easier to diagnose.
- The [Git remote add and edit form](/getting-started/familiarisation/gui/projects/git_remotes.md#creating-a-git-remote) has been redesigned with a clearer HTTPS/SSH credential selector. When editing an existing remote, the URL can now also be updated directly in the form.
- The MintModel "Latest" tab now independently fetches the freshest asset state each time it is opened, ensuring the view always reflects up-to-date data.
- When an asset does not have a valid MintModel, the messaging on the "Latest" tab has been simplified — detailed error information is no longer shown inline, and instead a direct link to the Generate tab is provided.
- The admin settings page has been reorganised: Authentication settings now have their own dedicated section, the API settings section has been removed, and Build service settings have been consolidated into a single section.

## [2026-06-18]

### Added {/* #2026-06-18-added */}

- Container image builds now automatically retry up to 3 times when a transient BuildKit error is detected (e.g. a gRPC connection drop). The retry count is configurable via the [`build_service.max_image_build_retries`](/key-concepts/settings.md#build_servicemax_image_build_retries) setting.
- A new `OpsChain.step` helper creates a composable wrapper step that combines wait, input, and ignore failure behaviours in a single call. See the [step wrapper](/key-concepts/actions.md#step-wrapper) documentation for more information.
- A new `OpsChain.ignore_failure_step` helper is available for wrapping actions as child steps. It creates a thin wrapper action with `ignore_failure: true` so the change continues even if the step fails. See the [ignore failure steps](/key-concepts/actions.md#ignore-failure-steps) documentation for more information. This is particularly useful for MintModel steps which can't be marked as `ignore_failure` in the `actions.rb` natively.
- A new `OpsChain.query` helper allows action code to query the OpsChain API server directly, retrieving live node, MintModel, properties, or settings data during a change. The request authenticates with the short-lived API key injected into the step context, which is only generated when the `token.change_api_key_expiry_days` (or `token.agent_api_key_expiry_days`) setting is enabled. See the [querying the API](/key-concepts/actions.md#querying-the-api) documentation for more information.
- The Git logs can now be viewed whilst a template version is being refreshed.
- API responses now support sparse fieldsets, allowing clients to restrict the fields returned for each resource type using `fields[resource_type]=field1,field2` query parameters. See the [sparse fieldsets](/advanced/api-filtering.md#sparse-fieldsets) guide for more information.
- The steps API now returns an additional `description` field. This is populated for MintModel steps, to provide additional details.
- A new `git_remote.fetch_stale_threshold` setting controls how long OpsChain will wait for an in-progress Git fetch before performing a fresh fetch of its own. See the [Git remote settings](/key-concepts/settings.md#git_remotefetch_stale_threshold) documentation for more information.
- An event is now created when the actions are regenerated for an asset.
- A timestamp now shows how long it took to generate a MintModel when running a change.
- New `on_failure.dump_properties` setting controls whether resolved resource properties are dumped to the change logs, when a resource controller fails during a change. See the [`on_failure.dump_properties`](/key-concepts/settings.md#on_failuredump_properties) documentation for more information.
- New `controller.mask_properties` settings controls whether sensitive properties supplied to resource controllers are added to the data masker prior to being supplied to the controller. See the [`controller.mask_properties`](/key-concepts/settings.md#controllermask_properties) documentation for more information.
- The list MintModels and list MintModel history API endpoints now support the `limit` query parameter to restrict results and filtering and sorting via `filter` query parameters. See the [API filtering & sorting](/advanced/api-filtering.md) guide for more information.
- The MintModels and MintModel history API endpoints now support the `include` query parameter, allowing related resources (e.g. `mintmodel_history`, `mintmodel`, `opschain_changes`) to be sideloaded in a single request. The MintModel history show endpoint includes `mintmodel` and `opschain_changes` by default; pass `include=` (empty) to suppress them.
- Step tree search — a search bar is now available at the top of the step tree on changes, workflow runs, and workflow overviews. You can type to highlight matching step names and navigate through results with the arrow keys or Enter, making it much easier to locate a specific step in large or complex runs.
- Step status filter badges — the step tree header now shows a summary of how many steps are in each status (running, waiting, failed, succeeded, etc.). Clicking a status badge highlights all matching steps on the canvas and jumps to the first one, allowing you to quickly focus on steps that need attention without scrolling through the entire tree.
- Canvas minimap — a minimap overlay now appears in the bottom-right corner of the step tree canvas for changes, workflow runs, and workflow overviews. You can click or drag on the minimap to jump to any part of the tree, which is particularly useful for large runs with many steps.
- Canvas zoom and fit controls — zoom in, zoom out, fit-to-view, and fit-to-width buttons are now available on the step tree canvas. These controls appear as a floating toolbar, replacing the need to use the scroll wheel alone.
- Expand/collapse by depth level — the step tree toolbar now includes controls to expand or collapse the tree to a specific depth level. You can step through levels one at a time, making it easier to get an overview of a large change before drilling into details.
- MintModel phased output viewer — when viewing the latest or generated MintModel for an asset, a "View phased outputs" button is now available when phase output data exists. This opens a panel showing the asset's data at each stage of the MintModel generation pipeline (initial, post-scaleout, post-business-rules, post-resolve, and final). You can also compare any two phases side by side using a diff view.
  - _Note: this is only shown when `enable_mintmodel_debug` is present and set to `true` under the asset settings._
- MintModel render logs viewer — a "View render logs" button now appears on the MintModel page when render logs are available, allowing you to inspect the raw output from the rendering process.
- Git revision fetch progress — when a template version is fetching its git revision, a live progress indicator now appears showing the current fetch stage (e.g. counting objects, receiving objects) along with a percentage. A full scrollable log of the fetch output can be viewed by clicking the indicator.
- Assets table additional columns — the assets listing table now shows the assigned template name, template version number and state, and the status of action generation (e.g. "Generated", "Generating", "Not available") for each asset. MintModel assets are also labelled directly in the Name column.
- Data cleanup audit history filter — a new option to delete audit history (jobs) is now available in the data cleanup configuration, with an optional age filter so that only records older than a specified number of days are removed.
- Audit history richer source links and detail — events in the audit history now include contextual links directly to the relevant resource (change, step, template version, workflow, scheduled activity, git remote, policy, etc.). Hovering a source link shows a tooltip with key details such as status, action, project, and who created it. The individual event detail page now presents the message, path, and progress log as distinct readable sections rather than a raw JSON dump.
- Audit history project and workflow names in source — where previously only internal codes were shown, source links in the audit history now display human-readable names for projects and workflows.
- Bulk delete for authorisation policies — You can now select multiple authorisation policies from the table and delete them all at once using the new "Bulk actions" menu. A confirmation dialog lists the policies to be deleted before anything is removed, and any failures are reported individually without blocking the rest of the deletions.

### Fixed {/* #2026-06-18-fixed */}

- When generating a MintModel, a new history record is now only skipped if the asset's most recent MintModel history entry already references the same MintModel. Previously, any existing history entry for the same MintModel would be reused, meaning a return to an older model state would not be recorded in the asset's history.
- Fixed use of nested MintModel steps within an `actions.rb` (it would inconsistently fail before).
- Orphaned template versions whose parent template had been deleted are removed on upgrade. An `opschain:migration:update` event is created for each removed record to allow for auditing.
- Orphaned MintModel history records whose parent MintModel no longer exists are removed on upgrade. An `opschain:migration:update` event is created for each removed record to allow for auditing.
- Fixed conversion of WebLogic property names by forcing the `activesupport` camelcase implementation in `mintpress_ctl.rb`.
- Audit history invalid source links — source links were previously broken for several event types including deleted resources, scheduled activities, git remotes, and authorisation policies. These now resolve correctly.
- MintModel compare wrong versions loaded — selecting a MintModel version to compare was previously using an incorrect identifier, causing the wrong data to be loaded. This has been corrected.
- Logs from MintModel steps that were shown on error cleanup are now shown as expected.
- Actions list sorted alphabetically (case-insensitive) — The list of actions available on an asset is now sorted in a consistent case-insensitive alphabetical order, so actions starting with uppercase or lowercase letters appear in the expected position rather than grouped by case.
- Git remote link on change details was broken — The link to the git repository on the change detail page was navigating to the truncated display label instead of the full URL. This has been corrected so the link always opens the right destination.

### Changed {/* #2026-06-18-changed */}

- MintModel generation is now skipped during change initialisation when a cached model already exists for the current properties. This avoids a redundant MintModel API call when the asset's MintModel and properties have not changed since the last generation.
- MintModel "Latest" tab — the latest MintModel view now shows when the MintModel was generated, and surfaces phase output and render log buttons directly in the toolbar when available. If the asset does not have a valid MintModel, a clear message is shown with a Retry button and a shortcut to the Generate tab.
- MintModel "Compare" tab — the compare view now fetches its own history independently rather than relying on shared data, and errors during loading are handled gracefully with a proper error state.
- Audit history refresh rate — the audit history page now refreshes every 5 seconds (previously 15 seconds) so that new events appear more promptly.
- The OpsChain pods now enforce `runAsNonRoot: true` and avoid entering the pod as root.
- The LDAP refresh events now carry more detail. The start events record the search base, filter, and timeout, the success event records the per-type entry counts (distinguishing freshly searched counts from cached counts when a type is skipped) and the elapsed search time for each type searched, and all refresh events now include the LDAP host and port. A start event is now only emitted when a filter is actually searched, avoiding a misleading event when the group filter is absent or invalid.

## [2026-06-04]

### Added {/* #2026-06-04-added */}

- The `api.env`, `apiWorker.env`, `imageCopyJob.env`, `ldap.env`, `logAggregator.env`, `mintModelApi.env`, `mintModelStepsApi.env`, and `registryReconcile.env` `values.yaml` settings have been added to allow additional environment variables to be injected into their respective containers. See the [additional settings](/setup/configuration/additional-settings.md) guide for more information.
- The MintModel executor now logs the `mintpress_ctl.rb` command that will be run during MintModel steps.
- An `actions.rb` file can now run steps defined by the asset's MintModel. [Learn more](/key-concepts/actions.md#running-mintmodel-actions-as-child-steps).
- You can now compare any two nodes (projects, environments, assets, or agents) side by side. The comparison shows differences in settings, properties, assigned templates, agents, and MintModel output between the two nodes. An indicator is shown on the node when it is part of an active comparison.
- A new LDAP refresh button is available in the Manage Security section to manually trigger an LDAP directory sync without having to wait for the next scheduled refresh.
- A new deletable permission can now be configured in authorisation policies, giving finer control over who can delete resources.

### Changed {/* #2026-06-04-changed */}

:::warning[PostgreSQL downtime on upgrade]
This upgrade modified the default PostgreSQL settings for the database cluster. When deploying, this will cause a short downtime of the database cluster. To avoid any downtime, you can increase the number of database replicas locally and set the `db.cnpg.primaryUpdateMethod` setting to `switchover` in your `values.yaml` file before deploying. See the [database settings](/advanced/ha/index.md#dbcnpgprimaryupdatemethod) documentation for more information.
:::

- The PostgreSQL settings have been adjusted to improve performance in production workloads.
- The registry reconciliation job is now enabled by default. To disable it, you must now set the `registryReconcile.enabled` setting to `false` in your `values.yaml` file before deploying. See the [image cleanup settings](/setup/configuration/additional-settings.md#image-cleanup-settings) and the [container image cleanup](/operations/maintenance/container-image-cleanup.md) guides for more information.
- The `worker.*` and `mintmodel_executor.*` settings have been removed and consolidated into the `runner.*` settings.
  - The existing `worker.*` or `mintmodel_executor.*` settings (globally, for projects, for environments, and for assets) are automatically migrated to `runner.*` on upgrade (but not for changes). Note, if you used these settings you must audit the updates - see the `opschain:migration:update` event referenced below.
  - The `worker.reuse_actions_rb` setting is now `runner.reuse_actions_rb`.
  - An `opschain:migration:update` event is created for the settings that were changed during upgrade to allow for auditing.
  - _Note: changes that had override settings for `worker.*` or `mintmodel_executor.*` won't be able to be retried after this update (they can still be repeated, but you will need to update the settings)._
- The agent base image is now based on the same image as the runner, executor and worker.
- Locally authenticated user accounts can now log in to OpsChain whilst the LDAP server is inaccessible (without needing to change any config).
- The asset's MintModel history is now updated when actions are refreshed (if the MintModel has changed). Previously, the MintModel used during action refresh was not saved to the asset's history.
- LDAP integration has been modified to use a background job to synchronise a local store of the LDAP users and groups. See the [LDAP synchronisation settings](key-concepts/settings.md#ldap-synchronisation-settings) documentation for more information on the new LDAP settings.
- The template type field is now read-only when editing an existing template, preventing accidental changes to a type that may already be in use.
- The worker image configuration fields (repository, name, and tag) have been removed from the runner configuration page in Admin settings, as these are no longer managed from the GUI.
- MintModel generation changes:
  - it now provides more explicit details of failures found when parsing `lib` classes and modules.
  - a new `enable_mintmodel_debug` settings has been added to enable extra debug logging for MintModel generation.
  - `OpsChain.context` and `OpsChain.properties` are now available within your ERB template to provide more context when concretising the MintModel.

### Fixed {/* #2026-06-04-fixed */}

- The edit option in the template actions menu was not opening the edit dialog correctly. This has been fixed.
- The link to update a git remote from the template layout actions was pointing to the wrong location. This has been fixed.
- When opening the edit dialog for an existing template, the form fields were not being filled in with the current values. This has been fixed.
- Navigating to the latest MintModel tab could show stale data. It now re-fetches automatically when the tab is opened.
- When validating multiple template versions with the same commit, the first validation result no longer causes the others to be removed.
- The `create_local_user` task can now be used when the LDAP server is unreachable.
- The performance of the back end queries that support the policy administrator screens have been improved.
- The Activities queries have been optimised to improve performance when there are large numbers of activities and user authorisation rules.

## [2026-05-26]

### Added {/* #2026-05-26-added */}

- The authorisation of scheduled activities has been improved.
- A job to clean up images from the OpsChain image registry has been added and can be configured via the `values.yaml` file. See the [image cleanup settings](/setup/configuration/additional-settings.md#image-cleanup-settings) and the [container image cleanup](/operations/maintenance/container-image-cleanup.md) guide for more information.

### Changed {/* #2026-05-26-changed */}

- The runner, executor and worker images are all based on the same base image.
  - This means the `mintpress` user has been removed from the image, hence the image always runs as `opschain`.
  - The `/opt/mintpress` path still exists and contains the MintPress SDK.
  - The home directory of the `opschain` user remains `/opt/opschain`.
  - The `worker.name` configuration default has been updated to `opschain-runner-enterprise`. This is an automated update.

## [2026-05-21]

### Added {/* #2026-05-21-added */}

- The `requires_approval_from` usernames and ldap groups can now be sourced from the relevant node's properties. See the [settings documentation](key-concepts/settings.md#requires_approval_from) for more information.

### Important breaking changes {/* #2026-05-21-important-breaking-changes */}

- The OpsChain API will no longer start if the `token.secret_key` setting (which is originally set from the `OPSCHAIN_TOKEN_SECRET_KEY` value in your values.yaml) is not set or is empty. This setting was introduced in 2026-04-21 and must be set as part of the security configuration. OpsChain will no longer startup with it unset to prevent accidental misconfiguration.
  - This relates to CVE-2026-45363.
  - _Note that changing the value of `token.secret_key` was broken previously, see the [release notes below](#2026-05-18-known-issues) for more details._
  - **To verify before updating**, go to the "administration"->"configuration" screen in the GUI. Switch to "advanced mode" and view the value of "token"->"secret_key". A value must be present, for example `{AES2}+abyGjcoVen3vRw76L2CpQ=={/IV}U...`. If the value is not present, set it to a 128 character long random string (for example a value generated by the following Ruby code: `SecureRandom.hex(64)`). _Note: once the value is updated you will likely encounter the [known issue below](#2026-05-18-known-issues)_.
  - See the [troubleshooting guide](troubleshooting.md#error---decode-error-on-login) if necessary.

### Changed {/* #2026-05-21-changed */}

- Upgraded all images to AlmaLinux 9.7.
- [CVE-2026-45363](https://github.com/advisories/GHSA-c32j-vqhx-rx3x) has been mitigated.

### Fixed {/* #2026-05-21-fixed */}

- Changing the `token.secret_key` setting now works as expected.
- The 2026-05-18 release introduced a bug in the secret resolution API which caused manual lookup of secrets to fail. This has been fixed.

## [2026-05-18]

### Known issues {/* #2026-05-18-known-issues */}

- Changing the `token.secret_key` setting will make the server return 500 errors for any user who was logged in before the setting changed. Clearing your browser cookies for the OpsChain server will fix this for the affected user.

### Fixed {/* #2026-05-18-fixed */}

- When an action fails to execute, the error indicating where the action was defined has been improved to handle MintPress SDK actions.
- Correct rebuilding of agent image when the template version changes.
- When multiple parallel steps modify properties in ways that can't be handled, the step moves to `failed` (rather than `system error`). This improves/fixes retry of these changes.
- Steps that report `Unable to construct a step result processor for step "..." due to: No such file or directory @ rb_sysopen /steps/.../step_result.json` are now marked as failed.
- Fixed `syntax error found (SyntaxError)` and `invalid multibyte character 0xE2` reported in `actions.rb` due to incorrect character encoding handling.
- Fixed issue where the build service would get stuck in a `Pending` state during an upgrade due to an issue with the `fuse-device-plugin`. See the [FUSE device plugin settings](/setup/configuration/additional-settings.md#fusedevicepluginenabled) for more information.
- Running nested steps from the actions GUI for MintModel actions now works.
- Refresh tokens (and refresh cookies) are now properly revoked when a token destroy request is made to the API.
- When a page fails to load, the error message is now shown in a consistent position rather than floating in the middle of the page.
- When a user does not have permission to view properties or settings, a clear "not authorised" message is now shown instead of an unhandled error.
- Fixed an issue where the admin settings editor did not correctly respect the user's update permissions.
- Fixed repeating a change that involved nested actions — the correct action path is now used.
- Fixed the activity volume chart on the dashboard, where the legend and chart area were displaying incorrect colours.
- Fixed elapsed time in the activities list to count from when a change was created rather than when it started running, giving a more accurate total duration.

### Added {/* #2026-05-18-added */}

- OpsChain actions and wait steps can now be defined with a custom `step_name`. When the OpsChain GUI displays the step tree for a change, the step that executes the action will be labelled with the supplied `step_name` rather than the action method name.
- You can now include input steps in your `actions.rb`. These act like regular wait steps however they require the user to provide specific input values in order to continue the step. See the [input steps documentation](key-concepts/actions.md#input-steps) for more information.
- Each change step now includes a `state_timing` object in the step response that includes timestamps for when the step entered and exited each state.
- On completion, the change response now includes a `state_timing_summary` object, providing a summary of the number of seconds spent building the image, running the step, waiting for user input, and system overhead.
- The settings version and properties versions endpoints now accept the `limit` query parameter to limit the rows returned.
- The default OpsChain Dockerfile can now be downloaded from the OpsChain server. [Learn more](/key-concepts/step-runner.md#creating-a-custom-step-runner-dockerfile).
- New `converged_settings` endpoints have been added to the API to allow retrieval of the converged settings for a change, template version, asset, environment or project. These endpoints mimic the existing `converged_properties` endpoints, returning settings rather than properties.
- The notify JSON supplied when creating a change is now stored with the change and is available in the change response under `notify`.
- When a change re-uses the result of a step that already ran successfully in a previous attempt, this is now clearly indicated in the step tree. A history icon appears on the step node, and the step detail panel shows a notice with a link to the original run where the step completed.
- Steps that require approval now show a full breakdown of all required approvers, their groups, and the current state of each approval in a popover. You can see who has approved or rejected, when they did so, and any message they left. The summary on the step node updates as approvals come in (e.g. "Requires approval (1 of 3)").
- A new **Inherited settings** tab is available on the settings page for all node types (projects, environments, assets, and agents). This shows the fully resolved settings that a node will use at runtime, accounting for values inherited from parent nodes. Each setting can be annotated with its source via a "Show/Hide sources" toggle. The same view is also available on the Change settings tab.
- Settings can now be viewed and compared directly from a template version's detail page.
- All notification toasts (success, error, and info) now include a **Copy** button to copy the message text to the clipboard. Notifications also stay visible for longer before auto-dismissing.
- When opening the "Compare versions" tab for settings or properties, the two most recent versions are now pre-selected automatically, so you can see what changed straight away without having to pick versions manually. Up to 500 versions are now loaded, and they are listed in chronological order.
- When a step in a change requires user-provided values before it can proceed, a dedicated dialog is now shown to collect those inputs. Each field is presented with its name, type, and description. Once submitted, the change continues automatically. After a step has been continued, users can view the values that were supplied at the time — the same dialog opens in a read-only mode, showing what was entered and who submitted it (including any message they left).
- The `ignore_failure` option has been added to actions with child steps. Child step failure will no longer cause the parent step to fail when this option is enabled. This can be used to allow a change to continue running even if a non-critical step fails.

### Changed {/* #2026-05-18-changed */}

- The long-running database query timeout configuration has now been split.
  - The [`OPSCHAIN_API_DATABASE_STATEMENT_TIMEOUT`](/setup/configuration/additional-settings.md#opschain_api_database_statement_timeout) setting is used for API requests.
  - The [`OPSCHAIN_WORKER_DATABASE_STATEMENT_TIMEOUT`](/setup/configuration/additional-settings.md#opschain_worker_database_statement_timeout) setting is used for SQL statements executed in the OpsChain worker.
- The `fuse-device-plugin` will now only run if the `buildService.rootless` and `fuseDevicePlugin.enabled` settings are set to `true`. Consider enabling it if you are running a Kernel version older than 5.11. Refer to the [FUSE device plugin settings](/setup/configuration/additional-settings.md#fusedevicepluginenabled) for more information.
- The change approval feature has been enhanced to support action specific approval. See the requires approval from setting in the [settings documentation](key-concepts/settings.md#requires_approval_from) for more information.
- The step and change `approved_by`, `continued_by`, `rejected_by` and `cancelled_by` attributes will now be returned in the same format `[{ "username": "peter", "message": "user supplied message", "date": "2026-05-12T04:53:05Z"}]`
- The log_lines link in each step response now reflects the actual step where the logs where generated. For a regular change, this will be a link to the current step's logs. For a retried change, if the original step succeeded during one of the previous attempts, the link will point to the original step's logs.
- Changes will now store the converged settings that were used to run the change. Settings queries during the change execution will use the persisted settings for the change rather than the current system values. This ensures changes will be unaffected by any settings changes that occur during their execution.
- The `updated_at` date for a token is now updated to the current date and time each time the token is used.
- the `action_methods` argument for the `controller` method in `actions.rb` has been removed and its functionality has been absorbed into the `available_actions` argument. See the [actions documentation](key-concepts/actions.md) for more information.
- The timing section on a change's detail page now shows a breakdown of how time was spent during the change run. At a glance you can see execution time and system time as separate figures. Clicking the timing area opens a detailed view that breaks down time spent in each phase — such as time spent running, waiting for approvals, and building images — alongside a full state-by-state timeline with start and end times.
- When a waiting step requires input arguments before it can continue, the GUI now presents a dedicated **"Provide input arguments"** dialog instead of the plain continue action.
- **Repeating a change**: When repeating a change, the original override settings and properties are now fetched accurately — including for changes that were themselves a repeat of an earlier run. A loading indicator is shown while this is happening, and a clear error message is displayed if the values cannot be retrieved.
- Links to git commits and repositories now work correctly for a wider range of Git hosting providers, including Azure DevOps (both modern and legacy URLs), AWS CodeCommit, Oracle Cloud Infrastructure, and Sourcehut, in addition to GitHub, GitLab, and Bitbucket. SSH remote URLs are now also converted into browser-friendly links automatically.
- **Change Git details**: The Git remote URL and revision are now truncated in the change detail card for readability, with the full values available on hover. A direct "Go to commit" link also appears in the hover card.
- **Top activities panel**: The dashboard activity table column order and layout have been improved.

### Removed {/* #2026-05-18-removed */}

- The bespoke singular MintPress SSH key support has been removed. This means the `mintPressSSHKey` configuration has been removed from the chart.
  - This means the `mintpress-ssh-key` secret can be removed after update (this secret is not removed automatically). The [uninstall documentation](https://docs.mintpress.io/docs/operations/uninstall/persistent-data#secrets) shows how secrets can be removed. (_Note, it references different secrets._)
  - We suggest putting SSH keys into [OpsChain file properties](/key-concepts/properties.md#file-properties) (via the [secret vault](/key-concepts/properties.md#opschain-secret-vault)) instead as it is more flexible. The example below shows how this can be added to your properties (do not remove any existing properties):

    ```json
    {
      "opschain": {
        "files": {
          "/opt/mintpress/.ssh/id_rsa": {
            "format": "base64",
            "mode": "0600",
            "content": "{{ SSH private key contents, base64 encoded - just like `mintPressSSHKey` }}"
          }
        },
        "env": {
          "SSH_KEY_PATH": "/opt/mintpress/.ssh/id_rsa"
        }
      }
    }
    ```

## [2026-04-30]

### Important breaking changes {/* #2026-04-30-important-breaking-changes */}

- [`lazy` blocks](key-concepts/actions.md#lazy-property-evaluation) no longer automatically derive a resource (or controller). This means the property definition such as `lazy_property(lazy { :resource })` needs to be called with [`ref` (or `resource`)](key-concepts/actions.md#the-ref-or-resource-method), e.g. `lazy_property(lazy { ref(:resource).controller })`.
- Strings and symbols no longer provide access to a controller with an equivalent name automatically (i.e. `'resource'.controller` is no longer supported). The resource must be reference via [`ref` (or `resource`)](key-concepts/actions.md#the-ref-or-resource-method) explicitly, e.g. `ref('resource').controller`.
- The `literal` keyword has been removed. Due to the changes to `lazy` blocks (above) it is no longer required.

### Fixed {/* #2026-04-30-fixed */}

- Handling of resource property resource resolution has now been improved to avoid infinite recursion.
- It is no longer possible to refetch a template version Git revision while a change is running for this template version because this would lead to the change failing.
- Fixed issue where the run change and run workflow dialog would hold on to previous values.
- Improved search on available actions of an asset including a total and filtered count.

### Changed {/* #2026-04-30-changed */}

- The full error message is now shown when MintModel generation fails.
- Tabs on run change and workflow dialog now show a small checkmark if the values under the respective tabs have been altered or added from a previously run change. These include property and setting overrides, as well as metadata.
- Minor adjustments to colours on the dashboard widgets.
- Minor adjustments to colours on trees (change, workflow run, workflow overview and available actions).

### Added {/* #2026-04-30-added */}

- The change step response now includes details about how long the image took to build. Note: this may be `null` if the step didn't need to build an image.
- The action server now sets a process title (`OpsChain action server`) so that it can be more easily identified when debugging. See [identifying running OpsChain processes](troubleshooting.md#identifying-running-opschain-processes) for more information.
- The `parallel_change_worker_steps` setting can now be overridden with change settings overrides, or via the parent asset, environment, or project.
- On change failure OpsChain will now output the details of the resource whose action failed. See the [troubleshooting guide](troubleshooting.md#output-resource-attributes-on-error) for more information.
- The [keyword `ref`](key-concepts/actions.md#the-ref-or-resource-method) now has an alias `resource` to make it clearer what it returns. Both names can be used interchangeably.
- When an action fails to execute, the error now shows where the action was defined.
- Change properties now show a loader when fetching change/step properties.

## [2026-04-23]

### Added {/* #2026-04-23-added */}

- When an action raises an exception during processing, OpsChain will now output the names of all resource types and resources that have been defined by the actions.rb. Where possible, the property values of each resource's properties will also be included.

### Changed {/* #2026-04-23-changed */}

- The OpsChain API now uses less memory (in particular [PSS](https://en.wikipedia.org/wiki/Proportional_set_size)).

### Fixed {/* #2026-04-23-fixed */}

- Only MintModel actions that are specified with `available_actions` are displayed in the GUI. _This only affects MintModel actions._
- When a MintPress change API returns a `unprocessable_content` response, it no longer creates change that will be stuck in `initializing`.
