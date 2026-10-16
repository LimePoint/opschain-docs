---
sidebar_position: 9
description: Storing a build artefact and loading it again later, including from a different project, environment or asset, or a different site in a highly available deployment.
---

# Artefacts

An artefact is a file your actions produce and want to use again later - a compiled `.jar` or `.war`, a packaged release, any build output. Store one from the action that builds it, then load it from a later action, a later change, or a change running against a different asset, environment or project entirely.

Artefacts are stored in OpsChain's database, so a change running on one site in a highly available deployment can load an artefact a change on another site stored. There is nothing to configure or sync - it works the same way regardless of which site runs which change.

After reading this guide you should understand:

- how to store an artefact, and the one rule about where `store` can be called from
- how to load an artefact, and where OpsChain looks for it by default
- how to load an artefact automatically, as a dependency of another action or for the whole file
- how to keep more than one version of an artefact, and load a specific one
- how to upload an artefact by hand, outside a change
- what happens to a store or load while your actions are only being discovered
- how artefacts are retained, and where to view or download them

## Storing an artefact

```ruby
action :create_war do
  system('mvn package')
  OpsChain.artefact.store('war', './target/app.war')
end
```

`store` takes a code identifying the artefact (`'war'` above) and the path to the file to store. The code is yours to choose - use it consistently for the same kind of artefact so later actions and changes can find it.

:::warning[Always call store from the action that produced the file]
Never reference `store` from a `steps:` list. A child step runs in its own step runner - under `pod_per_step: true`, a different pod with its own filesystem - so it has no access to a file an earlier action wrote to local disk. Call `OpsChain.artefact.store` directly inside the same action block that created the file, as in the example above, not as a separate step that runs afterwards.
:::

## Loading an artefact

```ruby
action :deploy_war do
  OpsChain.artefact.load('war', path: '/opt/tomcat/webapps/app.war')
  system('systemctl restart tomcat')
end
```

`load` takes the artefact's code and writes it to `path:`, creating any parent directories it needs. Omit `path:` and OpsChain writes the artefact wherever is convenient instead.

By default, `load` (and `store`) look at the project, environment or asset the current change is actually running on. An artefact stored against an asset is not found by a change running on its environment, and the reverse is also true - unless you say otherwise with `owner:`.

## Choosing where an artefact belongs

Pass `owner:` to `store` or `load` to reach beyond the project, environment or asset the change is running on.

Give it `:asset`, `:environment` or `:project` to use that ancestor instead - useful when one change stores an artefact at a coarser level (say, the environment) and several changes further down need to find it without each one naming the environment explicitly:

```ruby
# A change running on the "build" environment:
OpsChain.artefact.store('deploy-manifest', './manifest.yaml', owner: :environment)

# A later change running on an asset underneath that environment:
OpsChain.artefact.load('deploy-manifest', owner: :environment)
```

`owner: :environment` resolves against the current change's own ancestor chain, so every asset under that environment can use the same one-word `owner:` rather than spelling out which project and environment it belongs to.

Naming a level *more specific* than what the change is actually running on doesn't error - `owner: :asset` from a change running on an environment falls back to the environment itself (the nearest available ancestor), logging a warning rather than failing, since there is no way to know which asset you meant.

Give it a hash to reach a different project, environment or asset altogether:

```ruby
OpsChain.artefact.load('war', owner: { project: 'demo', environment: 'ci', asset: 'build-agent' })
```

This is how a change on one asset loads an artefact a change on a completely unrelated asset produced - build in a CI environment, deploy to production, without the two changes needing anything in common beyond the artefact's code.

## Loading an artefact automatically

Calling `OpsChain.artefact.load` inline works whenever an action needs an artefact as one part of what it does. For an artefact one action genuinely depends on, or a file most of a change's actions need, OpsChain can load it for you.

### As a dependency of one action

Declare the artefact as a resource, then reference its `load` action as a prerequisite:

```ruby
artefact :war

action deploy_war: ['war:load'] do
  system('systemctl restart tomcat')
end
```

`deploy_war` only loads `war` when it actually runs - nothing is fetched until something asks for it. This resource form only supports `load` - never reference it to `store`, for the same reason described above. `code` defaults to the resource's own name, so it needs no block here - give it an explicit `code 'war'` (as `artefact_load` does below, where the name and code differ) when they don't match. `artefact` is loaded before your actions.rb is read, so it needs no `require` of its own - same as `git_clone`.

### As input the whole file needs

For something closer to shared configuration - a deploy manifest most of a file's actions read, rather than one action's own dependency - use `artefact_load` instead:

```ruby
artefact_load :deploy_config do
  code 'deploy-config-yaml'
end
```

This loads as soon as your actions are read, the same way OpsChain reads the rest of the top level of `actions.rb` - once per change, or fresh for every step if the change runs each step in its own pod. Reach for this only for input a whole file needs, not for a single producer/consumer pair of actions - use the prerequisite form above for that.

## Keeping more than one version

Every `store` call creates a new stored artefact - storing the same code again does not overwrite the previous one. Use `labels` to tell versions apart:

```ruby
OpsChain.artefact.store('war', './target/app.war', labels: ['v1.2.3'])
```

Without a `labels:` filter, `load` returns the most recently stored artefact matching the code and owner. Pass `labels:` to narrow that to a specific version:

