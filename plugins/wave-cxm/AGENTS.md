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
| `rules/` | Ambient channel for editors that cannot install plugins. |
| `.mcp.json` | The two connectors. |

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
- the `version` field in the root `.claude-plugin/marketplace.json`
- the `version` field in the root `.github/plugin/marketplace.json`

The Codex catalog (`.agents/plugins/marketplace.json`) tracks a `ref`, not a version.

## Verifying

```bash
# JSON parses
for f in plugins/wave-cxm/plugin.json plugins/wave-cxm/.claude-plugin/plugin.json \
         plugins/wave-cxm/.codex-plugin/plugin.json plugins/wave-cxm/.mcp.json \
         plugins/wave-cxm/hooks/hooks.json; do
  node -e 'JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"))' "$f" && echo "ok $f"
done

# Manifest path fields resolve, and no agents key is declared
node -e '
const fs=require("fs"),p=require("path");const root="plugins/wave-cxm";let bad=0;
for (const m of ["plugin.json",".claude-plugin/plugin.json",".codex-plugin/plugin.json"]) {
  const j=JSON.parse(fs.readFileSync(p.join(root,m),"utf8"));
  if ("agents" in j) { console.error(`${m}: must not declare an agents key`); bad++; }
  for (const k of ["skills","hooks","mcpServers"]) {
    if (!j[k]) { console.error(`${m}: missing ${k}`); bad++; continue; }
    if (!fs.existsSync(p.join(root,j[k]))) { console.error(`${m}: ${k} -> ${j[k]} missing`); bad++; }
  }
}
process.exit(bad?1:0)'

# Generated Cursor rules current — CI fails when stale
node bin/build-cursor-rules.js && node bin/build-cursor-rules.js --check
```

There are no hook unit tests: the hooks are inline commands, not JS.

**Always run `node bin/build-cursor-rules.js` and commit `dist/` after touching any skill or rule.**

### Live smoke test

No static check can assert this. After a change to any skill, run it against a tenant you have access to and confirm the output header names the connector and the tenant name + id, and that entity mentions carry a `get_url` link with the tenant beside it.
