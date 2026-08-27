import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  ElectroCraftMigrationRegistry,
  createElectroCraftProjectSnapshot,
  createElectroCraftProjectSnapshotChecksum,
  createElectroCraftProjectSnapshotEnvelope,
  migrateElectroCraftProjectDefinitionPayload,
  parseElectroCraftProjectSnapshotEnvelope,
  serializeElectroCraftProjectSnapshotEnvelope,
  stableCanonicalStringify,
  verifyElectroCraftProjectSnapshotEnvelope,
} from '@electrocraft/domain';

function fixture<T = unknown>(name: string): T {
  return JSON.parse(readFileSync(resolve(`tooling/fixtures/canonical-model/${name}.json`), 'utf8')) as T;
}

function canonicalDocuments(): unknown[] {
  return [fixture('screen-v4'), fixture('form-v4'), fixture('template-v4')];
}

describe('M02.6 deterministic serializer and MigrationRegistry', () => {
  it('serializes object keys deterministically without changing array order', () => {
    const left = { z: 1, nested: { b: 2, a: 1 }, list: [{ y: 2, x: 1 }, 3] };
    const right = { list: [{ x: 1, y: 2 }, 3], nested: { a: 1, b: 2 }, z: 1 };

    expect(stableCanonicalStringify(left)).toBe(stableCanonicalStringify(right));
    expect(stableCanonicalStringify(left)).toBe('{"list":[{"x":1,"y":2},3],"nested":{"a":1,"b":2},"z":1}');
  });

  it('normalizes document order and produces the fixed canonical snapshot checksum', () => {
    const project = fixture('project-v3');
    const documents = canonicalDocuments();
    const expectation = fixture<{ expectedChecksum: string }>('canonical-snapshot-checksum-v1');

    const ordered = createElectroCraftProjectSnapshot(project, documents);
    const reversed = createElectroCraftProjectSnapshot(project, [...documents].reverse());

    expect(ordered).toEqual(reversed);
    expect(ordered.documents.map(({ id }) => id)).toEqual([
      'ec_document_0000000000002',
      'ec_document_000000000000e',
      'ec_document_000000000000q',
    ]);
    expect(createElectroCraftProjectSnapshotChecksum(ordered)).toBe(expectation.expectedChecksum);
    expect(createElectroCraftProjectSnapshotChecksum(reversed)).toBe(expectation.expectedChecksum);
  });

  it('changes checksum when canonical project content changes', () => {
    const project = fixture<Record<string, unknown>>('project-v3');
    const documents = canonicalDocuments();
    const original = createElectroCraftProjectSnapshot(project, documents);
    const changed = createElectroCraftProjectSnapshot({ ...project, name: 'Proyecto modificado' }, documents);

    expect(createElectroCraftProjectSnapshotChecksum(changed)).not.toBe(
      createElectroCraftProjectSnapshotChecksum(original),
    );
  });

  it('executes the real project v1 to v2 step and then the v2 to v3 step through one registry path', () => {
    const v1 = fixture('project-v1');
    const expectedV2 = fixture('project-migration-v1-to-v2-expected');

    const v2 = migrateElectroCraftProjectDefinitionPayload(v1, 2);
    expect(v2.value).toEqual(expectedV2);
    expect(v2.appliedStepIds).toEqual(['project-v1-to-v2-data-ownership']);

    const v3 = migrateElectroCraftProjectDefinitionPayload(v1, 3);
    expect(v3.toVersion).toBe(3);
    expect(v3.appliedStepIds).toEqual([
      'project-v1-to-v2-data-ownership',
      'project-v2-to-v3-theme-blueprint-capabilities',
    ]);
    expect(v3.value).toMatchObject({
      schemaVersion: 3,
      dataSourceRefs: [],
      originBlueprint: null,
      requiredCapabilities: [],
    });
  });

  it('fails closed on gaps, duplicate steps and downgrade requests', () => {
    const registry = new ElectroCraftMigrationRegistry();
    registry.register({ id: 'v1-v2', fromVersion: 1, toVersion: 2, migrate: (value) => value });

    expect(() =>
      registry.register({ id: 'duplicate', fromVersion: 1, toVersion: 2, migrate: (value) => value }),
    ).toThrow(/already registered/);
    expect(() => registry.register({ id: 'jump', fromVersion: 2, toVersion: 4, migrate: (value) => value })).toThrow(
      /sequential/,
    );
    expect(() => registry.migrate({}, 2, 3)).toThrow(/missing migration step/);
    expect(() => registry.migrate({}, 2, 1)).toThrow(/downgrade/);
  });

  it('round-trips and verifies a deterministic snapshot envelope', () => {
    const envelope = createElectroCraftProjectSnapshotEnvelope(fixture('project-v3'), canonicalDocuments());
    const serialized = serializeElectroCraftProjectSnapshotEnvelope(envelope);
    const parsed = parseElectroCraftProjectSnapshotEnvelope(serialized);

    expect(verifyElectroCraftProjectSnapshotEnvelope(parsed)).toEqual(envelope);
    expect(serialized).toBe(serializeElectroCraftProjectSnapshotEnvelope(envelope));
  });
});
