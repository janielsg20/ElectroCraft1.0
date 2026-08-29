import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  ConnectorRegistry,
  type DataSourceResourceDescriptor,
  type InternalDataQuery,
  type InternalDataQueryResult,
  type InternalDataRecord,
  type InternalDataRecordInput,
  type InternalDataRecordUpdate,
  type InternalDataRepository,
} from '@electrocraft/application';
import {
  createInternalDataSourceAdapter,
  InternalDataPermissionError,
} from '@electrocraft/connectors';
import {
  electroCraftDataSchemaSchema,
  electroCraftDataSourceDefinitionSchema,
  type ElectroCraftDataSchema,
} from '@electrocraft/domain';

function fixture(name: string): unknown {
  return JSON.parse(readFileSync(resolve(`tooling/fixtures/canonical-model/${name}.json`), 'utf8')) as unknown;
}

function createMemoryRepository(dataSchema: ElectroCraftDataSchema): InternalDataRepository {
  const rows = new Map<string, InternalDataRecord>();
  const resources: readonly DataSourceResourceDescriptor[] = dataSchema.models.map((model) => ({
    id: model.id,
    label: model.label,
    kind: 'model',
  }));

  return {
    async testConnection() {
      return { ok: true, message: 'local ready' };
    },
    async listResources() {
      return resources;
    },
    async getSchema() {
      return dataSchema;
    },
    async queryRecords(_projectId: string, modelId: string, query?: InternalDataQuery): Promise<InternalDataQueryResult> {
      const matches = [...rows.values()].filter((row) => row.modelId === modelId);
      const offset = query?.offset ?? 0;
      const limit = query?.limit ?? 50;
      return { rows: matches.slice(offset, offset + limit), total: matches.length, offset, limit };
    },
    async createRecord(_projectId: string, modelId: string, input: InternalDataRecordInput) {
      const now = new Date(0).toISOString();
      const row: InternalDataRecord = {
        id: input.id ?? 'record-created',
        modelId,
        data: input.data,
        state: input.state ?? 'published',
        createdAt: now,
        updatedAt: now,
      };
      rows.set(row.id, row);
      return row;
    },
    async updateRecord(_projectId: string, modelId: string, input: InternalDataRecordUpdate) {
      const current = rows.get(input.id);
      if (!current) throw new Error('record missing');
      const row: InternalDataRecord = {
        ...current,
        modelId,
        data: input.data,
        state: input.state ?? current.state,
        updatedAt: new Date(1).toISOString(),
      };
      rows.set(row.id, row);
      return row;
    },
    async deleteRecord(_projectId: string, _modelId: string, recordId: string) {
      return rows.delete(recordId);
    },
    async getStats() {
      return { modelCount: resources.length, recordCount: rows.size };
    },
  };
}

describe('M08.2 InternalDataSourceAdapter', () => {
  it('exposes CRUD/query/schema through ConnectorRegistry without leaking PGlite into the canonical source', async () => {
    const source = electroCraftDataSourceDefinitionSchema.parse(fixture('internal-data-source-v1'));
    const dataSchema = electroCraftDataSchemaSchema.parse(fixture('internal-data-schema-v1'));
    const repository = createMemoryRepository(dataSchema);
    const registry = new ConnectorRegistry();
    registry.registerAdapter(
      createInternalDataSourceAdapter({
        projectId: 'project-m08-2',
        repository,
        permissions: { authorize: () => true },
      }),
    );

    expect(registry.validateCompatibility(source)).toEqual([]);
    await expect(registry.testConnection(source, 'development')).resolves.toMatchObject({ ok: true });
    await expect(registry.listResources(source, 'development')).resolves.toEqual([
      expect.objectContaining({ id: 'ec_model_0000000000082', label: 'Producto' }),
    ]);
    await expect(registry.introspectSchema(source, 'development')).resolves.toMatchObject({ name: 'ElectroCraft Data' });

    await expect(
      registry.mutate(source, 'development', {
        resourceId: 'ec_model_0000000000082',
        operation: 'create',
        input: { id: 'record-1', data: { name: 'Cable USB', price: 12.5 } },
      }),
    ).resolves.toMatchObject({ id: 'record-1', data: { name: 'Cable USB', price: 12.5 } });

    await expect(
      registry.query(source, 'development', {
        resourceId: 'ec_model_0000000000082',
        requiredCapabilities: ['pagination'],
        input: { offset: 0, limit: 10 },
      }),
    ).resolves.toMatchObject({ total: 1, rows: [expect.objectContaining({ id: 'record-1' })] });

    await expect(
      registry.mutate(source, 'development', {
        resourceId: 'ec_model_0000000000082',
        operation: 'update',
        input: { id: 'record-1', data: { name: 'Cable USB-C', price: 14 } },
      }),
    ).resolves.toMatchObject({ data: { name: 'Cable USB-C', price: 14 } });

    await expect(
      registry.mutate(source, 'development', {
        resourceId: 'ec_model_0000000000082',
        operation: 'delete',
        input: { id: 'record-1' },
      }),
    ).resolves.toEqual({ deleted: true });
  });

  it('fails closed at the injected permission boundary', async () => {
    const source = electroCraftDataSourceDefinitionSchema.parse(fixture('internal-data-source-v1'));
    const dataSchema = electroCraftDataSchemaSchema.parse(fixture('internal-data-schema-v1'));
    const registry = new ConnectorRegistry();
    registry.registerAdapter(
      createInternalDataSourceAdapter({
        projectId: 'project-m08-2',
        repository: createMemoryRepository(dataSchema),
        permissions: { authorize: () => false },
      }),
    );

    await expect(registry.listResources(source, 'development')).rejects.toBeInstanceOf(InternalDataPermissionError);
    await expect(
      registry.mutate(source, 'development', {
        resourceId: 'ec_model_0000000000082',
        operation: 'create',
        input: { data: { name: 'Bloqueado' } },
      }),
    ).rejects.toBeInstanceOf(InternalDataPermissionError);
  });

  it('declares offline storage and never introduces a second physical content table', () => {
    const browserPort = readFileSync(resolve('packages/data-web/src/browser-internal-data.ts'), 'utf8');
    const schemaSource = readFileSync(resolve('packages/data-web/src/schema.ts'), 'utf8');
    const migrationSource = readFileSync(resolve('packages/data-web/src/migration.ts'), 'utf8');

    expect(browserPort).toContain('offlineCapable: true');
    expect(browserPort).toContain('electrocraft-studio-storage');
    expect(browserPort).not.toMatch(/fetch\(|XMLHttpRequest|WebSocket/);
    expect(schemaSource.match(/pgTable\('content_records'/g)).toHaveLength(1);
    expect(migrationSource.match(/CREATE TABLE IF NOT EXISTS content_records/g)).toHaveLength(1);
  });

  it('keeps the beginner UX local/offline and never exposes a SQL console', () => {
    const workspace = readFileSync(resolve('apps/studio/src/features/data/data-sources-feature-workspace.tsx'), 'utf8');
    const runtime = readFileSync(resolve('apps/studio/src/features/data/data-source-runtime.ts'), 'utf8');

    for (const copy of [
      'ElectroCraft Data',
      'Local',
      'Disponible sin conexión',
      'Modelos',
      'Registros',
      'Copia de seguridad',
      'help.data.internal',
    ]) {
      expect(workspace).toContain(copy);
    }
    expect(workspace).not.toMatch(/consola SQL|SQL console|textarea[^>]*sql/i);
    expect(runtime).toContain("storage: 'content_records'");
    expect(runtime).toContain('offlineCapable: true');
    expect(runtime).not.toContain('lastDocumentId');
  });
});
