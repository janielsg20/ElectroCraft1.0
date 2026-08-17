import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFile(path.join(root, rel), 'utf8');
const packageJson = JSON.parse(await read('package.json'));
assert.deepEqual(packageJson.dependencies, {
  '@ai-sdk/google': '4.0.31',
  '@google/genai': '2.15.0',
  ai: '7.0.48',
  zod: '4.4.3',
});
const resolver = await read('src/shared/model-resolver.ts');
for (const model of ['gemini-flash-latest', 'gemini-3.5-flash-lite', 'gemini-3.6-flash', 'gemini-3.1-flash-image']) assert.ok(resolver.includes(model));
assert.match(resolver, /serializeCanonicalAISelection/);
const gateway = await read('src/server/gateway.ts');
for (const token of ['Output.object', 'stepCountIs(3)', 'streamText', 'generateImage', 'google.image']) assert.ok(gateway.includes(token), token);
const native = await read('src/server/gemini-native-capability-adapter.ts');
assert.match(native, /apiVersion:\s*"v1"/);
assert.match(native, /interactions\.create/);
const client = await read('src/client/gateway-contract.ts');
for (const forbidden of ['@ai-sdk/google', '@google/genai', 'GEMINI_API_KEY', 'apiKey']) assert.ok(!client.includes(forbidden), forbidden);
const policy = await read('src/shared/tool-policy.ts');
for (const forbidden of ['apply_to_project', 'write_database', 'execute_sql', 'access_secret', 'deploy']) assert.ok(policy.includes(forbidden));
const valid = JSON.parse(await read('fixtures/structured-output.valid.json'));
const invalid = JSON.parse(await read('fixtures/structured-output.invalid.json'));
assert.ok(valid.title && valid.steps.length >= 1);
assert.ok(!invalid.title && invalid.requestedTools.includes('apply_to_project'));
const all = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else all.push(full);
  }
}
await walk(path.join(root, 'src'));
console.log(JSON.stringify({ status: 'PASS_LOCAL_CONTRACT_GATE', sourceModules: all.length, livePackages: 'CI_REQUIRED' }));
