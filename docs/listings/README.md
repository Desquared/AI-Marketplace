# Listing kit

Ready-to-paste listing copy for every channel that carries Wave CXM. Each
channel file holds the fields that channel asks for, its limits, the steps to
submit, and notes for its reviewers. Facts are sourced from each channel's own
documentation as of 2026-11-25; anything that could not be confirmed is marked
**Unverified**.

Nothing here is submitted automatically. Submitting is a manual step for a
Desquared account holder.

## Shared copy

Use these everywhere unless a channel file says otherwise.

| Field | Copy |
| ----- | ---- |
| Name | Wave CXM |
| Publisher | Desquared |
| Tagline (≤30) | Verify Wave CXM loyalty config |
| One-liner (≤100) | Read-only access to Wave CXM loyalty tenants: campaigns, rules, rewards, coupons, contests. |
| Short description (≤200) | Verify, diagnose and map Wave CXM loyalty configuration from your AI assistant, with a read-only production connector and a read/write stage connector. |
| Website | https://go.wavecxm.com |
| Repository | https://github.com/Desquared/AI-Marketplace |
| Plugin folder | `plugins/wave-cxm` |
| Production MCP server | `https://api.wavecxm.com/mcp` (streamable HTTP, OAuth, read-only) |
| Support | https://github.com/Desquared/AI-Marketplace/issues |
| Privacy policy | [TO BE COMPLETED: Wave CXM privacy policy URL] |
| Terms of service | [TO BE COMPLETED: Wave CXM terms of service URL] |
| Contact email | raikos@thinkdesquared.com |
| Keywords | wave-cxm, loyalty, customer-experience, cxm, mcp, campaigns, coupons, rewards, contests, configuration |
| Icon | [`plugins/wave-cxm/assets/icon.png`](../../plugins/wave-cxm/assets/icon.png) (512×512) |
| Square logo | [`plugins/wave-cxm/assets/logo-400.png`](../../plugins/wave-cxm/assets/logo-400.png) (400×400) |
| Wordmark | [`plugins/wave-cxm/assets/logo.png`](../../plugins/wave-cxm/assets/logo.png) |

### Long description

> Wave CXM connects your AI assistant to the Wave CXM customer-experience and
> loyalty platform, so you can work with campaigns, rules, reward schemes,
> redemption options, coupon groups and contests in conversation.
>
> Ask which tenants you can act on, get a one-page map of a tenant (what
> exists, what is live, what changed recently and what your permissions hide),
> check that a campaign is configured as intended before it goes live, or find
> out why a rule did not fire from the records of what actually happened.
>
> The production connector is read-only: its write tools do not exist. Every
> request is scoped to the tenants and permissions you grant when you sign in
> with OAuth, so the assistant sees exactly what you would see in the Wave CXM
> admin panel. There is no API key to create or store, and consent is
> revocable at any time from Authorized apps in Wave CXM.

The plugin form adds a stage connector that also accepts allow-listed writes,
skills for verification, diagnosis, tenant mapping and guided authoring, and a
reminder hook on stage writes. Add this paragraph for plugin channels:

> The plugin adds a stage connector for building and changing configuration
> safely before it reaches customers, and four skills: verify-config,
> diagnose-issue, tenant-map and author-config.

### Example prompts

1. Which Wave CXM tenants can I act on?
2. Give me a map of the Acme tenant.
3. Verify the Summer 2026 campaign before it goes live.
4. Why didn't the birthday reward rule fire for customer 1042 yesterday?
5. Which contests in the Acme tenant ended last month without awarding anything?

## Channels

| Channel | Form | File |
| ------- | ---- | ---- |
| Anthropic directory | Plugin | [anthropic-plugin.md](anthropic-plugin.md) |
| Anthropic directory | MCP connector | [anthropic-connector.md](anthropic-connector.md) |
| OpenAI plugin directory | Plugin | [openai.md](openai.md) |
| awesome-copilot | Plugin | [awesome-copilot.md](awesome-copilot.md) |
| copilot-plugins | Plugin | [copilot-plugins.md](copilot-plugins.md) |
| Cursor Marketplace | Plugin | [cursor.md](cursor.md) |
| Gemini CLI extensions gallery | Plugin | [gemini-cli.md](gemini-cli.md) |
| Kiro powers | Plugin | [kiro.md](kiro.md) |
| Official MCP Registry | MCP | [mcp-registry.md](mcp-registry.md) |
| GitHub MCP Registry | MCP | [github-mcp-registry.md](github-mcp-registry.md) |
| Cline MCP Marketplace | MCP | [cline.md](cline.md) |
| Smithery | MCP | [smithery.md](smithery.md) |
| mcp.so | MCP | [mcp-so.md](mcp-so.md) |

Screenshots are planned in [screenshots.md](screenshots.md).

## Before any submission

- Replace every `[TO BE COMPLETED: …]` above and in the plugin manifests.
- Replace `plugins/wave-cxm/assets/icon.png` with an export from the vector
  master, 1024 px or larger. Anthropic's directory takes the icon only on the
  first save.
- Merge to `main` and tag the release (`git tag wave-cxm-v<version>`): several
  channels pin a tag or commit.
- Make the repository public. Every channel reads it.
- Have a reviewer account ready: a Wave CXM login with access to a sandbox
  tenant that holds sample data. Never put its credentials in a listing form;
  give them to the reviewer when asked.
