---
sidebar_position: 9
description: ''
---

# Git remotes

Git repositories are the source for the code associated with changes in OpsChain. This tab allows you to connect Git repositories to your project, making them available for use in your changes and to be used as a source for asset templates.

<p align='center'>
  <img alt='Project Git remotes screen' src={require('!url-loader!../images/project-git-remotes.png').default} className='image-border'/>
</p>

Each row includes:

| Column               | Description                                                    |
|----------------------|----------------------------------------------------------------|
| **Name**             | The name assigned to the Git remote.                           |
| **URL**              | The Git repository URL that the Git remote points to.          |
| **User**             | Indicates whether a username credential has been supplied.     |
| **Password**         | Indicates whether a password credential has been supplied.     |
| **SSH Key data**     | Indicates whether an SSH key credential has been supplied.     |
| **Archived**         | Whether the Git remote is archived or active.                  |
| **Edit git remote**  | Opens a dialog to update the Git remote name and credentials.  |

## Buttons & links

| Buttons & links               | Function                                                               |
|-------------------------------|------------------------------------------------------------------------|
| **Bulk actions**              | Allows you to archive or restore multiple Git remotes.                 |
| **Search bar**                | Filter the contents of the table based on these criteria.              |
| **Columns**                   | Hide or display columns in the table.                                  |
| **Add Git remote**            | Opens a dialog to create a new Git remote.                             |

## Creating a Git remote

<p align='center'>
  <img alt='Create Git remote screen' src={require('!url-loader!../images/project-git-remotes-create.png').default} className='image-border'/>
</p>

To create a new Git remote, follow these steps:

1. Click on the _Add Git remote_ button.
2. Fill in the mandatory fields in the dialog, including the name and the Git repository URL.
3. Add the credentials to access the Git repository, either user and password or an SSH key (and its passphrase if it requires one).
4. Click the _Add git remote_ button. If successful, the new Git remote will appear on the Git remotes list of the project.
