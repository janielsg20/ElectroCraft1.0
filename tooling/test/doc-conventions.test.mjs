import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { REQUIRED_DOCS, REQUIRED_TEMPLATES, evaluateDocConventions } from '../src/doc-conventions.mjs';

const fixtureCases = JSON.parse(
  readFileSync(new URL('../fixtures/doc-conventions/cases.json', import.meta.url), 'utf8'),
);

function createFixture({ active = ['M01.6'], memory = 'Stable invariant only.' } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'electrocraft-docs-'));
  for (const relativePath of [...REQUIRED_DOCS, ...REQUIRED_TEMPLATES]) {
    const target = join(root, relativePath);
    mkdirSync(join(target, '..'), { recursive: true });
    writeFileSync(target, '# fixture\n', 'utf8');
  }
  for (const relativePath of ['.ai/evidence', '.ai/templates', '.ai/adr', '.ai/phases', '.ai/microphases']) {
    mkdirSync(join(root, relativePath), { recursive: true });
  }
  writeFileSync(join(root, '.ai/phases/F01.md'), '# F01\n', 'utf8');
  writeFileSync(join(root, '.ai/microphases/M01_6.md'), '# M01.6\n', 'utf8');
  const activeLines = active.map((id) => `- ${id} — fixture: \`ACTIVE\`.`).join('\n');
  writeFileSync(join(root, '.ai/STATE.md'), `# STATE\n${activeLines}\n`, 'utf8');
  writeFileSync(join(root, '.ai/TRACKING.md'), '# TRACKING\n', 'utf8');
  writeFileSync(join(root, '.ai/HANDOFF.md'), `# HANDOFF\nNext: ${active[0] ?? 'none'}\n`, 'utf8');
  writeFileSync(join(root, '.ai/MEMORY.md'), `# MEMORY\n${memory}\n`, 'utf8');
  writeFileSync(join(root, '.ai/PHASES.md'), '# PHASES\nF01 / M01.6\n', 'utf8');
  writeFileSync(join(root, 'AGENTS.md'), '# AGENTS\n.ai/STATE.md\n', 'utf8');
  return root;
}

test('documentation contract is ready for one active microphase', () => {
  const root = createFixture({ active: fixtureCases.ready.active });
  try {
    const report = evaluateDocConventions(root);
    assert.equal(report.status, fixtureCases.ready.expected);
    assert.equal(report.activeMicrophase, 'M01.6');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('multiple active microphases fail closed', () => {
  const root = createFixture({ active: fixtureCases.multipleActive.active });
  try {
    const report = evaluateDocConventions(root);
    assert.equal(report.status, fixtureCases.multipleActive.expected);
    assert.match(report.errors.join('\n'), /exactly one ACTIVE microphase/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('progress logs in MEMORY fail closed', () => {
  const root = createFixture({ memory: fixtureCases.staleMemory.memory });
  try {
    const report = evaluateDocConventions(root);
    assert.equal(report.status, fixtureCases.staleMemory.expected);
    assert.match(report.errors.join('\n'), /MEMORY\.md contains progress\/log state/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
