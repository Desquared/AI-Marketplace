# Screenshot plan

No directory in scope requires screenshots for Wave CXM. Anthropic asks for
them only for MCP Apps, and OpenAI does not document a screenshots field. The
READMEs use the [two-connector diagram](../../plugins/wave-cxm/assets/connectors.svg)
instead.

If Desquared wants screenshots for README galleries or optional listing
fields, capture these from real sessions against a sandbox tenant. Never use a
customer tenant, and redact every tenant name and id that is not a placeholder
such as `Acme`.

| # | Shows | Prompt | Size |
| - | ----- | ------ | ---- |
| 1 | Sign-in and tenant consent | Which Wave CXM tenants can I act on? | 1600×1000 PNG |
| 2 | Tenant map with the permission-gap section | Give me a map of the Acme tenant. | 1600×1000 PNG |
| 3 | Pre-launch verification with findings | Verify the Summer 2026 campaign before it goes live. | 1600×1000 PNG |
| 4 | Diagnosis from event history | Why didn't the birthday rule fire for customer 1042? | 1600×1000 PNG |
| 5 | Guided stage write with the confirmation step | Create a coupon group on stage for Acme. | 1600×1000 PNG |

1600×1000 meets Anthropic's MCP Apps minimum width of 1000 px. Save them to
`plugins/wave-cxm/assets/screenshots/` and show them in the README with
Markdown image syntax, which Anthropic's directory checklist requires.
