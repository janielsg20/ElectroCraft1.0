import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const REQUIRED_DOCS = [
  'AGENTS.md',
  '.ai/README.md',
  '.ai/PROMPT_MAESTRO_ELECTROCRAFT_2.md',
  '.ai/MASTER_SPEC.md',
  '.ai/REQUIREMENTS.md',
  '.ai/RULES.md',
  '.ai/MEMORY.md',
  '.ai/STATE.md',
  '.ai/ARCHITECTURE.md',
  '.ai/DATA_MODELS.md',
  '.ai/EDITOR_ENGINE.md',
  '.ai/WIDGET_SYSTEM.md',
  '.ai/DESIGN_SYSTEM.md',
  '.ai/THEME_SYSTEM.md',
  '.ai/CONTENT_ENGINE.md',
  '.ai/BACKEND_BUILDER.md',
  '.ai/SECURITY.md',
  '.ai/ACCESSIBILITY.md',
  '.ai/TEST_STRATEGY.md',
  '.ai/PHASES.md',
  '.ai/TRACKING.md',
  '.ai/DECISIONS.md',
  '.ai/BLOCKERS.md',
  '.ai/CHANGELOG.md',
  '.ai/HANDOFF.md',
  '.ai/EXPORT_TARGET_CONTRACT.md',
  '.ai/EXPORT_PARITY_MATRIX.md',
];

export const REQUIRED_TEMPLATES = [
  '.ai/templates/MICROPHASE_TEMPLATE.md',
  '.ai/templates/ADR_TEMPLATE.md',
  '.ai/templates/BUG_TEMPLATE.md',
  '.ai/templates/HANDOFF_TEMPLATE.md',
];

const CONTINUITY_DOCS = ['.ai/STATE.md', '.ai/TRACKING.md', '.ai/HANDOFF.md'];
const EXECUTION_DOCS = ['AGENTS.md', '.ai/README.md', ...CONTINUITY_DOCS, '.ai/PHASES.md'];
const ACTIVE_PATTERNS = [
  /^\s*-\s*(M\d{2}\.\d+)\b[^\n]*:\s*`ACTIVE`\s*\.?\s*$/gm,
  /^\s*\|[^|\n]*\b(M\d{2}\.\d+)\b[^|\n]*\|\s*ACTIVE\s*\|/gm,
  /^\s*(?:F\d{2}\s*\/\s*)?(M\d{2}\.\d+)\b[^\n]*—\s*`ACTIVE`\s*\.?\s*$/gm,
];
const PHASE_PATTERN = /\bF(\d{2})\b/g;
const MICROPHASE_PATTERN = /\bM(\d{2})\.(\d+)\b/g;

function read(root, relativePath) {
  return readFileSync(join(root, relativePath), 'utf8');
}

function unique(values) {
  return [...new Set(values)];
}

export function evaluateDocConventions(root) {
  const errors = [];
  const warnings = [];
  const missingRequired = [...REQUIRED_DOCS, ...REQUIRED_TEMPLATES].filter(
    (relativePath) => !existsSync(join(root, relativePath)),
  );

  if (!existsSync(join(root, '.ai/evidence'))) errors.push('missing .ai/evidence directory');
  if (!existsSync(join(root, '.ai/templates'))) errors.push('missing .ai/templates directory');
  if (!existsSync(join(root, '.ai/adr'))) errors.push('missing .ai/adr directory');
  if (missingRequired.length) errors.push(`missing required docs: ${missingRequired.join(', ')}`);

  const activeIds = [];
  for (const relativePath of CONTINUITY_DOCS) {
    if (!existsSync(join(root, relativePath))) continue;
    const content = read(root, relativePath);
    for (const pattern of ACTIVE_PATTERNS) {
      pattern.lastIndex = 0;
      for (const match of content.matchAll(pattern)) activeIds.push(match[1]);
    }
  }
  const uniqueActiveIds = unique(activeIds);
  if (uniqueActiveIds.length !== 1) {
    errors.push(`expected exactly one ACTIVE microphase, found: ${uniqueActiveIds.join(', ') || 'none'}`);
  }

  const referencedPhaseIds = new Set();
  const referencedMicrophaseIds = new Set();
  for (const relativePath of EXECUTION_DOCS) {
    if (!existsSync(join(root, relativePath))) continue;
    const content = read(root, relativePath);
    for (const match of content.matchAll(PHASE_PATTERN)) referencedPhaseIds.add(`F${match[1]}`);
    for (const match of content.matchAll(MICROPHASE_PATTERN)) {
      referencedMicrophaseIds.add(`M${match[1]}.${match[2]}`);
    }
  }

  for (const phaseId of referencedPhaseIds) {
    const phasePath = `.ai/phases/${phaseId}.md`;
    if (!existsSync(join(root, phasePath))) errors.push(`missing phase target for ${phaseId}: ${phasePath}`);
  }

  for (const microphaseId of referencedMicrophaseIds) {
    const [phasePart, stepPart] = microphaseId.slice(1).split('.');
    const microphasePath = `.ai/microphases/M${phasePart}_${stepPart}.md`;
    if (!existsSync(join(root, microphasePath))) {
      errors.push(`missing microphase target for ${microphaseId}: ${microphasePath}`);
    }
  }

  if (existsSync(join(root, '.ai/MEMORY.md'))) {
    const memory = read(root, '.ai/MEMORY.md');
    if (/\b(active gate|EN_CURSO|READY|pending|run `?\d{8,})/i.test(memory)) {
      errors.push('MEMORY.md contains progress/log state; keep only stable decisions and invariants');
    }
  }

  if (existsSync(join(root, '.ai/HANDOFF.md')) && uniqueActiveIds.length === 1) {
    const handoff = read(root, '.ai/HANDOFF.md');
    if (!handoff.includes(uniqueActiveIds[0])) {
      errors.push(`HANDOFF.md does not point to ACTIVE microphase ${uniqueActiveIds[0]}`);
    }
  }

  if (existsSync(join(root, 'AGENTS.md'))) {
    const agents = read(root, 'AGENTS.md');
    const markdownRefs = (agents.match(/\.ai\/[A-Za-z0-9_./-]+\.md/g) ?? []).length;
    if (markdownRefs > 12) warnings.push(`AGENTS.md references ${markdownRefs} markdown files; keep the entry point minimal`);
  }

  return {
    status: errors.length === 0 ? 'ready' : 'blocked',
    activeMicrophase: uniqueActiveIds[0] ?? null,
    errors,
    warnings,
    requiredDocs: REQUIRED_DOCS.length,
    requiredTemplates: REQUIRED_TEMPLATES.length,
    referencedPhaseIds: [...referencedPhaseIds].sort(),
    referencedMicrophaseIds: [...referencedMicrophaseIds].sort(),
  };
}
