import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
async function sourceFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await sourceFiles(full));
    else if (entry.name.endsWith('.ts')) out.push(full);
  }
  return out;
}

test('direct Google SDK stays inside one narrow native capability adapter', async () => {
  const files = await sourceFiles(path.join(root, 'src'));
  const directImports = [];
  for (const file of files) {
    if ((await readFile(file, 'utf8')).includes('@google/genai')) directImports.push(path.relative(root, file));
  }
  assert.deepEqual(directImports, ['src/server/gemini-native-capability-adapter.ts']);
});

test('primary gateway delegates structured/tools/stream/image to AI SDK', async () => {
  const source = await readFile(path.join(root, 'src/server/gateway.ts'), 'utf8');
  for (const token of ['generateText', 'Output.object', 'tool(', 'streamText', 'generateImage', '@ai-sdk/google']) assert.ok(source.includes(token), token);
  assert.ok(!source.includes('@google/genai'));
});