```ruby
OpsChain.artefact.load('war', labels: ['v1.2.3'])
```

Labels are plain strings - there is no fixed format. A common pattern is to store the change that produced the artefact as a label (e.g. `"change:#{OpsChain.context.change.id}"`), so a later change can load the exact artefact a specific change published rather than whatever is newest.

## Uploading an artefact by hand

An artefact does not have to come from a change. Use **Upload artefact** on an environment or asset's [**Artefacts** tab](/getting-started/familiarisation/gui/projects/assets.md#uploading-an-artefact) - for a hotfix that skips the normal build pipeline, for example. Uploading under a code that already exists adds a new version rather than replacing the earlier one.

To upload against a project, or from a script, use the [artefacts API](pathname:///api-docs/#tag/Artefacts) instead.

An uploaded artefact behaves like any other for `load` - it has no associated step, since no change produced it.

## Dry runs

OpsChain reads your actions both to run a step and to discover what your actions are without running any of them - see [querying while your actions are being discovered](/key-concepts/actions.md#querying-while-your-actions-are-being-discovered) for the same idea applied to `query`. A plain `OpsChain.artefact.store` or `OpsChain.artefact.load` call needs no special handling for this: unlike `query`, it only ever runs from inside an action block, which never runs during discovery - so there is nothing to skip or guard against. If a caller genuinely needs to behave differently during a dry run, check `OpsChain.dry_run?` yourself:

```ruby
OpsChain.artefact.load('war', path: '/opt/tomcat/webapps/app.war') unless OpsChain.dry_run?
```

The one place a dry-run guard exists is `artefact_load`'s `on_definition_action :load` - unlike a plain call, this fires as soon as your actions are read, which happens during discovery too. Set its `load_during_dry_run` property to `true` if discovery genuinely needs the artefact loaded at that point, the same way `git_clone`'s `clone_during_dry_run` works:

```ruby
artefact_load :deploy_config do
  code 'deploy-config-yaml'
  load_during_dry_run true
end
```

It defaults to `false`, so by default the load is skipped during discovery and only happens when a step actually runs. The `artefact` resource's prerequisite-only `load` (above) needs no such guard either - a prerequisite, like a plain call, never runs during discovery.

## Size limit

An artefact's maximum size is a setting, `artefact.max_file_size`, defaulting to `500Mi`. Unlike most OpsChain settings, its override scope is narrower than the usual project/environment/asset/change hierarchy - it can only be overridden at the change level, as a `settings_overrides`/static setting on the specific change doing the store. Ask an administrator to raise `artefact.hard_max_file_size` (below) first if that ceiling is what's actually blocking a larger artefact.

A second setting, `artefact.hard_max_file_size`, sets an absolute ceiling that `max_file_size` can never be raised past - unlike `max_file_size`, it can only be set at the global level, and is not overridable per project, environment, asset or change. It exists so an administrator can cap how large an artefact the instance will ever accept, regardless of what any narrower override sets `max_file_size` to.

## Compression

OpsChain compresses artefact content as it stores it, transparently to `store` and `load` - there is nothing to configure in `actions.rb`, and a compressed artefact reads back identically to how it was written. This is controlled by two global-only settings: `artefact.compression`, which defaults to `zstd` and can be set to `disabled`, and `artefact.compression_level`, which defaults to `3` (higher trades more CPU time for a smaller stored size). Changing either setting only affects artefacts stored after the change - an existing stored artefact keeps reading back correctly regardless of what compression, if any, it was originally stored with.

## Retention

Artefacts do not accumulate indefinitely. An administrator can configure, per project, environment or asset, how many recent versions of an artefact to keep and how many days to keep any version regardless of count, from OpsChain's data cleanup settings - including different retention for different artefact sizes, so large build artefacts can be purged more aggressively than small ones. See [data cleaning](/operations/maintenance/data-cleaning.md#size-tiered-artefact-retention) for how to configure it. A version is only removed once it falls outside its retention rule. There is no way to delete an artefact from `actions.rb` - retention is the only way one is removed.

Retention does not delete the artefact's record - it purges the stored file and marks the artefact as purged, keeping it visible everywhere it would otherwise appear. In the GUI, a purged version stays listed on its [versions page](/getting-started/familiarisation/gui/projects/assets.md#artefact-versions) and on the change that stored it, marked **Purged** with the date, but its download button is disabled. `load` never resolves to a purged artefact - an unpinned `load` falls back to the next most recent version as though the purged one did not exist, and `load('war', labels: ['v1.2.3'])` against a purged, labelled version fails as if no version had ever matched.

## Viewing and downloading artefacts

A change's **Artefacts** tab lists the artefacts its steps stored and every artefact version they loaded, with buttons to preview and download each one, and a step's details list the artefacts that step stored and loaded. See [artefacts](/getting-started/familiarisation/gui/activity_details.md#artefacts) on the activity details page.

An environment or asset's **Artefacts** tab lists the latest version of each artefact it owns, with a page per artefact showing every version, and an **Upload artefact** button. See [artefacts](/getting-started/familiarisation/gui/projects/assets.md#artefacts).

Everything the GUI shows is also available through the [artefacts API](pathname:///api-docs/#tag/Artefacts), including the artefacts a project owns, which the GUI does not list.
