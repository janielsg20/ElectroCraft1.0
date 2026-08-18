import { execFileSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const roots = ['src','scripts','public','test'];
const files = [];
for (const root of roots) walk(root);
function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path);
    else if (/\.(?:js|mjs)$/.test(entry)) files.push(path);
  }
}
for (const file of files) execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
console.log(`PASS_LINT ${files.length} JS files syntax-checked`);
