---
sidebar_position: 8
description: ''
---

# Audit history

## Understanding the audit history screen

A table view is presented upon accessing the audit history screen. This view provides a chronological record of all system events, including user actions and any encountered errors. It enables users to monitor activity across MintPress, troubleshoot issues, and maintain accountability by offering visibility into what has happened and when it happened.

<p align='center'>
  <img alt='Audit history screen' src={require('!url-loader!./images/audit-history.png').default} className='image-border'/>
</p>

Each row includes:

| Column              | Description                                                                                                                                                                    |
|---------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Target**          | The specific source affected by the event (e.g. Node, scheduled activity, properties, settings, etc.)                                                                          |
| **Created at**      | Timestamp for when the event was created.                                                                                                                                      |
| **System**          | Whether it is a system-generated event or a user-generated one.                                                                                                                |
| **Username**        | The user responsible for triggering the event.                                                                                                                                 |
| **Type**            | The category or nature of the event, indicating what action was performed (e.g. update, delete, create, or error).                                                            |
| **Data**            | Additional context or payload associated with the event where applicable. This may include error messages, input parameters, changed attributes, or request body parameters.   |

### Buttons & links

| Buttons & links               | Function                                                               |
|-------------------------------|------------------------------------------------------------------------|
| **Columns**                   | Hide or display columns in the table.                                  |
| **Search bar**                | Filter the contents of the table based on these criteria.              |
