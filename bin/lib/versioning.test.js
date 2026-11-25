import { test } from 'node:test';
import assert from 'node:assert/strict';
import { releaseLevel, bumpVersion, setJsonVersion, changedPlugins } from './versioning.js';

test('releaseLevel reads the conventional PR title', () => {
  assert.equal(releaseLevel('feat(wave-cxm): add a skill', []), 'minor');
  assert.equal(releaseLevel('feat(wave-cxm, other)!: move a skill', []), 'major');
  assert.equal(releaseLevel('fix(wave-cxm): typo', []), 'patch');
  assert.equal(releaseLevel('docs: reword', []), 'patch');
  assert.equal(releaseLevel('refactor: BREAKING CHANGE to hooks', []), 'major');
});

test('a release label overrides the title, and the biggest label wins', () => {
  assert.equal(releaseLevel('feat: x', ['release:none']), 'none');
  assert.equal(releaseLevel('fix: x', ['bug', 'release:patch', 'release:major']), 'major');
  assert.equal(releaseLevel('fix: x', ['release:huge']), 'patch');
});

test('bumpVersion resets the lower parts', () => {
  assert.equal(bumpVersion('1.26.3', 'patch'), '1.26.4');
  assert.equal(bumpVersion('1.26.3', 'minor'), '1.27.0');
  assert.equal(bumpVersion('1.26.3', 'major'), '2.0.0');
  assert.equal(bumpVersion('1.26.3', 'none'), '1.26.3');
});

test('bumpVersion advances a prerelease counter instead of releasing it', () => {
  assert.equal(bumpVersion('0.11.0-beta.1', 'patch'), '0.11.0-beta.2');
  assert.equal(bumpVersion('0.11.0-beta.9', 'major'), '0.11.0-beta.10');
  assert.equal(bumpVersion('1.0.0-rc', 'minor'), '1.0.0-rc.1');
  assert.equal(bumpVersion('1.0.0-alpha.1+build.5', 'patch'), '1.0.0-alpha.2');
  assert.equal(bumpVersion('0.11.0-beta.1', 'none'), '0.11.0-beta.1');
});

test('bumpVersion rejects what it cannot bump, instead of writing NaN', () => {
  assert.throws(() => bumpVersion('1.2', 'patch'), /not a MAJOR.MINOR.PATCH/);
  assert.throws(() => bumpVersion('v1.2.3', 'patch'), /not a MAJOR.MINOR.PATCH/);
  assert.throws(() => bumpVersion('1.2.3', 'huge'), /unknown release level/);
});

test('setJsonVersion edits only the located field and keeps the formatting', () => {
  const text = '{\n  "plugins": [\n    { "name": "a", "version": "1.0.0", "x": { "version": "9" } },\n    { "name": "b", "version": "1.0.0" }\n  ]\n}\n';
  const out = setJsonVersion(text, (j) => j.plugins.find((p) => p.name === 'b'), '1.1.0');
  assert.equal(out, text.replace('"name": "b", "version": "1.0.0"', '"name": "b", "version": "1.1.0"'));
  assert.equal(setJsonVersion(text, (j) => j.plugins[0], '1.0.0'), text);
  assert.throws(() => setJsonVersion('{"name":"c"}', (j) => j, '1.0.0'), /no "version" field/);
});

test('changedPlugins maps a generator source change to all of its plugins', () => {
  const plugins = new Map([
    ['wave-cxm', 'plugins/wave-cxm'],
    ['a-kit', 'plugins/gen/dist/a-kit'],
    ['b-kit', 'plugins/gen/dist/b-kit'],
  ]);
  assert.deepEqual(changedPlugins(['plugins/wave-cxm/skills/x/SKILL.md', 'README.md'], plugins), ['wave-cxm']);
  assert.deepEqual(
    changedPlugins(['plugins/gen/dist/b-kit/skills/x/SKILL.md'], plugins),
    ['b-kit'],
  );
  assert.deepEqual(
    changedPlugins(['plugins/gen/skills/storybook/SKILL.md'], plugins),
    ['a-kit', 'b-kit'],
  );
  assert.deepEqual(changedPlugins(['plugins/gen/dist/notes.md'], plugins), []);
});
