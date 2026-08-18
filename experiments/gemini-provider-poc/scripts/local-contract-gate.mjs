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
for (const model of ['gemini-3.5-flash-lite', 'gemini-3.6-flash']) assert.ok(resolver.includes(model));
assert.match(resolver, /"Código"/);
assert.ok(!resolver.includes('flash-image'));
assert.match(resolver, /serializeCanonicalAISelection/);
const gateway = await read('src/server/gateway.ts');
for (const token of ['Output.object', 'codeArtifactSchema', 'generateCodeArtifact', 'stepCountIs(3)', 'streamText', 'streamCodeDraft']) assert.ok(gateway.includes(token), token);
for (const removed of ['generateImage', 'google.image']) assert.ok(!gateway.includes(removed), removed);
const native = await read('src/server/gemini-native-capability-adapter.ts');
assert.match(native, /apiVersion:\s*"v1"/);
assert.match(native, /interactions\.create/);
assert.match(native, /POC_INTERACTIONS_CODE_OK/);
const client = await read('src/client/gateway-contract.ts');
for (const forbidden of ['@ai-sdk/google', '@google/genai', 'GEMINI_API_KEY', 'apiKey']) assert.ok(!client.includes(forbidden), forbidden);
const policy = await read('src/shared/tool-policy.ts');
for (const allowed of ['draft_create_component', 'draft_create_plugin', 'draft_create_section', 'validate_code_draft']) assert.ok(policy.includes(allowed));
for (const forbidden of ['apply_to_project', 'write_database', 'execute_sql', 'access_secret', 'deploy']) assert.ok(policy.includes(forbidden));
const valid = JSON.parse(await read('fixtures/structured-output.valid.json'));
const invalid = JSON.parse(await read('fixtures/structured-output.invalid.json'));
const code = JSON.parse(await read('fixtures/code-artifact.valid.json'));
assert.equal(valid.artifactType, 'component');
assert.ok(valid.title && valid.steps.length >= 1);
assert.ok(!invalid.title && invalid.requestedTools.includes('apply_to_project'));
assert.equal(code.draftOnly, true);
assert.ok(code.files.some((file) => file.path === code.entryFile));
const all = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else all.push(full);
  }
}
await walk(path.join(root, 'src'));
console.log(JSON.stringify({ status: 'PASS_LOCAL_CONTRACT_GATE', sourceModules: all.length, purpose: 'code-generation', livePackages: 'CI_REQUIRED' }));
