import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const json = (file) => JSON.parse(read(file));

test('root exposes the six required M01.3 quality scripts', () => {
  const manifest = json('package.json');
  assert.deepEqual(
    ['lint', 'typecheck', 'test', 'test:e2e', 'build', 'check'].filter((name) => typeof manifest.scripts[name] === 'string'),
    ['lint', 'typecheck', 'test', 'test:e2e', 'build', 'check'],
  );
});

test('toolchain pins are exact and typescript-eslint is intentionally absent with TypeScript 7', () => {
  const deps = json('package.json').devDependencies;
  assert.equal(deps.eslint, '10.8.0');
  assert.equal(deps['@eslint/js'], '10.0.1');
  assert.equal(deps.prettier, '3.9.6');
  assert.equal(deps.vitest, '4.1.10');
  assert.equal(deps['@playwright/test'], '1.61.1');
  assert.equal(deps.vite, '8.2.0');
  assert.equal(deps.typescript, '7.0.2');
  assert.equal('typescript-eslint' in deps, false);
});

test('ESLint owns correctness rules while Prettier owns formatting', () => {
  const eslint = read('eslint.config.mjs');
  assert.match(eslint, /@eslint\/js/);
  for (const rule of ["'indent'", "'semi'", "'quotes'", "'comma-dangle'", "'max-len'"]) assert.equal(eslint.includes(rule), false);
  const prettier = json('.prettierrc.json');
  assert.equal(prettier.singleQuote, true);
  assert.equal(prettier.endOfLine, 'lf');
});

test('Vitest is split into unit, contract and integration projects', () => {
  const config = read('vitest.config.ts');
  for (const name of ['unit', 'contract', 'integration']) assert.ok(config.includes(`name: '${name}'`));
  for (const dir of ['unit', 'contract', 'integration']) assert.equal(fs.existsSync(path.join(root, 'tooling/vitest', dir)), true);
});

test('Playwright CI policy forbids accidental focused tests and is deterministic', () => {
  const config = read('playwright.config.ts');
  assert.match(config, /forbidOnly: Boolean\(process\.env\.CI\)/);
  assert.match(config, /workers: process\.env\.CI \? 1 : undefined/);
  assert.match(config, /retries: process\.env\.CI \? 1 : 0/);
});

test('negative: no second TypeScript lint engine is introduced behind ESLint', () => {
  const deps = json('package.json').devDependencies;
  for (const forbidden of ['typescript-eslint', '@typescript-eslint/parser', '@typescript-eslint/eslint-plugin']) {
    assert.equal(forbidden in deps, false, forbidden);
  }
});

test('empty functional repository fixture contains all engine entrypoints', () => {
  for (const file of ['eslint.config.mjs', 'tsconfig.json', 'vitest.config.ts', 'vite.config.ts', 'playwright.config.ts', 'src/index.ts', 'test/unit.test.ts', 'e2e/smoke.spec.ts']) {
    assert.equal(fs.existsSync(path.join(root, 'tooling/fixtures/empty-repo', file)), true, file);
  }
});
