---
sidebar_position: 2
description: An overview of the components that make up OpsChain.
---

# Architecture overview

OpsChain provides a fully self-contained environment consisting of the command line interface (CLI), web user interface (UI), API server, PostgreSQL database, Fluentd log aggregator, Open Policy Agent authorisation server and an optional LDAP server. The [configuring an external LDAP](/operations/opschain-ldap.md#configuring-an-external-ldap) guide provides instructions to swap out the OpsChain LDAP and integrate with a centralised LDAP or Active Directory server.

Each part of this environment is deployed using [Kubernetes](https://kubernetes.io/).

<p align='center'>
  <img alt='OpsChain containers' src={require('!url-loader!./opschain-release-containers.svg').default} />
</p>

- **CLI** is a command line client that can be used to interact with the API, packaged as a container for ease of use - with native clients available for Windows, macOS & Linux
- **web UI** is a web browser interface that can also be used to interact with the API
- **API** is a [RESTful](https://en.wikipedia.org/wiki/Representational_state_transfer) API that uses the [json:api](https://jsonapi.org/) format
- **API-worker** is a collection of containers responsible for processing changes
- **auth** is the inbuilt authorisation server used by the API
- **DB** is the inbuilt database used by both the API and its workers
- **LDAP** is a lightweight LDAP server that is used for authentication (can be configured to use an external LDAP provider such as Active Directory or OpenLDAP)
- **log-aggregator** accepts log output from the workers and ships it to the API where it can then be accessed
- **runner** represents the transient containers that will be spawned by the api-workers to complete each step of a change
