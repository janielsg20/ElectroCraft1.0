import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  ConnectorRegistry,
  ConnectorRegistryError,
  createStoredDataSourceObject,
  type DataSourceAdapter,
} from '@electrocraft/application';
import { WebDataSourceRepository } from '@electrocraft/data-web';
import {
  createDeterministicObjectId,
  electroCraftDataSourceDefinitionSchema,
  normalizeDataSourceCapabilities,
  resolveDataSourceConfig,
  type ElectroCraftDataSourceDefinition,
} from '@electrocraft/domain';

const workspaceSource = readFileSync(
  new URL('../../../apps/studio/src/features/data/data-sources-workspace.tsx', import.meta.url),
  'utf8',
);
const workspaceCss = readFileSync(
  new URL('../../../apps/studio/src/features/data/data-sources-workspace.css', import.meta.url),
  'utf8',
);
const runtimeSource = readFileSync(
  new URL('../../../apps/studio/src/features/data/data-source-runtime.ts', import.meta.url),
  'utf8',
);
const routeSource = readFileSync(
  new URL('../../../apps/studio/src/shell/app-shell-route.tsx', import.meta.url),
  'utf8',
);

function source(overrides: Partial<ElectroCraftDataSourceDefinition> = {}) {
  return electroCraftDataSourceDefinitionSchema.parse({
    schemaVersion: 1,
    id: createDeterministicObjectId('data-source', 'm08-1-rest-source'),
    version: 1,
    key: 'catalogApi',
    label: 'Catalog API',
    kind: 'rest',
    adapterId: 'rest.fetch',
    authRef: null,
    config: { baseUrl: 'https://example.test/api' },
    environmentScope: ['development', 'preview', 'production'],
    environmentOverrides: {
      development: { baseUrl: 'http://localhost:8787/api' },
    },
    schemaDiscovery: 'on-demand',
    capabilities: ['read', 'filtering', 'sort', 'pagination'],
    metadata: {},
    ...overrides,
  });
}

function adapter(
  capabilities: DataSourceAdapter['capabilities'] = ['read', 'filtering', 'sort', 'pagination'],
): DataSourceAdapter {
  return {
    adapterId: 'rest.fetch',
    displayName: 'REST Fetch',
    supportedDataSourceKinds: ['rest'],
    capabilities,
    supportsSchemaDiscovery: true,
    async testConnection() {
      return { ok: true, message: 'connected' };
    },
    async listResources() {
      return [{ id: 'products', label: 'Products', kind: 'collection' }];
    },
    async getSchema() {
      return null;
    },
    async query(_context, request) {
      return request.input ?? [];
    },
    async mutate(_context, request) {
      return request.input ?? null;
    },
  };
}

