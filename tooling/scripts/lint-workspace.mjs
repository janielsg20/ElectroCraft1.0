import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { collectWorkspace, validateWorkspaceSnapshot } from '../src/boundaries.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const snapshot = collectWorkspace(root);
const result = validateWorkspaceSnapshot(snapshot);
if (!result.ok) {
  console.error(result.errors.join('\n'));
  process.exit(1);
}

const scripts = [];
for (const base of ['tooling/scripts', 'tooling/src', 'tooling/test']) {
  const dir = path.join(root, base);
  for (const file of fs.readdirSync(dir)) if (file.endsWith('.mjs')) scripts.push(path.join(dir, file));
}
for (const file of scripts) {
  const check = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (check.status !== 0) {
    process.stderr.write(check.stderr);
    process.exit(check.status ?? 1);
  }
}
console.log(`PASS_LINT_WORKSPACE packages=${Object.keys(snapshot.boundaries.packages).length} apps=${Object.keys(snapshot.boundaries.apps).length} scripts=${scripts.length}`);
