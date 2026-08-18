import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectWorkspace, validateImportRecords, validateWorkspaceSnapshot } from '../src/boundaries.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');

function record(file, specifier) { return [{ file, specifier }]; }

test('root TypeScript configuration is strict and aliases only public workspace roots', () => {
  const snapshot = collectWorkspace(root);
  assert.equal(snapshot.tsconfigBase.compilerOptions.strict, true);
  assert.equal('baseUrl' in snapshot.tsconfigBase.compilerOptions, false);
  const aliases = snapshot.tsconfigBase.compilerOptions.paths;
  assert.equal(Object.keys(aliases).length, 19);
  assert.equal(Object.keys(aliases).some((name) => name.includes('*')), false);
  assert.equal(Object.values(aliases).every((value) => Array.isArray(value) && value.length === 1 && value[0].startsWith('./')), true);
  assert.deepEqual(snapshot.domainTsconfig.compilerOptions.lib, ['ES2024']);
  assert.deepEqual(snapshot.domainTsconfig.compilerOptions.types, []);
  assert.deepEqual(validateWorkspaceSnapshot(snapshot), { ok: true, errors: [] });
});

test('negative: TypeScript 7 rejects reintroducing baseUrl', () => {
  const snapshot = structuredClone(collectWorkspace(root));
  snapshot.tsconfigBase.compilerOptions.baseUrl = '.';
  const result = validateWorkspaceSnapshot(snapshot);
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes('TypeScript 7 baseUrl must be absent'));
});

test('negative: domain cannot import React, Puck, Drizzle, Expo, DOM or filesystem engines', () => {
  const snapshot = collectWorkspace(root);
  for (const forbidden of ['react', '@puckeditor/core', 'drizzle-orm', 'expo', 'node:fs']) {
    const errors = validateImportRecords('@electrocraft/domain', record('packages/domain/src/bad.ts', forbidden), snapshot);
    assert.ok(errors.some((error) => error.includes('domain imports forbidden')), forbidden);
  }
});

test('negative: deep workspace imports are rejected even when the package root is allowed', () => {
  const snapshot = collectWorkspace(root);
  const errors = validateImportRecords('@electrocraft/application', record('packages/application/src/bad.ts', '@electrocraft/domain/src/index'), snapshot);
  assert.ok(errors.some((error) => error.includes('deep/unknown workspace import')));
});

test('negative: cross-package relative imports are rejected', () => {
  const snapshot = collectWorkspace(root);
  const errors = validateImportRecords('@electrocraft/application', record('packages/application/src/bad.ts', '../../domain/src/index'), snapshot);
  assert.ok(errors.some((error) => error.includes('crosses package boundary')));
});

test('negative: application cannot depend on runtime or adapter packages', () => {
  const snapshot = structuredClone(collectWorkspace(root));
  snapshot.boundaries.packages['@electrocraft/application'].push('@electrocraft/runtime-web');
  snapshot.manifests['@electrocraft/application'].dependencies['@electrocraft/runtime-web'] = '0.0.0-m01.2';
  snapshot.importRecords['@electrocraft/application'].push({ file: 'packages/application/src/bad.ts', specifier: '@electrocraft/runtime-web' });
  snapshot.imports['@electrocraft/application'].push('@electrocraft/runtime-web');
  const result = validateWorkspaceSnapshot(snapshot);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes('application depends on forbidden package @electrocraft/runtime-web')));
});

test('every workspace package exposes only its public root entry', () => {
  const snapshot = collectWorkspace(root);
  for (const manifest of Object.values(snapshot.manifests)) {
    assert.deepEqual(Object.keys(manifest.exports), ['.']);
    assert.equal(manifest.exports['.'], './src/index.ts');
  }
});
