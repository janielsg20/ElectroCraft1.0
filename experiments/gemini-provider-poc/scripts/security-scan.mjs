import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const clientRoot = path.join(root, 'src', 'client');
const clientFiles = [];
async function walk(dir, out) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, out);
    else out.push(full);
  }
}
await walk(clientRoot, clientFiles);
const clientSource = (await Promise.all(clientFiles.map((file) => readFile(file, 'utf8')))).join('\n');
for (const forbidden of ['@ai-sdk/google', '@google/genai', 'GEMINI_API_KEY', 'GOOGLE_GENERATIVE_AI_API_KEY', 'apiKey', 'x-goog-api-key']) {
  if (clientSource.includes(forbidden)) throw new Error(`Client boundary leaks provider/secret token: ${forbidden}`);
}
const scanFiles = [];
for (const rel of ['fixtures', 'src']) await walk(path.join(root, rel), scanFiles);
for (const file of scanFiles) {
  const text = await readFile(file, 'utf8');
  if (/AIza[0-9A-Za-z_-]{25,}/.test(text)) throw new Error(`API-key-looking value in ${path.relative(root, file)}`);
}
const result = {
  status: 'PASS_GATEWAY_SECRET_SCAN',
  clientFiles: clientFiles.map((file) => path.relative(root, file)),
  providerImportsInClient: false,
  secretNamesInClient: false,
  secretLookingFixtureValues: false,
};
await mkdir(path.join(root, 'artifacts'), { recursive: true });
await writeFile(path.join(root, 'artifacts', 'security-scan.json'), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result));
