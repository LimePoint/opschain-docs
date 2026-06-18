# OpsChain CLI Guide

A complete reference for the OpsChain (and MintPress) command-line interface — from first-time setup through advanced automation patterns.

---

## 1. Introduction

The OpsChain CLI (`opschain`) is the primary tool for interacting with the OpsChain API from the command line. OpsChain is a GitOps-based, event-driven change manager — it can orchestrate any repeatable, auditable change across your systems: software deployments, configuration updates, compliance remediations, database migrations, and more. The CLI allows you to manage every resource in your OpsChain instance: projects, environments, assets, workflows, changes, scheduled activities, and authorisation policies.

### Multi-brand note

The same binary codebase ships as two branded products:

| Binary | Config directory | Env var prefix |
|---|---|---|
| `opschain` | `~/.opschain/` | `OPSCHAIN_` |
| `mintpress` | `~/.mintpress/` | `MINTPRESS_` |

Branding is detected automatically from the binary filename.

> **Note:** All examples in this guide use `opschain`. Every command works identically with `mintpress` — simply substitute the binary name. The two binaries are interchangeable in all contexts.

---

## 2. Installation & Setup

### Download a pre-built binary (recommended)

Pre-built binaries for all platforms are published to the public [limepoint/product-releases](https://github.com/limepoint/product-releases/releases) repository.

1. Go to [github.com/limepoint/product-releases/releases](https://github.com/limepoint/product-releases/releases) and find the latest release.
2. Download the zip for your platform:
    | Platform | File |
    |----------|------|
    | macOS (Apple Silicon) | `opschain_darwin_arm64.zip` |
    | macOS (Intel) | `opschain_darwin_amd64.zip` |
    | Linux (x86-64) | `opschain_linux_amd64.zip` |
    | Linux (ARM64) | `opschain_linux_arm64.zip` |
    | Windows (x86-64) | `opschain_windows_amd64.zip` |
    | Windows (ARM64) | `opschain_windows_arm64.zip` |

3. Unzip and place the binary on your `PATH`:

   ```bash
   # macOS / Linux example
   unzip opschain_darwin_arm64.zip
   chmod +x opschain
   sudo mv opschain /usr/local/bin/
   ```

4. On **macOS**, the binary is signed and notarized by LimePoint — Gatekeeper will accept it automatically. If you see a security prompt, go to **System Settings → Privacy & Security** and click **Allow Anyway**.
  MintPress users: download `mintpress_<platform>.zip` from the same release page.

### Use the Docker image

Docker images are published to Docker Hub for Linux (amd64 and arm64). This is the recommended option for CI/CD pipelines and Linux servers.

| Image | Docker Hub |
|-------|-----------|
| OpsChain | `limepoint/opschain-cli` |
| MintPress | `limepoint/mintpress-cli` |

```bash
# Always latest
docker run --rm limepoint/opschain-cli:latest --help

# Pinned version
docker run --rm limepoint/opschain-cli:1.0.0 --help
```

Pass credentials via environment variables — no config file needed:

```bash
docker run --rm \
  -e OPSCHAIN_API_URL=https://opschain.example.com \
  -e OPSCHAIN_USERNAME=alice \
  -e OPSCHAIN_PASSWORD=s3cr3t \
  limepoint/opschain-cli:latest projects list
```

To use a config file from your host machine, mount it:

```bash
docker run --rm \
  -v ~/.opschain:/home/opschain/.opschain:ro \
  limepoint/opschain-cli:latest --profile staging projects list

# MintPress
docker run --rm \
  -v ~/.mintpress:/home/mintpress/.mintpress:ro \
  limepoint/mintpress-cli:latest --profile staging projects list
```

> **Note:** macOS and Windows users can use these Docker images via Docker Desktop, which runs a Linux VM transparently. For native macOS/Windows, download the pre-built binary above instead.

### Verify installation

```bash
opschain version
# opschain version 1.0.0
#   commit: abc1234
#   built:  2025-01-01 00:00:00 UTC
```

---

## 3. Configuration

### 3.1 Config file format

The config file lives at `~/.opschain/config.yaml` by default. A typical multi-profile file looks like this:

```yaml
current_profile: dev
profiles:
  dev:
    api_url: https://dev.opschain.example.com
    username: alice
    password: s3cr3t
    insecure: false
    timeout: 60
    default_project: platform
  staging:
    api_url: https://staging.opschain.example.com
    token: eyJhbGciOiJIUzI1NiJ9...   # bearer token instead of username/password
    timeout: 120
  prod:
    api_url: https://opschain.example.com
    username: deploy-bot
    password: prodsecret
    insecure: false
    timeout: 300
    default_project: production
```

**Profile fields:**

| Field | Type | Description |
|---|---|---|
| `api_url` | string | Full URL to the API root (e.g. `https://host`) |
| `username` | string | HTTP Basic Auth username |
| `password` | string | HTTP Basic Auth password |
| `token` | string | Bearer token (alternative to username/password — takes precedence when set) |
| `insecure` | bool | Skip TLS certificate verification (dev only) |
| `timeout` | int | HTTP request timeout in seconds (default: 60) |
| `default_project` | string | Default project code — omit `--project` flag when set |

### 3.2 Profiles

Profiles let you maintain separate credentials for different OpsChain instances (dev, staging, production) in a single config file.

```bash
# Manage profiles interactively
opschain config profiles add dev
opschain config profiles add staging --token eyJhbGci...   # token-based profile
opschain config profiles list
opschain config profiles show dev
opschain config profiles update dev --api-url https://new-dev.example.com
opschain config profiles update staging --token eyJnewToken...   # refresh a token
opschain config profiles use staging      # sets current_profile in config file
opschain config profiles delete old-env

# Use a non-default profile for a single command
opschain --profile staging projects list
opschain -p prod changes list
```

**Reducing repetition with profiles:**

Once you have set `current_profile` in your config file (via `opschain config profiles use dev`), you no longer need to pass `--profile` on every command. Once you have set `default_project` in that profile, you no longer need to pass `--project` on project-scoped commands.

```bash
# Without any profile configuration — must supply everything each time
opschain --profile dev environments list --project myproject
opschain --profile dev workflows list --project myproject
opschain --profile dev changes list --project myproject

# After: opschain config profiles use dev
# (sets current_profile=dev in config file — profile flag no longer needed)
opschain environments list --project myproject
opschain workflows list --project myproject

# After also setting default_project=myproject in the dev profile:
# (opschain config profiles update dev --default-project myproject)
opschain environments list
opschain workflows list
opschain changes list
```

### 3.3 Environment Variables

Environment variables override the config file — useful in CI/CD pipelines where you don't want to store config files on build agents.

**OpsChain variables:**

| Variable | Config equivalent | Description |
|---|---|---|
| `OPSCHAIN_API_URL` | `api_url` | API base URL |
| `OPSCHAIN_USERNAME` | `username` | Username |
| `OPSCHAIN_PASSWORD` | `password` | Password |
| `OPSCHAIN_TOKEN` | `token` | Bearer token (takes precedence over username/password) |
| `OPSCHAIN_PROFILE` | — | Profile name to use |
| `OPSCHAIN_INSECURE` | `insecure` | `true` or `1` to skip TLS verification |
| `OPSCHAIN_TIMEOUT` | `timeout` | Timeout in seconds |
| `OPSCHAIN_DEFAULT_PROJECT` | `default_project` | Default project code |

**MintPress equivalents:** Replace `OPSCHAIN_` with `MINTPRESS_` (e.g. `MINTPRESS_API_URL`, `MINTPRESS_TOKEN`).

**Precedence order (highest to lowest):**

1. `--token` command-line flag
2. Environment variables (`OPSCHAIN_TOKEN`, `OPSCHAIN_USERNAME`, `OPSCHAIN_PASSWORD`, …)
3. `--profile` / `-p` command-line flag
4. `OPSCHAIN_PROFILE` environment variable
5. `current_profile` in config file

**Auth method precedence:** When both a token and username/password are present (from any source), the bearer token is always used.

```bash
# Config-file-free usage with basic auth
export OPSCHAIN_API_URL=https://dev.opschain.example.com
export OPSCHAIN_USERNAME=alice
export OPSCHAIN_PASSWORD=s3cr3t
opschain projects list

# Config-file-free usage with bearer token
export OPSCHAIN_API_URL=https://dev.opschain.example.com
export OPSCHAIN_TOKEN=eyJhbGciOiJIUzI1NiJ9...
opschain projects list
```

### 3.4 Bearer Token Authentication

OpsChain supports bearer token authentication as an alternative to username/password. There are two token types:

- **Access tokens** — short-lived (typically a few hours), obtained via `tokens login`
- **API key tokens** — long-lived, created via `tokens create-api-key` for automation

#### Why use tokens?

- **CI/CD pipelines** — store a token as a secret instead of username + password
- **Fine-grained expiry** — tokens expire automatically; no need to rotate passwords
- **Auditing** — token usage is tracked separately from interactive sessions
- **Security** — a compromised token can be revoked without changing a user's password

#### `tokens login` — obtain and save a token

`tokens login` authenticates with username and password, receives a bearer token from the API, and saves it to the active profile. All subsequent commands automatically use the bearer token.

```bash
# Interactive — prompts for username and password
opschain tokens login

# Non-interactive — supply credentials via flags
opschain tokens login --username alice --password s3cr3t

# Non-interactive — supply credentials via environment variables
OPSCHAIN_USERNAME=alice OPSCHAIN_PASSWORD=s3cr3t opschain tokens login

# Against a specific API URL (useful before a profile is fully set up)
opschain tokens login --api-url https://staging.opschain.example.com
```

After a successful login, the token is written to the active profile's `token` field. You can confirm which auth method is being used with `--debug` (see §17).

> **Token expiry:** Access tokens are short-lived (typically a few hours). Re-run `opschain tokens login` when a token expires — you will get a 401 response if it has.

#### `tokens logout` — revoke the current session

Revokes the active access token via the API and clears it from the active profile.

```bash
opschain tokens logout
```

#### `tokens list` — view all tokens

Lists all tokens for the current user, sorted by expiry date (furthest expiry first).

```bash
opschain tokens list
opschain tokens list --output json
```

#### `tokens get` — inspect a token

```bash
opschain tokens get <id>
```

#### `tokens current` — show the active session token

Shows the token currently being used for API calls.

```bash
opschain tokens current
```

#### `tokens delete` — revoke a token by ID

```bash
opschain tokens delete <id>
```

#### `tokens delete-all` — revoke all tokens

Revokes every token for the current user. Prompts for confirmation unless `--force` is passed. The current session token is deleted last to keep authentication valid throughout. Clears the token from the active profile on success.

```bash
# Interactive confirmation
opschain tokens delete-all

# Non-interactive (CI / scripts)
opschain tokens delete-all --force
```

#### `tokens create-api-key` — create a long-lived API key

Creates an API key token for automation. The bearer token is printed once on creation — store it securely as it cannot be retrieved again.

```bash
# Minimal — uses profile credentials for auth
opschain tokens create-api-key --description "CI deploy token"

# With an expiry date
opschain tokens create-api-key --description "CI deploy token" --expiry-date 2026-12-31
```

| Flag | Description |
|---|---|
| `--description` | Human-readable label for the token |
| `--expiry-date` | Expiry date in `YYYY-MM-DD` format |
| `--username` | Username override (if not using profile credentials) |
| `--password` | Password override (if not using profile credentials) |

#### Credential resolution order

When making any API call the CLI checks for credentials in this order and uses the first one it finds:

1. `--token` command-line flag
2. `OPSCHAIN_TOKEN` environment variable
3. `token` field in the active profile
4. Basic auth: `OPSCHAIN_USERNAME` / `OPSCHAIN_PASSWORD` environment variables
5. Basic auth: `username` / `password` fields in the active profile

---

## 4. Global Flags

These flags are available on every command.

| Flag | Short | Default | Description |
|---|---|---|---|
| `--config` | | `~/.opschain/config.yaml` | Path to config file |
| `--profile` | `-p` | (current_profile) | Connection profile to use |
| `--token` | | — | Bearer token (overrides profile token and basic auth) |
| `--output` | `-o` | `table` | Output format: `table`, `json`, `yaml` |
| `--quiet` | `-q` | false | Print only IDs (for scripting) |
| `--debug` | | false | Log HTTP request/response details to stderr |
| `--insecure` | `-k` | false | Skip TLS certificate verification |
| `--stacktrace` | | false | Print Go stack trace on error |

### Output formats

```bash
# Default table output — human-readable
opschain projects list

# JSON — full response, pipe to jq
opschain projects list -o json | jq '.[].attributes.name'

# YAML — full response
opschain projects get myproject -o yaml
```

### Quiet mode

`-q` / `--quiet` prints only resource IDs (one per line), making it easy to capture them in shell scripts.

```bash
# Capture a list of all project codes
PROJECTS=$(opschain projects list -q)

# Capture a newly-created change ID
CHANGE_ID=$(opschain changes create -E dev -A myasset -a deploy -q)
echo "Created change: $CHANGE_ID"
```

> **Note:** `--debug` output (HTTP logs) always goes to **stderr**. Normal output goes to **stdout**. You can redirect them independently:
> ```bash
> opschain --debug projects list 2>debug.log
> ```

---

## 5. Projects

Projects are the top-level organisational unit in OpsChain. Everything else — environments, assets, workflows, git remotes — lives inside a project.

### Commands

```bash
# List all projects
opschain projects list
opschain projects list -o json

# Get a project by its code
opschain projects get myproject
opschain projects get myproject -o yaml

# Create a project
opschain projects create --code myproject --name "My Project" --description "Demo project"
opschain projects create --code quickproj   # name defaults to code

# Update a project
opschain projects update myproject --name "New Name"
opschain projects update myproject --description "Updated description"
opschain projects update myproject --archived=true    # archive
opschain projects update myproject --archived=false   # unarchive

# Delete a project
opschain projects delete myproject
opschain projects delete myproject -q   # prints deleted code
```

**Create flags:**

| Flag | Required | Default | Description |
|---|---|---|---|
| `--code` | Yes | — | Unique project code |
| `--name` | No | same as code | Human-readable name |
| `--description` | No | — | Optional description |
| `--type` | No | `Enterprise` | Project type |

**Update flags** (at least one required):

| Flag | Description |
|---|---|
| `--name` | New project name |
| `--description` | New description (pass empty string to clear) |
| `--archived` | `true` to archive, `false` to unarchive |

### Project properties

Properties are versioned key-value data attached to a project.

```bash
# Get current (latest) properties
opschain projects properties get myproject

# Get a specific version
opschain projects properties get myproject --version 3

# Update properties inline
opschain projects properties update myproject --data '{"db_host": "prod-db.internal"}'

# Update from a JSON/YAML file
opschain projects properties update myproject --from-file properties.json

# List all versions
opschain projects properties versions myproject

# Upload a binary file as a property attachment
opschain projects properties upload-file myproject --property cert --file /path/to/cert.pem
```

### Project settings

Settings work identically to properties but use a different API endpoint.

```bash
opschain projects settings get myproject
opschain projects settings update myproject --data '{"log_level": "info"}'
opschain projects settings versions myproject
```

---

## 6. Git Remotes

Git remotes define where OpsChain fetches your code from. They are scoped to a project.

### Commands

> **Note:** Commands in this section require a project code. Either pass `--project <code>` / `-P <code>` on each command, or set `default_project` in your active profile (see §3.1) to omit it entirely.

```bash
# List all git remotes in a project
opschain git-remotes list

# Get a remote by name (default) or ID
opschain git-remotes get github
opschain git-remotes get --id abc123

# Create a remote with HTTPS authentication
opschain git-remotes create \
  --name github \
  --url https://github.com/acme/infra.git \
  --user gituser \
  --password ghp_token

# Create a remote with SSH key
opschain git-remotes create \
  --name github-ssh \
  --url git@github.com:acme/infra.git \
  --ssh-key-file ~/.ssh/opschain_rsa

# Update credentials only (name and URL are immutable after creation)
opschain git-remotes update github --password new_token
opschain git-remotes update github --ssh-key-file ~/.ssh/new_key

# Archive a remote (soft-delete)
opschain git-remotes archive github
opschain git-remotes archive github --archive=false  # unarchive

# Delete a remote permanently
opschain git-remotes delete github
```

**Create flags:**

| Flag | Required | Description |
|---|---|---|
| `--name` | Yes | Remote name (used to reference this remote) |
| `--url` | Yes | Git repository URL |
| `--user` | No | Username for HTTPS authentication |
| `--password` | No | Password/token for HTTPS authentication |
| `--ssh-key-file` | No | Path to SSH private key file |

> **Tip:** Use the `--id` flag on `get`, `archive`, `update`, and `delete` to reference a remote by UUID instead of its human-readable name.

---

## 7. Environments

Environments (e.g. `dev`, `staging`, `prod`) are scoped inside a project and provide isolated execution contexts for assets and changes.

### Commands

> **Note:** Commands in this section require a project code. Either pass `--project <code>` / `-P <code>` on each command, or set `default_project` in your active profile (see §3.1) to omit it entirely.

```bash
# List environments in a project
opschain environments list

# Get by name (default), code, or ID
opschain environments get dev
opschain environments get --code dev
opschain environments get --id abc-uuid

# Create an environment
opschain environments create --code dev --name "Development"
opschain environments create \
  --code staging \
  --name "Staging" \
  --description "Pre-production environment"

# Update name or description
opschain environments update dev --name "Dev (updated)"
opschain environments update dev --description "New description"

# Delete an environment
opschain environments delete dev
```

### Environment properties and settings

```bash
opschain environments properties get dev
opschain environments properties update dev \
  --data '{"region": "us-east-1", "cluster": "k8s-prod"}'
opschain environments properties versions dev

opschain environments settings get staging
opschain environments settings update staging --from-file settings.json
```

---

## 8. Asset Templates

Asset templates define the available asset types in OpsChain. Each template has a `code`, `name`, `template_type`, and is associated with a git remote.

> **Note:** Commands in this section require a project code. Either pass `--project <code>` / `-P <code>` on each command, or set `default_project` in your active profile (see §3.1) to omit it entirely.

### Commands

```bash
# List all available templates
opschain templates list

# Get a specific template
opschain templates get my-template-code
opschain templates get my-template-code -o json
```

### View the resolved template for an asset

```bash
# See the template that a specific asset is using
opschain assets template myasset
opschain assets template myasset -E dev
```

---

## 9. Assets

Assets are instances of templates, representing anything you want to manage as a discrete unit — services, databases, configuration targets, compliance controls, or any other entity. They are scoped to a project and optionally to an environment.

> **Note:** Commands in this section require a project code. Either pass `--project <code>` / `-P <code>` on each command, or set `default_project` in your active profile (see §3.1) to omit it entirely.

### Commands

```bash
# List assets in a project
opschain assets list

# List assets scoped to a specific environment
opschain assets list -E dev

# Get an asset by code
opschain assets get myasset
opschain assets get myasset -E dev

# Create an asset
opschain assets create \
  --code myasset \
  --name "My Application" \
  --description "The main application server" \
  --template-code app-template \
  --template-version v1.2

# Create an environment-scoped asset
opschain assets create -E dev \
  --code myasset \
  --name "My Application (Dev)" \
  --description "Dev instance" \
  --template-code app-template \
  --template-version v1.2

# Update an asset
opschain assets update myasset --name "New Name"
opschain assets update myasset --description "Updated description"
opschain assets update myasset --archived=true   # archive
opschain assets update myasset --regenerate-actions=true  # refresh actions list

# Delete an asset
opschain assets delete myasset
```

### Asset properties and settings

```bash
opschain assets properties get myasset
opschain assets properties update myasset \
  --data '{"replicas": 3, "image_tag": "v2.1.0"}'
opschain assets settings get myasset -E dev
```

### Generate Actions

When OpsChain needs to discover what actions a template exposes, it builds the container image and queries it. This is managed via generate-actions requests.

```bash
# Trigger action generation for an asset
opschain assets generate-actions create myasset
opschain assets generate-actions create myasset -E dev

# List all generation requests for an asset
opschain assets generate-actions list myasset

# Get status of a specific request
opschain assets generate-actions get myasset <request-id>

# View logs from a generation request
opschain assets generate-actions logs <request-id>

# Cancel a running generation request
opschain assets generate-actions cancel myasset <request-id>
```

---

## 10. Agents

Agents are containerised execution environments that run OpsChain actions. Each agent is built from a template and can be independently started, stopped, and rebuilt.

> **Note:** All agent commands require `--project` / `-P`. Use `-E` to scope agents to an environment.

### 10.1 Basic CRUD

```bash
# List agents in a project
opschain agents list -P myproject

# List agents scoped to an environment
opschain agents list -P myproject -E dev

# Get an agent by code
opschain agents get myagent -P myproject

# Create an agent from a template
opschain agents create -P myproject \
  --code myagent \
  --name "My Agent" \
  --template-code agent-template \
  --template-version v1.0

# Update an agent
opschain agents update myagent -P myproject --name "New Name"
opschain agents update myagent -P myproject --archived=true

# Delete an agent
opschain agents delete myagent -P myproject
```

### 10.2 Building the container image

Before an agent can run, its container image must be built. Building is async — the command returns a task ID immediately.

```bash
# Trigger an image build
opschain agents build myagent -P myproject

# Check build status
opschain agents status myagent -P myproject
```

The build task response includes a task ID. Use `--output json` to see full task details including `status_code` (`initializing`, `running`, `success`, `failed`).

### 10.3 Starting and stopping agents

Once an image is built, use `start` and `stop` to control the agent's runtime state.

```bash
# Start the agent
opschain agents start myagent -P myproject

# Stop the agent
opschain agents stop myagent -P myproject

# Wait until the agent is fully running before returning
opschain agents start myagent -P myproject --wait

# Wait until the agent has fully stopped
opschain agents stop myagent -P myproject --wait
```

With `--wait`, the CLI polls every 5 seconds and prints the current status to stderr until the agent reaches the target state. Useful in scripts or pipelines where subsequent steps depend on the agent being up or down.

### 10.4 Monitoring agent status

```bash
# Show current and desired status, image SHAs, and build status
opschain agents status myagent -P myproject
```

### 10.5 Viewing agent logs

```bash
# Last 50 log lines (default)
opschain agents logs myagent -P myproject

# Adjust the number of lines returned
opschain agents logs myagent -P myproject --limit 100
opschain agents logs myagent -P myproject -l 200

# Retrieve all log lines
opschain agents logs myagent -P myproject --all
```

`--all` overrides `--limit` and returns the complete log history for the agent.

### 10.6 Kubernetes events

View Kubernetes events for a running agent (the agent must be in `running` state):

```bash
# Last 50 events (default), newest first
opschain agents k8s-events myagent -P myproject

# Adjust the number of events returned
opschain agents k8s-events myagent -P myproject --limit 20
opschain agents k8s-events myagent -P myproject -l 100

# Retrieve all events
opschain agents k8s-events myagent -P myproject --all
```

`--all` overrides `--limit` and returns the complete Kubernetes event history for the agent.

### 10.7 Properties and settings

```bash
opschain agents properties get myagent -P myproject
opschain agents properties update myagent -P myproject \
  --data '{"key": "value"}' --version 1

opschain agents settings get myagent -P myproject
```

### 10.8 Converged properties

Shows the fully merged properties that will apply to the agent — combining template (repository) properties, project properties, and agent-specific properties.

```bash
# Current merged properties
opschain agents converged-properties myagent -P myproject --output json

# Properties as they would have been at a specific point in time
opschain agents converged-properties myagent -P myproject \
  --converge-date 2026-04-01T00:00:00+00:00 \
  --output yaml
```

---

## 11. Changes (Executing Actions)

### 11.1 What a change is

A **change** represents the execution of a single action against a project, environment, or asset. Changes are the primary mechanism through which OpsChain drives any automated process — deployments, configuration updates, compliance checks, data migrations, or custom scripts. Every change is tracked with a unique ID, status code, start/end timestamps, and a log stream.

Terminal statuses: `success`, `error`, `cancelled`, `failed`.

### 11.2 Creating changes

#### Asset scope (simplest — recommended starting point)

For assets, git information (remote, rev, template version) is derived automatically from the asset's configuration.

```bash
# Execute the 'deploy' action on myasset
opschain changes create -E dev -A myasset -a deploy

# Wait for the change to finish
opschain changes create -E dev -A myasset -a deploy --wait-for-completion

# Wait and stream logs in real-time
opschain changes create -E dev -A myasset -a deploy -w --show-logs

# Stream logs with UTC timestamps
opschain changes create -E dev -A myasset -a deploy -w --show-logs --utc

# Capture the change ID for later (quiet mode, no --wait)
CHANGE_ID=$(opschain changes create -E dev -A myasset -a deploy -q)
```

#### Environment scope

```bash
opschain changes create \
  -E dev \
  -a deploy \
  --template-version v1.0 \
  --git-remote github \
  --git-rev main
```

#### Project scope

```bash
opschain changes create \
  -a deploy \
  --template-version v1.0 \
  --git-remote github \
  --git-rev main
```

**Key flags:**

| Flag | Short | Required (env/project scope) | Description |
|---|---|---|---|
| `--project` | `-P` | Yes | Project code |
| `--environment` | `-E` | No | Environment code |
| `--asset` | `-A` | No | Asset code (implies environment scope) |
| `--action` | `-a` | Yes | Action name to execute |
| `--template-version` | `-t` | Yes (non-asset) | Template version |
| `--git-remote` | `-r` | Yes (non-asset) | Git remote name |
| `--git-rev` | `-v` | Yes (non-asset) | Git revision (branch, tag, or commit SHA) |
| `--property-overrides` | | No | JSON object of property overrides |
| `--settings-overrides` | | No | JSON object of settings overrides |
| `--metadata` | | No | JSON object attached to the change |
| `--build-without-cache` | | No | Build container without Docker cache |
| `--wait-for-completion` | `-w` | No | Poll every 5 seconds until terminal state |
| `--show-logs` | | No | Stream logs in real-time (requires `-w`) |
| `--utc` | | No | Display timestamps in UTC |
| `--from-file` | | No | Load entire request from a JSON file |

### 11.3 Listing and filtering changes

By default, `changes list` returns the 15 most-recent changes across all scopes.

```bash
# All recent changes (default: 15, sorted newest-first)
opschain changes list

# Changes in a specific project
opschain changes list --project myproject

# Changes in a specific environment
opschain changes list --project myproject -E dev

# Changes for a specific asset within an environment
opschain changes list --project myproject -E dev -A myasset

# Filter by status
opschain changes list --project myproject --status success
opschain changes list --project myproject --status error
opschain changes list --project myproject --status running

# Increase the result limit
opschain changes list --project myproject --limit 50

# Sort by status ascending
opschain changes list --sort "status_code asc"
```

#### Advanced filtering with Ransack predicates

Use `--filter "field_predicate=value"` for flexible server-side filtering. Multiple `--filter` flags are combined with AND logic.

```bash
# Changes created after a specific date
opschain changes list --project myproject \
  --filter "created_at_gt=2025-01-01T00:00:00Z"

# Changes in a date range
opschain changes list --project myproject \
  --filter "created_at_gt=2025-01-01T00:00:00Z" \
  --filter "created_at_lt=2025-02-01T00:00:00Z"

# Changes where action equals 'deploy'
opschain changes list --project myproject \
  --filter "action_eq=deploy"

# Changes where status code contains 'error'
opschain changes list \
  --filter "status_code_cont=error" \
  --limit 100

# Changes whose name starts with 'nightly'
opschain changes list --project myproject \
  --filter "name_start=nightly"

# Combine filters: successful deploy changes in the last month
opschain changes list --project myproject \
  --filter "status_code_eq=success" \
  --filter "action_eq=deploy" \
  --filter "created_at_gt=2025-02-01T00:00:00Z" \
  --limit 50

# Show results in UTC
opschain changes list --project myproject --utc
```

**Available Ransack predicates:** `_eq`, `_not_eq`, `_cont`, `_start`, `_end`, `_gt`, `_lt`, `_gteq`, `_lteq`

### 11.4 Viewing logs

```bash
# Fetch logs for a specific change (root step only)
opschain changes logs b5bf89b6-6512-4f18-8b4d-cdac8a597231

# Include logs from all child steps
opschain changes logs b5bf89b6 --include-child-steps

# View logs in UTC
opschain changes logs b5bf89b6 --utc

# Export logs as JSON
opschain changes logs b5bf89b6 -o json
```

### 11.5 Cancel a change

```bash
opschain changes cancel b5bf89b6-6512-4f18-8b4d-cdac8a597231
opschain changes cancel b5bf89b6 -q   # prints ID on success
```

> **Note:** Only changes in `running` or `pending` states can be cancelled.

---

## 12. Workflows

Workflows are reusable automation scripts written in YAML that can orchestrate complex multi-step actions. They are versioned and project-scoped.

> **Note:** Commands in this section require a project code. Either pass `--project <code>` / `-P <code>` on each command, or set `default_project` in your active profile (see §3.1) to omit it entirely.

### 12.1 Managing workflows

```bash
# List workflows in a project
opschain workflows list

# Get a workflow by code
opschain workflows get deploy-app

# Create a workflow from a YAML file (draft by default)
opschain workflows create \
  --code deploy-app \
  --source-yaml-file deploy-app.yaml

# Create as published immediately
opschain workflows create \
  --code deploy-app \
  --name "Deploy Application" \
  --source-yaml-file deploy-app.yaml \
  --publish

# Create with validation
opschain workflows create \
  --code deploy-app \
  --source-yaml-file deploy-app.yaml \
  --validate

# Update a workflow
opschain workflows update deploy-app --name "Deploy Application v2"
opschain workflows update deploy-app --description "Updated deployment workflow"
opschain workflows update deploy-app --archive

# Delete a workflow (and all its versions)
opschain workflows delete deploy-app

# Delete only draft versions (preserve published)
opschain workflows delete-drafts deploy-app

# List versions of a workflow
opschain workflows versions deploy-app
```

### 12.2 Running workflows

```bash
# Execute a specific version of a workflow
opschain workflows runs create --code deploy-app --version 2

# Wait for completion
opschain workflows runs create --code deploy-app --version 2 \
  --wait-for-completion

# Wait and stream logs
opschain workflows runs create --code deploy-app --version 2 \
  -w --show-logs

# With property overrides
opschain workflows runs create --code deploy-app --version 2 \
  --property-overrides '{"target_env": "prod", "replicas": 5}'

# With metadata
opschain workflows runs create --code deploy-app --version 2 \
  --metadata '{"triggered_by": "jenkins", "build_number": "1234"}'

# Capture the run ID
RUN_ID=$(opschain workflows runs create --code deploy-app --version 2 -q)

# List runs for a workflow
opschain workflows runs list --code deploy-app
opschain workflows runs list --code deploy-app --limit 20

# Get status of a specific run
opschain workflows runs get $RUN_ID

# View logs for a run
opschain workflows runs logs $RUN_ID
opschain workflows runs logs $RUN_ID --utc

# Retry a failed/cancelled run
opschain workflows runs retry $RUN_ID
opschain workflows runs retry $RUN_ID --wait-for-completion --show-logs

# Cancel a running workflow run
opschain workflows runs cancel $RUN_ID
```

---

## 13. Scheduling

OpsChain supports two ways to schedule automated actions.

> **Note:** Commands in this section require a project code. Either pass `--project <code>` / `-P <code>` on each command, or set `default_project` in your active profile (see §3.1) to omit it entirely.

### 13.1 Two approaches

| Approach | Best for |
|---|---|
| `opschain changes create --schedule "..."` | Simple one-off or recurring change schedules |
| `opschain scheduled-activities create` | Full control over scheduling, both changes and workflows |

### 13.2 Cron expressions and one-shot `--run-at`

Use standard 5-field cron expressions:

```text
┌───────────── minute (0–59)
│ ┌───────────── hour (0–23)
│ │ ┌───────────── day of month (1–31)
│ │ │ ┌───────────── month (1–12)
│ │ │ │ ┌───────────── day of week (0–6, Sun=0)
│ │ │ │ │
* * * * *
```

Common patterns:

| Cron | Meaning |
|---|---|
| `0 2 * * *` | Daily at 02:00 |
| `0 3 * * 1` | Every Monday at 03:00 |
| `30 4 1,15 * *` | 1st and 15th of each month at 04:30 |
| `0 0 25 12 *` | Christmas Day at midnight |

Use `--run-at` for a single future execution:

```bash
opschain changes create -E dev -A myasset -a deploy \
  --run-at "2025-12-25 14:00:00" \
  --timezone "Australia/Sydney"
```

### 13.3 Timezones

All `--run-at` and `--end-at` datetimes without an explicit timezone offset are interpreted in the timezone specified by `--timezone` (or local timezone if omitted). Values are stored internally as UTC.

```bash
# Local timezone (default)
--run-at "2025-06-01 09:00:00"

# Explicit timezone
--run-at "2025-06-01 09:00:00" --timezone "America/New_York"
--run-at "2025-06-01 09:00:00" --timezone "Europe/London"
--run-at "2025-06-01 09:00:00" --timezone "Asia/Tokyo"

# ISO 8601 with offset (timezone flag ignored)
--run-at "2025-06-01T09:00:00+10:00"
```

### 13.4 Scheduling via `changes create`

This creates a scheduled activity automatically, without requiring you to use the `scheduled-activities` command directly.

```bash
# Schedule a recurring deployment (daily at 2am)
opschain changes create \
  -E dev -A myasset -a deploy \
  --schedule "0 2 * * *" \
  --repeat

# Schedule a one-shot deployment on New Year
opschain changes create \
  -E dev -A myasset -a deploy \
  --run-at "2026-01-01 00:00:00" \
  --timezone "UTC"

# Schedule with new-commits-only guard (skips if no new commits)
opschain changes create \
  -E dev -a deploy \
  --template-version v1.0 --git-remote github --git-rev main \
  --schedule "0 3 * * *" --repeat --new-commits-only

# Schedule with max run count and end date
opschain changes create \
  -E dev -A myasset -a deploy \
  --schedule "0 2 * * *" --repeat \
  --max-runs 30 \
  --end-at "2025-12-31 00:00:00"
```

### 13.5 Scheduled Activities management

Use `opschain scheduled-activities` (alias: `scheduled-activity`) for full CRUD control.

```bash
# List scheduled activities
opschain scheduled-activities list
opschain scheduled-activities list --project myproject
opschain scheduled-activities list --project myproject -E dev
opschain scheduled-activities list --project myproject -E dev -A myasset
opschain scheduled-activities list --type scheduled_change
opschain scheduled-activities list --type scheduled_workflow
opschain scheduled-activities list --enabled true

# Get details of a specific activity
opschain scheduled-activities get <id>

# Create a scheduled change
opschain scheduled-activities create \
  --type scheduled_change \
  -E dev -A myasset \
  -a deploy \
  --schedule "0 2 * * *" \
  --repeat

# Create a scheduled workflow
opschain scheduled-activities create \
  --type scheduled_workflow \
  --workflow backup \
  --version 3 \
  --schedule "0 0 * * 0" \
  --repeat

# Update a scheduled activity
opschain scheduled-activities update <id> --schedule "0 3 * * *"
opschain scheduled-activities update <id> --enabled=false    # disable
opschain scheduled-activities update <id> --git-rev develop

# Delete a scheduled activity
opschain scheduled-activities delete <id>
```

### 13.6 Scheduling examples

```bash
# Daily database backup (workflow)
opschain scheduled-activities create \
  --type scheduled_workflow \
  --workflow db-backup \
  --version 1 \
  --schedule "0 1 * * *" \
  --repeat \
  --timezone "UTC"

# Weekly report generation
opschain scheduled-activities create \
  --type scheduled_workflow \
  --workflow weekly-report \
  --version 2 \
  --schedule "0 6 * * 1" \
  --repeat \
  --timezone "America/New_York"

# New-commits-only deployment — only runs when new commits land on main
opschain scheduled-activities create \
  --type scheduled_change \
  -E staging \
  -a deploy \
  -r github -v main -t v2.0 \
  --schedule "*/15 * * * *" \
  --repeat \
  --new-commits-only

# Allow parallel execution for a busy schedule
opschain scheduled-activities create \
  --type scheduled_change \
  -E dev -A myasset \
  -a sync \
  --schedule "* * * * *" \
  --allow-parallel
```

---

## 14. Security (Authorisation Policies)

### 14.1 What policies and rules are

An **authorisation policy** is a named set of access control rules. Each **rule** defines what a user can do at a particular path in OpsChain's resource hierarchy. **Assignments** link users or groups to a policy.

A path like `/projects/myproject/environments/dev` grants access scoped to that environment.

### 14.2 Policies: CRUD

Policies support lookup by name (default) or by UUID (`--id` flag).

```bash
# List all policies
opschain authorisation-policies list
opschain auth-policies list   # alias

# Get a policy by name
opschain authorisation-policies get "Read-Only Users"

# Get a policy by ID
opschain authorisation-policies get --id abc-uuid-123

# Create a policy
opschain authorisation-policies create "Read-Only Users"
opschain authorisation-policies create "Read-Only Users" --description "View-only access"

# Create from a JSON file (can include initial rules)
opschain authorisation-policies create --from-file policy.json

# Update policy description
opschain authorisation-policies update "Read-Only Users" --description "Updated description"

# Delete a policy
opschain authorisation-policies delete "Read-Only Users"
opschain authorisation-policies delete --id abc-uuid-123
```

### 14.3 Rules

Rules control access at specific resource paths. There is **no bulk list endpoint** — the CLI fetches rules individually using policy relationship data.

> **Warning:** **PATCH-atomic behaviour:** Creating, updating, or deleting a rule sends a PATCH request that replaces **all** rules on the policy atomically. The CLI handles this automatically by fetching the current rules and merging your changes, but you should be aware that concurrent rule modifications may overwrite each other.

**Permitted rule fields:** `path`, `readable`, `updatable`, `executable`
**Read-only fields** (do NOT send): `code`, `created_by`

```bash
# List all rules for a policy
opschain authorisation-policies rules list "Read-Only Users"
opschain authorisation-policies rules list --id <policy-id>

# Get a specific rule
opschain authorisation-policies rules get "Read-Only Users" <rule-id>

# Create a new rule
opschain authorisation-policies rules create "Read-Only Users" \
  --path "/projects/myproject" \
  --readable

opschain authorisation-policies rules create "Read-Only Users" \
  --path "/projects/myproject/environments/dev" \
  --readable \
  --executable

# Create a rule with full access
opschain authorisation-policies rules create "DevOps Team" \
  --path "/projects/myproject" \
  --readable \
  --updatable \
  --executable

# Update a rule
opschain authorisation-policies rules update "Read-Only Users" <rule-id> \
  --executable=true

# Delete a rule
opschain authorisation-policies rules delete "Read-Only Users" <rule-id>
```

### 14.4 Assignments

Assignments link users or groups to a policy. The assignments endpoint replaces **all** assignments on POST, so `set` is destructive while `add` is additive.

```bash
# List current assignments
opschain authorisation-policies assignments list "Read-Only Users"

# SET (replaces all existing assignments)
opschain authorisation-policies assignments set "Read-Only Users" \
  --users alice,bob \
  --groups devs,qa

# ADD (preserves existing, adds new)
opschain authorisation-policies assignments add "Read-Only Users" \
  --users charlie

# REMOVE specific users/groups
opschain authorisation-policies assignments remove "Read-Only Users" --users alice
opschain authorisation-policies assignments remove "Read-Only Users" --groups qa

# Remove ALL assignments
opschain authorisation-policies assignments remove "Read-Only Users" --all
```

> **Note:** Each assignment has either a `username` OR a `groupname`, never both.

### 14.5 Examples

```bash
# Create a read-only policy for a specific project
opschain authorisation-policies create "Project Viewers"
opschain authorisation-policies rules create "Project Viewers" \
  --path "/projects/myproject" \
  --readable

# Assign a group
opschain authorisation-policies assignments set "Project Viewers" \
  --groups "developers"

# Create a per-environment write policy
opschain authorisation-policies create "Dev Deployers"
opschain authorisation-policies rules create "Dev Deployers" \
  --path "/projects/myproject/environments/dev" \
  --readable --updatable --executable

opschain authorisation-policies assignments set "Dev Deployers" \
  --users alice,bob

# Create a full-access policy
opschain authorisation-policies create "Platform Admins"
opschain authorisation-policies rules create "Platform Admins" \
  --path "/" \
  --readable --updatable --executable

opschain authorisation-policies assignments set "Platform Admins" \
  --groups "platform-team"
```

---

## 15. Events

Events are audit records emitted whenever something happens in OpsChain — a change runs, a workflow executes, a user logs in, a resource is created. They can be user-generated or system-generated.

### 15.1 Listing events

```bash
# List the 15 most recent events (default)
opschain events list

# Increase the limit
opschain events list --limit 50

# Output as JSON or YAML for piping
opschain events list --output json
```

### 15.2 Convenience filters

These flags cover the most common filtering needs:

```bash
# Events of a specific type
opschain events list --type "change.completed"
opschain events list -t "workflow.run.started"

# Events by a specific user
opschain events list --username alice
opschain events list -u deploy-bot

# Only system-generated events
opschain events list --system

# Only user-generated events (exclude system)
opschain events list --user
```

### 15.3 Advanced filtering with `--filter`

The `--filter` flag maps directly to OpsChain's Ransack-style filter parameters. The format is `field_predicate=value`.

**Predicates:**

| Predicate | Meaning | Example |
|---|---|---|
| `_eq` | Exact match | `type_eq=change.completed` |
| `_cont` | Contains (case-sensitive) | `type_cont=change` |
| `_start` | Starts with | `type_start=change.` |
| `_end` | Ends with | `type_end=.failed` |
| `_gt` | Greater than | `created_at_gt=2026-01-01T00:00:00Z` |
| `_lt` | Less than | `created_at_lt=2026-04-30T00:00:00Z` |
| `_gteq` | Greater than or equal | `created_at_gteq=2026-04-01T00:00:00Z` |
| `_lteq` | Less than or equal | `created_at_lteq=2026-04-30T23:59:59Z` |

**Filterable fields:** `type`, `username`, `system`, `event_node_path`, `created_at`

**Examples:**

```bash
# All failed change events
opschain events list --filter "type_end=.failed"

# Events for a specific project node path
opschain events list --filter "event_node_path_eq=/projects/myproject"

# Events under a project (all environments, assets, etc.)
opschain events list --filter "event_node_path_start=/projects/myproject"

# Events in a date range
opschain events list \
  --filter "created_at_gteq=2026-04-01T00:00:00Z" \
  --filter "created_at_lteq=2026-04-30T23:59:59Z"

# Combine filters: failed changes in a project this month
opschain events list \
  --filter "type_end=.failed" \
  --filter "event_node_path_start=/projects/myproject" \
  --filter "created_at_gteq=2026-04-01T00:00:00Z" \
  --limit 100
```

Multiple `--filter` flags are AND-ed together.

### 15.4 Sorting

```bash
# Sort by created_at ascending (oldest first)
opschain events list --sort "created_at asc"

# Sort by type
opschain events list --sort "type asc"
```

Default sort is `created_at desc` (newest first).

### 15.5 Get a specific event

```bash
opschain events get <event-id>
opschain events get eb89e69e-5feb-4751-abe7-8a2fa53ce42e --output json
```

### 15.6 Creating a custom event

You can emit custom events — useful for marking external milestones (pipeline stages, approvals, deployments from other tools) in the OpsChain audit trail.

`--type` is required. Additional attributes can be passed inline as JSON via `--data`, or loaded from a file via `--from-file`. The two are mutually exclusive.

```bash
# Minimal event
opschain events create --type "deploy.started"

# With additional context inline
opschain events create \
  --type "deploy.completed" \
  --data '{"environment": "prod", "version": "v2.1.0", "triggered_by": "github-actions"}'

# Load complex data from a file
opschain events create --type "deploy.completed" --from-file ./event-payload.json

# Capture the new event ID for later lookup
event_id=$(opschain events create --type "pipeline.checkpoint" -q)
opschain events get "$event_id"
```

The JSON file (or `--data` value) should be a flat or nested object — its keys are merged directly into the event's attributes alongside `type`:

```json
{
  "environment": "prod",
  "version": "v2.1.0",
  "metadata": {
    "pipeline": "deploy",
    "run_id": "12345"
  }
}
```

---

## 16. Scripting & CI/CD Patterns

### Setting credentials in CI without config files

#### Option 1 — Bearer token (recommended)

Store a single `OPSCHAIN_TOKEN` secret in your CI system. Obtain the token by running `opschain tokens login` locally or in a separate authentication step.

```bash
export OPSCHAIN_API_URL=${{ secrets.OPSCHAIN_API_URL }}
export OPSCHAIN_TOKEN=${{ secrets.OPSCHAIN_TOKEN }}

opschain changes list -P myproject
```

#### Option 2 — Username and password

```bash
export OPSCHAIN_API_URL=${{ secrets.OPSCHAIN_API_URL }}
export OPSCHAIN_USERNAME=${{ secrets.OPSCHAIN_USERNAME }}
export OPSCHAIN_PASSWORD=${{ secrets.OPSCHAIN_PASSWORD }}

opschain changes list -P myproject
```

#### Option 3 — Login step in pipeline (token refreshed each run)

```bash
export OPSCHAIN_API_URL=${{ secrets.OPSCHAIN_API_URL }}
# Login using username/password secrets, save token to a temp profile
opschain --profile ci tokens login \
  --username ${{ secrets.OPSCHAIN_USERNAME }} \
  --password ${{ secrets.OPSCHAIN_PASSWORD }}

# Subsequent commands use the bearer token automatically
opschain --profile ci changes list -P myproject
```

### Capture IDs with `-q` for shell scripting

```bash
# Create a project and capture its code
PROJECT=$(opschain projects create --code newproj --name "New Project" -q)
echo "Created: $PROJECT"

# Create a change and wait for result
CHANGE_ID=$(opschain changes create -P myproject -E dev -A myasset -a deploy -q)
echo "Change: $CHANGE_ID"
```

### Wait for completion and check exit code

The `--wait-for-completion` flag returns a non-zero exit code on failure (`error`, `cancelled`, `failed`), making it CI-friendly.

```bash
#!/usr/bin/env bash
set -e

echo "Deploying..."
opschain changes create \
  -P myproject -E prod -A webapp -a deploy \
  --wait-for-completion \
  --show-logs

echo "Deployment complete!"
```

### Advanced pipelines with `--output json` and `jq`

```bash
# Get all project codes
opschain projects list -o json | jq -r '.[] | .attributes.code'

# Get the ID of the most recent error change
opschain changes list -P myproject --status error --limit 1 -o json \
  | jq -r '.[0].id'

# Get all running changes and their start times
opschain changes list --status running -o json \
  | jq '.[] | {id: .id, started_at: .attributes.started_at}'

# Wait for a change by ID, then check its final status
CHANGE_ID="b5bf89b6-6512-4f18-8b4d-cdac8a597231"
STATUS=$(opschain changes get $CHANGE_ID -o json | jq -r '.attributes.status_code')
echo "Final status: $STATUS"
```

### Example: GitHub Actions deployment workflow

```yaml
name: Deploy to Production
on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Template version to deploy'
        required: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Download OpsChain CLI
        run: |
          curl -L https://github.com/limepoint/product-releases/releases/latest/download/opschain_linux_amd64.zip -o opschain.zip
          unzip opschain.zip
          chmod +x opschain

      - name: Deploy
        env:
          OPSCHAIN_API_URL: ${{ secrets.OPSCHAIN_API_URL }}
          OPSCHAIN_TOKEN: ${{ secrets.OPSCHAIN_TOKEN }}   # bearer token preferred in CI
        run: |
          ./opschain changes create \
            -P myproject -E prod -A webapp -a deploy \
            --wait-for-completion \
            --show-logs \
            --utc
```

### Example: Jenkins Pipeline

The example below shows a declarative Jenkins pipeline that deploys via OpsChain after a successful build. The `--wait-for-completion` flag blocks the pipeline step until the change reaches a terminal state; a non-zero exit code automatically fails the Jenkins stage if the change errors or is cancelled.

```groovy
pipeline {
    agent any

    environment {
        // Store credentials in Jenkins as Secret Text credentials
        OPSCHAIN_API_URL = credentials('opschain-api-url')
        OPSCHAIN_TOKEN   = credentials('opschain-token')   // bearer token preferred
        OPSCHAIN_PROJECT = credentials('opschain-project')
    }

    stages {
        stage('Build') {
            steps {
                sh 'make build'
            }
        }

        stage('Deploy via OpsChain') {
            steps {
                script {
                    // --wait-for-completion makes create block until terminal state;
                    // non-zero exit code automatically fails the pipeline on error/cancel/failure.
                    // Status updates go to stderr; log lines stream to stdout.
                    sh '''
                        ./opschain changes create \
                          -P "${OPSCHAIN_PROJECT}" -E staging -A webapp \
                          -a deploy \
                          --metadata '{"triggered_by":"jenkins","build":"'"${BUILD_NUMBER}"'"}' \
                          --wait-for-completion \
                          --show-logs \
                          --utc
                    '''
                }
            }
        }

        stage('Audit') {
            steps {
                script {
                    // Fetch the most recent change for this asset to surface the ID in Jenkins logs
                    def changeId = sh(
                        script: '''
                            ./opschain changes list \
                              -P "${OPSCHAIN_PROJECT}" -E staging -A webapp \
                              --limit 1 -o json | jq -r '.[0].id'
                        ''',
                        returnStdout: true
                    ).trim()
                    echo "OpsChain change: ${changeId}"
                }
            }
        }
    }

    post {
        failure {
            echo "Pipeline failed — check the OpsChain change logs above."
        }
    }
}
```

:::tip
Store `OPSCHAIN_API_URL`, `OPSCHAIN_USERNAME`, `OPSCHAIN_PASSWORD`, and `OPSCHAIN_PROJECT` as **Secret Text** credentials in Jenkins (**Manage Jenkins → Credentials**) and inject them via the `credentials()` helper as shown above — never hard-code them in the `Jenkinsfile`.
:::

:::tip
`--wait-for-completion -q` prints only the change ID to stdout at completion, which is useful if you need to capture the ID up-front — for example, to record it in a build artefact before the wait finishes:

```bash
CHANGE_ID=$(./opschain changes create \
  -P "${OPSCHAIN_PROJECT}" -E staging -A webapp -a deploy \
  --wait-for-completion -q)
echo "OpsChain change: ${CHANGE_ID}"
```

:::

### Example: Schedule a recurring deployment from a script

```bash
#!/usr/bin/env bash
# Set up a nightly deployment schedule

opschain scheduled-activities create \
  --type scheduled_change \
  -P myproject -E staging -A webapp \
  -a deploy \
  --schedule "0 1 * * *" \
  --repeat \
  --timezone "UTC" \
  --new-commits-only
```

---

## 17. Troubleshooting

### `--debug` — inspect HTTP traffic

`--debug` prints every HTTP request and response (method, URL, headers, body, status code, and duration) to **stderr**.

```bash
opschain --debug projects list 2>&1 | head -40
# or save debug output separately
opschain --debug changes create -P myproject -E dev -A myasset -a deploy 2>debug.log
```

The `Authorization` header is always masked but shows the auth **scheme**, so you can confirm which method is in use:

```text
DEBUG:   Authorization: Bearer ****   ← bearer token is active
DEBUG:   Authorization: Basic ****    ← basic auth is active
```

### `--stacktrace` — Go stack trace on error

For unexpected panics or internal errors, `--stacktrace` prints the full goroutine stack.

```bash
opschain --stacktrace changes get some-bad-id
```

### `--insecure` — self-signed certificates

For development instances with self-signed TLS certificates:

```bash
opschain --insecure projects list
# Or set in profile
opschain config profiles update dev --api-url https://dev.internal
# Then set insecure: true in ~/.opschain/config.yaml manually, or use env var:
OPSCHAIN_INSECURE=true opschain projects list
```

> **Warning:** Never use `--insecure` against production instances. It disables TLS certificate verification entirely.

### Common errors and remediation

{/* <!-- markdownlint-disable MD056 --> */}
| Error | Likely cause | Fix |
|---|---|---|
| `failed to load config: profile 'X' not found` | Profile doesn't exist | Run `opschain config profiles list` and fix spelling, or create the profile |
| `401 Unauthorized` | Wrong credentials or expired token | Check `OPSCHAIN_USERNAME` / `OPSCHAIN_PASSWORD`, or re-run `opschain tokens login` if using a bearer token |
| `404 Not Found` | Resource code/ID is wrong, or wrong project scope | Verify the resource exists with a `list` command first |
| `--environment requires --project to be specified` | Forgot `-P` flag | Add `-P <project_code>` to the command |
| `--asset requires --project to be specified` | Forgot `-P` flag | Add `-P <project_code>` to the command |
| `cannot specify both --schedule and --run-at` | Conflicting scheduling flags | Use one or the other |
| `--show-logs can only be used with --wait-for-completion` | Missing `-w` flag | Add `--wait-for-completion` or `-w` |
| `invalid JSON data` | Malformed JSON in `--data` / `--property-overrides` | Validate JSON with `echo '...' \| jq .` |
| `context deadline exceeded` / timeout | Request took too long | Increase `timeout` in profile or use `OPSCHAIN_TIMEOUT=300` |
| TLS handshake error | Self-signed cert | Add `insecure: true` to profile or use `--insecure` |
| `unpermitted parameter: auth_provider` | Sending read-only fields in assignment request | Do not send `auth_provider` in assignment JSON |
{/* <!-- markdownlint-enable MD056 --> */}
