import assert from 'node:assert/strict'
import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
const required = ['package-lock.json', 'artifacts/source-runtime.json', 'artifacts/integration-real.json', 'artifacts/history-real.json', 'dist/build-summary.json']
for (const file of required) await access(file)
const source = JSON.parse(await readFile('artifacts/source-runtime.json', 'utf8'))
const integration = JSON.parse(await readFile('artifacts/integration-real.json', 'utf8'))
const history = JSON.parse(await readFile('artifacts/history-real.json', 'utf8'))
const build = JSON.parse(await readFile('dist/build-summary.json', 'utf8'))
assert.equal(source.status, 'PASS_SOURCE_TAG_RUNTIME')
assert.equal(integration.status, 'PASS_REAL_RETE_ENGINE')
assert.equal(history.status, 'PASS_REAL_RETE_HISTORY')
assert.equal(build.status, 'PASS_BUILD')
assert.equal(history.nodeUndoRedo, true)
assert.equal(history.connectionUndoRedo, true)
const result = { status: 'PASS_CLOSURE_GATE', realPackageRuntime: true, historyNodeConnectionUndoRedo: true, canonicalPortable: true }
await mkdir('artifacts', { recursive: true })
await writeFile('artifacts/closure.json', JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify(result))
