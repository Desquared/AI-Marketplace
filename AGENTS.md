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

The marketplace `name` is `desquared` in all four. Desquared's private
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

## Plugin Layout

Each plugin under `plugins/<name>/` is self-contained:

```text
plugins/<name>/
├── .claude-plugin/plugin.json   # Claude Code metadata
├── .codex-plugin/plugin.json    # Codex manifest
├── plugin.json                  # Copilot/shared manifest
├── LICENSE.md                   # Copy of the root LICENSE.md
├── .mcp.json                    # MCP servers
├── skills/<skill>/SKILL.md      # Skills
├── agents/*.agent.md            # Role agents (Claude Code, Copilot, Codex)
├── hooks/hooks.json + *.js      # Hooks and helper scripts
├── rules/*.md                   # Ambient rules for editors without plugins
├── AGENTS.md                    # Plugin-specific maintainer notes
└── README.md                    # Install and usage
```

### Manifests differ per runtime — do not copy one to the others

The three manifests share `name`, `version`, `description` and `license`. Their
**path fields do not match**, and copying one file to all three produces a
plugin that fails to install.

| Manifest | Path fields | Format |
| -------- | ----------- | ------ |
| `.claude-plugin/plugin.json` | **none** — omit them | Claude Code discovers `skills/`, `agents/`, `hooks/hooks.json` and `.mcp.json` by convention |
| `.codex-plugin/plugin.json` | `"skills"`, `"agents"`, `"hooks"`, `"mcpServers"` | **`./`-prefixed**, plus an `"interface"` block |
| `plugin.json` (Copilot/shared) | same four fields | plain relative paths, no prefix |

Claude Code and Codex both validate path fields against the pattern `^\./.*`
(see the [manifest schema](https://www.schemastore.org/claude-code-plugin-manifest.json)).
A plain relative path such as `"skills/"` or `".mcp.json"` is rejected at install
time as `Invalid input` — note that `.mcp.json` starts with a dot but **not**
with `./`, so it fails too. Write `"./.mcp.json"`.

`bin/lib/manifest-validate.test.js` enforces all of this in CI, and also checks
that every declared path exists on disk and that versions agree.

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
3. Give it its three runtime manifests, each with matching `name`, `version`,
   `description` and `license`.
4. Add one entry per runtime catalog at the repo root.
5. Add a row to the Available Plugins table in the root `README.md`, and an
   option to `.github/ISSUE_TEMPLATE/bug_report.yml`.
6. Run `node bin/build-cursor-rules.js`.
7. Verify (see below), including the Public Repository Rules.

## Keeping Versions In Sync

A plugin's version appears in its own manifests (`plugin.json`,
`.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`, and
`.cursor-plugin/plugin.json` when shipped) and in the catalog entries that carry
a `version` field (`.claude-plugin/marketplace.json`,
`.github/plugin/marketplace.json`). The Codex catalog tracks a `ref`.

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
find plugins -name '*.test.js' -not -path '*/node_modules/*' -print0 | xargs -0 -r node --test
```

The `checks` workflow also parses every manifest and catalog, checks every
skill's frontmatter, and checks the license rules above.

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
