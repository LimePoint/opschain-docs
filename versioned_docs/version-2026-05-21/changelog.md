---
sidebar_position: 1
description: Learn about new releases of OpsChain, including new features and updates.
---

# Changelog

:::warning
OpsChain should be upgraded sequentially, one version at a time, unless there are no breaking changes between them. Skipping versions may result in data loss and unexpected behaviour.

Follow the [upgrade guide](operations/upgrading.md) for more information on how to upgrade OpsChain.
:::

## [2026-05-21]

### Added {#2026-05-21-added}

- The `requires_approval_from` usernames and ldap groups can now be sourced from the relevant node's properties. See the [settings documentation](key-concepts/settings.md#requires_approval_from) for more information.

### Important breaking changes {#2026-05-21-important-breaking-changes}

- The OpsChain API will no longer start if the `token.secret_key` setting (which is originally set from the `OPSCHAIN_TOKEN_SECRET_KEY` value in your values.yaml) is not set or is empty. This setting was introduce in [2026-04-21](#2026-04-21) and must be set as part of the security configuration. OpsChain will no longer startup with it unset to prevent accidental misconfiguration.
  - This relates to CVE-2026-45363.
  - _Note that changing the value of `token.secret_key` was broken previously, see the [release notes below](#2026-05-18-known-issues) for more details._

### Changed {#2026-05-21-changed}

- Upgraded all images to AlmaLinux 9.7.
- [CVE-2026-45363](https://github.com/advisories/GHSA-c32j-vqhx-rx3x) has been mitigated.

### Fixed {#2026-05-21-fixed}

- Changing the `token.secret_key` setting now works as expected.
- The 2026-05-18 release introduced a bug in the secret resolution API which caused manual lookup of secrets to fail. This has been fixed.

## [2026-05-18]

### Known issues {#2026-05-18-known-issues}

- Changing the `token.secret_key` setting will make the server return 500 errors for any user who was logged in before the setting changed. Clearing your browser cookies for the OpsChain server will fix this for the affected user.

### Fixed {#2026-05-18-fixed}

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

### Added {#2026-05-18-added}

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

### Changed {#2026-05-18-changed}

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

### Removed {#2026-05-18-removed}

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

### Important breaking changes {#2026-04-30-important-breaking-changes}

- [`lazy` blocks](key-concepts/actions.md#lazy-property-evaluation) no longer automatically derive a resource (or controller). This means the property definition such as `lazy_property(lazy { :resource })` needs to be called with [`ref` (or `resource`)](key-concepts/actions.md#the-ref-or-resource-method), e.g. `lazy_property(lazy { ref(:resource).controller })`.
- Strings and symbols no longer provide access to a controller with an equivalent name automatically (i.e. `'resource'.controller` is no longer supported). The resource must be reference via [`ref` (or `resource`)](key-concepts/actions.md#the-ref-or-resource-method) explicitly, e.g. `ref('resource').controller`.
- The `literal` keyword has been removed. Due to the changes to `lazy` blocks (above) it is no longer required.

### Fixed {#2026-04-30-fixed}

- Handling of resource property resource resolution has now been improved to avoid infinite recursion.
- It is no longer possible to refetch a template version Git revision while a change is running for this template version because this would lead to the change failing.
- Fixed issue where the run change and run workflow dialog would hold on to previous values.
- Improved search on available actions of an asset including a total and filtered count.

### Changed {#2026-04-30-changed}

- The full error message is now shown when MintModel generation fails.
- Tabs on run change and workflow dialog now show a small checkmark if the values under the respective tabs have been altered or added from a previously run change. These include property and setting overrides, as well as metadata.
- Minor adjustments to colours on the dashboard widgets.
- Minor adjustments to colours on trees (change, workflow run, workflow overview and available actions).

### Added {#2026-04-30-added}

- The change step response now includes details about how long the image took to build. Note: this may be `null` if the step didn't need to build an image.
- The action server now sets a process title (`OpsChain action server`) so that it can be more easily identified when debugging.
- The `parallel_change_worker_steps` setting can now be overridden with change settings overrides, or via the parent asset, environment, or project.
- On change failure OpsChain will now output the details of the resource whose action failed. See the [troubleshooting guide](troubleshooting.md#output-resource-attributes-on-error) for more information.
- The [keyword `ref`](key-concepts/actions.md#the-ref-or-resource-method) now has an alias `resource` to make it clearer what it returns. Both names can be used interchangeably.
- When an action fails to execute, the error now shows where the action was defined.
- Change properties now show a loader when fetching change/step properties.

## [2026-04-23]

### Added {#2026-04-23-added}

- When an action raises an exception during processing, OpsChain will now output the names of all resource types and resources that have been defined by the actions.rb. Where possible, the property values of each resource's properties will also be included.

### Changed {#2026-04-23-changed}

- The OpsChain API now uses less memory (in particular [PSS](https://en.wikipedia.org/wiki/Proportional_set_size)).

### Fixed {#2026-04-23-fixed}

- Only MintModel actions that are specified with `available_actions` are displayed in the GUI. _This only affects MintModel actions._
- When a MintPress change API returns a `unprocessable_content` response, it no longer creates change that will be stuck in `initializing`.

## [2026-04-21]

### Important breaking changes {#2026-04-21-important-breaking-changes}

- The `mintpress.executor_image.name` and `mintpress.executor_image.pull_policy` properties have been replaced by settings. To override the MintModel executor image, configure the [MintModel executor](key-concepts/settings.md#mintmodel_executorimage_tag) settings. Due to the schema used in OpsChain properties, these properties need to be removed before changes can be run, etc.
- The OpsChain API can now be accessed using bearer tokens. See the [Tokens](https://docs.opschain.io/api-docs/#tag/Tokens) endpoints in the Security section of the OpsChain API docs for more information. To support the new token generation logic, you will need to add the `OPSCHAIN_TOKEN_SECRET_KEY` to your `values.yaml` before deployment. The Ruby `SecureRandom.hex(64)` method can be used to generate a 512bit (128 character) secure string to use as the token secret key.
- An email address is now required when creating users with the OpsChain user utilities.

### Added {#2026-04-21-added}

- The `agent.image_override`, `mintmodel_executor.image_override`, `runner.image_override` and `worker.image_override` settings have been added.
- A new [debug toolbox](/operations/maintenance/debug-toolbox.md) has been added to help debugging and troubleshooting OpsChain deployments and networking issues.
- OpsChain now provides better error messages for typos in resources, for example suggesting a property name that may have been intended instead.
- The OpsChain DSL now provides the [`OpsChain.run_action` keyword](/key-concepts/actions.md#running-other-actions-within-another-action) for running another action programmatically.
- A new OpsChain dashboard has been added to the GUI to provide a high-level overview of the system's status and health, as well as quick access to important resources and information.
- A new `OPSCHAIN_DATABASE_STATEMENT_TIMEOUT` settings has been added to allow configuring a timeout for database statements to prevent long-running queries from impacting the performance of the system. The default value is `50s`.
- The [`update_local_user_email_address`](/setup/setup-instance.md#updating-a-locally-authenticated-user-email-address) utility has been added.

### Changed {#2026-04-21-changed}

- The blocking queue and waiting queue information is now reported separately in the API and GUI for better visibility of the reason why a change or workflow run is waiting to start.
- The performance of OpsChain action execution has been improved when a large number of resources are defined.
- Template versions that contain no actions _with descriptions_ are now considered valid. Template versions with no actions defined at all are still considered invalid.
- If an `actions.rb` has a `default` action without a description, a default description is added to ensure it shows up in the GUI.
- The OpsChain API and workers now terminate long-running database queries based on the `OPSCHAIN_DATABASE_STATEMENT_TIMEOUT` setting.
- The [`create_user`](/setup/setup-instance.md#creating-an-ldap-authenticated-user) and [`create_local_user`](/setup/setup-instance.md#creating-a-locally-authenticated-user) commands now require an email address.

### Fixed {#2026-04-21-fixed}

- Action description are displayed correctly for actions defined within a controller.
- MintModel assets now generate their actions correctly.
- The performance of the internal change activities endpoint has been improved for non-superuser users.
- Running scheduled changes has been fixed.
- The `/opt/opschain/.ssh` and `/opt/mintpress/.ssh` folders are now created with non-root ownership.
- The action server is no longer started if `worker.reuse_actions_rb` is `false`. Previously it was started but not used.
- The action server now handles errors during the server startup more correctly. This means changes won't get stuck when there are file permission issues in file properties.
- The API licence validation was intermittently failing and reporting the licence was expired/missing. This has been resolved and the API will now correctly report the licence status.
- Modifying the DockerHub username and password via the advanced configuration settings now updates the Kubernetes image pull secret with the new credentials.
- Accessing post change converged properties for an aborted change will no longer report an error and instead return the properties before the change as aborted.
- The performance of LDAP queries has been improved, in turn improving the performance of the various security screens in the GUI.

### Known issues {#2026-04-21-known-issues}

- When a typo is present in `actions.rb`, the error message may report `ArgumentError: wrong number of arguments (given 4, expected 0..3) (ArgumentError)`. If this happens, the actual cause will be shown further down.

## [2026-03-27]

### Important breaking changes {#2026-03-27-important-breaking-changes}

- OpsChain's secret vault storage backend has changed to be database-based rather than file-based, allowing the secret vault to operate in high availability setups. Follow the [secret vault update guide](/versioned_docs/version-2026-03-27/setup/vault_upgrade.md) to upgrade to this version. Failure to do so might result in data loss.
- When running a change with `pod_per_change_step` set to `false`, OpsChain will now only parse the `actions.rb` once. This means the top level of this file can't contain any variables that are expected to change throughout the run.
  - To return to the former functionality, set [`worker.reuse_actions_rb`](/key-concepts/settings.md#workerreuse_actions_rb) to `false`.
- A new `OPSCHAIN_ENCRYPTION_SEED_KEY` setting has been added to the `values.yaml` file to supersede the `mintpressTransportableKey` setting. This key is used to seed the encryption of sensitive data within OpsChain. If you're upgrading from a previous version, set this to the same value as the `mintpressTransportableKey` setting in your `values.yaml` file or the contents of the `~/.limepoint/localKey` file - if present in your system. The `mintpressTransportableKey` setting will be ignored in a future release. Refer to the [encryption keys](/setup/configuration/encryption-and-secrets.md#encryption-keys) guide for more information.
- The `original_change` and `original_workflow_run` metadata attributes in changes and workflow runs have been nested under an `opschain` parent in the metadata object to avoid potential conflicts with user-defined metadata attributes. In addition, they have been renamed to `original_change_id` and `original_workflow_run_id` respectively to better reflect their content.

### Added {#2026-03-27-added}

- The `literal` keyword has been added to OpsChain actions.
- Code which calls `.controller` or `.properties` on a string or symbol will now resolve the controller or properties (respectively) for an equivalently named resource (if defined). [Learn more.](/key-concepts/actions.md#using-resources-in-actions)
- You can now provide alternative DNS names for the CNPG-generated TLS certificates for your database clusters. Read more in the [high availability setup guide](/advanced/ha/index.md#certificates).
- OpsChain [bulk property assignment](key-concepts/actions.md#setting-multiple-properties) can now use the [`lazy` keyword](key-concepts/actions.md#lazy-property-evaluation), e.g. `properties(lazy { { something: 'slow' } })`.
- If an OpsChain change or workflow run encounters a system failure, a new status "system error" will be applied to the activity.

### Changed {#2026-03-27-changed}

- When not using `pod_per_change_step`, the `actions.rb` file will only be loaded once (by default) to improve change performance.
  - To get the old experience (where `actions.rb` is loaded once per step) set [`worker.reuse_actions_rb`](/key-concepts/settings.md#workerreuse_actions_rb) to `false`.
- Asset index responses no longer include the asset's actions. This information can be retrieved from the asset show endpoint.

### Fixed {#2026-03-27-fixed}

- If the child step definitions returned from an action are invalid, the error will now be properly reported in the parent step's logs rather than causing the entire change to fail without explanation.

## [2026-03-19]

### Important breaking changes {#2026-03-19-important-breaking-changes}

- OpsChain agents must be stopped before upgrading. Following the upgrade, each agent image must be rebuilt, and then the agent can be started.

### Added {#2026-03-19-added}

- A new policy assignment show endpoint has been created to allow the API to return a single policy assignment for a given authorisation policy.
- Encrypted settings are now able to be decrypted in the GUI when the user has the appropriate permissions.

### Fixed {#2026-03-19-fixed}

- Attempting to save multiple default channels of the same type now results in a humanised error message.
- The OpsChain audit history screen now recognises the superuser role and display all events. Where a user is not the superuser, the security mappings have been corrected to ensure the user can view all events they have access to.
- MintModel changes will no longer remain stuck in `pending` and instead will run as expected.
- The OpsChain DSL duplicate action definition error is now aware of resources and provides better errors.

## [2026-03-16]

### Important breaking changes {#2026-03-16-important-breaking-changes}

- OpsChain agents must be stopped before upgrading. Following the upgrade, each agent image must be rebuilt, and then the agent can be started.

### Added {#2026-03-16-added}

- Changes and workflow runs can now be created via the event subscriber system. These activities will be tagged with the source event that triggered them, allowing you to click through to the source event in the GUI and view the event details.

### Fixed {#2026-03-16-fixed}

- OpsChain no longer reports an error for actions with the same name defined in different resources or namespaces.
- Resolved issue with step context validation for null requires_approval_from values.
- API documentation for the workflow create endpoint has been updated to include references to the `create_new_version` meta attribute.
- It is no longer possible to provide an empty array as the value for the `user_names` array in the `requires_approval_from` setting.

### Changed {#2026-03-16-changed}

- The workflow and change wait step notifications have been enhanced to provide additional information to the notified user.
- Stack traces in the event data are now displayed in a more readable format by the audit history screens.
