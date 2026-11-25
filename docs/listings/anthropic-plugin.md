# Anthropic directory — plugin

Reaches Claude Code and claude.ai. Submit together with the
[MCP connector](anthropic-connector.md) and pair them.

## What the repository already provides

- `plugins/wave-cxm/.claude-plugin/plugin.json` with `displayName`, `icon`,
  `homepage`, `documentationUrl`, `supportUrl`, `privacyPolicyUrl`,
  `termsOfServiceUrl`, `keywords` and `network.hosts`.
- A README of more than 40 words that discloses every host the plugin reaches
  and what its hooks run.
- `LICENSE.md` in the plugin folder.

Check it with `claude plugin validate plugins/wave-cxm`. Today it passes with
two warnings: the privacy and terms URLs are placeholders.

## Submit

1. [claude.ai/directory/manage](https://claude.ai/directory/manage) → **Submit
   new** → **Plugin bundle**. Needs a paid plan; on Team or Enterprise, an
   Owner or a member with the Directory permission.
2. **Source:** repository `Desquared/AI-Marketplace`, plugin path
   `plugins/wave-cxm`, branch `main`.
3. **Listing details:** read from `plugin.json` and the README. Check the
   icon: it is taken only on the first save.
4. **Data handling:** the plugin sends tool calls and the user's OAuth token to
   `api.wavecxm.com` and `stage.api.wavecxm.com`; it stores nothing locally.
5. **Compliance:** contact `raikos@thinkdesquared.com`, four acknowledgements.
6. **Updates:** choose the GitHub push webhook so `main` reaches the listing.

## Reviewer notes

- Production has no write tools; stage writes are allow-listed by the server
  and `delete_entity` fails without `confirm: true`.
- The two hooks are non-blocking `printf` reminders on the three stage write
  tools. They run no script file.
- Sign-in is OAuth discovered from the server's 401 challenge. A reviewer
  account is available on request.

## Risks

- The checklist blocks hook commands that run "an inline program". Our hooks
  run `printf` with a fixed string; `claude plugin validate` does not flag
  them, but the reviewer may. **Unverified** until review.

Sources: https://claude.com/docs/plugins/submit.md,
https://claude.com/docs/plugins/pre-submission-checklist.md,
https://code.claude.com/docs/en/plugins-reference
