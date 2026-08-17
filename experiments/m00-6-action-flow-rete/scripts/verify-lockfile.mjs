import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const expected = {
  rete: '2.0.6',
  'rete-area-plugin': '2.3.2',
  'rete-engine': '2.1.1',
  'rete-history-plugin': '2.2.0'
}
const lock = JSON.parse(await readFile(new URL('../package-lock.json', import.meta.url), 'utf8'))
assert.ok(lock.lockfileVersion >= 3, 'npm lockfile v3+ required')
for (const [name, version] of Object.entries(expected)) {
  assert.equal(lock.packages?.['']?.dependencies?.[name], version, `${name} root pin mismatch`)
  assert.equal(lock.packages?.[`node_modules/${name}`]?.version, version, `${name} lock version mismatch`)
}
assert.equal(lock.packages?.['node_modules/@babel/runtime']?.version, '7.29.7', '@babel/runtime override mismatch')
console.log('PASS_LOCKFILE ' + JSON.stringify({ lockfileVersion: lock.lockfileVersion, ...expected, '@babel/runtime': '7.29.7' }))
