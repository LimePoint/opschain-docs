---
sidebar_position: 14
description: Managing security with OpsChain
---

# Security reference

OpsChain supports granular authorisation.

Authorisation is implemented through [authorisation rules](#authorisation-rules), and then these rules are applied to different users via [authorisation rule mappings](#authorisation-rule-mappings).

## Authorisation rules

Authorisation rules apply a deny or allow `permission` to a certain `action` (`read`, `update`, or `execute`) for a particular `path`.

Paths are how OpsChain organises its projects, environments and assets. They are a unique form of addressing any of these objects and their relationships anywhere in the system.

:::note
Assets are only available in _enterprise_ projects.
:::

:::tip
If multiple authorisation rules match a path, and any of them are `deny`, then the user will be denied access to the target.
:::

### Actions

An authorisation rule affects what a user can do at a path. The supported actions are:

- `read` - whether the user can view the target, for example viewing the properties of an environment
- `update` - whether the user can create, update or delete the target, for example creating a project
- `execute` - whether the user can execute the target, for example executing a change or workflow

### Paths

The path for a project, environment, or asset is the path that it is accessed via in the GUI or API. Examples of paths are:

- `/projects/bank` - a project with the code `bank`
- `/projects/bank/environments/dev` - an environment with the code `dev` that exists within the project `bank`

Under projects, environments, or assets a number of other paths are supported, these include:

- `/actions/{{action}}`, for example `/actions/destroy` is a path to enforce authorisation on changes, steps and workflows with the code `destroy`
- `/automated_change_rules`
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

## Authorisation rule mappings

An authorisation rule must be applied to users in order to be effective.

An authorisation rule mapping can apply a rule to all users, or to specific users via their LDAP username or group name.

If an authorisation rule mapping has a username, then that rule will only apply to the user with the matching username.

If an authorisation rule mapping has a group name, then that rule will apply to all users that are part of that LDAP group.

If an authorisation rule mapping does not have a username or a group name, then that rule will apply to all users.

:::warning
An authorisation rule mapping can have a username and a group name, and in that case it would only apply to that user if they were a member of that group.
:::

## Viewing current authorisation rules and mappings

The currently applied authorisation rules can be seen from the "manage security" screen in the GUI, and can be viewed and managed via the [API](https://docs.opschain.io/api-docs/#tag/Authorisation-rules).
