import {
  ConnectorRegistry,
  dataSourceConnectorRegistry,
  type DataSourceAdapter,
  type ElectroCraftDataConnector,
} from '@electrocraft/application';

export * from './advanced-field-runtime';
export * from './connector-extension-registry';
export * from './connector-gateway-bridge';
export * from './connector-gateway-http-handler';
export * from './graphql-data-source-adapter';
export * from './internal-data-source-adapter';
export * from './openapi-import-adapter';
export * from './rest-data-source-adapter';
export * from './record-validation';
export * from './server-connector-gateway';
export * from './server-secret-store';
export { dataSourceConnectorRegistry };

export function registerDataSourceAdapter(adapter: DataSourceAdapter) {
  dataSourceConnectorRegistry.registerAdapter(adapter);
  return adapter;
}

export function registerDataConnector(connector: ElectroCraftDataConnector) {
  dataSourceConnectorRegistry.register(connector);
  return connector;
}

export function createDataSourceConnectorRegistry(options?: {
  readonly adapters?: readonly DataSourceAdapter[];
  readonly connectors?: readonly ElectroCraftDataConnector[];
}) {
  const registry = new ConnectorRegistry();
  for (const adapter of options?.adapters ?? []) registry.registerAdapter(adapter);
  for (const connector of options?.connectors ?? []) registry.register(connector);
  return registry;
}

export const packageDescriptor = Object.freeze({
  name: '@electrocraft/connectors',
  responsibility: 'adapters backend-agnostic registrados sobre el ConnectorRegistry de aplicación',
  dependencies: ['@electrocraft/application', '@electrocraft/domain'] as const,
});
