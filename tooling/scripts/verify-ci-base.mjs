import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CI_BASE_NODE_VERSION, CI_BASE_NPM_VERSION, evaluateCiBaseContract } from '../src/ci-base.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const json = (file) => JSON.parse(read(file));

const result = evaluateCiBaseContract({
  workflow: read('.github/workflows/ci.yml'),
  packageJson: json('package.json'),
  lockfile: json('package-lock.json'),
  npmrc: read('.npmrc'),
});

const report = Object.freeze({
  microphase: 'M01.5',
  status: result.status,
  engine: Object.freeze({
    node: CI_BASE_NODE_VERSION,
    npm: CI_BASE_NPM_VERSION,
    install: 'npm ci',
    cache: 'actions/setup-node npm cache keyed by package-lock.json',
  }),
  workflow: '.github/workflows/ci.yml',
  lockfile: Object.freeze({
    path: 'package-lock.json',
    version: json('package-lock.json').lockfileVersion,
  }),
  commands: Object.freeze(['npm run lint', 'npm run typecheck', 'npm run test', 'npm run build', 'npm run test:e2e']),
  diagnostics: result.diagnostics,
});

const outputDir = path.join(root, 'tooling/dist');
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, 'm01-5-ci-base-report.json'), `${JSON.stringify(report, null, 2)}\n`);

if (result.status !== 'ready') {
  for (const diagnostic of result.diagnostics) console.error(`${diagnostic.code}: ${diagnostic.message}`);
  process.exitCode = 1;
} else {
  console.log('PASS_M01_5_CI_BASE_CONTRACT');
}
