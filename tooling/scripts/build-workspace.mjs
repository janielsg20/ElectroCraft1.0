import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { collectWorkspace, validateWorkspaceSnapshot } from '../src/boundaries.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const snapshot = collectWorkspace(root);
const validation = validateWorkspaceSnapshot(snapshot);
if (!validation.ok) throw new Error(validation.errors.join('\n'));

for (const required of [
  'apps/native-preview/src/native-adapter.ts',
  'apps/native-preview/app.json',
  'apps/native-preview/eas.json',
  'apps/native-preview/fixtures/native-source-build-config.json',
  'tooling/fixtures/help.architecture.repository.json',
]) {
  if (!fs.existsSync(path.join(root, required))) throw new Error(`missing required fixture ${required}`);
}

const graph = snapshot.boundaries.packages;
const canonical = JSON.stringify({ packages: graph, apps: snapshot.boundaries.apps });
const report = {
  schemaVersion: 1,
  microphase: 'M01.1',
  status: 'static-green-entry-gate-pending',
  packageCount: Object.keys(graph).length,
  appCount: Object.keys(snapshot.boundaries.apps).length,
  dependencyGraphSha256: crypto.createHash('sha256').update(canonical).digest('hex'),
  nativeFixture: 'apps/native-preview/fixtures/native-source-build-config.json',
  nextMicrophase: 'M01.2',
};
const out = path.join(root, 'tooling/dist');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'workspace-report.json'), JSON.stringify(report, null, 2) + '\n');
fs.writeFileSync(path.join(out, 'BUILD.txt'), `PASS_BUILD_WORKSPACE packages=${report.packageCount} apps=${report.appCount} graph=${report.dependencyGraphSha256}\n`);
console.log(`PASS_BUILD_WORKSPACE packages=${report.packageCount} apps=${report.appCount} graph=${report.dependencyGraphSha256}`);
