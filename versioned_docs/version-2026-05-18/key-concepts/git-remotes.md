---
sidebar_position: 9
description: Learn about managing remote Git repositories for your OpsChain projects.
---

# Git remotes

This guide takes you through the operations required for managing remote Git repositories for your OpsChain projects.

In OpsChain, a Git remote is a named reference to an actual [Git remote](https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes). It is used to securely store the credentials to access a Git repository from which you can run changes.

The Git repository is where you store the actions and related configuration. OpsChain will read all action and resource definitions from the `actions.rb` file in the repository root directory and the template's `actions.rb` file in their respective directories. See the [actions reference guide](/key-concepts/actions.md) for further information about the contents of the `actions.rb` file.

## Prerequisites

### Understanding Git revisions

import GitRevision from '/files/partials/git-revision.md'

<GitRevision />

### Authentication

#### GitHub authentication

If your Git repository is hosted on GitHub, you will need to authenticate with GitHub to access the repository. The service has discontinued password authentication, so if you don't already have one, you will need to create a [GitHub personal access token (PAT)](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token) and use it as your password.

#### SSH authentication

OpsChain also supports the use of [SSH keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account) for authentication. By default, OpsChain includes a bundled SSH `known_hosts` file which includes SSH keys for a number of common source code hosting platforms, including:

- Bitbucket
- GitHub
- GitLab

If you'd like to have support for other platforms, refer to the [customising the SSH `known_hosts` file](/setup/configuration/additional-settings.md#opschain_ssh_known_hosts_config_map) guide.

The Git remote is tested when you create the Git remote and, if your SSH key is not trusted by the `known_hosts` list, the remote will not be added.

## Creating a new Git remote

### Using the web UI

You can create new Git remotes via the web UI by navigating to the [Git remotes page](/getting-started/familiarisation/gui/projects/git_remotes.md) and clicking the `Add Git Remote` button.

### Using the CLI

Refer to the [CLI guide](/getting-started/familiarisation/cli/index.md#6-git-remotes) for more information on how to create a new Git remote via the CLI.

## Listing all Git remotes on a project

You can visit the [Git remotes page](/getting-started/familiarisation/gui/projects/git_remotes.md) inside a project to view all the active Git remotes for that project.

## Updating a Git remote

You can update a Git remote name and credentials both via the CLI and the web UI. Git remotes can also be archived so they won't be used by any future changes.

### Unarchiving a Git remote

Similar to [unarchiving projects, environments and assets](/key-concepts/archiving.md#unarchiving-projects-environments-and-assets), archiving a Git remote is intended as a one way process. If you need to unarchive a Git remote, you will need to interact directly with the API server. OpsChain will only allow unarchiving if the Git remote, with its saved url and credentials, is still accessible.

The following `curl` command will unarchive a Git remote with ID `cfebaf57-42c3-4df6-bf1d-4ae6f9094ec1` from the `demo` project.

```bash
curl -u opschain:password -X PATCH http://<host>/api/projects/demo/git_remotes/cfebaf57-42c3-4df6-bf1d-4ae6f9094ec1 -H "Accept: application/vnd.api+json" -H "Content-Type: application/vnd.api+json" --data-binary @- <<DATA
{
  "data": {
    "attributes": {
      "archived": false
    }
  }
}
DATA
```

## Deleting a Git remote

You can use the API server's Git remote delete endpoint in the event you wish to delete a Git remote.

The following `curl` command will delete a Git remote with ID `cfebaf57-42c3-4df6-bf1d-4ae6f9094ec1` from the `demo` project.

```bash
curl -u opschain:password -X DELETE http://<host>/api/projects/demo/git_remotes/cfebaf57-42c3-4df6-bf1d-4ae6f9094ec1 -H "Accept: application/vnd.api+json" -H "Content-Type: application/vnd.api+json"
```

### Deleting unused Git remotes

If the Git remote has not been used by a change (or a scheduled change), OpsChain can safely delete the Git remote.

### Deleting used Git remotes

In order to maintain OpsChain's audit trail, if a Git remote has been used by a change, OpsChain will not delete the Git remote. Instead, the Git remote's credentials (user, password, ssh_key_data) will be removed from the database but the record will remain.

### Manually deleting the Git repository folder

When you archive a Git remote, OpsChain will preserve the repository folder to maintain its audit trail.

Once the remote has been archived, you can manually remove the repository folder by running the following kubectl command:

```bash
kubectl exec -n ${KUBERNETES_NAMESPACE} deploy/opschain-api -- /usr/bin/container_start.sh "rake release:delete_repo_folder[<archived_remote_id>]"
```
