import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ConnectorRegistry, type DataSourceAdapter } from '@electrocraft/application';
import { ConnectorExtensionRegistry, ConnectorExtensionRegistryError } from '@electrocraft/connectors';
import { createConnectorCatalog } from '@electrocraft/data-web';
import {
  connectorExtensionManifestSchema,
  createDeterministicObjectId,
  electroCraftDataSourceDefinitionSchema,
  type ConnectorExtensionManifest,
  type ElectroCraftDataSourceDefinition,
} from '@electrocraft/domain';

const pickerSource = readFileSync(
  new URL('../../../apps/studio/src/features/data/rest-source-wizard.tsx', import.meta.url),
  'utf8',
);
const catalogSource = readFileSync(
  new URL('../../../apps/studio/src/features/data/connector-catalog.tsx', import.meta.url),
  'utf8',
);
const catalogModelSource = readFileSync(
  new URL('../../../packages/data-web/src/connector-catalog.ts', import.meta.url),
  'utf8',
);
const optionalPacksDoc = readFileSync(
  new URL('../../../packages/connectors/OPTIONAL_CONNECTOR_PACKS.md', import.meta.url),
  'utf8',
);
const connectorPackageJson = readFileSync(
  new URL('../../../packages/connectors/package.json', import.meta.url),
  'utf8',
);

function manifest(
  adapterId = 'sql.postgresql',
  packageId = 'electrocraft.connector.postgresql',
  displayName = 'PostgreSQL',
): ConnectorExtensionManifest {
  return connectorExtensionManifestSchema.parse({
    schemaVersion: 1,
    extensionPackage: {
      format: 'ElectroCraftExtensionPackage',
      packageId,
      displayName,
      version: '1.0.0',
      codeReviewRequired: true,
    },
    adapterId,
    sourceKind: 'sql',
    configSchema: {
      fields: [
        { key: 'host', label: 'Host', type: 'string', required: true },
        { key: 'port', label: 'Puerto', type: 'number', required: true, defaultValue: 5432 },
        { key: 'credentialRef', label: 'Credencial', type: 'secret-ref', required: true },
      ],
    },
    capabilities: ['read', 'create', 'update', 'delete', 'filtering', 'sort', 'pagination', 'transactions'],
    gateway: 'required',
    runtime: {
      browserModule: null,
      gatewayModule: `@${packageId}/gateway`,
    },
    targetSupport: [
      'local-project',
      'react-web',
      'static-web',
      'pwa',
      'android-expo',
      'ios-expo',
      'capacitor',
      'lamp',
      'wordpress',
    ],
    secretStrategy: 'secret-ref-gateway',
  });
}

function adapter(adapterId = 'sql.postgresql'): DataSourceAdapter {
  return {
    adapterId,
    displayName: adapterId === 'sql.mysql' ? 'MySQL' : 'PostgreSQL',
    supportedDataSourceKinds: ['sql'],
    capabilities: ['read', 'create', 'update', 'delete', 'filtering', 'sort', 'pagination', 'transactions'],
    supportsSchemaDiscovery: true,
    async testConnection() {
      return { ok: true, message: 'Conectado mediante Gateway' };
    },
    async listResources() {
      return [{ id: 'public.products', label: 'products', kind: 'table' }];
    },
    async getSchema() {
      return null;
    },
    async query(_context, request) {
      return { resourceId: request.resourceId };
    },
    async mutate(_context, request) {
      return { resourceId: request.resourceId, operation: request.operation };
    },
  };
}

function source(adapterId = 'sql.postgresql'): ElectroCraftDataSourceDefinition {
  return electroCraftDataSourceDefinitionSchema.parse({
    schemaVersion: 1,
    id: createDeterministicObjectId('data-source', `m08-7-${adapterId}`),
    version: 1,
    key: adapterId === 'sql.mysql' ? 'mysqlDb' : 'postgresDb',
    label: adapterId === 'sql.mysql' ? 'MySQL DB' : 'PostgreSQL DB',
    kind: 'sql',
    adapterId,
    authRef: createDeterministicObjectId('secret-ref', `m08-7-${adapterId}`),
    config: { host: 'db.internal', port: adapterId === 'sql.mysql' ? 3306 : 5432 },
    environmentScope: ['development', 'production'],
    environmentOverrides: {},
    schemaDiscovery: 'on-demand',
    capabilities: ['read', 'create', 'update', 'delete', 'filtering', 'sort', 'pagination', 'transactions'],
    metadata: {},
  });
}

