import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const files = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else files.push(full);
  }
}
await walk(dist);
files.sort();
const hash = createHash('sha256');
let bytes = 0;
for (const file of files) {
  const data = await readFile(file);
  bytes += data.byteLength;
  hash.update(path.relative(dist, file));
  hash.update(data);
}
const result = { status: 'PASS_BUILD', files: files.length, bytes, sha256: hash.digest('hex') };
await mkdir(path.join(root, 'artifacts'), { recursive: true });
await writeFile(path.join(root, 'artifacts', 'build-summary.json'), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result));
