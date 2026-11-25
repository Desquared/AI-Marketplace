// Validates plugin manifests against the constraints their runtimes actually
// enforce. The `checks` workflow only JSON.parses these files, which is how an
// invalid manifest reached a user's `claude plugin install` and failed there.
//
// Claude Code and Codex both validate path fields against the pattern `^\./.*`
// (see https://www.schemastore.org/claude-code-plugin-manifest.json). A plain
// relative path like "skills/" or ".mcp.json" is rejected as "Invalid input".

export const PATH_FIELDS = ['skills', 'agents', 'hooks', 'mcpServers'];

// Manifests whose schema requires the `./` prefix. The root `plugin.json`
// (Copilot/shared) is deliberately absent: it stores plain relative paths.
export const PREFIXED_MANIFESTS = ['.claude-plugin/plugin.json', '.codex-plugin/plugin.json'];

/**
 * Check one manifest object.
 * @param {string} manifest - manifest path, relative to the plugin folder
 * @param {object} json - parsed manifest
 * @returns {string[]} human-readable problems; empty when valid
 */
export function validateManifest(manifest, json) {
  const problems = [];
  if (!PREFIXED_MANIFESTS.includes(manifest)) return problems;

  for (const field of PATH_FIELDS) {
    if (!(field in json)) continue;
    const values = Array.isArray(json[field]) ? json[field] : [json[field]];
    for (const value of values) {
      // An inline object (hooks/mcpServers may be declared inline) is not a path.
      if (typeof value !== 'string') continue;
      if (!value.startsWith('./')) {
        problems.push(`${manifest}: ${field} "${value}" must start with "./"`);
      }
    }
  }
  return problems;
}

/**
 * Resolve the on-disk targets a manifest's path fields point at.
 * @returns {string[]} plugin-relative paths that must exist
 */
export function declaredPaths(json) {
  const paths = [];
  for (const field of PATH_FIELDS) {
    if (!(field in json)) continue;
    const values = Array.isArray(json[field]) ? json[field] : [json[field]];
    for (const value of values) if (typeof value === 'string') paths.push(value);
  }
  return paths;
}

// --- Version consistency -----------------------------------------------------
//
// A plugin's version lives in up to six places (see "Keeping Versions In Sync"
// in the root AGENTS.md); a manifest a plugin does not ship is skipped. Bumping them by hand is exactly the operation that
// drifts, and a partial bump ships a plugin whose catalog entry and manifest
// disagree — so consumers either never see the update or install a mismatch.
// The Codex catalog is deliberately absent: it tracks a `ref`, not a version.

export const VERSION_MANIFESTS = [
  'plugin.json',
  '.claude-plugin/plugin.json',
  '.codex-plugin/plugin.json',
  '.cursor-plugin/plugin.json',
];
export const VERSION_CATALOGS = ['.claude-plugin/marketplace.json', '.github/plugin/marketplace.json'];

/**
 * Report version drift for one plugin.
 * @param {Record<string,string>} versions - source label -> version string
 * @returns {string|null} a description of the drift, or null when consistent
 */
export function versionMismatch(versions) {
  const values = [...new Set(Object.values(versions))];
  if (values.length <= 1) return null;
  const detail = Object.entries(versions).map(([k, v]) => `${k}=${v}`).join(', ');
  return `versions disagree (${values.join(' vs ')}): ${detail}`;
}
