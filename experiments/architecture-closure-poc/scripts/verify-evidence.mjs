import { access, readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';

const repoRoot = resolve(process.cwd(), '../..');
const required = [
  '.ai/adr/ADR-0003-puck-composition-poc.md',
  '.ai/adr/ADR-0004-studio-db-poc.md',
  '.ai/adr/ADR-0005-query-portable-poc.md',
  '.ai/adr/ADR-0006-action-flow-rete-poc.md',
  '.ai/adr/ADR-0007-native-runtime-poc.md',
  '.ai/adr/ADR-GEMINI-PROVIDER.md',
  '.ai/adr/ADR-DATA-SOURCES.md',
  '.ai/adr/ADR-EXPORT-TARGET-PARITY.md',
  '.ai/EXPORT_TARGET_CONTRACT.md',
  '.ai/PHASES.md'
];
for (const path of required) await access(resolve(repoRoot, path));
const phases = await readFile(resolve(repoRoot, '.ai/PHASES.md'), 'utf8');
for (let i = 0; i < 28; i += 1) assert.match(phases, new RegExp(`F${String(i).padStart(2,'0')}\\b`));
const targetContract = await readFile(resolve(repoRoot, '.ai/EXPORT_TARGET_CONTRACT.md'), 'utf8');
for (const target of ['local-project','react-web','static-web','pwa','android-expo','ios-expo','capacitor','lamp','wordpress']) assert.ok(targetContract.includes(target));
console.log(`PASS_EVIDENCE_CHAIN ${required.length} architecture artifacts`);
