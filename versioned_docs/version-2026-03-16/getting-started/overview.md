---
sidebar_position: 1
#hide_table_of_contents: true
---

# Overview

[OpsChain](https://opschain.io) was developed to address the problem of managing change in a consistent and uniform way across on-premise, cloud, modern, and legacy platforms. Our objective is to unify people, process, and technology in order to simplify and reduce the operational complexities and costs of running and operating modern enterprise applications and systems in today's world.

OpsChain can be used from Mac, Linux and Windows.

OpsChain is deployed to Kubernetes. We can also provide a SaaS demo instance - [contact us](https://opschain.io/contact-us) if you would like to demo OpsChain.

## Architecture overview

OpsChain provides a fully self-contained environment consisting of the command line interface (CLI), web user interface (UI), API server, PostgreSQL database, Fluentd log aggregator, Open Policy Agent authorisation server and an optional LDAP server. The [configuring an external LDAP](/administration/opschain-ldap.md#configuring-an-external-ldap) guide provides instructions to swap out the OpsChain LDAP and integrate with a centralised LDAP or Active Directory server.

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

## [Familiarisation guides](../category/familiarisation)

Familiarisation guides for OpsChain to help you get started with the OpsChain GUI and CLI.

## [Tutorials](../category/tutorials)

A variety of step-by-step tutorials to understand how to use OpsChain and see it in action.

## [Key concepts documentation](../category/key-concepts)

OpsChain concepts, system architecture, actions and properties.

## [Administration guides](../administration)

Administration guides for OpsChain, including maintenance, security and other configurations.

## [Advanced guides](../category/advanced-guides)

Advanced guides for OpsChain, including containerised development environment, building container images and developing your own resources.

## [Troubleshooting](/troubleshooting.md)

Known issues and solutions.

## [Support](/support.md)

OpsChain support policy.

## [Changelog](/changelog.md)

New features, bug fixes and changes in OpsChain.

## [Licence](/licence.md)

OpsChain licence information.
