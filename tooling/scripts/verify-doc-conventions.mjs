import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluateDocConventions } from '../src/doc-conventions.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDir, '../..');
const reportPath = resolve(root, 'tooling/dist/m01-6-doc-conventions-report.json');
const report = evaluateDocConventions(root);

mkdirSync(dirname(reportPath), { recursive: true });
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

if (report.status !== 'ready') {
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}

console.log(`PASS_M01_6_DOC_CONVENTIONS active=${report.activeMicrophase}`);
