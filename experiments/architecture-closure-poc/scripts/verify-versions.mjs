import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const expected = {
  '@ai-sdk/google':'4.0.31', '@electric-sql/pglite':'0.5.5', '@puckeditor/core':'0.22.4', '@refinedev/core':'5.0.12',
  '@scalar/openapi-parser':'0.28.11', '@tanstack/query-core':'5.101.2', '@tanstack/table-core':'8.21.3', '@tiptap/html':'3.29.2',
  '@tiptap/starter-kit':'3.29.2', ai:'7.0.48', 'drizzle-orm':'0.45.2', i18next:'26.3.6', react:'19.2.3', 'react-dom':'19.2.3',
  rete:'2.0.6', 'rete-engine':'2.1.1', zustand:'5.0.14', zod:'4.4.3', typescript:'7.0.2'
};
for (const [pkg, version] of Object.entries(expected)) {
  const manifest = JSON.parse(await readFile(`node_modules/${pkg}/package.json`, 'utf8'));
  assert.equal(manifest.version, version, `${pkg} expected ${version}, got ${manifest.version}`);
}
console.log(`PASS_EXACT_VERSIONS ${Object.keys(expected).length}`);
