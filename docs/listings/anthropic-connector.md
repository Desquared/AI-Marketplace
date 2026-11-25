# Anthropic directory — MCP connector

Reaches Claude on the web, desktop and mobile, and Cowork. Pair it with the
[plugin](anthropic-plugin.md) after both are submitted.

## Fields

| Field | Limit | Copy |
| ----- | ----- | ---- |
| Server URL | HTTPS | `https://api.wavecxm.com/mcp` |
| Name | ≤100 | Wave CXM |
| One-liner | ≤200 | Short description from the [shared copy](README.md#shared-copy) |
| Description | ≤2,000 | Long description from the [shared copy](README.md#long-description), connector part only |
| Categories | 1–5 | Business & operations; Customer support; Marketing |
| Documentation URL | | https://github.com/Desquared/AI-Marketplace#use-the-mcp-server-directly |
| Privacy policy URL | | [TO BE COMPLETED: Wave CXM privacy policy URL] |
| Support contact | | https://github.com/Desquared/AI-Marketplace/issues |
| Icon | | `plugins/wave-cxm/assets/icon.png`. **Unverified:** the docs give no size. |
| Slug | permanent | `wave-cxm` |
| Use cases | | Example prompts 1–3 from the [shared copy](README.md#example-prompts) |

The category names above are a suggestion. **Unverified:** the portal's
category list is not published.

## Server requirements to confirm before submitting

These are the server's side of the contract. Confirm each against production:

- [ ] Every tool has a `title` and a `readOnlyHint` (all production tools are
      read-only). The portal flags tools missing either.
- [ ] Unauthenticated requests get `401` with
      `WWW-Authenticate: Bearer resource_metadata="https://api.wavecxm.com/.well-known/oauth-protected-resource"`.
- [ ] Client registration works through Client ID Metadata Documents or
      Dynamic Client Registration, with PKCE S256.
- [ ] `https://claude.ai/api/mcp/auth_callback` is an allowed redirect URI, and
      loopback `http://localhost:<port>/callback` and
      `http://127.0.0.1:<port>/callback` (any port) for Claude Code.
- [ ] Discovery, registration and token endpoints answer within 10 s; refresh
      within 30 s; an expired refresh token returns `invalid_grant`.

## Submit

[claude.ai/directory/manage](https://claude.ai/directory/manage) → **Submit
new** → **MCP connector**, then Connection, Tools, Listing, Use cases, Company,
Authentication, Data handling, Test & launch, Compliance, Review.

New connectors list as **Community**. For a **Verified** review, a reviewer
emails for a sandbox account: give them the reviewer account then, never in
the portal.

Screenshots are only for MCP Apps; Wave CXM needs none.

Sources: https://claude.com/docs/connectors/building/submission.md,
https://claude.com/docs/connectors/building/authentication.md,
https://claude.com/docs/connectors/building/review-criteria.md
