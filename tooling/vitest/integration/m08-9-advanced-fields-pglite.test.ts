import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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
  type ElectroCraftDataField,
  type ElectroCraftDataFieldType,
  type JsonValue,
} from '@electrocraft/domain';
import * as storageSchema from '../../../packages/data-web/src/schema';

function field(
  key: string,
  type: ElectroCraftDataFieldType,
  advancedField: Record<string, JsonValue>,
  required = false,
): ElectroCraftDataField {
  return electroCraftDataFieldSchema.parse({
    id: createDeterministicObjectId('data-field', `m08-9-pglite-${key}`),
    key,
    label: key,
    type,
    nullable: !required,
    required,
    indexed: false,
    faceted: false,
    relationModelRef: null,
    metadata: { advancedField },
  });
}

describe('M08.9 advanced fields through ConnectorRegistry and PGlite', () => {
  it('normalizes and round-trips advanced records in the existing content_records table', async () => {
    const client = await PGlite.create();
    try {
      await applyStudioStorageMigrations(client);
      const db = drizzle(client, { schema: storageSchema });
      const projectId = 'project-m08-9-pglite';
      const source = electroCraftDataSourceDefinitionSchema.parse(
        JSON.parse(readFileSync(resolve('tooling/fixtures/canonical-model/internal-data-source-v1.json'), 'utf8')),
      );
      const group = field('customer', 'group', { parentFieldRef: null, order: 2 });
      const model = electroCraftDataModelSchema.parse({
        id: createDeterministicObjectId('data-model', 'm08-9-pglite-order'),
        key: 'order',
        label: 'Pedido',
        capabilityRefs: ['data.advanced-fields'],
        fields: [
          field('price', 'number', { parentFieldRef: null, order: 0 }, true),
          field('quantity', 'number', { parentFieldRef: null, order: 1 }, true),
          group,
          field('email', 'email', { parentFieldRef: group.id, order: 0 }, true),
          field('total', 'calculated', {
            parentFieldRef: null,
            order: 3,
            calculated: {
              operation: 'multiply',
              operands: [
                { kind: 'field', fieldKey: 'price' },
                { kind: 'field', fieldKey: 'quantity' },
              ],
            },
          }),
          field('discountCode', 'conditional', {
            parentFieldRef: null,
            order: 4,
            conditional: {
              rule: { kind: 'comparison', fieldKey: 'total', operator: 'greater-than-or-equal', value: 100 },
              valueType: 'text',
              whenFalse: 'omit',
            },
          }),
        ],
        metadata: {},
      });
      const dataSchema = electroCraftDataSchemaSchema.parse({
        schemaVersion: 1,
        id: createDeterministicObjectId('data-schema', 'm08-9-pglite-schema'),
        version: 1,
        sourceRef: source.id,
        name: 'ElectroCraft Data',
        models: [model],
        metadata: { owner: 'PGlite generic content store' },
      });

      await db.insert(storageSchema.projects).values({ id: projectId, name: 'M08.9 PGlite', metadata: {} });
      await db.insert(storageSchema.projectObjects).values({
        projectId,
        objectId: dataSchema.id,
        kind: 'data-schema',
        schemaVersion: dataSchema.schemaVersion,
        payload: dataSchema,
        checksum: 'm08-9-schema-fixture',
      });

      const repository = createDrizzleInternalDataRepository(db);
      const registry = new ConnectorRegistry();
      registry.registerAdapter(
        createInternalDataSourceAdapter({ projectId, repository, permissions: { authorize: () => true } }),
      );
      await registry.mutate(source, 'development', {
        resourceId: model.id,
        operation: 'create',
        input: {
          id: 'record-1',
          data: {
            price: 25,
            quantity: 2,
            customer: { email: 'buyer@example.com' },
            discountCode: 'SAVE10',
          },
        },
      });

      await expect(repository.queryRecords(projectId, model.id)).resolves.toMatchObject({
        total: 1,
        rows: [
          expect.objectContaining({
            id: 'record-1',
            data: {
              price: 25,
              quantity: 2,
              customer: { email: 'buyer@example.com' },
              total: 50,
            },
          }),
        ],
      });
      await expect(
        registry.mutate(source, 'development', {
          resourceId: model.id,
          operation: 'create',
          input: { id: 'invalid', data: { price: 25, quantity: 2, customer: {} } },
        }),
      ).rejects.toThrow(/email es obligatorio/);
    } finally {
      await client.close();
    }
  });
});
