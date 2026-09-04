import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { describe, expect, it } from 'vitest';
import { ConnectorRegistry } from '@electrocraft/application';
import { createInternalDataSourceAdapter, InternalDataPermissionError } from '@electrocraft/connectors';
import { applyStudioStorageMigrations, createDrizzleInternalDataRepository } from '@electrocraft/data-web';
import {
  createDeterministicObjectId,
  electroCraftDataFieldSchema,
  electroCraftDataModelSchema,
  electroCraftDataSchemaSchema,
  electroCraftDataSourceDefinitionSchema,
  electroTaxonomySchema,
  taxonomyResourceId,
} from '@electrocraft/domain';
import * as storageSchema from '../../../packages/data-web/src/schema';

describe('M08.10 taxonomy terms through ConnectorRegistry and PGlite', () => {
  it('persists hierarchical CRUD, rejects cycles/duplicates and enforces permissions', async () => {
    const client = await PGlite.create();
    try {
      await applyStudioStorageMigrations(client);
      const db = drizzle(client, { schema: storageSchema });
      const projectId = 'project-m08-10-pglite';
      const source = electroCraftDataSourceDefinitionSchema.parse(
        JSON.parse(readFileSync(resolve('tooling/fixtures/canonical-model/internal-data-source-v1.json'), 'utf8')),
      );
      const modelId = createDeterministicObjectId('data-model', 'm08-10-pglite-product');
      const taxonomy = electroTaxonomySchema.parse({
        id: createDeterministicObjectId('taxonomy', 'm08-10-pglite-category'),
        key: 'category',
        label: 'Categorías',
        singularLabel: 'Categoría',
        pluralLabel: 'Categorías',
        hierarchical: true,
        modelRefs: [modelId],
        metadata: {},
      });
      const model = electroCraftDataModelSchema.parse({
        id: modelId,
        key: 'product',
        label: 'Producto',
        capabilityRefs: ['data.taxonomies'],
        fields: [
          electroCraftDataFieldSchema.parse({
            id: createDeterministicObjectId('data-field', 'm08-10-pglite-name'),
            key: 'name',
            label: 'Nombre',
            type: 'text',
            nullable: false,
            indexed: true,
            faceted: false,
            relationModelRef: null,
            metadata: {},
          }),
        ],
        metadata: {},
      });
      const dataSchema = electroCraftDataSchemaSchema.parse({
        schemaVersion: 1,
        id: createDeterministicObjectId('data-schema', 'm08-10-pglite-schema'),
        version: 1,
        sourceRef: source.id,
        name: 'ElectroCraft Data',
        models: [model],
        taxonomies: [taxonomy],
        metadata: {},
      });
      await db.insert(storageSchema.projects).values({ id: projectId, name: 'M08.10 PGlite', metadata: {} });
      await db.insert(storageSchema.projectObjects).values({
        projectId,
        objectId: dataSchema.id,
        kind: 'data-schema',
        schemaVersion: 1,
        payload: dataSchema,
        checksum: 'm08-10-schema-fixture',
      });

      const repository = createDrizzleInternalDataRepository(db);
      const registry = new ConnectorRegistry();
      registry.registerAdapter(
        createInternalDataSourceAdapter({ projectId, repository, permissions: { authorize: () => true } }),
      );
      const resourceId = taxonomyResourceId(taxonomy.id);
      const rootId = createDeterministicObjectId('taxonomy-term', 'm08-10-root');
      const childId = createDeterministicObjectId('taxonomy-term', 'm08-10-child');
      await registry.mutate(source, 'development', {
        resourceId,
        operation: 'create',
        input: { id: rootId, name: 'Electrónica', slug: 'electronica', parentId: null },
      });
      await registry.mutate(source, 'development', {
        resourceId,
        operation: 'create',
        input: { id: childId, name: 'Teléfonos', slug: 'telefonos', parentId: rootId },
      });

      await expect(registry.query(source, 'development', { resourceId })).resolves.toEqual([
        expect.objectContaining({ id: rootId, parentId: null }),
        expect.objectContaining({ id: childId, parentId: rootId }),
      ]);
      await expect(
        registry.mutate(source, 'development', {
          resourceId,
          operation: 'update',
          input: { id: rootId, name: 'Electrónica', slug: 'electronica', parentId: childId, metadata: {} },
        }),
      ).rejects.toThrow(/ciclos/);
      await expect(
        registry.mutate(source, 'development', {
          resourceId,
          operation: 'create',
          input: { name: 'Duplicada', slug: 'telefonos', parentId: null },
        }),
      ).rejects.toThrow(/Ya existe/);
      await expect(
        registry.mutate(source, 'development', { resourceId, operation: 'delete', input: { id: rootId } }),
      ).rejects.toThrow(/términos hijos/);

      const denied = new ConnectorRegistry();
      denied.registerAdapter(
        createInternalDataSourceAdapter({ projectId, repository, permissions: { authorize: () => false } }),
      );
      await expect(denied.query(source, 'development', { resourceId })).rejects.toBeInstanceOf(
        InternalDataPermissionError,
      );
    } finally {
      await client.close();
    }
  });
});
