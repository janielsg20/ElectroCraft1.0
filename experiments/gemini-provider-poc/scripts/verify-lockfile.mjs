import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
let lock;
try {
  lock = JSON.parse(await readFile(path.join(root, 'package-lock.json'), 'utf8'));
} catch (error) {
  if (error?.code === 'ENOENT') {
    console.error('BLOCKED_LOCKFILE_MISSING');
    process.exit(2);
  }
  throw error;
}
if (lock.lockfileVersion < 3) throw new Error(`lockfileVersion ${lock.lockfileVersion} < 3`);
const rootEntry = lock.packages?.[''];
if (!rootEntry) throw new Error('Lockfile root package entry missing');
const expected = { ...pkg.dependencies, ...pkg.devDependencies };
for (const [name, version] of Object.entries(expected)) {
  const declared = rootEntry.dependencies?.[name] ?? rootEntry.devDependencies?.[name];
  if (declared !== version) throw new Error(`root lock pin mismatch for ${name}: ${declared} != ${version}`);
  const installed = lock.packages?.[`node_modules/${name}`]?.version;
  if (installed !== version) throw new Error(`installed lock pin mismatch for ${name}: ${installed} != ${version}`);
}
console.log(JSON.stringify({ status: 'PASS_LOCKFILE', lockfileVersion: lock.lockfileVersion, directPins: Object.keys(expected).length }));
