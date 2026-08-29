import type {
  ElectroCraftCanonicalDataSourceCapability,
  ElectroCraftDataSchema,
  ElectroCraftDataSourceDefinition,
  ElectroCraftDataSourceEnvironment,
  ElectroCraftDataSourceKind,
  JsonValue,
} from '@electrocraft/domain';
import type { StoredProjectObjectInput } from '../projects/project-storage';

export interface DataSourceAdapterContext {
  readonly source: ElectroCraftDataSourceDefinition;
  readonly environment: ElectroCraftDataSourceEnvironment;
  readonly config: Readonly<Record<string, JsonValue>>;
}

export interface DataSourceConnectionResult {
  readonly ok: boolean;
  readonly message: string;
}

export interface DataSourceAdapter {
  readonly adapterId: string;
  readonly displayName: string;
  readonly supportedDataSourceKinds: readonly ElectroCraftDataSourceKind[];
  readonly capabilities: readonly ElectroCraftCanonicalDataSourceCapability[];
  readonly supportsSchemaDiscovery: boolean;
  testConnection(context: DataSourceAdapterContext): Promise<DataSourceConnectionResult>;
  getSchema(context: DataSourceAdapterContext): Promise<ElectroCraftDataSchema | null>;
  read(context: DataSourceAdapterContext, request?: JsonValue): Promise<JsonValue>;
  create(context: DataSourceAdapterContext, input: JsonValue): Promise<JsonValue>;
  update(context: DataSourceAdapterContext, input: JsonValue): Promise<JsonValue>;
  remove(context: DataSourceAdapterContext, input: JsonValue): Promise<JsonValue>;
  subscribe?(
    context: DataSourceAdapterContext,
    request: JsonValue | undefined,
    listener: (value: JsonValue) => void,
  ): Promise<() => void> | (() => void);
}

export function createStoredDataSourceObject(source: ElectroCraftDataSourceDefinition): StoredProjectObjectInput {
  return Object.freeze({
    objectId: source.id,
    kind: 'data-source',
    schemaVersion: source.schemaVersion,
    payload: structuredClone(source) as unknown as JsonValue,
  });
}
