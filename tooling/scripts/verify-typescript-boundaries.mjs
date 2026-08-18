import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectWorkspace, validateWorkspaceSnapshot } from '../src/boundaries.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const snapshot = collectWorkspace(root);
const result = validateWorkspaceSnapshot(snapshot);
if (!result.ok) {
  console.error(result.errors.join('\n'));
  process.exit(1);
}
const aliases = Object.keys(snapshot.tsconfigBase.compilerOptions.paths ?? {});
console.log(`PASS_M01_2_TYPESCRIPT_BOUNDARIES strict=true aliases=${aliases.length} packages=${Object.keys(snapshot.boundaries.packages).length} apps=${Object.keys(snapshot.boundaries.apps).length}`);
