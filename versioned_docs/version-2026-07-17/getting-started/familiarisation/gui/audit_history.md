---
sidebar_position: 8
description: ''
---

# Audit history

## Understanding the audit history screen

The audit history screen is where you browse, search and filter the [events](/key-concepts/events.md) that OpsChain records. It provides a chronological record of every change to OpsChain data - user actions, system-generated events and errors - so you can monitor activity, troubleshoot issues and maintain accountability.

A table view is presented upon accessing the audit history screen.

<p align='center'>
  <img alt='Audit history screen' src={require('!url-loader!./images/audit-history.png').default} className='image-border'/>
</p>

Each row includes:

| Column              | Description                                                                                                                                                                    |
|---------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Source**          | The specific source affected by the event (e.g. project, agent, asset, scheduled activity, properties, settings, etc.)                                                         |
| **Type**            | The category or nature of the event, indicating what action was performed (e.g. update, delete, create, or error).                                                             |
| **Created at**      | Timestamp for when the event was created.                                                                                                                                      |
| **System**          | Whether it is a system-generated event or a user-generated one.                                                                                                                |
| **User**            | The user responsible for triggering the event.                                                                                                                                 |
| **Event data**      | Additional context or payload associated with the event where applicable. This may include error messages, input parameters, changed attributes, or request body parameters.   |

### Buttons & links

| Buttons & links               | Function                                                               |
|-------------------------------|------------------------------------------------------------------------|
| **Search bar**                | Filter the events by their type.                                       |
| **Filters**                   | Filter the events by other specific criteria.                          |
| **Clear button**              | Clears all the filters and refreshes the table contents.               |
| **Apply button**              | Applies the filters to the table and refreshes the table contents.     |
| **Columns**                   | Hide or display columns in the table.                                  |
