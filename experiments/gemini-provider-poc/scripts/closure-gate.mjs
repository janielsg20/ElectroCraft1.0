import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mode = process.argv[2] ?? 'static';

if (mode === 'static') {
  for (const file of ['build-summary.json', 'integration-contract.json', 'security-scan.json']) {
    await access(path.join(root, 'artifacts', file));
  }
  console.log(JSON.stringify({ status: 'PASS_STATIC_CLOSURE_GATE', liveGemini: 'required-separate-gate' }));
  process.exit(0);
}

if (mode !== 'live') throw new Error(`Unknown closure mode: ${mode}`);
await access(path.join(root, 'artifacts', 'live-result.json'));
const live = JSON.parse(await readFile(path.join(root, 'artifacts', 'live-result.json'), 'utf8'));
for (const key of ['structuredOutput', 'codeArtifact', 'toolLoop', 'streaming', 'cancellation', 'interactionsV1']) {
  if (live[key] !== true) throw new Error(`Live gate missing ${key}`);
}
if (live.status !== 'PASS_LIVE_GEMINI_CODE') throw new Error(`Unexpected live status: ${live.status}`);
console.log(JSON.stringify({ status: 'PASS_LIVE_CLOSURE_GATE', liveGeminiCode: true }));
