import { describe, expect, it, vi } from 'vitest';
import {
  createGraphQLDataSourceAdapter,
  GraphQLDataSourceError,
  GRAPHQL_DATA_ADAPTER_ID,
  type GraphQLGatewayPort,
} from '../../../packages/connectors/src/graphql-data-source-adapter';
import {
  createDeterministicObjectId,
  electroCraftDataSourceDefinitionSchema,
  electroCraftGraphQLDataSourceConfigSchema,
  type ElectroCraftGraphQLOperationDefinition,
  type JsonValue,
} from '../../../packages/domain/src';

const queryOperation: ElectroCraftGraphQLOperationDefinition = {
  id: 'query_products',
  label: 'Productos',
  operationType: 'query',
  kind: 'read',
  fieldName: 'products',
  document: 'query Products { products { id name } }',
  requiresAuth: false,
  variables: [],
  outputSchema: null,
};

const mutationOperation: ElectroCraftGraphQLOperationDefinition = {
  id: 'mutation_updateProduct',
  label: 'Actualizar producto',
  operationType: 'mutation',
  kind: 'update',
  fieldName: 'updateProduct',
  document: 'mutation UpdateProduct($id: ID!, $name: String!) { updateProduct(id: $id, name: $name) { id name } }',
  requiresAuth: false,
  variables: [
    { name: 'id', graphQLType: 'ID!', valueType: 'string', required: true },
    { name: 'name', graphQLType: 'String!', valueType: 'string', required: true },
  ],
  outputSchema: null,
};

function config(overrides: Record<string, unknown> = {}) {
  return electroCraftGraphQLDataSourceConfigSchema.parse({
    endpoint: 'https://api.example.test/graphql',
    defaultHeaders: {},
    timeoutMs: 5_000,
    executionMode: 'browser',
    introspectionEnabled: true,
    operations: [queryOperation, mutationOperation],
    ...overrides,
  });
}

function source(options: { authRef?: string | null; config?: ReturnType<typeof config> } = {}) {
  return electroCraftDataSourceDefinitionSchema.parse({
    schemaVersion: 1,
    id: createDeterministicObjectId('data-source', 'm08-4-graphql'),
    version: 1,
    key: 'graphQLTest',
    label: 'GraphQL Test',
    kind: 'graphql',
    adapterId: GRAPHQL_DATA_ADAPTER_ID,
    authRef: options.authRef ?? null,
    config: options.config ?? config(),
    environmentScope: ['development'],
    environmentOverrides: {},
    schemaDiscovery: 'on-demand',
    capabilities: ['read', 'update'],
    metadata: {},
  });
}

function context(currentSource = source()) {
  return { source: currentSource, environment: 'development' as const, config: currentSource.config };
}

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { 'content-type': 'application/json' } });
}

const introspectionPayload = {
  data: {
    __schema: {
      queryType: { name: 'Query' },
      mutationType: { name: 'Mutation' },
      types: [
        {
          kind: 'OBJECT',
          name: 'Query',
          fields: [
            {
              name: 'products',
              args: [],
              type: { kind: 'LIST', name: null, ofType: { kind: 'OBJECT', name: 'Product', ofType: null } },
            },
          ],
        },
        {
          kind: 'OBJECT',
          name: 'Mutation',
          fields: [
            {
              name: 'updateProduct',
              args: [
                {
                  name: 'id',
                  type: { kind: 'NON_NULL', name: null, ofType: { kind: 'SCALAR', name: 'ID', ofType: null } },
                },
              ],
              type: { kind: 'OBJECT', name: 'Product', ofType: null },
            },
          ],
        },
        {
          kind: 'OBJECT',
          name: 'Product',
          fields: [
            {
              name: 'id',
              args: [],
              type: { kind: 'NON_NULL', name: null, ofType: { kind: 'SCALAR', name: 'ID', ofType: null } },
            },
            { name: 'name', args: [], type: { kind: 'SCALAR', name: 'String', ofType: null } },
          ],
        },
      ],
    },
  },
};

