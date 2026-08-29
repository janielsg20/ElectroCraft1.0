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

export interface DataSourceResourceDescriptor {
  readonly id: string;
  readonly label: string;
  readonly kind: string;
  readonly metadata?: Readonly<Record<string, JsonValue>>;
}

export type DataSourceQueryCapability = Extract<
  ElectroCraftCanonicalDataSourceCapability,
  'read' | 'pagination' | 'filtering' | 'sort' | 'aggregate'
>;

export interface DataSourceQueryRequest {
  readonly resourceId: string;
  readonly requiredCapabilities?: readonly DataSourceQueryCapability[];
  readonly input?: JsonValue;
}

export interface DataSourceMutationRequest {
  readonly resourceId: string;
  readonly operation: Extract<ElectroCraftCanonicalDataSourceCapability, 'create' | 'update' | 'delete'>;
  readonly input?: JsonValue;
}

export interface DataSourceAdapter {
  readonly adapterId: string;
  readonly displayName: string;
  readonly supportedDataSourceKinds: readonly ElectroCraftDataSourceKind[];
  readonly capabilities: readonly ElectroCraftCanonicalDataSourceCapability[];
  readonly supportsSchemaDiscovery: boolean;
  testConnection(context: DataSourceAdapterContext): Promise<DataSourceConnectionResult>;
  listResources(context: DataSourceAdapterContext): Promise<readonly DataSourceResourceDescriptor[]>;
  getSchema(context: DataSourceAdapterContext): Promise<ElectroCraftDataSchema | null>;
  query(context: DataSourceAdapterContext, request: DataSourceQueryRequest): Promise<JsonValue>;
  mutate(context: DataSourceAdapterContext, request: DataSourceMutationRequest): Promise<JsonValue>;
}

export function createStoredDataSourceObject(source: ElectroCraftDataSourceDefinition): StoredProjectObjectInput {
  return Object.freeze({
    objectId: source.id,
    kind: 'data-source',
    schemaVersion: source.schemaVersion,
    payload: structuredClone(source) as unknown as JsonValue,
  });
}
