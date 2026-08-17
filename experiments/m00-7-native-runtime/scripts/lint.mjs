import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
const root = new URL('..', import.meta.url);
const allow = new Set(['.ts', '.tsx', '.mjs', '.js', '.json']);
const files = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (['node_modules', '.generated', 'android', 'ios'].includes(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (allow.has(extname(entry.name))) files.push(full);
  }
}
await walk(root.pathname);
for (const file of files) {
  const source = await readFile(file, 'utf8');
  const temporaryMarker = new RegExp(['TO', 'DO|FIX', 'ME'].join(''));
  const unstableTabs = ['unstable', 'native', 'tabs'].join('-');
  const directNavigation = ['@react', 'navigation/'].join('-');
  if (temporaryMarker.test(source)) throw new Error(`temporary marker in ${relative(root.pathname, file)}`);
  if (source.includes(unstableTabs) && !file.endsWith('source-contract.test.mjs')) throw new Error(`unstable native tabs forbidden: ${file}`);
  if (source.includes(directNavigation) && !file.endsWith('source-contract.test.mjs')) throw new Error(`direct React Navigation import forbidden: ${file}`);
}
const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
if (packageJson.dependencies?.['expo-camera']) throw new Error('permission-free baseline must not install expo-camera');
console.log(`PASS_LINT ${files.length} source/config modules`);
