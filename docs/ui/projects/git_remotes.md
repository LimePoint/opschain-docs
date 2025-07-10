---
sidebar_position: 9
description: ''
---

# Git remotes

Git manages the configuration and code associated with changes. This tab allows management of the Git remotes available for this project.

<p align='center'>
  <img alt='Project Git remotes screen' src={require('!url-loader!../images/project-git-remotes.png').default} className='image-border'/>
</p>

Each row includes:

| Column               | Description                                                    |
|----------------------|----------------------------------------------------------------|
| **Name**             | The name assigned to the Git remote.                           |
| **URL**              | The repository URL that the Git remote points to.              |
| **User**             | Indicates whether a username credential has been supplied.     |
| **Password**         | Indicates whether a password credential has been supplied.     |
| **SSH Key data**     | Indicates whether an SSH key credential has been supplied.     |
| **Archived**         | Whether the Git remote is archived or active.                  |
| **Edit git remote**  | Opens a dialog to update the Git remote credentials.           |

## Buttons & links

| Buttons & links               | Function                                                               |
|-------------------------------|------------------------------------------------------------------------|
| **Columns**                   | Hide or display columns in the table.                                  |
| **Search bar**                | Filter the contents of the table based on these criteria.              |
| **Bulk actions**              | Perform operations on multiple Git remotes, such as archiving.              |

## Creating a Git remote

<p align='center'>
  <img alt='Create Git remote screen' src={require('!url-loader!../images/project-git-remotes-create.png').default} className='image-border'/>
</p>

To create a new Git remote, follow these steps:

1. Click on the _Add git remote_ button.
2. Fill in the mandatory fields in the dialog, including the name, Git repository URL, user and password.
3. Click the _Add git remote_ button. If successful, the new Git remote will appear on the Git remotes list of the project.
