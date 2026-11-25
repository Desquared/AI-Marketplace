# Desquared Marketplace — Development And Maintainer Guide

This repository is the public **desquared** plugin marketplace. The root is a
thin shell: it holds the marketplace catalogs, the license, shared tooling and
shared guidance. Every plugin is a self-contained tenant under
[`plugins/`](plugins/) with its own manifests, skills, hooks and MCP
configuration. Plugin-specific implementation details live in that plugin's own
`AGENTS.md`.

Use this guide when changing marketplace wiring or maintaining a plugin.

## Public Repository Rules

This repository is public and distributed through third-party marketplaces.
Every change must hold to these rules; reviewers block on them.

- **Nothing internal.** No links to internal tools or private repositories, no
  real tenant names or ids, no customer data, no credentials, no internal
  design notes or plans. Use placeholders such as `Acme (64f0c2a1b3d4e5f6a7b8c9d0)`
  in examples.
- **Every plugin carries the license.** Some marketplaces ship only the plugin
  folder, so `plugins/<name>/LICENSE.md` must be a byte-identical copy of the
  root [`LICENSE.md`](LICENSE.md). Change the root one and copy it.
- **Every manifest declares it.** `plugin.json`, `.claude-plugin/plugin.json`
  and `.codex-plugin/plugin.json` each carry
  `"license": "LicenseRef-Desquared-Proprietary"`.

The `checks` workflow enforces the last two.

### Why the license grants marketplace rights

The [license](LICENSE.md) is proprietary but explicitly lets listed marketplaces
host, cache, mirror, distribute and repackage unmodified copies, and lets their
users install them (including automated installs by agents). That is
deliberate: Cursor's and Kiro's publisher terms take a sublicensable
distribution right, the Anthropic directory ships the plugin folder to users,
and Cline clones the repository on install. A plain "no redistribution" license
would breach those terms. Do not narrow Sections 2 and 3 without legal review.

## Marketplace Catalogs

The root holds one catalog per runtime. Each lists every plugin and points its
`source` at the plugin's folder under `plugins/`.

| Runtime            | Catalog                             | Source shape                                        |
| ------------------ | ----------------------------------- | --------------------------------------------------- |
| Claude Code        | `.claude-plugin/marketplace.json`   | `"source": "./plugins/<name>"`                      |
| GitHub Copilot CLI | `.github/plugin/marketplace.json`   | `"source": "./plugins/<name>"`                      |
| OpenAI Codex       | `.agents/plugins/marketplace.json`  | `git-subdir` source with `path: "./plugins/<name>"` |
| Cursor             | `.cursor-plugin/marketplace.json`   | `"source": "<name>"`, resolved under `metadata.pluginRoot` |
| Gemini CLI         | `gemini-extension.json` + `GEMINI.md` | Not a catalog: the repository root *is* one extension (see below) |

The marketplace `name` is `desquared` in all four catalogs. Desquared's private
marketplace is named `desquared-internal`, so both can be added side by side.

### Cursor source note

Cursor resolves each entry's `source` under `metadata.pluginRoot`, so the entry
carries the bare plugin folder name rather than a path. Its `pluginEntry` schema
sets `additionalProperties: false` and accepts only `name`, `source`,
`description`, and `minClientVersions`; anything else fails validation.

### Codex source note

Codex must use a `git-subdir` source for a plugin that lives in a subdirectory:

```json
{
  "source": "git-subdir",
  "url": "https://github.com/Desquared/AI-Marketplace.git",
  "path": "./plugins/<name>",
  "ref": "main"
}
```

Codex does not discover a marketplace source of `"./"` (the repository root),
so plugins must live in concrete subdirectories under `plugins/`.

### Gemini CLI note

The Gemini CLI extensions gallery only lists an extension whose
`gemini-extension.json` sits at the repository root, so the root is the
`wave-cxm` extension. It declares the plugin's MCP servers with `httpUrl`
(Gemini reads `url` as SSE), and its context file `GEMINI.md` imports the
plugin's rule and skills with `@./plugins/wave-cxm/...` rather than copying
them. The root can hold one extension; a second plugin that needs the gallery
needs its own repository.

## Plugin Layout

Each plugin under `plugins/<name>/` is self-contained:

