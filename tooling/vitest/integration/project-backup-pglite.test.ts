import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { describe, expect, it } from 'vitest';
import {
  createProjectStorageService,
  normalizeSaveProjectRequest,
  type ProjectStoragePort,
} from '@electrocraft/application';
import { applyStudioStorageMigrations, createDrizzleProjectRepository } from '@electrocraft/data-web';
import * as schema from '../../../packages/data-web/src/schema';

describe('M04.6 backup PGlite round trip', () => {
  it('exports, imports as copy and restores with safety checkpoint', async () => {
    const client = await PGlite.create('memory://');
    try {
      await applyStudioStorageMigrations(client);
      const repo = createDrizzleProjectRepository(drizzle(client, { schema }));
      const service = createProjectStorageService(repo as unknown as ProjectStoragePort);

      await repo.saveProject(
        normalizeSaveProjectRequest({
          project: { id: 'p', name: 'Portal', metadata: {} },
          objects: [{ objectId: 's', kind: 'screen', schemaVersion: 1, payload: { title: 'Inicio' } }],
        }),
      );

      const backup = await service.createBackup('p');
      const copy = await service.importBackup(backup, 'copy', 'copy');
      expect(copy?.project.name).toBe('Portal (importado)');
      expect(copy?.objects[0]?.payload).toEqual({ title: 'Inicio' });

      await repo.renameProject('p', 'Alterado');
      await service.importBackup(backup, 'replace');
      expect((await repo.openProject('p'))?.project.name).toBe('Portal');
      expect((await repo.findRecoveryCandidate('p'))?.projectId).toBe('p');
    } finally {
      await client.close();
    }
  });
});