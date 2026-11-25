# GitHub MCP Registry

Reaches the VS Code `@mcp` gallery and Copilot. The documented route is to
publish to the [Official MCP Registry](mcp-registry.md) first, then ask GitHub
to include the server.

**Unverified:** whether self-publication or automatic sync from the official
registry has shipped since October 2025. Check
[github.com/mcp](https://github.com/mcp) before writing.

## Email

To: partnerships@github.com
Subject: MCP Registry listing request: Wave CXM (`com.wavecxm/mcp`)

> Hello,
>
> We would like Wave CXM listed in the GitHub MCP Registry. It is published in
> the Official MCP Registry as `com.wavecxm/mcp`.
>
> - Server: https://api.wavecxm.com/mcp (remote, streamable HTTP, OAuth,
>   read-only)
> - What it does: read-only access to Wave CXM loyalty tenants — campaigns,
>   rules, rewards, coupons and contests — scoped to the tenants and
>   permissions each user grants.
> - Repository and setup: https://github.com/Desquared/AI-Marketplace
> - Website: https://go.wavecxm.com
> - Publisher: Desquared
>
> A reviewer account is available on request.
>
> Thank you,
> [TO BE COMPLETED: sender name and role]

`server.json` already sets the display name GitHub shows
(`_meta → io.modelcontextprotocol.registry/publisher-provided → com.github →
serverDisplayName`).

Source: https://github.blog/ai-and-ml/generative-ai/how-to-find-install-and-manage-mcp-servers-with-the-github-mcp-registry/