```text
plugins/<name>/
├── .claude-plugin/plugin.json   # Claude Code manifest and directory listing fields
├── .codex-plugin/plugin.json    # Codex manifest with its `interface` listing block
├── .cursor-plugin/plugin.json   # Cursor manifest (optional)
├── plugin.json                  # Agent Plugins 1.0.0 manifest (Copilot CLI, Kiro, Cursor, OpenAI)
├── LICENSE.md                   # Copy of the root LICENSE.md
├── .mcp.json                    # MCP servers (Claude Code, Codex, Cursor dialect)
├── mcp.json                     # The same servers, Agent Plugins dialect
├── com.github.copilot/hooks/hooks.json  # Copy of hooks/hooks.json for Copilot CLI
├── server.json                  # Official MCP Registry entry (optional)
├── assets/                      # Icon, logos and diagrams for listings
├── skills/<skill>/SKILL.md      # Skills
├── agents/*.agent.md            # Role agents (Claude Code, Copilot, Codex)
├── hooks/hooks.json + *.js      # Hooks and helper scripts
├── rules/*.md                   # Ambient rules for editors without plugins
├── AGENTS.md                    # Plugin-specific maintainer notes
└── README.md                    # Install and usage
```

### Manifests differ per runtime — do not copy one to the others

The manifests share `name`, `version`, `description`, `license`, `homepage`,
`repository` and `keywords`. Their **path fields do not match**, and copying
one file to the others produces a plugin that fails to install.

