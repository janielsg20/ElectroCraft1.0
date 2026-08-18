import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { collectWorkspace, validateWorkspaceSnapshot } from '../src/boundaries.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const snapshot = collectWorkspace(root);
const result = validateWorkspaceSnapshot(snapshot);
if (!result.ok) throw new Error(result.errors.join('\n'));
const aliasMap = snapshot.tsconfigBase.compilerOptions.paths;
const canonical = JSON.stringify({ aliases: aliasMap, graph: snapshot.boundaries.packages, apps: snapshot.boundaries.apps });
const report = {
  schemaVersion: 1,
  microphase: 'M01.2',
  strict: snapshot.tsconfigBase.compilerOptions.strict,
  aliasCount: Object.keys(aliasMap).length,
  wildcardAliases: Object.keys(aliasMap).filter((name) => name.includes('*')),
  packageCount: Object.keys(snapshot.boundaries.packages).length,
  appCount: Object.keys(snapshot.boundaries.apps).length,
  architectureSha256: crypto.createHash('sha256').update(canonical).digest('hex'),
  nextMicrophase: 'M01.3',
};
const out = path.join(root, 'tooling/dist');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'typescript-boundary-report.json'), JSON.stringify(report, null, 2) + '\n');
console.log(`PASS_BUILD_M01_2 strict=${report.strict} aliases=${report.aliasCount} sha=${report.architectureSha256}`);