describe('M08.7 Connector SDK boundary', () => {
  it('installs a real extension adapter over the existing ConnectorRegistry and executes read/CRUD through it', async () => {
    const registry = new ConnectorRegistry();
    const extensions = new ConnectorExtensionRegistry(registry);
    const pgManifest = manifest();
    const pgAdapter = adapter();
    const pgSource = source();

    extensions.install({ manifest: pgManifest, adapter: pgAdapter });

    expect(registry.resolveAdapter(pgSource)).toBe(pgAdapter);
    expect(extensions.requireInstalled('sql.postgresql')).toEqual(pgManifest);
    expect(extensions.diagnoseSource(pgSource)).toEqual([]);
    await expect(registry.query(pgSource, 'development', { resourceId: 'public.products' })).resolves.toEqual({
      resourceId: 'public.products',
    });
    await expect(
      registry.mutate(pgSource, 'development', {
        resourceId: 'public.products',
        operation: 'create',
        input: { name: 'Producto' },
      }),
    ).resolves.toEqual({ resourceId: 'public.products', operation: 'create' });
    expect(createConnectorCatalog(registry, extensions)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          adapterId: 'sql.postgresql',
          origin: 'extension',
          availability: 'installed',
          version: '1.0.0',
          gateway: 'required',
        }),
      ]),
    );
  });

  it('fails closed with a missing connector diagnostic instead of inventing a driver', () => {
    const registry = new ConnectorRegistry();
    const extensions = new ConnectorExtensionRegistry(registry);

    expect(extensions.diagnoseSource(source())).toEqual([
      expect.objectContaining({
        code: 'MISSING_CONNECTOR_EXTENSION',
        adapterId: 'sql.postgresql',
      }),
    ]);
    expect(() => registry.resolveAdapter(source())).toThrow(/no DataSourceAdapter registered/);
  });

  it('consumes the manifest config schema and reports missing config/SecretRef explicitly', () => {
    const registry = new ConnectorRegistry();
    const extensions = new ConnectorExtensionRegistry(registry);
    extensions.install({ manifest: manifest(), adapter: adapter() });
    const invalidSource = electroCraftDataSourceDefinitionSchema.parse({
      ...source(),
      authRef: null,
      config: { port: 5432 },
    });

    expect(extensions.diagnoseSource(invalidSource)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'EXTENSION_CONFIG_REQUIRED', fieldKey: 'host' }),
        expect.objectContaining({ code: 'EXTENSION_SECRET_REF_REQUIRED', fieldKey: 'credentialRef' }),
      ]),
    );
  });

  it('blocks uninstall while a DataSourceDefinition still uses the extension', () => {
    const registry = new ConnectorRegistry();
    const extensions = new ConnectorExtensionRegistry(registry);
    extensions.install({ manifest: manifest(), adapter: adapter() });

    expect(() => extensions.uninstall('sql.postgresql', [source()])).toThrow(ConnectorExtensionRegistryError);
    try {
      extensions.uninstall('sql.postgresql', [source()]);
    } catch (error) {
      expect(error).toMatchObject({ code: 'CONNECTOR_EXTENSION_IN_USE' });
    }
    expect(registry.has('sql.postgresql')).toBe(true);

    expect(extensions.uninstall('sql.postgresql', [])).toBe(true);
    expect(registry.has('sql.postgresql')).toBe(false);
  });

  it('prunes optional runtime/gateway dependencies that are not used by project sources', () => {
    const registry = new ConnectorRegistry();
    const extensions = new ConnectorExtensionRegistry(registry);
    extensions.install({ manifest: manifest(), adapter: adapter() });
    extensions.install({
      manifest: manifest('sql.mysql', 'electrocraft.connector.mysql', 'MySQL'),
      adapter: adapter('sql.mysql'),
    });

    expect(extensions.pruneRuntimeDependencies([source('sql.postgresql')])).toEqual([
      expect.objectContaining({
        adapterId: 'sql.postgresql',
        packageId: 'electrocraft.connector.postgresql',
        gatewayModule: '@electrocraft.connector.postgresql/gateway',
      }),
    ]);
  });

  it('rejects SQL manifests that bypass Gateway or embed a secret default', () => {
    const base = manifest();
    expect(() => connectorExtensionManifestSchema.parse({ ...base, gateway: 'none' })).toThrow(/ConnectorGateway/);
    expect(() =>
      connectorExtensionManifestSchema.parse({
        ...base,
        configSchema: {
          fields: [{ key: 'credentialRef', label: 'Credencial', type: 'secret-ref', defaultValue: 'raw-secret' }],
        },
      }),
    ).toThrow(/cannot embed a default secret value/);
  });

  it('keeps PostgreSQL/MySQL as honest optional packs and exposes the required Spanish catalog UX', () => {
    expect(pickerSource).toContain('Más conectores');
    expect(catalogModelSource).toContain('PostgreSQL');
    expect(catalogModelSource).toContain('MySQL');
    expect(catalogSource).toContain('Requiere extensión');
    expect(catalogSource).toContain('Requiere gateway');
    expect(catalogSource).toContain('Instalar conector');
    expect(catalogSource).toContain('help.data.connectors');
    expect(catalogModelSource).toContain('/extensions?connector=');
    expect(optionalPacksDoc).toContain('Core no incluye el driver');
    expect(optionalPacksDoc).toContain('pruneRuntimeDependencies()');
    expect(connectorPackageJson).not.toMatch(/\b(pg|postgres|postgresql|mysql2|mysql|mariadb)\b/i);
  });
});
