import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  validateManifest,
  declaredPaths,
  PREFIXED_MANIFESTS,
  versionMismatch,
  VERSION_MANIFESTS,
  VERSION_CATALOGS,
  VERSION_ROOT_MANIFESTS,
  validateAgentPluginsManifest,
  validateAgentPluginsMcp,
  remoteServers,
  mcpDrift,
  validateServerJson,
  AGENT_PLUGINS_SCHEMA,
} from './manifest-validate.js';
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
    for (const file of VERSION_ROOT_MANIFESTS) {
      if (!fs.existsSync(path.join(repoRoot, file))) continue;
      const json = read(file);
      if (json.name === plugin && json.version !== undefined) versions[file] = json.version;
    }
    const drift = versionMismatch(versions);
    if (drift) problems.push(`${plugin}: ${drift}`);
  }

  assert.deepEqual(problems, [], `\n${problems.join('\n')}\n`);
});

// --- Agent Plugins, MCP dialects, Official MCP Registry ----------------------

const readJson = (...parts) => JSON.parse(fs.readFileSync(path.join(repoRoot, ...parts), 'utf8'));

test('validateAgentPluginsManifest rejects path fields and a missing $schema', () => {
  const problems = validateAgentPluginsManifest({ name: 'x', skills: 'skills/' });
  assert.equal(problems.length, 2);
});

test('validateAgentPluginsManifest accepts a minimal manifest', () => {
  assert.deepEqual(validateAgentPluginsManifest({ $schema: AGENT_PLUGINS_SCHEMA, name: 'wave-cxm', keywords: ['a-b'] }), []);
});

test('validateAgentPluginsMcp requires a type on each server', () => {
  const problems = validateAgentPluginsMcp({
    $schema: 'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json',
    mcpServers: { a: { url: 'https://example.test/mcp' } },
  });
  assert.equal(problems.length, 1);
});

test('mcpDrift compares servers across dialects', () => {
  const claude = { mcpServers: { a: { type: 'http', url: 'https://x.test/mcp' } } };
  assert.equal(mcpDrift('g', claude, { mcpServers: { a: { httpUrl: 'https://x.test/mcp' } } }), null);
  assert.match(mcpDrift('g', claude, { mcpServers: { a: { httpUrl: 'https://y.test/mcp' } } }), /differ/);
});

test('validateServerJson enforces the registry limits', () => {
  const problems = validateServerJson(
    { name: 'bad', description: 'x'.repeat(101), version: '1', remotes: [{ type: 'sse', url: 'https://z.test' }] },
    ['https://x.test/mcp'],
  );
  assert.equal(problems.length, 6);
});

test('every root plugin.json and mcp.json follows Agent Plugins 1.0.0', () => {
  const problems = [];
  for (const [plugin, dir] of pluginDirs(repoRoot)) {
    const full = path.join(repoRoot, dir, 'plugin.json');
    if (fs.existsSync(full)) for (const p of validateAgentPluginsManifest(readJson(dir, 'plugin.json'))) problems.push(`${plugin}/${p}`);
    if (fs.existsSync(path.join(repoRoot, dir, 'mcp.json'))) {
      for (const p of validateAgentPluginsMcp(readJson(dir, 'mcp.json'))) problems.push(`${plugin}/${p}`);
    }
  }
  assert.deepEqual(problems, [], `\n${problems.join('\n')}\n`);
});

test('every MCP dialect a plugin ships declares the same servers as .mcp.json', () => {
  const problems = [];
  for (const [plugin, dir] of pluginDirs(repoRoot)) {
    if (!fs.existsSync(path.join(repoRoot, dir, '.mcp.json'))) continue;
    const base = readJson(dir, '.mcp.json');
    if (fs.existsSync(path.join(repoRoot, dir, 'mcp.json'))) {
      const d = mcpDrift(`${plugin}/mcp.json`, base, readJson(dir, 'mcp.json'));
      if (d) problems.push(d);
    }
    for (const file of VERSION_ROOT_MANIFESTS) {
      if (!fs.existsSync(path.join(repoRoot, file)) || readJson(file).name !== plugin) continue;
      const d = mcpDrift(file, base, readJson(file));
      if (d) problems.push(d);
    }
  }
  assert.deepEqual(problems, [], `\n${problems.join('\n')}\n`);
});

