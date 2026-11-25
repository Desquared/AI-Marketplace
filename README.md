<p align="center">
  <img src="plugins/wave-cxm/assets/icon.png" alt="Wave CXM" width="96" height="96">
</p>

<h1 align="center">Desquared Marketplace</h1>

<p align="center">
  Desquared's public plugins and MCP servers for AI assistants.
</p>

<p align="center">
  <a href="LICENSE.md"><img alt="License: Desquared Proprietary" src="https://img.shields.io/badge/license-Desquared%20Proprietary-1E2F3F"></a>
  <img alt="Plugin channels: Claude, Codex, Copilot, Cursor, Gemini CLI, Kiro" src="https://img.shields.io/badge/plugin-Claude%20%C2%B7%20Codex%20%C2%B7%20Copilot%20%C2%B7%20Cursor%20%C2%B7%20Gemini%20%C2%B7%20Kiro-E7584A">
  <img alt="MCP: streamable HTTP with OAuth" src="https://img.shields.io/badge/MCP-streamable%20HTTP%20%2B%20OAuth-1E2F3F">
</p>

The **desquared** marketplace distributes Desquared's public plugins for AI-assisted work. Add the marketplace once, then install any plugin it hosts. Each plugin lives under [`plugins/`](plugins/) and is self-contained, with its own manifests, skills, hooks, MCP configuration and README.

## Available plugins

