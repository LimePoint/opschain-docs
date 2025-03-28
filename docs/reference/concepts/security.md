---
sidebar_position: 14
description: Managing security with OpsChain
---

# Security reference

OpsChain supports granular authorisation.

Authorisation is implemented through [authorisation rules](#authorisation-rules), and then these rules are applied to different users via [authorisation policies](#authorisation-policies).

## Authorisation rules

Authorisation rules apply a deny or allow `permission` to a certain `action` (`read`, `update`, or `execute`) for a particular `path`.

Paths are how OpsChain organises its projects, environments and assets. They are a unique form of addressing any of these objects and their relationships anywhere in the system.

:::note
Assets are only available in _enterprise_ projects.
:::

### Rules logic

#### Read access

If multiple `read` access rules match a path, and any of them are `deny`, then the user will be denied access to the target.

For example, if you are accessing `soa` and the following read rules are applied to the user:

- `/projects/bank`
- `/projects/bank/environments/dev`
- `/projects/bank/environments/dev/assets/soa`

All of these three rules must have allow access in order to get to `soa`. If either of these rules have a `deny` access, then the target `soa` will be inaccessible.

:::tip
In cases of emergency access (e.g. blacklist a user from accessing anything), you can have a rule that denies read access on a top level path (e.g. `/projects`) and then [apply](#authorisation-policies) that rule to the user.
:::

#### Update and execute access

OpsChain will deny update and execute access by default. However, the rule that matches closest to the target is the active rule and overrides any other rule above the path hierarchy, provided that there is a `read` access to that path.

For example, if you are accessing `soa` and the following update/execute rules are applied to the user:

- `/projects/bank`
- `/projects/bank/environments/dev`
- `/projects/bank/environments/dev/assets/soa`

The target `soa` must be [readable](#read-access) first (e.g. there is no deny `read` access to the target and its parents).

The target `soa`'s `update` or `execute` access is then determined on the update/execute rule that was set on `/projects/bank/environments/dev/assets/soa`, regardless of the update/execute rule applied to its parents.

If the target doesn't have a update/execute rule specified, it will search for that rule starting from its closest parent and apply that one.

In the above example, if the target `soa` doesn't have an update/execute rule of its own, it will start searching for the rule starting from `/projects/bank/environments/dev`, then `/projects/bank/`. If no rule was found, it will deny the update/execute access to the target.

### Rule name

When creating an authorisation rule, a rule name is required to describe what the authorisation rule is for.

### Actions

An authorisation rule affects what a user can do at a path. The supported actions are:

- `read` - whether the user can view the target, for example viewing the properties of an environment
- `update` - whether the user can create, update or delete the target, for example creating a project
- `execute` - whether the user can execute the target, for example executing a change or workflow

### Paths

#### Project paths

The path for a project, environment, or asset is the path that it is accessed via in the GUI or API. Examples of paths are:

- `/projects/bank` - a project with the code `bank`
- `/projects/bank/environments/dev` - an environment with the code `dev` that exists within the project `bank`

Under projects, environments, or assets a number of other paths are supported, these include:

- `/actions/{{action}}`, for example `/actions/destroy` is a path to enforce authorisation on changes, steps and workflows with the code `destroy`
- `/scheduled_activities`
- `/changes`
- `/git_remotes`
- `/log_lines/{{action}}`, for example `/log_lines/update_passwords` is a path that will prevent access to logs for the `update_passwords` action. Users will still see logs returned, but they won't contain the original log results and will instead be redacted
- `/properties`
- `/settings`
- `/templates`
- `/workflows`
- `/workflow_runs`

Paths are matched as patterns (like regular expressions) and will apply to child paths by default.

:::tip
To prevent a nested path potentially matching incorrectly (e.g. a rule for `/changes` that should not match with `/environments/changes`, `/projects/changes` or `/projects/bank/environments/dev/changes`), paths are started with `^(/[^/]+/[^/]+)*` to ensure that the match is against the type, not the code.
:::

#### Other paths

Aside from project paths, you can also secure these other API endpoints:

- `/authorisation_rules`
- `/authorisation_policies`
- `/events`
- `/users`
- `/groups`

## Authorisation policies

Authorisation rules must be applied to users in order to be effective. An authorisation policy can apply a set of rule to all users, or to specific users via their LDAP username or group name.

If an authorisation policy is assigned to a username, then that policy's rules will only apply to the user with the matching username.

If an authorisation policy is assigned to a group name, then that policy's rules will apply to all users that are part of that LDAP group.

If an authorisation policy is assigned to an empty username and group name, then that policy's rules will apply to all users.

If an authorisation policy is assigned to a username and a group name, then that policy's rules will apply to that user only if they are a member of that group.

Authorisation policies can share authorisation rules and multiple policies can be assigned to a user or an LDAP group.

A sample policy can be generated by running the command:

```bash
opschain server utils setup_sample_auth
```

This will create a policy that allows everyone in the system to read, update and execute all actions except manage authorisation policies and rules.

### Authorisation policy for superusers

To create a superuser in OpsChain, execute:

```bash
opschain server utils "setup_superuser[opschain]"
```

This will create (if it doesn't exist) a superuser policy and assign it to the user `opschain`.

### Restoring authorisation endpoints access

In case an admin is unable to read, create or update authorisation policies and rules, you can restore that user's access by running the command:

```bash
opschain server utils "restore_auth_endpoint_access[opschain]"
```

This will remove the user `opschain` from any authorisation policy that contains rules which deny access to the endpoints `/authorisation_rules` or `/authorisation_policies`.

:::warning
This command will also delete policy assignments that apply to `everyone` if necessary. The command accepts an optional `dry_run` argument to execute it without actually making changes to the system. To do so, run the command as:

```bash
opschain server utils "restore_auth_endpoint_access[opschain,true]"
```

:::

## Viewing current authorisation rules and authorisation policies

The currently applied authorisation rules can be seen from the "manage security" screen in the GUI, and can be viewed and managed via the [API](https://docs.opschain.io/api-docs/#tag/Authorisation-rules).

The authorisation policies, their rules and user assignments can be managed via the [API](https://docs.opschain.io/api-docs/#tag/Authorisation-policies).
