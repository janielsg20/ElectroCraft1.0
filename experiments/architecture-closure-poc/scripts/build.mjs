// @ts-check
import { cp, mkdir, writeFile, readFile } from 'node:fs/promises';
await mkdir('dist', { recursive:true });
await cp('public', 'dist', { recursive:true });
await cp('fixtures/architecture-decisions.json', 'dist/architecture-decisions.json');
await cp('fixtures/phase-dependencies.json', 'dist/phase-dependencies.json');
let report;
try { report = await readFile('dist/closure-report.json','utf8'); }
catch { report = '{}'; }
await writeFile('dist/BUILD.txt', `M00.11 architecture closure POC\nreport=${report.trim()}\n`);
console.log('PASS_BUILD dist/ architecture harness created');
