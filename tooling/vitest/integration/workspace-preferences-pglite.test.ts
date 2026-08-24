import {
  DEFAULT_WORKSPACE_ID,
  WORKSPACE_PREFERENCES_STORAGE_KEY,
  createProjectBackupService,
  createProjectStorageService,
  createWorkspacePreferencesService,
  type ProjectStorageDiagnostics,
  type ProjectStoragePort,
} from '@electrocraft/application';
import { PGlite } from '@electric-sql/pglite';
import {
  applyStudioStorageMigrations,
  createDrizzleProjectRepository,
  createDrizzleWorkspacePreferencesRepository,
} from '@electrocraft/data-web';
import { drizzle } from 'drizzle-orm/pglite';
import { describe, expect, it } from 'vitest';
import * as storageSchema from '../../../packages/data-web/src/schema';

const readyDiagnostics: ProjectStorageDiagnostics = Object.freeze({
  state: 'ready',
  backend: 'memory',
  persistent: false,
  durable: false,
  usageBytes: null,
  quotaBytes: null,
  migrationVersion: 4,
  repairSupported: false,
  message: 'PGlite de prueba listo.',
});

function createTestProjectPort(repository: ReturnType<typeof createDrizzleProjectRepository>): ProjectStoragePort {
  return {
    initialize: async () => readyDiagnostics,
    saveProject: repository.saveProject,
    saveProjectIncremental: repository.saveProjectIncremental,
    createCheckpoint: repository.createCheckpoint,
    findRecoveryCandidate: repository.findRecoveryCandidate,
    restoreRevision: repository.restoreRevision,
    openProject: repository.openProject,
    listProjects: repository.listProjects,
    setProjectStatus: repository.setProjectStatus,
    renameProject: repository.renameProject,
    duplicateProject: repository.duplicateProject,
    deleteProjectPermanently: repository.deleteProjectPermanently,
    verifyProject: repository.verifyProject,
    getDiagnostics: async () => readyDiagnostics,
    repair: async () => readyDiagnostics,
    close: async () => undefined,
  };
}

describe('M04.7 workspace preferences with real PGlite', () => {
  it('persists preferences and saved layouts across a service reopen', async () => {
    const client = await PGlite.create('memory://');
    try {
      await applyStudioStorageMigrations(client);
      const db = drizzle(client, { schema: storageSchema });
      const repository = createDrizzleWorkspacePreferencesRepository(db);
      const first = createWorkspacePreferencesService(repository, {
        now: () => '2026-08-23T13:10:00.000Z',
        randomId: () => 'layout-pglite',
      });

      await first.patchLayout({
        sidebarSide: 'right',
        sidebarWidth: 318,
        sidebarDisplay: 'text',
        sidebarGroupOrder: ['data', 'build'],
        visiblePanels: ['context', 'status'],
        contextWidth: 340,
        inspectorWidth: 376,
        lastTabs: ['context:layers', 'inspector:design'],
        lastDocumentId: 'project-last-opened',
      });
      await first.saveCurrentAs('Diseño PGlite');

      const reopened = createWorkspacePreferencesService(createDrizzleWorkspacePreferencesRepository(db), {
        now: () => '2026-08-23T13:11:00.000Z',
      });
      const loaded = await reopened.load();

      expect(loaded.layout).toMatchObject({
        sidebarSide: 'right',
        sidebarWidth: 318,
        sidebarDisplay: 'text',
        sidebarGroupOrder: ['data', 'build'],
        visiblePanels: ['context', 'status'],
        contextWidth: 340,
        inspectorWidth: 376,
        lastTabs: ['context:layers', 'inspector:design'],
        lastDocumentId: 'project-last-opened',
      });
      expect(loaded.savedLayouts).toHaveLength(1);
      expect(loaded.savedLayouts[0]).toMatchObject({ id: 'layout-pglite', name: 'Diseño PGlite' });

      const rows = await client.query<{ workspace_id: string; key: string }>(
        'SELECT workspace_id, key FROM workspace_preferences ORDER BY workspace_id, key',
      );
      expect(rows.rows).toEqual([{ workspace_id: 'studio', key: 'workspace.preferences.v1' }]);
    } finally {
      await client.close();
    }
  });

  it('deletes a workspace preference row through the typed Drizzle transaction', async () => {
    const client = await PGlite.create('memory://');
    try {
      await applyStudioStorageMigrations(client);
      const db = drizzle(client, { schema: storageSchema });
      const repository = createDrizzleWorkspacePreferencesRepository(db);
      const preferences = createWorkspacePreferencesService(repository, {
        now: () => '2026-08-23T13:15:00.000Z',
      });

      await preferences.patchLayout({ sidebarSide: 'right' });
      expect(await repository.read(DEFAULT_WORKSPACE_ID, WORKSPACE_PREFERENCES_STORAGE_KEY)).not.toBeNull();

      await repository.delete(DEFAULT_WORKSPACE_ID, WORKSPACE_PREFERENCES_STORAGE_KEY);

      expect(await repository.read(DEFAULT_WORKSPACE_ID, WORKSPACE_PREFERENCES_STORAGE_KEY)).toBeNull();
      const rows = await client.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM workspace_preferences');
      expect(rows.rows).toEqual([{ count: '0' }]);
    } finally {
      await client.close();
    }
  });

  it('keeps workspace preferences outside the portable project backup', async () => {
    const client = await PGlite.create('memory://');
    try {
      await applyStudioStorageMigrations(client);
      const db = drizzle(client, { schema: storageSchema });
      const preferences = createWorkspacePreferencesService(createDrizzleWorkspacePreferencesRepository(db), {
        now: () => '2026-08-23T13:20:00.000Z',
      });
      await preferences.patchLayout({ sidebarSide: 'right', lastDocumentId: 'private-workspace-state' });

      const projectRepository = createDrizzleProjectRepository(db);
      const storage = createProjectStorageService(createTestProjectPort(projectRepository));
      const backup = createProjectBackupService(storage);
      await storage.saveProject({
        project: { id: 'project-backup-exclusion', name: 'Proyecto sin preferencias', metadata: {} },
        objects: [
          {
            objectId: 'screen-home',
            kind: 'screen',
            schemaVersion: 1,
            payload: { title: 'Inicio' },
          },
        ],
        reason: 'initial',
      });

      const serialized = await backup.backupProject('project-backup-exclusion');
      expect(serialized).not.toContain('workspace.preferences.v1');
      expect(serialized).not.toContain('private-workspace-state');
      expect(serialized).toContain('project-backup-exclusion');
    } finally {
      await client.close();
    }
  });
});
