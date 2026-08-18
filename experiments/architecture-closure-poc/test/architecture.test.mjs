import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validatePhaseGraph, validateCriticalOrder, validateArchitectureDecisions, computeClosureState } from '../src/validator.js';

const load = async (name) => JSON.parse(await readFile(new URL(`../fixtures/${name}`, import.meta.url), 'utf8'));

test('F00-F27 have owners and dependencies only point backward', async () => {
  const graph = await load('phase-dependencies.json');
  assert.deepEqual(validatePhaseGraph(graph), []);
});

test('Navigation precedes Data Sources; Data Sources precede Queries and Admin', async () => {
  const graph = await load('phase-dependencies.json');
  assert.deepEqual(validateCriticalOrder(graph), []);
});

test('architecture matrix covers required engines and nine Core targets', async () => {
  const decisions = await load('architecture-decisions.json');
  assert.deepEqual(validateArchitectureDecisions(decisions), []);
});

test('Internal Data remains a first-class Data Source', async () => {
  const decisions = await load('architecture-decisions.json');
  assert.equal(decisions.canonicalProduct.internalData, 'DataSourceDefinition(kind=internal)');
});

test('Gemini native adapter is narrow, not a second provider abstraction', async () => {
  const decisions = await load('architecture-decisions.json');
  const native = decisions.engines.find((engine) => engine.id === 'gemini-native-capability-adapter');
  assert.equal(native.decision, 'accept-narrow');
  assert.deepEqual(native.allowedCapabilities, ['interactions-v1']);
  assert.ok(native.forbidden.includes('generic-provider-abstraction'));
});

test('closure remains blocked until M00.9 and M00.10 conditional engines are green', async () => {
  const decisions = await load('architecture-decisions.json');
  const closure = computeClosureState(decisions);
  assert.equal(closure.state, 'blocked');
  assert.deepEqual(closure.conditional.sort(), ['data-sources-gateway','export-targets']);
});
