import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const here = path.dirname(new URL(import.meta.url).pathname);
const root = path.resolve(here, '..');
const validator = spawnSync(process.execPath, [path.join(here, 'validate-audit.mjs')], { encoding: 'utf8' });
process.stdout.write(validator.stdout); process.stderr.write(validator.stderr);
if (validator.status !== 0) process.exit(validator.status ?? 1);
const scan = JSON.parse(fs.readFileSync(path.join(root, 'microphase-scan.json'), 'utf8'));
if (scan.hits.length) throw new Error(`microphase duplication scan has ${scan.hits.length} hit(s)`);
for (const file of ['engine-audit.json','README.md','src/permission-adapter.mjs','test/audit-matrix.test.mjs','test/permission-adapter.test.mjs','test/storage-integration.test.mjs']) {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`missing required fixture file: ${file}`);
}
console.log('Lint OK: audit shape, ownership scan and required fixture files are clean.');
