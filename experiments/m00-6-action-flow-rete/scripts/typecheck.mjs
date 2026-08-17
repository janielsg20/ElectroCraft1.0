import { readdir } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
const files = []
async function walk(path) {
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const next = join(path, entry.name)
    if (entry.isDirectory()) await walk(next)
    else if (entry.name.endsWith('.mjs')) files.push(next)
  }
}
for (const root of ['src', 'scripts', 'test', 'vendor-source']) await walk(root)
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' })
  if (result.status !== 0) { process.stderr.write(result.stderr); process.exit(result.status ?? 1) }
}
console.log(`PASS_SYNTAX_TYPE_CONTRACT ${files.length} ESM modules`)
