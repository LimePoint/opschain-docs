---
sidebar_position: 100
description: Learn about new releases of OpsChain, including new features and updates.
---

# Changelog

## [2025-04-25]

### Added {#2025-04-25-added}

- Local user authentication can be activated via the `OPSCHAIN_AUTH_STRATEGY` environment variable. See the [authentication configuration documentation](/operations/configuring-opschain.md#authentication-configuration) for reference.
- It's now possible to create and login as local user. See the [creating an OpsChain user documentation](/operations/installation.md#locally-authenticated-users) for reference.
- Users can now be assigned authorisation policy update and create permissions for a specific project, environment or asset.
- The Step API now allows you to update a failed change step, flagging it to be skipped when the change is retried.

### Changed {#2025-03-125-changed}

- The manage security screens have been redesigned to improve usability and simplify the process of creating and assigning authorisation policies.

## [2025-03-28]

### Added {#2025-03-28-added}

- *Breaking change* Authorisation is now applied via authorisation policies. See the [security documentation](/reference/concepts/security.md) for reference.
- Creating, updating or removing authorisation rules and policies will now create system events. See the [events documentation](/reference/concepts/events.md) for reference.
- The change creation API now accepts a `property_overrides` attribute, allowing you to supply additional JSON properties to override your repository and database properties.
- The change creation API now accepts a `template_version` attribute, allowing you to supply a different template_version to the one assigned to the asset.
- The `/info` endpoint now includes the database version and API version information
- Endpoints for deleting workflows and workflow versions are now available. Sending a DELETE request to the workflow versions index endpoint will delete all draft versions of the workflow. See the [API documentation](https://docs.opschain.io/api-docs/) for more details.

### Fixed {#2025-03-28-added}

- Templated changes whose MintModel fails to generate will now end with an error.
- The APIs for updating a workflow and workflow versions now allow you to archive a workflow or specific workflow versions.
- Retried changes will now reuse the same version of properties as the original change.

## [2025-03-10]

### Changed {#2025-03-10-changed}

- The `api:<model>:finish` event for changes, steps, workflow runs and workflow steps has been replaced with `success`, `error`, `cancel` and `abort` events., See the [events documentation](/reference/concepts/events.md) for reference.
- The GUI change step log viewer now includes the logs of all child steps. Their inclusion can be toggled via the `Include child logs` toggle.

### Fixed {#2025-03-10-fixed}

- Fixed an issue where changes to some workflow attributes did not result in a new version being created
- Viewing inherited properties via the GUI or API now refreshes the OpsChain cache to ensure the latest properties are displayed.
- Generating a MintModel for an asset via the GUI or API now refreshes the OpsChain cache to ensure the latest properties are displayed.
- The `git fetch` command output is now included in the failure event to assist with debugging.

## [2025-03-05]

### Added {#2025-03-05-added}

- Workflows support has been added to the CLI. It's now possible to list, show, archive and execute workflows.
- The GUI now includes a comprehensive workflow editor, available via the workflows side menu.

### Changed {#2025-03-05-changed}

- *Breaking change* - The `/api/automation_rules` endpoint has been replaced with `/api/scheduled_activities`.
- *Breaking change* - Workflows are no longer held in the remote Git repository.
- Automated change rules are now known as Scheduled changes.
- Automated workflow rules are now known as Scheduled workflows.
- The Automation side menu entry has been replaced with Scheduled activity.
- The notification settings have been updated. See the [notifications documentation](/operations/notifications.md) for reference.
- The authorisation rules logic has changed. See the [security documentation](/reference/concepts/security.md) for reference.

## [2025-02-13]

### Added {#2025-02-13-added}

- You can now list, show, archive and create new template versions from the CLI.
- It's now possible to update projects, environments and assets with the `update` command.
- A new workflow editor with save and publish functionality.
- The GUI Include archived check box has been replaced with column filters on the archived column.
- Documentation on configuring user permissions after OpsChain installation.

### Changed {#2025-02-13-changed}

- You can now provide multiple approvers on the `requires_approval_from` settings. See the [settings](/reference/concepts/settings.md#requires_approval_from) for reference.

## [2025-01-31]

### Added {#2025-01-31-added}

- The CLI now supports listing and showing assets as well as editing an asset's properties and settings.
- The GUI now provides an option for clearing all filters on any list page.
- The table filters are now included in the URL to allow bookmarking and sharing with others.

### Changed {#2025-01-31-changed}

- *Breaking change* - Storing properties in the Git repository now uses a different folder structure. See the [Git repository storage options](/reference/concepts/properties.md#git-repository) for reference.
- Keyboard shortcuts have been added to allow the table header filters to be accepted (ENTER) or cancelled (ESC)

### Fixed {#2025-01-31-fixed}

- Resolved various issues that restricted users' ability to interact with the table header column filters.

## [2025-01-23]

### Added {#2025-01-23-added}

- The GUI now includes:
  - filtering for all list pages
- The CLI now supports running changes in `Enterprise` projects.

### Changed {#2025-01-23-changed}

- When a Git remote creation or update fails, an event is now logged with the failure details.
- Project, environment and asset codes are now automatically converted to lowercase on creation.

## [2025-01-15]

### Added {#2025-01-15-added}

- The step response now includes:
  - an optional `name` value
  - an optional `data` JSON object
- OpsChain now includes a secret vault that can be used to store secrets. Secrets can be used within your `actions.rb` and referenced in your OpsChain properties. See the [actions reference](/reference/concepts/actions.md#opschain-secret-vault) and [properties reference](/reference/concepts/properties.md#opschain-secret-vault) for more information.
- The GUI now includes:
  - an activity page to display the most recent change and workflow activities
  - a manage activity page where you can approve and continue changes and workflow runs
  - a manage security page where you can view existing security rules

### Changed {#2025-01-15-changed}

- Upgraded OpsChain DB image to PostgreSQL 17.1.
- Upgraded Rails to 7.1

### Removed {#2025-01-15-removed}

- OpsChain no longer uses the OPA authorisation provider. Authorisation rules are now defined within OpsChain itself, using the authorisation rule API endpoints

## [2024-06-17]

### Added {#2024-06-17-added}

- The properties and settings versions responses now include:
  - the `created_at` timestamp.
  - a link to the properties `owner`.
- The step response now include a link to the `change` that the step belongs to.
- Enterprise projects now support workflows, allowing you to sequence multiple changes into a single workflow. Workflows also support wait and approval steps to control the flow of change execution.
- The GUI now allows you to compare different versions of properties and settings.

### Changed {#2024-06-17-changed}

- The `properties_versions` link in the properties version response has been renamed to `versions`.
- The `settings_versions` link in the settings versions response has been renamed to `versions`.
- `error:controller:unhandled` type events are now assigned the `error:api:controller:unhandled` type to differentiate them from resource controller exceptions.
- `RecordNotFound`, `UnpermittedParameters` and `UnsupportedIncludeError` exceptions are no longer logged as events by the API.
- If a fetch of a project's remote Git repository fails an event will be logged. Subsequent fetches within that hour will not log additional events to avoid flooding the event tables. _Note: This event throttling also applies to the automated fetch that is performed every minute on `workflows` Git remotes._
- OpsChain events can now be linked to more sources. See the [events documentation](/reference/concepts/events.md#linking-events) for the full list.
- More OpsChain system events have been added. See the [events documentation](/reference/concepts/events.md#system-event-types) for the full list.
- The GUI JSON editor for properties and settings now expands to the full height available in the tab.

## [2024-05-24]

### Added {#2024-05-24-added}

- The step `approve` API now accepts an optional message - see the [API documentation](https://docs.opschain.io/api-docs/#tag/Steps/paths/~1api~1steps~1{step_id}~1approve/post) for more details.
- The step `continue` API now accepts an optional message - see the [API documentation](https://docs.opschain.io/api-docs/#tag/Steps/paths/~1api~1steps~1{step_id}~1continue/post) for more details.
- A step `reject` API is now available to allow changes that are waiting for approval to be rejected - see the [API documentation](https://docs.opschain.io/api-docs.html#tag/Steps/paths/~1api~1steps~1%7Bstep_id%7D~1reject/post) for more details.
- The step API now includes the change ID - see the [API documentation](https://docs.opschain.io/api-docs/#tag/Steps/paths/~1api~1steps~1%7Bstep_id%7D/get) for more details.
- The CLI now supports rejecting changes that are waiting for approval via the `opschain change reject` subcommand.
- All GUI screens that display multiple records (e.g. projects, changes, assets, etc.) now include a `CSV export` button that allows you to export the records to a CSV file.
- The GUI now includes an audit history menu option to provide a basic view of the OpsChain events. This view will be enhanced in future releases to provide mode detailed information and links to relevant event resources.
- For each project, environment and asset the GUI now includes:
  - a _commands_ button that displays a dialog with useful `curl` commands to access information about the resource via the API.
  - a _bookmarks_ button that displays a dialog containing the bookmarks (URLs) that have been associated with that resource via the API.
- For standard projects, the GUI now provides the ability to:
  - view automated changes
  - execute changes
- For enterprise projects, in addition to the standard project features, the GUI now provides the ability to:
  - create and update templates and template versions for assets.
  - create changes to execute template actions for assets.
  - generate, view and compare the MintModels associated with enterprise project assets.
  - create workflows to run multiple changes in sequence.
  - execute and view workflows.

### Changed {#2024-05-24-changed}

- OpsChain will no longer automatically delete the Git repository folder when the remote has been archived. [Learn more.](/reference/concepts/git-remotes.md#manually-deleting-the-git-repository-folder)
- The step API response `approved_by` format has changed to support the new `message` field - see the [API documentation](https://docs.opschain.io/api-docs/#tag/Steps/paths/~1api~1steps~1{step_id}~1approve/post) for an example.
- The step API response `continued_by` format has changed to support the new `message` field - see the [API documentation](https://docs.opschain.io/api-docs/#tag/Steps/paths/~1api~1steps~1{step_id}~1continue/post) for an example.
- Upgraded the runner images to be based on AlmaLinux 8.9.
- Upgraded Buildkit to 0.13.1.
- Upgraded cert-manager to v1.14.4.
- Upgraded Kong Helm chart to 2.25.0.
- Upgraded the CLI to Node.js version to 20.
- Upgraded OpsChain auth image to OPA 0.63.0.
- Upgraded OpsChain DB image to PostgreSQL 14.11.
- Upgraded OpsChain ingress image to Kong 3.6.1.
- Upgraded OpsChain kubectl image to kubectl v1.29.2.
- Upgraded OpsChain log aggregator image to Fluentd v1.16.5-1.0.
- Upgraded OpsChain Ansible example to Terraform 'hashicorp/aws' provider 5.44.0.
- Upgraded OpsChain Ansible, Confluent, Terraform and Weblogic examples to Terraform 1.7.5.
- Upgraded OpsChain Confluent example to Confluent 6.2.14.
- Upgraded OpsChain Confluent, Terraform and Weblogic examples to Terraform 'hashicorp/kubernetes' provider 2.27.0.
- Upgraded OpsChain Vault example to Vault 1.16.1.

## [2023-10-24]

### Added {#2023-10-24-added}

- You can now create, view, and archive Git remotes via the OpsChain GUI.
- You can now archive projects, environments, and assets via the OpsChain GUI.
- The following log lines API endpoints now support a `download` parameter, allowing you to download the log messages as a text file:
  - change logs: `/changes/<change_id>/log_lines` - see the [API documentation](https://docs.opschain.io/api-docs/#tag/Log-lines/paths/~1api~1changes~1%7Bchange_id%7D~1log_lines/get) for more details.
  - step logs: `/steps/<step_id>/log_lines` - see the [API documentation](https://docs.opschain.io/api-docs/#tag/Log-lines/paths/~1api~1steps~1%7Bstep_id%7D~1log_lines/get) for more details.
  - filtered logs: `/log_lines` - see the [API documentation](https://docs.opschain.io/api-docs/#tag/Log-lines/paths/~1api~1log_lines?filter%5Bmessage_eq%5D=/get) for more details.
- The following API endpoints now support a `download` parameter, allowing you to download the API results as a CSV file:
  - list changes: `/changes` - see the [API documentation](https://docs.opschain.io/api-docs/#tag/Changes/paths/~1api~1changes/get) for more details.
  - list projects: `/projects` - see the [API documentation](https://docs.opschain.io/api-docs/#tag/Projects/paths/~1api~1projects/get) for more details.
  - list project environments: `/projects/<project_code>/environments` - see the [API documentation](https://docs.opschain.io/api-docs/#tag/Environments/paths/~1api~1projects~1%7Bproject_code%7D~1environments/get) for more details.

### Changed {#2023-10-24-changed}

- Upgraded OpsChain Ansible example to Terraform 'hashicorp/aws' provider 5.22.0.
- Upgraded OpsChain Ansible, Confluent, Terraform and Weblogic examples to Terraform 1.6.2.
- Upgraded OpsChain Confluent example to Confluent 6.2.12.
- Upgraded OpsChain Vault example to Vault 1.15.0.
- Upgraded OpsChain auth image to OPA 0.57.1.
- Upgraded OpsChain kubectl image to kubectl v1.28.2.
- Upgraded OpsChain log aggregator image to Fluentd v1.16.2-1.1.
- Upgraded cert-manager to v1.13.1.

### Removed {#2023-10-24-removed}

- *Breaking change* - Git remotes are no longer allowed to point to paths on the OpsChain API server instance's local filesystem.
- *Breaking change* - The `opschain utils create_sample_data` command has been removed.

## [2023-09-12]

### Added {#2023-09-12-added}

- The OpsChain GUI now supports:
  - viewing projects, environments, and assets.
  - creating projects, environments, and assets.
  - editing the properties for projects, environments, and assets.
  - editing the settings for projects, environments, and assets.
  - creating changes
- You can now list, create, show and cancel changes for a specific environment via the `/projects/<project_code>/environments/<environment_code>/changes` endpoint. See the [API documentation](https://docs.opschain.io/api-docs/#tag/Environments) for more details.

### Changed {#2023-09-12-changed}

- Upgraded SSHKey Gem to 3.0.0.
- Upgraded Buildkit to 0.12.2.
- Upgraded Kong Helm chart to 2.25.0.
- Upgraded Kong ingress controller to 2.10.4.
- Upgraded OpsChain Ansible example to Terraform 'hashicorp/aws' provider 5.16.1.
- Upgraded OpsChain Ansible, Confluent, Terraform and Weblogic examples to Terraform 1.5.7.
- Upgraded OpsChain Confluent, Terraform and Weblogic examples to Terraform 'hashicorp/kubernetes' provider 2.23.0.
- Upgraded OpsChain DB image to PostgreSQL 14.9.
- Upgraded OpsChain Vault example to Vault 1.14.2.
- Upgraded OpsChain auth image to OPA 0.56.0.
- Upgraded OpsChain kubectl image to kubectl v1.28.1.
- Upgraded cert-manager to v1.12.4.
- Upgraded OpsChain ingress image to Kong 3.3.1.
- Upgraded OpsChain log aggregator image to Fluentd v1.16.2-1.0.

## [2023-08-02]

### Important breaking changes {#2023-08-02-important-breaking-changes}

- Modifiable database properties are no longer accessible via `OpsChain.environment.properties` and `OpsChain.project.properties`. Use the `OpsChain.properties_for(:environment)` and `OpsChain.properties_for(:project)` methods instead. See the [properties reference](/reference/concepts/properties.md#modifiable-properties) for more information.
- Repository properties are no longer accessible via `OpsChain.repository.properties`. Use the `OpsChain.repository_properties` method instead. See the [properties reference](/reference/concepts/properties.md#git-repository) for more information.
- `OpsChain.context` no longer contains `project` and `environment` directly. These can now be accessed via `OpsChain.context.parents`, e.g.`OpsChain.context.parents.project`.
- The format to prevent access to projects and environments in the OpsChain OPA security provider (in `security_configuration.json`) has changed.
- The changes get API no longer supports the `environment_{{attribute}}` filter, instead `parent_{{attribute}}` can be used. See the [query examples](/reference/api-filtering.md#query-examples) to see the updated environment filter example.

### Added {#2023-08-02-added}

- Multi-project Git repositories can now include project specific [repository properties](/reference/concepts/properties.md#git-repository).
- The project and environment specific repository properties can now be accessed via `OpsChain.repository_properties_for(:environment)` and `OpsChain.repository_properties_for(:project)`. See the [properties reference](/reference/concepts/properties.md#parent-specific-repository-properties) for more information.
- `OpsChain.properties_for` has been added for use in `actions.rb`, see the [properties reference](/reference/concepts/properties.md#modifiable-properties) for more information.
- Step specific logs are now available from the `/steps/<step_id>/log_lines` API. The results can be filtered using the same filtering syntax as change log lines or events.
- Events are now created when an automated change rule fails. Learn more in the [automated changes documentation](/reference/concepts/scheduled-changes.md#scheduled-changes-events).

### Changed {#2023-08-02-changed}

- Upgraded OpsChain DB image to PostgreSQL 14.8.
- Upgraded OpsChain ingress image to Kong 3.3.0.
- Upgraded OpsChain log aggregator image to Fluentd v1.16.1-1.0.
- Upgraded OpsChain runner images to Fluent Bit 2.0.14.
- Upgraded BuildKit to 0.12.0.
- Upgraded Kong Helm chart to 2.24.0.
- Upgraded Kong ingress controller to 2.10.3.
- Upgraded OpsChain Ansible example to Terraform 'hashicorp/aws' provider 5.8.0.
- Upgraded OpsChain Ansible, Confluent, Terraform and Weblogic examples to Terraform 1.5.3.
- Upgraded OpsChain Confluent example to Confluent 6.2.11.
- Upgraded OpsChain Confluent, Terraform and Weblogic examples to Terraform 'hashicorp/kubernetes' provider 2.22.0.
- Upgraded OpsChain Vault example to Vault 1.14.0.
- Upgraded OpsChain auth image to OPA 0.54.0.
- Upgraded OpsChain kubectl image to kubectl v1.27.3.
- Upgraded cert-manager to v1.12.2.
- **Breaking change** - The `project_properties_versions` and `environment_properties_versions` relationships are no longer returned in the `/step` or `/change` API response bodies. They have been replaced by the `properties_versions` collection which includes all the properties versions that were active when the relevant step started. See the [API reference documentation](https://docs.opschain.io/api-docs/#tag/Steps) to see an example of the new response format.
- When a change or step fails, any un-executed steps in the same change will be set to the `aborted` state instead of remaining in the `pending` state.
- The `api:environments:*` events have been renamed to `api:nodes:*`.
- **Breaking change** - The [OpsChain getting started repo](https://github.com/LimePoint/opschain-getting-started) has been updated to reflect the changes to `OpsChain.context`.

### Removed {#2023-08-02-removed}

- `OpsChain.project` and `OpsChain.environment` are no longer available in an `actions.rb`. Use the new `OpsChain.properties_for` method instead.
- `OpsChain.context.project` and `OpsChain.context.environment` are no longer available in an `actions.rb`. They are now accessed via `OpsChain.context.parents` instead, e.g. `OpsChain.context.parents.project`.

### Fixed {#2023-08-02-fixed}

- Fixed a bug where one change failing may result in multiple notifications being sent.
- Fixed a bug where commit-based automated change rules could keep creating new changes, even when no new commits were created.

## [2023-06-07]

### Important breaking changes {#2023-06-07-important-breaking-changes}

- The properties API no longer returns the version in the JSONAPI `meta` (e.g. `{ meta: { version: 1 } }`) . It is now available in the `data` (e.g. `{ data: { attributes: { version: 1, data: ... } } }`).
- OpsChain project and environment properties can no longer include configuration under `{ opschain: { config: ... } }`.
  - The list of Kubernetes secrets to include in the environment during build and runtime are now configured in `{ opschain: { 'env:build_secrets': [<secret names>], 'env:runner_secrets': [<secret names>], ... } }`. See [secrets](/reference/concepts/properties.md#secrets) for more information.
  - The project / environment settings that were previously configured under `{ opschain: { config: ... } }` are now configured in the [project and environment settings](/reference/concepts/settings.md).

### Added {#2023-06-07-added}

- OpsChain settings are now available via the `/api/settings/<settings_id>` endpoint. Current and prior versions of the settings are available via the `/api/settings/<settings_id>/versions` endpoint. The link to a project or environment's settings is available via the `settings` `relationship` in the JSON:API response for the relevant project or environment.
- The CLI now provides `show-settings`, `set-settings` and `edit-settings` subcommands for projects and environments.
- OpsChain changes now support human approvals. Learn more in the [getting started guide.](/getting-started/README.md#human-approvals-for-changes)
  - The step API response now includes the `requires_approval_from` and `approved_by` information for the step.
  - The change API response now includes the `requires_approval_from` and `approved_by` information for the change's root step.

### Changed {#2023-06-07-changed}

- **Breaking change** - The `approvers` value in the step API response has been renamed to `continued_by`.

### Fixed {#2023-06-07-fixed}

- Fixed a bug where changes could not be created with a Git SHA - they could still be created with a tag or a branch.
- Fixed a bug where listing actions in the OpsChain development environment would fail if any of its resource's controller's constructors require OpsChain properties environment variables.

## [2023-05-12]

### Added {#2023-05-12-added}

- The CLI can now be configured to invoke a command to determine the API password rather than storing it in the configuration directly. [Learn more.](/reference/cli.md#opschain-cli-configuration-settings)

## [2023-05-05] {#2023-05-05}

### Added {#2023-05-05-added}

- OpsChain can now be configured to send a notification when a change has failed using [Apprise](https://github.com/caronc/apprise). [Learn more](/operations/notifications.md#notifications-configuration).
- The logs for an individual step within a change can now be viewed via the OpsChain GUI by clicking on the step details icon for the relevant step on the change details page.

### Changed {#2023-05-05-changed}

- Upgraded BuildKit to v0.11.6
- The macOS CLI is now distributed in a DMG archive and is notarised.

## [2023-04-14] {#2023-04-14}

### Important breaking changes {#2023-04-14-important-breaking-changes}

- The OpsChain runner images have been upgraded to Ruby 3.1.4.
  - Please ensure the `.ruby-version` in your project Git repositories is updated to `ruby-3.1.4`.

### Added {#2023-04-14-added}

- Introduced a new `lazy` DSL keyword to allow resource property values to be derived at runtime rather than when OpsChain parses the project's `actions.rb` file. See [lazy property evaluation](/reference/concepts/actions.md#lazy-property-evaluation) for more information.

### Changed {#2023-04-14-changed}

- When a CLI `list` command returns no records, and the `output` type is JSON:
  - the CLI will now output `[]` rather than an empty result.
  - if a JSONPath query is supplied the CLI will now exit with an error code 2 rather than 0.
- Upgraded Bundler to 2.4.10.
- Upgraded BuildKit to v0.11.5.
- Upgraded Kong Helm chart to v2.16.5.
- Upgraded Kong ingress controller to v2.8.2.
- Upgraded Terraform 'hashicorp/aws' provider to 4.61.0 in the OpsChain Ansible example.
- Upgraded Terraform 'hashicorp/kubernetes' provider to 2.19.0 in the OpsChain Confluent, Terraform, and WebLogic examples.
- Upgraded Terraform to 1.4.4 in the OpsChain examples.
- Upgraded OpsChain log aggregator image to Fluentd 1.16.0-1.0.
- Upgraded Fluent Bit to v2.0.10.
- Upgraded OPA to v0.51.0.
- Upgraded Kubectl version to v1.25.8.

### Fixed {#2023-04-14-fixed}

- The `opschain change cancel` command output has been fixed - previously it would output an error (`Error: Couldn't DELETE Change`) but the change would be cancelled.
- The `opschain change create` step tree has been fixed - previously it would not update as the change progressed.
- OpsChain GUI
  - The root step connections failing to display when the tree is first constructed has been fixed
  - The parallel children icon temporarily disappearing from the parent step when it starts running has been fixed

## [2023-03-31] {#2023-03-31}

### Important breaking changes {#2023-03-31-important-breaking-changes}

- All API endpoints have been prefixed with `/api`. For example, `http://localhost:3000/changes` is now `http://localhost:3000/api/changes`.
  - Please ensure any calls to the API are updated to use the new endpoints.
- The OpsChain runner images have been upgraded to Ruby 3.1.3.
  - Please ensure the `.ruby-version` in your project Git repositories is updated to `ruby-3.1.3`.

### Added {#2023-03-31-added}

- The build service now automatically restarts when its certificate is renewed.
- OpsChain's web UI has been released. [Learn more](https://opschain.io/docs/whats-new/#31-march-2023) about its features. We expect the web UI to continue to evolve and thus change as features are added. [Contact us](/support.md#how-to-contact-us) if you have any feedback.
  - This release includes the ability to:
    - view a list of changes.
    - search changes.
    - view a list of automated changes.
    - view the details of a change, including a graphical representation of the change execution.

### Changed {#2023-03-31-changed}

- The API documentation has been moved from `/docs` to `/api-docs`.
- When accessing `/` the new web UI will be shown rather than the API docs. Access the API docs directly via `/api-docs`.
- The changes API (`api/changes`) now allows filtering by nested metadata values. [Learn more](/reference/concepts/changes.md#query-changes-by-metadata).
- The automated change rules API (`api/automated_change_rules`) now supports filtering and sorting. [Learn more](/reference/api-filtering.md)
- Upgraded cert-manager to 1.11.0.
- Upgraded BuildKit to v0.11.3.
- Upgraded Confluent to 6.2.9 in the OpsChain Confluent example.
- Upgraded Kong to v3.1.1.
- Upgraded Kong Helm chart to v2.16.0.
- Upgraded Terraform 'hashicorp/aws' provider to 4.56.0 in the OpsChain Ansible example.
- Upgraded Terraform 'hashicorp/kubernetes' provider to 2.18.1 in the OpsChain Confluent, Terraform, and WebLogic examples.
- Upgraded Terraform to 1.3.9 in the OpsChain examples.
- Upgraded PostgreSQL to 14.7.
- Upgraded OpsChain log aggregator image to Fluentd 1.15.3-1.2.
- Upgraded Fluent Bit to v2.0.9.
- Upgraded OPA to v0.49.2.
- Upgraded Kubectl version to v1.25.6.

### Fixed {#2023-03-31-fixed}

- The GitHub RSA keys in the SSH `known_hosts` file in the runner have been updated following [the GitHub announcement](https://github.blog/2023-03-23-we-updated-our-rsa-ssh-host-key/).
  - [View the documentation](/reference/project-git-repositories.md#customising-the-ssh-known_hosts-file) if you need to modify the contents of this file.

## 2023-01-13 {#2023-01-13}

### Important breaking changes {#2023-01-13-important-breaking-changes}

- Upgraded to Ruby 3.1.2, please update the `.ruby_version` in your project Git repositories to reflect this change.

### Added {#2023-01-13-added}

- Documentation on [running commands as root in `opschain dev`](/development-environment.md#running-commands-as-root).
- When defining a controller based resource type, the array supplied to the `action_methods:` keyword, can now include hashes providing the action name and description. Similarly, the controller `resource_type_actions` class method can now include hashes. [Learn more](/reference/concepts/actions.md#controller)
- Documentation has been added showing how to use a specific configuration file with the CLI. [Learn more](/reference/cli.md#specifying-the-cli-configuration-file).

### Changed {#2023-01-13-changed}

- The image built by `opschain dev build-runner-image` is now assigned the image tag `repository_runner:latest` by default.
- Upgraded Kong to v3.1.0.
- Upgraded Kong Helm chart to v2.14.0.
- Upgraded Kong ingress controller to v2.8.1.
- Upgraded Que to 2.2.0.
- Upgraded cert-manager to 1.10.2.
- Upgraded Fluent Bit to v2.0.8.
- Upgraded OpsChain log aggregator image to Fluentd 1.15.3.
- Upgraded PostgreSQL to 14.6.
- Upgraded OPA to v0.48.0.
- Upgraded BuildKit to v0.11.0.
- The `ruby-terraform` Gem version supported by the `opschain-resource-types` Gem has been updated to v1.7.0.
- Upgraded Terraform to 1.3.7 in the OpsChain examples.
- Upgraded Terraform 'hashicorp/aws' provider to 4.49.0 in the OpsChain Ansible example.
- Upgraded Terraform 'hashicorp/kubernetes' provider to 2.16.1 in the OpsChain Confluent, Terraform, and WebLogic examples.
- Upgraded HashiCorp Vault to 1.12.2 in the OpsChain Vault example.
- Upgraded all base images used by the OpsChain examples to AlmaLinux 8.7.
- Upgraded the OpsChain base runner image to AlmaLinux 8.7.

### Fixed {#2023-01-13-fixed}

- `opschain dev build-runner-image` no longer aborts if Git repository files have been deleted but not yet committed.
- OpsChain replaces the null bytes in log messages with U+FFFD. See the [troubleshooting guide](/troubleshooting.md#null-bytes-in-log-messages) to learn why this is necessary.

## 2022-11-29 {#2022-11-29}

### Important breaking changes {#2022-11-29-important-breaking-changes}

- Except for the OpsChain LDAP image, all OpsChain container images now start as a non-root user (including the step runner). After upgrading, please use `opschain dev create-dockerfile` to create a copy of the new step runner Dockerfile template in your project's `.opschain` folder and then reapply your customisations.
- The format to supply unauthorised environments to the OpsChain OPA security provider (in `security_configuration.json`) has changed.

### Added {#2022-11-29-added}

- [Instructions for restarting the build service when its certificate renews every 90 days](/operations/maintenance/build-service-certificate-renewals.md).

### Changed {#2022-11-29-changed}

- The API worker processes will now wait up to one hour to complete any running actions when shutting down. This grace period can also be [customised via a Helm value](/operations/workers.md#graceful-shutdown).
- The project and environment `--description` argument is now optional. If not supplied on the command line it will not be requested and the project/environment will be created with an empty description.

### Fixed {#2022-11-29-fixed}

- A sporadic bug when running `opschain change create` - `undefined method git_remote for nil:NilClass (NoMethodError)` - has been fixed.
- The `opschain dev build-runner-image` command now explicitly enables the use of BuildKit to match how image builds are performed for runner containers.
- `opschain server deploy` now ensures that the version of the OpsChain Helm chart used to deploy OpsChain aligns with the CLI version.

## 2022-10-24 {#2022-10-24}

### Added {#2022-10-24-added}

- OpsChain project Git remote credentials can now be updated using the `opschain project update-git-remote` command.
- OpsChain project and environment properties can now be edited using the `opschain project edit-properties` and `opschain environment edit-properties` commands.
- OpsChain now allows you to supply build secrets to the step runner image build process. See [secure build secrets](/reference/concepts/step-runner.md#secure-build-secrets) for more information. _Note: these secrets are provided at build time only and are not available at runtime. [Let us know](mailto:opschain-support@limepoint.com) if you're interested in using these secrets at runtime too._
- All OpsChain commands that support the `--output` argument now accept JSONPath queries in the format `--output jsonpath='$.jsonpath.query'`.
  - See the underlying JSONPath implementation documentation for details about the [supported syntax](https://www.npmjs.com/package/jsonpath-plus#user-content-syntax-through-examples), or try the [demo tool](https://jsonpath-plus.github.io/JSONPath/demo/).

### Changed {#2022-10-24-changed}

- The properties PATCH API now accepts an optional `version` attribute. If supplied, the API will ensure that the properties are only updated if the version matches the current version of the properties. This is useful when multiple users are editing the properties concurrently.
- Upgraded cert-manager to 1.10.0.
- Upgraded Fluent Bit to v1.9.9.
- Upgraded OpsChain log aggregator image to Fluentd 1.15.2.
- Upgraded Kong to v3.0.0.
- Upgraded Kong Helm chart to v2.13.1.
- Upgraded OPA to v0.45.0.
- Upgraded BuildKit to v0.10.5.
- Upgraded Terraform to 1.3.2 in the OpsChain examples.
- Upgraded Terraform 'hashicorp/aws' provider to 4.35.0 in the OpsChain Ansible example.
- Upgraded Terraform 'hashicorp/kubernetes' provider to 2.14.0 in the OpsChain Confluent, Terraform, and WebLogic examples.
- Upgraded HashiCorp Vault to 1.12.0 in the OpsChain Vault example.
- Upgraded Confluent to 6.2.7 in the OpsChain Confluent example.

### Fixed {#2022-10-24-fixed}

- The OpsChain CLI `opschain server deploy` command has been fixed on Windows.
  - **Breaking change** - the `.env` file has moved from using double quotes around values to single quotes to fix an issue with Windows paths containing special character sequences like `\n` - which was being treated as a newline.
    - If your .env file contains values containing `"`, they need to be unescaped and the surrounding `"` changed to `'`. Similarly, any value containing a `'` now needs to have the single quotes escaped. Rerunning a [full reconfiguration](/reference/cli.md#full-reconfiguration) may be simpler.
- Removed the text colour presentation from the masked fields in the `add-git-remote` and `list-git-remotes` command output when displayed in `json` or `yaml` format.

## 2022-09-20 {#2022-09-20}

### Changed {#2022-09-20-changed}

- As part of OpsChain moving out of the trial phase, the default Kubernetes namespace has been updated to `opschain` and the documentation repository has been moved to [`opschain`](https://github.com/LimePoint/opschain).
- Properties validation in OpsChain has been improved. Formerly properties validation was only applied when a step started running. Now, properties validation is also applied:
  - when project or environment properties are set (via the API or CLI). Detailed errors will be provided (via the API or CLI) if the properties fail validation.
  - after an OpsChain action modifies project or environment properties. If the modifications cause the properties to fail validation, the change will error and detailed errors will be reported in the change logs.
- The `change create --follow-logs` and `change show-logs` commands now support the `--output` argument, allowing you to output the logs in `text` (default) or `json` format.

### Fixed {#2022-09-20-fixed}

- The OpsChain Helm chart no longer deploys a cluster role or cluster role binding for the OpsChain ingress service account. The role and binding are now included with the Kong v2.12.0 Helm deployment.

## 2022-09-15 {#2022-09-15}

### Important breaking changes {#2022-09-15-important-breaking-changes}

- The OpsChain step runner Dockerfile template has been changed. After upgrading, please use `opschain dev create-dockerfile` to create a copy of the new template in your project's `.opschain` folder and then reapply your customisations.
- The OpsChain server management commands (`bin/*`) have been removed from the `opschain-trial` repository. They have been replaced by `opschain server` subcommands.
- The `opschain_auth/security_configuration.json` file must be moved out of the `opschain_auth` folder and stored in the same folder as the `.env` and `values.yaml` files, e.g. `mv opschain_auth/security_configuration.json .`

### Added {#2022-09-15-added}

- The OpsChain CLI now supports an optional `--output` argument for many operations, allowing you to display the command's output in different formats (e.g. YAML / JSON). See the relevant command's `--help` output for the available formats.
- Default output format(s) can be configured via your `.opschainrc` file. See the [OpsChain CLI reference](/reference/cli.md#opschain-cli-configuration-settings) for more information.
- The `opschain change retry` command now accepts a `--background` argument, allowing you to retry the change in the background.
- OpsChain now supports loading environment specific repository properties. See the [Git repository](/reference/concepts/properties.md#git-repository) section of the properties guide for more information.
- OpsChain can now be configured to support running concurrent changes for a single project environment. See the [change execution options](/reference/concepts/changes.md#change-execution-options) section of the changes reference guide for more information.
- The OpsChain CLI has new subcommands for managing and configuring OpsChain server installations under `opschain server`, e.g. `opschain server configure` - [learn more](/reference/cli.md#server-management).
- The `opschain server` commands support a `values.override.yaml` file for automatically applying Helm customisations.

### Changed {#2022-09-15-changed}

- When the available log lines for a single request (via `/log_lines` with a filter or via `/changes/<change_id>/log_lines`) exceeds the limit for a single request - a `more` link is provided to navigate to the next chunk.
- Upgraded cert-manager to 1.9.1.
- Upgraded Fluent Bit to v1.9.8.
- Upgraded HashiCorp Vault to 1.11.3 in the OpsChain Vault example.
- Upgraded Kong Helm chart to v2.12.0.
- Upgraded Kong Ingress Controller to v2.5.0.
- Upgraded OPA to v0.44.0.
- Upgraded OpsChain Log Aggregator Image to Fluentd 1.15.1.
- Upgraded PostgreSQL to 14.5.
- Upgraded Terraform to 1.2.9 in the OpsChain examples.
- Upgraded Terraform 'hashicorp/aws' provider to 4.29.0 in the OpsChain Ansible example.
- Upgraded BuildKit to v0.10.4.

### Fixed {#2022-09-15-fixed}

- The `opschain dev build-runner-image` command now supplies the `OPSCHAIN_VERSION` build argument to Docker when building your custom step runner image.

### Removed {#2022-09-15-removed}

- **Breaking change** - The OpsChain CLI `opschain dev` commands no longer recognise the `OPSCHAIN_VERSION` environment variable when starting the development environment or building runner images. Ensure you have the corresponding version of the CLI to access the required OpsChain images, e.g. to use the `2022-08-16` OpsChain images, use the `2022-08-16` version of the CLI.
- The `bin/opschain-*` commands have been removed from the `opschain-trial` repository - they have been replaced by the `opschain server` subcommands as described above. _Note: the `opschain server` commands do not need to be run in the `opschain-trial` directory. You can now move the existing configuration files (the `.env`, `values.yaml`, and `opschain_auth/security_configuration.json` files) into a folder of your choosing and run the commands from there. Please ensure as part of the move, that you move the `opschain_auth/security_configuration.json` file out of the `opschain_auth` folder per the instructions above (under "important breaking change")._

## 2022-08-16 {#2022-08-16}

### Important breaking changes {#2022-08-16-important-breaking-changes}

- OpsChain environments codes are no longer globally unique and can now be reused in different projects. With this change, the `/environments` API endpoint has been removed. Please use the `/projects/<project_code>/environments` endpoint for all future environment specific API access.
  - *_Note: Due to the endpoint changes, please ensure you are using the latest OpsChain CLI version._*

## 2022-08-12 {#2022-08-12}

### Fixed {#2022-08-12-fixed}

- The `error: cannot lock ref` error that occurred when multiple changes were executed for the same Git remote has been fixed.

## 2022-08-10 {#2022-08-10}

### Important breaking changes {#2022-08-10-important-breaking-changes}

- The OpsChain step runner Dockerfile template has been changed. After upgrading, please use `opschain dev create-dockerfile` to create a copy of the new template in your project's `.opschain` folder and then reapply your customisations.

### Added {#2022-08-10-added}

- The OpsChain CLI now allows you to build a step runner image from your project's `.opschain/Dockerfile` via the `opschain dev build-runner-image` command. See [custom runner images](/development-environment.md#custom-runner-images) for more details on using the image in your OpsChain development environment.

### Changed {#2022-08-10-changed}

- The `opschain project add-git-remote` command will now display the Git remote details rather than the text `Git remote added successfully`.

### Fixed {#2022-08-10-fixed}

- The image registry garbage collector now handles error conditions that may have caused runner images to be garbage collected prematurely.
- The `opschain change retry` command now follows the change logs when supplied with the `--follow-logs` argument.

## 2022-07-26 {#2022-07-26}

*This release is a bugfix for the 2022-07-20 release which is unusable. Please check the release notes for both releases before upgrading.*

### Changed {#2022-07-26-changed}

- The `opschain change create` command `--follow` argument has been renamed to `--follow-logs`.

### Fixed {#2022-07-26-fixed}

- The 2022-07-20 release contained a bug that caused it to fail when upgrading existing instances. This release corrects the invalid migration and must be used in place of 2022-07-20.
- The `opschain change create` command now exits with an error code for cancelled or failed changes when using the `--follow-logs` argument. This matches the functionality when this argument is not provided.

## 2022-07-20 {#2022-07-20}

**This release has a critical bug and should not be used. Please use release 2022-07-26 instead.**

### Important breaking changes {#2022-07-20-important-breaking-changes}

- The way OpsChain manages its local clone of your project Git repositories has changed to improve support for projects with multiple Git remotes. **You must re-add all active Git remotes for this release**.
  - Use the `opschain project list-git-remotes` command to identify your active Git remotes in each project.
  - Archive each Git remote using the `opschain project archive-git-remote` command.
  - Re-associate each Git remote with the project using the `opschain project add-git-remote` command.

### Added {#2022-07-20-added}

- The `opschain change create` command now accepts a `--follow` argument, allowing you to follow the change logs rather than view the step tree.

### Removed {#2022-07-20-removed}

- The `Metadata` column has been removed from the `opschain change list` output. To view the metadata, use the `opschain change show` command.

### Changed {#2022-07-20-changed}

- When creating a change, OpsChain now validates the supplied Git remote and revision after the change has been created. If the supplied values are invalid, the change will complete with an error status and the change logs will provide further information.
- Archiving a Git remote will now unschedule any automated change rules related to it.
- Git remotes used by automated change rules can no longer be deleted. Deleting the related automated change rules is now a prerequisite to deleting the Git remote.

## 2022-07-11 {#2022-07-11}

### Changed {#2022-07-11-changed}

- The OpsChain CLI now displays the user who continued a [wait step](/reference/concepts/actions.md#wait-steps).
- Upgraded Bundler to 2.3.17.
- Upgraded HashiCorp Vault to 1.11.0 in the OpsChain Vault example.
- Upgraded Kong Helm chart to v2.10.2.
- Upgraded Kong Ingress Controller to v2.4.2.
- Upgraded OPA to v0.42.0.
- Upgraded cert-manager 1.8.2
- Upgraded PostgreSQL to 14.4
- The `ruby-terraform` Gem version supported by the `opschain-resource-types` Gem has been updated to v1.6.0.
- Upgraded Terraform to 1.2.4 in the OpsChain examples.
- Upgraded Terraform 'hashicorp/aws' provider to 4.21.0 in the OpsChain Ansible example.
- Upgraded Terraform 'hashicorp/kubernetes' provider to 2.12.1 in the OpsChain Confluent, Terraform, and Weblogic examples.

### Fixed {#2022-07-11-fixed}

- OpsChain now supports project Git repositories with > 100 character paths.

## 2022-06-29 {#2022-06-29}

### Added {#2022-06-29-added}

- OpsChain project Git remotes can now be archived using the `opschain project archive-git-remote` command.
- The OpsChain API project `git_remotes` endpoint now accepts `DELETE` requests. _Note: Git remotes  that are associated with changes will have their credentials cleared rather than being deleted._
- Documentation has been added on Git remote operations. [Learn more](/reference/concepts/git-remotes.md).

### Changed {#2022-06-29-changed}

- `PATCH` request on the project `git_remotes` endpoint is now only used for archiving/unarchiving an existing Git remote. Git remote creation has been moved to its `POST` request.
- The `opschain project add-git-remote` command now replaces `opschain project set-git-remote`.

## 2022-06-20 {#2022-06-20}

### Added {#2022-06-20-added}

- `OpsChain.context.change.automated` is now populated in the [OpsChain context](/reference/concepts/context.md) - indicating whether a change was created by an [automated change rule](/reference/concepts/scheduled-changes.md).
- The `automated` field is now included in the OpsChain changes API response - indicating whether a change was created by an [automated change rule](/reference/concepts/scheduled-changes.md).

### Changed {#2022-06-20-changed}

- The OpsChain CLI now displays the provided command line argument values before prompting for any required values.
- Upgraded all base images used by the OpsChain examples to AlmaLinux 8.6.
- Upgraded Bundler to 2.3.15.
- Upgraded HashiCorp Vault to 1.10.3 in the OpsChain Vault example.
- Upgraded Kong to v2.8.2.
- Upgraded OPA to v0.41.0.
- Upgraded PostgreSQL to 14.3.
- The `ruby-terraform` Gem version supported by the `opschain-resource-types` Gem has been updated to v1.5.0.
- Upgraded Terraform to 1.2.2 in the OpsChain examples.
- Upgraded Terraform 'hashicorp/aws' provider to 4.17.0 in the OpsChain Ansible example.
- Upgraded the base OS for the OpsChain LDAP server to Debian bullseye
- Upgraded the OpsChain base runner image to AlmaLinux 8.6.
- Upgraded the CLI to Node.js v16.15.1.

## 2022-06-08 {#2022-06-08}

### Important breaking changes {#2022-06-08-important-breaking-changes}

- OpsChain must be installed from scratch for this release. Follow the steps in the [uninstall guide](/operations/uninstall.md) to remove OpsChain and then perform a [fresh install](/operations/installation.md). The existing Git remotes can be re-used with the new installation.

### Added {#2022-06-08-added}

- When the list of options for an argument contains a single value, the OpsChain CLI will now automatically select it.
- OpsChain now tracks the Git remote used for a change explicitly.
- OpsChain now tracks the Git remote used for an automated change rule explicitly.

### Changed {#2022-06-08-changed}

- **Breaking changes**
  - When creating a change the Git remote and revision must be specified individually via the `--git-remote-name` and `--git-rev` options.
  - When creating an automated change rule the Git remote and revision must be specified individually via the `--git-remote-name` and `--git-rev` options.
  - The `GIT_REV` build argument provided to custom project `Dockerfile`s no longer includes the remote name.

### Fixed {#2022-06-08-fixed}

- [Wait steps](/reference/concepts/actions.md#wait-steps) within namespaces now work as expected.
- A sporadic bug whilst running changes or using `opschain dev` - `iseq_compile_each: unknown node (NODE_SCOPE) (SyntaxError)` - has been fixed.

## 2022-05-25 {#2022-05-25}

### Known issues {#2022-05-25-known-issues}

- OpsChain changes may fail with `BUG: error: failed to solve ...`. See the [troubleshooting guide](/troubleshooting.md#opschain-change---bug-error-failed-to-solve) to learn how to resolve this issue.

### Added {#2022-05-25-added}

- The `opschain change show-logs` command now supports the `--timestamps` option, to prefix each log line with the date and time it was logged.
- OpsChain now supports [wait steps](/reference/concepts/actions.md#wait-steps) - steps that pause a change execution and wait for a user to continue the change manually.
- CLI version, server version and runner image can be retrieved via the `opschain info` CLI command.
- An `/info` endpoint has been added to the OpsChain API to return the currently running version and runner image.

### Changed {#2022-05-25-changed}

- Upgraded Bundler to 2.3.12.
- Upgraded Fluent Bit to v1.9.3.
- Upgraded BuildKit to v0.10.3
- Upgraded OPA to v0.40.0.
- Upgraded Terraform to 1.1.9 in the OpsChain examples.
- Upgraded Terraform 'hashicorp/aws' provider to 4.13.0 in the OpsChain Ansible example.
- Upgraded Terraform 'hashicorp/kubernetes' provider to 2.11.0 in the OpsChain WebLogic, Terraform, and Confluent examples.
- Upgraded HashiCorp Vault to 1.9.6 in the OpsChain Vault example.
- Upgraded Confluent to 6.2.4 in the OpsChain Confluent example.
- Upgraded Kong to v2.8.1.
- Upgraded Kong ingress controller to v2.3.1.

### Fixed {#2022-05-25-fixed}

- Added the missing `OpsChain.repository.properties` method that is described in the Git repository section of the [properties guide](/reference/concepts/properties.md#git-repository).
- The project links in the Git remotes response body.
- Fixed runner image building on macOS M1 hosts.

## [2022-05-09] {#2022-05-09}

### Added {#2022-05-09-added}

- OpsChain project Git remotes can now be queried using the `opschain project list-git-remotes` command.

### Changed {#2022-05-09-changed}

- The `opschain-dev` command has been replaced with a new CLI command `opschain dev`. Execute `opschain dev --help` for more information.
- the `opschain-lint` Git pre-commit hook has been updated and should be recreated in your project Git repositories. From within the OpsChain development environment, execute `rm -f .git/hooks/pre-commit && opschain-lint --setup`
- Outside the development environment:
  - the `opschain-action` command is no longer available.
  - the `opschain-lint` command has been replaced with a new OpsChain CLI command `opschain dev lint`.
  - The `opschain-utils dockerfile_template` command has been replaced with a new OpsChain CLI command `opschain dev create-dockerfile`

### Fixed {#2022-05-09-fixed}

- Updates to properties made by parallel steps are now applied correctly.

## [2022-05-05] {#2022-05-05}

### Added {#2022-05-05-added}

- Documentation has been added explaining how container image builds can be achieved with OpsChain. [Learn more](/reference/building-container-images.md).
- A link to the step's log lines is now included in the step JSON.
- The `opschain change create` command now accepts the `--background` argument, allowing you to create changes and not follow their progress.

### Fixed {#2022-05-05-fixed}

- The OpsChain licence has been fixed in the OpsChain development environment.

## [2022-04-20] {#2022-04-20}

### Added {#2022-04-20-added}

- The OpsChain CLI request timeout can now be modified. [Learn more](/reference/cli.md#opschain-cli-configuration-settings).
- Log messages pertaining to the step phases. [Learn more](/reference/concepts/step-runner.md#log-messages-for-step-phases).

### Changed {#2022-04-20-changed}

- The OpsChain CLI will now retry lookup requests (up to three times total) if they fail due to timeouts.
- Upgraded Ruby to 2.7.6.
- Upgraded Bundler to 2.3.11.
- Upgraded Fluentd to v1.14.6-1.0.
- Upgraded Fluent Bit to v1.9.2.
- Upgraded BuildKit to v0.10.1
- Upgraded OPA to v0.39.0.
- Upgraded Terraform to 1.1.8 in the OpsChain examples.
- Upgraded Terraform 'hashicorp/aws' provider to 4.9.0 in the OpsChain Ansible example.
- Upgraded Terraform 'hashicorp/kubernetes' provider to 2.10.0 in the OpsChain WebLogic, Terraform, and Confluent examples.
- Upgraded HashiCorp Vault to 1.9.4 in the OpsChain Vault example.
- Upgraded Confluent to 6.2.3 in the OpsChain Confluent example.
- Upgraded recommended cert-manager version to v1.8.0.
- Upgraded Kong ingress controller to v2.3.1.
- A full backtrace will be shown in the change logs when an action raises an error.
- **Breaking changes**
  - The `OPSCHAIN_IMAGE_TAG` variable has been renamed `OPSCHAIN_VERSION`.
  - The `opschain.lic` path has changed in the custom Dockerfile, it is now stored in `/` in the runner image.

  _Use the `opschain-utils dockerfile_template` command to see the new Dockerfile format and ensure any custom project Dockerfiles are updated to reflect these changes._

## [2022-04-11] {#2022-04-11}

### Added {#2022-04-11-added}

- The OpsChain CLI now supports [shell completion](/reference/cli.md#shell-completion).
- OpsChain now supports SSH authentication (in addition to password authentication) for Git remotes.
  - There is an SSH `known_hosts` file provided by OpsChain. See [the documentation](/reference/project-git-repositories.md#ssh-git-remotes) if you need to know more about this file.

### Changed {#2022-04-11-changed}

- The `opschain project set-git-remote` arguments have been updated to support the new authentication options.
- The OpsChain CLI examples for `set-properties` no longer use the `cli-files` folder as the native binary does not require it.

## [2022-03-28] {#2022-03-28}

### Added {#2022-03-28-added}

- Documentation on the [change and step behaviour](/reference/concepts/concepts.md#behaviour-when-a-child-step-fails) when a failure occurs in one of the child steps.
- OpsChain action method validation can now be [disabled](/reference/concepts/actions.md#controller-action-method-validation).

### Changed {#2022-03-28-changed}

- **Breaking changes**
  - OpsChain has moved from Docker Compose to Kubernetes. Only single node Kubernetes deployments are supported currently.
    - There is no migration path for data from previous versions of OpsChain to the current version.
    - This release of OpsChain must be installed from scratch.
    - Most of the OpsChain processes documented in the [OpsChain operations guides](./operations) have changed.
  - The OpsChain runner Dockerfile now utilises the OPSCHAIN_BASE_RUNNER build argument to determine the FROM image. Use the `opschain-utils dockerfile_template` command to see the new format and ensure any custom project Dockerfiles are updated to reflect this change.
- When running changes that include parallel child steps, if one of those children fails, the `opschain change create` command will continue running until all its siblings have finished.
- Upgraded Fluentd to v1.14.5-1.1.
- Upgraded OPA to 0.38.1.
- Upgraded PostgreSQL to 14.2.
- Upgraded Terraform to 1.1.7 in the OpsChain examples.
- Upgraded Terraform 'hashicorp/aws' plugin to 4.5.0 in the OpsChain Ansible example.
- Upgraded the OpsChain base runner image to AlmaLinux 8.5.
- All base images used by the OpsChain examples upgraded to AlmaLinux 8.5
- When running changes that include parallel child steps, if one of those children fails, the `opschain change create` command will continue running until all its siblings have finished.

### Fixed {#2022-03-28-fixed}

- When following the change logs, OpsChain will display all the logs until the change completes - previously the final log messages may not have been shown.

## [2022-03-01] {#2022-03-01}

### Added {#2022-03-01-added}

- The OpsChain hardware requirements are now [documented](/operations/installation.md#hardwarevm-requirements).
- The `opschain change show-logs` command now accepts a `--follow` argument to follow the logs until the change completes.
- [Documentation](/reference/concepts/properties.md#changing-properties-in-concurrent-steps) and [troubleshooting guide](/troubleshooting.md#updates-made-to-properties-in-change--step--could-not-be-applied) when changing properties within parallel steps.
- Added [Kubernetes resource types](/reference/included-resource-types.md#opschain-kubernetes).
- Added an [SSH key pair](/reference/included-resource-types.md#opschain-ssh-key-pair) resource type.

### Changed {#2022-03-01-changed}

- Upgraded Rails to 7.
- Upgraded Ruby to 2.7.5.
- Upgraded PostgreSQL to 14.1.
- Upgraded Bundler to 2.3.6.
- Upgraded OPA to 0.36.0.
- Upgraded Fluentd to v1.14.4-1.0.
- Upgraded Terraform to 1.1.4 in the OpsChain examples.
- Upgraded Terraform 'hashicorp/aws' plugin to 3.73.0 in the OpsChain Ansible example.
- Upgraded HashiCorp Vault to 1.9.2 in the OpsChain Vault example.
- Upgraded Confluent to 6.2.2 in the OpsChain Confluent example.
- Update example on [setting environment variables](/reference/concepts/properties.md#setting-environment-variables-example) in the [OpsChain properties guide](/reference/concepts/properties.md#opschain-properties).
- Update documentation on the [minimum requirements](/reference/project-git-repositories.md#minimum-requirements) in the [OpsChain project Git repositories guide](/reference/project-git-repositories.md).
- The OpsChain base runner image is now based on AlmaLinux 8.

### Fixed {#2022-03-01-fixed}

- Properties raising `ActiveRecord::StaleObjectError` exception when parallel steps modify properties.
- API worker now logs the full stack trace for `Failed processing step <step_name> (ProcessStepResultCommand::Error)` exception when patching properties fails.

## [2021-11-12] {#2021-11-12}

### Added {#2021-11-12-added}

- Reference for all third party software licences used in our applications.
- Document our [support policy](/support.md). This includes the type of support we provide when using OpsChain, as well as details on how and when to contact our support team.
- In addition to lightweight tags, OpsChain now supports creating changes that reference annotated tags. See [creating tags](https://git-scm.com/book/en/v2/Git-Basics-Tagging) for more information on Git tag types.
- When run in a dirty Git repository, the OpsChain CLI now prints a warning when creating a change to alert the user that their updates may not be committed yet.
- **Breaking changes**
  - OpsChain now requires an `opschain.lic` licence file to operate. Please use the [`#opschain-trial` Slack channel](https://limepoint.slack.com/messages/opschain-trial) to request a licence.
  - Custom runner base images now require ONBUILD steps to ensure the OpsChain licence is available to the runner. For further details see [image performance - base images](/reference/concepts/step-runner.md#image-performance---base-images).
- Documentation on how to [uninstall](/operations/uninstall.md) OpsChain.

### Changed {#2021-11-12-changed}

- The `configure` script won't re-ask questions that can't change.
- Upgraded Bundler to 2.2.30.
- Upgraded OPA to 0.34.0.
- Upgraded Fluentd to 1.14.2-1.0.
- Upgraded Terraform to 1.0.10 in the OpsChain examples.
- Upgraded Terraform 'hashicorp/aws' plugin to 3.63.0 in the OpsChain Ansible example.
- The OpsChain step runner Docker image is now built with Docker BuildKit.

## [2021-10-26] {#2021-10-26}

### Added {#2021-10-26-added}

- Change specific logs are now available from the `/changes/<change_id>/log_lines` API. The results can be filtered using the same filtering syntax as events.
- The OpsChain DSL now supports
  - referencing resource properties by name within `action` blocks - see [defining resource types & resources](/reference/concepts/actions.md#defining-resource-types--resources).
  - referencing composite resource properties by name within child resources - see [defining composite resources](/reference/concepts/actions.md#defining-composite-resources--resource-types).
  - referencing resources by name from within actions and when setting properties - see [referencing resources](/reference/concepts/actions.md#referencing-resources)

### Changed {#2021-10-26-changed}

- On startup, OpsChain now displays the publicly mapped port it is listening on.
- Upgraded Bundler to 2.2.28.
- Upgraded OPA to 0.33.0.
- Upgraded Fluentd to 1.14.1-1.0.
- Upgraded Terraform to 1.0.8 in the OpsChain examples.
- Upgraded Terraform 'hashicorp/aws' plugin to 3.62.0 in the OpsChain Ansible example.
- Upgraded HashiCorp Vault to 1.8.4 in the OpsChain Vault example.
- Upgraded Confluent to 6.2.1 in the OpsChain Confluent example.
- Parallel child steps are now run in serial when run in the `opschain-dev` development environment.
- **Breaking changes**
  - the `/log_lines` endpoint
    - returns at most 10,000 log lines.
    - requires a filter using the same filtering syntax as events.
  - upgraded PostgreSQL to 14.0 (your database must be re-created, or manually upgraded).
  - the `resource_properties` resource method in the OpsChain DSL has been replaced with `properties`.
  - the OpsChain DSL `Scope` class has been restructured and is for internal use only.

### Removed {#2021-10-26-removed}

- **Breaking change** - the `/log_lines` endpoint no longer accepts the `change_id` URL parameter

## [2021-09-28] {#2021-09-28}

You **must** run `configure` after upgrading to update the `.env` file with the log configuration update.

### Added {#2021-09-28-added}

- `opschain-lint` is automatically added as a Git pre-commit hook for new project Git repositories.
- The `configure` script now shows an error when it fails.
- An OpsChain banner message is displayed once the API is ready.
- OpsChain API documentation is now available from the API server [http://localhost:3000/docs](http://localhost:3000/docs).

### Changed {#2021-09-28-changed}

- The `configure` script now resolves the absolute path for the OPSCHAIN_DATA_DIR.

### Fixed {#2021-09-28-fixed}

- Repeated invocations of the `configure` script on macOS have been fixed - they used to fail silently.
- OpsChain runners on Windows and macOS were failing as the log configuration was wrong.

## [2021-09-03] {#2021-09-03}

### Added {#2021-09-03-added}

- The OpsChain CLI can now:
  - be configured to output the step statuses as text rather than emoji. See the [CLI configuration guide](/reference/cli.md#opschain-cli-configuration-settings) for more details.
  - archive projects and environments. See the [archiving projects & environments guide](/reference/concepts/archiving.md) for more details.
- The OpsChain DSL now supports the `ref` method for referencing other resources. This is useful for cases where a resource name includes special characters, e.g.:

  ```ruby
  infrastructure_host 'test.opschain.io'

  some_resource 'something' do
    host ref('test.opschain.io') # `host test.opschain.io` would fail here
  end
  ```

- The OpsChain API `projects` and `environments` endpoints now
  - return a boolean `archived` attribute.
  - accept `DELETE` requests. _Note: Only projects and environments with no associated changes can be deleted._
- The OpsChain API `automated_change_rules` endpoint now includes a `next_run_at` attribute containing the time when the rule will next run. See the [automated changes guide](/reference/concepts/scheduled-changes.md#creating-a-scheduled-change-for-new-commits) for more information on what happens when an automated change rule runs.
- The `opschain automated-change list` output no longer include the `Project` and `Environment` columns (as these are parameter values to the command) and includes a `Next Run At` column.
- The `opschain-action` command now supports a _best-effort_ mode for running the child steps of an action. See the [child steps](/development-environment.md#child-steps) section of the Docker development environment guide for more details.
- OpsChain now provides an `opschain-lint` command for detecting issues with the OpsChain DSL. Learn more in the [Docker development environment](/development-environment.md#using-the-opschain-linter) guide.
  - `opschain-lint` is run as part of the default Dockerfile for steps to detect errors sooner - this can be added to custom Dockerfiles, or a custom Dockerfile could be used to remove the linter if it is not desired.

### Fixed {#2021-09-03-fixed}

- A rare logging error reported by the OpsChain worker - `(JSON::ParserError) (Excon::Error::Socket)`/`socat[323] E write(., ..., ...): Broken pipe` - has been fixed.
- A rare Terraform error where the temporary var file was removed prior to Terraform completing has been fixed.

### Changed {#2021-09-03-changed}

- Upgraded Bundler to 2.2.26.
- Upgraded Postgres to 13.4.
- Upgraded Terraform to 1.0.5 in the OpsChain examples.
- Upgraded Terraform 'hashicorp/aws' plugin to 3.56.0 in the OpsChain Ansible example.
- Upgraded Terraform 'kreuzwerker/docker' plugin to 2.15.0 in the OpsChain Confluent, Terraform & Weblogic examples.
- Upgraded HashiCorp Vault to 1.8.2 in the OpsChain Vault example.

## [2021-08-16] {#2021-08-16}

### Added {#2021-08-16-added}

- OpsChain now supports events. The `/events` endpoint can be used for reporting and auditing, see the [events](/reference/concepts/events.md) guide for more details.
- The list of configuration in the `.env` file is now documented in the [configuration options](/operations/configuring-opschain.md) guide.
- Changes can now take metadata (JSON structured data) to help identify and track changes.
  - The `opschain change create/retry` commands now takes an optional argument to allow providing the metadata for a change.
    - If provided, the metadata file must contain a JSON object, e.g. `{ "cr": "CR73", "description": "Change request 73 - apply patchset abc to xyz." }`.
  - The `opschain change show/list` commands now include the change metadata.
  - The `/changes` API can now be filtered using the same filtering syntax as events.
    - For example, `?filter[metadata_cr_eq]=CR73` would match all changes with the metadata `{ "cr": "CR73" }`.
    - See the [events filtering](/reference/concepts/events.md#filtering-events) documentation for more details.

### Changed {#2021-08-16-changed}

- Simplified the `.env` file by moving default values to `.env.internal`
- The OpsChain log aggregator no longer requires that port 24224 is available - it now uses a Docker managed random port

### Fixed {#2021-08-16-fixed}

- A number of broken links in the documentation have been fixed

## [2021-08-04] {#2021-08-04}

### Changed {#2021-08-04-changed}

- The OpsChain change log retention guide has moved and been renamed to [OpsChain data retention](/operations/maintenance/data-retention.md).
- **Breaking change** - the `OPSCHAIN_ARCHIVE_LOG_LINES_JOB_CRON` config variable has been renamed to `OPSCHAIN_CLEAN_OLD_DATA_JOB_CRON`.
- **Breaking change** - Upgraded Ruby to 2.7.4 on the OpsChain Step Runner.
  - If required, please update the `.ruby_version` in your project Git repositories.
- Upgraded Bundler to 2.2.25.
- Upgraded OpsChain Log Aggregator Image to Fluentd 1.13.3.
- Upgraded OpsChain Auth Image to Open Policy Agent 0.31.0.
- Upgraded Terraform to 1.0.3 in the OpsChain examples.
- Upgraded Terraform hashicorp/aws plugin to 3.52.0 in the OpsChain Ansible example.
- Upgraded Terraform kreuzwerker/docker plugin to 2.14.0 in the OpsChain Confluent, Terraform & Weblogic examples.
- Upgraded HashiCorp Vault to 1.8.0 in the OpsChain Vault example.

### Fixed {#2021-08-04-fixed}

- A bug with the configure script on macOS has been fixed - `./configure: line 90: ${env_file_contents}${var}=${!var@Q}\n: bad substitution`.

## [2021-07-29] {#2021-07-29}

### Changed {#2021-07-29-changed}

- OpsChain now caches user's LDAP group membership to reduce LDAP load. See [LDAP group membership caching](/operations/opschain-ldap.md#ldap-group-membership-caching) for more details.
- **Breaking change** - Calling OpsChain API's with missing or invalid parameters now returns a 500 Internal Server Error, and more explicit error messages in the response body.

## [2021-07-19] {#2021-07-19}

### Added {#2021-07-19-added}

- OpsChain change logs can now be [forwarded to external storage](/operations/log-forwarding.md).
- OpsChain change logs can now be [cleaned up automatically](/operations/maintenance/data-retention.md#change-log-retention).
- When defining dependent steps in the OpsChain DSL the step name is now automatically qualified with the current namespace.
- **Feature preview** - the platform native builds of the OpsChain CLI can now be [downloaded directly](/reference/cli.md#installation).

### Changed {#2021-07-19-changed}

- File property paths are now [expanded](https://docs.ruby-lang.org/en/2.7.0/File.html#method-c-expand_path) before being written.
- Running the `configure` script no longer removes unknown configuration options.
- Any resources included in the value supplied to the `properties` resource DSL will have their controller assigned to the relevant property rather than the resource itself. This makes `properties` match the existing functionality for individually set properties.

## [2021-07-08] {#2021-07-08}

### Added {#2021-07-08-added}

- The [Oracle WebLogic example](https://github.com/LimePoint/opschain-examples-weblogic) now includes a sample WAR file and related `deploy`, `redeploy` and `undeploy` actions.
- A HashiCorp Vault example project repository is [now available](https://github.com/LimePoint/opschain-examples-vault).
- The OpsChain CLI now helps you track the progress of a change by showing the expected step tree.
- The `opchain-action` and `opschain-dev` commands now inherit environment variables starting with `opschain_` (case insensitive).
- The `opschain-action` command now supports the `OPSCHAIN_DRY_RUN` environment variable to see the full expected step tree without running the action.
- OpsChain file properties now supports storing binary files with the new base64 format. See [file formats](/reference/concepts/properties.md#file-formats) for more details.

### Changed {#2021-07-08-changed}

- Upgraded Terraform to 1.0.1 in the OpsChain examples.
- Upgraded Terraform plugins in the OpsChain examples - see the commit history of each repository for details.
- Upgraded OpsChain Log Aggregator Image Fluentd to 1.13.1.
- Upgraded OpsChain Auth Image Open Policy Agent 0.30.1.
- Upgraded Bundler to 2.2.21.

## [2021-06-24] {#2021-06-24}

### Added {#2021-06-24-added}

- `OpsChain.context` is now available to actions and controllers. See the [OpsChain context guide](/reference/concepts/context.md) for more information.

### Fixed {#2021-06-24-fixed}

- After waiting for the environment change lock, pending changes will be executed in the order they were created. Previously pending changes could start in any order.

### Removed {#2021-06-24-removed}

- **Breaking change** - The `opschain-auth` container is no longer bound to 8081 by default.

## [2021-06-16] {#2021-06-16}

### Added {#2021-06-16-added}

- Docker build logs for the OpsChain step runner image are included in the change/step logs. They will be shown as part of the output of the `opschain change logs-show` command for new changes.

### Changed {#2021-06-16-changed}

- **Breaking change** - The assign LDAP group ldif example now creates a groupOfNames rather than a posixGroup to support RFC 4519.
  - To use this new group format, you will need to alter the OPSCHAIN_LDAP_GROUP_ATTRIBUTE value in your `.env` file from `memberOf` to `member`
- **Breaking change** - `Automated Deployment Rules` and `Scheduled Deployment Rules` have been renamed to `Automated Change Rules`.
  - The CLI `automated-deployment-{create,delete,list}` and the `scheduled-deployment-{create,delete,list}` subcommands have been combined into a new `opschain automated-change` command.
    - The CLI `--help` argument can be used to see the new names.
- **Breaking change** - The CLI subcommands have been renamed:
  - The convention for CLI subcommands has changed from `noun-verb` to `verb-noun`, for example, `opschain environment properties-set` has been renamed to `opschain environment set-properties`.
- **Breaking change** - The `--commit-ref` and `--ref` options have been renamed to `--git-rev` for consistency. This affects the `opschain change create` and the new `opschain automated-change create` commands.
- **Breaking change** - The `GIT_REF` ARG in custom Dockerfiles has been renamed to `GIT_SHA` - this means that if the Git sha the Git reference points to is altered during a change the steps will still use the original commit (sha).
- `GIT_REV` is now an environment variable that is assigned (with the `git_rev` value of the change) when using the default step runner.
  - A `GIT_REV` ARG is now provided to custom Dockerfiles - this can be assigned to an environment variable (the custom Dockerfile template demonstrates how this can be done).

## [2021-06-10] {#2021-06-10}

### Added {#2021-06-10-added}

- An Oracle WebLogic example project repository is [now available](https://github.com/LimePoint/opschain-examples-weblogic).
- **Feature preview** - platform native builds of the OpsChain CLI are now available for Windows, macOS and Linux. Contact LimePoint support for access.
- OpsChain now supports Active Directory for user authentication and authorisation. See [configuring an external LDAP](/operations/opschain-ldap.md#configuring-an-external-ldap)
  - **This change requires the `configure` command to be rerun.**
- OpsChain changes can now be retried from failure or cancellation by using the `opchain change retry` command.
- Updating now safeguards properties whilst a change is active.
  - Step properties are immutable.
  - Project and environment properties can't be updated if they are in use by an active change.

### Changed {#2021-06-10-changed}

- Upgraded Terraform to 0.15.4 in the OpsChain examples.
- Upgraded Terraform plugins in the OpsChain examples - see the commit history of each repository for details.
- Upgraded OpsChain Log Aggregator Image Fluentd to 1.12.4.
- Upgraded OpsChain DB Image PostgreSQL to 13.3.
- Upgraded OpsChain Auth Image Open Policy Agent 0.29.4.
- Upgraded Bundler to 2.2.19.
- **Breaking change** - The OpsChain LDAP database structure has changed. Please remove the files in `OPSCHAIN_DATA_DIR/opschain-ldap` before starting OpsChain.

  _Note: You will need to recreate any users you had created in the OpsChain LDAP._

## [2021-06-01] {#2021-06-01}

### Added {#2021-06-01-added}

- The ability to use custom Runner images in the OpsChain Docker development environment. Note that the custom Runner image must have been built as part of an OpsChain change.
  - **This change requires the `configure` command to be rerun.**
- The OpsChain CLI now inherits environment variables. This allows using environment variables to override CLI config or to configure http(s) proxies. Find out more in our [CLI reference](/reference/cli.md).
- [OpsChain operations guides](./operations).
  - <a href='#' onclick={(e) => {alert('This document has been removed'); e.preventDefault()} }>OpsChain rootless Docker install</a> documentation.
  - [OpsChain backups](/operations/maintenance/backups.md) documentation.

## [2021-05-26] {#2021-05-26}

### Added {#2021-05-26-added}

- The OpsChain platform now includes an Authorisation Server allowing you to restrict user access to projects and environments.
- OpsChain changes can now be cancelled by using the `opschain change cancel` command.

### Changed {#2021-05-26-changed}

- **Breaking change** - The OpsChain CLI now uses kebab-case-arguments (rather than snake_case_arguments) so all multi word arguments have changed.

## [2021-05-17] {#2021-05-17}

### Important breaking changes {#2021-05-17-important-breaking-changes}

- the `opschain_db`, `opschain-ldap` and `opschain_project_git_repos` directories have been moved into a new `opschain_data` directory (`opschain_data` can be overridden as part of the `configure` process)
  - you **must** run `configure` after upgrading to reflect the new directory structure in your `.env` file.
- due to the addition of the project code the OpsChain database needs to be removed and recreated.
  - the path to the project Git repositories has changed from `./opschain_project_git_repos/production/<uuid>` to `./opschain_data/opschain_project_git_repos/<uuid>`.

### Added {#2021-05-17-added}

- a symbolic link is created as part of the project creation, allowing you to navigate to the project's Git repository via `./opschain_data/opschain_project_git_repos/<project code>`
- **Breaking change** - projects now use (and require) a unique project code.
- The OpsChain Terraform resource type now supports version 0.15.

### Changed {#2021-05-17-changed}

- Environment codes can now be up to 50 characters long.
- **Breaking change** - the OpsChain CLI and API have been altered to use the project code as the project identifier rather than the project id.
- The CLI output for the environment and project list commands has changed - the code field is now shown first and the ID is not shown.

### Removed {#2021-05-17-removed}

- The environment delete API has been removed.
- **Breaking change** - Support for Terraform version 0.14 and lower has been removed from the OpsChain Terraform resource.

## [2021-05-10] {#2021-05-10}

### Added {#2021-05-10-added}

- OpsChain now supports [automated deployments](/reference/concepts/concepts.md#scheduled-changes) - a way to automatically create OpsChain changes in response to Git changes. See [setting up an automated deployment](/reference/concepts/scheduled-changes.md) for more information.
- OpsChain now supports [scheduled deployments](/reference/concepts/concepts.md#scheduled-changes) - a way to automatically create OpsChain changes at a scheduled time.

### Changed {#2021-05-10-changed}

- OpsChain now allows properties to be sourced from a project's Git repository. See the updated [OpsChain properties guide](/reference/concepts/properties.md) for more information.
- OpsChain now does a Git [forced fetch](https://git-scm.com/docs/git-fetch#Documentation/git-fetch.txt---force) when fetching a project's Git repository. This means tags can be updated in the remote and reflected in the project Git repository.

## [2021-04-27] {#2021-04-27}

### Added {#2021-04-27-added}

- Helper methods available from within actions to store and remove files from project and environment properties. See [storing & removing files](/reference/concepts/properties.md#storing--removing-files) for more details.

### Changed {#2021-04-27-changed}

- OpsChain environments are now locked such that only one change can be run in an environment at a time. Changes will sit in the `pending` state whilst waiting for the existing change to finish.
- The OpsChain properties available via `OpsChain.properties` are frozen, ensuring users receive an error if they attempt to change them (as only `OpsChain.environment.properties` and `OpsChain.project.properties` are persisted)
- The `terraform_config` resource type now:
    1. automatically stores the Terraform state file in the environment properties.
    2. automatically calls terraform init in the OpsChain Runner prior to running Terraform commands.
- The Confluent and Terraform examples now
    - use Terraform v0.14.9.
    - rely on the new automatic features of the `opschain-terraform` resource.

- The OpsChain Runner now uses
    - Ruby v2.7.3. Please make any necessary adjustments to your project's Git repositories to reflect this change.
- **Breaking change** - the OpsChain [files properties](/reference/concepts/properties.md#file-properties) format has changed. Any files stored in your properties will need to be altered to reflect the new format.

  _Note: The `properties-show` and `properties-set` features can be used to download, upload your properties (allowing you to edit your properties locally)._

### Fixed {#2021-04-27-fixed}

- Hide internal development tasks from the opschain-utils output.
- OpsChain Runner showing "Connection refused - connect(2) for /var/run/docker.sock.opschain" after container restart.

## [2021-03-31] {#2021-03-31}

### Added {#2021-03-31-added}

- An example project for [running a simple Terraform change](/examples/running-a-simple-terraform-change.md).
- The Getting Started guide now includes instructions for creating your own action.

### Changed {#2021-03-31-changed}

- The sample data provided as part of the Getting Started guide has been simplified.
- The `.opschain/step_context.json` file is now optional when running `opschain-action` or `opschain-dev`.
- The `terraform_config` resource type passes any `vars` ([Terraform input variables](https://www.terraform.io/docs/language/values/variables.html)) supplied to Terraform via a [var file](https://www.terraform.io/docs/language/values/variables.html#variable-definitions-tfvars-files).

### Removed {#2021-03-31-removed}

- The [Confluent example](https://github.com/LimePoint/opschain-examples-confluent) no longer provides the VarFile class as its functionality has been added to the `terraform_config` resource type.

## [2021-03-22] {#2021-03-22}

### Added {#2021-03-22-added}

- The `opschain-resource-types` Gem is now pre-installed in the OpsChain step runner image providing some [resource types](/reference/included-resource-types.md) for the `ruby-terraform` Gems.

  _Please note the [prerequisites](/reference/included-resource-types.md#prerequisites) for the Terraform resource._

### Changed {#2021-03-22-changed}

- The Terraform binary is now installed in the custom step runner Dockerfile as part of the [OpsChain Confluent example](https://github.com/LimePoint/opschain-examples-confluent/blob/75473f7fbac4150b3d5c583dfc52c6b22044552f/.opschain/Dockerfile#L8)

### Removed {#2021-03-22-removed}

- The Terraform binary has been removed from the OpsChain step runner image for parity with other tools which we support but don't bundle.
- Terraform support has been removed from the `opschain-core` Gem (Terraform support is now available via the `opschain-resource-types` Gem).

## [2021-03-09] {#2021-03-09}

### Added {#2021-03-09-added}

- Automatically expose [controller actions and properties](/reference/concepts/actions.md#controller-actions-and-properties) in resource types and resources.
- [upgrading.md](/operations/upgrading.md) documentation.

### Changed {#2021-03-09-changed}

- Upgraded OpsChain log aggregator image Fluentd from version 1.11 to 1.12.1
- Upgraded OpsChain LDAP image OpenLDAP from version 2.4.50 to 2.4.57
- Upgraded OpsChain DB image postgres from 13.1 to 13.2
- Upgraded OpsChain step runner image Terraform from 0.12.29 to 0.14.7.

_Please note:_

1. Project Git repositories will need to be updated:
    - [Terraform 0.12 -> 0.13](https://www.terraform.io/upgrade-guides/0-13.html) - will assist in creating a `versions.tf` in your project Git repository(s).
    - [Terraform 0.13 -> 0.14](https://www.terraform.io/upgrade-guides/0-14.html) - provides information on the new `.terraform.lock.hcl` lock file.
