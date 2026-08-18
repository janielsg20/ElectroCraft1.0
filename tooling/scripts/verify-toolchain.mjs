import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const expected = {
  '@eslint/js': '10.0.1',
  '@playwright/test': '1.61.1',
  eslint: '10.8.0',
  prettier: '3.9.6',
  typescript: '7.0.2',
  vite: '8.2.0',
  vitest: '4.1.10',
};
for (const [name, version] of Object.entries(expected)) {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'node_modules', name, 'package.json'), 'utf8'));
  if (manifest.version !== version) throw new Error(`${name}: expected ${version}, got ${manifest.version}`);
}
if (fs.existsSync(path.join(root, 'node_modules/typescript-eslint'))) {
  throw new Error('typescript-eslint must remain absent while TypeScript 7.0.2 is outside its supported range');
}
console.log('PASS_REPOSITORY_TOOLCHAIN ' + Object.entries(expected).map(([k, v]) => `${k}@${v}`).join(' '));
