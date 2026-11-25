// Pure, dependency-free transforms shared by the interactive installer.
// Adapts a source rule (verbatim markdown, optional frontmatter) into the
// shape each target editor expects. No I/O, no external deps — unit-testable.

export function parseFrontmatter(content) {
  if (!content.startsWith('---\n')) return {};
  const end = content.indexOf('\n---\n', 4);
  if (end === -1) return {};
  const data = {};
  for (const line of content.slice(4, end).split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    data[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return data;
}

export function stripFrontmatter(content) {
  if (!content.startsWith('---\n')) return content;
  const end = content.indexOf('\n---\n', 4);
  return end === -1 ? content : content.slice(end + 5);
}

export function firstHeading(content) {
  for (const line of stripFrontmatter(content).split('\n')) {
    if (line.startsWith('# ')) return line.slice(2).trim();
  }
  return '';
}

export function deriveDescription(content) {
  const fm = parseFrontmatter(content);
  if (fm.description) return fm.description.trim();
  const heading = firstHeading(content);
  return heading ? `${heading}.` : 'Project rule.';
}

// Rules every response must follow, wherever the plugin is installed. Every
// other rule and skill is description-selected.
// Follow-up (per spec): replace this list with per-rule metadata.
export const ALWAYS_ON_RULES = new Set([
  'shared-ai-safeguards', // mobile-shared
  'project-constitution', // ods-ai-toolkit, radd-ai-toolkit
  'security-privacy', // ods-ai-toolkit, radd-ai-toolkit
]);

export function isAlwaysOn(name) {
  return ALWAYS_ON_RULES.has(name);
}

// An ambient-rules slot is flat, so a skill's relative links to its sibling
// reference files cannot resolve. Each reference installs as its own rule named
// `<skill>-<ref>`; point the body at those names instead.
export function rewriteSkillLinks(content, skillName) {
  return content.replace(
    /\[([^\]]+)\]\((?!https?:|\/|\.\.\/)([A-Za-z0-9._-]+)\.md\)/g,
    (_m, text, ref) => (text === `${ref}.md` ? `the \`${skillName}-${ref}\` rule` : `${text} (see the \`${skillName}-${ref}\` rule)`),
  );
}

export function toCursorMdc(name, content) {
  const fm = [
    '---',
    `description: ${deriveDescription(content)}`,
    'globs:',
    `alwaysApply: ${isAlwaysOn(name)}`,
    '---',
    '',
  ].join('\n');
  return fm + stripFrontmatter(content).replace(/^\n+/, '');
}

export function toWindsurfRule(name, content) {
  const fm = [
    '---',
    `trigger: ${isAlwaysOn(name) ? 'always_on' : 'model_decision'}`,
    `description: ${deriveDescription(content)}`,
    '---',
    '',
  ].join('\n');
  return fm + stripFrontmatter(content).replace(/^\n+/, '');
}

export function toCopilotInstructions(content) {
  return content;
}
