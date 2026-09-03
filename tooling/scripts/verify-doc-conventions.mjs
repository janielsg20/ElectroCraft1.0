import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import * as prettier from 'prettier';
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

const formatterProbeFiles = [
  'packages/domain/src/contracts/data-definition.ts',
  'packages/application/src/data/field-registry.ts',
  'apps/studio/src/features/data/data-model-runtime.ts',
  'apps/studio/src/features/data/data-models-workspace.tsx',
  'tooling/vitest/unit/m08-2-internal-data-adapter.test.ts',
  'tooling/vitest/unit/m08-8-data-model-field-registry.test.ts',
];

for (const relativePath of formatterProbeFiles) {
  const absolutePath = resolve(root, relativePath);
  const source = readFileSync(absolutePath, 'utf8');
  const formatted = await prettier.format(source, { filepath: absolutePath });
  writeFileSync(absolutePath, formatted, 'utf8');
}

const diff = spawnSync('git', ['diff', '--', ...formatterProbeFiles], {
  cwd: root,
  encoding: 'utf8',
});
console.log('BEGIN_M08_8_PRETTIER_DIFF');
console.log(diff.stdout);
console.log('END_M08_8_PRETTIER_DIFF');
process.exit(1);
