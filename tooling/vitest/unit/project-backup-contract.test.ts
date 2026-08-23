import { describe, expect, it, vi } from 'vitest';
import {
  PROJECT_BACKUP_FORMAT,
  PROJECT_BACKUP_VERSION,
  createProjectBackupPackage,
  createProjectBackupService,
  normalizeProjectBackupImportRequest,
  type ProjectBackupPort,
  type ProjectBackupSnapshot,
} from '@electrocraft/application';

function snapshot(): ProjectBackupSnapshot {
  return {
    project: { id: 'project-1', name: 'Portal', metadata: {} },
    status: 'active',
    objects: [
      {
        objectId: 'screen-home',
        kind: 'screen',
        schemaVersion: 1,
        payload: { title: 'Inicio', next: 'screen-about' },
      },
      {
        objectId: 'screen-about',
        kind: 'screen',
        schemaVersion: 1,
        payload: { title: 'Acerca' },
      },
    ],
    content: {
      records: [],
      terms: [],
      recordTerms: [],
      relations: [],
    },
    media: [],
  };
}

function port(): ProjectBackupPort {
  const pkg = createProjectBackupPackage(snapshot(), '2026-08-23T00:00:00.000Z');
  return {
    createProjectBackup: vi.fn(async () => pkg),
    inspectProjectBackupImport: vi.fn(async (request) => ({
      sourceProjectId: request.package.snapshot.project.id,
      targetProjectId: request.targetProjectId,
      strategy: request.strategy,
      projectCollision: false,
      objectCount: request.package.snapshot.objects.length,
      contentRecordCount: 0,
      taxonomyTermCount: 0,
      relationCount: 0,
      mediaReferenceCount: 0,
      mediaFilesIncluded: false,
    })),
    importProjectBackup: vi.fn(async (request) => ({
      sourceProjectId: request.package.snapshot.project.id,
      targetProjectId: request.targetProjectId,
      strategy: request.strategy,
      projectCollision: false,
      objectCount: request.package.snapshot.objects.length,
      contentRecordCount: 0,
      taxonomyTermCount: 0,
      relationCount: 0,
      mediaReferenceCount: 0,
      mediaFilesIncluded: false,
      safetyRevisionId: null,
      importedRevisionId: 'revision-imported',
    })),
  };
}

describe('M04.6 project backup application contract', () => {
  it('creates a versioned manifest whose snapshot and package checksums are validated', () => {
    const pkg = createProjectBackupPackage(snapshot(), '2026-08-23T00:00:00.000Z');
    expect(pkg.manifest.format).toBe(PROJECT_BACKUP_FORMAT);
    expect(pkg.manifest.version).toBe(PROJECT_BACKUP_VERSION);
    expect(pkg.manifest.objectCount).toBe(2);
    expect(pkg.manifest.mediaFilesIncluded).toBe(false);
    expect(normalizeProjectBackupImportRequest({ package: pkg }).strategy).toBe('reject');
  });

  it('rejects tampering before calling any storage write', async () => {
    const storage = port();
    const service = createProjectBackupService(storage);
    const pkg = createProjectBackupPackage(snapshot(), '2026-08-23T00:00:00.000Z');
    const tampered = {
      ...pkg,
      snapshot: {
        ...pkg.snapshot,
        project: { ...pkg.snapshot.project, name: 'Alterado' },
      },
    };

    await expect(service.importBackup({ package: tampered as typeof pkg, strategy: 'copy' })).rejects.toThrow(
      /checksum|identity/,
    );
    expect(storage.importProjectBackup).not.toHaveBeenCalled();
  });

  it('rejects an unsupported version and false claims about embedded media bytes', async () => {
    const storage = port();
    const service = createProjectBackupService(storage);
    const pkg = createProjectBackupPackage(snapshot(), '2026-08-23T00:00:00.000Z');

    await expect(
      service.importBackup({
        package: { ...pkg, manifest: { ...pkg.manifest, version: 2 as 1 } },
      }),
    ).rejects.toThrow(/version/);
    await expect(
      service.importBackup({
        package: { ...pkg, manifest: { ...pkg.manifest, mediaFilesIncluded: true as false } },
      }),
    ).rejects.toThrow(/media files/);
    expect(storage.importProjectBackup).not.toHaveBeenCalled();
  });

  it('normalizes copy imports to a new identity without changing the validated package', () => {
    const pkg = createProjectBackupPackage(snapshot(), '2026-08-23T00:00:00.000Z');
    const request = normalizeProjectBackupImportRequest(
      { package: pkg, strategy: 'copy', copyProjectId: 'project-copy', copyName: 'Portal copia' },
      'unused',
    );
    expect(request.targetProjectId).toBe('project-copy');
    expect(request.targetName).toBe('Portal copia');
    expect(request.package.snapshot.project.id).toBe('project-1');
  });
});
