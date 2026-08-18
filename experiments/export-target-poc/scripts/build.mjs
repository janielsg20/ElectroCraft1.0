import { execFileSync } from 'node:child_process';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

await rm('dist', { recursive: true, force: true });
await rm('artifacts', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await mkdir('artifacts', { recursive: true });
await cp('public', 'dist', { recursive: true });
for (const path of ['capability-report.json', 'ir-fingerprint.txt', 'toolchain-lock.json']) await cp(path, `dist/${path}`);
const ir = JSON.parse(await readFile('capacitor-poc/electrocraft-ir.json', 'utf8'));
await writeFile('dist/ir.json', `${JSON.stringify(ir, null, 2)}\n`);

const archives = [
  ['capacitor-poc-source.zip', 'capacitor-poc'],
  ['lamp-poc-source.zip', 'lamp-poc'],
  ['wordpress-theme-poc.zip', 'wordpress-theme-poc'],
  ['wordpress-plugin-poc.zip', 'wordpress-plugin-poc'],
];
for (const [archive, dir] of archives) {
  execFileSync('zip', ['-qr', resolve('artifacts', archive), '.'], { cwd: resolve(dir) });
}
const sums = [];
for (const [archive] of archives) {
  const bytes = await readFile(resolve('artifacts', archive));
  sums.push(`${createHash('sha256').update(bytes).digest('hex')}  ${archive}`);
}
await writeFile('artifacts/SHA256SUMS.txt', `${sums.join('\n')}\n`);
console.log(`PASS_BUILD harness + ${archives.length} verified ZIP candidates created`);
