---
sidebar_position: 8
description: ''
---

# Git remotes

In OpsChain, a Git remote is a named reference to an actual [Git remote](https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes). It is used to securely store the credentials to access a Git repository from which you can run changes.

The Git repository is where you store the actions and related configuration. OpsChain will read all action and resource definitions from the `actions.rb` file in the repository root directory and the template's `actions.rb` file in their respective directories. See the [actions reference guide](/key-concepts/actions.md) for further information about the contents of the `actions.rb` file.

Git remotes are also the basis for [asset templates](/getting-started/familiarisation/gui/projects/asset_templates.md), which are used to leverage your assets within OpsChain.

The Git remotes tab inside a project allows you to connect Git repositories to your project, making them available for use in your changes and to be used as a source for asset templates.

## Understanding Git revisions

import GitRevision from '/files/partials/git-revision.md'

<GitRevision />

## Authentication

### GitHub authentication

If your Git repository is hosted on GitHub, you will need to authenticate with GitHub to access the repository. The service has discontinued password authentication, so if you don't already have one, you will need to create a [GitHub personal access token (PAT)](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token) and use it as your password.

### SSH authentication

OpsChain also supports the use of [SSH keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account) for authentication. By default, OpsChain includes a bundled SSH `known_hosts` file which includes SSH keys for a number of common source code hosting platforms, including:

- Bitbucket
- GitHub
- GitLab

If you'd like to have support for other platforms, refer to the [customising the SSH `known_hosts` file](/setup/configuration/additional-settings.md#opschain_ssh_known_hosts_config_map) guide.

The Git remote is tested when you create the Git remote and, if your SSH key is not trusted by the `known_hosts` list, the remote will not be added.

#### Trusting a new host

<p align='center'>
  <img alt='Trust host screen' src={require('!url-loader!../images/project-git-remotes-create-trusted-host.png').default} className='image-border'/>
</p>

If the Git host you are connecting to is not already in the trusted `known_hosts` list, the connection test fails and the remote is not added. Rather than editing the global configuration in advance, superusers can tick the **Add repository host to trusted hosts** option when [creating the Git remote](#creating-a-git-remote). OpsChain then scans the host's SSH key and adds it to the [`known_hosts` setting](/key-concepts/settings.md#known_hosts) before testing the connection, so the new remote can be added straight away.

:::note
The **Add repository host to trusted hosts** option only appears for superusers, and only when the Git remote URL is an SSH-style URL (for example `git@github.com:my-org/my-repo.git`). Trusting a host accepts whichever SSH host key the host presents at the time (trust on first use), so only enable it for hosts you recognise. The trusted key is stored in the global `known_hosts` setting and is therefore available to all subsequent Git remotes.
:::

## Project Git remotes list

<p align='center'>
  <img alt='Project Git remotes screen' src={require('!url-loader!../images/project-git-remotes.png').default} className='image-border'/>
</p>

Each row includes:

| Column              | Description                                                        |
|---------------------|--------------------------------------------------------------------|
| **Name**            | The name assigned to the Git remote.                               |
| **URL**             | The Git repository URL that the Git remote points to.              |
| **User**            | Indicates whether a username credential has been supplied.         |
| **Password**        | Indicates whether a password credential has been supplied.         |
| **SSH Key data**    | Indicates whether an SSH key credential has been supplied.         |
| **Archived**        | Whether the Git remote is archived or active.                      |
| **Edit git remote** | Opens a dialog to update the Git remote name, URL and credentials. |

## Buttons & links

| Buttons & links               | Function                                                               |
|-------------------------------|------------------------------------------------------------------------|
| **Bulk actions**              | Allows you to archive or restore multiple Git remotes.                 |
| **Search bar**                | Filter the contents of the table based on these criteria.              |
| **Columns**                   | Hide or display columns in the table.                                  |
| **Add Git remote**            | Opens a dialog to create a new Git remote.                             |

## Archiving a Git remote

Archive one or more Git remotes by selecting them in the Git remotes table and choosing _Archive_ from the _Bulk actions_ menu.

- Archived Git remotes cannot be used to create new changes, asset templates or scheduled changes.
- Existing changes, asset templates and audit history that reference the archived Git remote remain accessible.
- The on-disk repository folder is preserved so the change audit trail stays intact.

## Creating a Git remote

<p align='center'>
  <img alt='Create Git remote screen' src={require('!url-loader!../images/project-git-remotes-create.png').default} className='image-border'/>
</p>

To create a new Git remote, follow these steps:

1. Click on the _Add Git remote_ button.
2. Fill in the mandatory fields in the dialog, including the name and the Git repository URL.
3. Add the credentials to access the Git repository, either user and password or an SSH key (and its passphrase if it requires one).
4. (Optional, superusers only) If you are connecting to an SSH host that is not yet trusted, tick _Trust host_ to scan and trust the host's SSH key. See [trusting a new host](#trusting-a-new-host) for details.
5. Click the _Add git remote_ button. If successful, the new Git remote will appear on the Git remotes list of the project.

## Editing a Git remote

To edit an existing Git remote, click the _Edit git remote_ action on its row in the Git remotes list. You can update the name, the URL, and the credentials without recreating the remote — for example, to rotate credentials, switch the URL between HTTPS and SSH, or change the port.

When changing the URL, keep the following in mind:

- The new URL is verified as reachable before the change is saved, just as it is when creating a remote.
- The host and repository path are immutable. You can change the credentials, scheme, or port, but a URL that points the remote at a different repository is rejected — the on-disk clone and recorded commit history are tied to the original repository. To point at a different repository, create a new Git remote instead.
- If you switch to an SSH URL whose host is not yet trusted, superusers can tick _Trust host_ to scan and trust the host's SSH key as part of the update. See [trusting a new host](#trusting-a-new-host) for details.
