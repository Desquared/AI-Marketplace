# Kiro powers

## What the repository already provides

A Kiro power now uses the Agent Plugins format, and `plugins/wave-cxm` is one:
`plugin.json` (with `keywords`, which trigger activation), `skills/` and
`mcp.json`. Kiro namespaces the servers as `power-wave-cxm-wave-cxm` and
`power-wave-cxm-wave-cxm-stage`. Hooks and rules are not part of a power; the
skills carry the same guard.

## Does Kiro accept a repository link?

**Yes.** The submission form requires a public GitHub repository URL. It has
no field for a subfolder, so name the folder in the description.

## Submit

[kiro.dev/powers/submit](https://kiro.dev/powers/submit)

| Field | Answer |
| ----- | ------ |
| Resource type | Power |
| Name | Wave CXM |
| Organization | Desquared |
| Email | engineering@desquared.com |
| Use case (3–4 words) | Loyalty configuration review |
| GitHub repository | https://github.com/Desquared/AI-Marketplace (power in `plugins/wave-cxm`) |
| Logo | `plugins/wave-cxm/assets/icon.png`. Kiro prefers SVG or EPS; PNG accepted, ≤5 MB |
| Description | Short description from the shared copy |

Accept the Kiro Registry Publisher Terms.

## Unverified

- Remote (`streamable-http`) MCP servers in a power: the docs' example uses
  stdio. Test with **Add Custom Power** → **Import from GitHub** before
  submitting.
- Whether import accepts a folder URL
  (`https://github.com/Desquared/AI-Marketplace/tree/main/plugins/wave-cxm`).

Sources: https://kiro.dev/docs/powers/create/, https://kiro.dev/powers/submit
