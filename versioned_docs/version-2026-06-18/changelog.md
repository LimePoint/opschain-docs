---
sidebar_position: 1
description: Learn about new releases of OpsChain, including new features and updates.
---

# Changelog

:::warning
OpsChain should be upgraded sequentially, one version at a time. Skipping versions may result in data loss and unexpected behaviour.

Follow the [upgrade guide](operations/upgrading.md) for more information on how to upgrade OpsChain.
:::

## [2026-06-18]

### Added {/* #2026-06-18-added */}

- Container image builds now automatically retry up to 3 times when a transient BuildKit error is detected (e.g. a gRPC connection drop). The retry count is configurable via the [`build_service.max_image_build_retries`](/key-concepts/settings.md#build_servicemax_image_build_retries) setting.
- A new `OpsChain.step` helper creates a composable wrapper step that combines wait, input, and ignore failure behaviours in a single call. See the [step wrapper](/key-concepts/actions.md#step-wrapper) documentation for more information.
- A new `OpsChain.ignore_failure_step` helper is available for wrapping actions as child steps. It creates a thin wrapper action with `ignore_failure: true` so the change continues even if the step fails. See the [ignore failure steps](/key-concepts/actions.md#ignore-failure-steps) documentation for more information. This is particularly useful for MintModel steps which can't be marked as `ignore_failure` in the `actions.rb` natively.
- A new `OpsChain.query` helper allows action code to query the OpsChain API server directly, retrieving live node, MintModel, properties, or settings data during a change. The request authenticates with the short-lived API key injected into the step context, which is only generated when the [`token.change_api_key_expiry_days`](/key-concepts/settings.md#tokenchange_api_key_expiry_days) (or [`token.agent_api_key_expiry_days`](/key-concepts/settings.md#tokenagent_api_key_expiry_days)) setting is enabled. See the [querying the API](/key-concepts/actions.md#querying-the-api) documentation for more information.
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

- The OpsChain API will no longer start if the `token.secret_key` setting (which is originally set from the `OPSCHAIN_TOKEN_SECRET_KEY` value in your values.yaml) is not set or is empty. This setting was introduce in [2026-04-21](/docs/2026-04-21/changelog) and must be set as part of the security configuration. OpsChain will no longer startup with it unset to prevent accidental misconfiguration.
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
- The action server now sets a process title (`OpsChain action server`) so that it can be more easily identified when debugging.
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
