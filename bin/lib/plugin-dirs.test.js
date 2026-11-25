import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pluginDirs } from './plugin-dirs.js';

test('pluginDirs lists the plugins in this repository', () => {
  const dirs = pluginDirs(path.join(import.meta.dirname, '..', '..'));
  assert.equal(dirs.get('wave-cxm'), path.join('plugins', 'wave-cxm'));
});

test('pluginDirs lists generated plugins from dist/ and skips their generator', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'plugin-dirs-'));
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ workspaces: ['plugins/gen'] }));
  fs.mkdirSync(path.join(root, 'plugins', 'gen', 'dist', 'a-kit', '.claude-plugin'), { recursive: true });
  fs.writeFileSync(path.join(root, 'plugins', 'gen', 'dist', 'a-kit', '.claude-plugin', 'plugin.json'), '{}');
  const dirs = pluginDirs(root);
  assert.equal(dirs.get('a-kit'), path.join('plugins', 'gen', 'dist', 'a-kit'));
  assert.equal(dirs.has('gen'), false);
});

test('pluginDirs keeps a plugin with a dist/ folder and throws on unknown folders', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'plugin-dirs-'));
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ workspaces: [] }));
  fs.mkdirSync(path.join(root, 'plugins', 'real', '.claude-plugin'), { recursive: true });
  fs.writeFileSync(path.join(root, 'plugins', 'real', '.claude-plugin', 'plugin.json'), '{}');
  fs.mkdirSync(path.join(root, 'plugins', 'real', 'dist'));
  assert.deepEqual([...pluginDirs(root).keys()], ['real']);

  fs.mkdirSync(path.join(root, 'plugins', 'stray'));
  assert.throws(() => pluginDirs(root), /plugins\/stray is neither a plugin/);
});
