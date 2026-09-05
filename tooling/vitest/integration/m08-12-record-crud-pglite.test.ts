import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { describe, expect, it } from 'vitest';
import { ConnectorRegistry } from '@electrocraft/application';
import { createInternalDataSourceAdapter } from '@electrocraft/connectors';
import { applyStudioStorageMigrations, createDrizzleInternalDataRepository } from '@electrocraft/data-web';
import {
  createDeterministicObjectId,
  electroCraftDataFieldSchema,
  electroCraftDataModelSchema,
  electroCraftDataSchemaSchema,
  electroCraftDataSourceDefinitionSchema,
} from '@electrocraft/domain';
import * as storageSchema from '../../../packages/data-web/src/schema';

describe('M08.12 CRUD validated through ConnectorRegistry and PGlite', () => {
  it('validates writes, persists round-trip and soft-deletes without destroying the row', async () => {
    const client = await PGlite.create();
    try {
      await applyStudioStorageMigrations(client);
      const db = drizzle(client, { schema: storageSchema });
      const projectId = 'project-m08-12';
      const source = electroCraftDataSourceDefinitionSchema.parse({
        schemaVersion: 1,
        id: createDeterministicObjectId('data-source', 'm08-12-internal'),
        version: 1,
        key: 'electroCraftData',
        label: 'ElectroCraft Data',
        kind: 'internal',
        adapterId: 'internal.pglite',
        authRef: null,
        config: { storage: 'content_records' },
        environmentScope: ['development'],
        environmentOverrides: {},
        schemaDiscovery: 'on-demand',
        capabilities: ['read', 'create', 'update', 'delete', 'pagination', 'filtering', 'sort', 'transactions'],
        metadata: {},
      });
      const model = electroCraftDataModelSchema.parse({
        id: createDeterministicObjectId('data-model', 'm08-12-product'),
        key: 'product',
        label: 'Producto',
        fields: [
          electroCraftDataFieldSchema.parse({
            id: createDeterministicObjectId('data-field', 'm08-12-product-name'),
            key: 'name',
            label: 'Nombre',
            type: 'text',
            nullable: false,
            required: true,
            indexed: false,
            faceted: false,
            relationModelRef: null,
            validation: { minLength: 3 },
            metadata: {},
          }),
        ],
        metadata: {},
      });
      const dataSchema = electroCraftDataSchemaSchema.parse({
        schemaVersion: 1,
        id: createDeterministicObjectId('data-schema', 'm08-12-schema'),
        version: 1,
        sourceRef: source.id,
        name: 'ElectroCraft Data',
        models: [model],
        metadata: {},
      });
      await db.insert(storageSchema.projects).values({ id: projectId, name: 'M08.12', metadata: {} });
      await db.insert(storageSchema.projectObjects).values({
        projectId,
        objectId: dataSchema.id,
        kind: 'data-schema',
        schemaVersion: 1,
        payload: dataSchema,
        checksum: 'm08-12-schema',
      });
      const repository = createDrizzleInternalDataRepository(db);
      const registry = new ConnectorRegistry();
      registry.registerAdapter(
        createInternalDataSourceAdapter({
          projectId,
          repository,
          permissions: { authorize: () => true },
        }),
      );

      await expect(
        registry.mutate(source, 'development', {
          resourceId: model.id,
          operation: 'create',
          input: { id: 'invalid', data: { name: 'x' } },
        }),
      ).rejects.toThrow(/longitud mínima|obligatorio/i);

      await expect(
        registry.mutate(source, 'development', {
          resourceId: model.id,
          operation: 'create',
          input: { id: 'product-a', data: { name: 'Mesa' } },
        }),
      ).resolves.toMatchObject({ id: 'product-a', data: { name: 'Mesa' }, deletedAt: null });
      await expect(
        registry.mutate(source, 'development', {
          resourceId: model.id,
          operation: 'update',
          input: { id: 'product-a', data: { name: 'Mesa Pro' } },
        }),
      ).resolves.toMatchObject({ id: 'product-a', data: { name: 'Mesa Pro' } });
      await expect(registry.query(source, 'development', { resourceId: model.id })).resolves.toMatchObject({
        total: 1,
        rows: [expect.objectContaining({ id: 'product-a', data: { name: 'Mesa Pro' } })],
      });

      await expect(
        registry.mutate(source, 'development', {
          resourceId: model.id,
          operation: 'delete',
          input: { id: 'product-a' },
        }),
      ).resolves.toEqual({ deleted: true });
      await expect(registry.query(source, 'development', { resourceId: model.id })).resolves.toMatchObject({
        total: 0,
        rows: [],
      });
      await expect(
        registry.query(source, 'development', {
          resourceId: model.id,
          input: { includeDeleted: true },
        }),
      ).resolves.toMatchObject({
        total: 1,
        rows: [expect.objectContaining({ id: 'product-a', state: 'deleted', deletedAt: expect.any(String) })],
      });
      const physical = await db.select().from(storageSchema.contentRecords);
      expect(physical).toHaveLength(1);
      expect(physical[0]?.deletedAt).toBeInstanceOf(Date);
      await expect(
        registry.mutate(source, 'development', {
          resourceId: model.id,
          operation: 'update',
          input: { id: 'product-a', data: { name: 'No revive' } },
        }),
      ).rejects.toThrow(/deleted|not found/i);
    } finally {
      await client.close();
    }
  });
});
