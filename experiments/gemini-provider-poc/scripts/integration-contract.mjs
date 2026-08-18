import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { GoogleGenAI } from '@google/genai';
import { Output, generateText, stepCountIs, streamText, tool } from 'ai';
import { z } from 'zod';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const specifier of ['ai', '@ai-sdk/google', '@google/genai', 'zod']) import.meta.resolve(specifier);
const provider = createGoogleGenerativeAI({ apiKey: 'diagnostic-not-a-real-key' });
if (typeof provider !== 'function') throw new Error('Google provider language factory missing');
const native = new GoogleGenAI({ apiKey: 'diagnostic-not-a-real-key', httpOptions: { apiVersion: 'v1' } });
if (typeof native.interactions?.create !== 'function') throw new Error('Google GenAI Interactions API missing');
for (const fn of [Output.object, generateText, stepCountIs, streamText, tool, z.object]) {
  if (typeof fn !== 'function') throw new Error('Required runtime API missing');
}
const result = {
  status: 'PASS_REAL_PACKAGE_CONTRACT',
  primary: 'ai + @ai-sdk/google',
  nativeEscapeHatch: '@google/genai interactions v1 probe only',
  structuredCodeArtifacts: true,
  tools: true,
  streaming: true,
};
await mkdir(path.join(root, 'artifacts'), { recursive: true });
await writeFile(path.join(root, 'artifacts', 'integration-contract.json'), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result));
