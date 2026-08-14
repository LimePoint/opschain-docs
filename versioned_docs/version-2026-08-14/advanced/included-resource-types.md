---
sidebar_position: 7
description: The pre-defined resource types available in OpsChain.
---

# Included resource types

A collection of resource types come pre-installed on the OpsChain step runner image, this guide covers what they are and how to use them.

## Resource type summary

The table below outlines the file to `require` in your resource definition and the resource types that will become available.

| Require                                           | Resource type            | Description                                                                                        |
|:--------------------------------------------------|:-------------------------|:---------------------------------------------------------------------------------------------------|
| [`opschain-git-clone`](#opschain-git-clone)       | `git_clone`              | Check out one of the project's configured Git remotes into the step's working environment          |
| [`opschain-kubernetes`](#opschain-kubernetes)     | `kubernetes_resource`    | Manage Kubernetes resources via manifests in your project repo                                     |
|                                                   | `kubernetes_daemonset`   | Perform common operations on a Kubernetes daemonset resource                                       |
|                                                   | `kubernetes_deployment`  | Perform common operations on a Kubernetes deployment resource                                      |
|                                                   | `kubernetes_statefulset` | Perform common operations on a Kubernetes statefulset resource                                     |
| [`opschain-ssh-key-pair`](#opschain-ssh-key-pair) | `ssh_key_pair`           | Generate an SSH public/private key pair and optionally stores the key files in OpsChain properties |
| [`opschain-terraform`](#opschain-terraform)       | `terraform_config`       | Exposes the [RubyTerraform](https://github.com/infrablocks/ruby_terraform/tree/v1.8.0) Gem         |

### Usage

The resource types are pre-installed in the OpsChain step runner image via the `opschain-resource-types` Gem. To use them, simply add the following line to your `Gemfile` in your project Git repository:

```ruby
gem 'opschain-resource-types'
```

Then in your `actions.rb` (or wherever you define your resources) add:

```ruby
# replace 'opschain-infrastructure' with the relevant value from the "Require" column in the table above
require 'opschain-infrastructure'

# replace transport_factory with the required resource type from the "Resource Type" column in the table above
transport_factory :my_transport_factory do
  ...
end
```

## OpsChain infrastructure

Requiring `opschain-infrastructure` currently provides a minimal set of resource types for the [Confluent OpsChain example project](https://github.com/LimePoint/opschain-examples-confluent). More support will be added over time.

## OpsChain git clone

Requiring `opschain-git-clone` provides the `git_clone` resource type, which checks a Git repository out into a directory inside the step's working environment.

Most often the repository is one of the project's configured [Git remotes](/getting-started/familiarisation/gui/projects/git_remotes.md), referred to by the name the remote was given in OpsChain. OpsChain checks these out from its own server-side mirror of the remote, so no credentials are needed and the checkout is fast — it never has to talk to the actual remote over the network:

```ruby
git_clone 'app-config' do
  branch :main
end
```

A repository that is not configured in the project can be checked out by [supplying its URL and credentials](#checking-out-a-repository-that-is-not-configured-in-the-project) instead.

The checkout happens as OpsChain evaluates the `git_clone` block, so the files are already in place for any code that comes after it — including code that runs while your actions are being loaded. You do not have to invoke anything to make the checkout happen:

```ruby
git_clone 'app-config' do
  branch :main
end

action :show_config do
  config = YAML.load_file('/opt/opschain/app-config/config.yaml')
end
```

### Resource type properties

The `git_clone` resource type accepts the following properties:

| Property               | Default value                   | Description                                                                                                                                                                                                                                                                                                                                                                                                                |
|:-----------------------|:--------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `path`                 | `/opt/opschain/<resource name>` | The directory to check the repository out into. A relative value is resolved against `/opt/opschain` — the `opschain` user's home directory, where your project repository is checked out — so `path 'app-config'` checks out into `/opt/opschain/app-config`. Supply an absolute path to check out elsewhere. A value containing `..` is rejected, as is a resource name containing `/` or `..` when the default is used. |
| `branch`               | _(required)_                    | The branch to check out. Omitting this raises an error. A branch is the only thing that can be selected — a tag or a commit SHA is not resolved, and asking for one fails with `Branch "v1.2.3" was not found in the "app-config" git repository`.                                                                                                                                                                         |
| `clone_during_dry_run` | `false`                         | Whether to check the repository out when OpsChain loads your actions to *discover* them rather than to run a step — see [when the repository is checked out](#when-the-repository-is-checked-out). Set this to `true` if the repository holds YAML or similar configuration that your actions need in order to build the actions or the step tree.                                                                         |
| `url`                  |                                 | The URL of a repository that is **not** one of the project's Git remotes. See [checking out a repository that is not configured in the project](#checking-out-a-repository-that-is-not-configured-in-the-project). Supplying this means OpsChain fetches from the real remote rather than from a mirror, so any credentials the repository needs must be supplied too.                                                     |
| `user`                 |                                 | Username to authenticate an HTTPS `url` with. Not needed for a public repository.                                                                                                                                                                                                                                                                                                                                          |
| `password`             |                                 | Password or personal access token to authenticate an HTTPS `url` with.                                                                                                                                                                                                                                                                                                                                                     |
| `ssh_key`              |                                 | The **contents** of the private key to authenticate an SSH `url` with — not a path to a key file. Store the key in an [OpsChain property](/key-concepts/properties.md) and read it back, rather than committing it to your Git repository.                                                                                                                                                                                 |
| `passphrase`           |                                 | The passphrase for `ssh_key`, if it has one.                                                                                                                                                                                                                                                                                                                                                                               |

```ruby
git_clone 'app-config' do
  branch :main
  clone_during_dry_run true
end
```

:::warning[The default directory sits inside your project repository]
`/opt/opschain` is where OpsChain checks your project's Git repository out, so the default target directory — `/opt/opschain/<resource name>` — is a directory *inside* that checkout. If your project repository already contains a directory of that name, OpsChain refuses to check out over it:

```text
"/opt/opschain/app-config" already exists and is not a git working tree; refusing to check out over it
```

Name the resource something your project repository does not already contain, or set `path` to a location outside `/opt/opschain`.
:::

### When the repository is checked out

OpsChain loads your actions for two different reasons, and `clone_during_dry_run` decides what happens in the second of them:

- **To run a step.** The repository is always checked out, whatever `clone_during_dry_run` is set to.
- **To discover what your actions are, without running any of them.** The repository is checked out only if `clone_during_dry_run` is `true`.

OpsChain loads your actions purely to discover them when it generates an [asset template's](/getting-started/familiarisation/gui/projects/asset_templates.md) actions, and when it works out the step tree of a change that runs from one of the project's Git remotes — the step tree of such a change is not known until its first step loads the actions. Running `opschain-action --tasks` (or any of the other task listing options) loads them the same way.

So if your actions read a checked out file *while they are being loaded* — to build the actions or the step tree from it, as in the pattern below — you need `clone_during_dry_run true`. Without it, discovery fails with a missing file error even though the step itself would have run correctly.

:::tip[Declare the resource before the code that reads it]
Because the clone happens as OpsChain evaluates the `git_clone` block, only code appearing *after* the block can read the cloned files. Reading them earlier in the file fails with a missing file error, which looks as though the clone never happened rather than as though it had not happened *yet*.

We suggest declaring your `git_clone` resources at the top of your actions, ahead of anything that depends on their contents:

```ruby
git_clone 'app-config' do
  branch :main
  clone_during_dry_run true
end

config = YAML.load_file('/opt/opschain/app-config/config.yaml')

config['environments'].each do |environment|
  action "deploy_#{environment['name']}" do
    # ...
  end
end
```

<details>
<summary>Sharing repository declarations across several templates in one repository</summary>

A single Git repository often holds the actions for several [asset templates](/getting-started/familiarisation/gui/projects/asset_templates.md), each in a [folder named after its template code](/key-concepts/properties.md#template-folder-properties) - so each template has its own `actions.rb` entry point. When several of them need the same repositories checked out, declare those once in a shared file and require it from each entry point:

```text
git_clones.rb
web-server/actions.rb
database/actions.rb
```

```ruby
# git_clones.rb
git_clone 'app-config' do
  branch :main
  clone_during_dry_run true
end
```

```ruby
# web-server/actions.rb
require_relative '../git_clones'

config = YAML.load_file('/opt/opschain/app-config/config.yaml')
```

Declaring them in one place also removes a failure mode. Two templates that each declared `app-config` with a different branch, both checking out into the same directory, would raise the duplicate target error described below. With a single declaration they cannot disagree.

The ordering rule above still applies, one level further out: the `require_relative` must come before any code that reads the checked out files.

</details>
:::

:::warning[Set `clone_during_dry_run` on its own, not through `properties`]
Setting it through the bulk `properties` form has no effect during a dry run, and fails silently:

```ruby
git_clone 'app-config' do
  properties(clone_during_dry_run: true) # does nothing during a dry run
end
```

OpsChain skips bulk property assignment entirely while loading your actions for a dry run, so the property is never set, the repository is not cloned, and nothing reports a problem - it simply looks as though the setting is being ignored. Set it as its own property instead:

```ruby
git_clone 'app-config' do
  clone_during_dry_run true
end
```

This applies to every resource property rather than only this one, but it matters most here, because this is the property whose whole purpose is to change what happens during a dry run.
:::

### Checking out a repository that is not configured in the project

Supply a `url` instead of naming one of the project's Git remotes. There is no mirror for such a repository, so OpsChain fetches from the real remote over the network and you must supply whatever credentials it needs. Keep those in [OpsChain properties](/key-concepts/properties.md) rather than in your Git repository:

```ruby
# a public repository needs no credentials
git_clone 'opschain-docs' do
  url 'https://github.com/LimePoint/opschain-docs.git'
  branch :master
end

# a private repository over HTTPS
git_clone 'app-config' do
  url 'https://github.com/my-org/app-config.git'
  user OpsChain.properties.github.user
  password OpsChain.properties.github.token
  branch :main
end

# a private repository over SSH - ssh_key takes the key itself, not a path to it
git_clone 'app-config' do
  url 'git@github.com:my-org/app-config.git'
  ssh_key OpsChain.properties.deploy_key
  passphrase OpsChain.properties.deploy_key_passphrase # omit if the key has no passphrase
  branch :main
end
```

:::note
Read the key out of a property directly, as above, rather than reading a [file property](/key-concepts/properties.md#file-properties) from disk. OpsChain does not write file properties out when it loads your actions [to discover them](#when-the-repository-is-checked-out), so a `File.read` of a key file raises `Errno::ENOENT` in exactly the case `clone_during_dry_run true` exists to support.
:::

Credentials are never passed on a command line, and a `url` that embeds credentials (`https://user:password@host/…`) is rejected — use `user` and `password` instead.

A repository checked out from a `url` does not go through the project's Git remotes, so the [`git_remote.mountable`](/key-concepts/settings.md#git_remotemountable) setting does not apply to it.

### Availability

Which of the project's Git remotes OpsChain will mirror into a step is controlled by the [`git_remote.mountable`](/key-concepts/settings.md#git_remotemountable) setting. By default every one of the project's active Git remotes is available, so `git_clone` works without any extra configuration.

The mirrors themselves are exposed to the step read-only — `git_clone` checks out from them, it never writes back to them.

OpsChain refreshes the mirrors of the available Git remotes immediately before creating the runner pod, then mounts them for the life of that pod. `branch :main` therefore resolves to whatever the mirror's tip of `main` was when the pod was created — a commit pushed to the remote while the change is running is not picked up, and neither is a Git remote added to the project after the pod started.

If that refresh fails, because the remote is unreachable for example, OpsChain records a `warn:git_remote:mountable_fetch_failed` [event](/key-concepts/events.md) and carries on rather than failing the change. The mirror the step checks out from may therefore be out of date, or missing altogether if the remote has never been fetched successfully.

### Idempotent checkouts

Checking out a repository is idempotent. If the target directory already holds a checkout at the commit the requested branch currently resolves to, OpsChain leaves it untouched. If the branch has moved on since, or a previous checkout was interrupted partway through, OpsChain checks it out again.

:::note
Two `git_clone` resources in the same step that target the same directory with different configuration (for example, different branches) raise a clear error, rather than one silently overwriting the other.
:::

### Current limitations

- Running on a multi-node Kubernetes cluster is not yet supported for this feature.

## OpsChain Kubernetes

Requiring `opschain-kubernetes` provides several resources for working with Kubernetes. These resources wrap the `kubectl` binary to allow you to perform some common Kubernetes operations.

### Prerequisites

The `kubectl` binary must be available in your runner environment and is not included by default. To install `kubectl`, a [custom Dockerfile](/key-concepts/step-runner.md#custom-step-runner-dockerfiles) must be included in your project's `.opschain` directory.

Below is an example Dockerfile RUN directive for adding `kubectl` to your runner.

```Dockerfile
...
# Run any Dockerfile commands that don't rely on the contents of the Git repository here to avoid rerunning them when the Git repo changes.
RUN curl -L -o /usr/local/bin/kubectl "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" && \
    chmod +x /usr/local/bin/kubectl
...
```

### Authentication

There are multiple options available to authenticate with the Kubernetes cluster that you want to manage.

#### In-cluster service account config

By default, the `opschain-kubernetes` resource will use the `opschain-runner` service account to manage Kubernetes resources in the same cluster that OpsChain runs. You will need to grant the `opschain-runner` additional permissions to manage resources in your desired namespace(s) via additional RoleBindings or ClusterRoleBindings. Managing roles & permissions in your cluster is outside the scope of this documentation. Please see the [Kubenetes RBAC documentation](https://kubernetes.io/docs/reference/access-authn-authz/rbac/) for more details.

#### Kubeconfig via OpsChain file properties

If you need to manage Kubernetes resources in another cluster, or don't want to use the `opschain-runner` service account as your identity, you can provide a custom [kubeconfig file](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/) that will be read by `kubectl`. To do this, add a kubeconfig file via OpsChain file properties with the path `/opt/opschain/.kube/config`. See the [OpsChain properties documentation](/key-concepts/properties.md#file-properties) for more information on adding file properties.

To use an alternative kubeconfig path set the [KUBECONFIG](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/#the-kubeconfig-environment-variable) environment variable via [OpsChain properties](/key-concepts/properties.md#environment-variables).

### Resource types

#### kubernetes_resource

The `kubernetes_resource` type provides a generic type with `apply` and `delete` actions for managing any valid Kubernetes resources via manifest files present in your project repository.

```ruby
kubernetes_resource :nginx do
  manifest_path 'k8s/nginx.yaml'
  namespace 'myapp'
end
# provides nginx:apply and nginx:delete actions
```

#### kubernetes_daemonset, kubernetes_deployment, kubernetes_statefulset

The `kubernetes_daemonset`, `kubernetes_deployment`, and `kubernetes_statefulset` resource types provide actions for performing `restart`, `scale`, and `wait` operations on the standard 'workload' resources running within a Kubernetes cluster.

All three of these resource types provide the same functionality, but are provided as separately named types to account for how the resources are addressed within Kubernetes.

```ruby
kubernetes_deployment :nginx do
  name 'nginx'
  namespace 'myapp'
  replicas 1
  wait_for_condition 'Available'
end
# provides nginx:restart, nginx:scale, and nginx:wait actions
```

### Utilities

#### Logs

The `kubernetes_daemonset`, `kubernetes_deployment`, and `kubernetes_statefulset` types also provide access to a `logs` method on their controller.

The `logs` method requires you to pass a `tail: <number of lines>` argument to specify the number of log lines you would like returned. If you would like to return all log lines for the lifespan of the pod, you can use `tail: -1`. **PLEASE NOTE** that if your workload is a particularly noisy logger, this may result in a large amount of logs being buffered into memory, so use this with caution.

```ruby
kubernetes_deployment :nginx do
  name 'nginx'
  namespace 'myapp'

  desc 'Wait until nginx deployment is available and show logs'
  action logs: ['nginx:wait'] do
    controller.logs(tail: 100).each do |line|
      OpsChain.logger.info line
    end
  end
end
```

By default, logs will return the logs for all containers in a pod, but you can also provide a `container: '<container name>'` argument to only return logs from a single container from within the pod.

```ruby
action :logs do
  logs = controller.logs(tail: 100, container: 'app')
  # do something with logs
end
```

## OpsChain SSH key pair

Requiring `opschain-ssh-key-pair` provides the `ssh_key_pair` resource type.

### Resource type properties

The `ssh_key_pair` resource type accepts the following properties:

| Property      | Default value        | Description                                                                                                                                                                                                                                                                                                                                                                                                    |
|:--------------|:---------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `key_path`    | `/opt/opschain/.ssh` | The location to generate the SSH key pair. <br/>_Note: the default path is the `opschain` user's default SSH path._                                                                                                                                                                                                                                                                                            |
| `private_key` | `id_rsa`             | The file name of the private key to generate (if a DSA type key is generated, the private key file name will default to `id_dsa`).                                                                                                                                                                                                                                                                             |
| `public_key`  | `id_rsa.pub`         | The file name of the public key to generate (if a DSA type key is generated, the public key file name will default to `id_dsa.pub`).                                                                                                                                                                                                                                                                           |
| `type`        | `RSA`                | The type of key to generate. Valid values are: <br/> - `RSA` <br/> - `DSA`                                                                                                                                                                                                                                                                                                                                     |
| `bits`        | `4096`               | Determines the strength of the key in bits as an integer.                                                                                                                                                                                                                                                                                                                                                      |
| `store_in`    | `:environment`       | The OpsChain properties to store the generated key pair. Valid values are: <br/> - `:environment` the key pair will be stored in the OpsChain environment properties <br/> - `:project`  the key pair will be stored in the OpsChain project properties <br/> - `nil` the key pair will not be automatically stored in OpsChain properties (see notes on key storage in the [actions](#actions) section below) |
| `passphrase`  |                      | Optional passphrase to assign to the private key.                                                                                                                                                                                                                                                                                                                                                              |

### Actions

The `ssh_key_pair` resource type provides the following actions:

| Action              | Description                                                                                                                                                                                                                                                                                  |
|:--------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `create`            | Creates an SSH public/private key pair inside the `key_path` folder with the filenames specified by `public_key`/`private_key` and optionally stores the files in OpsChain properties. <br/>_Note: If the `private_key` or `public_key` exists in the `key_path`, they will be overwritten_. |
| `create_if_missing` | Validates that the `private_key` and `public_key` exists in the `key_path`. If either is missing, generates a new key pair and optionally stores the key pair in the OpsChain properties.                                                                                                    |

:::note[Notes on key storage]
The SSH key pair will be generated inside the OpsChain step runner container. By default the key pair will be stored in the OpsChain environment properties, making them accessible to future changes run in this environment (and subsequent steps in the current change). If you wish to use the key pair in other environments within the project, set the `store_in` resource property to `:project`. The key pair will then be stored in the OpsChain project properties and available to all changes run in that project.

If you do not wish to store the key pair in the OpsChain properties, `store_in` can be set to `nil`. _Please note: If you do not store the generated keys in OpsChain properties, they will cease to exist when the step runner container is removed. For this reason, ensure the step stores the keys (e.g. in [Hashicorp Vault](https://www.vaultproject.io), as a [Kubernetes secret](https://kubernetes.io/docs/concepts/configuration/secret/), on another server, etc.) to allow them to be used in the future._
:::

## Examples

The [OpsChain AWS Ansible](https://github.com/LimePoint/opschain-examples-ansible), [OpsChain Confluent](https://github.com/LimePoint/opschain-examples-confluent) and [OpsChain WebLogic](https://github.com/LimePoint/opschain-examples-weblogic) example projects all make use of the `ssh_key_pair` resource type to generate SSH key pairs for their respective target containers.

## OpsChain Terraform

Requiring `opschain-terraform` provides the `terraform_config` resource type. The resource type will accept any of the [RubyTerraform](https://github.com/infrablocks/ruby_terraform/blob/v1.8.0/README.md) command arguments as properties, but will only pass those supported by the command when the action is invoked.

Please see the [RubyTerraform module documentation](https://infrablocks.github.io/ruby_terraform/RubyTerraform.html) for further information about the available actions and their parameters.

:::note
RubyTerraform supplies `vars` to Terraform on the command line via multiple `-var` parameters. OpsChain overrides this logic by placing the [input variables](https://www.terraform.io/docs/language/values/variables.html) in a [var file](https://www.terraform.io/docs/language/values/variables.html#variable-definitions-tfvars-files) and supplying this to Terraform via the `-var-file` parameter to avoid encountering any command line length issues.
:::

### Prerequisites

`opschain-terraform` does not include the Terraform binary. Customers wishing to use the resource type will need to install Terraform in their project's step runner. This can be done by using a [custom step runner Dockerfile](/key-concepts/step-runner.md#custom-step-runner-dockerfiles). An example of this can be found in the [OpsChain Confluent example](https://github.com/LimePoint/opschain-examples-confluent/blob/75473f7fbac4150b3d5c583dfc52c6b22044552f/.opschain/Dockerfile#L8).

### Automatic Terraform initialisation

The `terraform_config` resource type will automatically execute `terraform init` in the OpsChain runner prior to running any Terraform action.

### Automatic state storage

The `terraform_config` resource type will automatically store the `terraform.tfstate` file in the environment properties after running any Terraform action. This ensures that the file is available to subsequent steps in your change.

:::note
If the `state_out` property of Terraform is used, the resource type does not automatically store the file. Please use the [`store_file!` feature](/key-concepts/properties.md#storing--removing-files) (after moving the file to the desired location) to store the file.
:::

### Command argument defaults

Default values will be supplied for the following RubyTerraform command arguments:

| Argument     | Default value | Description                                                                                                                                                                |
|:-------------|:--------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| auto_approve | true          | Indicates that Terraform should not require interactive approval before applying a plan.                                                                                   |
| chdir        | `pwd`         | The root directory of your project Git repository within the OpsChain step runner.                                                                                         |
| input        | false         | Indicates that Terraform should not attempt to prompt for input, and instead expect all necessary values to be provided by either configuration files or the command line. |

:::tip
Resources can override these values if required.
:::

### Terraform automation environment variable

The Terraform `TF_IN_AUTOMATION` environment variable is automatically configured when running `terraform_config` actions. This will indicate to Terraform that there is some wrapping application executing terraform and cause it to make adjustments to its output to de-emphasize specific commands to run next. For further information see [controlling Terraform output in automation](https://learn.hashicorp.com/tutorials/terraform/automate-terraform#controlling-terraform-output-in-automation).

## Examples

The [OpsChain Terraform example project](https://github.com/LimePoint/opschain-examples-terraform) demonstrates how the OpsChain Terraform resource type can be used.

The [OpsChain AWS Ansible example project](https://github.com/LimePoint/opschain-examples-ansible) demonstrates how the OpsChain Infrastructure and OpsChain Terraform resource types can be combined with Ansible to deploy an nginx host on AWS.

The [OpsChain Confluent example project](https://github.com/LimePoint/opschain-examples-confluent) demonstrates how the OpsChain Infrastructure and OpsChain Terraform resource types can be used together.
