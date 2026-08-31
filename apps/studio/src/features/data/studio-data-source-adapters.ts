import {
  createGraphQLDataSourceAdapter,
  createRestDataSourceAdapter,
  GRAPHQL_DATA_ADAPTER_ID,
  REST_DATA_ADAPTER_ID,
} from '@electrocraft/connectors';
import { dataSourceWorkspaceRuntime } from './data-source-runtime';

export function ensureStudioDataSourceAdapters() {
  if (!dataSourceWorkspaceRuntime.registry.has(REST_DATA_ADAPTER_ID)) {
    dataSourceWorkspaceRuntime.registry.registerAdapter(createRestDataSourceAdapter());
  }
  if (!dataSourceWorkspaceRuntime.registry.has(GRAPHQL_DATA_ADAPTER_ID)) {
    dataSourceWorkspaceRuntime.registry.registerAdapter(createGraphQLDataSourceAdapter());
  }
  return dataSourceWorkspaceRuntime.registry;
}

ensureStudioDataSourceAdapters();
