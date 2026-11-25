# OpenAI plugin directory

Reaches ChatGPT and Codex. OpenAI takes an uploaded **ZIP**, not a repository
link, and refuses one that contains lifecycle hooks.

## Build the archive

```bash
node bin/package-openai.js wave-cxm \
  --privacy "<privacy policy URL>" --terms "<terms of service URL>"
```

It writes `build/wave-cxm-<version>-openai.zip`: the plugin folder without
`hooks/`, without `com.github.copilot/`, and without the `hooks` field in
`.codex-plugin/plugin.json`, with the two URLs added to its `interface`. The
plugin's skills restate the stage write guard, so nothing is lost.

## Fields

Taken from `.codex-plugin/plugin.json` → `interface`:

| Field | Limit | Value |
| ----- | ----- | ----- |
| `displayName` | ≤30 | Wave CXM |
| `shortDescription` | ≤30 | Verify Wave CXM loyalty config |
| `longDescription` | ≤4,000 | See the manifest |
| `developerName` | ≤80 | Desquared (replaced by the verified developer identity) |
| `category` | enum | Business & Operations |
| `capabilities` | ≤20 | Read, Write |
| `websiteURL` | HTTPS | https://go.wavecxm.com |
| `supportURL` | HTTPS | https://github.com/Desquared/AI-Marketplace/issues |
| `privacyPolicyURL` | HTTPS | Added by the packaging script |
| `termsOfServiceURL` | HTTPS | Added by the packaging script |
| `defaultPrompt` | ≤3 × 128 | Example prompts 1–3 |
| `brandColor` / `brandColorDark` | `#RRGGBB` | `#1E2F3F` / `#E7584A` |
| `composerIcon`, `logo` | square, ≥48 px | `./assets/icon.png` |

## Submit

1. [platform.openai.com/plugins](https://platform.openai.com/plugins) →
   **Upload new or existing plugin**. Needs an organization owner or the Apps
   Management Write permission, and individual or business verification.
2. Choose **With MCP** and enter `https://api.wavecxm.com/mcp`.
3. Upload the ZIP.
4. Provide **5 positive and 3 negative test cases** for MCP review, for
   example:
   - Positive: list tenants; map a tenant; verify a campaign; find recent
     changes to a rule; list active contests.
   - Negative: ask to change production configuration (refused: no write
     tools); ask about a tenant the account cannot access (empty, explained);
     ask for another user's data (refused by the server's scoping).
5. Give the reviewer account when asked.

Sources: https://developers.openai.com/plugins/deploy/submission.md,
https://developers.openai.com/plugins/deploy/submission-errors.md,
https://developers.openai.com/codex/plugins/build.md
