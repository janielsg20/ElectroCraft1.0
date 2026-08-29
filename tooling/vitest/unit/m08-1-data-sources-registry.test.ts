import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  ConnectorRegistry,
  ConnectorRegistryError,
  createStoredDataSourceObject,
  type DataSourceAdapter,
} from '@electrocraft/application';
import {
  createDeterministicObjectId,
  electroCraftDataSourceDefinitionSchema,
  normalizeDataSourceCapabilities,
  resolveDataSourceConfig,
  type ElectroCraftDataSourceDefinition,
} from '@electrocraft/domain';

const workspaceSource = readFileSync(
  new URL('../../../apps/studio/src/features/data-sources/data-sources-workspace.tsx', import.meta.url),
  'utf8',
);
const runtimeSource = readFileSync(
  new URL('../../../apps/studio/src/features/data-sources/data-source-runtime.ts', import.meta.url),
  'utf8',
);
const routeSource = readFileSync(new URL('../../../apps/studio/src/shell/app-shell-route.tsx', import.meta.url), 'utf8');

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
    environmentOverrides: {
      development: { baseUrl: 'http://localhost:8787/api' },
    },
    schemaDiscovery: 'on-demand',
    capabilities: ['read', 'filter', 'sort', 'pagination'],
    metadata: {},
    ...overrides,
  });
}

function adapter(capabilities: DataSourceAdapter['capabilities'] = ['read', 'filter', 'sort', 'pagination']): DataSourceAdapter {
  return {
    adapterId: 'rest.fetch',
    displayName: 'REST Fetch',
    supportedDataSourceKinds: ['rest'],
    capabilities,
    supportsSchemaDiscovery: true,
    async testConnection() {
      return { ok: true, message: 'connected' };
    },
    async getSchema() {
      return null;
    },
    async read() {
      return [];
    },
    async create(_context, input) {
      return input;
    },
    async update(_context, input) {
      return input;
    },
    async remove(_context, input) {
      return input;
    },
  };
}

describe('M08.1 DataSources registry', () => {
  it('registers and resolves one backend-agnostic DataSourceAdapter through the existing registry owner', () => {
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
  });

  it('validates declared capabilities and unknown adapters without deriving hidden support', () => {
    const registry = new ConnectorRegistry();
    registry.registerAdapter(adapter(['read']));

    expect(registry.validateCompatibility(source())).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'UNSUPPORTED_CAPABILITY', capability: 'filter' }),
        expect.objectContaining({ code: 'UNSUPPORTED_CAPABILITY', capability: 'pagination' }),
      ]),
    );

    const unknown = source({ adapterId: 'rest.unknown' });
    expect(registry.validateCompatibility(unknown)).toEqual([
      expect.objectContaining({ code: 'UNKNOWN_ADAPTER', adapterId: 'rest.unknown' }),
    ]);
    expect(() => registry.resolveAdapter(unknown)).toThrow(ConnectorRegistryError);
  });

  it('normalizes legacy capability aliases to the eight canonical capability names', () => {
    expect(
      normalizeDataSourceCapabilities(['read', 'create', 'update', 'delete', 'paginate', 'subscribe', 'aggregate']),
    ).toEqual(['read', 'write', 'pagination', 'realtime']);
  });

  it('keeps portable environment config separate from secret references', () => {
    const definition = source();
    expect(resolveDataSourceConfig(definition, 'development')).toEqual({ baseUrl: 'http://localhost:8787/api' });
    expect(resolveDataSourceConfig(definition, 'production')).toEqual({ baseUrl: 'https://example.test/api' });

    expect(() => source({ config: { apiKey: 'must-not-be-persisted' } })).toThrow(/secrets are not allowed/);
    expect(() =>
      source({ environmentOverrides: { production: { access_token: 'must-not-be-persisted' } } }),
    ).toThrow(/secrets are not allowed/);
  });

  it('persists the canonical source through the generic F04 project object contract', () => {
    const definition = source();
    const stored = createStoredDataSourceObject(definition);

    expect(stored.objectId).toBe(definition.id);
    expect(stored.kind).toBe('data-source');
    expect(stored.schemaVersion).toBe(1);
    expect(stored.payload).toEqual(definition);
    expect(runtimeSource).toContain('projectStorageRuntime.queueAutosave');
    expect(runtimeSource).toContain("kind: 'data-source'");
  });

  it('delegates connection testing and schema introspection to the registered adapter', async () => {
    const registry = new ConnectorRegistry();
    registry.registerAdapter(adapter());
    const definition = source();

    await expect(registry.testConnection(definition, 'development')).resolves.toEqual({ ok: true, message: 'connected' });
    await expect(registry.introspectSchema(definition, 'development')).resolves.toBeNull();
  });

  it('exposes the canonical /data-sources desktop and mobile list-detail UX', () => {
    expect(routeSource).toContain("pathname === '/data-sources'");
    expect(workspaceSource).toContain('data-data-sources-workspace');
    expect(workspaceSource).toContain('data-mobile-detail');
    expect(workspaceSource).toContain('Añadir fuente de datos');
    expect(workspaceSource).toContain('Probar conexión');
    expect(workspaceSource).toContain('Inspeccionar esquema');
    expect(workspaceSource).toContain('help.section.data-sources');
    expect(workspaceSource).not.toContain('password');
    expect(workspaceSource).not.toContain('apiKey');
  });
});
