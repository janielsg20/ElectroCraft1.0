import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import * as rete from 'rete'
import * as engine from 'rete-engine'
import * as history from 'rete-history-plugin'
import * as area from 'rete-area-plugin'
import { createActionFlowHarness } from '../src/rete-adapter.mjs'

const graph = JSON.parse(await readFile(new URL('../fixtures/action-graph.json', import.meta.url), 'utf8'))
const harness = await createActionFlowHarness({ rete, engine, history, area }, graph, { priority: 'high' })
const { ClassicPreset } = rete
const socket = new ClassicPreset.Socket('history-proof')

const temp = new ClassicPreset.Node('history-temp')
temp.data = () => ({ payload: {} })
temp.execute = () => {}
temp.dataInputs = []
temp.dataOutputs = ['payload']
temp.controlInputs = []
temp.controlOutputs = ['next']
temp.addOutput('next', new ClassicPreset.Output(socket, 'next'))
temp.addOutput('payload', new ClassicPreset.Output(socket, 'payload'))
await harness.editor.addNode(temp)
await harness.area.translate(temp.id, { x: 0, y: 0 })
harness.history.separate()
assert.ok(harness.editor.getNode(temp.id))
await harness.history.undo()
assert.equal(harness.editor.getNode(temp.id), undefined)
await harness.history.redo()
assert.ok(harness.editor.getNode(temp.id))

harness.history.clear()
const target = harness.nodeByCanonical.get('condition-priority')
const connection = new ClassicPreset.Connection(temp, 'next', target, 'exec')
await harness.editor.addConnection(connection)
harness.history.separate()
assert.ok(harness.editor.getConnection(connection.id))
await harness.history.undo()
assert.equal(harness.editor.getConnection(connection.id), undefined)
await harness.history.redo()
assert.ok(harness.editor.getConnection(connection.id))

const artifact = { status: 'PASS_REAL_RETE_HISTORY', nodeUndoRedo: true, connectionUndoRedo: true, historyRecords: harness.history.getHistorySnapshot().length }
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true })
await writeFile(new URL('../artifacts/history-real.json', import.meta.url), JSON.stringify(artifact, null, 2) + '\n')
console.log(JSON.stringify(artifact))
