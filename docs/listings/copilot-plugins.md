# copilot-plugins

`github/copilot-plugins` is GitHub's own plugin marketplace. It is **no longer
a default** in Copilot CLI: users must register it. Every external plugin it
lists today comes from GitHub or Microsoft, and its CONTRIBUTING.md describes
no route for third parties. **Unverified:** whether it accepts outside plugins.
awesome-copilot is the documented route and reaches more users; ask GitHub
before spending effort here.

If GitHub agrees, the entry in its `.github/plugin/marketplace.json` takes
this shape:

```json
{
  "name": "wave-cxm",
  "description": "Wave CXM loyalty platform integration: a read-only production connector, a read/write stage connector, and skills to verify, diagnose, map and author loyalty configuration.",
  "version": "<version>",
  "author": { "name": "Desquared", "url": "https://github.com/Desquared" },
  "homepage": "https://go.wavecxm.com",
  "keywords": ["wave-cxm", "loyalty", "customer-experience", "cxm", "mcp", "campaigns", "coupons", "rewards", "contests", "configuration"],
  "license": "LicenseRef-Desquared-Proprietary",
  "repository": "https://github.com/Desquared/AI-Marketplace",
  "source": { "source": "github", "repo": "Desquared/AI-Marketplace", "path": "plugins/wave-cxm" }
}
```

Sources: https://github.com/github/copilot-plugins/blob/main/CONTRIBUTING.md,
https://docs.github.com/en/enterprise-cloud@latest/copilot/reference/copilot-cli-reference/cli-plugin-reference
