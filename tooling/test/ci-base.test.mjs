import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateCiBaseContract } from '../src/ci-base.mjs';

const validWorkflow = `
on:
  push:
    branches: [main]
  pull_request:
permissions:
  contents: read
steps:
  - uses: actions/checkout@v6
  - uses: actions/setup-node@v7
    with:
      cache: npm
      cache-dependency-path: package-lock.json
  - run: npm ci --ignore-scripts --no-audit --no-fund
  - run: npm run lint
  - run: npm run typecheck
  - run: npm run test
  - run: npm run build
  - run: npm run test:e2e
`;

const validPackage = Object.freeze({ version: '0.0.0-m01.5', packageManager: 'npm@10.9.2' });
const validLock = Object.freeze({
  version: '0.0.0-m01.5',
  lockfileVersion: 3,
  packages: Object.freeze({
    '': Object.freeze({ version: '0.0.0-m01.5', workspaces: Object.freeze(['apps/*', 'packages/*']) }),
  }),
});

test('M01.5 CI contract is ready with locked install and read-only workflow', () => {
  const result = evaluateCiBaseContract({
    workflow: validWorkflow,
    packageJson: validPackage,
    lockfile: validLock,
    npmrc: 'legacy-peer-deps=true\n',
  });

  assert.equal(result.status, 'ready');
  assert.deepEqual(result.diagnostics, []);
});

test('negative: CI contract blocks secrets and an unlocked install', () => {
  const result = evaluateCiBaseContract({
    workflow: validWorkflow
      .replace('npm ci --ignore-scripts --no-audit --no-fund', 'npm install')
      .concat('\nenv:\n  TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}\n'),
    packageJson: validPackage,
    lockfile: validLock,
    npmrc: 'legacy-peer-deps=true\n',
  });

  assert.equal(result.status, 'blocked');
  assert.ok(result.diagnostics.some((diagnostic) => diagnostic.code === 'missing-workflow-contract'));
  assert.ok(result.diagnostics.some((diagnostic) => diagnostic.code === 'forbidden-secret'));
});

test('negative: CI contract blocks a stale root lockfile', () => {
  const result = evaluateCiBaseContract({
    workflow: validWorkflow,
    packageJson: validPackage,
    lockfile: {
      ...validLock,
      version: '0.0.0-m01.4',
      packages: { '': { version: '0.0.0-m01.4', workspaces: ['apps/*', 'packages/*'] } },
    },
    npmrc: 'legacy-peer-deps=true\n',
  });

  assert.equal(result.status, 'blocked');
  assert.ok(result.diagnostics.some((diagnostic) => diagnostic.code === 'lockfile-root-mismatch'));
});
