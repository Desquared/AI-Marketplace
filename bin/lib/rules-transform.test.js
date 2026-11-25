import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseFrontmatter,
  stripFrontmatter,
  firstHeading,
  deriveDescription,
  isAlwaysOn,
  toCursorMdc,
  toWindsurfRule,
  toCopilotInstructions,
  rewriteSkillLinks,
} from './rules-transform.js';

const WITH_FM = `---
name: ios-code-review
description: Code Review Checklist for iOS.
---

# Code Review Checklist

- Memory: No retain cycles
`;

const NO_FM = `# Security Best Practices

Use the Keychain.
`;

test('parseFrontmatter reads key/value pairs', () => {
  const fm = parseFrontmatter(WITH_FM);
  assert.equal(fm.name, 'ios-code-review');
  assert.equal(fm.description, 'Code Review Checklist for iOS.');
});

test('parseFrontmatter returns {} when no frontmatter', () => {
  assert.deepEqual(parseFrontmatter(NO_FM), {});
});

test('stripFrontmatter removes the frontmatter block', () => {
  const body = stripFrontmatter(WITH_FM);
  assert.ok(!body.includes('name: ios-code-review'));
  assert.ok(body.includes('# Code Review Checklist'));
});

test('stripFrontmatter is a no-op without frontmatter', () => {
  assert.equal(stripFrontmatter(NO_FM), NO_FM);
});

test('firstHeading extracts the first H1', () => {
  assert.equal(firstHeading(NO_FM), 'Security Best Practices');
});

test('deriveDescription prefers frontmatter description', () => {
  assert.equal(deriveDescription(WITH_FM), 'Code Review Checklist for iOS.');
});

test('deriveDescription falls back to first heading', () => {
  assert.equal(deriveDescription(NO_FM), 'Security Best Practices.');
});

test('isAlwaysOn is true only for the listed always-on rules', () => {
  assert.equal(isAlwaysOn('shared-ai-safeguards'), true);
  assert.equal(isAlwaysOn('project-constitution'), true);
  assert.equal(isAlwaysOn('security-privacy'), true);
  assert.equal(isAlwaysOn('ios-code-review'), false);
});

test('toCursorMdc emits .mdc frontmatter with description and alwaysApply', () => {
  const out = toCursorMdc('ios-code-review', WITH_FM);
  assert.ok(out.startsWith('---\n'));
  assert.ok(out.includes('description: Code Review Checklist for iOS.'));
  assert.ok(out.includes('alwaysApply: false'));
  assert.ok(out.includes('# Code Review Checklist'));
  // original frontmatter must not survive into the body
  assert.ok(!out.includes('name: ios-code-review'));
});

test('toCursorMdc marks shared-ai-safeguards alwaysApply true', () => {
  const out = toCursorMdc('shared-ai-safeguards', NO_FM);
  assert.ok(out.includes('alwaysApply: true'));
});

test('toWindsurfRule emits a trigger field', () => {
  assert.ok(toWindsurfRule('ios-code-review', WITH_FM).includes('trigger: model_decision'));
  assert.ok(toWindsurfRule('shared-ai-safeguards', NO_FM).includes('trigger: always_on'));
});

test('toCopilotInstructions returns the content unchanged', () => {
  assert.equal(toCopilotInstructions(WITH_FM), WITH_FM);
});

test('deriveDescription preserves a multi-sentence frontmatter description in full', () => {
  const multi = `---\nname: ios-security-reviewer\ndescription: iOS security specialist for code auditing. Use proactively before commits.\n---\n\n# Security\n`;
  const d = deriveDescription(multi);
  assert.ok(d.includes('Use proactively before commits.'), 'second sentence must survive');
  assert.ok(toCursorMdc('ios-security-reviewer', multi).includes('Use proactively before commits.'));
});

test('rewriteSkillLinks points a sibling reference at its own rule', () => {
  const out = rewriteSkillLinks('Detail: [patterns.md](patterns.md).', 'ax');
  assert.equal(out, 'Detail: the `ax-patterns` rule.');
});

test('rewriteSkillLinks keeps descriptive link text', () => {
  const out = rewriteSkillLinks('See [the kit](figma-tooling.md).', 'ax');
  assert.equal(out, 'See the kit (see the `ax-figma-tooling` rule).');
});

test('rewriteSkillLinks leaves external and parent links alone', () => {
  const src = '[x](https://e.com/a.md) and [y](../other.md)';
  assert.equal(rewriteSkillLinks(src, 'ax'), src);
});

test('a SKILL.md converts to a description-selected Cursor rule', () => {
  const skill = '---\nname: ax\ndescription: Check labels.\n---\n\n# Ax\n\nBody.\n';
  const out = toCursorMdc('ax', skill);
  assert.match(out, /^---\ndescription: Check labels\.\nglobs:\nalwaysApply: false\n---\n/);
  assert.match(out, /# Ax/);
  assert.doesNotMatch(out, /name: ax/);
});
