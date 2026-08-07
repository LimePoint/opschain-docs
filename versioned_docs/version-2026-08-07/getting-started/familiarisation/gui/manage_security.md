---
sidebar_position: 10
description: ''
---

# Manage security

This page enables administrators to manage access control across different areas of the system, each represented by a hierarchical path identifier (e.g. `/projects/bank/assets`). Security policies are composed of authorisation rules that can be assigned to individual users or LDAP groups. These rules govern the scope and level of permissions granted, defining what actions users are allowed to perform within the system.

:::note
You will need to have admin privileges in order to access this page.
:::

## How OpsChain authorisation works

OpsChain provides a granular, top-down authorisation model for each of its resources. Security is controlled by applying rules to hierarchical paths, and permissions are inherited from parent paths unless explicitly overridden.

This model is built on two core concepts:

- **Authorisation rules** define _what_ action (`read`, `update`, `execute`) is allowed or denied on a specific resource _path_.
- **Authorisation policies** link the rules to users and groups, defining _who_ the permissions apply to.

:::note
In this guide, _resource_ refers to anything you can manage in OpsChain. It is not the same as the [resource concept](/key-concepts/overview.md#resource) used by the OpsChain DSL.
:::

### How permissions are evaluated

By default, no rules and policies are applied to any user, meaning that no user has any permissions to any resource in OpsChain by default.

OpsChain evaluates permissions based on the path to a resource and the rules applied to the user. The rule that takes precedence is the one that most closely matches the target resource path.

For example, to execute a change on the `soa` asset, OpsChain will look for the most specific rule that applies to that path:

- If a rule exists for `/projects/bank/environments/dev/assets/soa`, that rule will be used, regardless of the rules on its parent paths.
- If no rule is found for the asset itself, OpsChain will check its parent `/projects/bank/environments/dev`, and so on up the hierarchy.
- If no applicable `allow` rule is found at any level, the action is denied.

### Authorisation rule actions

An authorisation rule affects what a user can do at a path. The supported actions are:

- `read` - whether the user can view the target, for example viewing the properties of an environment
- `update` - whether the user can create, update or delete the target, for example creating a project
- `execute` - whether the user can execute the target, for example executing a change or a workflow

:::info[Action precedence]
When either the `update` or `execute` actions are enabled, the `read` action is automatically assigned to the same path.
:::

### Resource paths

The path for a resource is the path that it is accessed via the GUI or API. Examples of paths are:

- `/projects/bank` - a project with the code `bank`
- `/projects/bank/environments/dev` - an environment with the code `dev` that exists within the project `bank`

Under projects, environments, or assets a number of other paths are supported, these include:

- `/actions/{{action}}`, for example `/actions/destroy` is a path to enforce authorisation on changes and steps with the code `destroy`. You can use just `/actions` to block access to all actions.
- `/authorisation_policies` - access to the authorisation policies for the given resource. `read` allows viewing them, `update` allows managing them.
- `/git_remotes`
- `/properties`
- `/scheduled_activities`
- `/settings`
- `/templates`
- `/workflows/{{workflow code}}`, for example `/workflows/my-workflow` is a path to enforce authorisation on the workflow with the code `my-workflow`. You can use just `/workflows` to block access to all workflows. This will also block access to the workflow runs belonging to the workflows that match the path.

### Top-level paths

Aside from resource-specific paths, you can also secure these top-level paths, which take effect for the entire application:

- `/admin` - access to the admin endpoints and data cleanup endpoints. Some of the operations beneath it can be secured on their own - see [administration sub-paths](#administration-sub-paths) below.
- `/authorisation_policies` - access to see and manage authorisation policies. `read` permission allows a user to view the policies and their rules, `update` permission allows them to be changed. This path must be granted explicitly - a rule on the root path does not cover it. If the policy contains rules for a resource the user has no permission to modify authorisation policies for, they will not be able to see the policy.
- `/events` - access to view the audit history.
- `/log_lines` - access to log lines in general. Can be appended with the action to filter log lines for a specific action name. For example `/log_lines/update_passwords` is a path that will prevent access to logs for the `update_passwords` action.
- `/system_configuration` - access to see and manage system configuration.
- `/workflows` - access for workflows in general. Will also manage access to the workflow runs belonging to the workflows matching the path. Can be appended with the workflow code to filter the workflows that the user has access to.

### Administration sub-paths

Some of the operations under `/admin` can be secured individually, so that access to see part of the instance's state does not have to carry the ability to act on it, or to read what it contains:

- `/admin/pods` - `read` allows [listing the pods](/getting-started/familiarisation/gui/pods.md) running in the OpsChain namespace.
- `/admin/pods/logs` - `read` allows opening an individual pod's log. A pod's log is whatever the process wrote - on a change pod, the output of a change - where the listing is only names and states, so an instance can hand out the pod list without handing out its contents.
- `/admin/deployments` - `read` allows [listing the deployments](/getting-started/familiarisation/gui/deployments.md) making up the instance.
- `/admin/deployments/restart` - `update` allows performing a rolling restart of a deployment.
- `/admin/deployments/scale` - `update` allows changing the number of replicas a deployment runs.

As elsewhere, the closest matching rule wins, so these paths need no rule of their own to work. A rule granting `read` on `/admin` reaches the pod and deployment listings, and one granting `update` on `/admin` reaches restart and scale. Their purpose is to let you withhold one operation without withholding the rest: a rule denying `update` on `/admin/deployments/scale` outranks the broader `/admin` grant for scaling alone, and leaves restart and everything else under `/admin` untouched.

Restart and scale are deliberately separate paths rather than one shared check, because an operator trusted to recycle a wedged deployment is not necessarily trusted to resize one.

:::note
`/admin/deployments` has no `update` operation of its own - nothing writes a deployment resource - so a rule granting or denying `update` there only ever stands in for the operations beneath it. To withhold just one, write the rule on `/admin/deployments/restart` or `/admin/deployments/scale`.
:::

### Secret access paths

Access to the values held in the [secret vault](/setup/configuration/encryption-and-secrets.md) is controlled separately from access to the properties and settings that reference them. Reading a node, its properties or its settings shows a secret's reference, but never resolves it - so widening a user's read access can never expose the contents of the vault.

Resolving a secret requires the `execute` action on a secrets path:

- `/secrets` - the root of the secrets hierarchy. `execute` here resolves any secret anywhere in OpsChain.
- `{{node path}}/secrets` - every secret belonging to that node, for example `/projects/bank/environments/dev/secrets`.
- `{{node path}}/properties/secrets` and `{{node path}}/settings/secrets` - only the secrets referenced by that node's properties or settings respectively. A `{{node path}}/mintmodel/secrets` path is also supported for the secrets referenced by a node's MintModel.

A rule must end at one of these paths to grant anything. `execute` on `{{node path}}/settings`, or on a rule with a blank path, grants no secret access at all.

#### How secret access is inherited

Secrets paths are inherited down the node tree, so granting a team secret access on a project covers every environment and asset beneath it without needing a rule on each one. As elsewhere, the closest matching rule wins, and within a node the properties, settings and MintModel paths are more specific than the node path itself.

For example, when resolving a secret referenced by the settings of the `dev` environment in the `bank` project, OpsChain uses the first of these paths a rule exists for:

1. `/projects/bank/environments/dev/settings/secrets`
2. `/projects/bank/environments/dev/secrets`
3. `/projects/bank/settings/secrets`
4. `/projects/bank/secrets`
5. `/settings/secrets`
6. `/secrets`

This makes the usual least-privilege shape expressible - deny `execute` on `/secrets` globally, then grant it on the one project a team is responsible for. Equally, a deny on `/projects/bank/settings/secrets` overrides a grant on `/projects/bank/secrets`, leaving that project's property and MintModel secrets resolvable while its settings secrets are not.

#### Writing to the vault

Storing a value in the vault requires the `update` action on `/secrets`. This covers storing a text value or a file, uploading a file property with a secret path, and using the AES encryption tool. Unlike resolving a secret, it is not inherited: `update` on a node's secrets path does not permit writing, and no other path grants it.

### Authorisation policies

Authorisation rules must be applied to users in order to be effective. An authorisation policy can apply a set of rules to specific users via their LDAP username or group name.

- If an authorisation policy is assigned to a username, then that policy's rules will only apply to the user with the matching username.
- If an authorisation policy is assigned to a group name, then that policy's rules will apply to all users that are part of that LDAP group.
- If an authorisation policy is assigned to an empty username and group name, then that policy's rules will apply to all users.
- If an authorisation policy is assigned to a username and a group name, then that policy's rules will apply to that user only if they are a member of that group.

Authorisation policies can share authorisation rules and multiple policies can be assigned to a user or an LDAP group.

### Special policies

OpsChain provides two special policies that can be applied to any user, at any moment.

#### Superuser policy

This policy provides full permissions to all resources within OpsChain. This policy is the recommended approach when provisioning OpsChain for the first time. We refer to users with this policy as **superusers**. This policy trumps all other policies, except the [block user access policy](#block-user-access-policy).

To make an existing user a superuser, assign them to the superuser policy from the [_Users_ tab](#users).

:::caution[Security risk]
It is recommended to keep the number of users with superuser access as minimal as possible.
:::

#### Block user access policy

This policy blocks access to all resources within OpsChain. This policy is the recommended approach when you want to fully block access to OpsChain for certain users. This policy can be applied from the [_Users_ tab](#users). This policy trumps all other policies, including the [superuser policy](#superuser-policy).

## Manage security policies

When on this page, you will be taken to the _Manage security -> Policies_ screen by default.

<p align='center'>
  <img alt='Manage security screen' src={require('!url-loader!./images/manage-security-policies.png').default} className='image-border'/>
</p>

Each row includes:

| Column              | Description                                                             |
|---------------------|-------------------------------------------------------------------------|
| **Name**            | The name describing the purpose of the security policy.                 |
| **Description**     | Provides a short summary or purpose of the security policy.             |
| **Created by**      | The user who created the security policy.                               |
| **Created at**      | Timestamp for when the security policy was created.                     |
| **Updated at**      | Timestamp for when the security policy was last updated.                |
| **System**          | Whether it is a system-generated policy or a user-generated one.        |

### Buttons & links

| Buttons & links               | Function                                                  |
|-------------------------------|-----------------------------------------------------------|
| **Search bar**                | Filter the contents of the table based on these criteria. |
| **Columns**                   | Hide or display columns in the table.                     |
| **Create policy**             | Create a new security policy.                             |

### Creating a security policy

<p align='center'>
  <img alt='Manage security create policy screen' src={require('!url-loader!./images/manage-security-create-policy.png').default} className='image-border'/>
</p>

To create a new policy, follow these steps:

1. Click on the _Create policy_ button
2. Fill in the policy name, and optionally a description
3. Click the _Create policy_ button. The new policy will appear on the policies list. You can now start adding rules and assigning permissions within that policy.

### Managing policy rules

Once you've created a security policy, you can begin adding rules to it. Available resource paths are listed on the right side of the screen. To add a path to the policy, hover over the desired path and click the _Add to policy_ button. The selected path will then appear on the left side of the screen, where you can configure its `read`, `update`, and `execute` permissions.

<p align='center'>
  <img alt='Manage policy rules screen' src={require('!url-loader!./images/manage-policy-rules.png').default} className='image-border'/>
</p>

You can add custom path rules by clicking on the _Add custom path_ button.

### Managing policy assignments

To activate a security policy, you must assign it to users and/or groups. Click on the _Assignments_ tab to do so. This tab displays a list of users and groups currently associated with the policy.

<p align='center'>
  <img alt='Manage policy assignments screen' src={require('!url-loader!./images/manage-policy-assignments.png').default} className='image-border'/>
</p>

#### Modifying policy assignments

<p align='center'>
  <img alt='Modify policy assignments screen' src={require('!url-loader!./images/manage-policy-edit-assignments.png').default} className='image-border'/>
</p>

To add a user or group to the policy, follow these steps:

1. Click on the _Add users/groups_ button.
2. You will be given an option to select a user or a group.
3. Fill in the username or group name.
4. You can add more users or groups by clicking on the _Add assignee_ button.
5. Click on the _Add_ button to include the assignments in the policy.

To remove a user or group from the policy, follow these steps:

1. Select the assignments in the table.
2. Click on the _Bulk actions_ dropdown.
3. Select the _Remove assignees_ option.
4. Click on the _Remove_ button to confirm the removal of the assignments from the policy.

## Users

This tab contains the users and the policies that are assigned to them.

<p align='center'>
  <img alt='Manage security users screen' src={require('!url-loader!./images/manage-security-users.png').default} className='image-border'/>
</p>

| Column              | Description                                                               |
|---------------------|---------------------------------------------------------------------------|
| **Username**        | The name or identifier of the user.                                       |
| **Policies**        | Security policies currently assigned to the user.                         |
| **Auth provider**   | The authentication source used to validate the user's identity.           |
| **Groups**          | List of LDAP groups that this user belongs to.                            |
| **Created at**      | Timestamp for when the user was created.                                  |
| **Updated at**      | Timestamp for when the user was last updated.                             |

### Buttons & links

| Buttons & links               | Function                                                  |
|-------------------------------|-----------------------------------------------------------|
| **Search bar**                | Filter users by their username.                           |
| **Columns**                   | Hide or display columns in the table.                     |

## Groups

This tab contains the list of LDAP groups.

<p align='center'>
  <img alt='Manage security groups screen' src={require('!url-loader!./images/manage-security-groups.png').default} className='image-border'/>
</p>

| Column              | Description                                                        |
|---------------------|--------------------------------------------------------------------|
| **CN**              | The Common Name (CN) of the LDAP group.                            |
| **ID**              | The full LDAP Distinguished Name (DN) of the group.                |
| **Alternative CN**  | An optional alternative name or alias for the LDAP group.          |

### Buttons & links

| Buttons & links               | Function                                                  |
|-------------------------------|-----------------------------------------------------------|
| **Search bar**                | Filter groups by their CN, ID and alternative CN.         |
| **Columns**                   | Hide or display columns in the table.                     |
