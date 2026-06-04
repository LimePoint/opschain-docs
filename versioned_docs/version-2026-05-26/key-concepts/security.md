---
sidebar_position: 12
description: Learn about how security is handled in OpsChain
---

# Security reference

This guide provides an overview of the authorisation model used in OpsChain.

After following this guide you should know:

- how authorisation works in OpsChain
- how to create, list and delete authorisation policies and rules
- how to restore access to authorisation endpoints for a user

## Overview

OpsChain provides a granular, top-down authorisation model for each of its resources. Security is controlled by applying rules to hierarchical paths, and permissions are inherited from parent paths unless explicitly overridden.

This model is built on two core concepts:

- **Authorisation Rules:** These define *what* action (`read`, `update`, `execute`) is allowed or denied on a specific resource *path*.
- **Authorisation Policies:** These link the rules to users and groups, defining *who* the permissions apply to.

:::note
In this particular guide, we refer to anything you can manage in OpsChain as a resource. It is important to note that this is not the same as the [resource concept](/key-concepts/overview.md#resource) in OpsChain.
:::

## How permissions are evaluated

By default, no rules and policies are applied to any user, meaning that no user has any permissions to any resource in OpsChain by default.

OpsChain evaluates permissions based on the path to a resource and the rules applied to the user. The rules that take precedence are the ones that most closely matches the target resource path.

For example, to execute a change on the `soa` asset, OpsChain will look for the most specific rule that applies to that path.

- If a rule exists for `/projects/bank/environments/dev/assets/soa`, that rule will be used, regardless of the rules on its parent paths.
- If no rule is found for the asset itself, OpsChain will check its parent `/projects/bank/environments/dev`, and so on up the hierarchy.
- If no applicable `allow` rule is found at any level, the action is denied.

## Authorisation rules

Authorisation rules apply a deny or allow permission to a certain action (`read`, `update`, or `execute`) for a particular path.

### Actions

An authorisation rule affects what a user can do at a path. The supported actions are:

- `read` - whether the user can view the target, for example viewing the properties of an environment
- `update` - whether the user can create, update or delete the target, for example creating a project
- `execute` - whether the user can execute the target, for example executing a change or a workflow

:::info[Action precedence]
When either the `update` or `execute` actions are enabled, the `read` action is automatically assigned to the same path.
:::

### Paths

#### Resource paths

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

#### Top-level paths

Aside from resource-specific paths, you can also secure these top-level paths, which take effect for the entire application:

- `/admin` - access to the admin endpoints and data cleanup endpoints.
- `/authorisation_policies` - access to see and manage authorisation policies. Users must be given `update` permission to see the policies. If the policy contains rules for a resource the user has no permission to modify authorisation policies for, they will not be able to see the policy.
- `/events` - access to view the audit history.
- `/log_lines` - access to log lines in general. Can be appended with the action to filter log lines for a specific action name. For example `/log_lines/update_passwords` is a path that will prevent access to logs for the `update_passwords` action.
- `/system_configuration` - access to see and manage system configuration.
- `/workflows` - access for workflows in general. Will also manage access to the workflow runs belonging to the workflows matching the path. Can be appended with the workflow code to filter the workflows that the user has access to.

## Authorisation policies

Authorisation rules must be applied to users in order to be effective. An authorisation policy can apply a set of rule to specific users via their LDAP username or groupname.

- If an authorisation policy is assigned to a username, then that policy's rules will only apply to the user with the matching username.
- If an authorisation policy is assigned to a group name, then that policy's rules will apply to all users that are part of that LDAP group.
- If an authorisation policy is assigned to an empty username and group name, then that policy's rules will apply to all users.
- If an authorisation policy is assigned to a username and a group name, then that policy's rules will apply to that user only if they are a member of that group.

Authorisation policies can share authorisation rules and multiple policies can be assigned to a user or an LDAP group.

### Special policies

OpsChain provides two special policies that can be applied to any user, at any moment.

#### Superuser policy

This policy provides full permissions to all resources within OpsChain. This policy is the recommended approach when provisioning OpsChain for the first time. We refer to users with this policy as **superusers**. This policy trumps all other policies, except the [block user access policy](#block-user-access-policy).

To make an existing user a superuser, you can assign them to the policy via the [manage security](/getting-started/familiarisation/gui/manage_security.md) page or run the following command via `kubectl`:

```bash
kubectl exec -n ${KUBERNETES_NAMESPACE} deploy/opschain-api -- /usr/bin/container_start.sh "rake release:setup_superuser[username]"
```

:::caution[Security risk]
It is recommended to keep the number of users with superuser access as minimal as possible.
:::

#### Block user access policy

This policy blocks access to all resources within OpsChain. This policy is the recommended approach when you want to fully block access to OpsChain for certain users. This policy can be applied via the [manage security](/getting-started/familiarisation/gui/manage_security.md) page. This policy trumps all other policies, including the [superuser policy](#superuser-policy).

:::caution[Lost access]
If you need to restore access to the security endpoints for a user, you can [restore the authorisation endpoints access](#restoring-authorisation-endpoints-access) for that user.
:::

### Restoring authorisation endpoints access

In case a user is wrongfully blocked from accessing the security endpoints, you can restore that user's access by running the command:

```bash
kubectl exec -n ${KUBERNETES_NAMESPACE} deploy/opschain-api -- /usr/bin/container_start.sh "rake release:restore_auth_endpoint_access[username]"
```

This will remove the user `username` (or any of the LDAP groups they belong to) from any authorisation policy that contains rules which deny access to the endpoints `/authorisation_rules` or `/authorisation_policies`.

## Viewing current authorisation rules and authorisation policies

The authorisation rules and policies present in the system can be viewed and managed in the [manage security](/getting-started/familiarisation/gui/manage_security.md) page in the GUI.
