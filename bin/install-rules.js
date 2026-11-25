#!/usr/bin/env node
/**
 * install-rules.js — ambient-rules installer for the desquared marketplace.
 *
 * Serves the editors that cannot install a marketplace plugin. Installs a
 * plugin's rules, skills, and agents into the chosen editor's ambient-context
 * slot, converting each to the shape that editor expects. Editors with no
 * native agent primitive (Cursor/Windsurf) receive agents and skills as rules.
 *
 * Run:  node install-rules.js [plugin]   (after `npm install`)
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import chalk from 'chalk';
import {
  deriveDescription,
  toCursorMdc,
  toWindsurfRule,
  toCopilotInstructions,
  rewriteSkillLinks,
} from './lib/rules-transform.js';
import { pluginDirs } from './lib/plugin-dirs.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '..');
const plugins = pluginDirs(repoRoot);

function vsCodeUserDataDir() {
  const p = os.platform();
  if (p === 'darwin') return path.join(os.homedir(), 'Library', 'Application Support', 'Code', 'User');
  if (p === 'win32') return path.join(process.env.APPDATA || os.homedir(), 'Code', 'User');
  return path.join(os.homedir(), '.config', 'Code', 'User');
}

// IDE definitions. rulesConfig.install selects the emission shape.
const IDES = [
  {
    key: 'cursor', label: 'Cursor',
    rulesConfig: {
      install: 'cursor-mdc',
      projectPath: (cwd) => path.join(cwd, '.cursor', 'rules'),
      globalPath: () => path.join(os.homedir(), '.cursor', 'rules'),
    },
    agentsConfig: null, // no agent primitive → agents install as rules
  },
  {
    key: 'windsurf', label: 'Windsurf',
    rulesConfig: {
      install: 'windsurf-rule',
      projectPath: (cwd) => path.join(cwd, '.windsurf', 'rules'),
      globalPath: () => path.join(os.homedir(), '.codeium', 'windsurf', 'memories', 'rules'),
    },
    agentsConfig: null,
  },
  {
    key: 'copilot', label: 'GitHub Copilot',
    rulesConfig: {
      install: 'instructions-file',
      projectPath: (cwd) => path.join(cwd, '.github', 'instructions'),
      globalPath: () => path.join(vsCodeUserDataDir(), 'instructions'),
    },
    agentsConfig: {
      projectPath: (cwd) => path.join(cwd, '.github', 'agents'),
      globalPath: () => path.join(os.homedir(), '.copilot', 'agents'),
    },
  },
  {
    key: 'claude', label: 'Claude Code',
    rulesConfig: {
      install: 'append',
      projectPath: (cwd) => path.join(cwd, 'CLAUDE.md'),
      globalPath: () => path.join(os.homedir(), '.claude', 'CLAUDE.md'),
    },
    agentsConfig: {
      projectPath: (cwd) => path.join(cwd, '.claude', 'agents'),
      globalPath: () => path.join(os.homedir(), '.claude', 'agents'),
    },
  },
];

function listPlugins() {
  return [...plugins]
    .filter(([, dir]) => ['rules', 'skills', 'agents'].some((d) => fs.existsSync(path.join(repoRoot, dir, d))))
    .map(([name]) => name);
}

// A skill is a directory holding SKILL.md. Its sibling .md files are the
// on-demand references SKILL.md links to; they install as separate rules,
// because an ambient-rules slot is flat and cannot resolve a relative link.
function listSkills(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((name) => fs.existsSync(path.join(dir, name, 'SKILL.md')))
    .sort()
    .map((name) => ({
      name,
      file: path.join(dir, name, 'SKILL.md'),
      refs: fs.readdirSync(path.join(dir, name))
        .filter((f) => f.endsWith('.md') && f !== 'SKILL.md')
        .sort()
        .map((f) => ({ name: `${name}-${f.replace(/\.md$/, '')}`, file: path.join(dir, name, f) })),
    }));
}

function listMd(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.md') && fs.statSync(path.join(dir, f)).isFile())
    .sort()
    .map((f) => ({ name: f.replace(/\.md$/, ''), file: path.join(dir, f) }));
}

function installFile(targetDir, fileName, content) {
  fs.mkdirSync(targetDir, { recursive: true });
  const dest = path.join(targetDir, fileName);
  fs.writeFileSync(dest, content, 'utf8');
  return dest;
}

function installAppend(targetFile, content, itemName) {
  const start = `<!-- desquared:start ${itemName} -->`;
  const end = `<!-- desquared:end ${itemName} -->`;
  const section = `\n${start}\n${content.trimEnd()}\n${end}\n`;
  fs.mkdirSync(path.dirname(targetFile), { recursive: true });
  let existing = fs.existsSync(targetFile) ? fs.readFileSync(targetFile, 'utf8') : '';
  if (existing.includes(start)) {
    const s = existing.indexOf(start);
    const e = existing.indexOf(end) + end.length;
    fs.writeFileSync(targetFile, existing.slice(0, s).trimEnd() + section + existing.slice(e).replace(/^\n+/, '\n'), 'utf8');
  } else {
    fs.appendFileSync(targetFile, section, 'utf8');
  }
  return targetFile;
}

function emitRule(item, ide, scope, cwd) {
  const content = item.content ?? fs.readFileSync(item.file, 'utf8');
  const cfg = ide.rulesConfig;
  const dir = scope === 'global' ? cfg.globalPath?.() : cfg.projectPath?.(cwd);
  switch (cfg.install) {
    case 'cursor-mdc':
      return installFile(dir, `${item.name}.mdc`, toCursorMdc(item.name, content));
    case 'windsurf-rule':
      return installFile(dir, `${item.name}.md`, toWindsurfRule(item.name, content));
    case 'instructions-file':
      return installFile(dir, `${item.name}.instructions.md`, toCopilotInstructions(content));
    case 'append':
      return installAppend(dir, content, item.name);
    default:
      throw new Error(`Unknown install type: ${cfg.install}`);
  }
}

function emitSkill(item, ide, scope, cwd) {
  const dests = [];
  const body = rewriteSkillLinks(fs.readFileSync(item.file, 'utf8'), item.name);
  dests.push(emitRule({ name: item.name, content: body }, ide, scope, cwd));
  for (const ref of item.refs) dests.push(emitRule(ref, ide, scope, cwd));
  return dests.join(', ');
}

function emitAgent(item, ide, scope, cwd) {
  const content = fs.readFileSync(item.file, 'utf8');
  if (ide.agentsConfig) {
    const dir = scope === 'global' ? ide.agentsConfig.globalPath() : ide.agentsConfig.projectPath(cwd);
    return installFile(dir, `${item.name}.md`, content);
  }
  // Fallback: editors without an agent primitive receive agents as rules.
  return emitRule(item, ide, scope, cwd);
}

async function main() {
  console.log(chalk.bold.cyan('\n🛠  Ambient-rules installer\n'));

  const available = listPlugins();
  let plugin = process.argv[2];
  if (plugin && !available.includes(plugin)) {
    console.log(chalk.red(`\n  Unknown plugin: ${plugin}`));
    console.log(chalk.dim(`  Available: ${available.join(', ')}\n`));
    process.exit(1);
  }
  if (!plugin) {
    ({ plugin } = await inquirer.prompt([{
      type: 'list', name: 'plugin', message: 'Install from which plugin?', choices: available,
    }]));
  }
  const pluginRoot = path.join(repoRoot, plugins.get(plugin));

  const rules = listMd(path.join(pluginRoot, 'rules'));
  const skills = listSkills(path.join(pluginRoot, 'skills'));
  const agents = listMd(path.join(pluginRoot, 'agents'));
  if (rules.length === 0 && skills.length === 0 && agents.length === 0) {
    console.log(chalk.yellow('  Nothing to install (no rules, skills, or agents found).\n'));
    return;
  }

  const { ideKeys } = await inquirer.prompt([{
    type: 'checkbox', name: 'ideKeys', message: 'Install for which IDE(s)?',
    choices: IDES.map((i) => ({ name: i.label, value: i.key })),
    validate: (v) => v.length > 0 || 'Select at least one IDE.',
  }]);
  const selectedIdes = IDES.filter((i) => ideKeys.includes(i.key));

  const { scope } = await inquirer.prompt([{
    type: 'list', name: 'scope', message: 'Where to install?',
    choices: [
      { name: 'Project — current directory', value: 'project' },
      { name: 'Global — all projects', value: 'global' },
    ],
  }]);

  let cwd = process.cwd();
  if (scope === 'project') {
    const { dir } = await inquirer.prompt([{ type: 'input', name: 'dir', message: 'Project directory:', default: process.cwd() }]);
    cwd = path.resolve(dir);
    if (!fs.existsSync(cwd)) { console.log(chalk.red(`\n  Not found: ${cwd}\n`)); process.exit(1); }
  }

  const choices = [];
  if (rules.length) {
    choices.push(new inquirer.Separator('── Rules'));
    for (const r of rules) choices.push({ name: `${r.name}  ${chalk.dim(deriveDescription(fs.readFileSync(r.file, 'utf8')))}`, value: { kind: 'rule', item: r } });
  }
  if (skills.length) {
    choices.push(new inquirer.Separator('── Skills (installed as rules; Claude Code should install the plugin instead)'));
    for (const s of skills) {
      const refs = s.refs.length ? chalk.dim(` +${s.refs.length} ref${s.refs.length > 1 ? 's' : ''}`) : '';
      choices.push({ name: `${s.name}${refs}  ${chalk.dim(deriveDescription(fs.readFileSync(s.file, 'utf8')))}`, value: { kind: 'skill', item: s } });
    }
  }
  if (agents.length) {
    choices.push(new inquirer.Separator('── Agents (installed as rules on Cursor/Windsurf)'));
    for (const a of agents) choices.push({ name: a.name, value: { kind: 'agent', item: a } });
  }
  const { picks } = await inquirer.prompt([{
    type: 'checkbox', name: 'picks', message: 'Select items:', choices, pageSize: 20,
    validate: (v) => v.length > 0 || 'Select at least one item.',
  }]);

  let ok = 0, err = 0;
  for (const ide of selectedIdes) {
    console.log(chalk.bold(`\n  ▸ ${ide.label}`));
    for (const { kind, item } of picks) {
      if (kind === 'skill' && ide.key === 'claude') {
        console.log(chalk.dim(`    - ${item.name} skipped: install the plugin instead`));
        continue;
      }
      try {
        const emit = { skill: emitSkill, agent: emitAgent }[kind] ?? emitRule;
        const dest = emit(item, ide, scope, cwd);
        const note = (kind === 'agent' && !ide.agentsConfig) || kind === 'skill' ? chalk.yellow(' (as rule)') : '';
        console.log(chalk.green(`    ✓ ${item.name}`) + note + chalk.dim(`  → ${dest}`));
        ok++;
      } catch (e) { console.log(chalk.red(`    ✗ ${item.name}: ${e.message}`)); err++; }
    }
  }
  console.log(`\n  ${chalk.green(`${ok} installed`)}${err ? chalk.red(`, ${err} failed`) : ''}`);
  console.log(chalk.dim('  Restart your IDE to pick up the new files.\n'));
}

main().catch((e) => { console.error(chalk.red('\n  Fatal:'), e.message); process.exit(1); });
