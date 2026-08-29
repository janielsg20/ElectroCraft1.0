import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { describe, expect, it } from 'vitest';
import {
  applyStudioStorageMigrations,
  createDrizzleInternalDataRepository,
} from '@electrocraft/data-web';
import { electroCraftDataSchemaSchema } from '@electrocraft/domain';
import * as storageSchema from '../../../packages/data-web/src/schema';

function fixture(name: string): unknown {
  return JSON.parse(readFileSync(resolve(`tooling/fixtures/canonical-model/${name}.json`), 'utf8')) as unknown;
}

describe('M08.2 PGlite internal data repository', () => {
  it('uses the existing migrated generic record store for schema discovery, CRUD, query and reopen', async () => {
    const client = await PGlite.create();
    try {
      await applyStudioStorageMigrations(client);
      await applyStudioStorageMigrations(client);
      const db = drizzle(client, { schema: storageSchema });
      const projectId = 'project-m08-2-pglite';
      const dataSchema = electroCraftDataSchemaSchema.parse(fixture('internal-data-schema-v1'));

      await db.insert(storageSchema.projects).values({
        id: projectId,
        name: 'M08.2 PGlite',
        metadata: {},
      });
      await db.insert(storageSchema.projectObjects).values({
        projectId,
        objectId: dataSchema.id,
        kind: 'data-schema',
        schemaVersion: dataSchema.schemaVersion,
        payload: dataSchema,
        checksum: 'm08-2-schema-fixture',
      });

      const repository = createDrizzleInternalDataRepository(db);
      await expect(repository.testConnection(projectId)).resolves.toEqual({
        ok: true,
        message: 'ElectroCraft Data local está disponible.',
      });
      await expect(repository.getSchema(projectId, dataSchema.sourceRef)).resolves.toMatchObject({
        id: dataSchema.id,
        name: 'ElectroCraft Data',
      });
      await expect(repository.listResources(projectId, dataSchema.sourceRef)).resolves.toEqual([
        expect.objectContaining({ id: 'ec_model_0000000000082', label: 'Producto', kind: 'model' }),
      ]);

      await repository.createRecord(projectId, 'ec_model_0000000000082', {
        id: 'record-a',
        data: { name: 'Cable USB-C', price: 14 },
      });
      await repository.createRecord(projectId, 'ec_model_0000000000082', {
        id: 'record-b',
        data: { name: 'Cargador', price: 22 },
      });

      await expect(
        repository.queryRecords(projectId, 'ec_model_0000000000082', {
          filter: { field: 'price', value: 22 },
        }),
      ).resolves.toMatchObject({ total: 1, rows: [expect.objectContaining({ id: 'record-b' })] });

      await expect(
        repository.queryRecords(projectId, 'ec_model_0000000000082', {
          sort: { field: 'price', direction: 'desc' },
          offset: 0,
          limit: 1,
        }),
      ).resolves.toMatchObject({ total: 2, rows: [expect.objectContaining({ id: 'record-b' })] });

      await expect(
        repository.updateRecord(projectId, 'ec_model_0000000000082', {
          id: 'record-a',
          data: { name: 'Cable USB-C reforzado', price: 18 },
        }),
      ).resolves.toMatchObject({ id: 'record-a', data: { name: 'Cable USB-C reforzado', price: 18 } });

      await expect(repository.deleteRecord(projectId, 'ec_model_0000000000082', 'record-b')).resolves.toBe(true);

      const reopenedRepository = createDrizzleInternalDataRepository(db);
      await expect(reopenedRepository.queryRecords(projectId, 'ec_model_0000000000082')).resolves.toMatchObject({
        total: 1,
        rows: [expect.objectContaining({ id: 'record-a' })],
      });
      await expect(reopenedRepository.getStats(projectId, dataSchema.sourceRef)).resolves.toEqual({
        modelCount: 1,
        recordCount: 1,
      });
    } finally {
      await client.close();
    }
  });
});
