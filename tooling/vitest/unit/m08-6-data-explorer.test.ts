import { describe, expect, it, vi } from 'vitest';
import {
  ConnectorRegistry,
  buildDataExplorerInput,
  createDataExplorerQueryDraft,
  createDataExplorerService,
  type DataSourceAdapter,
  type DataSourceAdapterContext,
  type DataSourceMutationRequest,
  type DataSourceQueryRequest,
} from '@electrocraft/application';
import {
  electroCraftDataSourceDefinitionSchema,
  electroCraftQueryDefinitionSchema,
  type ElectroCraftDataSourceDefinition,
  type JsonValue,
} from '@electrocraft/domain';

const operation = Object.freeze({
  id: 'listProducts',
  label: 'Listar productos',
  capability: 'read' as const,
  parameters: Object.freeze([
    Object.freeze({
      name: 'limit',
      label: 'Límite',
      location: 'query' as const,
      inputPath: Object.freeze(['query', 'limit']),
      required: true,
      valueType: 'number' as const,
    }),
  ]),
  inputSchema: null,
  resourceId: 'products',
  resourceLabel: 'Productos',
  resourceKind: 'rest:read',
  dataSchemaId: null,
});

const mutation = Object.freeze({
  ...operation,
  id: 'createProduct',
  label: 'Crear producto',
  capability: 'create' as const,
  parameters: Object.freeze([]),
});

function source(): ElectroCraftDataSourceDefinition {
  return electroCraftDataSourceDefinitionSchema.parse({
    schemaVersion: 1,
    id: 'ec_data-source_0000000000086',
    version: 1,
    key: 'catalog',
    label: 'Catálogo',
    kind: 'rest',
    adapterId: 'test.explorer',
    authRef: null,
    config: {},
    environmentScope: ['development'],
    environmentOverrides: {},
    schemaDiscovery: 'manual',
    capabilities: ['read', 'create'],
    metadata: {},
  });
}

function adapter(overrides: Partial<DataSourceAdapter> = {}): DataSourceAdapter {
  return {
    adapterId: 'test.explorer',
    displayName: 'Test Explorer',
    supportedDataSourceKinds: ['rest'],
    capabilities: ['read', 'create'],
    supportsSchemaDiscovery: false,
    async testConnection() {
      return { ok: true, message: 'OK' };
    },
    async listResources() {
      return [
        {
          id: operation.resourceId,
          label: operation.resourceLabel,
          kind: operation.resourceKind,
          operations: [operation, mutation],
        },
      ];
    },
    async getSchema() {
      return null;
    },
    async query(_context: DataSourceAdapterContext, _request: DataSourceQueryRequest): Promise<JsonValue> {
      return {
        ok: true,
        data: [
          { id: 'p-1', name: 'Uno', authorization: 'Bearer never-visible' },
          { id: 'p-2', name: 'Dos', nested: { apiKey: 'never-visible-either' } },
          { id: 'p-3', name: 'Tres' },
        ],
      };
    },
    async mutate(_context: DataSourceAdapterContext, _request: DataSourceMutationRequest): Promise<JsonValue> {
      return { ok: true, data: { id: 'p-4' } };
    },
    ...overrides,
  };
}

describe('M08.6 Data Explorer', () => {
  it('lists and explicitly executes a read operation with typed parameters and truncation', async () => {
    const registry = new ConnectorRegistry();
    const query = vi.fn(adapter().query);
    registry.registerAdapter(adapter({ query }));
    const now = vi.fn().mockReturnValueOnce(100).mockReturnValueOnce(112.5);
    const explorer = createDataExplorerService(registry, { now, maxItems: 2 });

    const operations = await explorer.listOperations(source(), 'development');
    const input = buildDataExplorerInput(operations[0]!, { limit: '25' });

    expect(query).not.toHaveBeenCalled();
    await expect(
      explorer.execute({ source: source(), environment: 'development', operation: operations[0]!, input }),
    ).resolves.toMatchObject({
      status: 'success',
      durationMs: 12.5,
      truncated: true,
      preview: [
        { id: 'p-1', name: 'Uno', authorization: '[REDACTADO]' },
        { id: 'p-2', name: 'Dos', nested: { apiKey: '[REDACTADO]' } },
      ],
    });
    expect(query).toHaveBeenCalledOnce();
    expect(input).toEqual({ query: { limit: 25 } });
  });

  it('requires an explicit confirmation before executing a mutation', async () => {
    const registry = new ConnectorRegistry();
    const mutate = vi.fn(adapter().mutate);
    registry.registerAdapter(adapter({ mutate }));
    const explorer = createDataExplorerService(registry, { now: () => 10 });

    await expect(
      explorer.execute({ source: source(), environment: 'development', operation: mutation, input: {} }),
    ).rejects.toMatchObject({ code: 'MUTATION_CONFIRMATION_REQUIRED' });
    expect(mutate).not.toHaveBeenCalled();

    await expect(
      explorer.execute({
        source: source(),
        environment: 'development',
        operation: mutation,
        input: {},
        mutationConfirmed: true,
      }),
    ).resolves.toMatchObject({ status: 'success' });
    expect(mutate).toHaveBeenCalledOnce();
  });

  it('returns recoverable Spanish errors without leaking sensitive values', async () => {
    const registry = new ConnectorRegistry();
    registry.registerAdapter(
      adapter({
        async query() {
          throw new Error('authorization token rejected: top-secret');
        },
      }),
    );
    const explorer = createDataExplorerService(registry, { now: () => 20 });

    const result = await explorer.execute({
      source: source(),
      environment: 'development',
      operation,
      input: { authorization: 'Bearer hidden' },
    });

    expect(result).toMatchObject({
      status: 'error',
      error: 'La operación falló sin exponer datos sensibles.',
      trace: { input: { authorization: '[REDACTADO]' }, output: null },
    });
    expect(JSON.stringify(result)).not.toContain('top-secret');
    expect(JSON.stringify(result)).not.toContain('Bearer hidden');
  });

  it('creates a canonical QueryDefinition draft from a read operation', () => {
    const draft = createDataExplorerQueryDraft({
      source: source(),
      operation,
      input: { query: { limit: 25 } },
      idSeed: 'm08.6-query-draft',
    });

    expect(electroCraftQueryDefinitionSchema.parse(draft)).toEqual(draft);
    expect(draft).toMatchObject({
      sourceRef: source().id,
      resource: 'products',
      params: { query: { limit: 25 } },
      conditions: { combinator: 'and', rules: [] },
      metadata: { status: 'draft', explorerOperationId: 'listProducts', requiresSchemaBinding: true },
    });
  });
});
