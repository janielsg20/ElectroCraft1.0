import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import * as rete from '../vendor-source/rete-runtime.mjs'
import * as engine from '../vendor-source/rete-engine-runtime.mjs'
import * as historyRuntime from '../vendor-source/rete-history-runtime.mjs'
import { createActionFlowHarness } from '../src/rete-adapter.mjs'

const graph = JSON.parse(await readFile(new URL('../fixtures/action-graph.json', import.meta.url), 'utf8'))
const deps = { rete, engine, history: historyRuntime, area: { BaseAreaPlugin: historyRuntime.BaseAreaPlugin } }

test('official-source history preset undoes/redoes node and connection', async () => {
  const harness = await createActionFlowHarness(deps, graph, { priority: 'high' })
  const socket = new rete.ClassicPreset.Socket('history-proof')
  const temp = new rete.ClassicPreset.Node('history-temp')
  temp.data = () => ({ payload: {} })
  temp.execute = () => {}
  temp.dataInputs = []
  temp.dataOutputs = ['payload']
  temp.controlInputs = []
  temp.controlOutputs = ['next']
  temp.addOutput('next', new rete.ClassicPreset.Output(socket, 'next'))
  temp.addOutput('payload', new rete.ClassicPreset.Output(socket, 'payload'))

  await harness.editor.addNode(temp)
  await harness.area.translate(temp.id, { x: 0, y: 0 })
  harness.history.separate()
  await harness.history.undo()
  assert.equal(harness.editor.getNode(temp.id), undefined)
  await harness.history.redo()
  assert.ok(harness.editor.getNode(temp.id))

  harness.history.clear()
  const target = harness.nodeByCanonical.get('condition-priority')
  const connection = new rete.ClassicPreset.Connection(temp, 'next', target, 'exec')
  await harness.editor.addConnection(connection)
  harness.history.separate()
  await harness.history.undo()
  assert.equal(harness.editor.getConnection(connection.id), undefined)
  await harness.history.redo()
  assert.ok(harness.editor.getConnection(connection.id))
})