| Manifest | Path fields | Format |
| -------- | ----------- | ------ |
| `.claude-plugin/plugin.json` | **none** — omit them | Claude Code discovers `skills/`, `agents/`, `hooks/hooks.json` and `.mcp.json` by convention. Directory listing fields (`displayName`, `icon`, `documentationUrl`, `supportUrl`, `privacyPolicyUrl`, `termsOfServiceUrl`, `network.hosts`) go here and **only** here: in a catalog entry they are unknown fields |
| `.codex-plugin/plugin.json` | `"skills"`, `"agents"`, `"hooks"`, `"mcpServers"` | **`./`-prefixed**, plus an `"interface"` block (`shortDescription` ≤30 characters, `category` from OpenAI's list) |
| `.cursor-plugin/plugin.json` | `"skills"`, `"rules"`, `"mcpServers"`, `"logo"` | plain relative paths. `mcpServers` must name `.mcp.json`, because Cursor's default `mcp.json` is the Agent Plugins dialect |
| `plugin.json` (Agent Plugins 1.0.0) | **none allowed** | `"$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json"`; only `$schema`, `name`, `version`, `description`, `author`, `homepage`, `repository`, `license`, `keywords`, `extensions` |

The root `plugin.json` was a Copilot manifest with path fields. Copilot CLI,
Kiro, Cursor and OpenAI now all read the Agent Plugins format, and
awesome-copilot requires it, so it follows that closed schema. Components sit
at fixed places: `skills/`, and `mcp.json` (no dot) with a `type` of
`streamable-http` on each remote server. Client-specific files live in a
reverse-domain folder: Copilot CLI reads the hooks of an Agent Plugins plugin
only from `com.github.copilot/hooks/hooks.json`, a byte-identical copy of
`hooks/hooks.json`.

**One server list, three dialects.** `.mcp.json` (`"type": "http"`),
`mcp.json` (`"type": "streamable-http"`) and the root `gemini-extension.json`
(`"httpUrl"`) declare the same servers. Change all three together; a test
fails when they drift.

Claude Code and Codex both validate path fields against the pattern `^\./.*`
(see the [manifest schema](https://www.schemastore.org/claude-code-plugin-manifest.json)).
A plain relative path such as `"skills/"` or `".mcp.json"` is rejected at install
time as `Invalid input` — note that `.mcp.json` starts with a dot but **not**
with `./`, so it fails too. Write `"./.mcp.json"`.

`bin/lib/manifest-validate.test.js` enforces all of this in CI. It also checks
that every declared path and listing asset exists, that versions agree, that
the MCP dialects and hook copies match, and that `server.json` meets the
Official MCP Registry's rules.

## Ambient rules channel

Some plugins ship a `rules/` directory in addition to `skills/`. Rules are
**not** part of the CLI plugin manifest — they serve editors that consume
ambient project context (Cursor `.cursor/rules/`, Windsurf `.windsurf/rules/`,
Copilot `.github/instructions/`, Claude `CLAUDE.md`), which cannot install
marketplace plugins.

One installer serves every plugin, at `bin/`. Run it with
`node install-rules.js <plugin>`. It reads `rules/`, `skills/`, and `agents/`
from that plugin, so a plugin needs no installer of its own.

Source rule files are stored verbatim. The installer synthesizes each editor's
required frontmatter at install time. Do not commit synthesized frontmatter back
into `plugins/*/rules/`.

`dist/cursor-rules/` is generated output, published so Cursor's Remote Rules
feature can sync straight from GitHub without a checkout. Never edit it. Run
`node bin/build-cursor-rules.js` after changing any rule or skill; the `checks`
workflow fails when it is stale.

A skill installs as a description-selected rule. An ambient slot is flat, so a
multi-file skill's sibling references install as their own rules named
`<skill>-<ref>` and the links in `SKILL.md` are rewritten to point at them.

## Adding A New Plugin

1. Create `plugins/<name>/` following the Plugin Layout above.
2. Copy the root `LICENSE.md` into it.
3. Give it its runtime manifests, each with matching `name`, `version`,
   `description` and `license`, and an Agent Plugins `plugin.json` and
   `mcp.json` if it ships MCP servers.
4. Add one entry per runtime catalog at the repo root.
5. Add a row to the Available Plugins table in the root `README.md`, and an
   option to `.github/ISSUE_TEMPLATE/bug_report.yml`.
6. Run `node bin/build-cursor-rules.js`.
7. Verify (see below), including the Public Repository Rules.

## Keeping Versions In Sync

A plugin's version appears in its own manifests (`plugin.json`,
`.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`, and
`.cursor-plugin/plugin.json` when shipped), in the catalog entries that carry
a `version` field (`.claude-plugin/marketplace.json`,
`.github/plugin/marketplace.json`), and in a root manifest whose `name` is the
plugin's (`gemini-extension.json`, listed in `VERSION_ROOT_MANIFESTS`). The
Codex catalog tracks a `ref`.

`server.json` is the exception. Its `version` is the MCP server's, published
to an immutable registry, so it is raised by hand when the server listing
changes and never by the plugin's bump.

Use `MAJOR.MINOR.PATCH`: major for breaking workflow/runtime changes, minor for
new skills or agents, patch for fixes and docs.

Do not bump by hand. The `version` workflow runs `bin/version-bump.js` on every
PR: each plugin with changes in its folder is set to one level above its version
on `main`, in every file above, and the bump is committed to the PR branch. The
level comes from a `release:none|patch|minor|major` label, or else from the PR
title (`!` or `BREAKING CHANGE` → major, `feat` → minor, anything else → patch).
The push needs a `RELEASE_BOT_TOKEN` repository secret with Contents: Read and
write. To run it locally:

```bash
node bin/version-bump.js origin/main --level minor
```

## Verifying

```bash
node --test bin/lib/*.test.js
```

```bash
node bin/build-cursor-rules.js --check
```

```bash
claude plugin validate . && claude plugin validate plugins/<name>
```

`claude plugin validate` also runs a subset of the Anthropic directory checks.
Its warnings about the privacy and terms URLs stay until those placeholders are
filled.

CI checks `server.json` against the registry's rules but has no network for the
full schema. Before publishing, validate it against the schema it names:

```bash
curl -sO https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json
python3 -c 'import json,jsonschema; jsonschema.validate(json.load(open("plugins/wave-cxm/server.json")), json.load(open("server.schema.json")))'
```

```bash
find plugins -name '*.test.js' -not -path '*/node_modules/*' -print0 | xargs -0 -r node --test
```

The `checks` workflow also parses every manifest and catalog, checks every
skill's frontmatter, and checks the license rules above.

## Distribution Channels

Each channel reads this repository, or the production MCP server, so a merge to
`main` reaches them all. Ready-to-paste copy, limits, submission steps and
reviewer notes for every channel live in [`docs/listings/`](docs/listings/).

| Channel | Reads | Files it needs |
| ------- | ----- | -------------- |
| Anthropic directory (plugin) | repository, plugin folder | `.claude-plugin/plugin.json`, README, `LICENSE.md`, `assets/icon.png` |
| Anthropic directory (connector) | production server | none in the repository |
| OpenAI plugin directory | uploaded ZIP | `node bin/package-openai.js <plugin> --privacy <url> --terms <url>` builds it without hooks, which OpenAI refuses |
| awesome-copilot, copilot-plugins | repository at a tag | Agent Plugins `plugin.json`, `skills/` |
| Cursor Marketplace | repository | `.cursor-plugin/marketplace.json`, `.cursor-plugin/plugin.json` |
| Gemini CLI gallery | repository root at a tag | `gemini-extension.json`, `GEMINI.md`, the `gemini-cli-extension` topic |
| Kiro powers | repository | Agent Plugins `plugin.json`, `mcp.json`, `skills/` |
| Official MCP Registry | `server.json` | `server.json`, published with `mcp-publisher` |
| Cline MCP Marketplace | repository README | `llms-install.md`, `assets/logo-400.png` |

The root `llms-install.md` tells an installing agent how to add the production
MCP server. Keep it in step with the README's "Use the MCP server directly"
section.

Never put a placeholder URL in a field a runtime parses at install time. The
privacy and terms placeholders sit only in `.claude-plugin/plugin.json`, whose
listing fields Claude Code ignores at load time; the OpenAI archive gets the
real URLs from the packaging script.

## Releasing

Merging the PR is the release: its version bump is already on the branch.
Marketplaces that track the repository pick it up from `main`; channels that
take an uploaded archive need a resubmission. To tag it:

```bash
git tag "<plugin>-v<version>"
```

```bash
git push origin "<plugin>-v<version>"
```