describe('M08.4 GraphQLDataSourceAdapter', () => {
  it('ejecuta Query y normaliza data/errors', async () => {
    const fetch = vi.fn(async () => jsonResponse({ data: { products: [{ id: 'p1', name: 'Cable' }] } }));
    const adapter = createGraphQLDataSourceAdapter({ fetch: fetch as typeof globalThis.fetch });
    const result = (await adapter.query(context(), { resourceId: queryOperation.id })) as unknown as {
      ok: boolean;
      data: JsonValue;
      errors: readonly unknown[];
      transport: string;
    };
    expect(result).toMatchObject({ ok: true, transport: 'browser', data: { products: [{ id: 'p1', name: 'Cable' }] } });
    expect(result.errors).toHaveLength(0);
    const body = JSON.parse(String(fetch.mock.calls[0]?.[1]?.body)) as { query: string; variables: unknown };
    expect(body.query).toContain('query Products');
    expect(body.variables).toEqual({});
  });

  it('ejecuta Mutation con variables tipadas', async () => {
    const fetch = vi.fn(async () => jsonResponse({ data: { updateProduct: { id: 'p1', name: 'Cable Pro' } } }));
    const adapter = createGraphQLDataSourceAdapter({ fetch: fetch as typeof globalThis.fetch });
    const result = (await adapter.mutate(context(), {
      resourceId: mutationOperation.id,
      operation: 'update',
      input: { variables: { id: 'p1', name: 'Cable Pro' } },
    })) as unknown as { ok: boolean; data: JsonValue };
    expect(result.ok).toBe(true);
    expect(result.data).toEqual({ updateProduct: { id: 'p1', name: 'Cable Pro' } });
    const body = JSON.parse(String(fetch.mock.calls[0]?.[1]?.body)) as { variables: unknown };
    expect(body.variables).toEqual({ id: 'p1', name: 'Cable Pro' });
  });

  it('convierte introspection a esquema y operaciones canónicas', async () => {
    const fetch = vi.fn(async () => jsonResponse(introspectionPayload));
    const adapter = createGraphQLDataSourceAdapter({ fetch: fetch as typeof globalThis.fetch });
    const result = await adapter.introspect(context());
    expect(result.schema?.models.some(({ key }) => key === 'Product')).toBe(true);
    expect(
      result.operations.some(({ operationType, fieldName }) => operationType === 'query' && fieldName === 'products'),
    ).toBe(true);
    expect(
      result.operations.some(
        ({ operationType, fieldName }) => operationType === 'mutation' && fieldName === 'updateProduct',
      ),
    ).toBe(true);
  });

  it('falla explícitamente cuando introspection es denegada', async () => {
    const fetch = vi.fn(async () => jsonResponse({ errors: [{ message: 'Introspection disabled' }] }));
    const adapter = createGraphQLDataSourceAdapter({ fetch: fetch as typeof globalThis.fetch });
    await expect(adapter.introspect(context())).rejects.toMatchObject<Partial<GraphQLDataSourceError>>({
      code: 'GRAPHQL_INTROSPECTION_DENIED',
    });
  });

  it('resuelve SecretRef mediante Gateway y nunca inyecta el secreto en config', async () => {
    const authRef = createDeterministicObjectId('secret', 'graphql-test');
    const gateway: GraphQLGatewayPort = {
      execute: vi.fn(async (request) => ({
        ok: true,
        status: 200,
        data: { gateway: request.authRef },
        errors: [],
        error: null,
        transport: 'gateway',
      })),
    };
    const gatewayConfig = config({ executionMode: 'auto' });
    const currentSource = source({ authRef, config: gatewayConfig });
    const adapter = createGraphQLDataSourceAdapter({ gateway });
    const result = (await adapter.query(context(currentSource), { resourceId: queryOperation.id })) as unknown as {
      transport: string;
      data: JsonValue;
    };
    expect(result.transport).toBe('gateway');
    expect(result.data).toEqual({ gateway: authRef });
    expect(JSON.stringify(currentSource.config)).not.toContain(authRef);
  });

  it('bloquea headers sensibles en la configuración portable', () => {
    expect(() => config({ defaultHeaders: { Authorization: 'Bearer forbidden' } })).toThrow(/authRef\/Gateway/);
  });
});
