import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { validateManifest, declaredPaths, PREFIXED_MANIFESTS, versionMismatch, VERSION_MANIFESTS, VERSION_CATALOGS } from './manifest-validate.js';
import { pluginDirs } from './plugin-dirs.js';

const repoRoot = path.join(import.meta.dirname, '..', '..');

test('validateManifest rejects a path field without the ./ prefix', () => {
  const problems = validateManifest('.claude-plugin/plugin.json', { skills: 'skills/' });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /skills "skills\/" must start with "\.\/"/);
});

test('validateManifest rejects a dotfile path that lacks the ./ prefix', () => {
  const problems = validateManifest('.codex-plugin/plugin.json', { mcpServers: '.mcp.json' });
  assert.equal(problems.length, 1);
});

test('validateManifest accepts ./-prefixed paths', () => {
  const problems = validateManifest('.codex-plugin/plugin.json', {
    skills: './skills/',
    hooks: './hooks/hooks.json',
    mcpServers: './.mcp.json',
  });
  assert.deepEqual(problems, []);
});

test('validateManifest accepts an array of ./-prefixed paths', () => {
  const problems = validateManifest('.claude-plugin/plugin.json', { skills: ['./a/', './b/'] });
  assert.deepEqual(problems, []);
});

test('validateManifest ignores inline non-string declarations', () => {
  const problems = validateManifest('.codex-plugin/plugin.json', {
    mcpServers: { some: { type: 'http', url: 'https://example.test/mcp' } },
  });
  assert.deepEqual(problems, []);
});

test('validateManifest leaves the root plugin.json alone', () => {
  const problems = validateManifest('plugin.json', { skills: 'skills/', mcpServers: '.mcp.json' });
  assert.deepEqual(problems, []);
});

test('every shipped plugin manifest satisfies its runtime schema', () => {
  const problems = [];

  for (const [plugin, dir] of pluginDirs(repoRoot)) {
    for (const manifest of PREFIXED_MANIFESTS) {
      const full = path.join(repoRoot, dir, manifest);
      if (!fs.existsSync(full)) continue;
      const json = JSON.parse(fs.readFileSync(full, 'utf8'));
      for (const p of validateManifest(manifest, json)) problems.push(`${plugin}/${p}`);

      for (const declared of declaredPaths(json)) {
        const target = path.join(repoRoot, dir, declared);
        if (!fs.existsSync(target)) {
          problems.push(`${plugin}/${manifest}: declares "${declared}" which does not exist`);
        }
      }
    }
  }

  assert.deepEqual(problems, [], `\n${problems.join('\n')}\n`);
});

test('every catalog entry points at a plugin folder', () => {
  const dirs = new Set([...pluginDirs(repoRoot).values()].map((d) => d.split(path.sep).join('/')));
  const catalogs = {
    '.claude-plugin/marketplace.json': (entry) => entry.source,
    '.github/plugin/marketplace.json': (entry) => entry.source,
    '.agents/plugins/marketplace.json': (entry) => entry.source.path,
    // Cursor resolves source against metadata.pluginRoot.
    '.cursor-plugin/marketplace.json': (entry, catalog) => path.posix.join(catalog.metadata.pluginRoot, entry.source),
  };
  const problems = [];

  for (const [file, folderOf] of Object.entries(catalogs)) {
    const catalog = JSON.parse(fs.readFileSync(path.join(repoRoot, file), 'utf8'));
    for (const entry of catalog.plugins) {
      const folder = path.posix.normalize(folderOf(entry, catalog));
      if (!dirs.has(folder)) problems.push(`${file}: ${entry.name} points at "${folder}", which is not a plugin folder`);
    }
  }

  assert.deepEqual(problems, [], `\n${problems.join('\n')}\n`);
});

test('versionMismatch passes when every source agrees', () => {
  assert.equal(versionMismatch({ 'plugin.json': '1.0.0', 'catalog:claude': '1.0.0' }), null);
});

test('versionMismatch passes for a single source', () => {
  assert.equal(versionMismatch({ 'plugin.json': '2.3.4' }), null);
});

test('versionMismatch reports a partial bump', () => {
  const drift = versionMismatch({
    'plugin.json': '1.0.1',
    '.claude-plugin/plugin.json': '1.0.1',
    'catalog:claude': '1.0.0',
  });
  assert.match(drift, /1\.0\.1 vs 1\.0\.0/);
  assert.match(drift, /catalog:claude=1\.0\.0/);
});

test('every plugin carries one consistent version across all of its sources', () => {
  const read = (f) => JSON.parse(fs.readFileSync(path.join(repoRoot, f), 'utf8'));
  const catalogs = VERSION_CATALOGS.map((f) => [f, read(f)]);
  const problems = [];

  for (const [plugin, dir] of pluginDirs(repoRoot)) {
    const versions = {};
    for (const manifest of VERSION_MANIFESTS) {
      const full = path.join(repoRoot, dir, manifest);
      if (!fs.existsSync(full)) continue;
      const { version } = JSON.parse(fs.readFileSync(full, 'utf8'));
      if (version !== undefined) versions[manifest] = version;
    }
    for (const [file, catalog] of catalogs) {
      const entry = catalog.plugins.find((p) => p.name === plugin);
      if (entry?.version !== undefined) versions[file] = entry.version;
    }
    const drift = versionMismatch(versions);
    if (drift) problems.push(`${plugin}: ${drift}`);
  }

  assert.deepEqual(problems, [], `\n${problems.join('\n')}\n`);
});
