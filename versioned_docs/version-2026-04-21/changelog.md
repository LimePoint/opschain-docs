---
sidebar_position: 1
description: Learn about new releases of OpsChain, including new features and updates.
---

# Changelog

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
- The OpsChain API and workers now terminate long-running database queries based on the [`OPSCHAIN_DATABASE_STATEMENT_TIMEOUT`](/setup/configuration/additional-settings.md#opschain_database_statement_timeout) setting.
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

- The `literal` keyword has been added to OpsChain actions. [Learn more.](/key-concepts/actions.md#literal-property-evaluation)
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
