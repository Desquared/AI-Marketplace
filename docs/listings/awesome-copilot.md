# awesome-copilot

Reaches Copilot CLI, where awesome-copilot is the built-in default
marketplace, and VS Code. External plugins are listed through an issue form,
not a pull request: a maintainer's `/approve` makes automation open the PR.

## Requirements the repository meets

- `plugins/wave-cxm/plugin.json` is an Agent Plugins 1.0.0 manifest. It is a
  blocking quality gate: legacy manifests are not a fallback.
- Skills under `skills/<name>/SKILL.md` with `name` and `description`
  frontmatter (`vally lint`).
- Lowercase-hyphenated keywords; HTTPS GitHub repository URL.
- The proprietary license is accepted with a warning.

## Issue form answers

Open the **external plugin** issue form on
[github/awesome-copilot](https://github.com/github/awesome-copilot/issues/new/choose).

| Field | Answer |
| ----- | ------ |
| Name | `wave-cxm` |
| Description | Plugin description from `plugins/wave-cxm/plugin.json` |
| Repository | `Desquared/AI-Marketplace` |
| Plugin path | `plugins/wave-cxm` |
| Ref | `wave-cxm-v<version>` (a release tag, not a branch) |
| SHA | the full 40-character commit the tag points at |
| Version | the version in `plugins/wave-cxm/plugin.json` |
| License | `LicenseRef-Desquared-Proprietary` |
| Author | Desquared, https://github.com/Desquared |
| Homepage | https://go.wavecxm.com |
| Keywords | from the manifest |

Tick: repository is public; ref is immutable; follows policy; not a duplicate.

## Resulting entry

For reference, the entry automation adds to `plugins/external.json`. Fill the
two release values first:

```json
{
  "name": "wave-cxm",
  "description": "Wave CXM loyalty platform integration: a read-only production connector, a read/write stage connector, and skills to verify, diagnose, map and author loyalty configuration.",
  "version": "<version>",
  "author": { "name": "Desquared", "url": "https://github.com/Desquared" },
  "repository": "https://github.com/Desquared/AI-Marketplace",
  "homepage": "https://go.wavecxm.com",
  "license": "LicenseRef-Desquared-Proprietary",
  "keywords": ["wave-cxm", "loyalty", "customer-experience", "cxm", "mcp", "campaigns", "coupons", "rewards", "contests", "configuration"],
  "source": {
    "source": "github",
    "repo": "Desquared/AI-Marketplace",
    "path": "plugins/wave-cxm",
    "ref": "wave-cxm-v<version>",
    "sha": "<40-character commit sha>"
  }
}
```

A listing pins one tag, so each release needs the issue updated with the new
ref and SHA. **Unverified:** whether awesome-copilot follows newer tags on its
own.

Sources: https://github.com/github/awesome-copilot/blob/main/CONTRIBUTING.md,
https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/plugins-finding-installing
