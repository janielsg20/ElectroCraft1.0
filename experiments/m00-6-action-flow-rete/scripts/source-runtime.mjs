import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import * as rete from '../vendor-source/rete-runtime.mjs'
import * as engine from '../vendor-source/rete-engine-runtime.mjs'
import * as historyRuntime from '../vendor-source/rete-history-runtime.mjs'
import { createActionFlowHarness } from '../src/rete-adapter.mjs'

const graph = JSON.parse(await readFile(new URL('../fixtures/action-graph.json', import.meta.url), 'utf8'))
const deps = { rete, engine, history: historyRuntime, area: { BaseAreaPlugin: historyRuntime.BaseAreaPlugin } }
const harness = await createActionFlowHarness(deps, graph, { priority: 'high', status: 'new' })
const started = performance.now()
const trueResult = await harness.execute({ priority: 'high', status: 'new' })
const elapsed = performance.now() - started
assert.equal(trueResult.output.status, 'processed')
assert.equal(trueResult.toasts.length, 1)
const falseResult = await harness.execute({ priority: 'low', status: 'new' })
assert.equal(falseResult.output, undefined)
assert.equal(falseResult.toasts.length, 0)

await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true })
const result = {
  status: 'PASS_SOURCE_TAG_RUNTIME',
  note: 'Offline evidence executes runtime-transpiled official tagged source; product adapter still targets published npm packages.',
  trueTrace: trueResult.trace,
  falseTrace: falseResult.trace,
  trueOutput: trueResult.output,
  toastCount: trueResult.toasts.length,
  elapsedMs: Number(elapsed.toFixed(4))
}
await writeFile(new URL('../artifacts/source-runtime.json', import.meta.url), JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify(result))
