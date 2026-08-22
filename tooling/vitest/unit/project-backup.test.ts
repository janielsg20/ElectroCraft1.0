import {
  createProjectBackupPackage,
  createProjectBackupService,
  normalizeSaveProjectRequest,
  type OpenProjectResult,
  type ProjectStoragePort,
} from '@electrocraft/application';
import { describe, expect, it } from 'vitest';

const project = Object.freeze({ id: 'project-source', name: 'Proyecto fuente', metadata: {} });

function validSource(): OpenProjectResult {
  const request = normalizeSaveProjectRequest(
    {
      project,
      objects: [
        {
          objectId: 'screen-home',
          kind: 'screen',
          schemaVersion: 1,
          payload: { title: 'Inicio' },
        },
      ],
      reason: 'fixture',
    },
    '2026-08-22T00:00:00.000Z',
  );
  return Object.freeze({ project, objects: request.objects, revision: request.revision });
}

function createMemoryPort(initial: readonly OpenProjectResult[] = []) {
  const projects = new Map(initial.map((item) => [item.project.id, item]));
  const operations: string[] = [];

  const port: ProjectStoragePort = {
    initialize: async () => ({
      state: 'ready',
      backend: 'memory',
      persistent: false,
      durable: false,
      usageBytes: null,
      quotaBytes: null,
      migrationVersion: 1,
      repairSupported: false,
      message: 'ready',
    }),
    async saveProject(request) {
      operations.push(`save:${request.project.id}`);
      projects.set(
        request.project.id,
        Object.freeze({ project: request.project, objects: request.objects, revision: request.revision }),
      );
      return request.revision;
    },
    saveProjectIncremental: async (request) => ({
      projectId: request.project.id,
      updatedAt: request.updatedAt,
      upsertedObjectIds: [],
      deletedObjectIds: [],
      currentRevisionBase: null,
    }),
    async createCheckpoint(projectId, reason) {
      operations.push(`checkpoint:${projectId}:${reason}`);
      const opened = projects.get(projectId);
      if (!opened) throw new Error(`project not found: ${projectId}`);
      return normalizeSaveProjectRequest({ project: opened.project, objects: opened.objects, reason }).revision;
    },
    findRecoveryCandidate: async () => null,
    restoreRevision: async () => {
      throw new Error('not used');
    },
    openProject: async (projectId) => projects.get(projectId) ?? null,
    listProjects: async () => [],
    setProjectStatus: async () => {
      throw new Error('not used');
    },
    renameProject: async () => {
      throw new Error('not used');
    },
    duplicateProject: async () => {
      throw new Error('not used');
    },
    deleteProjectPermanently: async () => undefined,
    verifyProject: async (projectId) => ({
      projectId,
      coherent: true,
      checkedObjects: 0,
      invalidObjectIds: [],
      revisionChecksumValid: true,
    }),
    getDiagnostics: async () => ({
      state: 'ready',
      backend: 'memory',
      persistent: false,
      durable: false,
      usageBytes: null,
      quotaBytes: null,
      migrationVersion: 1,
      repairSupported: false,
      message: 'ready',
    }),
    repair: async () => ({
      state: 'ready',
      backend: 'memory',
      persistent: false,
      durable: false,
      usageBytes: null,
      quotaBytes: null,
      migrationVersion: 1,
      repairSupported: false,
      message: 'ready',
    }),
    close: async () => undefined,
  };

  return { port, projects, operations };
}

describe('M04.6 project backup contract', () => {
  it('creates a versioned canonical backup and detects tampering', () => {
    const backup = createProjectBackupPackage(validSource(), [], '2026-08-22T12:00:00.000Z');
    expect(backup.manifest).toMatchObject({
      format: 'electrocraft-project-backup',
      formatVersion: 1,
      storageSchemaVersion: 1,
      projectId: 'project-source',
      objectCount: 1,
      mediaCount: 0,
    });

    const tampered = {
      ...backup,
      snapshot: {
        ...backup.snapshot,
        project: { ...backup.snapshot.project, name: 'Alterado' },
      },
    };
    const { port } = createMemoryPort();
    const service = createProjectBackupService(port);
    expect(service.importProject(tampered, { mode: 'reject-collision' })).rejects.toThrow(
      'project backup checksum mismatch',
    );
  });

  it('imports a validated backup as an explicit copy', async () => {
    const backup = createProjectBackupPackage(validSource());
    const { port, projects, operations } = createMemoryPort();
    const result = await createProjectBackupService(port).importProject(backup, {
      mode: 'import-as-copy',
      targetProjectId: 'project-copy',
      name: 'Proyecto importado',
    });

    expect(result).toMatchObject({
      sourceProjectId: 'project-source',
      projectId: 'project-copy',
      mode: 'import-as-copy',
      safetyRevisionId: null,
    });
    expect(projects.get('project-copy')?.project.name).toBe('Proyecto importado');
    expect(projects.get('project-copy')?.objects[0]?.payload).toEqual({ title: 'Inicio' });
    expect(operations).toEqual(['save:project-copy']);
  });

  it('creates a safety checkpoint before replacing an existing project', async () => {
    const backup = createProjectBackupPackage(validSource());
    const existing = validSource();
    const { port, operations } = createMemoryPort([existing]);

    const result = await createProjectBackupService(port).importProject(backup, {
      mode: 'replace-existing',
    });

    expect(result.safetyRevisionId).toBeTruthy();
    expect(operations).toEqual([
      'checkpoint:project-source:pre-restore-safety',
      'save:project-source',
    ]);
  });
});
