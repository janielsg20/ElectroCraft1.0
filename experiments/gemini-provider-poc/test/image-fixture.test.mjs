import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { sanitizedImageResponseSchema } from '../dist/shared/contracts.js';

test('sanitized image response fixture validates without image bytes or secrets', async () => {
  const text = await readFile(new URL('../fixtures/image-response.sanitized.json', import.meta.url), 'utf8');
  const parsed = sanitizedImageResponseSchema.parse(JSON.parse(text));
  assert.equal(parsed.logicalProfile, 'Imagen');
  assert.ok(!text.includes('base64'));
  assert.ok(!text.includes('AIza'));
});