test('Copilot hooks for Agent Plugins mirror hooks/hooks.json', () => {
  // Copilot CLI reads an Agent Plugins plugin's hooks from com.github.copilot/.
  const problems = [];
  for (const [plugin, dir] of pluginDirs(repoRoot)) {
    const copilot = path.join(repoRoot, dir, 'com.github.copilot', 'hooks', 'hooks.json');
    const hooks = path.join(repoRoot, dir, 'hooks', 'hooks.json');
    if (!fs.existsSync(copilot) && !fs.existsSync(hooks)) continue;
    if (!fs.existsSync(copilot) || !fs.existsSync(hooks) || !fs.readFileSync(copilot).equals(fs.readFileSync(hooks))) {
      problems.push(`${plugin}: com.github.copilot/hooks/hooks.json must be a byte-identical copy of hooks/hooks.json`);
    }
  }
  assert.deepEqual(problems, []);
});

test('every Cursor manifest matches its catalog entry and its paths exist', () => {
  const catalog = readJson('.cursor-plugin', 'marketplace.json');
  const problems = [];
  for (const [plugin, dir] of pluginDirs(repoRoot)) {
    const file = path.join(repoRoot, dir, '.cursor-plugin', 'plugin.json');
    if (!fs.existsSync(file)) continue;
    const json = readJson(dir, '.cursor-plugin', 'plugin.json');
    if (json.name !== plugin) problems.push(`${plugin}: .cursor-plugin/plugin.json name is "${json.name}"`);
    if (!catalog.plugins.some((e) => e.name === plugin)) problems.push(`${plugin}: missing from .cursor-plugin/marketplace.json`);
    for (const field of ['logo', 'rules', 'skills', 'agents', 'commands', 'hooks', 'mcpServers']) {
      const value = json[field];
      if (typeof value !== 'string') continue;
      if (path.isAbsolute(value) || value.split('/').includes('..')) problems.push(`${plugin}: Cursor ${field} "${value}" must stay inside the plugin`);
      else if (!fs.existsSync(path.join(repoRoot, dir, value))) problems.push(`${plugin}: Cursor ${field} "${value}" does not exist`);
    }
  }
  assert.deepEqual(problems, [], `\n${problems.join('\n')}\n`);
});

test('every listing asset a manifest names exists', () => {
  const problems = [];
  for (const [plugin, dir] of pluginDirs(repoRoot)) {
    const claude = readJson(dir, '.claude-plugin', 'plugin.json');
    if (claude.icon && !fs.existsSync(path.join(repoRoot, dir, claude.icon))) problems.push(`${plugin}: icon ${claude.icon} missing`);
    const codexFile = path.join(repoRoot, dir, '.codex-plugin', 'plugin.json');
    if (!fs.existsSync(codexFile)) continue;
    const ui = readJson(dir, '.codex-plugin', 'plugin.json').interface ?? {};
    for (const key of ['composerIcon', 'composerIconDark', 'logo', 'logoDark']) {
      if (ui[key] && !fs.existsSync(path.join(repoRoot, dir, ui[key]))) problems.push(`${plugin}: interface.${key} ${ui[key]} missing`);
    }
    if (ui.shortDescription && ui.shortDescription.length > 30) problems.push(`${plugin}: interface.shortDescription is over 30 characters`);
    if (ui.displayName && ui.displayName.length > 30) problems.push(`${plugin}: interface.displayName is over 30 characters`);
  }
  assert.deepEqual(problems, [], `\n${problems.join('\n')}\n`);
});

test('every server.json satisfies the Official MCP Registry rules', () => {
  const problems = [];
  for (const [plugin, dir] of pluginDirs(repoRoot)) {
    if (!fs.existsSync(path.join(repoRoot, dir, 'server.json'))) continue;
    const urls = Object.values(remoteServers(readJson(dir, '.mcp.json')));
    for (const p of validateServerJson(readJson(dir, 'server.json'), urls)) problems.push(`${plugin}/${p}`);
  }
  assert.deepEqual(problems, [], `\n${problems.join('\n')}\n`);
});
