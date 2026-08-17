import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import * as rete from 'rete'
import * as engine from 'rete-engine'
import * as history from 'rete-history-plugin'
import * as area from 'rete-area-plugin'
import { createActionFlowHarness } from '../src/rete-adapter.mjs'

const graph = JSON.parse(await readFile(new URL('../fixtures/action-graph.json', import.meta.url), 'utf8'))
const harness = await createActionFlowHarness({ rete, engine, history, area }, graph, { priority: 'high', status: 'new' })
const started = performance.now()
const result = await harness.execute({ priority: 'high', status: 'new', recordId: 'rec-001' })
const elapsed = performance.now() - started
assert.equal(result.output.status, 'processed')
assert.equal(result.output.recordId, 'rec-001')
assert.equal(result.toasts[0].message, 'Registro procesado')
assert.deepEqual(result.trace, ['trigger-record-created', 'condition-priority', 'data-mark-processed', 'toast-processed'])
const falseResult = await harness.execute({ priority: 'low', status: 'new' })
assert.equal(falseResult.output, undefined)
assert.deepEqual(falseResult.toasts, [])

const artifact = { status: 'PASS_REAL_RETE_ENGINE', elapsedMs: Number(elapsed.toFixed(4)), trueTrace: result.trace, falseTrace: falseResult.trace, generatedConnections: harness.generatedConnections.length }
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true })
await writeFile(new URL('../artifacts/integration-real.json', import.meta.url), JSON.stringify(artifact, null, 2) + '\n')
console.log(JSON.stringify(artifact))
