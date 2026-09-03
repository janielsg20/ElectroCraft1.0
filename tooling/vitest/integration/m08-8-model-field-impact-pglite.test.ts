import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { describe, expect, it } from 'vitest';
import { applyStudioStorageMigrations, createDrizzleInternalDataRepository } from '@electrocraft/data-web';
import {
  createDeterministicObjectId,
  electroCraftDataFieldSchema,
  electroCraftDataModelSchema,
  electroCraftDataSchemaSchema,
} from '@electrocraft/domain';
import * as storageSchema from '../../../packages/data-web/src/schema';

const projectId = 'project-m08-8-field-impact';
const sourceId = createDeterministicObjectId('data-source', 'm08-8-impact-source');
const modelId = createDeterministicObjectId('data-model', 'm08-8-impact-model');
const schemaId = createDeterministicObjectId('data-schema', 'm08-8-impact-schema');

function dataSchema() {
  return electroCraftDataSchemaSchema.parse({
    schemaVersion: 1,
    id: schemaId,
    version: 1,
    sourceRef: sourceId,
    name: 'ElectroCraft Data',
    models: [
      electroCraftDataModelSchema.parse({
        id: modelId,
        key: 'product',
        label: 'Producto',
        singularLabel: 'Producto',
        pluralLabel: 'Productos',
        visibility: 'internal',
        singleton: false,
        menuVisible: true,
        fields: [
          electroCraftDataFieldSchema.parse({
            id: createDeterministicObjectId('data-field', 'm08-8-impact-name'),
            key: 'name',
            label: 'Nombre',
            type: 'text',
            nullable: false,
            indexed: false,
            faceted: false,
            relationModelRef: null,
            required: true,
            metadata: { storageHint: 'scalar', fieldFamily: 'text' },
          }),
          electroCraftDataFieldSchema.parse({
            id: createDeterministicObjectId('data-field', 'm08-8-impact-price'),
            key: 'price',
            label: 'Precio',
            type: 'currency',
            nullable: true,
            indexed: true,
            faceted: false,
            relationModelRef: null,
            metadata: { storageHint: 'scalar', fieldFamily: 'number' },
          }),
        ],
        metadata: {},
      }),
    ],
    metadata: { owner: 'PGlite generic content store' },
  });
}

describe('M08.8 PGlite model field impact', () => {
  it('persists schema metadata separately and measures populated values in content_records', async () => {
    const client = await PGlite.create();
    try {
      await applyStudioStorageMigrations(client);
      const db = drizzle(client, { schema: storageSchema });
      const schema = dataSchema();

      await db.insert(storageSchema.projects).values({ id: projectId, name: 'M08.8 Field Impact', metadata: {} });
      await db.insert(storageSchema.projectObjects).values({
        projectId,
        objectId: schema.id,
        kind: 'data-schema',
        schemaVersion: schema.schemaVersion,
        payload: schema,
        checksum: 'm08-8-schema-fixture',
      });

      const repository = createDrizzleInternalDataRepository(db);
      await repository.createRecord(projectId, modelId, {
        id: 'record-1',
        data: { name: 'Cable USB-C', price: 19.99 },
      });
      await repository.createRecord(projectId, modelId, {
        id: 'record-2',
        data: { name: 'Cargador', price: null },
      });
      await repository.createRecord(projectId, modelId, {
        id: 'record-3',
        data: { name: 'Hub USB' },
      });

      await expect(repository.getSchema(projectId, sourceId)).resolves.toEqual(schema);
      await expect(repository.getFieldUsage(projectId, modelId, 'name')).resolves.toEqual({
        modelId,
        fieldKey: 'name',
        recordCount: 3,
        populatedCount: 3,
      });
      await expect(repository.getFieldUsage(projectId, modelId, 'price')).resolves.toEqual({
        modelId,
        fieldKey: 'price',
        recordCount: 3,
        populatedCount: 1,
      });
      await expect(repository.getFieldUsage(projectId, modelId, 'missing')).resolves.toEqual({
        modelId,
        fieldKey: 'missing',
        recordCount: 3,
        populatedCount: 0,
      });

      const records = await repository.queryRecords(projectId, modelId);
      expect(records.total).toBe(3);
      expect(records.rows.every((record) => record.modelId === modelId)).toBe(true);
    } finally {
      await client.close();
    }
  });
});
