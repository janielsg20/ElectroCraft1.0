import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const scan = JSON.parse(readFileSync(new URL('../microphase-scan.json', import.meta.url), 'utf8'));
const m003 = readFileSync(new URL('../../../.ai/microphases/M00_3.md', import.meta.url), 'utf8');
const m004 = readFileSync(new URL('../../../.ai/microphases/M00_4.md', import.meta.url), 'utf8');

test('no later microphase explicitly rebuilds audited engine ownership', () => assert.deepEqual(scan.hits, []));
test('M00.3 owns the real Puck Composition POC', () => assert.match(m003, /POC Visual Editor con Puck Composition/));
test('M00.4 owns the real Studio DB PGlite\/Drizzle POC', () => {
  assert.match(m004, /POC Studio DB genérica/);
  assert.match(m004, /PGlite|Drizzle/);
});
