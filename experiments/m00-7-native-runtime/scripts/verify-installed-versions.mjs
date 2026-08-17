import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
const expected = {
  '@refinedev/core': '5.0.12',
  'drizzle-orm': '0.45.2',
  expo: '57.0.9',
  'expo-constants': '57.0.8',
  'expo-linking': '57.0.4',
  'expo-router': '57.0.9',
  'expo-sqlite': '57.0.1',
  react: '19.2.3',
  'react-native': '0.86.2',
  'react-native-safe-area-context': '5.7.0',
  'react-native-screens': '4.26.0',
  zustand: '5.0.14',
  typescript: '6.0.3'
};
const root = new URL('..', import.meta.url).pathname;
for (const [name, version] of Object.entries(expected)) {
  const manifest = JSON.parse(await readFile(join(root, 'node_modules', ...name.split('/'), 'package.json'), 'utf8'));
  assert.equal(manifest.version, version, `${name} version mismatch`);
}
console.log('PASS_INSTALLED_VERSIONS ' + JSON.stringify(expected));
