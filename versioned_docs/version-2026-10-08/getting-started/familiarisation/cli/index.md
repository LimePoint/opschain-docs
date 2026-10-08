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
   - [Save a whole list or log to a file](#save-a-whole-list-or-log-to-a-file)
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
   - [Manage template versions](#manage-template-versions)
   - [View the resolved template for an asset](#view-the-resolved-template-for-an-asset)
   - [Assign a template version to an asset](#assign-a-template-version-to-an-asset)
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
    - [10.9 Agent templates](#109-agent-templates)
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
    - [11.12 Notify people about a change](#1112-notify-people-about-a-change)
    - [11.13 Pause and resume a change](#1113-pause-and-resume-a-change)
12. [Workflows](#12-workflows)
    - [12.1 Managing workflows](#121-managing-workflows)
    - [12.2 Running workflows](#122-running-workflows)
    - [12.3 Approvals and paused steps](#123-approvals-and-paused-steps)
    - [12.4 Pause and resume a run](#124-pause-and-resume-a-run)
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
    - [Older servers](#older-servers)
    - [Bundle contents](#bundle-contents)
18. [Generating an AI agent skill](#18-generating-an-ai-agent-skill)
    - [Commands](#commands-5)
    - [Flags](#flags-1)
    - [Using the skill with Claude Code](#using-the-skill-with-claude-code)
19. [Secrets](#19-secrets)
    - [Commands](#commands-6)
20. [Administering the cluster](#20-administering-the-cluster)
    - [20.1 What the server is doing](#201-what-the-server-is-doing)
    - [20.2 Cluster replication health](#202-cluster-replication-health)
    - [20.3 Deployments](#203-deployments)
    - [20.4 Pods and their logs](#204-pods-and-their-logs)
    - [20.5 Deleting a stuck pod](#205-deleting-a-stuck-pod)
    - [20.6 Drain before an upgrade](#206-drain-before-an-upgrade)
    - [20.7 Licence](#207-licence)
21. [Converged properties and settings](#21-converged-properties-and-settings)
    - [See the merged values](#see-the-merged-values)
    - [Find out where a value came from](#find-out-where-a-value-came-from)
    - [Look back in time](#look-back-in-time)
    - [Preview the merge without a layer](#preview-the-merge-without-a-layer)
22. [File properties](#22-file-properties)
    - [Store a file](#store-a-file)
    - [Keep the content in the secret vault](#keep-the-content-in-the-secret-vault)
    - [Flags](#flags-2)
23. [Artefacts](#23-artefacts)
    - [Upload a file](#upload-a-file)
    - [List and inspect artefacts](#list-and-inspect-artefacts)
    - [Download a file](#download-a-file)
    - [Purged artefacts](#purged-artefacts)
    - [See what a change loaded](#see-what-a-change-loaded)
24. [Remote runner targets](#24-remote-runner-targets)
    - [Register and manage targets](#register-and-manage-targets)
    - [Owners and scopes](#owners-and-scopes)
    - [The bearer token](#the-bearer-token)
    - [Maintenance mode for a target](#maintenance-mode-for-a-target)
    - [Daemon settings](#daemon-settings)
25. [Troubleshooting](#25-troubleshooting)
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
# opschain client version: 1.0.0
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

# Manage the profiles in another config file
opschain config profiles list --config ./ci-config.yaml

# Use a non-default profile for a single command
opschain --profile staging projects list
opschain -p prod changes list
```

A profile must keep a username or a token. `config profiles update` refuses to clear the last
one (for example `--token ""` on a token-only profile) unless the same command sets the other:

```bash
opschain config profiles update staging --token "" --username alice --password s3cr3t
```

Deleting the current profile leaves no profile selected. Until you pick another with
`opschain config profiles use <name>`, commands stop with
`no profile selected - run 'opschain config profiles use <name>' or pass --profile`.
If it was your only profile, the error is instead
`no API URL configured - run 'opschain config profiles add <name>' or set OPSCHAIN_API_URL`.
`OPSCHAIN_API_URL` and the other environment variables (§3.3) still work without a profile.

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
The profile must already exist (create it with `config profiles add`); `tokens login` does not work with
environment variables alone.

```bash
# Interactive — prompts for username and password
opschain tokens login

# Non-interactive — supply credentials via flags
opschain tokens login --username alice --password s3cr3t

# Non-interactive — supply credentials via environment variables
OPSCHAIN_USERNAME=alice OPSCHAIN_PASSWORD=s3cr3t opschain tokens login

# Against a specific API URL (overrides the profile's URL)
opschain tokens login --api-url https://staging.opschain.example.com
```

After a successful login, the token is written to the active profile's `token` field. With `-q`, `tokens login` prints only the new token's ID. You can confirm which auth method is being used with `--debug` (see §25).

> **Token expiry:** Access tokens are short-lived (typically a few hours). Re-run `opschain tokens login` when a token expires — you will get a 401 response if it has.

#### `tokens logout` — revoke the current session

Revokes the active access token via the API and clears it from the active profile. If the profile has no token (you authenticate with a username and password), it prints `Not logged in with a token - nothing to revoke` and revokes nothing.

```bash
opschain tokens logout
```

#### `tokens list` — view all tokens

Lists your tokens, sorted by expiry date (furthest expiry first). A superuser sees every user's tokens; the `OWNER` column shows whose each one is.

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

If you authenticate with a username and password there is no current token. The server returns all of your access tokens instead, expired ones included, and the CLI lists them with a note on stderr.

#### `tokens delete` — revoke a token by ID

```bash
opschain tokens delete <id>
```

#### `tokens delete-all` — revoke all tokens

Revokes every token you own. Prompts for confirmation unless `--force` is passed. If you are a superuser, other users' tokens are left alone; revoke one of those by ID with `tokens delete`. The current session token is deleted last to keep authentication valid throughout. Clears the token from the active profile on success.

```bash
# Interactive confirmation
opschain tokens delete-all

# Non-interactive (CI / scripts)
opschain tokens delete-all --force
```

#### `tokens create-api-key` — create a long-lived API key

Creates an API key token for automation. The bearer token is printed once on creation — store it securely as it cannot be retrieved again.

```bash
# Uses the profile's credentials for auth
opschain tokens create-api-key --description "CI deploy token" --expiry-date 2026-12-31

# Print only the new token's ID
opschain tokens create-api-key --description "CI deploy token" --expiry-date 2026-12-31 -q
```

| Flag | Required | Description |
|---|---|---|
| `--description` | Yes | Human-readable label for the token |
| `--expiry-date` | Yes | Expiry date in `YYYY-MM-DD` format, in the future and at most one year away. The key expires at the end of that day |
| `--username` | No | Create the key for this user. Must be given with `--password` |
| `--password` | No | Password for `--username` |

The key belongs to the user the request authenticates as: by default the profile's token, or its
username and password. With `--username` and `--password` the request authenticates as that user
instead, even when the profile holds a token:

```bash
opschain tokens create-api-key --description "deploy bot" --expiry-date 2026-12-31 \
  --username deploy-bot --password s3cr3t
```

#### Credential resolution order

When making any API call the CLI checks for credentials in this order and uses the first one it finds:

1. `--token` command-line flag
2. `OPSCHAIN_TOKEN` environment variable
3. `token` field in the active profile
4. Basic auth: `OPSCHAIN_USERNAME` / `OPSCHAIN_PASSWORD` environment variables
5. Basic auth: `username` / `password` fields in the active profile

When the profile's saved token has expired and the profile also holds a username and password,
the CLI logs in again, retries the request and saves the new token to the profile. A token
passed with `--token` or `OPSCHAIN_TOKEN` is never replaced this way: if it is expired or
invalid, the command fails with `API error (401)` and the profile is left unchanged.

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

`-o yaml` and `-o json` carry the same keys, in the same order, with the same types — the
YAML is the JSON in another shape, so a field name you find in one works in the other.
Earlier releases lowercased and ran the YAML field names together (`createdby` for
`created_by`) and printed `links`, `meta` and `relationships` as lists of numbers. A script
matching on those needs updating to the API's own names.

Any other `-o` value is an error (`invalid output format "yml" (must be table, json or yaml)`). Earlier releases printed the table instead.

Commands that change something, such as `projects create`, `environments update`, `assets create`, `agents update`, `properties update`, `settings update` and `templates versions lock`, print a confirmation message by default. With `-o json` or `-o yaml` they print the created or updated resource instead, and with `-q` its ID (the code, for a resource that has one). `changes cancel` answers with no body, so with `-o json` or `-o yaml` it reads the change back and prints it as it stands once the cancel has been accepted.

### Quiet mode

`-q` / `--quiet` prints only resource identifiers (one per line) for capturing in shell scripts.

For code-based resources — projects, environments, assets, agents, workflows and templates — `-q` prints the **code**, not the server UUID. Resources with no code (authorisation policies, git remotes, changes, events, scheduled activities, tokens) print their UUID. To get the UUID of a code-based resource, use `get --uuid` (see [Get a resource's UUID](#get-a-resources-uuid) below).

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

A bare argument is matched as a code first, then by ID, then by name. A code match takes a single request. A bare name or ID first misses as a code and then lists the resource,
which costs two extra calls; forcing it with `--name` or `--id` skips the miss.

To force one interpretation, use a flag in place of the positional argument:

```bash
opschain projects get --code web-app      # a code only, no fallback
opschain projects get --name "Web App"    # a name only
opschain projects get --id 7f3e9c2a-...   # an ID only
```

- On `update`, `--name` sets the new name, so it isn't a lookup flag there. Identify the resource to update by its code (positional) or `--id`.
- Git remotes and authorisation policies have no code — refer to them by name or `--id`.
- Code and name matches are case-insensitive. If a code and some other resource's name are identical, the code wins; use `--name` to force the name.
- When nothing matches, the error is `no <resource> matches '<value>' by code, id, or name` (for remote runner targets, which have no name: `by code or ID`).

### Get a resource's UUID

`get` prints the full resource. Add `--uuid` to print just its server UUID (the JSON:API `id`) and nothing else — one line, ready to capture in a variable:

```bash
opschain projects get web-app --uuid
# 7f3e9c2a-1b4d-4c5e-8a9f-0123456789ab

opschain assets get myasset -P web-app -E dev --uuid
opschain git-remotes get github -P web-app --uuid
```

`--uuid` works on `get` for every resource you look up by code, name, or ID: projects, environments, assets, agents, workflows, git remotes, templates, agent templates, remote runner targets, and authorisation policies. It resolves the identifier the same way as a normal `get`, so you can combine it with `--code` / `--name` / `--id` (templates, agent templates and remote runner targets take `--code` / `--id` only). It overrides `-q` and `-o` — you always get the bare UUID.

This is the difference between the two: for a code-based resource, `get -q` prints the code, `get --uuid` prints the UUID.

```bash
opschain projects get web-app -q       # web-app
opschain projects get web-app --uuid   # 7f3e9c2a-1b4d-4c5e-8a9f-0123456789ab
```

### Save a whole list or log to a file

A `list` or `logs` command prints one page: the newest 15 changes, the last 50 log lines. To
get every record instead, add `--out-file`. The server streams the complete result straight
to the file — a CSV for a list, plain text for a log — so a log of several hundred megabytes
downloads without the CLI holding it in memory.

```bash
# Every asset in an environment, as CSV
opschain assets list -P web-app -E dev --out-file assets.csv

# A change's complete log, oldest line first
opschain changes logs b5bf89b6-6512-4f18-8b4d-cdac8a597231 --out-file change.log

# Give a directory and the CLI names the file for you
opschain assets list -P web-app -E dev --out-file ./reports/
# Assets written to reports/web-app_dev_assets.csv

# Stream to stdout instead, for a pipe
opschain changes list -E dev --out-file - | grep error
```

These commands take `--out-file`:

| Command | Saves |
|---|---|
| `projects list` | Every project, as CSV |
| `environments list` | Every environment in the project, as CSV |
| `assets list` | Every asset in the project or environment, as CSV |
| `agents list` | Every agent in the project, as CSV |
| `changes list` | Every change matching the filters, as CSV |
| `changes logs` | The change log |
| `changes steps logs` | One step's log |
| `agents logs` | The agent log |
| `assets generate-actions logs` | A generate-actions request's log |
| `workflows runs logs` | The workflow run log |
| `workflows runs steps logs` | One workflow step's log |
| `admin pods logs` | The pod log |

How it behaves:

- **Filters apply; paging doesn't.** The file holds every record the command's filters
  match. A log always runs oldest line first. Because the file is never a page,
  `--out-file` refuses `--limit`, `--tail`, `--since` and `--sort`:
  `--limit cannot be used with --out-file: a download always contains every matching record`.
- **Default file names.** When `--out-file` is a directory, the file is named after what you
  asked for: `projects.csv`, `<project>_<environment>_assets.csv`, `<change-id>.log`,
  `<pod>_<container>.log`, and so on.
- **No partial files.** The download goes to a hidden temporary file in the same directory
  and is renamed into place only once it has all arrived. If the connection drops, the
  command fails with `download interrupted after <n> bytes` and an existing file of the same
  name is left as it was. `Ctrl-C` removes the temporary file and exits with status 130.
- **Unknown parents are an error.** `assets list -P web-ap --out-file a.csv` fails with
  `project 'web-ap' not found` instead of writing a file with only a header row.
- **Long downloads are fine.** The configured request timeout limits how long the CLI waits
  for the server to start answering, not how long the download takes.
- The command prints a confirmation such as `Assets written to assets.csv`; `-q` turns it
  off, and it is never printed with `--out-file -`. `-o` has no effect on a download.

---

## 5. Projects

Projects are the top-level organisational unit in OpsChain. Everything else — environments, assets, workflows, git remotes — lives inside a project.

### Commands

```bash
# List all projects
opschain projects list
opschain projects list -o json

# Save every project to a CSV file (see §4 "Save a whole list or log to a file")
opschain projects list --out-file projects.csv

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

# Update from a JSON file
opschain projects properties update myproject --from-file properties.json

# List all versions (newest first)
opschain projects properties versions myproject
opschain projects properties versions myproject --limit 20
opschain projects properties versions myproject -o json --exclude-data

# Store a local file as a file property
opschain projects properties store-file myproject --file ./cert.pem --file-path certs/cert.pem
```

Every `update` creates a new version. By default the write is unconditional — it applies over whatever the current version is. Pass `--version <n>` with the version you read to turn it into a concurrency guard: the write applies only if the current version still matches `<n>`, and is rejected if someone else changed the properties in the meantime. Get the current version from `properties get` or `properties versions`. This applies to settings too.

`versions` lists newest first. `--limit` caps how many you get back; without it the server returns up to 1000. It's available on the properties and settings `versions` commands for projects, environments, agents, and assets alike.

`-o json` and `-o yaml` include each version's data, which can be large. Add `--exclude-data` to leave it out when you only need the version numbers and dates; `data` then reads `null`. The table and `-q` never show the data, so they always ask the server to skip it. `--exclude-data` works on the same eight `versions` commands as `--limit`.

`store-file` puts a whole file into the properties, to be written into the node when an action
runs. It works the same way at every node level — see [§22 File properties](#22-file-properties).

### Project settings

Settings work identically to properties but use a different API endpoint.

```bash
opschain projects settings get myproject
opschain projects settings update myproject --data '{"log_level": "info"}'
opschain projects settings versions myproject
```

Environments, assets and agents have the same commands with the same flags: `properties get`,
`update`, `versions` and `store-file`, and `settings get`, `update` and `versions`. Only the way you
name the node differs; the sections for each show it.

These show what is set *on* the project. For the merged result — repository properties plus the
project's own — use `opschain projects converged-properties myproject` or
`converged-settings`; see [§21](#21-converged-properties-and-settings).

---

## 6. Git Remotes

Git remotes define where OpsChain fetches your code from. They are scoped to a project.

OpsChain fetches each remote periodically to keep its cache warm. Set `--periodic-fetch-interval` to control how often for a single remote; without it, the remote inherits the project/global `git_remote.periodic_fetch_interval` setting. `list` and `get` show the interval in a `FETCH` column — `default` means the remote is inheriting, and `list` prints the inherited value to stderr.

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

# Create a remote fetched every 5 minutes instead of on the inherited interval
opschain git-remotes create \
  --name github \
  --url https://github.com/acme/infra.git \
  --user gituser \
  --password ghp_token \
  --periodic-fetch-interval 300

# Update credentials (name is immutable; url and public-url can be changed)
opschain git-remotes update github --password new_token
opschain git-remotes update github --ssh-key-file ~/.ssh/new_key --passphrase 's3cr3t'
opschain git-remotes update github --url git@github.com:acme/infra.git --add-known-host
opschain git-remotes update github --public-url https://github.com/acme/infra

# Change the fetch interval, then go back to the inherited default
opschain git-remotes update github --periodic-fetch-interval 900
opschain git-remotes update github --periodic-fetch-interval 0

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
| `--periodic-fetch-interval` | No | Seconds between periodic fetches of this remote, 60–86400. Omit to inherit the project/global `git_remote.periodic_fetch_interval` setting |
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
| `--periodic-fetch-interval` | Seconds between periodic fetches of this remote, 60–86400. Pass `0` to go back to inheriting the project/global setting |
| `--add-known-host` | When changing to an SSH URL, scan the new host key and register it in the global known_hosts setting (superuser only) |

> **Tip:** Use the `--id` flag on `get`, `archive`, `update`, and `delete` to reference a remote by UUID instead of its human-readable name.

The server checks that the remote is reachable only when an update changes the URL or the credentials
(`--user`, `--password`, `--ssh-key-file`, `--passphrase`). Changing only `--periodic-fetch-interval`
or `--public-url` skips the check.

---

## 7. Environments

Environments (e.g. `dev`, `staging`, `prod`) are scoped inside a project and provide isolated execution contexts for assets and changes.

### Commands

> **Note:** Commands in this section require a project code. Either pass `--project <code>` / `-P <code>` on each command, or set `default_project` in your active profile (see §3.1) to omit it entirely.

```bash
# List environments in a project
opschain environments list

# Save them all to a CSV file
opschain environments list -P myproject --out-file environments.csv

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

# Archive or unarchive
opschain environments update dev --archived=true
opschain environments update dev --archived=false

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
opschain environments settings versions staging
```

These show what is set *on* the environment. For the merged result — repository and project values
included — use `opschain environments converged-properties dev -P myproject` or
`converged-settings`; see [§21](#21-converged-properties-and-settings).

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

# Get a template by code, name, or ID (or force with --code / --id — see §4)
opschain templates get my-template-code
opschain templates get --id 7f3e9c2a-...
opschain templates get my-template-code -o json

# Create a template backed by a git remote
opschain templates create -P myproject --code app --name "Application" --git-remote github

# Rename it, repoint it, or disable it
opschain templates update app -P myproject --name "App Server"
opschain templates update app -P myproject --git-remote github-mirror
opschain templates update app -P myproject --disabled=true

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

`create`, `update`, `archive` and `unarchive` print the template with `-o json` or `-o yaml`, and its code with `-q`. `templates assign` prints the assigned version the same way. `agent-templates` behaves the same.

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
opschain templates versions create latest -P myproject --code app --git-rev main --float-git-rev
opschain templates versions update latest -P myproject --code app --git-rev main --float-git-rev=false

# Archive/unarchive a version (hidden but recoverable)
opschain templates versions archive "Application" v1.0 -P myproject
opschain templates versions unarchive "Application" v1.0 -P myproject

# Lock/unlock a version against changes to its pinned revision
opschain templates versions lock "Application" v1.0 -P myproject
opschain templates versions unlock "Application" v1.0 -P myproject

# Unlock a version that assets are using (a plain unlock refuses)
opschain templates versions unlock "Application" v1.0 -P myproject --ignore-in-use

# Delete a version (archived instead if an asset has used it)
opschain templates versions delete "Application" v1.0 -P myproject
```

#### Delete a version

`versions delete` (aliases `del`, `rm`) removes a version only if no asset has ever been assigned to it. What happens depends on the version's history:

| Version history | Result |
|---|---|
| Never assigned to an asset | Deleted: `Template version 'v1.0' deleted` |
| Assigned to an asset in the past | Archived instead, so the assignment history is kept: `Template version 'v1.0' has been assigned to an asset before, so it was archived instead of deleted`. Restore it with `versions unarchive`. |
| Assigned to an asset now | Refused with `Template version cannot be deleted as the version is currently in use`. Move the asset to another version first with `templates assign` or `assets template assign`. |

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

# Save every asset in the environment to a CSV file
opschain assets list -E dev --out-file assets.csv

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

Each node is labelled with its name, followed by its runnable code in brackets when the two
differ — for example `[Install Binaries-1]`, which MintModel templates use to tell apart sibling
steps that share a name. Pass the bracketed code, or the name when there is no bracket, as the
`changes create --action` / `changes execute --action` value to run that step.

The tree mirrors what the API returns, so a step that also exists as a top-level action appears
both places. `-o json` and `-o yaml` return the same tree with the full node detail; `--tree -q`
prints one code per line for every node, ready to pipe into a change.

### Asset properties and settings

```bash
opschain assets properties get myasset
opschain assets properties update myasset \
  --data '{"replicas": 3, "image_tag": "v2.1.0"}'
opschain assets properties versions myasset -E dev

opschain assets settings get myasset -E dev
opschain assets settings update myasset -E dev --data '{"log_level": "debug"}'
opschain assets settings versions myasset -E dev --limit 5
```

Give `-E` for an asset in an environment, and leave it out for a project-level asset.

These show what is set *on* the asset. For the values an action will actually run with — the
template, project, environment and asset layers merged — use
`opschain assets converged-properties myasset -P myproject -E dev` or `converged-settings`; see
[§21](#21-converged-properties-and-settings).

### Generate Actions

When OpsChain needs to discover what actions a template exposes, it builds the container image and queries it. This is managed via generate-actions requests.

```bash
# Trigger action generation for an asset
opschain assets generate-actions create myasset
opschain assets generate-actions create myasset -E dev

# Rebuild the asset's image without the build cache
opschain assets generate-actions create myasset --build-without-cache

# List all generation requests for an asset
opschain assets generate-actions list myasset
opschain assets generate-actions list myasset --limit 20   # newest 20 (server default: 100)

# Get status of a specific request
opschain assets generate-actions get myasset <request-id>

# View logs from a generation request
# Table columns: TIMESTAMP, CATEGORY, MESSAGE. JSON output includes
# category and logged_at (plus template_version_history_id, node_background_task_id).
opschain assets generate-actions logs <request-id>
opschain assets generate-actions logs <request-id> -o json
opschain assets generate-actions logs <request-id> --limit 100
opschain assets generate-actions logs <request-id> --out-file generate.log   # whole log

# Cancel a running generation request
opschain assets generate-actions cancel myasset <request-id>
```

Without `--limit`, `logs` returns up to 10000 lines.

`create --build-without-cache` rebuilds the asset's image from scratch instead of reusing cached layers. Use it when a cached layer holds something stale, such as a package the build downloads. `-o json` on `get` shows whether a request used it (`build_without_cache`).

### MintModels

MintModels are snapshots of an asset's computed model data at a point in time.

```bash
# List all MintModels for an asset (newest first)
opschain assets mintmodels list myasset
opschain assets mintmodels list myasset -E dev
opschain assets mintmodels list myasset --limit 5    # five most recent
opschain assets mintmodels list myasset --template-version 2023_Q4_2

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

`list --template-version <version>` returns only the MintModels generated while that version of the asset's template was assigned. If the asset has never had that version, the command fails with `Version '<version>' has never been assigned to this asset`.

The `--out-file` flag writes the MintModel's JSON payload to a file, pretty-printed, with key ordering preserved as returned by the API. The confirmation message is written to stderr and can be suppressed with `-q`.

Generation runs asynchronously. `generate` queues the work and prints the background task (its ID and status) straight away; the MintModel isn't ready yet. Add `--wait` to poll the task every 5 seconds until it finishes and then print the generated MintModel — status transitions are written to stderr. If the task ends in `error` or `cancelled`, the command reports the failure and exits non-zero. Without `--wait`, run `opschain assets mintmodels get myasset` once the task completes to fetch the result.

---

## 10. Agents

Agents are containerised execution environments that run OpsChain actions. Each agent is built from a template and can be independently started, stopped, and rebuilt.

> **Note:** All agent commands require `--project` / `-P`. Agents belong to a project, not to an environment, so the agent commands have no `-E` flag.

### 10.1 Basic CRUD

```bash
# List agents in a project
opschain agents list -P myproject

# Save them to a CSV file
opschain agents list -P myproject --out-file agents.csv

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

# See the template and version an agent is built from
opschain agents template get myagent -P myproject

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

The build task response includes a task ID. Use `--output json` to see full task details including `status_code` (`initializing`, `running`, `success`, `error`, `cancelled`).

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

# Save the whole log to a file
opschain agents logs myagent -P myproject --out-file agent.log
```

`--all` overrides `--limit` and returns the complete log history for the agent. For a long
history, `--out-file` is the better choice: it streams the log to disk, oldest line first,
instead of loading every line before printing.

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

opschain agents properties versions myagent -P myproject

opschain agents settings get myagent -P myproject
opschain agents settings update myagent -P myproject --from-file settings.json
opschain agents settings versions myagent -P myproject
```

### 10.8 Converged properties and settings

Shows the fully merged properties or settings that will apply to the agent. Properties combine
template (repository) properties, project properties, and agent-specific properties; settings
combine the global, project, and agent settings, and list only those that differ from global.

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
[§21 Converged properties and settings](#21-converged-properties-and-settings).

---

### 10.9 Agent templates

Agent templates are the agent counterpart of asset templates (§8): each defines an agent backed by
a git remote, with git-pinned versions. `agent-templates` (alias `agent-template`) takes the same
subcommands as `templates` — `list`, `get`, `create`, `update`, `archive`, `unarchive`, `assign`, and
`versions list/get/create/update/archive/unarchive/lock/unlock` — and acts only on agent-type
templates.

```bash
opschain agent-templates list -P myproject
opschain agent-templates get my-agent-template -P myproject

# Move agents onto another version of their template (rebuilds their images)
opschain agent-templates assign my-agent-template v2 -P myproject --agents myagent,otheragent
```

`assign` changes only which version of its own template each agent uses; an agent built from a
different template is refused.

## 11. Changes (Executing Actions)

### 11.1 What a change is

A **change** runs a single action against a project, environment, or asset. Changes are how OpsChain runs an automated process — deployments, configuration updates, compliance checks, data migrations, or custom scripts. Each change has a unique ID, a status code, start/end timestamps, and a log stream.

Terminal statuses: `success`, `error`, `system_error`, `cancelled`, `aborted`, `rejected`.

### 11.2 Creating changes

#### Asset scope (recommended starting point)

For assets, git information (remote, rev, template version) is derived automatically from the asset's configuration. Pass `-t/--template-version` to run against a different version of the asset's template; `--git-remote` and `--git-rev` are not accepted at asset scope, and the CLI stops before sending anything:

```text
Error: --git-remote and --git-rev are not valid for asset scope (-A/--asset); the asset's template supplies the source (use -t/--template-version to pick a version)
```

An asset can be **environment-scoped** or **project-level**. Pass `-E` for an
environment-scoped asset; omit it to target a project-level asset.

```bash
# Execute the 'deploy' action on an environment-scoped asset
opschain changes create -E dev -A myasset -a deploy

# Execute it on a project-level asset (no environment)
opschain changes create -P myproject -A myasset -a deploy

# Run against a different version of the asset's template
opschain changes create -E dev -A myasset -a deploy -t v1.1

# Wait for the change to finish
opschain changes create -E dev -A myasset -a deploy --wait-for-completion

# Wait and stream logs in real-time
opschain changes create -E dev -A myasset -a deploy -w --show-logs

# Wait and watch the step tree update in place instead of streaming logs
opschain changes create -E dev -A myasset -a deploy -w --show-steps

# Stream logs with UTC timestamps
opschain changes create -E dev -A myasset -a deploy -w --show-logs --utc

# Have the server release any wait step automatically, except approval steps (no need to wait or stay attached)
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

#### Project and environment scope

Projects and environments have no template, so you name the source yourself with
`--git-remote` and `--git-rev`. Both are required.

`--template-version` is **not** accepted here — the API only permits it on a node that
requires a template, which means assets and agents. Pass it at project or environment
scope and the CLI stops with:

```text
Error: --template-version is only valid for asset scope (-A/--asset); project and environment scope take --git-remote and --git-rev instead
```

Environment scope:

```bash
opschain changes create \
  -E dev \
  -a deploy \
  --git-remote github \
  --git-rev main
```

Project scope:

```bash
opschain changes create \
  -a deploy \
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
| `--template-version` | `-t` | No | Template version to run against. Asset scope only — not permitted at project or environment scope, or with the scheduling flags |
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
| `--notify-user-id` | | No | User to notify about the change, as a username or a user UUID (repeatable or comma-separated; see §11.12) |
| `--notify-ldap-group` | | No | LDAP group to notify about the change (repeatable or comma-separated; see §11.12) |
| `--notify-email` | | No | Email address to notify about the change (repeatable or comma-separated; see §11.12) |
| `--notify-event` | | No | Lifecycle event that triggers a notification: `cancel`, `create`, `error`, `start`, `success`. At least one is required for anything to be sent (see §11.12) |
| `--wait-for-completion` | `-w` | No | Poll every 5 seconds until terminal state |
| `--show-logs` | | No | Stream logs in real-time (requires `-w`) |
| `--show-steps` | | No | Show a tree of the change's steps that updates in place as they run (requires `-w`; cannot be combined with `--show-logs`) |
| `--auto-continue-wait-steps` | | No | Have the server release any wait step the change hits (approval steps excluded), so it runs through without pausing. Works whether or not you wait |
| `--utc` | | No | Display timestamps in UTC |
| `--from-file` | | No | Load entire request from a JSON file |

#### Watch the step tree

`--show-steps` renders the change's steps as a tree and refreshes it in place every
5 seconds while you wait, so you can see which step the change is on instead of a single
overall status. Each node shows the step's name, status, and how long it has been running:

```text
Change running  [+01:20]
└─ ✔ Provision  [success] (00:12)
   ├─ ● Deploy binaries  [running] (00:47)
   │  └─ ● Copy files  [running] (00:30)
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

# Have the server release any wait step (other than an approval step) each change hits so none of them stall
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
| `--auto-continue-wait-steps` | | No | Have the server release any wait step (other than an approval step) each created change hits, so none of them stall in the `waiting` state. Works whether or not you wait |
| `--template-version` | `-t` | No | Template version override (asset scope) |
| `--metadata` / `--property-overrides` / `--settings-overrides` | | No | JSON objects applied to every created change |
| `--skip-steps` | | No | Glob pattern matching step `full_path`s to skip (repeatable; see §11.10) |
| `--starting-step` | | No | Begin execution at this step's `full_path` on every created change; earlier steps are skipped (see §11.11) |
| `--build-without-cache` | | No | Build container without Docker cache |

- Output is a per-target summary table (`ENVIRONMENT`, `ASSET`, `RESULT`, `CHANGE ID`, `DETAIL`); `-o json`/`yaml` emit it structured; `-q` prints only the created change IDs.
- A `skipped` asset's `DETAIL` says why: `action not supported`, or `not found in project '<P>' environment '<E>'` (`not found in project '<P>'` for a project-level asset; the resolved project is named, so a wrong `-P`/`default_project` is easy to spot). An unexpected API failure (auth, server error) is a separate `error` row showing the message, not a skip.
- **Exit code:** `0` when every target either started a change or was cleanly skipped. Non-zero if any change failed to create, an asset lookup errored (non-404), or (with `-w`/`--wait-for-completion`) any change ended in a non-`success` terminal state.
- No interleaved log streaming for bulk runs — watch an individual change with `changes attach <id>`.
- `--show-steps` (with `-w`, on an interactive terminal) replaces the live status table with one section per change — a header line (`[env] asset (change-id) status`) followed by that change's step tree, all redrawing in place. Skipped and errored targets stay as one-line entries. Off a TTY, or with `-q`/`-o json,yaml`, it prints a note and falls back to the summary. See §11.2 for the glyphs.

### 11.4 Listing and filtering changes

By default, `changes list` returns the 15 most-recent changes across all scopes (or across your default project, if one is set). It shows changes only. Workflow runs are listed under `wf runs list`; pass `--include-workflow-runs` to show them here alongside changes.

Each row shows the change's `ACTION`, `STATUS`, and the node it ran against — `PROJECT`,
`ENVIRONMENT`, and `ASSET`. `ENVIRONMENT` and `ASSET` are blank when the change ran at a
level above them: a project-scope change has neither, and a change on a project-level asset
has an asset but no environment.

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

# Changes for a project-level asset (no -E)
opschain changes list --project myproject -A myasset

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

# Save every matching change to a CSV file, not just the newest 15
opschain changes list --project myproject --status error --out-file errors.csv
```

`--out-file` keeps the scope and filter flags (`-P`, `-E`, `-A`, `--status`, `--filter`,
`--include-workflow-runs`) and drops paging: the file holds every match, however many
there are. It refuses `--limit` and `--sort`. See §4 "Save a whole list or log to a file".

If the project, environment or asset you scope to doesn't exist, or you can't see it,
`changes list` names it. `changes create` (including `--schedule` and `--run-at`) does the
same, and `environments list`, `assets list` and `agents list` do it for `-P` and `-E`:

```text
Error: environment 'dve' not found in project 'myproject'
```

Older OpsChain servers don't check the scope and print `No items found` instead.

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
# Fetch the last 50 log lines for a change
opschain changes logs b5bf89b6-6512-4f18-8b4d-cdac8a597231

# Fetch the last 200 log lines
opschain changes logs b5bf89b6 --limit 200

# Fetch all log lines
opschain changes logs b5bf89b6 --limit 0

# View logs in UTC
opschain changes logs b5bf89b6 --utc

# Export logs as JSON
opschain changes logs b5bf89b6 -o json
```

A change's log contains the lines of every step in the change. To read a single step's
log, use `changes steps logs` (see below).

**Follow logs in real time** with `--tail` (`-f`). It prints the initial batch,
then streams new log lines as they arrive, stopping automatically once the change
reaches a terminal status (`success`, `error`, `system_error`, `cancelled`, `aborted` or `rejected`). Press
`Ctrl-C` to stop early.

```bash
# Follow a running change's logs
opschain changes logs b5bf89b6 --tail
```

> **Note:** `--tail` requires table output and cannot be combined with `-o json`,
> `-o yaml`, or `--quiet`.

**Save the whole log** with `--out-file`. The file holds every line, oldest first, in the
form `<timestamp> [<category>] <message>`. `--out-file` can't be combined with `--limit` or
`--tail`.

```bash
opschain changes logs b5bf89b6 --out-file change.log
```

#### Read one step's log

`changes logs` mixes every step's lines together. To read the log of
just one step — usually the one that failed — find its ID with `changes steps list`, then
pass it to `changes steps logs`:

```bash
# Every step of the change, in sequence order
opschain changes steps list b5bf89b6-6512-4f18-8b4d-cdac8a597231

# Only the failed steps' IDs
opschain changes steps list b5bf89b6 --filter status_code_eq=error -q

# The last 50 lines of one step, or all of them
opschain changes steps logs 4a1c9f2e-1b4d-4c5e-8a9f-0123456789ab
opschain changes steps logs 4a1c9f2e --limit 0

# Save the step's whole log, including its child steps
opschain changes steps logs 4a1c9f2e --include-child-steps --out-file step.log
```

`changes steps list` shows each step's ID, action, name, sequence number and status. It
returns at most 1000 steps; if a change has more, a note on stderr says so. `--limit`
narrows the list further.

`changes steps logs` takes the same `--limit`, `--utc` and `--out-file` flags as
`changes logs`, but not `--tail`. It returns only the step's own lines unless you add
`--include-child-steps`, which also includes the lines of the step's child steps.

### 11.6 Reattach to a running change

If you started a change **without** `--wait-for-completion` (for example with
`changes create ... -q` to capture the ID), you can reattach later with
`changes attach` (aliases: `watch`, `reattach`). This gives you the same
experience as `create --wait-for-completion`: it polls the change status every
5 seconds, reports each status transition, and — by default — streams log lines
in real time until the change reaches a terminal status (`success`, `error`,
`system_error`, `cancelled`, `aborted` or `rejected`). Press `Ctrl-C` to detach; this does **not** affect the
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
in a non-success terminal state (`error`, `system_error`, `cancelled`, `aborted`, `rejected`), so it is safe
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

> **Note:** `attach` streams every step's log lines. To choose how many lines to start from, use
> `changes logs --tail`; to read one step's log, use `changes steps logs` (both §11.5).

### 11.7 Cancel a change

```bash
opschain changes cancel b5bf89b6-6512-4f18-8b4d-cdac8a597231
opschain changes cancel b5bf89b6 -q   # prints ID on success
opschain changes cancel b5bf89b6 -o json   # prints the change after the cancel
```

> **Note:** Any change that hasn't finished can be cancelled — pending, queued, running or waiting.
> Cancelling a finished change returns `Change cannot be cancelled because it is already finalised`.

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
`continue`, pass `--auto-continue-wait-steps` on `create` or `execute`. This sets the flag on the change
itself, so the **server** releases each wait step (other than an approval step) as the change hits
it — you don't need `--wait-for-completion` and you don't need to stay attached. On `retry` the flag
is applied by the CLI and needs `-w` (see §11.9). A change created
without the flag sits at `waiting` until it's continued.

For a change that is **already running** and was created without the flag, `changes attach
--auto-continue-wait-steps` continues its wait steps from the client side while you're attached:
as the poll loop sees the change enter `waiting`, it continues every waiting step and keeps
polling. Each released step is logged to stderr; a step that can't be continued — for example one
that has already moved on — is logged and skipped rather than aborting the wait.

### 11.9 Retry a change

`changes retry` (alias `rerun`) re-runs a change that did not succeed. It sends a
retry request to the server, which creates a new change against the same node using
the same action and source, re-runs every step that didn't succeed (steps that succeeded
are kept, not repeated), and links the new change back to the one you retried.
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

The change being retried must have ended in `error`, `system_error`, `cancelled`, `aborted`
or `rejected`. Retrying a `success` change returns `change '<id>' succeeded; only a change that
ended in error, system_error, cancelled, aborted or rejected can be retried`. Retrying a change that is still `running`, `pending`,
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
| `--notify-user-id` | original's | User to notify, as a username or a user UUID (repeatable or comma-separated; see §11.12) |
| `--notify-ldap-group` | original's | LDAP group to notify (repeatable or comma-separated) |
| `--notify-email` | original's | Email address to notify (repeatable or comma-separated) |
| `--notify-event` | original's | Lifecycle events that trigger a notification |
| `-w, --wait-for-completion` | `false` | Wait for the new change to finish (polls every 5s) |
| `--show-logs` | `false` | Stream logs while waiting (needs `-w`) |
| `--show-steps` | `false` | Show the live step tree while waiting (needs `-w`; not with `--show-logs`) |
| `--auto-continue-wait-steps` | `false` | Continue any wait step the retry hits, client-side while polling (needs `-w`) |
| `--utc` | `false` | Show log timestamps in UTC (use with `--show-logs`) |

The `--notify-*` flags replace the original's notification subscription in full —
targets and events together. Set one and the original's other notify values are
dropped rather than merged, so pass every target and event you want. Set none and the
original's subscription carries over unchanged.

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
| `foo/bar` | that step, and so everything beneath it |
| `foo/*` or `foo/**` | every child of `foo`, and so everything beneath them; `foo` itself still runs |
| `**/mintmodel:apply_patch_*` | any step whose leaf code starts with `mintmodel:apply_patch_` |
| `**/*custwprd1otd01*` | any step whose code mentions host `custwprd1otd01` |

`**/` matches any number of levels (so `**/x` finds `x` at any depth); a `**` not followed by `/`
acts like `*`. `*` matches within a single segment; `?` matches one character. Matching is
case-insensitive. Skipping a step also skips everything beneath it, and a step that requires
approval still runs even when a pattern matches it. Always single-quote patterns so your shell doesn't expand `*`/`**`
against local filenames before the CLI sees them.

**Targeting many steps at once.** Where the steps you want to drop share a parent
or a naming pattern, one glob beats a long list of exact paths:

```bash
# Skip a whole subtree — every step under "Apply patches"
opschain changes create ... --skip-steps 'Provision/mintmodel:binaries/mintmodel:apply_patches_for_stage_post_binaries/**'

# Skip every patch step, wherever it sits in the tree
opschain changes create ... --skip-steps '**/mintmodel:apply_patch_*'

# Skip everything scoped to one host
opschain changes create ... --skip-steps '**/*custwprd1otd01*'
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

**Workflow runs match step names, not paths.** On `workflows runs create`,
`workflows runs retry` and a `scheduled_workflow`, each pattern is compared with a
workflow step's **name** (as shown by `workflows runs steps list`), either exactly or
as a glob in the same dialect. A workflow step has no `full_path`, so the path patterns
above match nothing there. Wait steps and approval steps still run even when a pattern matches them.

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

### 11.12 Notify people about a change

The `--notify-*` flags subscribe people to a change's lifecycle events, so they hear
about a failure without watching the terminal.

```bash
# Tell the ops alias when a change fails or succeeds
opschain changes create -E dev -A myasset -a deploy \
  --notify-email ops@example.com \
  --notify-event error,success

# Notify a user and an LDAP group on every lifecycle event
# (naming another user requires a superuser; anyone else passes the user's UUID)
opschain changes create -E dev -A myasset -a deploy \
  --notify-user-id jsmith --notify-ldap-group platform \
  --notify-event create,start,error,success,cancel
```

**Notify flags:**

| Flag | Description |
| --- | --- |
| `--notify-user-id` | User to notify, as a username or a user UUID (repeatable or comma-separated) |
| `--notify-ldap-group` | LDAP group to notify (repeatable or comma-separated) |
| `--notify-email` | Email address to notify (repeatable or comma-separated) |
| `--notify-event` | Lifecycle event that triggers a notification: `cancel`, `create`, `error`, `start`, `success` (repeatable or comma-separated) |

**Name at least one event.** Targets with no `--notify-event` subscribe to nothing —
no subscription is created and no notification is sent. `--notify-event error` on its
own is a reasonable starting point.

Give events but no targets and the change's creator is notified.

`--notify-user-id` takes a username or a user's UUID. The CLI looks usernames up and
sends their UUIDs, which is what the server stores. Only a superuser can look up other
users by name: for anyone else the server shows only their own account, so name
yourself or pass the other user's UUID. The CLI can't show you another user's UUID, so
ask an administrator with superuser access for it. A name the lookup can't find is an error and
nothing is created:

```text
--notify-user-id: no user named jsmth visible to you (only a superuser can look up other users by name; pass the user's UUID instead)
```

Each target flag takes a list, so `--notify-email a@example.com,b@example.com` and
`--notify-email a@example.com --notify-email b@example.com` are equivalent.

The same flags work on `changes retry` (§11.9), on `changes create` alongside the
scheduling flags, and on `scheduled-activities` create and update (§13.5), where every
change the schedule creates notifies the same people. `--from-file` ignores them, as it
ignores every other body flag.

### 11.13 Pause and resume a change

Pause a change to hold it between steps — while a dependency is down, or to wait for a
maintenance window — without cancelling it:

```bash
opschain changes pause b5bf89b6-6512-4f18-8b4d-cdac8a597231 --reason "Waiting for the DB maintenance window"
opschain changes resume b5bf89b6-6512-4f18-8b4d-cdac8a597231
```

A paused change starts no new steps. Steps already running carry on to the end, so the
change first shows as `pausing`, then `paused` once they finish. A queued change shows
`queued (pausing)`. Its status does not change
— `changes list` and `changes get` show the pause beside it, as in `running (paused)` or
`waiting_for_approval (paused)`, and `changes attach` and `changes create -w` print the same
while they wait.

`--reason` is optional and limited to 1000 characters. Each pause and resume is recorded with
who made it, when and why, under `paused_by` in `changes get -o json`.

On success the command prints `Change '<id>' paused (status: <status>)`. Use `-q` for just the
ID, or `-o json`/`-o yaml` for the updated change.

A change that finishes while paused shows, for example, `success (paused)`; `resume` clears the
pause. The server refuses to pause a change that has finished (`… cannot be paused because it is
already finalised`) or is already paused, and to resume one that isn't paused (`… is not
paused`):

```text
Error: API error (422): Change is already paused
```

---

## 12. Workflows

Workflows are reusable, versioned automation scripts written in YAML that orchestrate multi-step actions. They are project-scoped.

> **Note:** Commands that address a workflow by code need a project code. Either pass `--project <code>` / `-P <code>`, or set `default_project` in your active profile (see §3.1). Commands that take a run or step UUID do not.

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
opschain workflows versions list deploy-app

# Create a new version from an updated YAML file
opschain workflows versions create deploy-app --source-yaml-file deploy-app.yaml

# Show one version, publish a draft (or send it back to draft), delete a version
opschain workflows versions get deploy-app 2
opschain workflows versions update deploy-app 2 --publish
opschain workflows versions update deploy-app 2 --draft
opschain workflows versions delete deploy-app 2    # archived instead if it has been run

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

A version has no name or description of its own; every version shows the workflow's. On
`workflows versions create` and `workflows versions update`, `--name` and `--description`
therefore rename and re-describe the workflow. `versions create` reads them from the YAML's
`name` and `description` keys when you omit the flags, so creating a version from a YAML with a
different `name` renames the workflow. A YAML with neither key leaves them unchanged.

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

# Skip steps by name, or by a glob over the name (repeat the flag for multiple patterns)
opschain workflows runs create --code deploy-app --version 2 \
  --skip-steps 'Smoke test*'

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
opschain workflows runs logs $RUN_ID --out-file run.log   # whole log, oldest first

# Retry a failed/cancelled run
opschain workflows runs retry $RUN_ID
opschain workflows runs retry $RUN_ID --wait-for-completion --show-logs

# Retry, overriding the skip_steps of the run being retried
# (omit --skip-steps to inherit the original run's skip_steps unchanged)
opschain workflows runs retry $RUN_ID --skip-steps 'Smoke test*'

# Retry, and tell the ops alias if the new run fails
opschain workflows runs retry $RUN_ID --notify-email ops@example.com --notify-event error

# Cancel a running workflow run
opschain workflows runs cancel $RUN_ID
```

> `--skip-steps` on a workflow run matches each step's **name**, exactly or as a glob, not a
> `full_path` as for changes. See §11.10 for the glob dialect.

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
Name recipients with any mix of `--notify-user-id` (a username or a user's UUID),
`--notify-ldap-group`, and `--notify-email`; each is repeatable or comma-separated.
`--notify-event` picks which events fire a notification — one or more of `cancel`,
`create`, `error`, `start`, `success`. Name at least one event: targets with no events
subscribe to nothing (see §11.12). OpsChain rejects an unknown event, a user it cannot find, or a
malformed email address. Omit every `--notify-*` flag and no notifications are configured.

`workflows runs retry` inherits the retried run's subscription. Set any `--notify-*` flag on
the retry to replace it, targets and events together.

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
opschain workflows runs steps list --filter status_code_eq=waiting_for_approval

# Just the step IDs
opschain workflows runs steps list $RUN_ID -q

# Narrow the page (the server returns at most 1000 steps)
opschain workflows runs steps list --filter status_code_eq=waiting_for_approval --limit 50

# Inspect one step and read its logs
opschain workflows runs steps get $STEP_ID
opschain workflows runs steps logs $STEP_ID --utc
opschain workflows runs steps logs $STEP_ID --out-file step.log

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
`Stop all assets in parallel  [change/running]  → d1/obpcid (Shutdown)`, after the step's status glyph. This matters for a
multi-target change, where every fanned-out step shares the same name — the target is what tells
them apart. The target is shown as `environment/asset` (or just the asset for a project-level
one), so the same asset run across several environments stays distinguishable (`d1/obpcid` vs
`d2/obpcid`). If a workflow spans more than one project (a step that runs a child workflow in
another project), the project is added too — `projA/d1/obpcid` — so cross-project targets don't
collide either; single-project runs leave it off to stay uncluttered. Targets come from the run's
step tree, so they appear when you scope to a single run; a cross-run `list` (no run id) shows the
action alone. Drop the run ID to list steps across every run — pair it with `--filter` to
sweep for work, e.g. `--filter status_code_eq=waiting_for_approval` for everything currently
awaiting a person. Filter on `waiting_for_approval` even for plain wait steps: the server's filter
files every paused step under it, though `list` shows a wait step's status as `waiting`.
`--filter` takes ransack predicates (`field_predicate=value`) and repeats.

The server returns at most 1000 steps per request. When it truncates the page it prints
`Note: more workflow steps matched than were returned - showing 1000.` on stderr, so a partial
list never reads as the whole set. `--limit` can only narrow that ceiling, not raise it — use it
with `--filter` to keep a cross-run sweep small.

### 12.4 Pause and resume a run

```bash
opschain workflows runs pause $RUN_ID --reason "Waiting for the DB maintenance window"
opschain workflows runs resume $RUN_ID
```

A paused run starts no new steps; steps already running finish first. As with a change
(§11.13), the run keeps its status and the tables show the pause beside it — `running (paused)`.
`--reason` is optional, up to 1000 characters, and every pause and resume is recorded under
`paused_by`.

Pausing a run does not pause a change it has already started. Pause that change separately with
`changes pause` if it needs to stop too.

---

## 13. Scheduling

OpsChain supports two ways to schedule automated actions.

> **Note:** `create` needs a project code. Either pass `--project <code>` / `-P <code>`, or set `default_project` in your active profile (see §3.1). `list` uses the project as a scope when one is set; `get`, `update` and `delete` take only the activity ID.

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
  --git-remote github --git-rev main \
  --schedule "0 3 * * *" --repeat --new-commits-only

# Schedule with max run count and end date
opschain changes create \
  -E dev -A myasset -a deploy \
  --schedule "0 2 * * *" --repeat \
  --max-runs 30 \
  --end-at "2025-12-31 00:00:00"

# Only run when a new commit touches src/, ignoring docs/
opschain changes create \
  -E dev -a deploy \
  --git-remote github --git-rev main \
  --schedule "0 3 * * *" --repeat --new-commits-only \
  --commit-file-pattern "src/**" \
  --commit-file-pattern-exclude "docs/**"
```

`--template-version` and `--starting-step` are rejected with the scheduling flags — a
scheduled activity holds neither. An asset-scoped schedule runs the asset's template
version as it stands at each run.

The commit file pattern flags (§13.5) work here too, and behave the same way: they need
`--new-commits-only`, repeat rather than take a comma-separated list, and default to
running when **any** pattern matches. Without a scheduling flag they are rejected with
`commit file patterns require --schedule or --run-at`, rather than being ignored on a
change that has no commits to compare.

The `--notify-*` flags (§11.12) do work here. They are stored on the schedule, so every
change it creates notifies the same people.

### 13.5 Scheduled Activities management

Use `opschain scheduled-activities` (alias: `scheduled-activity`) for full CRUD control.

```bash
# List scheduled activities
opschain scheduled-activities list
opschain scheduled-activities list --project myproject
opschain scheduled-activities list --project myproject -E dev
opschain scheduled-activities list --project myproject -E dev -A myasset
opschain scheduled-activities list --project myproject -A myasset      # project-level asset
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

# The same on a project-level asset (no -E)
opschain scheduled-activities create \
  --type scheduled_change \
  -A myasset \
  -a deploy \
  --schedule "0 2 * * *"

# Create a scheduled workflow pinned to version 3
opschain scheduled-activities create \
  --type scheduled_workflow \
  --workflow backup \
  --version 3 \
  --schedule "0 0 * * 0" \
  --repeat

# Create one that always runs the workflow's latest published version
opschain scheduled-activities create \
  --type scheduled_workflow \
  --workflow backup \
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

# Notify the ops alias whenever a scheduled run fails
opschain scheduled-activities create \
  --type scheduled_change \
  -E dev -A myasset -a deploy \
  --schedule "0 2 * * *" \
  --notify-email ops@example.com \
  --notify-event error

# Only run when a new commit touches the application code
opschain scheduled-activities create \
  --type scheduled_change \
  -E dev -A myasset -a deploy \
  --schedule "0 2 * * *" \
  --new-commits-only \
  --commit-file-pattern 'app/**' \
  --commit-file-pattern 'config/**' \
  --commit-file-pattern-exclude 'app/docs/**'

# Update a scheduled activity
opschain scheduled-activities update <id> --notify-email ops@example.com --notify-event error,success
opschain scheduled-activities update <id> --schedule "0 3 * * *"
opschain scheduled-activities update <id> --enabled=false    # disable

# Create an activity that starts out disabled
opschain scheduled-activities create \
  --type scheduled_change \
  -E dev -A myasset -a deploy \
  --schedule "0 2 * * *" \
  --enabled=false
opschain scheduled-activities update <id> --git-rev develop
opschain scheduled-activities update <id> --skip-steps 'steps/to/skip/**'
opschain scheduled-activities update <id> --auto-continue-wait-steps
opschain scheduled-activities update <id> --settings-overrides '{"dockerfile": "Dockerfile_custom"}'
opschain scheduled-activities update <id> --commit-file-pattern 'app/**'

# Move a scheduled workflow onto another version, or back to floating
opschain scheduled-activities update <id> --version 4
opschain scheduled-activities update <id> --version 0

# Delete a scheduled activity
opschain scheduled-activities delete <id>
```

`-P`, `-E` and `-A` select the node on both `create` and `list`. `-A` with `-E` is the
asset in that environment; `-A` without `-E` is the project-level asset. `list -P` includes
everything beneath the project, and `list -P -E` everything beneath the environment.
Earlier releases refused `-A` without `-E`, and `list -A` matched every asset with that
code in any project or environment.

The `list` table shows the project, environment and asset each activity runs against.
`ENVIRONMENT` is blank for a project-level asset or the project itself, and `ASSET` is
blank for an activity on an environment or project.

> For `--skip-steps` pattern syntax and how to find a step's `full_path`, see §11.10. On a
> `scheduled_workflow` the patterns match step names instead, as on a workflow run.
> On `update`, passing `--skip-steps` replaces the stored patterns with the ones you
> give; omit it to leave them unchanged.
>
> `update` also takes `--property-overrides`, `--settings-overrides`, and
> `--metadata` (each a JSON object), the same as `create`. Passing one replaces the
> stored value; omit it to leave it unchanged.
>
> The `--notify-*` flags (§11.12) work on both `create` and `update`, for scheduled
> changes and scheduled workflows alike. On `update`, any one of them replaces the whole
> stored subscription — targets and events — and omitting them all leaves it untouched.
> There is currently no flag that clears a subscription: set the one you want, or
> recreate the activity without it.
>
> **Commit file patterns** hold a scheduled change back unless a new commit touches a
> path you care about. They need `--new-commits-only`: without it, `create` stops with
> `commit file patterns require --new-commits-only`, and the server rejects an `update`. Give `--commit-file-pattern` a glob to match, `--commit-file-pattern-exclude`
> a glob whose matches do not trigger a run, and repeat either flag for more patterns —
> they are not comma-separated. By default a run starts when **any** pattern matches;
> `--commit-file-pattern-match all` requires all of them. On `update`, passing either
> pattern flag replaces the whole stored list.
>
> The limits are 20 patterns, 500 characters per pattern, and 1000 characters in total.
> The patterns apply to scheduled changes only — a `scheduled_workflow` has no git
> revision to compare. On `create` the CLI rejects the combination before sending it; on
> `update` it cannot tell the activity's type without fetching it, so the server rejects it.
>
> `--enabled=false` on `create` takes two requests: the activity is created, then
> disabled. OpsChain only accepts `enabled` on an update, so there is no way to create
> a disabled activity in one call. If the second request fails, the command reports the
> activity's ID and tells you it is still enabled — disable it with
> `scheduled-activities update <id> --enabled=false`, or delete it.
>
> **`--version` applies to scheduled workflows only.** On `create` it pins the schedule to
> one workflow version; omit it and every run takes whatever the workflow's latest published
> version is at the time, so publishing a new version changes what the schedule runs. On
> `update`, `--version 4` moves the schedule onto version 4 and `--version 0` drops the pin
> and goes back to following the latest published version. `update` cannot tell the
> activity's type without fetching it, so passing `--version` for a scheduled change is
> rejected by the server with `API error (400): Unpermitted parameters`. On `create` the CLI
> knows the type, and stops with `--version is only valid for a scheduled_workflow`.
>
> A schedule following the latest version shows `latest` as its version in `get -o json`.
>
> **`--git-remote` and `--git-rev` are refused for an asset (`-A`).** The asset's template
> supplies the source, so `create` stops with `--git-remote and --git-rev are not valid for an
> asset (-A); the asset's template supplies the source`.
>
> **You cannot move a scheduled activity to another node.** `update` ignores
> `-P`, `-E` and `-A` (it accepts them but they have no effect), and the API rejects the node attributes outright.
> Create a new activity against the node you want and delete the old one.

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
  -r github -v main \
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

Look policies up by name or UUID — a bare argument is matched as an ID, then a name — or force one with `--name` / `--id`. Policies have no code. `update` takes the policy's name or ID as its argument, or `--id`; `--name` is not a lookup flag there.

The table shows each policy's ID, name, whether it is a `SYSTEM` policy (one OpsChain manages itself, such as the superuser policy) and who created it. `create` and `update` print the policy with `-o json` or `-o yaml`, and its ID with `-q`.

```bash
# List all policies
opschain authorisation-policies list
opschain auth-policies list   # alias

# Get a policy by name or ID
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
**Read-only fields** (do NOT send): `created_by`

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
opschain authorisation-policies rules update <rule-id> \
  --executable=true

opschain authorisation-policies rules update <rule-id> \
  --deletable=true

opschain authorisation-policies rules update <rule-id> \
  --name "Project viewers"

# Delete a rule (dissociates from the policy; the standalone rule remains)
opschain authorisation-policies rules delete "Read-Only Users" <rule-id>
```

The ID that `rules list` shows is the rule's own ID, and `get`, `update` and `delete` take that ID. `update` takes only the rule ID, because a rule is updated on its own and the change applies in every policy that uses it. `delete` also accepts the ID of the link between the policy and the rule.

`rules create` and `rules update` print the rule with `-o json` or `-o yaml`, and its ID with `-q`.

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

`set`, `add` and `remove` print the policy's resulting assignments with `-o json` or `-o yaml`, and their IDs with `-q`.

`set` and `add` also take the list as JSON, with `--data` inline or `--from-file`: either a bare array, `[{"username":"alice"},{"groupname":"qa"}]`, or the same array wrapped as `{"assignments":[...]}`. Removing the last assignment leaves the policy with none.

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
  --readable --updatable --executable --deletable \
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
opschain events list --type "api:changes:success"
opschain events list -t "api:workflow_runs:start"

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

# Events for a project-level asset (no -E)
opschain events list -P myproject -A my_asset
```

Notes:

- `--environment` and `--asset` both require `--project` (via the flag, the `OPSCHAIN_DEFAULT_PROJECT` env var, or a profile `default_project`).
- `-A` without `-E` selects the project-level asset with that code, the same way `changes create` reads the flags. For an asset inside an environment, give `-E` as well. Earlier releases treated `-A` alone as "this asset in any environment", but matched any asset whose code started with the value, in any project. `changes list` had the same fault.
- These flags translate to `event_node_path` filters for you, so you don't have to remember the `_eq` vs `_start` distinction (using `_eq` on an environment would silently drop its assets' events — scoping handles this correctly).
- Scoping flags compose with the convenience filters and `--filter` (all AND-ed together), e.g. `opschain events list -P myproject -E dev --type "api:changes:success"`.
- A default project (`OPSCHAIN_DEFAULT_PROJECT` or a profile `default_project`) scopes `events list` as if you had passed `-P`, so events with no node, such as custom events, drop out. Unset it to see every event.
- Event types have three colon-separated parts, `<source>:<model>:<event>` — for example `api:changes:success` or `api:workflow_runs:start`.
- The listing table includes a `NODE PATH` column showing each event's `event_node_path`.

For hand-rolled `event_node_path` filters, see the `--filter` section below.

### 15.4 Advanced filtering with `--filter`

The `--filter` flag maps directly to OpsChain's Ransack-style filter parameters. The format is `field_predicate=value`.

**Predicates:**

| Predicate | Meaning | Example |
|---|---|---|
| `_eq` | Exact match | `type_eq=api:changes:success` |
| `_cont` | Contains (case-insensitive) | `type_cont=changes` |
| `_start` | Starts with | `type_start=api:changes:` |
| `_end` | Ends with | `type_end=:error` |
| `_gt` | Greater than | `created_at_gt=2026-01-01T00:00:00Z` |
| `_lt` | Less than | `created_at_lt=2026-04-30T00:00:00Z` |
| `_gteq` | Greater than or equal | `created_at_gteq=2026-04-01T00:00:00Z` |
| `_lteq` | Less than or equal | `created_at_lteq=2026-04-30T23:59:59Z` |

**Filterable fields:** `type`, `username`, `system`, `event_node_path`, `created_at`

**Examples:**

```bash
# All failed change events
opschain events list --filter "type_eq=api:changes:error"

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
  --filter "type_eq=api:changes:error" \
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

`events get` and `events list` show these keys with `--output json` or `--output yaml`, beside `type`, `username` and the other standard attributes. The table shows only the standard columns. A custom event has no node, so its `event_node_path` is `null` and the `NODE PATH` column shows `-`.

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
# Create a profile for this run, then swap its credentials for a bearer token
opschain config profiles add ci --api-url "$OPSCHAIN_API_URL" \
  --username ${{ secrets.OPSCHAIN_USERNAME }} \
  --password ${{ secrets.OPSCHAIN_PASSWORD }}
opschain --profile ci tokens login

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

The `--wait-for-completion` flag returns a non-zero exit code when the change ends in any status other than `success`, making it CI-friendly.

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

# Wait for a change by ID (attach exits non-zero on failure), then check its final status
CHANGE_ID="b5bf89b6-6512-4f18-8b4d-cdac8a597231"
opschain changes attach "$CHANGE_ID" -q >/dev/null || true
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
Store `OPSCHAIN_API_URL`, `OPSCHAIN_TOKEN` and `OPSCHAIN_PROJECT` as **Secret Text** credentials in Jenkins (**Manage Jenkins → Credentials**) and inject them via the `credentials()` helper as shown above — never hard-code them in the `Jenkinsfile`.
:::

:::tip
`--wait-for-completion -q` suppresses the progress and log output and prints only the change ID to stdout once the change finishes, so a script can capture it (the exit code still reflects the outcome):

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
The OpsChain server builds the bundle, using your permissions, and the CLI saves it. It is the same
bundle the GUI's **Download support bundle** button produces.

```bash
# Write <binary>-support-<change-id>.zip in the current directory
opschain support bundle 3a646e8e-ce5c-499a-8488-2d0377c6a980

# Choose the output path
opschain support bundle <change-id> --out-file ./ticket-1234.zip

# Only the human-readable summary, printed to stdout (paste into a ticket)
opschain support bundle <change-id> --summary-only

# Collect everything: full logs for all steps
opschain support bundle <change-id> --log-limit 0 --step-logs all

# Show summary timestamps in UTC (default is the local system timezone)
opschain support bundle <change-id> --utc
```

### What it collects

Collection is **best-effort**: if the server can't fetch a piece (for example, one you lack
permission to read) it is noted in `manifest.json` and `SUMMARY.md` rather than failing the command.
Only the change itself is required: if you can't read it, the command fails with
`change '<id>' not found`.
Each piece is collected with your own access, so the bundle holds only what you are permitted to see.

- **Change** — status, action, git remote/rev/commit, who ran it, timestamps, and its metadata
  (comments + any custom metadata, surfaced in `SUMMARY.md`; also present verbatim in `change.json`).
- **Steps** — the step tree with per-step status.
- **Logs** — the change log (`logs/change.log`), which holds every step's lines, plus per-step logs
  under `logs/steps/`. By
  default only the genuinely failed step(s) (status `error` or `system_error`) are captured — not the
  `aborted`/`cancelled` steps that were merely stopped downstream of the failure. Use
  `--step-logs all` for every step or `--step-logs none` to skip per-step logs. Each line reads
  `<timestamp> [<category>] <message>` with the timestamp in UTC — the same format as a log saved
  with `changes logs --out-file`.
- **Properties & settings** — the *effective* (converged) properties the change ran with; the
  *initial* and *final* converged change properties (as captured pre-run and post-run); the
  change's `override` properties/settings; and the properties and settings of every node the
  change ran under (`project`, then `environment` and `asset` where the change has them).
- **Template** — the template and template version the change ran against (`template/`), including
  the git remote/rev/commit that pins the source.
- **MintModel** (mintmodel changes only) — the rendered MintModel JSON (`mintmodel/mintmodel.json`)
  and the asset's *current* source ERB (`mintmodel/mintmodel.json.erb`), which may have changed
  since the change ran.
- **Server info** — OpsChain version, API version, DB version, runner image, licence.
- **Client** — the client that requested the bundle (`opschain-cli`, `mintpress-cli` or `opschain-gui`), its version, commit and build date.
- **Recent run history** — the last 5 runs of this change's action at the same node (id, status,
  date), plus the most recent successful run — so support can see the trend and when it last
  worked. Shown in `SUMMARY.md`.
- **Change events** — every event the change and its steps raised (`events/change.json`),
  summarised in `SUMMARY.md` under **Change events**. Up to 1000, newest first; if the change
  raised more than that, the summary says so.
- **Events by node** — the last 10 events at **each node level** the change involves (asset,
  environment, project), collected separately per level (`events/<level>.json`) and summarised
  under **Recent events by node**. This is context rather than the change's own history: it shows
  what else was happening at each scope around the failure.

### Credentials

The server builds the bundle from the same API responses you would get yourself, so OpsChain's
server-side redaction applies: sensitive values in logs and settings are redacted, and
credentials are encrypted at rest (AES) and are not decryptable by support. The collected
artifacts are safe to attach to a ticket.

### Flags

| Flag | Default | Description |
|---|---|---|
| `--out-file` | `<binary>-support-<change-id>.zip` | Output path. A `.md` file when combined with `--summary-only`. |
| `--summary-only` | `false` | Emit only the Markdown summary (to `--out-file`, or stdout if unset); no archive. |
| `--log-limit` | `2000` | Maximum log lines to collect **per log file** (`logs/change.log` and each step log). `0` collects every line; when capped, the newest lines are kept. A negative value is an error. |
| `--step-logs` | `failed` | Which per-step logs to collect under `logs/steps/`: `failed` (only `error` and `system_error` steps — the actual failures, not downstream `aborted`/`cancelled` steps), `all` (every step), or `none` (skip). |
| `--utc` | `false` | Render `SUMMARY.md` timestamps in UTC. By default they use the local time zone of the machine running the CLI, taken from `TZ` or `/etc/localtime`; when the CLI can't name the zone (on Windows, when `TZ` holds a POSIX rule such as `AEST-10AEDT`, or when `/etc/localtime` is a copy rather than a link) the summary uses UTC. Log files always use UTC. |

Generating a bundle for a large change can take a while. The command prints
`Generating bundle on server…` to **stderr** when it starts, and reports the elapsed time when it
finishes (`Support bundle written to <file> (took 4.3s)`, or `Done in 4.3s` when the summary goes to
stdout). If any piece could not be collected or was skipped, a further stderr line says how many and
points at `manifest.json` / `SUMMARY.md`. stdout stays clean for `--summary-only`. With `-q`/`--quiet`
all of these lines are suppressed and the command prints only the written file's path (useful for scripting); with
`--summary-only` and no `--out-file` it prints only the summary.

If the server takes longer than the gateway in front of it allows, the command fails with
`the server took too long to generate the bundle (504 from the gateway); try again with
--step-logs none or a lower --log-limit`. Collect less — `--step-logs none`, or a lower (non-zero)
`--log-limit` — and try again.

### Older servers

`support bundle` needs an OpsChain server that provides the support bundle endpoint. Against an
older server it fails with:

```text
Error: failed to collect support bundle: this command needs a newer OpsChain server that provides the support bundle endpoint; to collect a bundle from an older server, use an older opschain CLI release
```

Keep an older CLI release for collecting bundles from older servers.

### Bundle contents

The archive contains a single top-level folder, `<product>-support-<change-id>/`, where
`<product>` is `opschain` or `mintpress` as the server names itself, so unzipping creates one
directory rather than scattering files into the current directory. The folder name does not
change when you choose a different file name with `--out-file`.

```text
<binary>-support-<change-id>.zip
└── <product>-support-<change-id>/
    ├── SUMMARY.md            # human-readable, ticket-ready
    ├── change.json
    ├── steps.json
    ├── logs/
    │   ├── change.log        # the whole change's log, every step included
    │   └── steps/            # per-step logs, e.g. 2-run-error.log (failed step(s) by default)
    ├── info.json
    ├── events/              # change.json (the change's own events), plus asset.json, environment.json, project.json (last 10 each)
    ├── properties/          # effective.json, initial.json, final.json, override.json, project.json, environment.json, asset.json
    ├── settings/            # override.json, project.json, environment.json, asset.json
    ├── template/            # template.json, template_version.json
    ├── mintmodel/           # mintmodel.json + mintmodel.json.erb (mintmodel changes only)
    └── manifest.json        # what was/wasn't collected, client and server versions, timestamp
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

If the server can't complete the request (for example, `resolve` is given an `--expected-value` that doesn't match what is stored), the command prints the server's message as an error and exits with status 1. With `-q`, that message never goes to stdout, so a script capturing the value gets nothing rather than the error text.

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
runs on. Access is granted by authorisation rules on the `/admin` paths (a superuser has it
already); the sections below name the extra permissions some commands need, and deleting a pod
needs a superuser.

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

### 20.2 Cluster replication health

A multi-cluster install runs one primary that consumes work and one or more replicas
streaming from it. `opschain admin clusters` shows where each one stands:

```bash
opschain admin clusters
opschain admin clusters -o json    # adds API start time, cordon details, work counts
opschain admin clusters -q         # cluster names only
```

```text
NAME        ROLE       REPLICATION   LAG    CONSUMING WORK   CORDONED   IN PROGRESS   LAST WORKER SEEN
melbourne   primary    primary       -      yes              no         2 changes     2026-09-09 11:42:03
sydney      replica    streaming     0.4s   no               no         -             2026-09-09 11:41:58
perth       replica    lagging       94s    no               no         -             2026-09-09 11:30:12
```

REPLICATION is one of `primary`, `streaming`, `lagging`, `disconnected` or `lost`. LAG is
the replay lag behind the primary, and is `-` on the primary itself.

The list includes replicas the server has discovered but never registered. Those show `-`
for role, lag and last worker seen — the server knows they exist but has not heard from
them.

#### Take a site out of service

Cordon a site to stop it taking new work — before stopping it for maintenance, or for a
disaster-recovery test:

```bash
opschain admin clusters cordon sydney --reason "DR test"
opschain admin clusters                     # watch IN PROGRESS fall to "-"
opschain admin clusters uncordon sydney
```

A cordoned site's workers stop claiming changes, workflow runs and background tasks; work
already running there carries on to the end. `admin clusters` shows `yes` under CORDONED, and
IN PROGRESS counts what the site is still running — for example `2 changes, 1 task` — or `-`
once it is idle. Stop the site once IN PROGRESS shows `-`.

`--reason` is shown with the cluster in `-o json` and recorded in the cordon event. Cordoning an
already-cordoned site replaces the reason — without `--reason`, it clears it — and uncordoning
clears it too.

The server will not cordon the last site taking work:

```text
Error: API error (422): Site 'sydney' cannot be cordoned because no other site is taking work. A site takes work when it is not cordoned and its workers have reported in the last 5 minutes. Other sites: perth (cordoned).
```

### 20.3 Deployments

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

### 20.4 Pods and their logs

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
| `--out-file` | — | Write the entire pod log to this file as plain text (`-` for stdout; a directory gets `<pod>.log`, or `<pod>_<container>.log` with `--container`). Can't be combined with `--limit` or `--since` |
| `--utc` | Local timezone | Display timestamps in UTC |

Reading pod logs needs the `readable` permission on the `/admin/pods/logs`
authorisation path.

Two limits apply to what Kubernetes will give you. Pod logs only exist while the pod
does, so use `opschain changes logs` to review a change that has already finished.
And at most 100MB of a pod's log is read per request — output beyond that isn't
returned.

### 20.5 Deleting a stuck pod

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

### 20.6 Drain before an upgrade

Maintenance mode — the global `maintenance_mode` setting, `enabled` or `superuser_override` —
stops new work from starting while work already running finishes. It does not stop anyone
creating a change or workflow run: a new one is accepted and held until maintenance mode is
turned off. `admin drain-status` (alias
`drain`) tells you when it has:

```bash
opschain info get                   # MAINTENANCE MODE: off, on, or on (superusers exempt)
opschain admin drain-status
opschain admin drain-status --wait  # returns once everything has finished
opschain admin drain-status -q      # true or false
```

```text
DRAINED   CHANGES   WORKFLOW RUNS   BACKGROUND TASKS
no        2         1               0
```

DRAINED turns to `yes` when all three counts reach zero; it is then safe to stop the server.
`--wait` polls every 5 seconds and prints the remaining counts to stderr each time they change.

With `on (superusers exempt)`, superusers can still start work while maintenance mode is on, so
a drain can be undone by one of them starting a change.

### 20.7 Licence

`licence` (alias `license`) shows and replaces the system licence.

```bash
# Issuer, version, customer identifier and validity period
opschain licence get

# Install a new licence file, for example on renewal
opschain licence upload --file ./opschain.licence
```

`get` fails if the server reports no licence. `upload` replaces the current licence and prints the
new one; use `-o json` or `-o yaml` for the full record.

---

## 21. Converged properties and settings

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

`converged-settings` returns only the settings whose value differs from the global settings. A
setting left at its global default does not appear, even when a level sets it explicitly to that
same value, so a node with no overrides shows an empty result.

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

`--converge-date` derives the properties as they would have been at that point, resolving the
template version and property versions active then:

```bash
opschain assets converged-properties myasset -P myproject -E dev \
  --converge-date 2026-04-01T00:00:00+00:00 -o yaml
```

The date is ISO 8601. An unparseable value fails with a 400 that names it:
`Unable to converge properties for asset "myasset", the converge_date query parameter "<value>" could not be parsed`. The flag is on
`converged-properties` only: settings have no dated history, so `converged-settings` always shows
the current values.

### Preview the merge without a layer

`converged-properties` merges a fixed set of layers: the repository's common files, then each
node level, the template and the template version, and finally the change. Each layer has a
repository half (the files in git) and a database half (the values set through OpsChain).
`--show-layers` lists the layers that apply to the node, with `-` where a layer has no half of that kind:

```bash
$ opschain assets converged-properties myasset -P myproject --show-layers
LAYER             NAME              REPOSITORY  DATABASE
project           Project           -           included
template          Template          -           included
template_version  Template version  -           included
asset             Asset             -           included
```

`--exclude-layer` leaves a layer out, so you can see what an action would get without it. Add
`_repository` or `_database` to drop only that half, and repeat the flag for more than one:

```bash
opschain assets converged-properties myasset -P myproject -E dev \
  --exclude-layer template --exclude-layer asset_database -o json
```

The layer names are `repo_common`, `project`, `environment`, `asset`, `agent`, `template`,
`template_version` and `change`. Nothing is saved — the next action still sees every layer.
An unknown name fails with a 400 that lists the valid ones.

Both flags are on `converged-properties` only; settings have no layers. `--show-layers` and
`--show-sources` cannot be combined.

**Flags** (all eight commands):

| Flag | Default | Description |
|---|---|---|
| `--converge-date` | Current state | `converged-properties` only. Derive the result as of this date/time (ISO 8601) |
| `--show-sources` | — | Show where each value came from instead of the merged data |
| `--show-layers` | — | `converged-properties` only. List the layers that fed the merge and whether each was included |
| `--exclude-layer` | — | `converged-properties` only. Leave a layer out of the merge, as a preview (repeatable) |
| `--project` / `-P` | — | Project code. Not applicable to `projects` |
| `--environment` / `-E` | — | Environment code, for an environment-scoped asset. Assets only |
| `--code` / `--name` / `--id` | — | Force the lookup to a code, name, or UUID |

To see the properties set *at* one level rather than the merged result, use that resource's
`properties get` / `settings get` instead.

---

## 22. File properties

A file property is a whole file held in a node's properties. When an action runs, OpsChain writes
it into the runner under `/opt/opschain` at the path you chose — which is how a change gets hold of
a certificate, an SSH key, or a config file it needs on disk.

`store-file` is available on projects, environments, agents, and assets. `upload-file` is an alias
for it.

### Store a file

```bash
opschain projects properties store-file myproject --file ./cert.pem --file-path certs/cert.pem
opschain environments properties store-file dev -P myproject --file ./cert.pem --file-path certs/cert.pem
opschain assets properties store-file myasset -P myproject -E dev --file ./ca.pem --file-path certs/ca.pem
opschain agents properties store-file myagent -P myproject --file ./config.yaml --file-path config.yaml
```

`--file` is the local file to read. `--file-path` is where it lands, and must include the
filename — `certs/cert.pem`, not `certs/`. The runner resolves a relative path against its working
directory, `/opt/opschain`, so `certs/cert.pem` is written to `/opt/opschain/certs/cert.pem`. An
absolute path is written where it says provided the runner's user can write there. The runner runs
as a non-root user, so an absolute path under a root-owned location such as `/etc` uploads fine and
then fails the action with a permission error — `Failed to write "/etc/ssl/ca.pem" due to: Permission
denied @ rb_sysopen - /etc/ssl/ca.pem` when the directory exists, or a bare `Errno::EACCES` when the runner cannot create it. The runner
rewrites every file property at the start of every action, so that failure repeats on every change
at the node until you remove the file property. Prefer a relative path.

A path can only hold one file. Storing over an existing one fails with `"certs/cert.pem" already
exists in the project's OpsChain file properties` unless you pass `--replace-file`.

```bash
# Overwrite, and restrict the mode
opschain projects properties store-file myproject --file ./cert.pem \
  --file-path certs/cert.pem --mode 0600 --replace-file
```

`--mode` takes a 3- or 4-digit octal mode up to `0777`. Setuid, setgid, and sticky bits are
rejected.

Content is stored as-is unless you say otherwise. Binary files need `--format base64` — without it
the server returns `File format must be specified as base64 when storing binary files`. `--format
json` validates the content parses before storing it.

```bash
opschain projects properties store-file myproject --file ./keystore.jks \
  --file-path certs/keystore.jks --format base64
```

Each call creates a new properties version, so `properties versions` shows the history and
`properties get` shows the file alongside the rest of the data, under `opschain.files`.

### Keep the content in the secret vault

Pass `--secret-path` and `--secret-key` together to write the content into the node's secret vault
instead of storing it in the properties. The file property then holds a reference to the vault
entry rather than the content itself.

```bash
opschain projects properties store-file myproject --file ./id_rsa \
  --file-path .ssh/id_rsa --mode 0600 \
  --secret-path path/to/vault --secret-key id_rsa
```

`--secret-path` is a bare path. Unlike [`secrets store --vault-path`](#19-secrets), it takes no
`secret-vault://` scheme — the server adds one when it builds the reference it writes into the file
property, so a scheme here is stored twice and cannot be resolved at converge time.

Supplying one without the other is rejected before the request is sent. Overwriting an existing
vault value needs `--replace-secret`, which is separate from `--replace-file` — one covers the
vault entry, the other the file property. Writing a secret needs `updatable` permission on the
node's secret path; without it the command fails with `You do not have permission to create
secrets`.

To store a file in the vault on its own, with no file property, use
[`secrets store-file`](#19-secrets) instead.

### Flags

| Flag | Required | Default | Description |
| --- | --- | --- | --- |
| `--file` | Yes | — | Local file to upload |
| `--file-path` | Yes | — | Destination path, including the filename. Relative paths resolve against the runner's working directory, `/opt/opschain` |
| `--mode` | No | — | Octal file mode, e.g. `0600`. Up to `0777` |
| `--format` | No | `raw` | `raw`, `json`, or `base64`. Binary content must use `base64` |
| `--replace-file` | No | `false` | Overwrite an existing file property at `--file-path` |
| `--secret-path` | No | — | Store the content in the secret vault at this bare path, e.g. `path/to/vault`. No `secret-vault://` scheme. Requires `--secret-key` |
| `--secret-key` | No | — | Key to store the content under. Requires `--secret-path` |
| `--replace-secret` | No | `false` | Overwrite an existing vault value |
| `--project` / `-P` | Varies | — | Project code. Not applicable to `projects` |
| `--environment` / `-E` | No | — | Environment code, for an environment-scoped asset. Assets only |
| `--code` / `--name` / `--id` | No | — | Force the lookup to a code, name, or UUID |

`-o json` and `-o yaml` print the updated properties resource; `-q` prints its UUID.

Properties cannot be written while a change is running at that node — the command reports
`Properties cannot be set as a change is running in Project: myproject` and exits non-zero.

---

## 23. Artefacts

An artefact is a versioned file stored against a project, environment or asset — a build, a
licence key, an installer. Each upload with the same code at the same node adds a new version.
A change loads the newest version of a code and records the load, so you can later see which
file it used.

`artefact`, `artifacts` and `artifact` are aliases for `artefacts`.

### Upload a file

```bash
# An environment-scoped asset
opschain artefacts upload -P myproject -E dev -A myasset --code app_war --file ./app.war

# Label and describe the version
opschain artefacts upload -P myproject -A myasset --code app_war --file ./app.war \
  --label release --label 2026.10 --description "October release build"

# At the project; print only the new artefact's ID
opschain artefacts upload -P myproject --code licence_key --file ./licence.key -q
```

Pick the node with `-P`, adding `-E` and/or `-A`. `-A` without `-E` is a project-level asset.
Codes use lowercase letters, numbers and underscores, up to 100 characters.

The `artefact.max_file_size` setting (default 500Mi) limits the file size, and a larger file is refused
before anything is stored. It cannot exceed `artefact.hard_max_file_size` (default 2Gi). The CLI reads the whole file into memory to send it.

**Upload flags:**

| Flag | Required | Description |
|---|---|---|
| `--file` | Yes | Local file to upload |
| `--code` | Yes | Artefact code |
| `--project` / `-P` | Yes | Project code |
| `--environment` / `-E` | — | Environment code |
| `--asset` / `-A` | — | Asset code |
| `--label` | — | Label for this version (repeatable or comma-separated) |
| `--description` | — | Description of this version, up to 1000 characters |

### List and inspect artefacts

```bash
# Every version stored at an asset, newest first
opschain artefacts list -P myproject -E dev -A myasset

# The newest version of each code, with a count of its versions
opschain artefacts list -P myproject -E dev -A myasset --latest

# Every version of one code carrying a label
opschain artefacts list -P myproject -E dev -A myasset --code app_war --label release

# What a change or a step created
opschain artefacts list --change $CHANGE_ID
opschain artefacts list --step $STEP_ID

# One version in full
opschain artefacts get $ARTEFACT_ID -o yaml
```

A node's list holds only its own artefacts, not those of the nodes beneath it. The table shows
ID, CODE, FILENAME, SIZE, LABELS, VERSIONS, CREATED BY and CREATED AT. VERSIONS is filled in
under `--latest`.

The server returns at most 100 artefacts. Raise that with `--limit`; when the list is cut short,
a note on stderr says so.

**List flags:**

| Flag | Description |
|---|---|
| `--project` / `-P`, `--environment` / `-E`, `--asset` / `-A` | The node to list |
| `--change` | List the artefacts this change created, instead of a node's |
| `--step` | List the artefacts this step created, instead of a node's |
| `--code` | Only this code |
| `--label` | Only versions carrying this label (repeatable or comma-separated; a version must carry every label given). With `--latest`, the newest version that carries them |
| `--latest` | One row per code: its newest version |
| `--filter` | Ransack filter, `field_predicate=value` (repeatable). Only searchable fields work — `code_eq` does, `filename_eq` returns a 400 |
| `--limit` / `-l` | Maximum number to return (server default 100) |

### Download a file

```bash
# By ID, saved under its own file name in the current directory
opschain artefacts download $ARTEFACT_ID

# The newest "app_war" version at an asset, into a directory
opschain artefacts download -P myproject -E dev -A myasset --code app_war --out-file ./build/

# The newest version labelled "release", to a chosen file
opschain artefacts download -P myproject -A myasset --code app_war --label release \
  --out-file /tmp/app.war

# To stdout
opschain artefacts download $ARTEFACT_ID --out-file - | sha256sum
```

With `--code`, the CLI downloads the newest version of that code at the node. Add `--label`
(repeatable or comma-separated) to take the newest version carrying every label given.

`--out-file` takes a file name, a directory, or `-` for stdout. An existing file is replaced
only once the whole file has arrived, so a failed download never leaves a partial file. On
success the CLI prints `Artefact written to <path>`; with `-`, it prints nothing but the file.

### Purged artefacts

A data cleanup can purge old versions. The record stays, with `purged` in the SIZE column, but
its file is gone and cannot be downloaded — the server answers 410. `download --code` skips purged versions, and uploads
that never finished, when it picks the newest.

### See what a change loaded

```bash
opschain artefacts loads --change $CHANGE_ID
opschain artefacts loads --step $STEP_ID
opschain artefacts loads --change $CHANGE_ID -q   # artefact IDs only
```

Each row is one load: ARTEFACT ID, CODE, FILENAME, LABELS, STEP ID and LOADED AT, newest first.
Use it to find exactly which version of a file a change deployed. The server returns at most 100
loads; `--limit` raises that.

---

## 24. Remote runner targets

> Remote runners are a feature preview.

A remote runner target registers a remote runner daemon — a process outside the cluster that
claims and runs change steps for the nodes it serves. You create the target with the daemon's RSA
public key, and OpsChain returns a bearer token for the daemon to authenticate with.

`rrt` and `remote-runners` are short aliases for `remote-runner-targets`.

### Register and manage targets

```bash
# List targets
opschain remote-runner-targets list

# Register a daemon for an environment, saving its token to a file
opschain remote-runner-targets create --code dc1_runner \
  --public-key-file daemon.pub -P myproject -E prod --token-file dc1.token

# Register an instance-wide daemon (superuser only)
opschain remote-runner-targets create --code shared_runner --public-key-file daemon.pub

# Show one target
opschain remote-runner-targets get dc1_runner

# Stop the daemon claiming new work
opschain remote-runner-targets update dc1_runner --maintenance-mode

# Limit the daemon to part of its owning node
opschain remote-runner-targets update dc1_runner \
  --scope-path /projects/myproject/environments/prod/assets/db

# Delete a target
opschain remote-runner-targets delete dc1_runner
```

`--public-key-file` must hold an RSA public key in PEM form. The CLI checks it before sending, so
a private key, a certificate or an EC key fails straight away rather than at the first change the
target runs.

### Owners and scopes

Every target has an owner. Pass `-P`, adding `-E` and/or `-A`, or pass `--node-id`, to have a
project, environment or asset own it. Leave them all off and the target serves the whole
instance — only a superuser can create one of those. The default project in your profile is not
used here, so leaving out `-P` never picks an owner by accident.

Managing the targets a node owns needs authorisation rules on
`<node path>/remote_runner_targets`.

Scope paths narrow a target to part of its owner. Each path must exist and sit inside the owning
node. `--scope-path` on `update` replaces every existing scope; `--clear-scopes` removes them all.

### The bearer token

`create` returns the bearer token once. It cannot be retrieved again. By default `create` prints
it below the table; `--token-file` writes it to a file only you can read. `create -q` requires
`--token-file`, so the token is never lost.

An existing file at the `--token-file` path is replaced only once the target is created. If
`create` fails, the file is left as it was. If the path is a symbolic link, the link itself is
replaced by a regular file holding the token; the file it pointed to is not changed.

### Maintenance mode for a target

`update --maintenance-mode` stops the daemon claiming new work. The MAINTENANCE column shows
`yes (drained)` once its unfinished work is done, and the daemon can then be stopped.
`--maintenance-mode=false` puts it back into service.

LIVE shows `yes` while the daemon is polling. KEY EXPIRES flags an overdue key rotation.

**Create flags:**

| Flag | Required | Description |
|---|---|---|
| `--code` | Yes | Target code: lowercase letters, numbers and underscores |
| `--public-key-file` | Yes | The daemon's RSA public key, PEM encoded |
| `--client-certificate-file` | — | Client certificate the daemon presents |
| `--description` | — | Description |
| `-P`, `-E`, `-A` | — | Owning project, environment or asset |
| `--node-id` | — | Owning node by UUID, instead of `-P`/`-E`/`-A` |
| `--scope-path` | — | Path the target serves (repeatable or comma-separated) |
| `--token-file` | — | Write the bearer token to this file (mode 0600) |

**Update flags:**

| Flag | Description |
|---|---|
| `--description` | New description; `""` clears it |
| `--maintenance-mode` | Stop claiming new work; `=false` resumes |
| `--scope-path` | Replace the scopes with these paths |
| `--clear-scopes` | Remove every scope |

**List flags:**

| Flag | Description |
|---|---|
| `--filter` | Ransack filter, `field_predicate=value`, e.g. `code_cont=dc1` (repeatable) |
| `--limit` / `-l` | Maximum number to return (server default 100) |

### Daemon settings

Each target has versioned settings for its daemon:

| Key | Meaning |
|---|---|
| `max_concurrent_steps` | Steps the daemon runs at once (at least 1) |
| `poll_interval` | Seconds between polls for work (at least 1) |
| `zstd_compression_level` | Compression level for data sent to the daemon (1–19) |

```bash
opschain remote-runner-targets settings get dc1_runner
opschain remote-runner-targets settings update dc1_runner --data '{"max_concurrent_steps": 4}'
opschain remote-runner-targets settings update dc1_runner --from-file runner.json --version 3
opschain remote-runner-targets settings versions dc1_runner
```

An update replaces the stored settings as a whole; a key you leave out falls back to the instance
default. `--version` on `update` is a guard: the update fails if the settings have moved on since
that version.

---

## 25. Troubleshooting

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
