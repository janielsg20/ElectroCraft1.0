import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const lock = JSON.parse(await readFile(new URL('../package-lock.json', import.meta.url), 'utf8'));
assert.ok(lock.lockfileVersion >= 3, 'npm lockfile v3+ required');
for (const [name, version] of Object.entries({ ...pkg.dependencies, ...pkg.devDependencies })) {
  assert.equal(lock.packages?.['']?.dependencies?.[name] ?? lock.packages?.['']?.devDependencies?.[name], version, `${name} root pin mismatch`);
  assert.equal(lock.packages?.[`node_modules/${name}`]?.version, version, `${name} lock version mismatch`);
}
console.log(JSON.stringify({ status: 'PASS_LOCKFILE', lockfileVersion: lock.lockfileVersion, directPins: Object.keys(pkg.dependencies).length + Object.keys(pkg.devDependencies).length }));
