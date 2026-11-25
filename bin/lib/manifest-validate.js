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

// Root files that carry a plugin's version although they live outside its
// folder. Each is matched to a plugin by its `name` field. gemini-extension.json
// must sit at the repository root for the Gemini CLI extensions gallery.
export const VERSION_ROOT_MANIFESTS = ['gemini-extension.json'];

// --- Agent Plugins 1.0.0 -----------------------------------------------------
//
// A plugin's root `plugin.json` follows the Agent Plugins format, which Copilot
// CLI, Kiro, Cursor and OpenAI read, and which awesome-copilot requires. Its
// schema is closed: path fields are not allowed, components are found at fixed
// locations (`skills/`, `mcp.json`), and client-specific files live in a
// reverse-domain folder such as `com.github.copilot/`.
// https://agent-plugins.org/schemas/1.0.0/plugin.schema.json

export const AGENT_PLUGINS_SCHEMA = 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json';
export const AGENT_PLUGINS_MCP_SCHEMA = 'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json';
const AGENT_PLUGINS_KEYS = [
  '$schema', 'name', 'version', 'description', 'author', 'homepage', 'repository', 'license', 'keywords', 'extensions',
];
const AGENT_PLUGINS_NAME = /^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/;

/** @returns {string[]} problems with a root Agent Plugins `plugin.json` */
export function validateAgentPluginsManifest(json) {
  const problems = [];
  if (json.$schema !== AGENT_PLUGINS_SCHEMA) problems.push(`plugin.json: "$schema" must be "${AGENT_PLUGINS_SCHEMA}"`);
  for (const key of Object.keys(json)) {
    if (!AGENT_PLUGINS_KEYS.includes(key)) problems.push(`plugin.json: "${key}" is not an Agent Plugins field`);
  }
  if (typeof json.name !== 'string' || !AGENT_PLUGINS_NAME.test(json.name) || json.name.length > 64 || /--|\.\./.test(json.name)) {
    problems.push(`plugin.json: name "${json.name}" is not a valid Agent Plugins name`);
  }
  for (const k of json.keywords ?? []) {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(k)) problems.push(`plugin.json: keyword "${k}" must be lowercase-hyphenated`);
  }
  return problems;
}

/** @returns {string[]} problems with an Agent Plugins `mcp.json` */
export function validateAgentPluginsMcp(json) {
  const problems = [];
  if (json.$schema !== AGENT_PLUGINS_MCP_SCHEMA) problems.push(`mcp.json: "$schema" must be "${AGENT_PLUGINS_MCP_SCHEMA}"`);
  for (const key of Object.keys(json)) {
    if (!['$schema', 'mcpServers'].includes(key)) problems.push(`mcp.json: "${key}" is not allowed`);
  }
  for (const [name, server] of Object.entries(json.mcpServers ?? {})) {
    if (!['stdio', 'streamable-http', 'sse'].includes(server.type)) {
      problems.push(`mcp.json: ${name} needs a "type" of stdio, streamable-http or sse`);
    }
  }
  return problems;
}

/**
 * The remote servers of an MCP config as name -> url, whichever dialect it uses
 * (`url` for Claude/Cursor/Agent Plugins, `httpUrl` for Gemini).
 */
export function remoteServers(json) {
  return Object.fromEntries(
    Object.entries(json.mcpServers ?? {}).map(([name, s]) => [name, s.url ?? s.httpUrl]).filter(([, url]) => url),
  );
}

/**
 * Compare two MCP configs. A plugin ships the same servers in several dialects
 * (`.mcp.json`, `mcp.json`, `gemini-extension.json`); they must not drift.
 * @returns {string|null}
 */
export function mcpDrift(label, expected, actual) {
  const a = JSON.stringify(Object.entries(remoteServers(expected)).sort());
  const b = JSON.stringify(Object.entries(remoteServers(actual)).sort());
  return a === b ? null : `${label}: MCP servers differ from .mcp.json (${b} vs ${a})`;
}

// --- Official MCP Registry ---------------------------------------------------
//
// A subset of https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json
// plus the registry's own publishing rules, enough to catch the mistakes that
// fail `mcp-publisher publish`. CI has no network, so the full schema is
// checked by hand (see AGENTS.md).

export const SERVER_SCHEMA = 'https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json';

/**
 * @param {object} json - parsed server.json
 * @param {string[]} allowedUrls - remote URLs the plugin's `.mcp.json` declares
 * @returns {string[]}
 */
export function validateServerJson(json, allowedUrls) {
  const problems = [];
  if (json.$schema !== SERVER_SCHEMA) problems.push(`server.json: "$schema" must be "${SERVER_SCHEMA}"`);
  if (!/^[a-zA-Z0-9.-]+\/[a-zA-Z0-9._-]+$/.test(json.name ?? '')) problems.push(`server.json: name "${json.name}" must be "<reverse-dns>/<name>"`);
  if (typeof json.description !== 'string' || json.description.length < 1 || json.description.length > 100) {
    problems.push('server.json: description must be 1-100 characters');
  }
  if (!/^\d+\.\d+\.\d+/.test(json.version ?? '')) problems.push('server.json: version must be semver');
  if (json.websiteUrl && !json.websiteUrl.startsWith('https://')) problems.push('server.json: websiteUrl must be https');
  for (const icon of json.icons ?? []) {
    if (!icon.src?.startsWith('https://') || icon.src.length > 255) problems.push(`server.json: icon src "${icon.src}" must be https and at most 255 characters`);
  }
  const remotes = json.remotes ?? [];
  if (!remotes.length) problems.push('server.json: a remote server needs a "remotes" entry');
  for (const r of remotes) {
    if (r.type !== 'streamable-http') problems.push(`server.json: remote ${r.url} must use "streamable-http"`);
    if (!allowedUrls.includes(r.url)) problems.push(`server.json: remote ${r.url} is not a server in .mcp.json`);
  }
  return problems;
}
