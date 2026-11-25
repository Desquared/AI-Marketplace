# Desquared Marketplace

The **desquared** marketplace distributes Desquared's public plugins for
AI-assisted development environments. Add the marketplace once, then install
any plugin it hosts. Each plugin lives under [`plugins/`](plugins/) and is
self-contained, with its own manifests, skills, hooks, MCP configuration and
README.

Supported runtimes: **Claude Code**, **GitHub Copilot CLI**, **OpenAI Codex**
and **Cursor**.

## Available Plugins

| Plugin | Description | Docs |
| ------ | ----------- | ---- |
| **wave-cxm** | Wave CXM loyalty platform integration — two MCP connectors (production read-only, stage read/write) plus skills for pre-launch config verification, troubleshooting, tenant orientation, and guided authoring. | [plugins/wave-cxm](plugins/wave-cxm/README.md) |

## Adding The Marketplace

### Claude Code

```bash
claude plugin marketplace add Desquared/AI-Marketplace
```

```bash
claude plugin install <plugin>@desquared
```

### GitHub Copilot CLI

```bash
copilot plugin marketplace add Desquared/AI-Marketplace
```

```bash
copilot plugin install <plugin>@desquared
```

### OpenAI Codex

```bash
codex features enable plugin_hooks
```

```bash
codex plugin marketplace add Desquared/AI-Marketplace
```

Then open `/plugins` in Codex, select the **Desquared** marketplace, and enable
the plugin you want.

### Cursor

Install from the Cursor Marketplace, or have a Teams or Enterprise admin import
this repository under Dashboard → Settings → Plugins → Team Marketplaces.

Per-plugin installation and usage details live in each plugin's README, linked
in the table above.

## Editors without plugin support

Editors that consume ambient project context rather than plugins (Windsurf,
Copilot instructions, `CLAUDE.md`, or Cursor without a team plan) can still use
a plugin's skills and rules. The installer at [`bin/`](bin/) converts them into
the shape that editor expects and writes them into the right slot:

```bash
cd bin && npm install && node install-rules.js <plugin>
```

Omit `<plugin>` to pick from a list.

For Cursor, the generated `.mdc` files under
[`dist/cursor-rules/`](dist/cursor-rules/) can also be added with Customize →
Rules → Add Rule → Remote Rule (Github), pointing at this repository.

## License

Copyright © 2026 Desquared. All rights reserved.

This repository is **source-available, not open source**. It is published under
the [Desquared Proprietary License](LICENSE.md): you may install and run the
plugins as published, and the marketplaces that list them may distribute
unmodified copies, but you may not modify, redistribute or resell them, or use
them to train AI models. The hosted services the plugins connect to are governed
by their own terms of service.

## Security

See [SECURITY.md](SECURITY.md) to report a vulnerability.
