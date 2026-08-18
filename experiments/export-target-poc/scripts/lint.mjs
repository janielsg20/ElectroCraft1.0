import { execFileSync } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';
const roots = ['src', 'scripts', 'test', 'public'];
let checked = 0;
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (['.js', '.mjs'].includes(extname(path))) {
      execFileSync(process.execPath, ['--check', path], { stdio: 'pipe' });
      checked += 1;
    }
  }
}
for (const root of roots) await walk(root);
console.log(`PASS_LINT ${checked} JS modules syntax-checked`);
