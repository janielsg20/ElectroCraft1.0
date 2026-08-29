import {
  normalizeDataSourceCapabilities,
  resolveDataSourceConfig,
  type ElectroCraftCanonicalDataSourceCapability,
  type ElectroCraftDataSourceDefinition,
  type ElectroCraftDataSourceEnvironment,
  type ElectroCraftObjectId,
  type ElectroCraftQueryDefinition,
  type ElectroCraftQueryResult,
  type JsonValue,
} from '@electrocraft/domain';
import type { DataSourceAdapter, DataSourceAdapterContext } from './data';

export interface DataConnectorExecutionRequest {
  source: ElectroCraftDataSourceDefinition;
  query: ElectroCraftQueryDefinition;
  compiled: {
    predicate: string;
    params: JsonValue[];
    fieldBindings: Array<{ token: string; fieldRef: ElectroCraftObjectId }>;
  };
}

export interface ElectroCraftDataConnector {
  readonly adapterId: string;
  execute(request: DataConnectorExecutionRequest): Promise<ElectroCraftQueryResult>;
}

export type ConnectorRegistryBlockedCode =
  | 'CONNECTOR_NOT_REGISTERED'
  | 'ADAPTER_NOT_REGISTERED'
  | 'ADAPTER_ID_MISMATCH'
  | 'CONNECTOR_EXECUTION_FAILED'
  | 'ADAPTER_INCOMPATIBLE';

export type ConnectorCompatibilityDiagnosticCode =
  | 'UNKNOWN_ADAPTER'
  | 'UNSUPPORTED_DATA_SOURCE_KIND'
  | 'UNSUPPORTED_CAPABILITY';

export interface ConnectorCompatibilityDiagnostic {
  readonly code: ConnectorCompatibilityDiagnosticCode;
  readonly adapterId: string;
  readonly sourceId: ElectroCraftObjectId;
  readonly capability?: ElectroCraftCanonicalDataSourceCapability;
  readonly message: string;
}

interface ConnectorRegistryEntry {
  readonly adapterId: string;
  connector?: ElectroCraftDataConnector;
  adapter?: DataSourceAdapter;
}

export class ConnectorRegistryError extends Error {
  constructor(
    readonly code: ConnectorRegistryBlockedCode,
    message: string,
    readonly details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = 'ConnectorRegistryError';
  }
}

function validateAdapterId(adapterId: string) {
  if (adapterId.trim() !== adapterId || !/^[a-z][a-z0-9.-]{1,119}$/.test(adapterId)) {
    throw new ConnectorRegistryError('ADAPTER_ID_MISMATCH', 'connector adapterId is invalid', { adapterId });
  }
}

export class ConnectorRegistry {
  private readonly entries = new Map<string, ConnectorRegistryEntry>();

  register(connector: ElectroCraftDataConnector): void {
    validateAdapterId(connector.adapterId);
    const current = this.entries.get(connector.adapterId);
    this.entries.set(connector.adapterId, { adapterId: connector.adapterId, ...current, connector });
  }

  registerAdapter(adapter: DataSourceAdapter): void {
    validateAdapterId(adapter.adapterId);
    const current = this.entries.get(adapter.adapterId);
    this.entries.set(adapter.adapterId, { adapterId: adapter.adapterId, ...current, adapter });
  }

  unregister(adapterId: string): boolean {
    return this.entries.delete(adapterId);
  }

  has(adapterId: string): boolean {
    return this.entries.has(adapterId);
  }

  list() {
    return Object.freeze(
      [...this.entries.values()]
        .map((entry) =>
          Object.freeze({
            adapterId: entry.adapterId,
            displayName: entry.adapter?.displayName ?? entry.adapterId,
            capabilities: Object.freeze([...(entry.adapter?.capabilities ?? [])]),
            supportedDataSourceKinds: Object.freeze([...(entry.adapter?.supportedDataSourceKinds ?? [])]),
            supportsSchemaDiscovery: entry.adapter?.supportsSchemaDiscovery ?? false,
            connectorRegistered: Boolean(entry.connector),
            adapterRegistered: Boolean(entry.adapter),
          }),
        )
        .sort((left, right) => left.displayName.localeCompare(right.displayName)),
    );
  }

