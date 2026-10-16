---
sidebar_position: 9
description: Storing a build artifact and loading it again later, including from a different project, environment or asset, or a different site in a highly available deployment.
---

# Artifacts

An artifact is a file your actions produce and want to use again later - e.g. a compiled `.jar` or `.war`, a packaged release, any build output. Build an artifact in one action, then load it from a later action, a later change, or a change running against a different asset, environment or project entirely.

Artifacts are stored in OpsChain's database, so a change running on one site in a highly available deployment can load an artifact that a change on another site stored.

After reading this guide, you should understand:

- how to store an artifact
- how to load an artifact, and where OpsChain looks for it by default
- how to load an artifact automatically
- how to keep more than one version of an artifact
- how to upload an artifact by hand
- what happens to a store or load while OpsChain is only discovering your actions
- how artifacts are retained, and where to view or download them

:::note[The `artefact` spelling still works]
Everything named `artifact` also answers to `artefact`, the spelling OpsChain used before this release: `OpsChain.artefact`, the `artefact` and `artefact_load` resource types, the `artefact.*` settings, `purge_artefacts` and `artefacts.size_tiers` on a cleanup job, and API paths containing `artefacts`. Existing actions, scripts and automation keep working unchanged.
:::

## Storing an artifact

```ruby
action :create_war do
  system('mvn package')
  OpsChain.artifact.store('war', './target/app.war')
end
```

`OpsChain.artifact.store` takes a code identifying the artifact (`'war'` above) and the path to the file to store. The code is the artifact's user-defined identifier - it's used consistently for storage and lookup.

:::warning[Always call store from the action that produced the file]
Never reference `OpsChain.artifact.store` from a `steps:` list. A child step may run in its own step runner - and hence have no access to the file - due to the `pod_per_step` setting. The system may also have entered [maintenance mode](/operations/maintenance/maintenance-mode.md) between steps, possibly updating the pod. Call `OpsChain.artifact.store` directly inside the same action block that created the file, as in the example above, not as a separate step that runs afterwards.
:::

## Loading an artifact

```ruby
action :deploy_war do
  OpsChain.artifact.load('war', path: '/opt/tomcat/webapps/app.war')
  system('systemctl restart tomcat')
end
```

`OpsChain.artifact.load` takes the artifact's code and writes the file to `path:` (creating any parent directories as needed).

By default, `load` (and `store`) look at the project, environment or asset that the current change is actually running on. A change running on an environment can't find an artifact stored against one of its assets, or vice versa. To override the lookup path, use the `owner:` argument.

## Choosing where an artifact belongs

Pass `owner:` to `store` or `load` to specify where to find the artifact.

For example, pass the keywords `:asset`, `:environment` or `:project` to use that ancestor instead. This is useful when a change stores an artifact at a higher level (e.g. the environment) and several asset changes need to find it without each one naming the environment explicitly:

```ruby
# A change running on the "build" environment:
OpsChain.artifact.store('deploy-manifest', './manifest.yaml', owner: :environment)

# A later change running on an asset under that environment:
OpsChain.artifact.load('deploy-manifest', owner: :environment)
```

Naming a level *more specific* than what the change is actually running on doesn't fail. For example, `owner: :asset` from a change running on an environment falls back to the environment itself - the nearest available ancestor - logging a warning rather than failing, because OpsChain can't know which asset you meant.

Pass a hash to reach a different project, environment or asset altogether:

```ruby
OpsChain.artifact.load('war', owner: { project: 'demo', environment: 'ci', asset: 'build-agent' })
```

This is how a change on one asset loads an artifact that a change on a completely unrelated asset produced.

## Loading an artifact automatically

Calling `OpsChain.artifact.load` inline works whenever an action needs an artifact as one part of what it does. For an artifact one action genuinely depends on, or a file most of a change's actions need, OpsChain can load it for you automatically using the `artifact` resource type.

### As a dependency of one action

Declare the artifact as a resource, then reference its `load` action as a prerequisite:

```ruby
artifact :war

action deploy_war: ['war:load'] do
  system('systemctl restart tomcat')
end
```

`deploy_war` only loads `war` when it actually runs. This resource type uses the resource name (in this example `war`) to reference the artifact `code`. Use a block and pass an explicit `code` - e.g. `code 'war'` - if the resource name differs from the artifact code. See the `artifact_load` code below for an example.

### As input the whole file needs

For shared configuration - e.g. a deploy manifest most of a file's actions read, rather than one action's own dependency - use `artifact_load` instead:

```ruby
artifact_load :deploy_config do
  code 'deploy-config-yaml'
end
```

OpsChain loads it as soon as it reads your actions - the same way it reads the rest of the top level of `actions.rb` - once per change, or fresh for every step if the change runs each step in its own pod. Use the `artifact_load` resource type only for input a whole file needs, not for a dependency between one pair of actions (use the prerequisite `artifact` form above for that).

## Keeping more than one version

Every `store` call creates a new stored artifact - storing the same code again does not overwrite the previous one. Use `labels` to tell versions apart:

```ruby
OpsChain.artifact.store('war', './target/app.war', labels: ['v1.2.3'])
```

