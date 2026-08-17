import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const expected = {
  '@ai-sdk/google': '4.0.31',
  '@google/genai': '2.15.0',
  ai: '7.0.48',
  zod: '4.4.3',
  typescript: '6.0.3',
};
const actual = {};
for (const [name, version] of Object.entries(expected)) {
  const manifest = JSON.parse(await readFile(path.join(root, 'node_modules', ...name.split('/'), 'package.json'), 'utf8'));
  if (manifest.version !== version) throw new Error(`${name}: expected ${version}, got ${manifest.version}`);
  actual[name] = manifest.version;
}
console.log('PASS_INSTALLED_VERSIONS', JSON.stringify(actual));
