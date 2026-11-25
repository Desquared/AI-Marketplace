# Wave CXM Plugin

Connects your AI assistant to the [Wave CXM](https://go.wavecxm.com) loyalty platform and adds the workflows that make the connector genuinely useful: verifying configuration before it goes live, diagnosing why something misbehaved, getting oriented in an unfamiliar tenant, and building configuration on stage.

Serves engineers working in the Wave CXM codebase and product, support, CS and onboarding teams using the assistant as a read-only console over their own tenants.

## Install

```bash
claude plugin marketplace add Desquared/AI-Marketplace
claude plugin install wave-cxm@desquared
```

Then reload: `/reload-plugins`, or restart the session so the MCP servers register.

## Authenticate

The plugin ships two connectors and **no credentials**. Each one signs you in itself the first time it is used: your assistant opens a browser, you sign in to Wave CXM, then choose which tenants and permissions to grant.

Three things worth knowing:

- **Sign-in must happen in an interactive session.** A non-interactive or headless run cannot complete the browser flow.
- **Each connector authenticates separately.** Granting access to stage does not grant production.
- **Consent is per tenant and per permission, and revocable** any time from **Authorized apps** in Wave CXM.

You never create, paste or store an API key.

## The two connectors

| Connector | Environment | What it can do |
|:----------|:------------|:---------------|
| `wave-cxm` | production | Read only. The write tools **do not exist** on this connector. |
| `wave-cxm-stage` | stage | Read and write, plus the product user guide. |

Two consequences that matter more than they look:

**Production cannot be written to.** Not by policy — the tools are absent. Nothing you or the assistant can do will change configuration on production through this plugin.

**A tenant id does not tell you which environment you are in.** The same tenant can exist on both connectors with the same id and completely different data. Only the connector disambiguates, which is why every skill prints its environment and tenant in the output header.

Every request is scoped to the tenant you name and to what your own role allows — the assistant sees exactly what you would see in the admin panel, and nothing else. Archived records are never returned.

## The skills

| Skill | Reach for it when |
|:------|:------------------|
| `verify-config` | Something is about to go live and you want to know it is right. Prospective; inspects configuration only. |
| `diagnose-issue` | Something already misbehaved and you need the cause. Retrospective; reads what actually happened. |
| `tenant-map` | You are new to a tenant and need to know what is in it — including what your permissions hide. |
| `author-config` | You want to create, change or remove configuration. Stage only. |

They are description-triggered, so you can just describe the problem. Invoke one by name when you want to be explicit:

```
/wave-cxm:verify-config the Summer 2026 campaign
```

A fifth skill, `wave-cxm-context`, is internal. It holds the access patterns every other skill follows and is not invoked directly.

## Verify the connection

Ask:

> Which Wave CXM tenants can I act on?

You should get your tenants with your permissions in each. Then:

> Give me a map of the Acme tenant.

Replace `Acme` with one of the tenants the previous answer listed.

## Troubleshooting

**No sign-in prompt, or the browser never opens.** The client may have cached an earlier connection. Restart it fully and re-authenticate, or remove and re-add the connector. Sign-in begins when the server answers with a challenge; a client that cannot follow that challenge reports a plain `Unauthorized` instead of opening a browser.

**`Unauthorized` after it was working.** The sign-in expired or was revoked. Re-authenticate the connector.

**"Method not allowed", or the connection stalls.** The connector is stateless and accepts `POST` only. A client configured for the older SSE transport will not connect — use the HTTP transport.

**Empty results.** Either there are no matching records, or your role cannot view that record type. The skills check the permission and tell you which — but if you are querying the MCP directly, check your permissions from `list_tenants` before concluding the data is missing.

**The consent screen offers nothing to grant.** You have no permissions in any tenant on that environment, or you are signed in with the wrong account.

## What the plugin runs, sends and fetches

- **Network.** The plugin connects to two endpoints and nothing else: `https://api.wavecxm.com/mcp` (production) and `https://stage.api.wavecxm.com/mcp` (stage). Your assistant sends them the tool calls it decides to make, with their arguments (tenant, record type, filters, and for stage writes the fields being set). Sign-in goes through the Wave CXM OAuth flow in your browser.
- **Local commands.** The only hooks print a fixed reminder before and after the three stage write tools. They run no scripts, read no files and make no network calls.
- **Skills and rules.** Plain instructions to the assistant. They contain no code and no credentials.
- **No telemetry.** The plugin itself collects nothing, stores nothing and sends nothing to Desquared beyond the MCP calls above.

## Privacy and data

The plugin is a client. The data it reaches lives in the Wave CXM service, which processes it as described in the Wave CXM privacy policy: [TO BE COMPLETED: Wave CXM privacy policy URL]. That policy covers what the MCP servers log, how long they keep it, and how to ask for deletion.

- **Your sign-in** gives the assistant your own role in the tenants you choose, and nothing more. Revoke it any time from **Authorized apps** in Wave CXM.
- **Tool results enter your AI client.** Whatever the MCP servers return is placed in the assistant's context and handled by your AI client provider under that provider's own terms and privacy policy, not Desquared's. Check them before querying personal data.
- **Personal data.** Loyalty records can include members' personal data. Query only what the task needs, and follow your organisation's data-protection rules for what you paste or keep.

Use of the Wave CXM service is governed by its terms of service: [TO BE COMPLETED: Wave CXM terms of service URL].

## Support

- **Help with the plugin or the service:** [TO BE COMPLETED: support contact address or URL]
- **Bugs in the plugin:** open an issue in this repository.
- **Security vulnerabilities:** report privately as described in [SECURITY.md](../../SECURITY.md). Never in a public issue.

## Trademarks

Wave CXM is a Desquared product; see the [license](LICENSE.md) (Section 6) for use of its names and logos. Claude, Claude Code, ChatGPT, Codex, GitHub Copilot, Cursor, Kiro, Gemini, Cline and other product names are trademarks of their respective owners. They are used here only to say which clients the plugin works with, and their use implies no affiliation with or endorsement by those owners.

## License

Copyright © 2026 Desquared. All rights reserved. Use is governed by the [Desquared Proprietary License](LICENSE.md): you may install and run the plugin as published, but not modify or redistribute it. The hosted Wave CXM service is governed by the Wave CXM terms of service.
