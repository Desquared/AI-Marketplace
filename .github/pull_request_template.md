## Summary

<!-- What changed, and what should reviewers focus on? -->

## Changed Surfaces

- [ ] Skills
- [ ] Hooks
- [ ] MCP configuration
- [ ] Plugin manifests or marketplace catalogs
- [ ] License
- [ ] README or docs
- [ ] CI or repository tooling

## Validation

- [ ] `node --test bin/lib/*.test.js`
- [ ] `node bin/build-cursor-rules.js --check`
- [ ] Skill command names match `name:` frontmatter
- [ ] README/docs links were checked

## Public Repository Checklist

- [ ] No internal links, real tenant names or ids, customer data, or credentials.
- [ ] Every plugin folder carries a byte-identical copy of `LICENSE.md`, and every manifest declares `LicenseRef-Desquared-Proprietary`.
- [ ] Compatibility was checked for Claude Code, GitHub Copilot CLI, Codex and Cursor.

## Notes For Reviewers

<!-- Risks, rollout notes, or intentionally deferred checks. -->
