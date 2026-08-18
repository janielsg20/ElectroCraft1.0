import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { generationPlanSchema } from '../dist/shared/contracts.js';
import { CURRENT_RUNTIME_MODELS, serializeCanonicalAISelection } from '../dist/shared/model-resolver.js';

const fixture = async (name) => JSON.parse(await readFile(new URL(`../fixtures/${name}`, import.meta.url), 'utf8'));

test('valid code GenerationPlanPoc passes Zod', async () => {
  assert.equal(generationPlanSchema.parse(await fixture('structured-output.valid.json')).artifactType, 'component');
});
test('invalid GenerationPlanPoc fails closed', async () => {
  assert.equal(generationPlanSchema.safeParse(await fixture('structured-output.invalid.json')).success, false);
});
test('canonical AI selection persists logical profile only', () => {
  assert.deepEqual(serializeCanonicalAISelection('Código'), { profile: 'Código' });
  assert.ok(!JSON.stringify(serializeCanonicalAISelection('Código')).includes(CURRENT_RUNTIME_MODELS.Código));
});
