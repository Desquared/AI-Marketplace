# Official MCP Registry

Publishes the production server as `com.wavecxm/mcp`. Clients and directories
that read the registry pick it up from there, among them VS Code, JetBrains
Junie, Zed and PulseMCP.

## What the repository already provides

`plugins/wave-cxm/server.json`, valid against
`https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json`:
remote only (`streamable-http`, `https://api.wavecxm.com/mcp`), description
within 100 characters, HTTPS icon and website, and a GitHub display name under
`_meta`. CI checks the registry's rules; see the root `AGENTS.md` for the full
schema check.

The icon URL points at `main` on GitHub, so it resolves once the repository is
public and merged.

## Prove ownership of wavecxm.com

The name `com.wavecxm/mcp` needs proof of control of `wavecxm.com`. DNS is
recommended because it also covers subdomains.

```bash
openssl genpkey -algorithm Ed25519 -out wavecxm-registry.pem
# Public key for the TXT record:
openssl pkey -in wavecxm-registry.pem -pubout -outform DER | tail -c 32 | base64
```

Add a TXT record on the apex:

```text
wavecxm.com.  IN  TXT  "v=MCPv1; k=ed25519; p=<base64 public key>"
```

Keep the private key in Desquared's secret store, not in this repository.

## Publish

```bash
brew install mcp-publisher
cd plugins/wave-cxm
mcp-publisher validate
PRIVATE_KEY=$(openssl pkey -in /path/to/wavecxm-registry.pem -outform DER | tail -c 32 | xxd -p -c 64)
mcp-publisher login dns --domain wavecxm.com --private-key "$PRIVATE_KEY"
mcp-publisher publish
```

Published versions are immutable. To change the listing, raise `version` in
`server.json` and publish again. The server's `version` tracks the MCP server,
not the plugin, so the plugin's version bump does not touch it.

**Unverified:** the exact `mcp-publisher login dns` flag for the key (the docs
show both `--private-key` and an `MCP_PRIVATE_KEY` variable). Run
`mcp-publisher login dns --help` first.

Sources:
https://github.com/modelcontextprotocol/registry/blob/main/docs/modelcontextprotocol-io/remote-servers.mdx,
https://github.com/modelcontextprotocol/registry/blob/main/docs/modelcontextprotocol-io/authentication.mdx,
https://github.com/modelcontextprotocol/registry/blob/main/docs/reference/server-json/official-registry-requirements.md
