import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const roots = ['src', 'scripts', 'test', 'vendor-source']
const files = []
async function walk(path) {
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const next = join(path, entry.name)
    if (entry.isDirectory()) await walk(next)
    else if (entry.name.endsWith('.mjs')) files.push(next)
  }
}
for (const root of roots) await walk(root)
let failures = []
for (const file of files) {
  const text = await readFile(file, 'utf8')
  if (file !== 'scripts/lint.mjs' && /\bTODO\b|\bFIXME\b|placeholder/i.test(text)) failures.push(`${file}: temporary marker`)
  if (file.startsWith('src/') && /vendor-source/.test(text)) failures.push(`${file}: product adapter must not import source snapshots`)
  if (file === 'src/action-graph.mjs' && /from ['\"]rete/.test(text)) failures.push(`${file}: canonical model imports engine`)
}
if (failures.length) { console.error(failures.join('\n')); process.exit(1) }
console.log(`PASS_LINT ${files.length} modules`)
