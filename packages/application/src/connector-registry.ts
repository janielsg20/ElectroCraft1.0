import type {
  ElectroCraftDataSourceDefinition,
  ElectroCraftObjectId,
  ElectroCraftQueryDefinition,
  ElectroCraftQueryResult,
  JsonValue,
} from '@electrocraft/domain';

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
  'CONNECTOR_NOT_REGISTERED' | 'ADAPTER_ID_MISMATCH' | 'CONNECTOR_EXECUTION_FAILED';

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

export class ConnectorRegistry {
  private readonly connectors = new Map<string, ElectroCraftDataConnector>();

  register(connector: ElectroCraftDataConnector): void {
    if (connector.adapterId.trim() !== connector.adapterId || connector.adapterId.length < 2) {
      throw new ConnectorRegistryError('ADAPTER_ID_MISMATCH', 'connector adapterId is invalid', {
        adapterId: connector.adapterId,
      });
    }
    this.connectors.set(connector.adapterId, connector);
  }

  unregister(adapterId: string): boolean {
    return this.connectors.delete(adapterId);
  }

  has(adapterId: string): boolean {
    return this.connectors.has(adapterId);
  }

  resolve(source: ElectroCraftDataSourceDefinition): ElectroCraftDataConnector {
    const connector = this.connectors.get(source.adapterId);
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
