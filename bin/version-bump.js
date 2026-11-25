#!/usr/bin/env node
/**
 * version-bump.js — bump the version of every plugin a branch changed.
 *
 * Each changed plugin is set to exactly one level above its version on the base
 * branch, in its manifests and in the catalogs that carry a version. A change to
 * a generator's source counts as a change to every plugin it generates
 * (lib/versioning.js changedPlugins). A generated plugin's version lives in its
 * dist/ manifests, which the generator's build keeps, so bin/ never needs to
 * know about a generator's own config.
 * Running it again is a no-op. The `version` workflow runs it on every PR.
 *
 * Run:  node bin/version-bump.js [base-ref] [--level none|patch|minor|major]
 *       base-ref defaults to origin/main. Without --level, the level comes from
 *       PR_TITLE and PR_LABELS (a JSON array of label names).
 */
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { VERSION_MANIFESTS, VERSION_CATALOGS, VERSION_ROOT_MANIFESTS } from './lib/manifest-validate.js';
import { releaseLevel, bumpVersion, setJsonVersion, changedPlugins } from './lib/versioning.js';

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = '.claude-plugin/plugin.json';

// Every plugin, as name -> folder: plugins/<name>, or plugins/<generator>/dist/<name>
// for a generated one. A folder without a Claude manifest is not a plugin.
function findPlugins() {
  const found = new Map();
  const isPlugin = (dir) => fs.existsSync(path.join(repoRoot, dir, MANIFEST));
  for (const name of fs.readdirSync(path.join(repoRoot, 'plugins'))) {
    const dir = `plugins/${name}`;
    if (isPlugin(dir)) found.set(name, dir);
    const dist = path.join(repoRoot, dir, 'dist');
    if (!isPlugin(dir) && fs.existsSync(dist)) {
      for (const built of fs.readdirSync(dist)) if (isPlugin(`${dir}/dist/${built}`)) found.set(built, `${dir}/dist/${built}`);
    }
  }
  return found;
}

const plugins = findPlugins();

const args = process.argv.slice(2);
const levelFlag = args.indexOf('--level');
const level =
  levelFlag >= 0
    ? args.splice(levelFlag, 2)[1]
    : releaseLevel(process.env.PR_TITLE ?? '', JSON.parse(process.env.PR_LABELS || '[]'));
const base = args[0] ?? 'origin/main';

const git = (...gitArgs) =>
  execFileSync('git', gitArgs, { cwd: repoRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });

function baseVersion(plugin) {
  try {
    return JSON.parse(git('show', `${base}:${plugins.get(plugin)}/${MANIFEST}`)).version;
  } catch {
    return undefined; // new on this branch: it ships at whatever version it declares
  }
}

function update(file, locate, version) {
  const full = path.join(repoRoot, file);
  if (!fs.existsSync(full)) return;
  const text = fs.readFileSync(full, 'utf8');
  if (!locate(JSON.parse(text))) return;
  fs.writeFileSync(full, setJsonVersion(text, locate, version));
}

if (level === 'none') {
  console.log('release:none — no versions bumped.');
  process.exit(0);
}

const mergeBase = git('merge-base', base, 'HEAD').trim();
const changed = changedPlugins(git('diff', '--name-only', mergeBase).split('\n').filter(Boolean), plugins);

for (const plugin of changed) {
  const from = baseVersion(plugin);
  if (!from) continue;
  const version = bumpVersion(from, level);

  for (const file of VERSION_MANIFESTS) update(`${plugins.get(plugin)}/${file}`, (json) => json, version);
  for (const file of VERSION_CATALOGS) {
    update(file, (json) => json.plugins.find((p) => p.name === plugin && p.version !== undefined), version);
  }
  for (const file of VERSION_ROOT_MANIFESTS) {
    update(file, (json) => (json.name === plugin && json.version !== undefined ? json : undefined), version);
  }

  console.log(`${plugin}: ${from} -> ${version} (${level})`);
}