| Plugin | What it does | Docs |
| ------ | ------------ | ---- |
| **Wave CXM** (`wave-cxm`) | Connects your assistant to the [Wave CXM](https://go.wavecxm.com) loyalty platform: a read-only production connector, a read/write stage connector, and skills to verify, diagnose, map and author loyalty configuration. | [plugins/wave-cxm](plugins/wave-cxm/README.md) |

## Install

Every channel installs from this repository or connects to the production MCP server, so an update here reaches every channel without a separate release.

### As a plugin (skills, hooks and both connectors)

| Runtime | Install |
| ------- | ------- |
| **Claude Code** | `claude plugin marketplace add Desquared/AI-Marketplace` then `claude plugin install wave-cxm@desquared` |
| **Claude (web, desktop)** | Browse plugins in the directory and add **Wave CXM** |
| **GitHub Copilot CLI** | `copilot plugin marketplace add Desquared/AI-Marketplace` then `copilot plugin install wave-cxm@desquared` |
| **VS Code (Copilot)** | Install **Wave CXM** from the awesome-copilot plugin marketplace |
| **OpenAI Codex** | `codex plugin marketplace add Desquared/AI-Marketplace`, then enable **Wave CXM** under `/plugins` |
| **ChatGPT** | Add **Wave CXM** from the plugin directory |
| **Cursor** | Install **Wave CXM** from the Cursor Marketplace, or have a Teams or Enterprise admin import this repository under Dashboard → Settings → Plugins → Team Marketplaces |
| **Gemini CLI** | `gemini extensions install https://github.com/Desquared/AI-Marketplace` |
| **Kiro** | **Powers** → **Add Custom Power** → **Import from GitHub** → `https://github.com/Desquared/AI-Marketplace/tree/main/plugins/wave-cxm` |

Codex runs plugin hooks only when they are enabled: `codex features enable plugin_hooks`.

### As an MCP server (production, read-only)

| Directory | Where |
| --------- | ----- |
| **Claude connectors directory** | Search for **Wave CXM** in Claude's connector directory |
| **Official MCP Registry** | `com.wavecxm/mcp` — also feeds clients that read the registry, such as VS Code, JetBrains and Zed |
| **Cline MCP Marketplace** | Search for **Wave CXM** in Cline's MCP marketplace |
| **mcp.so, Smithery** | Search for **Wave CXM** |

Listings appear in each directory once its review completes.

## Use the MCP server directly

Any client that speaks MCP over **streamable HTTP** with **OAuth** can connect to the production server without the plugin:

```text
https://api.wavecxm.com/mcp
```

The server is read-only. It needs no API key: the client discovers sign-in from the server's `401` challenge and opens your browser, and you choose which tenants and permissions to grant. The server accepts `POST` only, so pick the streamable HTTP transport (sometimes labelled **HTTP**), never SSE.

<details>
<summary><b>Claude</b> (claude.ai, Claude Desktop, Claude Code)</summary>

- **Personal:** [Customize → Connectors](https://claude.ai/customize/connectors) → **Add** → **Add custom connector**. Name `Wave CXM`, URL `https://api.wavecxm.com/mcp`.
- **Team or Enterprise:** an Owner adds it under **Organization settings → Connectors** → **Add** → **Custom** → **Web**.
- **Claude Code:**

  ```bash
  claude mcp add --transport http wave-cxm https://api.wavecxm.com/mcp
  ```

</details>

<details>
<summary><b>VS Code</b> (GitHub Copilot)</summary>

[Install in VS Code](https://vscode.dev/redirect?url=vscode%3Amcp%2Finstall%3F%257B%2522name%2522%253A%2522wave-cxm%2522%252C%2522type%2522%253A%2522http%2522%252C%2522url%2522%253A%2522https%253A%252F%252Fapi.wavecxm.com%252Fmcp%2522%257D), or add it to `.vscode/mcp.json`:

```json
{
  "servers": {
    "wave-cxm": {
      "type": "http",
      "url": "https://api.wavecxm.com/mcp"
    }
  }
}
```

</details>

<details>
<summary><b>Cursor</b></summary>

Add it to `.cursor/mcp.json` in a project, or `~/.cursor/mcp.json` for every project:

```json
{
  "mcpServers": {
    "wave-cxm": {
      "url": "https://api.wavecxm.com/mcp"
    }
  }
}
```

</details>

<details>
<summary><b>Cline</b></summary>

**MCP Servers** → **Remote Servers** → Server Name `wave-cxm`, Server URL `https://api.wavecxm.com/mcp`, Transport **Streamable HTTP** → **Add Server**. Or in `cline_mcp_settings.json`:

```json
{
  "mcpServers": {
    "wave-cxm": {
      "type": "streamableHttp",
      "url": "https://api.wavecxm.com/mcp",
      "disabled": false
    }
  }
}
```

Set `type` explicitly: without it Cline assumes the older SSE transport.

</details>

<details>
<summary><b>Gemini CLI</b></summary>

In `~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "wave-cxm": {
      "httpUrl": "https://api.wavecxm.com/mcp"
    }
  }
}
```

Use `httpUrl`, not `url`: Gemini CLI reads `url` as SSE.

</details>

<details>
<summary><b>Perplexity</b></summary>

- **Personal:** **Plugins** → **Add custom** → **Add MCP connector** → **Remote**.
- **Organization:** **Organization settings** → **Connectors** → **Custom connector**. Members can add their own only if an admin allows custom connectors.

Name `Wave CXM`, URL `https://api.wavecxm.com/mcp`. Under **Advanced**, choose authentication **OAuth** and transport **Streamable HTTP**.

</details>

<details>
<summary><b>Glean</b></summary>

An admin opens **Platform** → **Tools** → **Vendor Provided Tools (via MCP)** → **Add** → **Import tools from MCP server**. Enter the URL, choose transport **Streaming HTTP** and authentication **OAuth** (or **DCR** where offered), then enable the tools for Agents and Glean.

</details>

<details>
<summary><b>Dust</b></summary>

An admin opens **Spaces** → **Tools** → **Add Tool** → **Add MCP Server**, enters `https://api.wavecxm.com/mcp`, and keeps authentication on **Automatic**.

</details>

<details>
<summary><b>Intercom Fin</b></summary>

**Settings** → **Data connectors** → **Custom MCP**. Enter the name and URL, leave the access token empty to sign in with OAuth, then set each tool live. Fin holds one workspace-wide connection, so it acts with the permissions of the account that signed in.

</details>

<details>
<summary><b>Microsoft Copilot Studio</b></summary>

In your agent: **Tools** → **Add a tool** → **New tool** → **Model Context Protocol**. Enter a name, a description and the URL, choose **OAuth 2.0** → **Dynamic discovery**, then **Create a new connection** → **Add to agent**.

</details>

## Editors without plugin support

Editors that consume ambient project context rather than plugins (Windsurf, Copilot instructions, `CLAUDE.md`, or Cursor without a team plan) can still use a plugin's skills and rules. The installer at [`bin/`](bin/) converts them into the shape that editor expects and writes them into the right slot:

```bash
cd bin && npm install && node install-rules.js <plugin>
```

Omit `<plugin>` to pick from a list.

For Cursor, the generated `.mdc` files under [`dist/cursor-rules/`](dist/cursor-rules/) can also be added with Customize → Rules → Add Rule → Remote Rule (Github), pointing at this repository.

## License

Copyright © 2026 Desquared. All rights reserved.

This repository is **source-available, not open source**. It is published under the [Desquared Proprietary License](LICENSE.md): you may install and run the plugins as published, and the marketplaces that list them may distribute unmodified copies, but you may not modify, redistribute or resell them, or use them to train AI models. The hosted services the plugins connect to are governed by their own terms of service.

## Security

See [SECURITY.md](SECURITY.md) to report a vulnerability.
