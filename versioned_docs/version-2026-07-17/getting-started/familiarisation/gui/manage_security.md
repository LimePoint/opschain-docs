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
- `/authorisation_policies` - access to manage authorisation policies for the given resource. To create rules for a resource, users must also have `read` permission to it.
- `/git_remotes`
- `/properties`
- `/scheduled_activities`
- `/settings`
- `/templates`
- `/workflows/{{workflow code}}`, for example `/workflows/my-workflow` is a path to enforce authorisation on the workflow with the code `my-workflow`. You can use just `/workflows` to block access to all workflows. This will also block access to the workflow runs belonging to the workflows that match the path.

### Top-level paths

Aside from resource-specific paths, you can also secure these top-level paths, which take effect for the entire application:

- `/admin` - access to the admin endpoints and data cleanup endpoints.
- `/authorisation_policies` - access to see and manage authorisation policies. Users must be given `update` permission to see the policies. If the policy contains rules for a resource the user has no permission to modify authorisation policies for, they will not be able to see the policy.
- `/events` - access to view the audit history.
- `/log_lines` - access to log lines in general. Can be appended with the action to filter log lines for a specific action name. For example `/log_lines/update_passwords` is a path that will prevent access to logs for the `update_passwords` action.
- `/system_configuration` - access to see and manage system configuration.
- `/workflows` - access for workflows in general. Will also manage access to the workflow runs belonging to the workflows matching the path. Can be appended with the workflow code to filter the workflows that the user has access to.

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
