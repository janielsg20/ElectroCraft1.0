import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { describe, expect, it } from 'vitest';
import { ConnectorRegistry } from '@electrocraft/application';
import { createInternalDataSourceAdapter, InternalDataPermissionError } from '@electrocraft/connectors';
import {
  applyStudioStorageMigrations,
  createDrizzleInternalDataRepository,
  createDrizzleInternalRelationRepository,
} from '@electrocraft/data-web';
import {
  createDeterministicObjectId,
  electroCraftDataFieldSchema,
  electroCraftDataModelSchema,
  electroCraftDataSchemaSchema,
  electroCraftDataSourceDefinitionSchema,
  electroRelationSchema,
  relationResourceId,
} from '@electrocraft/domain';
import * as storageSchema from '../../../packages/data-web/src/schema';

describe('M08.11 relations through ConnectorRegistry and PGlite', () => {
  it('persists relation_edges, enforces 1:N, delete integrity and permissions', async () => {
    const client = await PGlite.create();
    try {
      await applyStudioStorageMigrations(client);
      const db = drizzle(client, { schema: storageSchema });
      const projectId = 'project-m08-11-pglite';
      const rawSource = JSON.parse(
        readFileSync(resolve('tooling/fixtures/canonical-model/internal-data-source-v1.json'), 'utf8'),
      ) as Record<string, unknown>;
      const source = electroCraftDataSourceDefinitionSchema.parse({
        ...rawSource,
        capabilities: [
          ...((rawSource.capabilities as string[] | undefined) ?? []),
          'relations',
        ],
      });
      const sourceModelId = createDeterministicObjectId('data-model', 'm08-11-order');
      const targetModelId = createDeterministicObjectId('data-model', 'm08-11-customer');
      const sourceModel = electroCraftDataModelSchema.parse({
        id: sourceModelId,
        key: 'order',
        label: 'Pedido',
        capabilityRefs: ['data.relations'],
        fields: [
          electroCraftDataFieldSchema.parse({
            id: createDeterministicObjectId('data-field', 'm08-11-order-name'),
            key: 'name',
            label: 'Nombre',
            type: 'text',
            nullable: false,
            indexed: false,
            faceted: false,
            relationModelRef: null,
            metadata: {},
          }),
        ],
        metadata: {},
      });
      const targetModel = electroCraftDataModelSchema.parse({
        id: targetModelId,
        key: 'customer',
        label: 'Cliente',
        fields: [
          electroCraftDataFieldSchema.parse({
            id: createDeterministicObjectId('data-field', 'm08-11-customer-name'),
            key: 'name',
            label: 'Nombre',
            type: 'text',
            nullable: false,
            indexed: false,
            faceted: false,
            relationModelRef: null,
            metadata: {},
          }),
        ],
        metadata: {},
      });
      const relation = electroRelationSchema.parse({
        id: createDeterministicObjectId('relation', 'm08-11-orders-customer'),
        key: 'customer',
        label: 'Cliente del pedido',
        sourceModelRef: sourceModel.id,
        targetModelRef: targetModel.id,
        cardinality: 'one-to-many',
        deleteBehavior: 'restrict',
        metadata: {},
      });
      const dataSchema = electroCraftDataSchemaSchema.parse({
        schemaVersion: 1,
        id: createDeterministicObjectId('data-schema', 'm08-11-pglite-schema'),
        version: 1,
        sourceRef: source.id,
        name: 'ElectroCraft Data',
        models: [sourceModel, targetModel],
        relations: [relation],
        metadata: {},
      });

      await db.insert(storageSchema.projects).values({ id: projectId, name: 'M08.11 PGlite', metadata: {} });
      await db.insert(storageSchema.projectObjects).values({
        projectId,
        objectId: dataSchema.id,
        kind: 'data-schema',
        schemaVersion: 1,
        payload: dataSchema,
        checksum: 'm08-11-schema-fixture',
      });

      const repository = createDrizzleInternalDataRepository(db);
      const relations = createDrizzleInternalRelationRepository(db);
      const registry = new ConnectorRegistry();
      registry.registerAdapter(
        createInternalDataSourceAdapter({
          projectId,
          repository,
          relations,
          permissions: { authorize: () => true },
        }),
      );

      const orderA = await registry.mutate(source, 'development', {
        resourceId: sourceModel.id,
        operation: 'create',
        input: { id: 'order-a', data: { name: 'Pedido A' } },
      });
      const orderB = await registry.mutate(source, 'development', {
        resourceId: sourceModel.id,
        operation: 'create',
        input: { id: 'order-b', data: { name: 'Pedido B' } },
      });
      const customerA = await registry.mutate(source, 'development', {
        resourceId: targetModel.id,
        operation: 'create',
        input: { id: 'customer-a', data: { name: 'Cliente A' } },
      });
      const customerB = await registry.mutate(source, 'development', {
        resourceId: targetModel.id,
        operation: 'create',
        input: { id: 'customer-b', data: { name: 'Cliente B' } },
      });
      expect(orderA).toMatchObject({ id: 'order-a' });
      expect(orderB).toMatchObject({ id: 'order-b' });
      expect(customerA).toMatchObject({ id: 'customer-a' });
      expect(customerB).toMatchObject({ id: 'customer-b' });

      const resourceId = relationResourceId(relation.id);
      await registry.mutate(source, 'development', {
        resourceId,
        operation: 'create',
        input: { id: 'edge-a', fromRecordId: 'order-a', toRecordId: 'customer-a', payload: {} },
      });
      await registry.mutate(source, 'development', {
        resourceId,
        operation: 'create',
        input: { id: 'edge-b', fromRecordId: 'order-a', toRecordId: 'customer-b', payload: {} },
      });
      await expect(registry.query(source, 'development', { resourceId })).resolves.toEqual([
        expect.objectContaining({ id: 'edge-a', fromRecordRef: 'order-a', toRecordRef: 'customer-a' }),
        expect.objectContaining({ id: 'edge-b', fromRecordRef: 'order-a', toRecordRef: 'customer-b' }),
      ]);

      await expect(
        registry.mutate(source, 'development', {
          resourceId,
          operation: 'create',
          input: { id: 'edge-c', fromRecordId: 'order-b', toRecordId: 'customer-a', payload: {} },
        }),
      ).rejects.toThrow(/1:N/);
      await expect(
        registry.mutate(source, 'development', {
          resourceId,
          operation: 'create',
          input: { id: 'edge-duplicate', fromRecordId: 'order-a', toRecordId: 'customer-a', payload: {} },
        }),
      ).rejects.toThrow(/ya contiene/);

      await expect(
        registry.mutate(source, 'development', {
          resourceId: sourceModel.id,
          operation: 'delete',
          input: { id: 'order-a' },
        }),
      ).rejects.toThrow(/bloquea la eliminación/);

      const detachedSchema = electroCraftDataSchemaSchema.parse({
        ...dataSchema,
        version: 2,
        relations: [{ ...relation, deleteBehavior: 'detach' }],
      });
      await db
        .update(storageSchema.projectObjects)
        .set({ payload: detachedSchema, checksum: 'm08-11-schema-fixture-v2' })
        .where(storageSchema.projectObjects.objectId.eq(dataSchema.id));

      await expect(
        registry.mutate(source, 'development', {
          resourceId: sourceModel.id,
          operation: 'delete',
          input: { id: 'order-a' },
        }),
      ).resolves.toEqual({ deleted: true });
      await expect(registry.query(source, 'development', { resourceId })).resolves.toEqual([]);

      const denied = new ConnectorRegistry();
      denied.registerAdapter(
        createInternalDataSourceAdapter({
          projectId,
          repository,
          relations,
          permissions: { authorize: () => false },
        }),
      );
      await expect(denied.query(source, 'development', { resourceId })).rejects.toBeInstanceOf(
        InternalDataPermissionError,
      );
    } finally {
      await client.close();
    }
  });
});