Without a `labels:` filter, `load` returns the most recently stored artifact matching the code and owner. Pass `labels:` to retrieve a specific version:

```ruby
OpsChain.artifact.load('war', labels: ['v1.2.3'])
```

Labels are plain strings - there is no fixed format. A common pattern is to store the change that produced the artifact as a label (e.g. `"change:#{OpsChain.context.change.id}"`), so a later change can load the exact artifact that a specific change published rather than whatever is newest.

## Uploading an artifact by hand

An artifact does not have to come from a change. For example, to upload a hotfix that skips the normal build pipeline, use **Upload artifact** on the [**Artifacts** tab](/getting-started/familiarisation/gui/projects/assets.md#uploading-an-artifact) of the project, environment or asset. Uploading under a code that already exists adds a new version rather than replacing the earlier one.

An uploaded artifact behaves like any other for `load` - it has no associated step, since no change produced it.

## Dry runs

OpsChain reads your actions both to run a step and to discover what you've defined, without running any of it - see [querying while your actions are being discovered](/key-concepts/actions.md#querying-while-your-actions-are-being-discovered) for the same idea applied to `query`. Unlike `OpsChain.query`, a plain `OpsChain.artifact.store` or `OpsChain.artifact.load` usually runs inside an action, which makes it simpler to manage. However, if a caller genuinely needs to behave differently during a dry run, check `OpsChain.dry_run?` yourself:

```ruby
OpsChain.artifact.load('war', path: '/opt/tomcat/webapps/app.war') unless OpsChain.dry_run?
```

The only dry-run guard is `artifact_load`'s `on_definition_action :load`. Unlike a plain call, it fires as soon as OpsChain reads your actions, even during action discovery. Set the `load_during_dry_run` property to `true` if discovery genuinely needs the artifact loaded at that point, the same way `git_clone`'s `clone_during_dry_run` works:

```ruby
artifact_load :deploy_config do
  code 'deploy-config-yaml'
  load_during_dry_run true
end
```

It defaults to `false`, so the load is skipped during discovery and only happens when a step actually runs. The `artifact` resource's prerequisite-only `load` (above) needs no such guard either - a prerequisite, like a plain call, never runs during discovery.

## Size limit

An artifact's maximum size is a setting, `artifact.max_file_size`, defaulting to `500Mi`. Unlike most OpsChain settings, its override scope is narrower than the usual project/environment/asset/change hierarchy - you can only override it at the change level, as a `settings_overrides`/static setting on the specific change doing the store. Ask an administrator to raise `artifact.hard_max_file_size` (below) first if that ceiling is what's actually blocking a larger artifact.

A second setting, `artifact.hard_max_file_size`, sets an absolute ceiling that `max_file_size` can never be raised past. Unlike `max_file_size`, you can only set it at the global level - it can't be overridden per project, environment, asset or change. It exists so an administrator can cap how large an artifact the instance will ever accept, regardless of any narrower `max_file_size` override.

## Compression

OpsChain compresses artifact content as it stores it, transparently to `store` and `load` - there is nothing to configure in `actions.rb`, and a compressed artifact reads back identically to how it was written. Two global-only settings control it: `artifact.compression`, which defaults to `zstd` and can be set to `disabled`, and `artifact.compression_level`, which defaults to `3` (higher trades more CPU time for a smaller stored size). Changing either setting only affects artifacts stored after the change - an existing stored artifact keeps reading back correctly, regardless of what compression, if any, it was originally stored with.

## Retention

Artifacts do not accumulate indefinitely. From OpsChain's data cleanup settings, an administrator can configure, per project, environment or asset, how many recent versions of an artifact to keep, and how many days to keep any version regardless of count. You can apply different retention to different artifact sizes, so you can purge large build artifacts more aggressively than small ones. See [data cleaning](/operations/maintenance/data-cleaning.md#size-tiered-artifact-retention) for how to configure it. A version is only removed once it falls outside its retention rule. You can't delete an artifact from `actions.rb` - retention is the only thing that removes one.

Retention does not delete the artifact's record - it purges the stored file and marks the artifact as purged, keeping it visible everywhere it would otherwise appear. In the GUI, a purged version stays listed on its [versions page](/getting-started/familiarisation/gui/projects/assets.md#artifact-versions) and on the change that stored it, marked **Purged** with the date, but you can't download it. `load` never resolves to a purged artifact - an unpinned `load` falls back to the next most recent version as though the purged one did not exist, and `load('war', labels: ['v1.2.3'])` against a purged, labelled version fails as if no version had ever matched.

## Viewing and downloading artifacts

A change's **Artifacts** tab lists the artifacts its steps stored and every artifact version they loaded, with buttons to preview and download each one. A step's details list the artifacts that step stored and loaded. See [artifacts](/getting-started/familiarisation/gui/activity/activity_details.md#artifacts) on the activity details page.

An environment or asset's **Artifacts** tab lists the latest version of each artifact it owns, with a page per artifact showing every version, and an **Upload artifact** button. See [artifacts](/getting-started/familiarisation/gui/projects/assets.md#artifacts).

Everything the GUI shows is also available through the [artifacts API](pathname:///api-docs/#tag/Artifacts), including the artifacts that a project owns, which the GUI does not list.
