# Gemini CLI extensions gallery

The gallery indexes public repositories automatically. There is no form.

## What the repository already provides

- `gemini-extension.json` at the repository root, as the gallery requires,
  with both MCP servers declared through `httpUrl` (streamable HTTP).
- `GEMINI.md` at the root. It imports the plugin's rule and skills in place
  (`@./plugins/wave-cxm/...`), so there is nothing to keep in sync.

## To get listed

1. Make the repository public.
2. Add the `gemini-cli-extension` topic to it (repository **Settings** →
   **About** → **Topics**).
3. Tag a release (`wave-cxm-v<version>`). The gallery crawls daily.

Users install with:

```bash
gemini extensions install https://github.com/Desquared/AI-Marketplace
```

## Notes

- Gemini CLI loads skills only from an extension's own `skills/` folder, which
  the root does not have; `GEMINI.md` carries the skills as context instead.
  Hooks are not shipped to Gemini CLI.
- Consumer Gemini CLI was replaced by **Antigravity CLI** on 2026-06-18;
  Gemini Code Assist for enterprises is unaffected. Antigravity imports Claude
  Code plugins (`agy plugin import`), so Antigravity users can install from
  this marketplace directly. **Unverified:** how Antigravity's partner catalog
  takes submissions.
- The repository root can hold one extension. A second plugin would need its
  own repository to be listed in the gallery.

Sources: https://geminicli.com/docs/extensions/releasing/,
https://geminicli.com/docs/extensions/reference/,
https://geminicli.com/docs/tools/mcp-server/,
https://geminicli.com/docs/reference/memport/,
https://antigravity.google/docs/plugins
