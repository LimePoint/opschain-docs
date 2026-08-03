---
sidebar_position: 3
description: Configure OpsChain's LDAP cache and learn how to connect OpsChain to an external LDAP/AD for user authentication and authorisation.
---

# OpsChain LDAP

OpsChain can utilise an LDAP database for user authorisation and authentication. After following this guide you should know how to:

- adjust OpsChain's LDAP group membership caching feature
- review OpsChain's periodic directory synchronisation and interpret the events it records
- configure OpsChain to use an external LDAP/AD database

---

## LDAP group membership caching

By default, OpsChain will cache a user's LDAP group membership for 1 minute to reduce the volume of LDAP requests.

### Disable caching

To disable group membership caching, update the system configuration settings with `"ldap": { "cache_ttl": 0 }`.

### Increase cache life

To increase the cache life, update the system configuration settings with the number of seconds you require the cache to be valid. The following example would increase the cache life to 5 minutes.

```json
{
  "ldap": { "cache_ttl": 300 }
}
```

---

## Directory synchronisation

Separately from the short-lived group membership cache above, OpsChain periodically reads the directory in full and stores the result. This stored copy is what resolves a user's LDAP group memberships for security policy assignments, decides who can satisfy an `ldap_groups` approval requirement, and supplies the email addresses used to notify a group's members. It is refreshed every [`ldap.refresh_interval`](/key-concepts/settings.md#ldaprefresh_interval) seconds, and can be refreshed on demand from the **Security** page in the GUI.

Only the handful of attributes OpsChain actually reads are requested from the directory — the configured user, mail and group attributes, plus `cn`, `objectclass` and `description`. Directories commonly hold dozens of attributes per entry, so this keeps both the load on the directory and the size of the stored copy down.

### Reviewing a synchronisation

Each synchronisation records an event describing what it did, which is the place to look when LDAP group membership or notifications are not behaving as expected. The event reports:

- how many user and group entries were read, or retained from the previous synchronisation
- how many users had their email address updated from the directory
- how many OpsChain users the directory did not return, and a sample of their usernames
- any attribute whose value could not be stored, by attribute name

Read together these separate two problems that otherwise look identical. Users the directory did not return point at the search itself — a `user_base` or user filter too narrow to include them, or a user attribute that is not the one the directory names its entries by. Users that were returned but whose email addresses were not updated point at the mail attribute instead.

The event type reflects the outcome: `api:ldap_refresh:success` when the synchronisation completed normally, `api:ldap_refresh:warn` when it deliberately kept part of the previous result (see below), and `api:ldap_refresh:error` when cached entries were lost. If you alert on LDAP synchronisation, alert on the error type — a warning means nothing was lost.

### Empty search results

A search that succeeds but returns no entries is indistinguishable from a filter that no longer matches anything, or a directory answering successfully with nothing at all. Rather than treat that as an instruction to forget every user and group it knows about, OpsChain keeps what it already has and records a warning.

This matters because discarding the stored directory withdraws every LDAP group membership at once: security policies assigned to an LDAP group stop granting anything, and a change waiting on an `ldap_groups` approval can no longer be approved by anybody.

The wait is bounded. If several consecutive synchronisations return nothing, the empty result is eventually accepted and the entries are removed, so a genuinely emptied directory settles without intervention. Removal is reported as `api:ldap_refresh:error`.

:::note
If you have deliberately emptied a filter or moved your users, expect warning events until the bound is reached, after which the stored copy is cleared and synchronisation returns to reporting success.
:::

---

## Configuring an external LDAP

This guide takes you through how to use an external LDAP server with OpsChain.

After following this guide you should know how to:

- configure OpsChain to use an external LDAP server for authentication
- disable the supplied OpsChain LDAP server

### Disable the supplied OpsChain LDAP server

By default, OpsChain provides a bundled LDAP server for user authentication. To disable the bundled LDAP server, edit `values.yaml` and alter the `ldap.enabled` setting to be false.

```yaml
  ldap:
    enabled: false
```

:::note
The setting will only be applied after redeploying OpsChain. In high-availability clusters, this change must be performed in each cluster's `values.yaml` file.
:::

### Alter the OpsChain LDAP configuration

See the [configuring OpsChain](/setup/configuration/additional-settings.md#ldapad-settings) guide for details of the LDAP settings that can be adjusted to enable the use of an external LDAP server. Update the [system configuration settings](/setup/configuration/additional-settings.md#post-install-system-configuration) with the relevant LDAP options to override the default values.

The settings that describe how OpsChain connects to LDAP (host, port, base DN, admin, password, attribute mappings, etc.) are editable and apply live across all clusters as soon as they are saved — no OpsChain API restart is required. The bundled OpsChain LDAP server's domain, organisation and log level are managed by the deployment and can only be changed in your `values.yaml` file.

:::info
An example [Active Directory configuration](#example-active-directory-configuration) appears at the end of this document.
:::

### Example Active Directory configuration

The following example settings allow OpsChain to utilise an Active Directory for user authentication:

```json
{
  "ldap": {
    "host": "ad-server",
    "port": 389,
    "domain": "myopschain.io",
    "base_dn": "DC=myopschain,DC=io",
    "user_base": "CN=Users,DC=myopschain,DC=io",
    "user_attribute": "sAMAccountName",
    "group_base": "DC=myopschain,DC=io",
    "group_attribute": "member",
    "admin": "CN=Administrator,CN=Users,DC=myopschain,DC=io",
    "password": "AdministratorPassword!",
    "hc_user": ""
  }
}
```

Optionally, the following within the `.env` section of your `values.yaml` file will provide the same functionality from installation:

```yaml
env:
  OPSCHAIN_LDAP_HOST: "ad-server"
  OPSCHAIN_LDAP_PORT: 389
  OPSCHAIN_LDAP_DOMAIN: "myopschain.io"
  OPSCHAIN_LDAP_BASE_DN: "DC=myopschain,DC=io"
  OPSCHAIN_LDAP_USER_BASE: "CN=Users,DC=myopschain,DC=io"
  OPSCHAIN_LDAP_USER_ATTRIBUTE: "sAMAccountName"
  OPSCHAIN_LDAP_GROUP_BASE: "DC=myopschain,DC=io"
  OPSCHAIN_LDAP_GROUP_ATTRIBUTE: "member"
  OPSCHAIN_LDAP_ADMIN: "CN=Administrator,CN=Users,DC=myopschain,DC=io"
  OPSCHAIN_LDAP_PASSWORD: "AdministratorPassword!"
  OPSCHAIN_LDAP_HC_USER: ""
```