  resolve(source: ElectroCraftDataSourceDefinition): ElectroCraftDataConnector {
    const connector = this.entries.get(source.adapterId)?.connector;
    if (!connector) {
      throw new ConnectorRegistryError('CONNECTOR_NOT_REGISTERED', 'no connector registered for data source adapter', {
        sourceId: source.id,
        adapterId: source.adapterId,
      });
    }
    if (connector.adapterId !== source.adapterId) {
      throw new ConnectorRegistryError('ADAPTER_ID_MISMATCH', 'connector adapter does not match data source', {
        sourceId: source.id,
        expected: source.adapterId,
        actual: connector.adapterId,
      });
    }
    return connector;
  }

  resolveAdapter(source: ElectroCraftDataSourceDefinition): DataSourceAdapter {
    const adapter = this.entries.get(source.adapterId)?.adapter;
    if (!adapter) {
      throw new ConnectorRegistryError('ADAPTER_NOT_REGISTERED', 'no DataSourceAdapter registered for data source', {
        sourceId: source.id,
        adapterId: source.adapterId,
      });
    }
    return adapter;
  }

  validateCompatibility(source: ElectroCraftDataSourceDefinition): readonly ConnectorCompatibilityDiagnostic[] {
    const entry = this.entries.get(source.adapterId);
    if (!entry) {
      return Object.freeze([
        {
          code: 'UNKNOWN_ADAPTER' as const,
          adapterId: source.adapterId,
          sourceId: source.id,
          message: `Adapter ${source.adapterId} is not registered.`,
        },
      ]);
    }
    if (!entry.adapter) return Object.freeze([]);

    const diagnostics: ConnectorCompatibilityDiagnostic[] = [];
    if (!entry.adapter.supportedDataSourceKinds.includes(source.kind)) {
      diagnostics.push({
        code: 'UNSUPPORTED_DATA_SOURCE_KIND',
        adapterId: source.adapterId,
        sourceId: source.id,
        message: `Adapter ${source.adapterId} does not support ${source.kind} data sources.`,
      });
    }
    for (const capability of normalizeDataSourceCapabilities(source.capabilities)) {
      if (!entry.adapter.capabilities.includes(capability)) {
        diagnostics.push({
          code: 'UNSUPPORTED_CAPABILITY',
          adapterId: source.adapterId,
          sourceId: source.id,
          capability,
          message: `Adapter ${source.adapterId} does not support ${capability}.`,
        });
      }
    }
    return Object.freeze(diagnostics);
  }

  assertCompatibility(source: ElectroCraftDataSourceDefinition): void {
    const diagnostics = this.validateCompatibility(source);
    if (diagnostics.length > 0) {
      throw new ConnectorRegistryError('ADAPTER_INCOMPATIBLE', 'data source adapter is not compatible', {
        sourceId: source.id,
        adapterId: source.adapterId,
        diagnostics,
      });
    }
  }

  createAdapterContext(
    source: ElectroCraftDataSourceDefinition,
    environment: ElectroCraftDataSourceEnvironment,
  ): DataSourceAdapterContext {
    this.assertCompatibility(source);
    return Object.freeze({ source, environment, config: resolveDataSourceConfig(source, environment) });
  }

  async testConnection(
    source: ElectroCraftDataSourceDefinition,
    environment: ElectroCraftDataSourceEnvironment,
  ) {
    const adapter = this.resolveAdapter(source);
    return adapter.testConnection(this.createAdapterContext(source, environment));
  }

  async introspectSchema(
    source: ElectroCraftDataSourceDefinition,
    environment: ElectroCraftDataSourceEnvironment,
  ) {
    const adapter = this.resolveAdapter(source);
    if (!adapter.supportsSchemaDiscovery) return null;
    return adapter.getSchema(this.createAdapterContext(source, environment));
  }

  async execute(request: DataConnectorExecutionRequest): Promise<ElectroCraftQueryResult> {
    const connector = this.resolve(request.source);
    try {
      return await connector.execute(request);
    } catch (error) {
      if (error instanceof ConnectorRegistryError) throw error;
      throw new ConnectorRegistryError('CONNECTOR_EXECUTION_FAILED', 'data connector execution failed', {
        sourceId: request.source.id,
        adapterId: request.source.adapterId,
        cause: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
