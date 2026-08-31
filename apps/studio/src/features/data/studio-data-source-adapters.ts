import {
  createGraphQLDataSourceAdapter,
  createGraphQLGatewayBridge,
  createRestDataSourceAdapter,
  createRestGatewayBridge,
  GRAPHQL_DATA_ADAPTER_ID,
  REST_DATA_ADAPTER_ID,
} from '@electrocraft/connectors';
import { createBrowserConnectorGateway, createBrowserSecretStoreAdmin } from '@electrocraft/data-web';
import { dataSourceWorkspaceRuntime } from './data-source-runtime';

const gatewayBaseUrl = import.meta.env.VITE_ELECTROCRAFT_CONNECTOR_GATEWAY_URL?.trim() ?? '';
const browserGateway = gatewayBaseUrl ? createBrowserConnectorGateway({ baseUrl: gatewayBaseUrl }) : null;
const browserSecretStoreAdmin = gatewayBaseUrl ? createBrowserSecretStoreAdmin({ baseUrl: gatewayBaseUrl }) : null;

export function ensureStudioDataSourceAdapters() {
  if (!dataSourceWorkspaceRuntime.registry.has(REST_DATA_ADAPTER_ID)) {
    dataSourceWorkspaceRuntime.registry.registerAdapter(
      createRestDataSourceAdapter({ gateway: browserGateway ? createRestGatewayBridge(browserGateway) : undefined }),
    );
  }
  if (!dataSourceWorkspaceRuntime.registry.has(GRAPHQL_DATA_ADAPTER_ID)) {
    dataSourceWorkspaceRuntime.registry.registerAdapter(
      createGraphQLDataSourceAdapter({ gateway: browserGateway ? createGraphQLGatewayBridge(browserGateway) : undefined }),
    );
  }
  return dataSourceWorkspaceRuntime.registry;
}

export function studioConnectorGateway() {
  return browserGateway;
}

export function studioSecretStoreAdmin() {
  return browserSecretStoreAdmin;
}

ensureStudioDataSourceAdapters();
