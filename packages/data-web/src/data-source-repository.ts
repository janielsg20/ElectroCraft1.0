import {
  dataSourceConnectorRegistry,
  type ConnectorRegistry,
  type DataSourceMutationRequest,
  type DataSourceQueryRequest,
} from '@electrocraft/application';
import type { ElectroCraftDataSourceDefinition, ElectroCraftDataSourceEnvironment } from '@electrocraft/domain';

export class WebDataSourceRepository {
  constructor(private readonly registry: ConnectorRegistry = dataSourceConnectorRegistry) {}

  testConnection(source: ElectroCraftDataSourceDefinition, environment: ElectroCraftDataSourceEnvironment) {
    return this.registry.testConnection(source, environment);
  }

  listResources(source: ElectroCraftDataSourceDefinition, environment: ElectroCraftDataSourceEnvironment) {
    return this.registry.listResources(source, environment);
  }

  getSchema(source: ElectroCraftDataSourceDefinition, environment: ElectroCraftDataSourceEnvironment) {
    return this.registry.introspectSchema(source, environment);
  }

  query(
    source: ElectroCraftDataSourceDefinition,
    environment: ElectroCraftDataSourceEnvironment,
    request: DataSourceQueryRequest,
  ) {
    return this.registry.query(source, environment, request);
  }

  mutate(
    source: ElectroCraftDataSourceDefinition,
    environment: ElectroCraftDataSourceEnvironment,
    request: DataSourceMutationRequest,
  ) {
    return this.registry.mutate(source, environment, request);
  }
}

export const webDataSourceRepository = new WebDataSourceRepository();
