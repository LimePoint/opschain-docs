# OpsChain CLI Guide

A complete reference for the OpsChain (and MintPress) command-line interface — from first-time setup through advanced automation patterns.

---

## Contents

1. [Introduction](#1-introduction)
   - [Multi-brand note](#multi-brand-note)
2. [Installation & Setup](#2-installation--setup)
   - [Download a pre-built binary (recommended)](#download-a-pre-built-binary-recommended)
   - [Use the Docker image](#use-the-docker-image)
   - [Verify installation](#verify-installation)
3. [Configuration](#3-configuration)
   - [3.1 Config file format](#31-config-file-format)
   - [3.2 Profiles](#32-profiles)
   - [3.3 Environment Variables](#33-environment-variables)
   - [3.4 Bearer Token Authentication](#34-bearer-token-authentication)
4. [Global Flags](#4-global-flags)
   - [Output formats](#output-formats)
   - [Quiet mode](#quiet-mode)
   - [Referring to a resource by code, name, or ID](#referring-to-a-resource-by-code-name-or-id)
   - [Get a resource's UUID](#get-a-resources-uuid)
5. [Projects](#5-projects)
   - [Commands](#commands)
   - [Project properties](#project-properties)
   - [Project settings](#project-settings)
6. [Git Remotes](#6-git-remotes)
   - [Commands](#commands-1)
7. [Environments](#7-environments)
   - [Commands](#commands-2)
   - [Environment properties and settings](#environment-properties-and-settings)
8. [Asset Templates](#8-asset-templates)
   - [Commands](#commands-3)
   - [View the resolved template for an asset](#view-the-resolved-template-for-an-asset)
9. [Assets](#9-assets)
   - [Commands](#commands-4)
   - [Viewing an action's steps](#viewing-an-actions-steps)
   - [Asset properties and settings](#asset-properties-and-settings)
   - [Generate Actions](#generate-actions)
   - [MintModels](#mintmodels)
10. [Agents](#10-agents)
    - [10.1 Basic CRUD](#101-basic-crud)
    - [10.2 Building the container image](#102-building-the-container-image)
    - [10.3 Starting and stopping agents](#103-starting-and-stopping-agents)
    - [10.4 Monitoring agent status](#104-monitoring-agent-status)
    - [10.5 Viewing agent logs](#105-viewing-agent-logs)
    - [10.6 Kubernetes events](#106-kubernetes-events)
    - [10.7 Properties and settings](#107-properties-and-settings)
    - [10.8 Converged properties and settings](#108-converged-properties-and-settings)
11. [Changes (Executing Actions)](#11-changes-executing-actions)
    - [11.1 What a change is](#111-what-a-change-is)
    - [11.2 Creating changes](#112-creating-changes)
    - [11.3 Run one action across many assets (bulk)](#113-run-one-action-across-many-assets-bulk)
    - [11.4 Listing and filtering changes](#114-listing-and-filtering-changes)
    - [11.5 Viewing logs](#115-viewing-logs)
    - [11.6 Reattach to a running change](#116-reattach-to-a-running-change)
    - [11.7 Cancel a change](#117-cancel-a-change)
    - [11.8 Continue a waiting change](#118-continue-a-waiting-change)
    - [11.9 Retry a change](#119-retry-a-change)
    - [11.10 Skip steps with `--skip-steps`](#1110-skip-steps-with---skip-steps)
    - [11.11 Start partway through an action with `--starting-step`](#1111-start-partway-through-an-action-with---starting-step)
12. [Workflows](#12-workflows)
    - [12.1 Managing workflows](#121-managing-workflows)
    - [12.2 Running workflows](#122-running-workflows)
    - [12.3 Approvals and paused steps](#123-approvals-and-paused-steps)
13. [Scheduling](#13-scheduling)
    - [13.1 Two approaches](#131-two-approaches)
    - [13.2 Cron expressions and one-shot `--run-at`](#132-cron-expressions-and-one-shot---run-at)
    - [13.3 Timezones](#133-timezones)
    - [13.4 Scheduling via `changes create`](#134-scheduling-via-changes-create)
    - [13.5 Scheduled Activities management](#135-scheduled-activities-management)
    - [13.6 Scheduling examples](#136-scheduling-examples)
14. [Security (Authorisation Policies)](#14-security-authorisation-policies)
    - [14.1 What policies and rules are](#141-what-policies-and-rules-are)
    - [14.2 Policies: CRUD](#142-policies-crud)
    - [14.3 Rules](#143-rules)
    - [14.4 Assignments](#144-assignments)
    - [14.5 Examples](#145-examples)
15. [Events](#15-events)
    - [15.1 Listing events](#151-listing-events)
    - [15.2 Convenience filters](#152-convenience-filters)
    - [15.3 Scoping to a project, environment or asset](#153-scoping-to-a-project-environment-or-asset)
    - [15.4 Advanced filtering with `--filter`](#154-advanced-filtering-with---filter)
    - [15.5 Sorting](#155-sorting)
    - [15.6 Timezone](#156-timezone)
    - [15.7 Get a specific event](#157-get-a-specific-event)
    - [15.8 Creating a custom event](#158-creating-a-custom-event)
16. [Scripting & CI/CD Patterns](#16-scripting--cicd-patterns)
    - [Setting credentials in CI without config files](#setting-credentials-in-ci-without-config-files)
    - [Capture IDs with `-q` for shell scripting](#capture-ids-with--q-for-shell-scripting)
    - [Wait for completion and check exit code](#wait-for-completion-and-check-exit-code)
    - [Advanced pipelines with `--output json` and `jq`](#advanced-pipelines-with---output-json-and-jq)
    - [Example: GitHub Actions deployment workflow](#example-github-actions-deployment-workflow)
    - [Example: Jenkins Pipeline](#example-jenkins-pipeline)
    - [Example: Schedule a recurring deployment from a script](#example-schedule-a-recurring-deployment-from-a-script)
17. [Support Bundles (Diagnostics)](#17-support-bundles-diagnostics)
    - [What it collects](#what-it-collects)
    - [Credentials](#credentials)
    - [Flags](#flags)
    - [Bundle contents](#bundle-contents)
18. [Generating an AI agent skill](#18-generating-an-ai-agent-skill)
    - [Commands](#commands-5)
    - [Flags](#flags-1)
    - [Using the skill with Claude Code](#using-the-skill-with-claude-code)
19. [Secrets](#19-secrets)
    - [Commands](#commands-6)
20. [Administering the cluster](#20-administering-the-cluster)
    - [20.1 What the server is doing](#201-what-the-server-is-doing)
    - [20.2 Deployments](#202-deployments)
    - [20.3 Pods and their logs](#203-pods-and-their-logs)
    - [20.4 Deleting a stuck pod](#204-deleting-a-stuck-pod)
21. [Sending email from a change](#21-sending-email-from-a-change)
22. [Converged properties and settings](#22-converged-properties-and-settings)
    - [See the merged values](#see-the-merged-values)
    - [Find out where a value came from](#find-out-where-a-value-came-from)
    - [Look back in time](#look-back-in-time)
23. [Troubleshooting](#23-troubleshooting)
    - [`--debug` — inspect HTTP traffic](#--debug--inspect-http-traffic)
    - [`--stacktrace` — Go stack trace on error](#--stacktrace--go-stack-trace-on-error)
    - [`--insecure` — self-signed certificates](#--insecure--self-signed-certificates)
    - [Common errors and remediation](#common-errors-and-remediation)

---

## 1. Introduction

The OpsChain CLI (`opschain`) drives the OpsChain API from the command line. OpsChain is a GitOps-based, event-driven change manager: it orchestrates repeatable, auditable changes across your systems — software deployments, configuration updates, compliance remediations, database migrations. Use the CLI to manage every resource in your instance: projects, environments, assets, workflows, changes, scheduled activities, and authorisation policies.

### Multi-brand note

The same binary codebase ships as two branded products:

| Binary | Config directory | Env var prefix |
|---|---|---|
| `opschain` | `~/.opschain/` | `OPSCHAIN_` |
| `mintpress` | `~/.mintpress/` | `MINTPRESS_` |

Branding is detected automatically from the binary filename.

> **Note:** All examples use `opschain`. Every command works identically with `mintpress` — substitute the binary name.

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
   mkdir -p ~/.local/bin
   mv opschain ~/.local/bin/
   # ensure ~/.local/bin is on your PATH, e.g. add to ~/.bash_profile or ~/.zshrc:
   #   export PATH="$HOME/.local/bin:$PATH"
   ```

   If you prefer a system-wide install and have administrator rights, you can instead place the binary in `/usr/local/bin` (`sudo mv opschain /usr/local/bin/`). The user-local install above avoids needing sudo and is the better choice on locked-down machines.

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

`-q` / `--quiet` prints only resource identifiers (one per line) for capturing in shell scripts.

For code-based resources — projects, environments, assets, agents, workflows, templates, and authorisation policies — `-q` prints the **code**, not the server UUID. Resources with no code (git remotes, changes, events, scheduled activities, tokens) print their UUID. To get the UUID of a code-based resource, use `get --uuid` (see [Get a resource's UUID](#get-a-resources-uuid) below).

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

### Referring to a resource by code, name, or ID

Every command that acts on one resource takes the resource's code, name, or ID as its positional argument — `get`, `update`, `delete`, and the subcommands that operate on a resource (`agents status`, `agents logs`, `assets actions`, `<resource> properties get`, and so on). The CLI works out which one you gave:

```bash
opschain projects get web-app             # by code
opschain projects get "Web App"           # by name
opschain projects get 7f3e9c2a-1b4d-...   # by ID
```

A bare argument is matched as a code first, then by ID, then by name. A code match takes a single request; matching a name or ID lists the resource first, which costs one extra call.

To force one interpretation, use a flag in place of the positional argument:

```bash
opschain projects get --code web-app      # a code only, no fallback
opschain projects get --name "Web App"    # a name only
opschain projects get --id 7f3e9c2a-...   # an ID only
```

- On `update`, `--name` sets the new name, so it isn't a lookup flag there. Identify the resource to update by its code (positional) or `--id`.
- Git remotes have no code — refer to them by name or `--id`.
- Code and name matches are case-insensitive. If a code and some other resource's name are identical, the code wins; use `--name` to force the name.
- When nothing matches, the error is `no <resource> matches '<value>' by code, id, or name`.

### Get a resource's UUID

`get` prints the full resource. Add `--uuid` to print just its server UUID (the JSON:API `id`) and nothing else — one line, ready to capture in a variable:

```bash
opschain projects get web-app --uuid
# 7f3e9c2a-1b4d-4c5e-8a9f-0123456789ab

opschain assets get myasset -P web-app -E dev --uuid
opschain git-remotes get github -P web-app --uuid
```

`--uuid` works on `get` for every resource you look up by code, name, or ID: projects, environments, assets, agents, workflows, git remotes, templates, agent templates, and authorisation policies. It resolves the identifier the same way as a normal `get`, so you can combine it with `--code` / `--name` / `--id`. It overrides `-q` and `-o` — you always get the bare UUID.

This is the difference between the two: for a code-based resource, `get -q` prints the code, `get --uuid` prints the UUID.

```bash
opschain projects get web-app -q       # web-app
opschain projects get web-app --uuid   # 7f3e9c2a-1b4d-4c5e-8a9f-0123456789ab
```

---

## 5. Projects

Projects are the top-level organisational unit in OpsChain. Everything else — environments, assets, workflows, git remotes — lives inside a project.

### Commands

```bash
# List all projects
opschain projects list
opschain projects list -o json

# Get a project by code, name, or ID (see §4 "Referring to a resource")
opschain projects get myproject
opschain projects get --id 7f3e9c2a-1b4d-...
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

# Force-delete the project and all its children, bypassing all in-use checks (superuser policy only)
opschain projects delete myproject --ignore-in-use
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

# List all versions (newest first)
opschain projects properties versions myproject
opschain projects properties versions myproject --limit 20

# Upload a binary file as a property attachment
opschain projects properties upload-file myproject --property cert --file /path/to/cert.pem
```

Every `update` creates a new version. By default the write is unconditional — it applies over whatever the current version is. Pass `--version <n>` with the version you read to turn it into a concurrency guard: the write applies only if the current version still matches `<n>`, and is rejected if someone else changed the properties in the meantime. Get the current version from `properties get` or `properties versions`. This applies to settings too.

`versions` lists newest first. `--limit` caps how many you get back; without it the server returns up to 1000. It's available on the properties and settings `versions` commands for projects, environments, agents, and assets alike.

### Project settings

Settings work identically to properties but use a different API endpoint.

```bash
opschain projects settings get myproject
opschain projects settings update myproject --data '{"log_level": "info"}'
opschain projects settings versions myproject
```

These show what is set *on* the project. For the merged result — repository properties plus the
project's own — use `opschain projects converged-properties myproject` or
`converged-settings`; see [§22](#22-converged-properties-and-settings).

---

## 6. Git Remotes

Git remotes define where OpsChain fetches your code from. They are scoped to a project.

### Commands

> **Note:** Commands in this section require a project code. Either pass `--project <code>` / `-P <code>` on each command, or set `default_project` in your active profile (see §3.1) to omit it entirely.

```bash
# List all git remotes in a project
opschain git-remotes list

# Get a remote by name or ID (git remotes have no code)
opschain git-remotes get github
opschain git-remotes get --id abc123
opschain git-remotes get --name github

# Create a remote with HTTPS authentication
opschain git-remotes create \
  --name github \
  --url https://github.com/acme/infra.git \
  --user gituser \
  --password ghp_token

# Create a remote with a separate public URL (shown in the UI and change details)
opschain git-remotes create \
  --name github \
  --url git@github.com:acme/infra.git \
  --public-url https://github.com/acme/infra \
  --ssh-key-file ~/.ssh/opschain_rsa

# Create a remote with SSH key (and optional passphrase)
opschain git-remotes create \
  --name github-ssh \
  --url git@github.com:acme/infra.git \
  --ssh-key-file ~/.ssh/opschain_rsa \
  --passphrase 's3cr3t'

# Register the SSH host key in the global known_hosts on create (superuser only)
opschain git-remotes create \
  --name github-ssh \
  --url git@github.com:acme/infra.git \
  --ssh-key-file ~/.ssh/opschain_rsa \
  --add-known-host

# Update credentials (name is immutable; url and public-url can be changed)
opschain git-remotes update github --password new_token
opschain git-remotes update github --ssh-key-file ~/.ssh/new_key --passphrase 's3cr3t'
opschain git-remotes update github --url git@github.com:acme/infra.git --add-known-host
opschain git-remotes update github --public-url https://github.com/acme/infra

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
| `--public-url` | No | Public URL for the repository, shown in the UI and change details |
| `--user` | No | Username for HTTPS authentication |
| `--password` | No | Password/token for HTTPS authentication |
| `--passphrase` | No | Passphrase for the SSH private key |
| `--ssh-key-file` | No | Path to SSH private key file |
| `--add-known-host` | No | Scan the SSH remote host key and register it in the global known_hosts setting (superuser only) |

**Update flags:** at least one of the following must be provided.

| Flag | Description |
|---|---|
| `--url` | New git repository URL |
| `--public-url` | Public URL for the repository, shown in the UI and change details |
| `--user` | Username for HTTPS authentication |
| `--password` | Password/token for HTTPS authentication |
| `--passphrase` | Passphrase for the SSH private key |
| `--ssh-key-file` | Path to SSH private key file |
| `--add-known-host` | When changing to an SSH URL, scan the new host key and register it in the global known_hosts setting (superuser only) |

> **Tip:** Use the `--id` flag on `get`, `archive`, `update`, and `delete` to reference a remote by UUID instead of its human-readable name.

---

## 7. Environments

Environments (e.g. `dev`, `staging`, `prod`) are scoped inside a project and provide isolated execution contexts for assets and changes.

### Commands

> **Note:** Commands in this section require a project code. Either pass `--project <code>` / `-P <code>` on each command, or set `default_project` in your active profile (see §3.1) to omit it entirely.

```bash
# List environments in a project
opschain environments list

# Get by code, name, or ID (see §4 "Referring to a resource")
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

# Force-delete the environment and all its children, bypassing all in-use checks (superuser policy only)
opschain environments delete dev --ignore-in-use
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

These show what is set *on* the environment. For the merged result — repository and project values
included — use `opschain environments converged-properties dev -P myproject` or
`converged-settings`; see [§22](#22-converged-properties-and-settings).

---

## 8. Asset Templates

Asset templates define the available asset types in OpsChain. Each template has a `code`, `name`, `template_type`, and is associated with a git remote.

> **Note:** Commands in this section require a project code. Either pass `--project <code>` / `-P <code>` on each command, or set `default_project` in your active profile (see §3.1) to omit it entirely.

### Commands

```bash
# List all available templates
opschain templates list

# List/get with archived nodes excluded from each template's nodes relationship
opschain templates list --exclude-archived-nodes
opschain templates get my-template-code --exclude-archived-nodes

# Get a template by code, name, or ID (or force with --code / --name / --id — see §4)
opschain templates get my-template-code
opschain templates get --id 7f3e9c2a-...
opschain templates get my-template-code -o json

# Archive a template (hidden and unusable, but recoverable with unarchive)
opschain templates archive my-template-code
opschain templates unarchive my-template-code

# Permanently delete a template (no recovery)
opschain templates delete my-template-code
opschain templates delete --id 7f3e9c2a-...
```

> **Note:** `--exclude-archived-nodes` (on `list` and `get`) filters archived *nodes* out of
> each template's nodes relationship. This is distinct from `--include-archived` on `list`,
> which controls whether whole archived templates appear.

**Archive vs delete:** `archive` takes a template out of use but keeps it — restore it later with `unarchive`. `delete` removes it permanently, with no recovery. A template can't be deleted while it's assigned to a node or referenced by a change; the server rejects the request and `delete` reports the error. Identify the template by code, name, or ID (or `--code` / `--id`).

### Manage template versions

Each template has versions, and every version pins a git revision (branch, tag, or commit) of the template's source. The `versions` subcommands manage that history. All of them require a project and identify the template by name (the positional argument), or with `--code` / `--id`.

```bash
# Version history for a template
opschain templates versions list "Application" -P myproject

# Read one version
opschain templates versions get "Application" v1.0 -P myproject

# Pin a new version to a git revision
opschain templates versions create "Application" v1.1 -P myproject --git-rev main

# Change a version's revision or description
opschain templates versions update "Application" v1.1 -P myproject --git-rev release

# Track a branch: refresh the version whenever it gets a new commit
opschain templates versions create latest main -P myproject --code app --git-rev main --float-git-rev
opschain templates versions update latest -P myproject --code app --git-rev main --float-git-rev=false

# Archive/unarchive a version (hidden but recoverable)
opschain templates versions archive "Application" v1.0 -P myproject
opschain templates versions unarchive "Application" v1.0 -P myproject

# Lock/unlock a version against changes to its pinned revision
opschain templates versions lock "Application" v1.0 -P myproject
opschain templates versions unlock "Application" v1.0 -P myproject
```

#### Follow a branch instead of pinning a commit

By default a version stays on the commit its revision resolved to, and you move it
yourself. `--float-git-rev` makes the version track its revision instead: whenever
the revision resolves to a new commit, the version and its assets' actions refresh.
Point a version at `main` with `--float-git-rev` and every merge to `main` reaches the
assets using it, without another CLI call.

`--float-git-rev` works on both `create` and `update`. Turn tracking off again with
`--float-git-rev=false`, which leaves the version on the commit it is currently on.
Omit the flag and whatever the version already has is kept.

The FLOAT column in `versions list` shows which versions track their revision:

```text
VERSION  STATE  GIT REV  CREATED BY  ARCHIVED  LOCKED  FLOAT
latest   ready  main     jo          no        no      yes
v1.0     ready  v1.0     jo          no        yes     no
```

Locking and floating are mutually exclusive — the server rejects a request that would
set both. To lock a version that floats, run
`versions update <version> --float-git-rev=false` first, then `versions lock`.

If a float refresh fails, the reason is in `float_refresh_error`:

```bash
opschain templates versions get "Application" latest -P myproject -o json | grep float_refresh_error
```

When you create or update a version with `--fetch-revision`, the server resolves the git revision to a commit SHA in the background — a *refresh*. To cancel a refresh that has stalled or that you started by mistake, use `cancel-refresh`:

```bash
# Cancel an in-progress git SHA refresh for version v1.0
opschain templates versions cancel-refresh "Application" v1.0 -P myproject

# By template code
opschain templates versions cancel-refresh v1.0 --code app -P myproject
```

If the version had a previously resolved commit, that commit is restored. Otherwise the version is left in the `broken` state, and you can refresh it again later. If no refresh is in progress, the command reports `No SHA refresh is in progress for this template version`.

### View the resolved template for an asset

```bash
# See the template and version that a specific asset is using
opschain assets template get myasset
opschain assets template get myasset -E dev
```

### Assign a template version to an asset

Move an asset to a different version of the template it already uses:

```bash
# Assign version v1.3 to myasset
opschain assets template assign myasset --template-version v1.3

# Same, for an environment-scoped asset
opschain assets template assign myasset --template-version v1.3 -E dev
```

The asset keeps whichever template it was created with; only the version changes. The template is read from the asset automatically, so you name the asset and the version — nothing else. Look the asset up by code, name, or ID (see §4).

To assign a version to many assets at once, or to move an asset onto a different template, use the template-centric `templates assign <template> <version> --assets <codes>` command.

`--template-version` is required. If the asset has no template assigned, the command reports `asset '<code>' has no template assigned` and makes no change.

---

## 9. Assets

Assets are instances of templates — a service, database, configuration target, compliance control, or anything else you manage as a discrete unit. Each asset is scoped to a project, and optionally to an environment.

> **Note:** Commands in this section require a project code. Either pass `--project <code>` / `-P <code>` on each command, or set `default_project` in your active profile (see §3.1) to omit it entirely.

### Commands

```bash
# List assets in a project
opschain assets list

# List assets scoped to a specific environment
opschain assets list -E dev

# Get an asset by code, name, or ID (see §4 "Referring to a resource")
opschain assets get myasset
opschain assets get --id 9b0c176c-... -E dev
opschain assets get myasset -E dev

# List the actions you can run against an asset — use these as --action values for changes create/execute
opschain assets actions myasset
opschain assets actions myasset -E dev
opschain assets actions myasset -o json   # full per-action detail (full_path, stage_step, ...)

# Expand every action's nested step tree (all levels)
opschain assets actions myasset --tree
opschain assets actions myasset --tree -q  # one runnable code per line, every node

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

# Force-delete, bypassing in-use checks (superuser only)
opschain assets delete myasset --ignore-in-use
```

`assets get <code> -o json` includes `mintmodel_valid` and, when it is `false`,
`mintmodel_invalid_reason` — the server's explanation of why the asset's MintModel
won't concretise. Check it when an action list looks wrong or a change won't start.
Both come from the single-asset response; `assets list` doesn't return them.

### Viewing an action's steps

`opschain assets actions myasset` lists the top-level actions. An action is usually built from
nested steps, and those steps often have steps of their own. Add `--tree` to expand the whole
structure:

```text
├─ Binaries
│  ├─ Install Software Binaries
│  │  ├─ Install Binaries
│  │  │  ├─ Install OracleJava Binaries
│  │  │  ├─ Install OracleFMWInfrastructure Binaries
│  │  │  └─ Install OracleIdentityManagement Binaries
│  │  └─ Install Binaries  [Install Binaries-1]
```

Each node is labelled by its name — the value you pass to `changes create --action` /
`changes execute --action` to run that step. When two sibling steps share a name (MintModel
templates repeat names like "Install Binaries"), a bracketed code such as `[Install Binaries-1]`
is added to tell them apart; use that code as the `--action` value for the duplicate.

The tree mirrors what the API returns, so a step that also exists as a top-level action appears
both places. `-o json` and `-o yaml` return the same tree with the full node detail; `--tree -q`
prints one code per line for every node, ready to pipe into a change.

### Asset properties and settings

```bash
opschain assets properties get myasset
opschain assets properties update myasset \
  --data '{"replicas": 3, "image_tag": "v2.1.0"}'
opschain assets settings get myasset -E dev
```

These show what is set *on* the asset. For the values an action will actually run with — the
template, project, environment and asset layers merged — use
`opschain assets converged-properties myasset -P myproject -E dev` or `converged-settings`; see
[§22](#22-converged-properties-and-settings).

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
# Table columns: TIMESTAMP, CATEGORY, MESSAGE. JSON output includes
# category and logged_at (plus template_version_history_id, node_background_task_id).
opschain assets generate-actions logs <request-id>
opschain assets generate-actions logs <request-id> -o json
opschain assets generate-actions logs <request-id> --limit 100

# Cancel a running generation request
opschain assets generate-actions cancel myasset <request-id>
```

Without `--limit`, `logs` returns up to 10000 lines.

### MintModels

MintModels are snapshots of an asset's computed model data at a point in time.

```bash
# List all MintModels for an asset (newest first)
opschain assets mintmodels list myasset
opschain assets mintmodels list myasset -E dev
opschain assets mintmodels list myasset --limit 5    # five most recent

# Get the latest MintModel (no ID required)
opschain assets mintmodels get myasset
opschain assets mintmodels get myasset -E dev

# Get a specific MintModel by ID
opschain assets mintmodels get myasset <mintmodel-id>

# Download the MintModel data to a JSON file
opschain assets mintmodels get myasset --out-file mintmodel.json
opschain assets mintmodels get myasset -E dev --out-file /tmp/mintmodel.json

# Generate a new MintModel for an asset (queues the work, returns the task)
opschain assets mintmodels generate myasset
opschain assets mintmodels generate myasset -E dev

# Generate and wait for the result, then print the new MintModel
opschain assets mintmodels generate myasset --wait
```

`list` returns newest first, up to the server's limit of 100. `--limit` caps it lower — `--limit 5` for the five most recent.

The `--out-file` flag writes the MintModel's JSON payload to a file, pretty-printed, with key ordering preserved as returned by the API. The confirmation message is written to stderr and can be suppressed with `-q`.

Generation runs asynchronously. `generate` queues the work and prints the background task (its ID and status) straight away; the MintModel isn't ready yet. Add `--wait` to poll the task every 5 seconds until it finishes and then print the generated MintModel — status transitions are written to stderr. If the task ends in `error` or `aborted`, the command reports the failure and exits non-zero. Without `--wait`, run `opschain assets mintmodels get myasset` once the task completes to fetch the result.

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

# Get an agent by code, name, or ID (see §4 "Referring to a resource")
opschain agents get myagent -P myproject
opschain agents get --id <uuid> -P myproject

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

### 10.8 Converged properties and settings

Shows the fully merged properties or settings that will apply to the agent — combining template (repository) properties, project properties, and agent-specific properties.

```bash
# Current merged properties
opschain agents converged-properties myagent -P myproject --output json

# Merged settings
opschain agents converged-settings myagent -P myproject --output json

# Where did each value come from?
opschain agents converged-properties myagent -P myproject --show-sources

# Properties as they would have been at a specific point in time
opschain agents converged-properties myagent -P myproject \
  --converge-date 2026-04-01T00:00:00+00:00 \
  --output yaml
```

The same pair of commands exists for projects, environments, and assets — see
[§22 Converged properties and settings](#22-converged-properties-and-settings).

---

## 11. Changes (Executing Actions)

### 11.1 What a change is

A **change** runs a single action against a project, environment, or asset. Changes are how OpsChain runs an automated process — deployments, configuration updates, compliance checks, data migrations, or custom scripts. Each change has a unique ID, a status code, start/end timestamps, and a log stream.

Terminal statuses: `success`, `error`, `cancelled`, `failed`.

### 11.2 Creating changes

#### Asset scope (recommended starting point)

For assets, git information (remote, rev, template version) is derived automatically from the asset's configuration.

An asset can be **environment-scoped** or **project-level**. Pass `-E` for an
environment-scoped asset; omit it to target a project-level asset.

```bash
# Execute the 'deploy' action on an environment-scoped asset
opschain changes create -E dev -A myasset -a deploy

# Execute it on a project-level asset (no environment)
opschain changes create -P myproject -A myasset -a deploy

# Wait for the change to finish
opschain changes create -E dev -A myasset -a deploy --wait-for-completion

# Wait and stream logs in real-time
opschain changes create -E dev -A myasset -a deploy -w --show-logs

# Wait and watch the step tree update in place instead of streaming logs
opschain changes create -E dev -A myasset -a deploy -w --show-steps

# Stream logs with UTC timestamps
opschain changes create -E dev -A myasset -a deploy -w --show-logs --utc

# Have the server release any wait step automatically (no need to wait or stay attached)
opschain changes create -E dev -A myasset -a deploy --auto-continue-wait-steps

# Skip steps matching a glob pattern (repeat the flag for multiple patterns)
opschain changes create -E dev -A myasset -a deploy --skip-steps 'steps/to/skip/**'

# Begin at a step partway through the action's step tree
opschain changes create -E dev -A myasset -a deploy --starting-step 'deploy/child2'

# MintModel difference change on a templated node (both ids required)
opschain changes create -E dev -A myasset -a deploy \
  --old-mintmodel-id d5533422-b3d7-47da-96ee-b0c810d0df6e \
  --new-mintmodel-id eecff7d2-9064-43ab-bf87-298719e597e0

# Capture the change ID for later (quiet mode, no -w)
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
| `--asset` | `-A` | No | Asset code; pair with `-E` for an environment-scoped asset, or omit `-E` for a project-level asset |
| `--action` | `-a` | Yes | Action name to execute |
| `--template-version` | `-t` | Yes (non-asset) | Template version |
| `--git-remote` | `-r` | Yes (non-asset) | Git remote name |
| `--git-rev` | `-v` | Yes (non-asset) | Git revision (branch, tag, or commit SHA) |
| `--property-overrides` | | No | JSON object of property overrides |
| `--settings-overrides` | | No | JSON object of settings overrides |
| `--metadata` | | No | JSON object attached to the change |
| `--skip-steps` | | No | Glob pattern matching step `full_path`s to skip (repeatable; see §11.10) |
| `--starting-step` | | No | Begin execution at this step's `full_path`; earlier steps are skipped (see §11.11). Not allowed with scheduling flags |
| `--build-without-cache` | | No | Build container without Docker cache |
| `--old-mintmodel-id` | | No | For a MintModel difference change on a templated node, the MintModel to diff from. Must be paired with `--new-mintmodel-id`; not allowed with scheduling flags |
| `--new-mintmodel-id` | | No | For a MintModel difference change on a templated node, the MintModel to diff to. Must be paired with `--old-mintmodel-id`; not allowed with scheduling flags |
| `--wait-for-completion` | `-w` | No | Poll every 5 seconds until terminal state |
| `--show-logs` | | No | Stream logs in real-time (requires `-w`) |
| `--show-steps` | | No | Show a tree of the change's steps that updates in place as they run (requires `-w`; cannot be combined with `--show-logs`) |
| `--auto-continue-wait-steps` | | No | Have the server release any wait step the change hits, so it runs to completion without pausing. Works whether or not you wait |
| `--utc` | | No | Display timestamps in UTC |
| `--from-file` | | No | Load entire request from a JSON file |

#### Watch the step tree

`--show-steps` renders the change's steps as a tree and refreshes it in place every
5 seconds while you wait, so you can see which step the change is on instead of a single
overall status. Each node shows the step's name, status, and how long it has been running:

```text
Change running  [+01:20]
└─ ✔ Provision  [success] (0:12)
   ├─ ● Deploy binaries  [running] (0:47)
   │  └─ ● Copy files  [running] (0:30)
   └─ · Verify  [queued]
```

Nested steps sit under their parents. The glyph marks state — `✔` success, `✖` error/failed,
`●` running, `⏸` waiting, `⊘` cancelled/aborted, `·` queued. On an interactive terminal the
tree redraws over itself; when output is piped or redirected, status transitions print to
stderr as usual and the finished tree is printed once at the end.

`--show-steps` requires `-w` and can't be combined with `--show-logs` — both take over the
screen, so pick one.

### 11.3 Run one action across many assets (bulk)

`changes execute` (alias `exec`) runs one action against multiple assets, optionally across several environments, creating one change per asset. It acts on an asset only if that asset supports the action. Assets that don't support it, or don't exist in the environment, are skipped and listed in the summary — they don't fail the run.

`-E`/`--environment` is optional. Pass one or more environment codes to fan out across the (environment × asset) matrix; omit it to target project-level assets — assets that don't sit in an environment — the same way `changes create --asset` does without `-E`. In project-level mode, `'*'` means every project-level asset, and project-level rows show `(project)` in the ENVIRONMENT column (with `-o json`/`yaml` the environment is empty).

`changes` aliases to `change`, so `opschain change execute …` works too.

```bash
# Run 'Shutdown' on three named assets in dev
opschain change execute -E dev --action Shutdown --assets db1,db2,web1

# Fan out across multiple environments (env × asset matrix)
opschain change execute -E dev,staging --action Shutdown --assets db1,web1

# Project-level assets — omit -E; name them, or use '*' for every project-level asset
opschain change execute -P myproject --action Shutdown --assets db1,db2
opschain change execute -P myproject --action Shutdown --assets '*'

# Target EVERY asset in the environment(s) — quote the '*' so the shell doesn't expand it
opschain change execute -E dev --action Shutdown --assets '*'

# Preview what would happen without creating any changes
opschain change execute -E dev --action Shutdown --assets '*' --dry-run

# Create the changes, then wait for all of them to finish
opschain change execute -E dev --action Shutdown --assets db1,db2 --wait-for-completion

# Have the server release any wait step each change hits so none of them stall
opschain change execute -E dev --action Shutdown --assets db1,db2 --auto-continue-wait-steps

# Wait, and watch each change's step tree update in place (interactive terminal)
opschain change execute -E dev --action Shutdown --assets db1,db2 -w --show-steps

# Scripting: print only the created change IDs
opschain change execute -E dev --action Shutdown --assets db1,db2 -q
```

**Behaviour & flags:**

| Flag | Short | Required | Description |
|---|---|---|---|
| `--project` | `-P` | Yes | Project code (or `default_project` in the profile) |
| `--environment` | `-E` | No | One or more environment codes, comma-separated. Omit it to target project-level assets (assets not in an environment) |
| `--assets` | | Yes | Comma-separated asset codes, or `'*'` for every asset in the environment(s) — or, when `-E` is omitted, every project-level asset. Quote the `'*'` so your shell doesn't expand it. Omitting `--assets` is an error; there is no implicit "all", so you can't target a whole environment by mistake. (`'*'` rather than `all` keeps a real asset code named `all` unambiguous.) |
| `--action` | `-a` | Yes | Action to run; matched against each asset's advertised action name/path (see `assets actions`) |
| `--dry-run` | | No | Show the matched/skipped matrix without creating any changes |
| `--wait-for-completion` | `-w` | No | Poll every created change to a terminal state and report final statuses. On an interactive terminal the summary table refreshes in place every 5 seconds, updating each change's status live (`pending`→`running`→`success`/`error`). When output is piped, JSON/YAML, or `-q`, it polls silently and prints once at the end |
| `--show-steps` | | No | While waiting, show each created change's step tree and refresh it in place instead of the flat status table. Interactive terminal only — piped/JSON/`-q` runs keep the summary (requires `-w`) |
| `--auto-continue-wait-steps` | | No | Have the server release any wait step each created change hits, so none of them stall in the `waiting` state. Works whether or not you wait |
| `--template-version` | `-t` | No | Template version override (asset scope) |
| `--metadata` / `--property-overrides` / `--settings-overrides` | | No | JSON objects applied to every created change |
| `--skip-steps` | | No | Glob pattern matching step `full_path`s to skip (repeatable; see §11.10) |
| `--starting-step` | | No | Begin execution at this step's `full_path` on every created change; earlier steps are skipped (see §11.11) |
| `--build-without-cache` | | No | Build container without Docker cache |

- Output is a per-target summary table (`ENVIRONMENT`, `ASSET`, `RESULT`, `CHANGE ID`, `DETAIL`); `-o json`/`yaml` emit it structured; `-q` prints only the created change IDs.
- A `skipped` asset's `DETAIL` says why: `action not supported`, or `not found in project '<P>' environment '<E>'` (the resolved project is named, so a wrong `-P`/`default_project` is easy to spot). An unexpected API failure (auth, server error) is a separate `error` row showing the message, not a skip.
- **Exit code:** `0` when every target either started a change or was cleanly skipped. Non-zero if any change failed to create, an asset lookup errored (non-404), or (with `--wait`) any change ended in a non-`success` terminal state.
- No interleaved log streaming for bulk runs — watch an individual change with `changes attach <id>`.
- `--show-steps` (with `-w`, on an interactive terminal) replaces the live status table with one section per change — a header line (`[env] asset (change-id) status`) followed by that change's step tree, all redrawing in place. Skipped and errored targets stay as one-line entries. Off a TTY, or with `-q`/`-o json,yaml`, it prints a note and falls back to the summary. See §11.2 for the glyphs.

### 11.4 Listing and filtering changes

By default, `changes list` returns the 15 most-recent changes across all scopes. It shows changes only. Workflow runs are listed under `wf runs list`; pass `--include-workflow-runs` to show them here alongside changes.

```bash
# All recent changes (default: 15, sorted newest-first)
opschain changes list

# Include workflow runs alongside changes
opschain changes list --include-workflow-runs

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

# Count every match instead of stopping at 1000
opschain changes list --project myproject --status error --exact-count

# Sort by status ascending
opschain changes list --sort "status_code asc"
```

#### How many changes matched

When more changes match than `--limit` returns, `changes list` prints the total to
stderr under the table:

```text
Note: 243 changes match - showing the most recent 15. Raise --limit to see more.
```

The server stops counting at 1000, so beyond that the note reads `more than 1000
changes match`. Add `--exact-count` for the true figure. Counting every match is
slower on a server with a long change history, so it's off by default.

The note goes to stderr, so it doesn't pollute a piped table, and it's suppressed
under `-q`. With `--include-workflow-runs` the count covers both, and the note says
so.

#### Advanced filtering with Ransack predicates

Use `--filter "field_predicate=value"` for server-side filtering. Multiple `--filter` flags are combined with AND logic.

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

### 11.5 Viewing logs

By default `logs` returns the **last 50 (newest)** log lines, printed oldest-first
so the newest line is at the bottom (like `tail`). Use `--limit` to change the
count, or `--limit 0` to return every log line.

```bash
# Fetch the last 50 log lines for a change (root step only)
opschain changes logs b5bf89b6-6512-4f18-8b4d-cdac8a597231

# Fetch the last 200 log lines
opschain changes logs b5bf89b6 --limit 200

# Fetch all log lines
opschain changes logs b5bf89b6 --limit 0

# Include logs from all child steps
opschain changes logs b5bf89b6 --include-child-steps

# View logs in UTC
opschain changes logs b5bf89b6 --utc

# Export logs as JSON
opschain changes logs b5bf89b6 -o json
```

**Follow logs in real time** with `--tail` (`-f`). It prints the initial batch,
then streams new log lines as they arrive, stopping automatically once the change
reaches a terminal status (`success`, `error`, `failed`, or `cancelled`). Press
`Ctrl-C` to stop early.

```bash
# Follow a running change's logs, including child steps
opschain changes logs b5bf89b6 --tail --include-child-steps
```

> **Note:** `--tail` requires table output and cannot be combined with `-o json`,
> `-o yaml`, or `--quiet`.

### 11.6 Reattach to a running change

If you started a change **without** `--wait-for-completion` (for example with
`changes create ... -q` to capture the ID), you can reattach later with
`changes attach` (aliases: `watch`, `reattach`). This gives you the same
experience as `create --wait-for-completion`: it polls the change status every
5 seconds, reports each status transition, and — by default — streams log lines
in real time until the change reaches a terminal status (`success`, `error`,
`failed`, or `cancelled`). Press `Ctrl-C` to detach; this does **not** affect the
running change.

```bash
# Attach to a running change and stream its logs until it completes
opschain changes attach b5bf89b6-6512-4f18-8b4d-cdac8a597231

# Attach but only show status transitions (no log streaming)
opschain changes attach b5bf89b6 --show-logs=false

# Attach and watch the step tree update in place instead of streaming logs
opschain changes attach b5bf89b6 --show-steps

# Attach and release any wait step the change hits (for changes created without the flag)
opschain changes attach b5bf89b6 --auto-continue-wait-steps

# Attach with UTC timestamps
opschain changes attach b5bf89b6 --utc

# Scripting: wait for completion, then print only the change ID
opschain changes attach b5bf89b6 -q

# Typical flow: create detached, do other work, then reattach
CHANGE_ID=$(opschain changes create -E dev -A myasset -a deploy -q)
opschain changes attach "$CHANGE_ID"
```

Like `create --wait-for-completion`, `attach` exits non-zero when the change ends
in a non-success terminal state (`error`, `cancelled`, `failed`), so it is safe
to use in CI. If the change has already finished when you attach, its final state
is printed and the command exits immediately; add `--show-steps` to also print the
completed step tree — a quick way to inspect a finished change's steps.

| Flag | Default | Description |
|------|---------|-------------|
| `--show-logs` | `true` | Stream log lines in real time (use `--show-logs=false` for status only) |
| `--show-steps` | `false` | Show a tree of the change's steps that updates in place as they run (turns off log streaming; the two can't be combined) |
| `--auto-continue-wait-steps` | `false` | Continue any wait step the change hits while you're attached (client-side — use this when the change was created without `--auto-continue-wait-steps`) |
| `--utc` | `false` | Display log timestamps in UTC instead of local time |
| `--quiet` / `-q` | `false` | Wait, then print only the change ID |

> **Note:** `attach` streams logs including child steps. For finer control over
> which logs are shown (limit, root-step-only), use `changes logs --tail` (§11.4)
> instead.

### 11.7 Cancel a change

```bash
opschain changes cancel b5bf89b6-6512-4f18-8b4d-cdac8a597231
opschain changes cancel b5bf89b6 -q   # prints ID on success
```

> **Note:** Only changes in `running` or `pending` states can be cancelled.

### 11.8 Continue a waiting change

A change that contains a **wait step** pauses in the `waiting` state until it is
explicitly continued. The `continue` command (alias: `cont`) finds the waiting
step(s) for a change and continues them.

```bash
# Continue a change that has a single waiting step (auto-detected)
opschain changes continue b5bf89b6-6512-4f18-8b4d-cdac8a597231

# Continue with a message recorded against the step
opschain changes continue b5bf89b6 -m "Sanity checks done, ok to proceed"

# Continue a specific waiting step directly (skips the lookup)
opschain changes continue b5bf89b6 --step afe3063d-3182-4c03-90c8-66ff933c15db

# Continue every waiting step of a change
opschain changes continue b5bf89b6 --all

# Continue an input step, supplying the values it is waiting on
opschain changes continue b5bf89b6 --input-arguments '{"name":"John","date":"2026-07-23"}'

# Scripting: print continued step IDs only
opschain changes continue b5bf89b6 -q
```

**Behaviour with multiple wait steps:** if a change has more than one step in the
`waiting` state, `continue` lists them and exits, asking you to re-run with
`--step <step_id>` to pick one — or `--all` to continue them all. This prevents
accidentally releasing every wait step at once.

**Input steps:** a wait step can ask for input values before it proceeds. Pass those
as a JSON object with `--input-arguments`; the keys and values are whatever the step
expects. Combine it with `--step` or `--all` the same way as a plain continue.

> **Note:** Continuing a step that is not in the `waiting` state returns an error
> from the API (e.g. `Cannot continue step because it is in the "success" state`).

**Continue automatically:** to run a change straight through its wait steps without a manual
`continue`, pass `--auto-continue-wait-steps` on `create`, `execute`, or `retry`. This sets the
flag on the change itself, so the **server** releases each wait step as the change hits it —
you don't need `--wait-for-completion` and you don't need to stay attached. A change created
without the flag sits at `waiting` until it's continued.

For a change that is **already running** and was created without the flag, `changes attach
--auto-continue-wait-steps` continues its wait steps from the client side while you're attached:
as the poll loop sees the change enter `waiting`, it continues every waiting step and keeps
polling. Each released step is logged to stderr; a step that can't be continued — for example one
that has already moved on — is logged and skipped rather than aborting the wait.

### 11.9 Retry a change

`changes retry` (alias `rerun`) re-runs a change that has finished. It sends a
retry request to the server, which re-runs the change against the same node using
the same action and source and links the new change back to the one you retried.
The original change is left untouched.

```bash
# Retry a failed change
opschain changes retry b5bf89b6-6512-4f18-8b4d-cdac8a597231

# Retry and wait, streaming logs
opschain changes retry b5bf89b6 -w --show-logs

# Retry and wait, watching the step tree redraw in place
opschain changes retry b5bf89b6 -w --show-steps

# Retry on the latest commit for the change's revision
opschain changes retry b5bf89b6 --refresh-sha

# Retry but skip different steps this time
opschain changes retry b5bf89b6 --skip-steps 'deploy/**'

# Scripting: print the new change ID only
opschain changes retry b5bf89b6 -q
```

The change being retried must be in a terminal state — `success`, `error`,
`failed`, or `cancelled`. Retrying a change that is still `running`, `pending`,
or `waiting` returns `change '<id>' is not in a terminal state (status: <status>);
cancel it before retrying`. Cancel it first with `changes cancel` (§11.7).

**What carries over.** The server re-runs the change with the original's action,
git commit, build-cache setting, skip-steps, and overrides — it reuses the
settings the change converged, so any setting it didn't override keeps the value
it ran with. You don't rebuild the inputs.

**Changing what carries over.** Override individual pieces with the flags below. A
flag replaces the original's value; `--metadata` is merged over the original's
metadata by the server.

**Retry flags:**

| Flag | Default | Description |
| --- | --- | --- |
| `--refresh-sha` | `false` | Re-resolve the git revision so the retry runs the latest commit for it. For an asset, moves the retry onto the asset's current template version |
| `--build-without-cache` | original's | Build the image without cache |
| `--skip-steps` | original's | Glob pattern matching step `full_path`s to skip (repeatable; see §11.10) |
| `--settings-overrides` | original's | JSON settings overrides object |
| `--metadata` | merged | JSON metadata object, merged over the original's |
| `-w, --wait-for-completion` | `false` | Wait for the new change to finish (polls every 5s) |
| `--show-logs` | `false` | Stream logs while waiting (needs `-w`) |
| `--show-steps` | `false` | Show the live step tree while waiting (needs `-w`; not with `--show-logs`) |
| `--auto-continue-wait-steps` | `false` | Continue any wait step the retry hits, client-side while polling (needs `-w`) |
| `--utc` | `false` | Show log timestamps in UTC (use with `--show-logs`) |

The wait, log, and step-tree flags behave as they do on `changes create` (§11.2).
`--auto-continue-wait-steps` works differently here: the retry request has no
server-side auto-continue field, so the CLI releases wait steps itself while it
polls. It therefore needs `-w`, and passing it without `-w` returns
`--auto-continue-wait-steps requires --wait-for-completion on retry`. With `-w`,
the command exits non-zero if the new change finishes in any state other than
`success`.

### 11.10 Skip steps with `--skip-steps`

`--skip-steps` skips selected steps of an action instead of running them. You pass
glob patterns; each pattern is matched against a step's **`full_path`** — the
slash-joined chain of action codes from the root of the tree down to that step.
The last segment of a `full_path` is the step's action code.

Here is part of the step tree for a `Provision` change, with the `full_path` you'd
match on beside each step:

```text
Provision                                                          Provision
└─ Binaries                                                        Provision/mintmodel:binaries
   ├─ Install Software Binaries                                    Provision/mintmodel:binaries/mintmodel:install_software_binaries
   │  └─ Install Binaries (custwprd1otd01)                         .../mintmodel:install_software_binaries/mintmodel:install_binaries_for_custwprd1otd01
   └─ Apply patches                                                Provision/mintmodel:binaries/mintmodel:apply_patches_for_stage_post_binaries
      ├─ Apply patches (custwprd1otd01)                            .../mintmodel:apply_patches_for_stage_post_binaries/mintmodel:apply_patches_for_stage_post_binaries_on_custwprd1otd01
      │  └─ apply Patch 34236279                                   .../mintmodel:apply_patch_34236279_on_custwprd1otd01_to_oracle_app_binaries_obpotd_fmw
      └─ Apply patches (custwprd1otd02)                            .../mintmodel:apply_patches_for_stage_post_binaries/mintmodel:apply_patches_for_stage_post_binaries_on_custwprd1otd02
```

Patterns match the `full_path` (the code path), not the human labels on the left.

**Passing more than one pattern.** `--skip-steps` is repeatable — pass it once per
pattern. It is **not** comma-separated. To skip five specific steps out of fifty,
repeat the flag five times:

```bash
opschain changes create -E dev -A obpotd -a Provision \
  --skip-steps 'Provision/mintmodel:binaries/mintmodel:install_software_binaries/mintmodel:install_binaries_for_custwprd1otd01' \
  --skip-steps 'Provision/mintmodel:binaries/mintmodel:apply_patches_for_stage_post_binaries/mintmodel:apply_patches_for_stage_post_binaries_on_custwprd1otd01' \
  --skip-steps 'Provision/mintmodel:binaries/mintmodel:apply_patches_for_stage_post_binaries/mintmodel:apply_patches_for_stage_post_binaries_on_custwprd1otd02' \
  --skip-steps 'Provision/mintmodel:binaries/mintmodel:transfer_content_to_targets_post_binaries' \
  --skip-steps 'Provision/mintmodel:binaries/mintmodel:execute_on_targets_post_binaries'
```

A comma does not split a pattern:

```bash
# WRONG — this is ONE pattern that literally contains commas, so it matches nothing
opschain changes create ... --skip-steps 'stepA,stepB,stepC'
```

This differs from `changes execute`, where `--assets` and `-E` do take
comma-separated lists (§11.3). `--skip-steps` never splits on commas.

**Glob syntax.** Patterns follow Ruby `File.fnmatch` path rules:

| Pattern | Matches |
| --- | --- |
| `foo/bar` | exactly that step |
| `foo/**` | `foo` and every step beneath it, at any depth |
| `foo/*` | the direct children of `foo` only |
| `**/mintmodel:apply_patch_*` | any step whose leaf code starts with `mintmodel:apply_patch_` |
| `**/*_on_custwprd1otd01_*` | any step scoped to host `custwprd1otd01` |

`**` crosses `/` (spans levels); `*` matches within a single segment; `?` matches
one character. Always single-quote patterns so your shell doesn't expand `*`/`**`
against local filenames before the CLI sees them.

**Targeting many steps at once.** Where the steps you want to drop share a parent
or a naming pattern, one glob beats a long list of exact paths:

```bash
# Skip a whole subtree — every step under "Apply patches"
opschain changes create ... --skip-steps 'Provision/mintmodel:binaries/mintmodel:apply_patches_for_stage_post_binaries/**'

# Skip every patch step, wherever it sits in the tree
opschain changes create ... --skip-steps '**/mintmodel:apply_patch_*'

# Skip everything scoped to one host
opschain changes create ... --skip-steps '**/*_on_custwprd1otd01_*'
```

Reach for repeated exact `--skip-steps` values when the steps don't share a
pattern; reach for a glob when they do.

**Finding the exact `full_path`.** Get the paths from the step tree rather than
guessing them:

```bash
# Pull every step's full_path from an existing change (copy the strings verbatim)
opschain changes get b5bf89b6 -o json | jq -r '.attributes.initial_step_tree | .. | .full_path? // empty'

# Or watch the tree while a change runs
opschain changes create -E dev -A obpotd -a Provision -w --show-steps
```

`opschain assets actions <asset> --tree` (§9) also prints each step's action code.
Note the change's tree is rooted at the action (e.g. `Provision/…`), so include
that root in your patterns or anchor them with `**/`.

**Where it works.** `--skip-steps` is available on `changes create`,
`changes execute`, `changes retry`, `workflows runs create`, `workflows runs
retry`, `scheduled-activities create`, and `scheduled-activities update`. On the
retry commands, omitting `--skip-steps` inherits the original run's patterns;
passing it replaces them.

### 11.11 Start partway through an action with `--starting-step`

`--starting-step` runs a templated or MintModel action from a step partway down
its tree instead of from the top. You give it one step's `full_path`; execution
begins there. Every step before it in the tree is skipped, except that step's
ancestors and the root step, which still run so the action can reach it.

```bash
# Run the "deploy" action, but start at its child2 step
opschain changes create -E dev -A myasset -a deploy --starting-step 'deploy/child2'
```

The path is the same `full_path` `--skip-steps` uses (§11.10) — the slash-joined
chain of action codes from the root down to the step. Find it the same way, with
`changes get <id> -o json`, `changes create ... -w --show-steps`, or
`assets actions <asset> --tree` (§9).

`--skip-steps` and `--starting-step` combine: the starting step sets where the run
begins, and any `--skip-steps` patterns still drop matching steps from what runs
after it.

`--starting-step` works on `changes create` and `changes execute`. It is not
accepted with the scheduling flags (`--schedule`, `--run-at`); using them together
returns `--starting-step cannot be used with scheduling flags`. `changes retry`
doesn't take `--starting-step` — the server reuses the original change's steps.

---

## 12. Workflows

Workflows are reusable, versioned automation scripts written in YAML that orchestrate multi-step actions. They are project-scoped.

> **Note:** Commands in this section require a project code. Either pass `--project <code>` / `-P <code>` on each command, or set `default_project` in your active profile (see §3.1) to omit it entirely.

### 12.1 Managing workflows

```bash
# List workflows in a project
opschain workflows list
opschain workflows list --limit 10          # first 10 only

# Get a workflow by code, name, or ID (see §4 "Referring to a resource")
opschain workflows get deploy-app
opschain workflows get --id <uuid>

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

# Create a new version from an updated YAML file
opschain workflows versions create deploy-app --source-yaml-file deploy-app.yaml

# Create/update a version and expand multi-target steps + replace properties,
# optionally supplying property values used during resolution
opschain workflows versions create deploy-app --source-yaml-file deploy-app.yaml \
  --resolve-properties --property-overrides '{"replicas": 3}'
opschain workflows versions update deploy-app 2 --source-yaml-file deploy-app.yaml \
  --resolve-properties --property-overrides '{"replicas": 3}'
```

`--resolve-properties` expands multi-target steps and replaces properties in the stored
version; `--property-overrides` (a JSON object) supplies the property values used during that
resolution. Both are available on `workflows versions create` and `workflows versions update`.

`workflows list` returns up to the server's limit of 100 workflows. Pass `--limit` to cap it
lower.

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

# Skip steps matching a glob pattern (repeat the flag for multiple patterns)
opschain workflows runs create --code deploy-app --version 2 \
  --skip-steps 'steps/to/skip/**'

# Notify an email address and an LDAP group when the run errors or succeeds
opschain workflows runs create --code deploy-app --version 2 \
  --notify-email ops@example.com --notify-ldap-group platform \
  --notify-event error,success

# Capture the run ID
RUN_ID=$(opschain workflows runs create --code deploy-app --version 2 -q)

# List runs for one workflow
opschain workflows runs list --code deploy-app
opschain workflows runs list --code deploy-app --limit 20

# List runs across every workflow and project (omit --code)
opschain workflows runs list --limit 50

# All runs that errored, newest first
opschain workflows runs list --filter status_code_eq=error

# Get status of a specific run
opschain workflows runs get $RUN_ID

# Reattach to a detached run and follow it to completion (streams logs by default)
opschain workflows runs attach $RUN_ID
opschain workflows runs attach $RUN_ID --show-steps      # live step tree instead of logs
opschain workflows runs attach $RUN_ID --show-logs=false # status transitions only

# View logs for a run
opschain workflows runs logs $RUN_ID
opschain workflows runs logs $RUN_ID --utc

# Retry a failed/cancelled run
opschain workflows runs retry $RUN_ID
opschain workflows runs retry $RUN_ID --wait-for-completion --show-logs

# Retry, overriding the skip_steps of the run being retried
# (omit --skip-steps to inherit the original run's skip_steps unchanged)
opschain workflows runs retry $RUN_ID --skip-steps 'steps/to/skip/**'

# Cancel a running workflow run
opschain workflows runs cancel $RUN_ID
```

> For `--skip-steps` pattern syntax and how to find a step's `full_path`, see §11.10.

**Listing runs.** `workflows runs list --code <code>` (with a project) lists one workflow's runs.
Omit `--code` and it lists runs across every workflow and project. In both modes `--limit` caps
the count, `--sort` sets the order (default `updated_at desc`), and `--filter` applies ransack
predicates (`field_predicate=value`, repeatable) — e.g. `--filter status_code_eq=error`.

**Attaching to a run.** `workflows runs create -w` waits and streams from the start, but a run
created detached (e.g. with `-q`) has no terminal following it. `workflows runs attach <run_id>`
(aliases `watch`, `reattach`) reattaches: it polls every 5 seconds and, by default, streams log
lines until the run reaches a terminal status. Pass `--show-logs=false` for status transitions
only, or `--show-steps` to watch the step tree redraw in place instead (the two can't be
combined). `--auto-continue-wait-steps` releases any plain wait step the run hits while you are
attached; approval steps are left for you to `approve`/`reject` (see §12.3). If the run has
already finished, attach prints its final state and exits — non-zero when the run ended in any
non-success state, so it is safe in scripts; add `--show-steps` to also print the completed step
tree. Ctrl-C detaches without affecting the run.

**Notifications.** The `--notify-*` flags subscribe recipients to a run's lifecycle events.
Name recipients with any mix of `--notify-user-id` (a user's UUID), `--notify-ldap-group`, and
`--notify-email`; each is repeatable or comma-separated. `--notify-event` picks which events
fire a notification — one or more of `cancel`, `create`, `error`, `finish`, `start`, `success`
(default: all). Omit every `--notify-*` flag and no notifications are configured.

### 12.3 Approvals and paused steps

A run can pause on a step and wait for a person: a **wait step** holds until someone continues
it, and an **approval step** holds until someone approves or rejects it. Advance those steps
with `workflows runs steps`.

Address the list by the run's UUID; address a single step by the step's own UUID (which `list`
prints).

```bash
# List the steps of a run, with their status and who must approve each
opschain workflows runs steps list $RUN_ID

# Render the step hierarchy as a tree (shows each step's target asset and action)
opschain workflows runs steps list $RUN_ID --tree

# List steps across every run — e.g. everything still waiting for approval
opschain workflows runs steps list --filter status_code_eq=waiting

# Just the step IDs
opschain workflows runs steps list $RUN_ID -q

# Inspect one step and read its logs
opschain workflows runs steps get $STEP_ID
opschain workflows runs steps logs $STEP_ID --utc

# Approve an approval step (releases it so the run continues)
opschain workflows runs steps approve $STEP_ID --message "reviewed and approved"

# Reject an approval step (fails it so the run stops there)
opschain workflows runs steps reject $STEP_ID --message "wrong target environment"

# Continue a wait step
opschain workflows runs steps continue $STEP_ID
```

`--message` is optional on `approve`, `reject`, and `continue`; the note is recorded against the
step. On success each prints the step's new status, or just the step ID with `-q`. The `TYPE`
column in `list` shows the step kind — `wait`, `change`, `noop`, or `workflow` (a child
workflow).

To find a paused step, run `workflows runs steps list $RUN_ID` and look for `waiting` in the
`STATUS` column; the `REQUIRES APPROVAL` column names the users or groups whose approval an
approval step needs.

In `--tree` output, a step that runs an action against a node shows its target and action, e.g.
`Stop all assets in parallel [change/running] → d1/obpcid (Shutdown)`. This matters for a
multi-target change, where every fanned-out step shares the same name — the target is what tells
them apart. The target is shown as `environment/asset` (or just the asset for a project-level
one), so the same asset run across several environments stays distinguishable (`d1/obpcid` vs
`d2/obpcid`). If a workflow spans more than one project (a step that runs a child workflow in
another project), the project is added too — `projA/d1/obpcid` — so cross-project targets don't
collide either; single-project runs leave it off to stay uncluttered. Targets come from the run's
step tree, so they appear when you scope to a single run; a cross-run `list` (no run id) shows the
action alone. Drop the run ID to list steps across every run — pair it with `--filter` to
sweep for work, e.g. `--filter status_code_eq=waiting` for everything currently awaiting a person.
`--filter` takes ransack predicates (`field_predicate=value`) and repeats.

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

# Skip steps matching a glob pattern on the scheduled runs (repeatable)
opschain scheduled-activities create \
  --type scheduled_change \
  -E dev -A myasset -a deploy \
  --schedule "0 2 * * *" \
  --skip-steps 'steps/to/skip/**'

# Have the server release wait steps on each scheduled run
opschain scheduled-activities create \
  --type scheduled_change \
  -E dev -A myasset -a deploy \
  --schedule "0 2 * * *" \
  --auto-continue-wait-steps

# Update a scheduled activity
opschain scheduled-activities update <id> --schedule "0 3 * * *"
opschain scheduled-activities update <id> --enabled=false    # disable
opschain scheduled-activities update <id> --git-rev develop
opschain scheduled-activities update <id> --skip-steps 'steps/to/skip/**'
opschain scheduled-activities update <id> --auto-continue-wait-steps
opschain scheduled-activities update <id> --settings-overrides '{"dockerfile": "Dockerfile_custom"}'

# Delete a scheduled activity
opschain scheduled-activities delete <id>
```

> For `--skip-steps` pattern syntax and how to find a step's `full_path`, see §11.10.
> On `update`, passing `--skip-steps` replaces the stored patterns with the ones you
> give; omit it to leave them unchanged.
>
> `update` also takes `--property-overrides`, `--settings-overrides`, and
> `--metadata` (each a JSON object), the same as `create`. Passing one replaces the
> stored value; omit it to leave it unchanged.

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

Look policies up by name, code, or UUID — a bare argument is matched as a code, then ID, then name (see §4 "Referring to a resource"), or force one with `--code` / `--name` / `--id`.

```bash
# List all policies
opschain authorisation-policies list
opschain auth-policies list   # alias

# Get a policy by name, code, or ID
opschain authorisation-policies get "Read-Only Users"
opschain authorisation-policies get --id abc-uuid-123
opschain authorisation-policies get --name "Read-Only Users"

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

Rules control access at specific resource paths. Each rule is a standalone resource that can be associated with one or more policies.

**Permitted rule fields:** `path`, `readable`, `updatable`, `executable`, `deletable`, `name`  
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

# Create a rule with full access and a name label
opschain authorisation-policies rules create "DevOps Team" \
  --path "/projects/myproject" \
  --readable \
  --updatable \
  --executable \
  --deletable \
  --name "Full project access"

# Update a rule (only supply the fields you want to change)
opschain authorisation-policies rules update "Read-Only Users" <rule-id> \
  --executable=true

opschain authorisation-policies rules update "Read-Only Users" <rule-id> \
  --deletable=true

opschain authorisation-policies rules update "Read-Only Users" <rule-id> \
  --name "Project viewers"

# Delete a rule (dissociates from the policy; the standalone rule remains)
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
  --readable \
  --name "Read myproject"

# Assign a group
opschain authorisation-policies assignments set "Project Viewers" \
  --groups "developers"

# Create a per-environment write policy
opschain authorisation-policies create "Dev Deployers"
opschain authorisation-policies rules create "Dev Deployers" \
  --path "/projects/myproject/environments/dev" \
  --readable --updatable --executable \
  --name "Dev environment access"

opschain authorisation-policies assignments set "Dev Deployers" \
  --users alice,bob

# Create a full-access policy
opschain authorisation-policies create "Platform Admins"
opschain authorisation-policies rules create "Platform Admins" \
  --path "/" \
  --readable --updatable --executable \
  --name "Full access"

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

### 15.3 Scoping to a project, environment or asset

Use `-P/--project`, `-E/--environment` and `-A/--asset` to scope events to a node in the project hierarchy — the same flags used by `changes list`. Scoping is **inclusive of descendants**: scoping to an environment also returns the events emitted by its assets, changes and steps.

```bash
# All events for a project (and everything nested under it)
opschain events list -P myproject

# All events for an environment (and its assets/changes/steps)
opschain events list -P myproject -E dev

# Events for a specific asset within an environment
opschain events list -P myproject -E dev -A my_asset

# Events for an asset in any environment of the project
opschain events list -P myproject -A my_asset
```

Notes:

- `--environment` and `--asset` both require `--project` (via the flag, the `OPSCHAIN_DEFAULT_PROJECT` env var, or a profile `default_project`).
- These flags translate to `event_node_path` filters for you, so you don't have to remember the `_eq` vs `_start` distinction (using `_eq` on an environment would silently drop its assets' events — scoping handles this correctly).
- Scoping flags compose with the convenience filters and `--filter` (all AND-ed together), e.g. `opschain events list -P myproject -E dev --type "change.completed"`.
- The listing table includes a `NODE PATH` column showing each event's `event_node_path`.

For hand-rolled `event_node_path` filters, see the `--filter` section below.

### 15.4 Advanced filtering with `--filter`

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

### 15.5 Sorting

```bash
# Sort by created_at ascending (oldest first)
opschain events list --sort "created_at asc"

# Sort by type
opschain events list --sort "type asc"
```

Default sort is `created_at desc` (newest first).

### 15.6 Timezone

The `CREATED AT` column shows timestamps in your system's local timezone by default. Pass `--utc` to `events list` or `events get` to show them in UTC instead.

```bash
# Local timezone (default)
opschain events list

# UTC
opschain events list --utc
opschain events get eb89e69e-5feb-4751-abe7-8a2fa53ce42e --utc
```

`--utc` only affects the table output. `--output json` and `--output yaml` always emit the raw timestamps returned by the API.

### 15.7 Get a specific event

```bash
opschain events get <event-id>
opschain events get eb89e69e-5feb-4751-abe7-8a2fa53ce42e --output json
```

### 15.8 Creating a custom event

You can emit custom events — useful for marking external milestones (pipeline stages, approvals, deployments from other tools) in the OpsChain audit trail.

`--type` is required. Additional attributes can be passed inline as JSON via `--data`, or loaded from a file via `--from-file`. The two are mutually exclusive.

```bash
# Minimal event
opschain events create --type "deploy.started"

# With additional context inline
opschain events create \
  --type "deploy.completed" \
  --data '{"environment": "prod", "version": "v2.1.0", "triggered_by": "github-actions"}'

# Load data from a file
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

## 17. Support Bundles (Diagnostics)

When a change fails and you need to raise a defect or feature request with LimePoint support,
`support bundle` collects everything support typically asks for — in one command — so you don't
have to hunt down the change, its logs, the properties it ran with, and version numbers by hand.

```bash
# Write <binary>-support-<change-id>.zip in the current directory
opschain support bundle 3a646e8e-ce5c-499a-8488-2d0377c6a980

# Choose the output path
opschain support bundle <change-id> --out-file ./ticket-1234.zip

# Only the human-readable summary, printed to stdout (paste into a ticket)
opschain support bundle <change-id> --summary-only

# Collect everything: full logs for all steps
opschain support bundle <change-id> --log-limit 0 --step-logs all
```

### What it collects

Collection is **best-effort**: if a piece can't be fetched (permissions, a change with no
asset, etc.) it is noted in `manifest.json` and `SUMMARY.md` rather than failing the command.

- **Change** — status, action, git remote/rev/commit, who ran it, timestamps, and its metadata
  (comments + any custom metadata, surfaced in `SUMMARY.md`; also present verbatim in `change.json`).
- **Steps** — the step tree with per-step status.
- **Logs** — the change-level log (`logs/change.log`) plus per-step logs under `logs/steps/`. By
  default only the genuinely failed step(s) (status `error`/`failed`) are captured — not the
  `aborted`/`cancelled` steps that were merely stopped downstream of the failure. Use
  `--step-logs all` for every step or `--step-logs none` to skip per-step logs.
- **Properties & settings** — the *effective* (converged) properties the change ran with; the
  *initial* and *final* converged change properties (as captured pre-run and post-run); the
  change's `override` properties/settings; and the `project`/`environment`/`asset` level
  properties and settings.
- **Template** — the template and template version the change ran against (`template/`), including
  the git remote/rev/commit that pins the source.
- **MintModel** (mintmodel changes only) — the rendered MintModel JSON and the source ERB
  (`mintmodel/mintmodel.json` and `mintmodel/mintmodel.json.erb`).
- **Server info** — OpsChain version, API version, DB version, runner image, licence.
- **CLI version** — version, commit, build date.
- **Recent run history** — the last 5 runs of this change's action at the same node (id, status,
  date), plus the most recent successful run — so support can see the trend and when it last
  worked. Shown in `SUMMARY.md`.
- **Events** — the last 10 events at **each node level** the change involves (asset, environment,
  project), collected separately per level (`events/<level>.json`) and summarised in `SUMMARY.md`.
  Since events can't be listed by change id, this per-level view surfaces what happened around the
  failure at every scope.

### Credentials

The CLI does **not** perform any client-side redaction — it collects what the OpsChain API
returns. OpsChain already redacts sensitive values in logs and settings server-side, and
credentials are encrypted at rest (AES) and are not decryptable by support, so the collected
artifacts are safe to attach to a ticket.

### Flags

| Flag | Default | Description |
|---|---|---|
| `--out-file` | `<binary>-support-<change-id>.zip` | Output path. A `.md` file when combined with `--summary-only`. |
| `--summary-only` | `false` | Emit only the Markdown summary (to `--out-file`, or stdout if unset); no archive. |
| `--log-limit` | `2000` | Maximum log lines to collect **per log file** (`logs/change.log` and each step log). `0` means all; when capped, the newest lines are kept. |
| `--step-logs` | `failed` | Which per-step logs to collect under `logs/steps/`: `failed` (only `error`/`failed` steps — the actual failures, not downstream `aborted`/`cancelled` steps), `all` (every step), or `none` (skip). |
| `--utc` | `false` | Render `logs/` and `SUMMARY.md` timestamps in UTC. By default they use the local timezone of the machine running the CLI; each timestamp is labelled with its zone. |

As the bundle makes several API calls, live progress is printed to **stderr** with the elapsed
time on each line (`[  0.8s] … Fetching change log`), so the command doesn't look hung and you can see
how long each phase took; the final line reports the total (`... (took 4.3s)`). stdout stays
clean for `--summary-only`. With `-q`/`--quiet` the progress is suppressed and the command
prints only the written archive path (useful for scripting).

### Bundle contents

The archive contains a single top-level folder named after the archive (so unzipping creates
one tidy directory rather than scattering files into the current directory):

```text
<binary>-support-<change-id>.zip
└── <binary>-support-<change-id>/
    ├── SUMMARY.md            # human-readable, ticket-ready
    ├── change.json
    ├── steps.json
    ├── logs/
    │   ├── change.log        # change-level log (no child steps)
    │   └── steps/            # per-step logs, e.g. 2-run-error.log (failed step(s) by default)
    ├── info.json
    ├── events/              # per node level: asset.json, environment.json, project.json (last 10 each)
    ├── properties/          # effective.json, initial.json, final.json, override.json, project.json, environment.json, asset.json
    ├── settings/            # override.json, project.json, environment.json, asset.json
    ├── template/            # template.json, template_version.json
    ├── mintmodel/           # mintmodel.json + mintmodel.json.erb (mintmodel changes only)
    └── manifest.json        # what was/wasn't collected, CLI version, timestamp
```

---

## 18. Generating an AI agent skill

The CLI can generate a "skill" that teaches an AI coding agent how to use it. A skill is a
self-contained reference an agent loads on demand when you ask it to work with OpsChain, so it
can run the right commands without you spelling out every flag.

The skill is built by walking the binary's own command tree, so it always matches the commands,
subcommands, and flags present in *your* build — there is nothing to keep in sync by hand.

### Commands

```bash
# Write a Claude Code skill to ./.claude/skills/opschain-cli/SKILL.md
opschain generate-skill

# Write it into a specific project directory
opschain generate-skill --out-dir ~/projects/myapp

# Print to stdout instead of writing files (e.g. to pipe or inspect)
opschain generate-skill --stdout
```

### Flags

| Flag | Default | Description |
|------|---------|-------------|
| `--out-dir` | `.` | Directory to write into; files are placed under it (e.g. `.claude/skills/opschain-cli/SKILL.md`). |
| `--target` | `claude` | Which agent to generate for. Currently only `claude` (Claude Code) is supported. |
| `--stdout` | `false` | Print the generated file(s) to stdout instead of writing them to disk. |

### Using the skill with Claude Code

Run `opschain generate-skill` at the root of a project. It writes
`.claude/skills/opschain-cli/SKILL.md`. Commit that directory (or copy it to `~/.claude/skills/`
to make it available in every project), and Claude Code will pick it up automatically — when you
ask Claude to do something with OpsChain, it loads the skill and uses the documented commands.

Regenerate the skill after upgrading the CLI so it reflects any new commands or flags.

> **Branding note:** A MintPress binary produces a `mintpress-cli` skill with MintPress config
> paths and `MINTPRESS_*` environment variables. Everything adapts to the binary's branding.

---

## 19. Secrets

OpsChain can encrypt values and read or write them in a secret vault. An encrypted value is safe to store in properties or settings; OpsChain decrypts it at run time.

### Commands

```bash
# Encrypt a value (returns the OpsChain-encrypted form)
opschain secrets encrypt --value "my-secret-value"

# Print just the encrypted string, for scripting
opschain secrets encrypt --value "my-secret-value" -q

# Store a value in a vault, identifying the node by UUID
opschain secrets store \
  --vault-owner-id cbde41d5-0cf2-45be-b4c2-04731c56bc0e \
  --vault-path secret-vault://path/to/key \
  --value "my-secret-value"

# Store a value, identifying the node by project code (resolved to its UUID)
opschain secrets store -P myproject \
  --vault-path secret-vault://path/to/key \
  --value "my-secret-value"

# Omit --value to let the vault generate a random value (returned in the result)
opschain secrets store -P myproject \
  --vault-path secret-vault://path/to/key

# Overwrite an existing value at the path
opschain secrets store -P myproject \
  --vault-path secret-vault://path/to/key \
  --value "new-value" --replace

# Store a file's contents as the secret value (the filename is ignored)
opschain secrets store-file -P myproject \
  --vault-path secret-vault://path/to/key \
  --file ./id_rsa

# Resolve (decrypt) a value from the vault — pass the encrypted value stored at the path
opschain secrets resolve -P myproject \
  --vault-path secret-vault://path/to/key \
  --expected-value "{AES2}...{/IV}..."

# Print just the decrypted value
opschain secrets resolve -P myproject \
  --vault-path secret-vault://path/to/key \
  --expected-value "{AES2}...{/IV}..." -q
```

`store`, `store-file`, and `resolve` need the node whose vault configuration is used. Give it directly with `--vault-owner-id` (a node UUID), or name the node by code with `-P/--project` (optionally `-E/--environment` or `-A/--asset`) and the CLI looks up its UUID. `-E` and `-A` require a project. `resolve` is also available as `secrets global`.

`store-file` is the file-based form of `store`: instead of `--value`, it uploads `--file` and stores the file's contents at the path. Binary files are base64-encoded for you, and the filename itself isn't stored.

**`store` flags:**

| Flag | Required | Description |
|---|---|---|
| `--vault-path` | Yes | Vault path to store the value at, e.g. `secret-vault://path/to/key` |
| `--value` | No | The secret value to store. Omit it and the vault generates a random value, returned in the result |
| `--vault-owner-id` | * | UUID of the node whose vault configuration is used |
| `--project` / `-P` | * | Project code of the node, resolved to its UUID |
| `--environment` / `-E` | No | Environment code of the node (requires `--project`) |
| `--asset` / `-A` | No | Asset code of the node (requires `--project`) |
| `--replace` | No | Replace the value if one already exists at the path |

\* Provide either `--vault-owner-id` or `--project`.

**`store-file` flags:**

| Flag | Required | Description |
|---|---|---|
| `--vault-path` | Yes | Vault path to store the contents at, e.g. `secret-vault://path/to/key` |
| `--file` | Yes | Path to the local file whose contents are stored |
| `--vault-owner-id` | * | UUID of the node whose vault configuration is used |
| `--project` / `-P` | * | Project code of the node, resolved to its UUID |
| `--environment` / `-E` | No | Environment code of the node (requires `--project`) |
| `--asset` / `-A` | No | Asset code of the node (requires `--project`) |
| `--replace` | No | Replace the value if one already exists at the path |

\* Provide either `--vault-owner-id` or `--project`.

**`resolve` flags:**

| Flag | Required | Description |
|---|---|---|
| `--vault-path` | Yes | Vault path to resolve |
| `--vault-owner-id` | * | UUID of the node whose vault configuration is used |
| `--project` / `-P` | * | Project code of the node, resolved to its UUID |
| `--environment` / `-E` | No | Environment code of the node (requires `--project`) |
| `--asset` / `-A` | No | Asset code of the node (requires `--project`) |
| `--expected-value` | Yes | The encrypted value currently stored at the path. The server verifies it matches and returns the decrypted plaintext. Required by the API despite being marked optional in the OpenAPI spec. |

\* Provide either `--vault-owner-id` or `--project`.

Each command prints a table (SOURCE, RESULT, FILENAME) by default. Use `-o json` / `-o yaml` for the full response, or `-q` to print only the result value — the encrypted string, decrypted value, or stored path.

---

## 20. Administering the cluster

`opschain admin` works with state that spans every node — what the server is busy
with, how loaded its worker pools are, and the Kubernetes deployments and pods it
runs on. These commands require an administrator account.

### 20.1 What the server is doing

```bash
# What is the server working on right now?
opschain admin background-tasks
opschain admin background-tasks -o json    # full detail (image SHA, render logs, links)
opschain admin background-tasks -q         # task IDs only

# How busy are the worker pools?
opschain admin resource-slots
opschain admin resource-slots -o json      # per-slot detail
```

`admin background-tasks` (alias `tasks`) lists every node background task that
hasn't finished yet, across all nodes — generate-actions requests, MintModel
concretise tasks, agent image builds, and agent start/stop tasks. The table shows
ID, REQUEST #, STATUS, TASK TYPE, CREATED BY, and CREATED AT.

`admin resource-slots` (alias `slots`) shows the resource slot pools. Each pool —
`actions_refresh`, `runner`, `mintmodel_concretise`, `image_build` — has a fixed
number of slots that cap how much work of that kind runs at once. The table shows
POOL, LIMIT, CLAIMED, and FREE. Use `-o json` for per-slot detail: which node holds
each slot, since when, and whether the claim is stale.

### 20.2 Deployments

```bash
# What is deployed, and at how many replicas?
opschain admin deployments list
opschain admin deployments list -o json    # rollout conditions, images, labels, selector
opschain admin deployments list -q         # deployment names only

# Replace a deployment's pods without changing its configuration
opschain admin deployments restart opschain-api-worker

# Run more workers
opschain admin deployments scale opschain-api-worker --replicas 5

# Stop a deployment processing work
opschain admin deployments scale opschain-mintmodel-steps-api --replicas 0
```

`admin deployments` (aliases `deployment`, `deploys`) is the command group; `list`
shows NAME, REPLICAS, READY, AVAILABLE, MAX, and RESTARTED AT. REPLICAS is the count the deployment is configured to run;
READY and AVAILABLE are how many pods have reached those states, and show `-` when
Kubernetes reports none. MAX is the replica ceiling — a deployment showing MAX 1
cannot be scaled.

`restart` performs a rolling restart, replacing each pod without changing the
deployment's configuration. `scale` sets the replica count, which must be between 0
and that deployment's MAX. Only the worker deployments can be scaled; scaling any
other one is rejected with `Deployment '<name>' cannot be scaled`, naming the ones
that can.

Kubernetes applies both asynchronously. The command returns once the change is
accepted, not when the rollout finishes — run `admin deployments list` to watch it.
Two consequences worth planning around:

- Restarting the OpsChain API deployment kills the pod serving your request.
- Scaling down doesn't stop the surplus workers straight away. They keep running
  until they finish their in-progress jobs, for up to the deployment's termination
  grace period — 1 hour by default.

A replica count set here isn't written back to the Helm values, so the next Helm
upgrade returns the deployment to its configured count.

`restart` and `scale` need the `updatable` permission on the
`/admin/deployments/restart` and `/admin/deployments/scale` authorisation paths. A
rule on a parent path such as `/admin` grants it; a rule on the specific path
overrides that parent rule.

### 20.3 Pods and their logs

```bash
# What pods are running?
opschain admin pods list
opschain admin pods list -o json           # image, node and pod IPs, labels, UID
opschain admin pods list -q                # pod names only

# Read a pod's log (last 1000 lines)
opschain admin pods logs opschain-api-worker-55db895694-vn4hr

# A specific container of a multi-container pod
opschain admin pods logs mintpress-ingress-6bbc64c54b-stph4 --container proxy

# More lines, then page forward from the last one
opschain admin pods logs opschain-api-7c688bdd47-zzvm7 --limit 5000
opschain admin pods logs opschain-api-7c688bdd47-zzvm7 --since '2026-08-07T20:10:32.191676Z-0'

# Write the whole log to a file
opschain admin pods logs change-3ecf1a2b --out-file runner.log
```

`admin pods list` covers every pod in the namespace — the runner pods executing
changes, the MintModel pods, and the API and worker pods. The table shows NAME,
STATE, RESTARTS, NODE, STARTED, and CONTAINERS. The CONTAINERS column is what you
pass to `logs --container`.

`admin pods logs` prints the log oldest line first. Pass `--container` for a pod
with more than one; without it you get the pod's first container. Naming one that
doesn't exist returns `'<name>' is not a container of pod '<pod>'` and lists the
valid ones.

When the log has more lines than `--limit`, the CLI prints a note to stderr with the
cursor to continue from:

```text
Note: the pod log has more lines than the limit. Continue with --since '2026-08-07T20:10:32.191676Z-0', raise --limit, or use --out-file.
```

Pass that value to `--since` to get the lines after it. Use a log line id — the
`id` field in `-o json` output, or what `-q` prints — rather than a bare timestamp,
which drops every line sharing that timestamp.

**`logs` flags:**

| Flag | Default | Description |
|---|---|---|
| `--container` | The pod's first container | Container to read the log of |
| `--limit` / `-l` | 1000 | Maximum number of log lines to return |
| `--since` | — | Only return lines after this log line id |
| `--out-file` | — | Write the entire pod log to this file as plain text. Ignores `--limit` and `--since` |
| `--utc` | Local timezone | Display timestamps in UTC |

Reading pod logs needs the `readable` permission on the `/admin/pods/logs`
authorisation path.

Two limits apply to what Kubernetes will give you. Pod logs only exist while the pod
does, so use `opschain changes logs` to review a change that has already finished.
And at most 100MB of a pod's log is read per request — output beyond that isn't
returned.

### 20.4 Deleting a stuck pod

```bash
# Force delete a pod (prompts to confirm)
opschain admin pods delete change-3ecf1a2b-4d5e-4f60-8a71-92b3c4d5e6f7

# Skip the prompt, for scripts
opschain admin pods delete change-3ecf1a2b --force

# The accepted pod as JSON, or just its name
opschain admin pods delete change-3ecf1a2b --force -o json
opschain admin pods delete change-3ecf1a2b --force -q
```

`admin pods delete` force deletes a pod without waiting out its termination grace
period. It prompts before doing anything:

```text
This will force delete pod 'change-3ecf1a2b', failing any step or task it is running. Continue? [y/N]
```

Pass `--force` to skip the prompt in a script. Kubernetes removes the pod
asynchronously, so the command reports the pod as it was accepted for deletion.

Only the pods OpsChain creates to do its own processing can be deleted — change
workers, step runners, agents, generate actions, and MintModel generation. Those are
the pods with a null `controlled_by` in `admin pods list -o json`, and they carry a
`links.delete` entry. Anything else in the namespace, including the OpsChain
deployment and stateful set pods, is refused:

```text
Error: API error (422): Pod 'opschain-api-worker-1' cannot be deleted - only the pods OpsChain creates to run changes, steps, agents and MintModel or action generation can be deleted
```

Deleting a pod OpsChain is still waiting on **fails** the step or task that pod was
running. Use this to recover from a pod that is stuck, not to stop work in progress —
cancel the change (`opschain changes cancel`) or the workflow run
(`opschain workflows runs cancel`) instead.

Deleting a pod requires a superuser account. No authorisation rule grants it.

---

## 21. Sending email from a change

`opschain email send` sends mail through the global default email channel's SMTP
configuration.

This only works from inside a running change or agent. It authenticates with the API
key OpsChain issues to the runner in its step context, and rejects every other token
with a `Record not found` error — your own login token included. Set the runner's key
as `OPSCHAIN_TOKEN` (`MINTPRESS_TOKEN` for MintPress), or pass it with `--token`.

```bash
# Plain text to one recipient
opschain email send --to ops@example.com \
  --subject 'Deploy finished' --body 'All steps succeeded.'

# Several recipients, a copy, and a body read from a file
opschain email send --to ops@example.com,sre@example.com --cc team@example.com \
  --subject 'Nightly report' --body-file report.txt

# HTML, sent from a specific address, with an attachment
opschain email send --to ops@example.com --subject 'Weekly summary' \
  --body '<h1>Summary</h1><p>See attached.</p>' --content-type text/html \
  --from changes@example.com --attach report.csv

# Print just the message id, for scripting
opschain email send --to ops@example.com --subject 'Done' --body 'Finished.' -q
```

**`send` flags:**

| Flag | Required | Default | Description |
|---|---|---|---|
| `--subject` | Yes | — | Email subject |
| `--body` | * | — | Email body |
| `--body-file` | * | — | Read the body from a file instead of `--body` |
| `--to` | † | — | Recipient addresses, comma-separated and repeatable |
| `--cc` | † | — | Cc addresses, comma-separated and repeatable |
| `--bcc` | † | — | Bcc addresses, comma-separated and repeatable |
| `--from` | No | The OpsChain no-reply address | Sender address |
| `--content-type` | No | `text/plain` | `text/plain` or `text/html` |
| `--attach` | No | — | File to attach; repeatable |

\* Provide either `--body` or `--body-file`.
† Provide at least one of `--to`, `--cc`, or `--bcc`.

`--attach` reads the file, base64-encodes it, and guesses its content type from the
extension. The attachments may total 5MB decoded; the CLI rejects a larger set before
making the request.

`--from` isn't restricted — a running change or agent may send as any address its
SMTP server accepts. Whichever address is used is recorded in the `api:email:create`
event raised for the request, so you can audit it with `opschain events list --type
api:email:create`.

The command prints a confirmation line by default, the message id under `-q`, and the
full record — recipients, attachment filenames, sent time — under `-o json` / `-o
yaml`. If no global email channel is configured on the server, the send is rejected
with `Unable to send email as no default global email channel was found`.

---

## 22. Converged properties and settings

A node's properties come from several places at once — a git repository, the project, the
environment, and the node itself. The converged view shows the result of that merge: the values an
action running at the node will actually see.

Every node level has the same pair of commands:

```bash
opschain projects converged-properties myproject
opschain environments converged-properties dev -P myproject
opschain assets converged-properties myasset -P myproject -E dev
opschain agents converged-properties myagent -P myproject

opschain projects converged-settings myproject
opschain environments converged-settings dev -P myproject
opschain assets converged-settings myasset -P myproject -E dev
opschain agents converged-settings myagent -P myproject
```

`converged-props` is an alias for `converged-properties`. Identify the node by code, name, or ID,
the same as any other command. Each level merges everything above it, so an asset's converged view
includes the project's and environment's values.

### See the merged values

The default table only counts the top-level keys. Use `-o json` or `-o yaml` for the data itself:

```bash
opschain assets converged-properties myasset -P myproject -E dev -o json
```

### Find out where a value came from

`--show-sources` replaces the merged data with one row per value, naming the layer that supplied it:

```bash
$ opschain assets converged-properties myasset -P myproject -E dev --show-sources
KEY                          SOURCE
common.cert_suffix           Repository: mintpress/properties/projects/wpgcm_cloud/environments/d1/properties.json
common.trustStore            Repository: mintpress/properties/projects/wpgcm_cloud/environments/d1/properties.json
opschain.env.SSH_KEY_PATH    Project: wpgcm_cloud (wpgcm_cloud)
```

Keys are dotted paths into the property tree, sorted alphabetically. This is the fastest way to
answer "why is this value what it is" — whether a value came from a repository file or was set on
the project, and which file or level it was.

A property name containing a dot is not escaped, so `opschain.files./opt/opschain/.cinc/knife.rb.content`
reads as one path even though `knife.rb` is a single key. Use `-o json` if you need the structure
unambiguously.

`--show-sources -q` prints the keys alone, one per line, for scripting. With `-o json` or
`-o yaml`, `--show-sources` has no effect: those formats already include the full source data under
`meta`.

If the server returns no source information, the command prints `Note: the server reported no
source information for <node>` to stderr and exits 0.

### Look back in time

`--converge-date` derives the result as it would have been at that point, resolving the template
version and property versions active then:

```bash
opschain assets converged-properties myasset -P myproject -E dev \
  --converge-date 2026-04-01T00:00:00+00:00 -o yaml
```

The date is ISO 8601. An unparseable value returns `API error (400): Bad request`.

**Flags** (all eight commands):

| Flag | Default | Description |
|---|---|---|
| `--converge-date` | Current state | Derive the result as of this date/time (ISO 8601) |
| `--show-sources` | — | Show where each value came from instead of the merged data |
| `--project` / `-P` | — | Project code. Not applicable to `projects` |
| `--environment` / `-E` | — | Environment code, for an environment-scoped asset or agent. Not applicable to `projects` or `environments` |
| `--code` / `--name` / `--id` | — | Force the lookup to a code, name, or UUID |

To see the properties set *at* one level rather than the merged result, use that resource's
`properties get` / `settings get` instead.

---

## 23. Troubleshooting

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
