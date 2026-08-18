import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  createElectroCraftProjectSnapshotEnvelope,
  electroCraftObjectIdSchema,
  migrateElectroCraftProjectDefinitionPayload,
  serializeElectroCraftProjectSnapshotEnvelope,
  stableCanonicalStringify,
  type ElectroCraftObjectId,
} from '@electrocraft/domain';
import {
  ProjectDocumentService,
  ProjectImportService,
  type CanonicalProjectObjectKind,
  type CanonicalProjectObjectRecord,
  type CanonicalProjectObjectRepository,
} from '@electrocraft/application';
import { createProjectSnapshotExportManifest } from '@electrocraft/export-ir';

function fixture<T = unknown>(name: string): T {
  return JSON.parse(readFileSync(resolve(`tooling/fixtures/canonical-model/${name}.json`), 'utf8')) as T;
}

function canonicalDocuments(): unknown[] {
  return [fixture('screen-v3'), fixture('form-v3'), fixture('template-v3')];
}

function evidence(name: string, value: unknown): void {
  const directory = process.env.ELECTROCRAFT_EVIDENCE_DIR;
  if (!directory) return;
  mkdirSync(resolve(directory), { recursive: true });
  writeFileSync(resolve(directory, name), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

class FileProjectRepository implements CanonicalProjectObjectRepository {
  constructor(readonly root: string) {
    mkdirSync(root, { recursive: true });
  }

  recordPath(kind: CanonicalProjectObjectKind, id: ElectroCraftObjectId): string {
    return join(this.root, `${kind}-${id}.json`);
  }

  async putMany(records: readonly CanonicalProjectObjectRecord[]): Promise<void> {
    for (const record of records) {
      writeFileSync(this.recordPath(record.kind, record.id), `${JSON.stringify(record)}\n`, 'utf8');
    }
  }

  async get(kind: CanonicalProjectObjectKind, id: ElectroCraftObjectId): Promise<CanonicalProjectObjectRecord | null> {
    try {
      return JSON.parse(readFileSync(this.recordPath(kind, id), 'utf8')) as CanonicalProjectObjectRecord;
    } catch (error) {
      const code = error instanceof Error && 'code' in error ? (error as NodeJS.ErrnoException).code : undefined;
      if (code === 'ENOENT') return null;
      throw error;
    }
  }
}

const roots: string[] = [];
function repository(): FileProjectRepository {
  const root = mkdtempSync(join(tmpdir(), 'electrocraft-m02-6-'));
  roots.push(root);
  return new FileProjectRepository(root);
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function storageSnapshot(root: string): Record<string, string> {
  return Object.fromEntries(
    readdirSync(root)
      .sort()
      .map((name) => [name, readFileSync(join(root, name), 'utf8')]),
  );
}

describe('M02.6 snapshot import and migration against real storage', () => {
  it('imports a valid canonical snapshot and exposes a neutral ExportIR manifest', async () => {
    const repo = repository();
    const envelope = createElectroCraftProjectSnapshotEnvelope(fixture('project-v3'), canonicalDocuments());
    const serialized = serializeElectroCraftProjectSnapshotEnvelope(envelope);
    const result = await new ProjectImportService(repo).import(serialized);
    const manifest = createProjectSnapshotExportManifest(envelope);

    expect(result).toEqual({
      status: 'saved',
      projectId: envelope.snapshot.project.id,
      documentCount: 3,
      checksum: envelope.checksum,
    });
    expect(readdirSync(repo.root).sort()).toHaveLength(4);
    expect(manifest).toMatchObject({
      schemaVersion: 1,
      projectId: envelope.snapshot.project.id,
      projectSchemaVersion: 3,
      documentCount: 3,
      documentSchemaVersions: [3],
      checksum: envelope.checksum,
    });

    evidence('m02-6-snapshot-report.json', {
      checksum: envelope.checksum,
      serializedBytes: Buffer.byteLength(serialized, 'utf8'),
      storedFiles: readdirSync(repo.root).sort(),
      manifest,
    });
  });

  it('returns reparable diagnostics and does not mutate storage for invalid checksum or schema', async () => {
    const repo = repository();
    writeFileSync(join(repo.root, 'sentinel.txt'), 'unchanged\n', 'utf8');
    const envelope = createElectroCraftProjectSnapshotEnvelope(fixture('project-v3'), canonicalDocuments());
    const service = new ProjectImportService(repo);
    const before = storageSnapshot(repo.root);

    const badChecksum = stableCanonicalStringify({ ...envelope, checksum: 'fnv1a64:0000000000000000' });
    const checksumResult = await service.import(badChecksum);
    expect(checksumResult.status).toBe('blocked');
    if (checksumResult.status === 'blocked') {
      expect(checksumResult.diagnostics).toEqual(
        expect.arrayContaining([expect.objectContaining({ code: 'CHECKSUM_MISMATCH', path: ['checksum'] })]),
      );
      expect(checksumResult.diagnostics.every(({ repair }) => repair.length > 0)).toBe(true);
    }
    expect(storageSnapshot(repo.root)).toEqual(before);

    const brokenProject = {
      ...envelope,
      snapshot: {
        ...envelope.snapshot,
        project: { ...envelope.snapshot.project, name: '' },
      },
    };
    const schemaResult = await service.import(stableCanonicalStringify(brokenProject));
    expect(schemaResult.status).toBe('blocked');
    if (schemaResult.status === 'blocked') {
      expect(schemaResult.diagnostics).toEqual(
        expect.arrayContaining([expect.objectContaining({ code: 'INVALID_SCHEMA' })]),
      );
    }
    expect(storageSnapshot(repo.root)).toEqual(before);

    evidence('m02-6-import-diagnostics.json', { checksumResult, schemaResult, storageUnchanged: true });
  });

  it('uses the registry-backed v1→v2→v3 migration path when reopening legacy records', async () => {
    const repo = repository();
    const projectV1 = fixture<{ id: string }>('project-v1');
    const screenV1 = fixture<{ id: string }>('screen-v1');
    const projectId = electroCraftObjectIdSchema.parse(projectV1.id);
    const documentId = electroCraftObjectIdSchema.parse(screenV1.id);

    await repo.putMany([
      {
        kind: 'project',
        id: projectId,
        schemaVersion: 1,
        payload: stableCanonicalStringify(projectV1),
      },
      {
        kind: 'document',
        id: documentId,
        schemaVersion: 1,
        payload: stableCanonicalStringify(screenV1),
      },
    ]);

    const reopened = await new ProjectDocumentService(repo).reopen(projectId);
    expect(reopened.status).toBe('ready');
    if (reopened.status !== 'ready') return;
    expect(reopened.migratedProject).toBe(true);
    expect(reopened.project.schemaVersion).toBe(3);

    const stored = await repo.get('project', projectId);
    expect(JSON.parse(stored?.payload ?? '{}')).toMatchObject({ schemaVersion: 3 });

    const migrationV2 = migrateElectroCraftProjectDefinitionPayload(projectV1, 2);
    const migrationV3 = migrateElectroCraftProjectDefinitionPayload(projectV1, 3);
    evidence('m02-6-migration-report.json', {
      v2: { toVersion: migrationV2.toVersion, appliedStepIds: migrationV2.appliedStepIds },
      v3: { toVersion: migrationV3.toVersion, appliedStepIds: migrationV3.appliedStepIds },
      reopenedSchemaVersion: reopened.project.schemaVersion,
      storageRewritten: JSON.parse(stored?.payload ?? '{}').schemaVersion === 3,
    });
  });
});
