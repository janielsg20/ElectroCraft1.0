import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import * as rete from '../vendor-source/rete-runtime.mjs'
import * as engine from '../vendor-source/rete-engine-runtime.mjs'
import * as historyRuntime from '../vendor-source/rete-history-runtime.mjs'
import { createActionFlowHarness } from '../src/rete-adapter.mjs'

const graph = JSON.parse(await readFile(new URL('../fixtures/action-graph.json', import.meta.url), 'utf8'))
const deps = { rete, engine, history: historyRuntime, area: { BaseAreaPlugin: historyRuntime.BaseAreaPlugin } }

test('official-source runtime follows true branch through ControlFlow/Dataflow', async () => {
  const harness = await createActionFlowHarness(deps, graph, { priority: 'high', status: 'new' })
  const result = await harness.execute({ priority: 'high', status: 'new' })
  assert.equal(result.output.status, 'processed')
  assert.deepEqual(result.trace, ['trigger-record-created', 'condition-priority', 'data-mark-processed', 'toast-processed'])
  assert.equal(result.toasts[0].message, 'Registro procesado')
})

test('official-source runtime blocks false branch without side effects', async () => {
  const harness = await createActionFlowHarness(deps, graph, { priority: 'low', status: 'new' })
  const result = await harness.execute({ priority: 'low', status: 'new' })
  assert.equal(result.output, undefined)
  assert.deepEqual(result.toasts, [])
  assert.deepEqual(result.trace, ['trigger-record-created', 'condition-priority'])
})

test('canonical snapshot contains no engine instances', async () => {
  const harness = await createActionFlowHarness(deps, graph, { priority: 'high' })
  const snapshot = harness.snapshotCanonical()
  assert.equal(Object.getPrototypeOf(snapshot), Object.prototype)
  assert.equal(JSON.stringify(snapshot).includes('NodeEditor'), false)
})
