import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { codeArtifactSchema } from '../dist/shared/contracts.js';
import { UnsafeGeneratedCodeError, validateGeneratedCodeArtifact } from '../dist/server/gateway.js';

const fixture = async () => JSON.parse(await readFile(new URL('../fixtures/code-artifact.valid.json', import.meta.url), 'utf8'));

test('multi-file code artifact validates as Draft', async () => {
  const artifact = codeArtifactSchema.parse(await fixture());
  assert.equal(validateGeneratedCodeArtifact(artifact).draftOnly, true);
  assert.ok(artifact.files.some((file) => file.path === artifact.entryFile));
});

test('provider schema accepts boolean but ElectroCraft rejects draftOnly=false', async () => {
  const raw = await fixture();
  raw.draftOnly = false;
  const artifact = codeArtifactSchema.parse(raw);
  assert.equal(artifact.draftOnly, false);
  assert.throws(() => validateGeneratedCodeArtifact(artifact), UnsafeGeneratedCodeError);
});

test('code artifact rejects parent traversal', async () => {
  const artifact = codeArtifactSchema.parse(await fixture());
  artifact.files[0].path = '../escape.tsx';
  artifact.entryFile = '../escape.tsx';
  assert.throws(() => validateGeneratedCodeArtifact(artifact), UnsafeGeneratedCodeError);
});

test('code artifact rejects secret references', async () => {
  const artifact = codeArtifactSchema.parse(await fixture());
  artifact.files[0].content = 'const key = process.env.GEMINI_API_KEY;';
  assert.throws(() => validateGeneratedCodeArtifact(artifact), UnsafeGeneratedCodeError);
});
