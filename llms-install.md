# Installing the Wave CXM MCP server

Instructions for an AI agent that is setting up the Wave CXM MCP server.

Wave CXM is a remote MCP server. There is nothing to download, build or run
locally, and no API key.

- **URL:** `https://api.wavecxm.com/mcp`
- **Transport:** streamable HTTP. The server accepts `POST` only; do not
  configure SSE.
- **Authentication:** OAuth, discovered from the server's `401` response. The
  client opens a browser, the user signs in to Wave CXM and chooses which
  tenants and permissions to grant. Never ask the user for a token.
- **Access:** read-only.

## Cline

Add this to `cline_mcp_settings.json`, keeping any servers already there:

```json
{
  "mcpServers": {
    "wave-cxm": {
      "type": "streamableHttp",
      "url": "https://api.wavecxm.com/mcp",
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

`type` must be `streamableHttp`: without it, Cline assumes SSE and the
connection fails with "Method not allowed".

The first connection answers `401 Unauthorized` and starts the browser
sign-in. If no browser opens, run Cline's OAuth authorization for the
`wave-cxm` server, then reconnect it.

## Check the installation

Ask: "Which Wave CXM tenants can I act on?" The answer should list tenants and
the user's permissions in each. An empty list means the account has no tenant
grants, or the wrong account signed in.
