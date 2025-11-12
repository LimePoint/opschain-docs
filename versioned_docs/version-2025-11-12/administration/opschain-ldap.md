---
sidebar_position: 4
description: Configure OpsChain's LDAP cache and learn how to connect OpsChain to an external LDAP/AD for user authentication and authorisation.
---

# OpsChain LDAP

OpsChain can utilise an LDAP database for user authorisation and authentication. After following this guide you should know how to:

- adjust OpsChain's LDAP group membership caching feature
- configure OpsChain to use an external LDAP/AD database

---

## LDAP group membership caching

By default, OpsChain will cache a user's LDAP group membership for 1 minute to reduce the volume of LDAP requests.

### Disable caching

To disable group membership caching, update the system configuration settings with `"ldap": { "cache_ttl": 0 }` and [restart the OpsChain API](#restart-opschain-api).

### Increase cache life

To increase the cache life, update the system configuration settings with the number of seconds you require the cache to be valid. The following example would increase the cache life to 5 minutes.

```json
{
  "ldap": { "cache_ttl": 300 }
}
```

---

## Configuring an external LDAP

This guide takes you through how to use an external LDAP server with OpsChain.

After following this guide you should know how to:

- configure OpsChain to use an external LDAP server for authentication
- disable the supplied OpsChain LDAP server

### Disable the supplied OpsChain LDAP server

By default, OpsChain will use the LDAP server in the `opschain-ldap` pod for user authentication. To disable the opschain-ldap service, edit `values.yaml` and alter the `ldap` `enabled` setting to be false.

```yaml
  ldap:
    enabled: false
```

:::note
This setting will be applied to the Kubernetes cluster when you [restart OpsChain API](#restart-opschain-api) after altering the LDAP configuration.
:::

### Alter the OpsChain LDAP configuration

See the [configuring OpsChain](/setup/understanding-opschain-variables.md#ldapad-settings) guide for details of the LDAP settings that can be adjusted to enable the use of an external LDAP server. Update the [system configuration settings](/setup/understanding-opschain-variables.md#post-install-system-configuration) with the relevant LDAP options to override the default values.

Optionally, on installation, edit your `.env` file, adding the relevant LDAP options to override the default values supplied in `.env.internal`.

:::info
An example [Active Directory configuration](#example-active-directory-configuration) appears at the end of this document.
:::

### Restart OpsChain API

Restart the OpsChain API server to allow the new LDAP configuration to take effect.

```bash
kubectl rollout restart -n opschain deployment.apps/opschain-api
```

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

Optionally, the following example `.env` values will provide the same functionality from installation:

```dotenv
OPSCHAIN_LDAP_HOST=ad-server
OPSCHAIN_LDAP_PORT=389
OPSCHAIN_LDAP_DOMAIN=myopschain.io
OPSCHAIN_LDAP_BASE_DN=DC=myopschain,DC=io
OPSCHAIN_LDAP_USER_BASE=CN=Users,DC=myopschain,DC=io
OPSCHAIN_LDAP_USER_ATTRIBUTE=sAMAccountName
OPSCHAIN_LDAP_GROUP_BASE=DC=myopschain,DC=io
OPSCHAIN_LDAP_GROUP_ATTRIBUTE=member
OPSCHAIN_LDAP_ADMIN=CN=Administrator,CN=Users,DC=myopschain,DC=io
OPSCHAIN_LDAP_PASSWORD=AdministratorPassword!
OPSCHAIN_LDAP_HC_USER=
```
