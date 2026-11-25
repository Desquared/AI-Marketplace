// --- Per-plugin version bumps ------------------------------------------------
//
// A plugin update reaches users only when its version goes up, so every PR that
// changes a plugin carries its own bump. The bump is computed from the version
// on the base branch, never from the branch's own, so re-running it is a no-op.

const LEVELS = ['none', 'patch', 'minor', 'major'];

/**
 * The bump a PR asks for: a `release:<level>` label wins; otherwise the
 * conventional-commit PR title decides (`!` or BREAKING → major, feat → minor,
 * anything else → patch).
 * @param {string} title
 * @param {string[]} labels
 * @returns {'none'|'patch'|'minor'|'major'}
 */
export function releaseLevel(title, labels) {
  const fromLabel = labels
    .map((label) => label.match(/^release:(\w+)$/)?.[1])
    .filter((level) => LEVELS.includes(level));
  if (fromLabel.length) return fromLabel.sort((a, b) => LEVELS.indexOf(b) - LEVELS.indexOf(a))[0];
  if (/^\w+(\([^)]*\))?!:/.test(title) || /BREAKING[ -]CHANGE/.test(title)) return 'major';
  if (/^feat(\(|:)/.test(title)) return 'minor';
  return 'patch';
}

/**
 * `bumpVersion('1.2.3', 'minor')` → `'1.3.0'`
 *
 * A prerelease (`0.11.0-beta.1`) only advances its prerelease counter
 * (`0.11.0-beta.2`), whatever the level: it must stay below the release it
 * precedes, and promoting it to that release is the publisher's call, not a
 * side effect of an unrelated PR. A prerelease without a numeric tail gains one
 * (`1.0.0-rc` → `1.0.0-rc.1`). Build metadata (`+…`) is dropped.
 * @param {string} version - `MAJOR.MINOR.PATCH`, optionally with `-prerelease`
 * @param {'none'|'patch'|'minor'|'major'} level
 */
export function bumpVersion(version, level) {
  if (level === 'none') return version;
  const parsed = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/);
  if (!parsed) throw new Error(`"${version}" is not a MAJOR.MINOR.PATCH version`);
  const [major, minor, patch] = parsed.slice(1, 4).map(Number);
  const prerelease = parsed[4];

  if (prerelease) {
    const parts = prerelease.split('.');
    const last = parts.at(-1);
    if (/^\d+$/.test(last)) parts[parts.length - 1] = String(Number(last) + 1);
    else parts.push('1');
    return `${major}.${minor}.${patch}-${parts.join('.')}`;
  }
  if (level === 'major') return `${major + 1}.0.0`;
  if (level === 'minor') return `${major}.${minor + 1}.0`;
  if (level === 'patch') return `${major}.${minor}.${patch + 1}`;
  throw new Error(`unknown release level "${level}"`);
}

/**
 * Set one `version` field in a JSON file's text without reformatting it.
 * `locate` returns the parsed object that owns the field. Each `"version"`
 * string in the text is tried in turn until the edit changes exactly that field.
 * @param {string} text
 * @param {(json: any) => any} locate
 * @param {string} version
 */
export function setJsonVersion(text, locate, version) {
  const expected = JSON.parse(text);
  const owner = locate(expected);
  if (!owner) throw new Error('no object to version');
  if (owner.version === version) return text;
  owner.version = version;
  const want = JSON.stringify(expected);

  for (const match of text.matchAll(/("version"\s*:\s*")[^"]*(")/g)) {
    const end = match.index + match[0].length;
    const edited = text.slice(0, match.index) + match[1] + version + match[2] + text.slice(end);
    if (JSON.stringify(JSON.parse(edited)) === want) return edited;
  }
  throw new Error('no "version" field to update');
}

/**
 * The plugins a set of changed files belongs to.
 * A file inside a plugin's folder belongs to that plugin. A generated plugin
 * lives in `<generator>/dist/<name>`; a file elsewhere in the generator (its
 * source, templates, build scripts) belongs to every plugin it generates, so a
 * source change bumps them even before `dist/` is rebuilt.
 * @param {string[]} files - changed paths, relative to the repository root, using "/"
 * @param {Map<string, string>} plugins - plugin name -> folder, from pluginDirs()
 * @returns {string[]} plugin names, sorted
 */
export function changedPlugins(files, plugins) {
  const dirs = [...plugins].map(([name, dir]) => {
    const folder = dir.split('\\').join('/');
    const parts = folder.split('/');
    const generator = parts.at(-2) === 'dist' ? parts.slice(0, -2).join('/') : undefined;
    return { name, folder, generator };
  });
  const hit = new Set();
  for (const file of files) {
    for (const { name, folder, generator } of dirs) {
      if (file.startsWith(`${folder}/`) || (generator && file.startsWith(`${generator}/`) && !file.startsWith(`${generator}/dist/`))) {
        hit.add(name);
      }
    }
  }
  return [...hit].sort();
}
