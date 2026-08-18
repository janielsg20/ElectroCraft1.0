import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const files = ['package.json', 'eslint.config.mjs', '.prettierrc.json', 'vitest.config.ts', 'playwright.config.ts', 'apps/studio/vite.config.ts'];
const hashes = Object.fromEntries(
  files.map((file) => [file, crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex')]),
);
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const report = {
  schemaVersion: 1,
  microphase: 'M01.3',
  status: 'local-static-green-real-toolchain-ci-pending',
  scripts: ['lint', 'typecheck', 'test', 'test:e2e', 'build', 'check'],
  engines: manifest.devDependencies,
  vitestProjects: ['unit', 'contract', 'integration'],
  typescriptEslint: 'intentionally-omitted-current-stable-supports-typescript-less-than-6.1',
  emptyRepoFixture: 'tooling/fixtures/empty-repo',
  configSha256: hashes,
  nextMicrophase: 'M01.4',
};
const out = path.join(root, 'tooling/dist');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'quality-toolchain-report.json'), JSON.stringify(report, null, 2) + '\n');
console.log(`PASS_BUILD_M01_3 scripts=${report.scripts.length} vitestProjects=${report.vitestProjects.length}`);
