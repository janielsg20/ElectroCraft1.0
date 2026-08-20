import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { collectWorkspace, validateWorkspaceSnapshot } from '../src/boundaries.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');

function clone(value) {
  return structuredClone(value);
}

test('workspace owns exactly 19 stable packages and two apps', () => {
  const snapshot = collectWorkspace(root);
  assert.equal(Object.keys(snapshot.boundaries.packages).length, 19);
  assert.deepEqual(Object.keys(snapshot.boundaries.apps).sort(), [
    '@electrocraft/native-preview',
    '@electrocraft/studio',
  ]);
  assert.deepEqual(validateWorkspaceSnapshot(snapshot), { ok: true, errors: [] });
});

test('i18n remains a stable adapter package and Studio is its only current app consumer', () => {
  const snapshot = collectWorkspace(root);
  assert.deepEqual(snapshot.boundaries.packages['@electrocraft/i18n'], []);
  assert.equal(snapshot.boundaries.apps['@electrocraft/studio'].includes('@electrocraft/i18n'), true);
});

test('data-web owns browser persistence without entering native/exporter boundaries', () => {
  const snapshot = collectWorkspace(root);
  assert.deepEqual(snapshot.boundaries.packages['@electrocraft/data-web'], [
    '@electrocraft/domain',
    '@electrocraft/application',
  ]);
  assert.equal(snapshot.boundaries.apps['@electrocraft/studio'].includes('@electrocraft/data-web'), true);
  assert.equal(snapshot.boundaries.packages['@electrocraft/runtime-native'].includes('@electrocraft/data-web'), false);
  assert.equal(snapshot.boundaries.packages['@electrocraft/exporters'].includes('@electrocraft/data-web'), false);
});

test('domain remains framework-free with Zod as its only external boundary dependency', () => {
  const snapshot = collectWorkspace(root);
  assert.deepEqual(snapshot.boundaries.packages['@electrocraft/domain'], []);
  const externalImports = [
    ...new Set(snapshot.imports['@electrocraft/domain'].filter((specifier) => !specifier.startsWith('.'))),
  ].sort();
  assert.deepEqual(externalImports, ['zod']);
  assert.deepEqual(snapshot.manifests['@electrocraft/domain'].dependencies, { zod: '4.4.3' });
});

test('negative: a domain to editor dependency is rejected', () => {
  const snapshot = clone(collectWorkspace(root));
  snapshot.boundaries.packages['@electrocraft/domain'] = ['@electrocraft/editor-puck'];
  snapshot.manifests['@electrocraft/domain'].dependencies = { '@electrocraft/editor-puck': '0.0.0-m01.2' };
  const result = validateWorkspaceSnapshot(snapshot);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes('cycle') || error.includes('domain')));
});

test('native runtime and native preview do not depend on DOM/editor packages', () => {
  const snapshot = collectWorkspace(root);
  const forbidden = new Set(snapshot.boundaries.invariants.nativeForbiddenPackages);
  for (const name of ['@electrocraft/runtime-native', '@electrocraft/native-preview']) {
    for (const dep of name === '@electrocraft/runtime-native'
      ? snapshot.boundaries.packages[name]
      : snapshot.boundaries.apps[name]) {
      assert.equal(forbidden.has(dep), false, `${name} -> ${dep}`);
    }
  }
});

test('exporters depend on ExportIR/contracts, not Studio UI or runtimes', () => {
  const snapshot = collectWorkspace(root);
  assert.ok(snapshot.boundaries.packages['@electrocraft/exporters'].includes('@electrocraft/export-ir'));
  for (const forbidden of snapshot.boundaries.invariants.exportersForbiddenPackages) {
    assert.equal(snapshot.boundaries.packages['@electrocraft/exporters'].includes(forbidden), false);
  }
});

test('native source/build/config fixture is complete and reproducible', () => {
  const fixturePath = path.join(root, 'apps/native-preview/fixtures/native-source-build-config.json');
  const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
  assert.equal(fixture.runtimeOwner, 'expo');
  assert.deepEqual(fixture.platforms, ['android', 'ios']);
  for (const relative of [fixture.source, fixture.config, fixture.buildConfig]) {
    assert.equal(fs.existsSync(path.join(root, 'apps/native-preview', relative)), true, relative);
  }
});

test('Spanish architecture help descriptor is registered as a fixture', () => {
  const descriptor = JSON.parse(
    fs.readFileSync(path.join(root, 'tooling/fixtures/help.architecture.repository.json'), 'utf8'),
  );
  assert.equal(descriptor.id, 'help.architecture.repository');
  assert.equal(descriptor.locale, 'es');
  assert.ok(descriptor.details.length >= 4);
});
