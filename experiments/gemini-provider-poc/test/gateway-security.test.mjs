import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createClientGatewayRequest } from '../dist/client/gateway-contract.js';
import { AIProviderUnavailableError, createGeminiGateway } from '../dist/server/gateway.js';

test('client gateway request contains no credential field', () => {
  const request = createClientGatewayRequest({ operation: 'structured-plan', profile: 'Automático', prompt: 'Crear borrador' });
  assert.deepEqual(Object.keys(request).sort(), ['operation', 'profile', 'prompt']);
});
test('provider unavailable fails closed without key', () => {
  assert.throws(() => createGeminiGateway({ apiKey: '' }), AIProviderUnavailableError);
});
test('pre-aborted request fails before provider network call', async () => {
  const gateway = createGeminiGateway({ apiKey: 'diagnostic-not-a-real-key' });
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(gateway.generatePlan({ prompt: 'x', abortSignal: controller.signal }), (error) => error?.name === 'AbortError');
});
test('client source has no provider import or secret name', async () => {
  const source = await readFile(new URL('../src/client/gateway-contract.ts', import.meta.url), 'utf8');
  for (const forbidden of ['@ai-sdk/google', '@google/genai', 'GEMINI_API_KEY', 'GOOGLE_GENERATIVE_AI_API_KEY', 'apiKey']) assert.ok(!source.includes(forbidden));
});
