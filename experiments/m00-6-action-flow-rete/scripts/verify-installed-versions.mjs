import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
const expected = { rete: '2.0.6', 'rete-engine': '2.1.1', 'rete-history-plugin': '2.1.1', 'rete-area-plugin': '2.3.2', '@babel/runtime': '7.29.7' }
for (const [name, version] of Object.entries(expected)) {
  const manifest = JSON.parse(await readFile(new URL(`../node_modules/${name}/package.json`, import.meta.url), 'utf8'))
  assert.equal(manifest.version, version, `${name} version mismatch`)
}
console.log('PASS_INSTALLED_VERSIONS ' + JSON.stringify(expected))
