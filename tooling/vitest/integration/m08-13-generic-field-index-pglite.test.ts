import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { describe, expect, it } from 'vitest';
import { ConnectorRegistry } from '@electrocraft/application';
import { createGenericFieldIndexedInternalDataSourceAdapter } from '@electrocraft/connectors';
import {
  applyStudioStorageMigrations,
  createGenericFieldIndexedInternalDataRepository,
} from '@electrocraft/data-web';
import {
  createDeterministicObjectId,
  dataModelIndexResourceId,
  electroCraftDataFieldSchema,
  electroCraftDataModelSchema,
  electroCraftDataSchemaSchema,
  electroCraftDataSourceDefinitionSchema,
} from '@electrocraft/domain';
import * as storageSchema from '../../../packages/data-web/src/schema';

describe('M08.13 GenericFieldIndexer on real PGlite', () => {
  it('indexes CRUD atomically and powers search/filter/sort/facets plus rebuild', async () => {
    const client = await PGlite.create();
    try {
      await applyStudioStorageMigrations(client);
      const db = drizzle(client, { schema: storageSchema });
      const projectId = 'project-m08-13';
      const source = electroCraftDataSourceDefinitionSchema.parse({
        schemaVersion: 1,
        id: createDeterministicObjectId('data-source', 'm08-13-source'),
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
        capabilities: [
          'read',
          'create',
          'update',
          'delete',
          'pagination',
          'filtering',
          'sort',
          'aggregate',
          'transactions',
        ],
        metadata: {},
      });
      const model = electroCraftDataModelSchema.parse({
        id: createDeterministicObjectId('data-model', 'm08-13-product'),
        key: 'product',
        label: 'Producto',
        fields: [
          electroCraftDataFieldSchema.parse({
            id: createDeterministicObjectId('data-field', 'm08-13-title'),
            key: 'title',
            label: 'Título',
            type: 'text',
            nullable: false,
            required: true,
            indexed: true,
            faceted: false,
            relationModelRef: null,
            metadata: {
              indexing: { searchable: true, filterable: false, sortable: false, faceted: false },
            },
          }),
          electroCraftDataFieldSchema.parse({
            id: createDeterministicObjectId('data-field', 'm08-13-price'),
            key: 'price',
            label: 'Precio',
            type: 'number',
            nullable: false,
            required: true,
            indexed: true,
            faceted: false,
            relationModelRef: null,
            metadata: {
              indexing: { searchable: false, filterable: true, sortable: true, faceted: false },
            },
          }),
          electroCraftDataFieldSchema.parse({
            id: createDeterministicObjectId('data-field', 'm08-13-category'),
            key: 'category',
            label: 'Categoría',
            type: 'text',
            nullable: false,
            required: true,
            indexed: true,
            faceted: true,
            relationModelRef: null,
            metadata: {
              indexing: { searchable: false, filterable: true, sortable: false, faceted: true },
            },
          }),
        ],
        metadata: {},
      });
      const dataSchema = electroCraftDataSchemaSchema.parse({
        schemaVersion: 1,
        id: createDeterministicObjectId('data-schema', 'm08-13-schema'),
        version: 1,
        sourceRef: source.id,
        name: 'ElectroCraft Data',
        models: [model],
        metadata: {},
      });
      await db.insert(storageSchema.projects).values({ id: projectId, name: 'M08.13', metadata: {} });
      await db.insert(storageSchema.projectObjects).values({
        projectId,
        objectId: dataSchema.id,
        kind: 'data-schema',
        schemaVersion: 1,
        payload: dataSchema,
        checksum: 'm08-13-schema',
      });

      const repository = createGenericFieldIndexedInternalDataRepository(db);
      const registry = new ConnectorRegistry();
      registry.registerAdapter(
        createGenericFieldIndexedInternalDataSourceAdapter({
          projectId,
          repository,
          permissions: { authorize: () => true },
        }),
      );

      await registry.mutate(source, 'development', {
        resourceId: model.id,
        operation: 'create',
        input: { id: 'product-a', data: { title: 'Cámara Pró', price: 900, category: 'foto' } },
      });
      await registry.mutate(source, 'development', {
        resourceId: model.id,
        operation: 'create',
        input: { id: 'product-b', data: { title: 'Trípode', price: 120, category: 'foto' } },
      });
      await registry.mutate(source, 'development', {
        resourceId: model.id,
        operation: 'create',
        input: { id: 'product-c', data: { title: 'Monitor', price: 450, category: 'video' } },
      });

      const physical = await db.select().from(storageSchema.recordFieldIndex);
      expect(physical).toHaveLength(9);
      expect(physical).toContainEqual(expect.objectContaining({ recordId: 'product-a', normalizedText: 'camara pro' }));

      await expect(
        registry.query(source, 'development', {
          resourceId: model.id,
          input: { search: { text: 'CAMARA' }, facets: ['category'] },
        }),
      ).resolves.toMatchObject({
        total: 1,
        rows: [expect.objectContaining({ id: 'product-a' })],
        facets: { category: [{ value: 'foto', count: 1 }] },
      });

      await expect(
        registry.query(source, 'development', {
          resourceId: model.id,
          input: { filter: { field: 'category', value: 'foto' }, sort: { field: 'price', direction: 'desc' } },
        }),
      ).resolves.toMatchObject({
        total: 2,
        rows: [expect.objectContaining({ id: 'product-a' }), expect.objectContaining({ id: 'product-b' })],
      });

      await expect(
        registry.query(source, 'development', { resourceId: dataModelIndexResourceId(model.id) }),
      ).resolves.toMatchObject({ status: 'ready', indexableFieldCount: 3, activeRecordCount: 3, indexRowCount: 9 });

      await db.delete(storageSchema.recordFieldIndex);
      await expect(
        registry.query(source, 'development', { resourceId: dataModelIndexResourceId(model.id) }),
      ).resolves.toMatchObject({ status: 'stale', indexRowCount: 0 });
      await expect(
        registry.mutate(source, 'development', {
          resourceId: dataModelIndexResourceId(model.id),
          operation: 'update',
          input: {},
        }),
      ).resolves.toMatchObject({ status: 'ready', indexRowCount: 9 });

      await registry.mutate(source, 'development', {
        resourceId: model.id,
        operation: 'delete',
        input: { id: 'product-a' },
      });
      expect(
        (await db.select().from(storageSchema.recordFieldIndex)).some(({ recordId }) => recordId === 'product-a'),
      ).toBe(false);
    } finally {
      await client.close();
    }
  });
});
