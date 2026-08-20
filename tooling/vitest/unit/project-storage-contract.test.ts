import { describe, expect, it } from 'vitest';
import {
  PROJECT_STORAGE_SCHEMA_VERSION,
  createProjectStorageRevision,
  normalizeStoredProjectObject,
  validateProjectStorageRevision,
} from '@electrocraft/application';
import { createElectroCraftCanonicalSnapshotChecksum } from '@electrocraft/domain';

const now = '2026-08-20T18:00:00.000Z';

describe('M04.1 project storage contract', () => {
  it('normalizes a versioned project object with a canonical checksum', () => {
    const object = normalizeStoredProjectObject(
      'project-1',
      { objectId: 'screen-home', kind: 'screen', schemaVersion: 3, payload: { title: 'Inicio' } },
      now,
    );
    expect(object.projectId).toBe('project-1');
    expect(object.schemaVersion).toBe(3);
    expect(object.checksum).toBe(createElectroCraftCanonicalSnapshotChecksum({ title: 'Inicio' }));
  });

  it('rejects corrupted object and revision checksums', () => {
    expect(() =>
      normalizeStoredProjectObject('project-1', {
        objectId: 'screen-home',
        kind: 'screen',
        schemaVersion: 1,
        payload: { title: 'Inicio' },
        checksum: 'fnv1a64:0000000000000000',
      }),
    ).toThrow(/checksum mismatch/);

    const object = normalizeStoredProjectObject(
      'project-1',
      { objectId: 'screen-home', kind: 'screen', schemaVersion: 1, payload: { title: 'Inicio' } },
      now,
    );
    const revision = createProjectStorageRevision('project-1', [object], 'manual', 'revision-1', now);
    expect(revision.manifest.schemaVersion).toBe(PROJECT_STORAGE_SCHEMA_VERSION);
    expect(() => validateProjectStorageRevision({ ...revision, checksum: 'fnv1a64:0000000000000000' })).toThrow(
      /checksum mismatch/,
    );
  });
});
