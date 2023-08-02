---
sidebar_position: 7
description: Storing environment variables, files and key value pairs in the OpsChain properties framework.
---

# Properties

The OpsChain properties framework provides a location to store:

- key value pairs
- environment variables and values (that will be available in the Unix environment running a change action)
- files (that will be written before running a change action)

OpsChain properties can be stored in your project's Git repository and also at the project or environment level in the OpsChain database. For those properties stored in the database OpsChain maintains a complete version history of each change made to the OpsChain properties JSON, enabling you to view and compare the properties used for any change. Similarly, Git version history can be used to identify changes made to the repository properties.

After following this guide you should understand:

- how to incorporate OpsChain properties into your Git repository
- how to import OpsChain properties into the database using the CLI
- how to view project and environment OpsChain properties from the CLI and API server
- the various types of values that can be stored in OpsChain properties
- the difference between OpsChain properties and OpsChain context values

## OpsChain properties

Within each action, OpsChain properties are available via `OpsChain.properties` (which will behave like a [Hashie Mash](https://github.com/hashie/hashie#mash)). The values available are the result of a deep merge of the [change's](concepts.md#change) [project's Git repository](../project-git-repositories.md) properties with the [project](concepts.md#project) and [environment](concepts.md#environment) level properties. If a property exists at multiple levels, project values will override repository values and environment values will override project and repository values.

Properties can be accessed using dot or square bracket notation with string or symbol keys. These examples are equivalent:

```ruby
require 'opschain'

OpsChain.properties.server.setting
OpsChain.properties[:server][:setting]
OpsChain.properties['server']['setting']
```

:::note NOTES

1. You will not be able to use dot notation to access a property with the same name as a method on the properties object (for example `keys`). In this case you must use square bracket notation instead.
2. Any arrays in the properties will be overwritten during a deep merge (use JSON objects with keys instead to ensure they are merged).
3. The `OpsChain.properties` structure is read only. Please see [modifiable properties](#modifiable-properties) below for information on making changes to the environment or project properties.

:::

### Comparison with OpsChain context

In addition to the user defined and maintained OpsChain properties available in an OpsChain change, OpsChain also provides OpsChain context values.

The OpsChain context is automatically populated by OpsChain with information about the context in which a change is run, for example the environment name or the action being executed by the change.

Rather than manually putting change related values - e.g. the environment code, project code, action name, etc. - into your properties, consider whether you could use the OpsChain context instead.

:::tip
See the [OpsChain context guide](context.md) if you would like to learn more about the OpsChain context framework.
:::

## Storage options

### Git repository

OpsChain will look for the following files in your project's Git repository:

1. `.opschain/properties.json`
2. `.opschain/properties.toml`
3. `.opschain/properties.yaml`
4. `.opschain/projects/<project code>.json`
5. `.opschain/projects/<project code>.toml`
6. `.opschain/projects/<project code>.yaml`
7. `.opschain/environments/<environment code>.json`
8. `.opschain/environments/<environment code>.toml`
9. `.opschain/environments/<environment code>.yaml`

If multiple files exist in the repository, they will be merged together in the order listed above. Where multiple files define the same property/value, the latter file's value will override the former. E.g. if `.opschain/properties.toml` and `.opschain/environments/<environment code>.json` both contain the same property, the value from `.opschain/environments/<environment code>.json` will be used.

Within each action, the result of merging the properties in these files will be available via `OpsChain.repository_properties`.

:::note
The repository properties are read only within each action (as OpsChain cannot modify the underlying Git repository to store any changes).
:::

:::caution
[Build and runner secrets](step-runner.md#secure-secrets) can only be configured in [database](#database) properties. If `env:build_secrets` or `env:runner_secrets` configuration is included in your repository properties it will be ignored.
:::

#### Parent specific repository properties

The project or environment specific Git repository properties can be accessed via `OpsChain.repository_properties_for(:environment)` or `OpsChain.repository_properties_for(:project)` respectively.

:::note
If multiple files exist for a given project or environment code (e.g. `.opschain/environments/dev.json` and `.opschain/environments/dev.toml`) then `OpsChain.repository_properties_for(:environment)` will merge the properties in these files and return the result.

Access to the individual file contents is not available via the `repository_properties_for` API. Requiring access to the individual files may indicate a brittle properties implementation. If access is required then the individual files can be read manually using normal Ruby APIs, e.g. `File.read` etc.
:::

#### OpsChain development environment

Repository properties will be loaded (and validated) each time the `opschain-action` command is executed inside the [OpsChain development environment](../../development-environment.md). Running `opschain-action -AT` to list available actions will raise explanatory exceptions if the schema or structure of the properties file(s) is invalid.

If you wish to use environment or project specific repository properties in the development environment (`<project code>.{json,toml,yaml}` or `<environment code>.{json,toml,yaml}`) files you will need to configure your `step_context.json` to reflect the relevant project or environment code in the context. e.g.

```yaml
{
  "context": {
    "project": {
      "code": "<project code>",
    ...
    "environment": {
      "code": "<environment code>",
      ...
    }
  },
  ...
}
```

### Database

Properties stored in the database are encrypted prior to being written to disk such that they are encrypted-at-rest. Within each action, project properties are available via `OpsChain.properties_for(:project)`. Similarly, environment properties are available via `OpsChain.properties_for(:environment)`. Actions can modify these properties at runtime and any changes will be persisted to the database (see [modifiable properties](#modifiable-properties) below).

#### Editing properties

The OpsChain CLI allows you to edit properties at the project or environment level with the `edit-properties` subcommand.

```bash
# edit project properties
opschain project edit-properties --project-code <project code>

# edit environment properties
opschain environment edit-properties --project-code <project code> --environment-code <environment_code>
```

The OpsChain CLI will download the latest properties for the project or environment specified and open them in the `editor` configured in your `.opschainrc`. After making changes to the properties, save the file and exit the editor. The OpsChain CLI will then upload the new properties to the API server. If errors are identified in the JSON structure or the properties fail validation, the editor will be re-opened with the error message displayed, allowing you to fix the reported errors and retry the upload.

If the error message displayed in the editor reflects that the properties have been changed by another user, you will need to re-run the `edit-properties` command so it can download the latest properties to apply your changes to. To cancel the current `edit-properties` process, simply exit the editor without making any changes to the current state of the file. If necessary, before exiting the editor, you can save your changes to a different file name for future reference.

#### Loading properties from a file

The OpsChain CLI `set-properties` subcommand allows you to replace the current project or environment properties with the contents of a JSON file.

```bash
# create a properties JSON file to upload
cat << EOF > my_opschain_properties.json
{
  "basic_prop": "some value",
  "parent_prop": {
    "nested_prop": "some other value"
  }
}
EOF

# set project properties
opschain project set-properties --project-code <project code> --file-path my_opschain_properties.json --confirm

# set environment properties
opschain environment set-properties --project-code <project code> --environment-code <environment_code> --file-path my_opschain_properties.json --confirm
```

If you have an existing JSON you wish to use as the properties for a project or environment and you are certain that the existing properties are empty (or can be overwritten), this is an efficient way to populate the properties. You'll see some of our [OpsChain examples](/docs/category/examples) use `set-properties` to setup the initial project or environment properties.

**Whenever possible, use `edit-properties` rather than `set-properties` to ensure concurrent changes to the properties are not overwritten.**

:::info
If the environment or project properties are in use by an active change, the API server will reject the set-properties request. This ensures OpsChain can guarantee the properties state throughout the life of the change.
:::

#### Viewing properties

The OpsChain CLI allows you to view the stored properties:

```bash
opschain project show-properties --project-code <project code>
opschain environment show-properties --project-code <project code> --environment-code <environment_code>
```

The CLI does not currently support viewing prior versions of the properties. To do this you will need to interact directly with the OpsChain API server. The project API location:

```text
http://<host>:3000/api/projects/<project code>
```

The environment API location (the link below will respond with all environments for the project specified - review the output for the environment of interest):

```text
http://<host>:3000/api/projects/<project code>/environments
```

The relevant API response will contain a link to the properties associated with that object in `/data/relationships/properties/links/related`. This will return the current properties values, including the current version number (in `/data/attributes/version`). To request a different version of the properties, simply append `/versions/VERSION_NUMBER` to the url. E.g.

```text
http://<host>>:3000/api/properties/<properties id>/versions/7
```

## Properties content

### Key value pairs

You can use OpsChain key value properties from anywhere in your `actions.rb` to provide environment (or project) specific values to your resource actions. E.g.

```ruby
database :my_database do
  host OpsChain.properties.database.host_name
  source_path OpsChain.properties.database.source_path
end
```

#### Modifiable properties

In addition to the read only values available from `OpsChain.properties`, the project and environment specific database properties are available via:

```ruby
OpsChain.properties_for(:project)
OpsChain.properties_for(:environment)
```

These are exposed to allow you to add, remove and update properties, with any modifications saved on [step](concepts.md#step) completion. The modified project and environment properties are then available to any subsequent [steps](concepts.md#step) or [changes](concepts.md#change).

The object returned by `OpsChain.properties` is the merged set of properties and is regenerated every time the method is called. This means that if the result of `OpsChain.properties` is assigned to a variable - or passed to a resource - it won't reflect updates.

```ruby
puts OpsChain.properties.example # ''
props = OpsChain.properties
OpsChain.properties_for(:project).example = 'hello'
puts OpsChain.properties.example # 'hello'
puts props.example # '' - this value was not updated
```

##### Creating / updating properties within actions

The following code will set the project `server_name` property, creating or updating it as applicable:

```ruby
OpsChain.properties_for(:project).server_name = 'server1.limepoint.com'
```

:::note
As properties behave like a `Hashie::Mash`, creating multiple levels of property nesting in a single command requires you to supply a hash as the value. E.g.

```ruby
OpsChain.properties_for(:project).parent = { child: { grandchild: 'value' } }
```

Once created, nested properties can be updated as follows:

```ruby
OpsChain.properties_for(:project).parent.child.grandchild = 'new value'
```

:::

##### Deleting properties

To delete the grandchild property described above, use the following command:

```ruby
OpsChain.properties_for(:project).parent.child.delete(:grandchild)
```

:::note
This would leave the parent and child keys in the project properties. To delete the entire tree, use the following command:

```ruby
OpsChain.properties_for(:project).delete(:parent)
```

:::

##### Example

An example of setting properties can be seen in the [Confluent example](https://github.com/LimePoint/opschain-examples-confluent). The `provision` [action](concepts.md#action) in [`actions.rb`](https://github.com/LimePoint/opschain-examples-confluent/blob/master/actions.rb) modifies the environment properties to change settings for broker1.

#### Changing properties in concurrent steps

Changes that take advantage of the `:parallel` [change execution strategy](actions.md#child-execution-strategy) will cause OpsChain to run multiple steps concurrently. Similarly, starting multiple changes at once will also lead to steps executing concurrently.

When each step starts, the current state of the project and environment properties (in the OpsChain database) is supplied to the step's action(s). This means steps that run concurrently will start with the same set of properties. At the completion of each step, any changes made to the project and/or environment properties by the action, are reflected in a [JSON Patch](http://jsonpatch.com/) applicable to the relevant source properties. The JSON Patch(es) are returned from the step runner to the OpsChain API and applied to the current state of the database properties. It is up to the action developer to ensure any changes made to properties by concurrent steps are compatible with each other.

:::caution
OpsChain recommends that you do not modify properties from within concurrent steps. However, if this is a requirement, ensuring the modifications apply to unrelated sections of the OpsChain properties will mitigate the risk. The following sections describe various types of properties changes and the possible errors you may encounter. For simplicity, the examples all show concurrent steps created within a single change using the `:parallel` child step execution strategy. Steps executing from changes that have been submitted concurrently can run into similar limitations.
:::

##### Modifying different properties

Using a JSON Patch to apply changes made by actions to the OpsChain properties ensures concurrent steps can modify independent properties successfully. For example:

```ruby
# Sets up an initial set of values for the OpsChain project properties, then calls the foo and bar child actions in parallel
action :default, steps: [:foo, :bar], run_as: :parallel do
  OpsChain.properties_for(:project) = { foo: 'old_foo', bar: 'old_bar' }
end

action :foo do
  OpsChain.properties_for(:project).foo = 'new_foo'
end

action :bar do
  OpsChain.properties_for(:project).bar = 'new_bar'
end
```

At the completion of the child steps, the OpsChain project properties will be:

```ruby
{ foo: 'new_foo', bar: 'new_bar' }
```

##### Race conditions

Modifying the same property in concurrent steps will produce unexpected results. In the example below, at the completion of the child steps, the final value of the `race` property will be the value assigned by the child step that completes last.

```ruby
# Sets up an initial set of values for the OpsChain project properties, then calls the foo and bar child actions in parallel
action :default, steps: [:foo, :bar], run_as: :parallel do
  OpsChain.properties_for(:project) = { race: 'initial value' }
end

action :foo do
  OpsChain.properties_for(:project).race = 'possible value 1'
end

action :bar do
  OpsChain.properties_for(:project).race = 'possible value 2'
end
```

##### Conflicting changes

In addition to the [race conditions](#race-conditions) example above, changes to OpsChain properties made by concurrent steps can create JSON Patch conflicts that will result in a change failing. The following scenarios are example of parallel steps that will generate conflicting JSON Patches.

_Scenario 1:_ Deleting a property in one child, while modifying that property's elements in the other.

```ruby
action :default, steps: [:foo, :bar], run_as: :parallel do
  OpsChain.properties_for(:project).parent = { child: 'value' }
end

action :foo do
  OpsChain.properties_for(:project).delete(:parent)
end

action :bar do
  OpsChain.properties_for(:project).parent.child = 'new value'
  sleep(10)
end
```

_Scenario 2:_ Modifying the data type of a property in one child, while generating a patch based on the original data type in the other.

```ruby
action :default, steps: [:foo, :bar], run_as: :parallel do
  OpsChain.properties_for(:project).parent = { child: 'value' }
end

action :foo do
  OpsChain.properties_for(:project).parent = 'I am now a string'
end

action :bar do
  OpsChain.properties_for(:project).parent.child = 'new value'
  sleep(10)
end
```

In both scenarios, the `default` action will fail running child step `bar`. As the child steps start with the properties defined by the `default` action, the logic within each child will complete successfully. However, as `bar` (with its included sleep) will finish last, the JSON Patch it produces will fail when OpsChain attempts to apply it as `foo` has changed the `parent` property to be incompatible with the patch made by `bar`. In both cases, the `child` element no longer exists and cannot be modified.

##### Resolving conflicts

If a step's JSON Patches fail to apply, the change will error at the failing step and the logs will provide the following information for each failed patch:

```json
ERROR: Updates made to the project properties in step "[c5556d54-d98f-415e-9198-4134848fb93f] bar" could not be applied.

Original project properties supplied to the step:
{
  "parent": {
    "child": "value"
  }
}

JSON Patch reflecting the updates made to the properties in the step (that cannot be applied):
[{
  "op": "replace",
  "path": "/parent/child",
  "value": "new value"
}]

Patched original properties - that could not be saved because the project properties were modified outside this step:
{
  "parent": {
    "child": "new value"
  }
}

Current value of project properties (that the JSON Patch fails to apply to):
{}

Please resolve this conflict manually and correct the project properties via the `opschain project set-properties` command. If applicable, retry the change to complete any remaining steps.
```

Use the four JSON documents from the change log, and your knowledge of the actions being performed by the conflicting steps, to:

1. construct a version of the properties that incorporates the required updates
2. use the CLI to manually update the relevant properties.

If there are no further steps in the change to run, there is no need to retry the failed change and you can continue using OpsChain as normal.

If there are further steps in the change to run, and the failed step is idempotent, you can use the `opschain change retry` command to restart the change from the failed step. **It is important to note that OpsChain will re-run the failed step in its entirety.**

If there are further steps in the change to run, and the failed step is NOT idempotent, you will need to create change(s) to perform the incomplete actions.

### File properties

OpsChain file properties are written to the working directory prior to the step action being initiated. Any property under `opschain.files` is interpreted as a file property and will be written to disk.

```json
{
  "opschain": {
    "files": {
      "/full/path/to/file1.txt": {
        "mode": "0600",
        "content": "contents of the file"
      },
      "~/path/to/file2.json": {
        "content": {
          "json": "file",
          "values": "here"
        },
        "format": "json"
      }
    }
  }
}
```

Each file property key is an absolute path (or will be [expanded](https://docs.ruby-lang.org/en/2.7.0/File.html#method-c-expand_path) to one) and represents the location the file will be written to. Each file property value can include the following attributes:

| Attribute | Description                                  |
| :-------- | :------------------------------------------- |
| mode      | The file mode, specified in octal (optional) |
| content   | The content of the file (optional)           |
| format    | The format of the file (optional)            |

#### File formats

The file format attribute provides OpsChain with information on how to serialise the file content (for storage in OpsChain properties), and de-serialise the content (before writing to the Opschain runner filesystem). The following formats are currently supported:

- base64
- json
- raw (default)

_Please contact LimePoint if you require other file formats._

#### Storing & removing files

The project or environment properties can be edited directly to add, edit or remove file properties (using a combination of a text editor, the `show-properties` and `set-properties` commands). In addition, OpsChain enables you to store and remove files from within your actions.

##### Project file properties

To store a file in the project properties

```ruby
  OpsChain.store_file!(:project, '/file/to/store.txt')
```

To remove a file from the project properties

```ruby
  OpsChain.remove_file!(:project, '/file/to/store.txt')
```

##### Environment file properties

To store a file in the environment properties

```ruby
  OpsChain.store_file!(:environment, '/file/to/store.txt')
```

To remove a file from the environment properties

```ruby
  OpsChain.remove_file!(:environment, '/file/to/store.txt')
```

##### Optional file format

The `store_file!` method accepts an optional `format:` parameter, allowing you to specify the [file format](#file-formats) OpsChain should use when adding the file into the file properties. For example:

```ruby
  OpsChain.store_file!(:environment, '/file/to/store.txt', format: :base64)
```

##### Storing files examples

Examples of storing files can be seen in the [Ansible example](https://github.com/LimePoint/opschain-examples-ansible).

- The `save_known_hosts` [action](concepts.md#action) in [`actions.rb`](https://github.com/LimePoint/opschain-examples-ansible/blob/master/actions.rb) uses this feature to store the SSH `known_hosts` file in the environment properties - to ensure the host is [trusted](https://en.wikipedia.org/wiki/Trust_on_first_use) in future steps and actions

### Environment variables

OpsChain environment variable properties allow you to configure the process environment prior to running your [step](concepts.md#step) [actions](concepts.md#action). Any property under `opschain.env` will be interpreted as an environment variable property.

```json
{
  "opschain": {
    "env": {
      "VARIABLE_NAME": "variable value",
      "DIFF_VARIABLE": "different variable value"
    }
  }
}
```

#### Action environment

Each [step](concepts.md#step) [action](concepts.md#action) is executed using the `opschain-action` command. This will define an environment variable for each of the OpsChain environment variable properties prior to executing the action.

##### Bundler credentials

[Bundler Gem source credentials can be configured via environment variables](https://bundler.io/v1.16/bundle_config.html#CREDENTIALS-FOR-GEM-SOURCES). Defining an OpsChain environment variable with the relevant username/password (e.g. `"BUNDLE_BITBUCKET__ORG": "username:password"`) will make this available to bundler.

#### Setting environment variables example

An example of setting environment variables can be seen in the [Ansible example](https://github.com/LimePoint/opschain-examples-ansible). The [`project_properties.json`](https://github.com/LimePoint/opschain-examples-ansible/blob/master/project_properties.json) contains the credentials to be able to successfully login to your AWS account.

### Secrets

[Kubernetes secrets](https://kubernetes.io/docs/concepts/configuration/secret/) can be used to store secure key value pairs. By default, the key value pairs in the `opschain-build-env` secret are supplied to the OpsChain build service when building the [step runner image](concepts.md#step-runner-image). Similarly, the key value pairs in the `opschain-runner-env` secret are supplied to the OpsChain runner container when running each change step. To override these defaults, the `opschain.env:build_secrets` and `opschain.env:runner_secrets` can be configured as follows:

```json
{
  "opschain": {
    "env:build_secrets": ["my-build-secrets"],
    "env:runner_secrets": ["my-runner-secrets"]
  }
}
```

See the [step runner reference guide](step-runner.md#project--environment-secret-configuration) for more information on configuring secrets for the [step runner image build](step-runner.md#secure-build-secrets) and [step execution](step-runner.md#secure-runner-secrets).
