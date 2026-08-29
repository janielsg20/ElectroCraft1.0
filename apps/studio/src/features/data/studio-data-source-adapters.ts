import { createRestDataSourceAdapter, REST_DATA_ADAPTER_ID } from '@electrocraft/connectors';
import { dataSourceWorkspaceRuntime } from './data-source-runtime';

export function ensureStudioDataSourceAdapters() {
  if (!dataSourceWorkspaceRuntime.registry.has(REST_DATA_ADAPTER_ID)) {
    dataSourceWorkspaceRuntime.registry.registerAdapter(createRestDataSourceAdapter());
  }
  return dataSourceWorkspaceRuntime.registry;
}

ensureStudioDataSourceAdapters();