describe('M08.1 DataSources registry', () => {
  it('registers, resolves and unregisters one backend-agnostic adapter through one registry owner', () => {
    const registry = new ConnectorRegistry();
    const registered = adapter();
    registry.registerAdapter(registered);

    expect(registry.resolveAdapter(source())).toBe(registered);
    expect(registry.list()).toEqual([
      expect.objectContaining({
        adapterId: 'rest.fetch',
        adapterRegistered: true,
        supportsSchemaDiscovery: true,
      }),
    ]);
    expect(registry.unregister('rest.fetch')).toBe(true);
    expect(registry.has('rest.fetch')).toBe(false);
  });

  it('validates declared capabilities and unknown adapters without deriving hidden support', () => {
    const registry = new ConnectorRegistry();
    registry.registerAdapter(adapter(['read']));

    expect(registry.validateCompatibility(source())).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'UNSUPPORTED_CAPABILITY', capability: 'filtering' }),
        expect.objectContaining({ code: 'UNSUPPORTED_CAPABILITY', capability: 'pagination' }),
        expect.objectContaining({ code: 'UNSUPPORTED_CAPABILITY', capability: 'sort' }),
      ]),
    );

    const unknown = source({ adapterId: 'rest.unknown' });
    expect(registry.validateCompatibility(unknown)).toEqual([
      expect.objectContaining({ code: 'UNKNOWN_ADAPTER', adapterId: 'rest.unknown' }),
    ]);
    expect(() => registry.resolveAdapter(unknown)).toThrow(ConnectorRegistryError);
  });

  it('normalizes legacy aliases to the eleven canonical M08.1 capability flags', () => {
    expect(
      normalizeDataSourceCapabilities([
        'read',
        'write',
        'paginate',
        'filter',
        'sort',
        'aggregate',
        'subscribe',
        'files',
        'transactions',
      ]),
    ).toEqual([
      'read',
      'create',
      'update',
      'delete',
      'pagination',
      'filtering',
      'sort',
      'aggregate',
      'realtime',
      'file',
      'transactions',
    ]);
  });

  it('blocks operations not declared by the source before the adapter executes', async () => {
    const registry = new ConnectorRegistry();
    registry.registerAdapter(adapter(['read', 'create']));
    const readOnlySource = source({ capabilities: ['read'] });

    await expect(
      registry.mutate(readOnlySource, 'development', {
        resourceId: 'products',
        operation: 'create',
        input: { name: 'Blocked' },
      }),
    ).rejects.toMatchObject({ code: 'UNSUPPORTED_OPERATION' });
  });

  it('keeps portable environment config separate from secret references', () => {
    const definition = source();
    expect(resolveDataSourceConfig(definition, 'development')).toEqual({ baseUrl: 'http://localhost:8787/api' });
    expect(resolveDataSourceConfig(definition, 'production')).toEqual({ baseUrl: 'https://example.test/api' });

    expect(() => source({ config: { apiKey: 'must-not-be-persisted' } })).toThrow(/secrets are not allowed/);
    expect(() => source({ environmentOverrides: { production: { access_token: 'must-not-be-persisted' } } })).toThrow(
      /secrets are not allowed/,
    );
  });

  it('round-trips only the canonical project payload and persists it through the F04 object contract', () => {
    const definition = source();
    const roundTrip = electroCraftDataSourceDefinitionSchema.parse(JSON.parse(JSON.stringify(definition)));
    const stored = createStoredDataSourceObject(definition);

    expect(roundTrip).toEqual(definition);
    expect(stored.objectId).toBe(definition.id);
    expect(stored.kind).toBe('data-source');
    expect(stored.schemaVersion).toBe(1);
    expect(stored.payload).toEqual(definition);
    expect(runtimeSource).toContain('projectStorageRuntime.queueAutosave');
    expect(runtimeSource).toContain('createStoredDataSourceObject');
  });

  it('consumes test, resource and schema operations through the data-web repository facade', async () => {
    const registry = new ConnectorRegistry();
    registry.registerAdapter(adapter());
    const repository = new WebDataSourceRepository(registry);
    const definition = source();

    await expect(repository.testConnection(definition, 'development')).resolves.toEqual({
      ok: true,
      message: 'connected',
    });
    await expect(repository.listResources(definition, 'development')).resolves.toEqual([
      { id: 'products', label: 'Products', kind: 'collection' },
    ]);
    await expect(repository.getSchema(definition, 'development')).resolves.toBeNull();
  });

  it('exposes the canonical Spanish responsive /data-sources list-detail-inspector UX', () => {
    expect(routeSource).toContain("pathname === '/data-sources'");
    expect(workspaceSource).toContain('data-data-sources-workspace');
    expect(workspaceSource).toContain('data-mobile-detail');
    expect(workspaceSource).toContain('Fuentes de datos');
    expect(workspaceSource).toContain('Nueva fuente');
    expect(workspaceSource).toContain('Interna');
    expect(workspaceSource).toContain('REST API');
    expect(workspaceSource).toContain('GraphQL');
    expect(workspaceSource).toContain('Probar conexión');
    expect(workspaceSource).toContain('Esquema');
    expect(workspaceSource).toContain('Credenciales');
    expect(workspaceSource).toContain('Requiere gateway');
    expect(workspaceSource).toContain('help.data.sources');
    expect(workspaceSource).not.toContain('type="password"');
    expect(workspaceCss).toContain('grid-template-columns: 300px minmax(0, 1fr) 280px');
    expect(workspaceCss).toContain('@media (max-width: 1180px)');
    expect(workspaceCss).toContain('@media (max-width: 760px)');
  });
});
