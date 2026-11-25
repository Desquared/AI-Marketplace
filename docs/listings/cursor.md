# Cursor Marketplace

## What the repository already provides

- `.cursor-plugin/marketplace.json` at the root, listing `wave-cxm` under
  `metadata.pluginRoot: "plugins"`.
- `plugins/wave-cxm/.cursor-plugin/plugin.json` with `displayName`, `logo`,
  `keywords` and explicit `skills`, `rules` and `mcpServers` paths. It points
  at `.mcp.json` because Cursor otherwise looks for `mcp.json`, which holds the
  Agent Plugins dialect.
- Frontmatter on every skill and rule; a README covering usage and setup; no
  `${VAR}` placeholders to declare.

## Submit

Submit the public repository link at
[cursor.com/marketplace/publish](https://cursor.com/marketplace/publish). The
Cursor team reviews it.

| Field | Copy |
| ----- | ---- |
| Repository | https://github.com/Desquared/AI-Marketplace |
| Name | Wave CXM |
| Description | Plugin description |
| Category | Business & Operations. **Unverified:** Cursor's category list. |

## Unverified

- Logo size and format: Cursor documents none; its template uses SVG. We ship
  a 512×512 PNG.
- Cursor's hooks format differs from Claude Code's. The plugin does not declare
  hooks for Cursor, but Cursor may still discover `hooks/hooks.json`; the hooks
  are reminders only, so a skipped hook loses nothing essential.
- This repository's `AGENTS.md` records a strict catalog-entry schema
  (`name`, `source`, `description`, `minClientVersions` only), while the
  current docs list more entry fields. The catalog keeps to the strict set.

Sources: https://cursor.com/docs/reference/plugins,
https://github.com/cursor/plugin-template
