// @ts-check
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { validatePhaseGraph, validateCriticalOrder, validateArchitectureDecisions, computeClosureState } from '../src/validator.js';

const graph = JSON.parse(await readFile(new URL('../fixtures/phase-dependencies.json', import.meta.url), 'utf8'));
const decisions = JSON.parse(await readFile(new URL('../fixtures/architecture-decisions.json', import.meta.url), 'utf8'));
const errors = [...validatePhaseGraph(graph), ...validateCriticalOrder(graph), ...validateArchitectureDecisions(decisions)];
if (errors.length) throw new Error(errors.join('\n'));
const closure = computeClosureState(decisions);
const payload = {
  generatedAt: new Date().toISOString(),
  phaseCount: graph.phases.length,
  engineDecisionCount: decisions.engines.length,
  targetCount: decisions.targets.length,
  rejectedAlternativeCount: decisions.rejectedAlternatives.length,
  eliminatedDuplicationCount: decisions.eliminatedDuplications.length,
  closure,
  matrixSha256: createHash('sha256').update(JSON.stringify(decisions)).digest('hex')
};
await mkdir('dist', { recursive: true });
await writeFile('dist/closure-report.json', `${JSON.stringify(payload, null, 2)}\n`);
console.log(JSON.stringify(payload));
console.log('PASS_ARCHITECTURE_MATRIX');
