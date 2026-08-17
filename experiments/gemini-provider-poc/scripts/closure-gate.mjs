import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mode = process.argv[2] ?? 'static';
const required = ['build-summary.json', 'integration-contract.json', 'security-scan.json'];
for (const file of required) await access(path.join(root, 'artifacts', file));
if (mode === 'static') {
  console.log(JSON.stringify({ status: 'PASS_STATIC_CLOSURE_GATE', liveGemini: 'required-separate-gate' }));
  process.exit(0);
}
if (mode !== 'live') throw new Error(`Unknown closure mode: ${mode}`);
const live = JSON.parse(await readFile(path.join(root, 'artifacts', 'live-result.json'), 'utf8'));
for (const key of ['structuredOutput', 'toolLoop', 'streaming', 'cancellation', 'image', 'interactionsV1']) {
  if (live[key] !== true) throw new Error(`Live gate missing ${key}`);
}
console.log(JSON.stringify({ status: 'PASS_LIVE_CLOSURE_GATE', liveGemini: true }));
