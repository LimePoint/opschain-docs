---
sidebar_position: 5
description: Run many changes at once from a sheet, one row per change, and follow each request's result.
---

# Run bulk changes

Use **Run bulk changes** to create several changes in one go, one row per change. To run one action on several assets, the **Run actions** bulk action on the [assets](/getting-started/familiarisation/gui/projects/assets.md) screen is quicker.

## Filling in the sheet

1. Select **Run** → **Run bulk changes** in the top bar, or press <kbd>Alt</kbd>+<kbd>B</kbd> (<kbd>⌥</kbd>+<kbd>B</kbd> on a Mac). Opened from a project, environment or asset, the first row starts with it filled in.
2. In each row, choose the project and action, and optionally an environment and asset. A row without an asset also needs a Git remote and revision.
3. Click **Add another change** for each further change.

<p align='center'>
  <img alt='Run bulk changes sheet' src={require('!url-loader!../images/bulk-run-change.png').default} className='image-border'/>
</p>

For property overrides, metadata and the other change options, use the [run change](/getting-started/familiarisation/gui/activity/index.md#run-change) dialog instead.

## Submitting the changes

Click **Submit all change run requests**. Incomplete rows are outlined in red and nothing is sent until they are filled in. Turn on **Submit sequentially** to send each request only after the previous one returns.

## Following the results

The summary shows each request's status, with **Go to change run** for each change created. Keep the tab open until every request has been sent - click **Abort** to stop the ones not yet sent. Click **New bulk run** to start again.

<p align='center'>
  <img alt='Run bulk changes results' src={require('!url-loader!../images/bulk-run-change-summary.png').default} className='image-border'/>
</p>
