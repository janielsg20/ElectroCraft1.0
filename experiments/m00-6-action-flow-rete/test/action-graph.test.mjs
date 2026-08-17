import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { applyOperation, assertPortableGraph, evaluatePredicate, validateActionGraph } from '../src/action-graph.mjs'

const fixture = JSON.parse(await readFile(new URL('../fixtures/action-graph.json', import.meta.url), 'utf8'))

test('canonical graph validates and remains plain JSON', () => {
  const graph = validateActionGraph(fixture)
  assert.equal(graph.nodes.length, 4)
  assert.equal(graph.edges.length, 3)
  assert.equal(assertPortableGraph(graph), true)
  assert.deepEqual(JSON.parse(JSON.stringify(graph)), graph)
})

test('condition eq is deterministic', () => {
  assert.equal(evaluatePredicate({ field: 'priority', operator: 'eq', value: 'high' }, { priority: 'high' }), true)
  assert.equal(evaluatePredicate({ field: 'priority', operator: 'eq', value: 'high' }, { priority: 'low' }), false)
})

test('data set is immutable against input payload', () => {
  const input = { status: 'new', meta: { count: 1 } }
  const result = applyOperation({ type: 'set', path: 'status', value: 'processed' }, input)
  assert.equal(result.status, 'processed')
  assert.equal(input.status, 'new')
})

test('unsupported condition semantics fail closed', () => {
  assert.throws(() => validateActionGraph({ ...fixture, nodes: fixture.nodes.map(n => n.kind === 'condition' ? { ...n, predicate: { ...n.predicate, operator: 'contains' } } : n) }), /CONDITION_OPERATOR_UNSUPPORTED/)
})

test('unsafe data path fails closed', () => {
  assert.throws(() => applyOperation({ type: 'set', path: '__proto__.polluted', value: true }, {}), /DATA_PATH_UNSAFE/)
})
