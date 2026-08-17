import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const files = [];
for (const dir of ['src','scripts','test']) {
  for (const name of fs.readdirSync(path.join(root, dir))) if (name.endsWith('.mjs')) files.push(path.join(root, dir, name));
}
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) { process.stderr.write(result.stderr); process.exit(result.status ?? 1); }
}
console.log(`Typecheck OK: ${files.length} ESM modules parse under Node ${process.version}.`);
