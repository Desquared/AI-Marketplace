import fs from 'fs';
import path from 'path';

const MANIFEST = path.join('.claude-plugin', 'plugin.json');

/**
 * Every plugin in the repository, as a Map of name -> folder relative to the
 * repository root, sorted by name.
 *
 * A folder under plugins/ is either:
 * - a generator: it is listed in the root package.json `workspaces`, and each
 *   folder in its dist/ is a generated plugin
 *   (plugins/ds-ai-toolkits/dist/ods-ai-toolkit, …), or
 * - a plugin: it has .claude-plugin/plugin.json.
 * Anything else throws, so a misplaced folder can't silently drop out of the
 * catalog check, the Cursor rules build, or install-rules.
 */
export function pluginDirs(repoRoot) {
  const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));
  const generators = new Set((pkg.workspaces ?? []).map((w) => path.normalize(w)));
  const isPlugin = (dir) => fs.existsSync(path.join(repoRoot, dir, MANIFEST));
  const found = [];

  for (const name of fs.readdirSync(path.join(repoRoot, 'plugins'))) {
    const dir = path.join('plugins', name);
    if (!fs.statSync(path.join(repoRoot, dir)).isDirectory()) continue;

    if (generators.has(dir)) {
      const dist = path.join(dir, 'dist');
      if (!fs.existsSync(path.join(repoRoot, dist))) {
        throw new Error(`${dir} is a generator (root package.json workspaces) but has no dist/ folder. Build it first.`);
      }
      for (const built of fs.readdirSync(path.join(repoRoot, dist))) {
        const builtDir = path.join(dist, built);
        if (!fs.statSync(path.join(repoRoot, builtDir)).isDirectory()) continue;
        if (!isPlugin(builtDir)) throw new Error(`${builtDir} is in a generator's dist/ but has no ${MANIFEST}.`);
        found.push([built, builtDir]);
      }
    } else if (isPlugin(dir)) {
      found.push([name, dir]);
    } else {
      throw new Error(
        `${dir} is neither a plugin (no ${MANIFEST}) nor a generator (not in the root package.json workspaces).`,
      );
    }
  }
  return new Map(found.sort(([a], [b]) => a.localeCompare(b)));
}
