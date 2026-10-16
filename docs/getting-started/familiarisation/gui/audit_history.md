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
| **Type**            | The event type, with its level shown as a badge and a one-line summary underneath where the event has one. See [system event types](/key-concepts/events.md#system-event-types). |
| **Created at**      | Timestamp for when the event was created.                                                                                                                                      |
| **System**          | Whether it is a system-generated event or a user-generated one.                                                                                                                |
| **User**            | The user responsible for triggering the event.                                                                                                                                 |
| **Event data**      | A button that opens the event's data without leaving the table.                                                                                                              |

### Buttons & links

| Buttons & links               | Function                                                               |
|-------------------------------|------------------------------------------------------------------------|
| **Search bar**                | Filter the events by their type.                                       |
| **Filters**                   | Filter the events by user, category, creation time, and whether they are system or user generated. |
| **Clear button**              | Clears all the filters and refreshes the table contents.               |
| **Apply button**              | Applies the filters to the table and refreshes the table contents.     |

## View the details of an event

Click a row in the audit history table to open that event's details page, which has its own URL to bookmark or share. It shows the event's source, creation time, user and path, and the event's message, progress logs and data in separate tabs. The **Event data** button in the table opens the same tabs in a dialog.

<p align='center'>
  <img alt='Audit event details' src={require('!url-loader!./images/audit-event-details.png').default} className='image-border'/>
</p>

## Node & agent audit history

Projects, environments, assets and agents each have an **Audit history** tab showing the most recent events generated for them. It presents the same table, columns and filters as the main audit history screen, but is automatically scoped to the current node or agent — any filters you apply narrow that list further.

Changes and workflow runs have an **Audit history** tab too. A change's tab lists the events raised by the change and its steps; a workflow run's tab lists those raised by the run, its steps, and the changes it started and their steps. See [activity details](/getting-started/familiarisation/gui/activity/activity_details.md#audit-history).

:::note
The audit history screen and the event details page read from the `/api/events` endpoint. See [filtering events on the API](/key-concepts/events.md#filtering-events-on-the-api) to query the same events from a script.
:::
