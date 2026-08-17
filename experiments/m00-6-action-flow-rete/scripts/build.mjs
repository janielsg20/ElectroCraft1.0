import { createHash } from 'node:crypto'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
const files = []
async function walk(path) {
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const next = join(path, entry.name)
    if (entry.isDirectory()) await walk(next)
    else if (entry.name.endsWith('.mjs') || entry.name.endsWith('.json')) files.push(next)
  }
}
for (const root of ['src', 'fixtures']) await walk(root)
const hash = createHash('sha256')
for (const file of files.sort()) hash.update(file).update(await readFile(file))
const summary = { status: 'PASS_BUILD', moduleCount: files.length, adapterSha256: hash.digest('hex'), canonicalSchemaVersion: 1 }
await mkdir('dist', { recursive: true })
await writeFile('dist/build-summary.json', JSON.stringify(summary, null, 2) + '\n')
console.log(JSON.stringify(summary))
