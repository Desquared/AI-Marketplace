#!/usr/bin/env node
/**
 * build-cursor-rules.js — publish every plugin's rules and skills as Cursor
 * `.mdc` files under `dist/cursor-rules/<plugin>/`.
 *
 * Cursor's Remote Rules feature syncs `.mdc` straight from a GitHub repository,
 * which is the only install path that asks a designer for no terminal. Sources
 * stay verbatim under `plugins/`; this directory is generated output.
 *
 * Run:  node build-cursor-rules.js [--check]
 *       --check exits non-zero if the committed output is stale.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { toCursorMdc, rewriteSkillLinks } from './lib/rules-transform.js';
import { pluginDirs } from './lib/plugin-dirs.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '..');
const outRoot = path.join(repoRoot, 'dist', 'cursor-rules');

const README = `# Cursor rules (generated)

Do not edit. Regenerate with \`node bin/build-cursor-rules.js\`.

Sources live under each plugin's \`rules/\` and \`skills/\` (\`plugins/<plugin>/\`, or
\`plugins/<generator>/dist/<plugin>/\` for generated plugins).

## Use these in Cursor

1. Customize > Rules > Add Rule > Remote Rule (Github)
2. Paste this repository's URL

Cursor syncs the rules into \`.cursor/rules/imported/\` and keeps them current.
`;

// Plugins that publish no Cursor rules, with the reason. A plugin listed here is
// installed through the marketplace only: its skills are not copied into
// description-selected rules, so Cursor never offers a second, unmanaged copy.
const NO_CURSOR_RULES = new Map([]);

// Every emitted rule, as {name, content} pairs, for one plugin.
function collect(pluginRoot) {
  const items = [];

  const rulesDir = path.join(pluginRoot, 'rules');
  if (fs.existsSync(rulesDir)) {
    for (const f of fs.readdirSync(rulesDir).filter((f) => f.endsWith('.md')).sort()) {
      items.push({ name: f.replace(/\.md$/, ''), content: fs.readFileSync(path.join(rulesDir, f), 'utf8') });
    }
  }

  const skillsDir = path.join(pluginRoot, 'skills');
  if (fs.existsSync(skillsDir)) {
    for (const name of fs.readdirSync(skillsDir).sort()) {
      const skillFile = path.join(skillsDir, name, 'SKILL.md');
      if (!fs.existsSync(skillFile)) continue;
      items.push({ name, content: rewriteSkillLinks(fs.readFileSync(skillFile, 'utf8'), name) });
      // Sibling references become their own rules; a flat slot cannot resolve
      // a relative link, so rewriteSkillLinks already points the body here.
      for (const f of fs.readdirSync(path.join(skillsDir, name)).filter((f) => f.endsWith('.md') && f !== 'SKILL.md').sort()) {
        items.push({ name: `${name}-${f.replace(/\.md$/, '')}`, content: fs.readFileSync(path.join(skillsDir, name, f), 'utf8') });
      }
    }
  }
  return items;
}

function build() {
  const files = new Map([[path.join(outRoot, 'README.md'), README]]);
  for (const [plugin, dir] of pluginDirs(repoRoot)) {
    if (NO_CURSOR_RULES.has(plugin)) continue;
    for (const item of collect(path.join(repoRoot, dir))) {
      files.set(path.join(outRoot, plugin, `${item.name}.mdc`), toCursorMdc(item.name, item.content));
    }
  }
  return files;
}

const files = build();
const check = process.argv.includes('--check');

if (check) {
  const onDisk = new Set();
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      e.isDirectory() ? walk(p) : onDisk.add(p);
    }
  };
  walk(outRoot);

  const stale = [];
  for (const [file, content] of files) {
    if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== content) stale.push(file);
  }
  for (const file of onDisk) if (!files.has(file)) stale.push(`${file} (orphaned)`);

  if (stale.length) {
    console.error('Generated Cursor rules are stale. Run: node bin/build-cursor-rules.js\n');
    for (const f of stale) console.error(`  ${path.relative(repoRoot, f)}`);
    process.exit(1);
  }
  console.log(`Cursor rules current (${files.size} files).`);
} else {
  fs.rmSync(outRoot, { recursive: true, force: true });
  for (const [file, content] of files) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content, 'utf8');
  }
  console.log(`Wrote ${files.size} files to ${path.relative(repoRoot, outRoot)}`);
}
