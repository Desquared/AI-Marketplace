# Wave CXM Plugin — Maintainer Guide

Plugin-specific notes. For marketplace wiring, the ambient-rules channel, the public repository rules and release mechanics, see the root [`AGENTS.md`](../../AGENTS.md).

## Components

| Path | Owns |
|:-----|:-----|
| `skills/wave-cxm-context/` | **Single source of truth** for all MCP access: environment model, discovery order, tenant resolution, empty-result rule, write guard, tool traps, error table. |
| `skills/verify-config/` | Prospective configuration review. |
| `skills/diagnose-issue/` | Retrospective, evidence-led diagnosis. |
| `skills/tenant-map/` | Tenant orientation and permission-gap reporting. |
| `skills/author-config/` | Guided create/update/delete, stage only. |
| `hooks/hooks.json` | Targeted write guard on the three stage write tools. |
| `com.github.copilot/hooks/hooks.json` | Byte-identical copy of `hooks/hooks.json`. Copilot CLI reads an Agent Plugins plugin's hooks only from here. |
| `rules/` | Ambient channel for editors that cannot install plugins. |
| `.mcp.json` | The two connectors (Claude Code, Codex and Cursor dialect). |
| `mcp.json` | The same two connectors in the Agent Plugins dialect (`streamable-http`). |
| `server.json` | The production connector's Official MCP Registry entry, `com.wavecxm/mcp`. |
| `assets/` | Listing icon and logos from the official Wave CXM artwork, and the two-connector diagram. See `assets/README.md`. |

**The two connectors are declared three times**: `.mcp.json`, `mcp.json` and the repository root's `gemini-extension.json`. `server.json` declares production only. Change them together; `bin/lib/manifest-validate.test.js` fails when they drift.

**Cross-cutting rules belong in `wave-cxm-context`, not duplicated into workflow skills.** The one deliberate exception is `rules/wave-cxm-environments.md`, which restates the safety-critical subset because an ambient slot cannot trigger on a non-user-invocable skill's description.

**Reference other skills by backticked name in prose** — `` the `wave-cxm-context` skill `` — never as a relative markdown link. The ambient-rules link rewriter in `bin/lib/rules-transform.js` only rewrites links to sibling files *within* one skill; a `../other-skill/SKILL.md` path is explicitly excluded and ships to Cursor as a dead link.

## The runtime-derivation rule

**Never hardcode an inventory into a skill.** Entity types come from `list-entities`, the write allow-list from `describe_write`, tenants and permissions from `list_tenants`, event bodies from `describe-preview` — always against the live connector.

This is not style. The connector is under active development: the write allow-list grew from 4 types to 19 between the roadmap being written and the tools shipping, and several capabilities shipped while the published product catalogue still listed them as planned. Anything baked into a skill starts rotting the day it lands, and a skill that confidently reports a stale list is worse than one that asks.

## The hook matcher

The matcher is a tolerant three-way alternation on purpose:

```
mcp__wave-cxm-stage__(create|update|delete)_entity|mcp_wave-cxm-stage_(create|update|delete)_entity|wave-cxm-stage_(create|update|delete)_entity
```

Live tool names use double underscores, but some runtimes normalise MCP tool names to a single-underscore form or drop the `mcp` prefix — so rather than gamble on one runtime's normalisation, all three shapes match. Over-matching is harmless because both hooks are non-blocking reminders that print text.

Both hooks are **non-blocking by design**. The gateway already enforces permissions, validation, lifecycle and audit; `delete_entity` already fails closed without `confirm: true`; and wrong-environment writes are structurally impossible since production exposes no write tools. A blocking hook would duplicate all of that and could only contribute false denials. The hook exists so the guard is present when the MCP is called raw with no skill loaded.

## Versions

Bump together:

- `plugin.json`
- `.claude-plugin/plugin.json`
- `.codex-plugin/plugin.json`
- `.cursor-plugin/plugin.json`
- the `version` field in the root `.claude-plugin/marketplace.json`
- the `version` field in the root `.github/plugin/marketplace.json`
- the root `gemini-extension.json`

The `version` workflow does this for you; do not bump by hand. The Codex catalog (`.agents/plugins/marketplace.json`) tracks a `ref`, not a version. `server.json` carries the MCP server's own version and is raised by hand before each `mcp-publisher publish`.

## Verifying

```bash
# JSON parses
for f in plugins/wave-cxm/plugin.json plugins/wave-cxm/.claude-plugin/plugin.json \
         plugins/wave-cxm/.codex-plugin/plugin.json plugins/wave-cxm/.cursor-plugin/plugin.json \
         plugins/wave-cxm/.mcp.json plugins/wave-cxm/mcp.json plugins/wave-cxm/server.json \
         plugins/wave-cxm/hooks/hooks.json; do
  node -e 'JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"))' "$f" && echo "ok $f"
done

# Manifests, MCP dialects, hook copies, listing assets and server.json
node --test bin/lib/*.test.js

# Runtime and Anthropic directory checks
claude plugin validate plugins/wave-cxm

# Generated Cursor rules current — CI fails when stale
node bin/build-cursor-rules.js && node bin/build-cursor-rules.js --check
```

There are no hook unit tests: the hooks are inline commands, not JS.

**Always run `node bin/build-cursor-rules.js` and commit `dist/` after touching any skill or rule.**

### Live smoke test

No static check can assert this. After a change to any skill, run it against a tenant you have access to and confirm the output header names the connector and the tenant name + id, and that entity mentions carry a `get_url` link with the tenant beside it.
