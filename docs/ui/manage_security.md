---
sidebar_position: 10
description: ''
---

# Manage security

## Understanding the manage security screen

This page enables administrators to manage access control across different areas of the system, each represented by a hierarchical path identifier (e.g. `/projects/bank/assets`). Security policies are composed of authorisation rules that can be assigned to individual users or LDAP groups. These rules govern the scope and level of permissions granted, defining what actions users are allowed to perform within the system.

:::note
You will need to have admin privileges in order to access this page.
:::

## Manage security policies

When on this page, you will be taken to the Security management -> policies screen by default.

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
| **Columns**                   | Hide or display columns in the table.                     |
| **Search bar**                | Filter the contents of the table based on these criteria. |

### Creating a security policy

<p align='center'>
  <img alt='Manage security create policy screen' src={require('!url-loader!./images/manage-security-create-policy.png').default} className='image-border'/>
</p>

To create a new policy, follow these steps:

1. Click on the _create policy_ button.
2. Fill in the policy name, and optionally a description
3. Click the _Create policy_ button. The new policy will appear on the policies list. You can now start adding rules and assigning permissions within that policy.

### Managing policy rules

Once you've created a security policy, you can begin adding rules to it. Available resource paths are listed on the right side of the screen. To add a path to the policy, hover over the desired path and click the _Add to policy_ button. The selected path will then appear on the left side of the screen, where you can configure its `read`, `update`, and `execute` permissions.

<p align='center'>
  <img alt='Manage policy rules screen' src={require('!url-loader!./images/manage-policy-rules.png').default} className='image-border'/>
</p>

### Managing policy assignments

To activate a security policy, you must assign it to users and/or groups. Click on the _Assignments_ tab to do so. This tab displays a list of users and groups currently associated with the policy.

<p align='center'>
  <img alt='Manage policy assignments screen' src={require('!url-loader!./images/manage-policy-assignments.png').default} className='image-border'/>
</p>

#### Modifying policy assignments

<p align='center'>
  <img alt='Modify policy assignments screen' src={require('!url-loader!./images/manage-policy-edit-assignments.png').default} className='image-border'/>
</p>

To add/remove a user or group from the policy, follow these steps:

1. Click on the _Modify policy assignments_ button.
2. Click on the Add assignee.
3. You will be given an option to select a user or a group.
4. For existing assignments, there is a trash icon located on the right side if you need to remove that user/group from the policy.
5. Click on the _Update_ button to update the assignments.

## Security users

This tab contains the users and the policies that are assigned to it.

<p align='center'>
  <img alt='Manage security users screen' src={require('!url-loader!./images/manage-security-users.png').default} className='image-border'/>
</p>

| Column              | Description                                                               |
|---------------------|---------------------------------------------------------------------------|
| **Username**        | The name or identifier of the user.                                       |
| **Policies**        | Security policies currently assigned to the user.                         |
| **Auth provider**   | The authentication source used to validate the user's identity.           |
| **Groups**          | List of groups that this user belongs to.                                 |
| **Created at**      | Timestamp for when the user was created.                                  |
| **Updated at**      | Timestamp for when the user was last updated.                             |

### Buttons & links

| Buttons & links               | Function                                                  |
|-------------------------------|-----------------------------------------------------------|
| **Columns**                   | Hide or display columns in the table.                     |
| **Search bar**                | Filter the contents of the table based on these criteria. |

## Security groups

This tab contains the list of LDAP groups.

<p align='center'>
  <img alt='Manage security groups screen' src={require('!url-loader!./images/manage-security-groups.png').default} className='image-border'/>
</p>

| Column              | Description                                                        |
|---------------------|--------------------------------------------------------------------|
| **CN**              | The Common Name (CN) of the LDAP group.                            |
| **ID**              | The full LDAP Distinguished Name (DN) of the group.                |
| **Alternative CN**  | An optional alternative name or alias for the LDAP group.          |
| **Members**         | List of users or entities that belong to this LDAP grou            |

### Buttons & links

| Buttons & links               | Function                                                  |
|-------------------------------|-----------------------------------------------------------|
| **Columns**                   | Hide or display columns in the table.                     |
| **Search bar**                | Filter the contents of the table based on these criteria. |
