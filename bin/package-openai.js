#!/usr/bin/env node
/**
 * package-openai.js — build the ZIP that the OpenAI plugin directory takes.
 *
 * platform.openai.com/plugins accepts an uploaded archive, not a repository
 * link, and refuses one that contains lifecycle hooks
 * (https://developers.openai.com/plugins/deploy/submission). So the archive is
 * the plugin folder minus its hooks: `hooks/`, the Copilot copy under
 * `com.github.copilot/`, and the `hooks` field of `.codex-plugin/plugin.json`.
 * OpenAI also connects only one MCP server per plugin, and that server must
 * be a production URL. `bin/openai-overrides/<plugin>.json`, when present,
 * names the MCP servers to keep, the skills to drop, and replacement
 * `description` and `interface` fields for the trimmed archive.
 * The privacy policy and terms URLs that MCP review requires are passed in
 * here, so the installed manifest never carries a placeholder.
 *
 * Run:  node bin/package-openai.js <plugin> --privacy <https-url> --terms <https-url>
 * Out:  build/<plugin>-<version>-openai.zip (build/ is git-ignored)
 */
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { pluginDirs } from './lib/plugin-dirs.js';

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const EXCLUDE = ['hooks', 'com.github.copilot', '.DS_Store'];

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args.splice(i, 2)[1] : undefined;
};
const privacy = flag('--privacy');
const terms = flag('--terms');
const plugin = args[0];

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

const dirs = pluginDirs(repoRoot);
if (!dirs.has(plugin)) fail(`Usage: node bin/package-openai.js <${[...dirs.keys()].join('|')}> --privacy <url> --terms <url>`);
for (const [name, url] of [['--privacy', privacy], ['--terms', terms]]) {
  if (!url?.startsWith('https://')) fail(`${name} must be an https:// URL. OpenAI requires both for a plugin with an MCP server.`);
}

const source = path.join(repoRoot, dirs.get(plugin));
const manifestPath = path.join(source, '.codex-plugin', 'plugin.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const overridesPath = path.join(repoRoot, 'bin', 'openai-overrides', `${plugin}.json`);
const overrides = fs.existsSync(overridesPath) ? JSON.parse(fs.readFileSync(overridesPath, 'utf8')) : {};
const excludedSkills = new Set(overrides.excludeSkills ?? []);

const build = path.join(repoRoot, 'build');
const stage = path.join(build, `${plugin}-openai`);
fs.rmSync(stage, { recursive: true, force: true });
fs.mkdirSync(stage, { recursive: true });
fs.cpSync(source, stage, {
  recursive: true,
  filter: (src) => {
    const [top, second] = path.relative(source, src).split(path.sep);
    if (EXCLUDE.includes(top) || src.endsWith('.DS_Store')) return false;
    return !(top === 'skills' && excludedSkills.has(second));
  },
});

if (overrides.keepMcpServers) {
  const mcpPath = path.join(stage, manifest.mcpServers ?? './.mcp.json');
  const mcp = JSON.parse(fs.readFileSync(mcpPath, 'utf8'));
  const kept = Object.fromEntries(Object.entries(mcp.mcpServers).filter(([name]) => overrides.keepMcpServers.includes(name)));
  if (Object.keys(kept).length !== 1) fail(`OpenAI takes exactly one MCP server; ${overridesPath} keeps ${Object.keys(kept).length}.`);
  fs.writeFileSync(mcpPath, `${JSON.stringify({ ...mcp, mcpServers: kept }, null, 2)}\n`);
  // Drop the Agent Plugins copy so the archive holds one server definition only.
  fs.rmSync(path.join(stage, 'mcp.json'), { force: true });
}
if (overrides.description) manifest.description = overrides.description;

delete manifest.hooks;
manifest.interface = { ...manifest.interface, ...overrides.interface, privacyPolicyURL: privacy, termsOfServiceURL: terms };
fs.writeFileSync(path.join(stage, '.codex-plugin', 'plugin.json'), `${JSON.stringify(manifest, null, 2)}\n`);

const zip = path.join(build, `${plugin}-${manifest.version}-openai.zip`);
fs.rmSync(zip, { force: true });
execFileSync('zip', ['-qr', '-X', zip, '.'], { cwd: stage, stdio: 'inherit' });
fs.rmSync(stage, { recursive: true, force: true });
console.log(`Wrote ${path.relative(repoRoot, zip)} (no hooks; one MCP server; privacy and terms URLs set).`);
