# Wave CXM

This extension connects Gemini CLI to the [Wave CXM](https://go.wavecxm.com)
loyalty platform through two MCP servers:

- `wave-cxm` — production, read-only. Its write tools do not exist.
- `wave-cxm-stage` — stage, read and write, plus the product user guide.

Each server signs you in with OAuth the first time it is used, scoped to the
tenants and permissions you grant. The instructions below are the Wave CXM
plugin's rule and skills, imported from
[`plugins/wave-cxm/`](plugins/wave-cxm/README.md). Follow them whenever a
request involves Wave CXM.

@./plugins/wave-cxm/rules/wave-cxm-environments.md

@./plugins/wave-cxm/skills/wave-cxm-context/SKILL.md

@./plugins/wave-cxm/skills/verify-config/SKILL.md

@./plugins/wave-cxm/skills/diagnose-issue/SKILL.md

@./plugins/wave-cxm/skills/tenant-map/SKILL.md

@./plugins/wave-cxm/skills/author-config/SKILL.md
