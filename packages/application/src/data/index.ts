export * from './connector-gateway';
export * from './secret-store';
export * from './data-explorer';
export * from './field-registry';
export * from './relations';

import type {
  ElectroCraftCanonicalDataSourceCapability,
  ElectroCraftDataSchema,
  ElectroCraftDataSourceDefinition,
  ElectroCraftDataSourceEnvironment,
  ElectroCraftDataSourceKind,
  ElectroCraftDataExplorerOperation,
  ElectroTaxonomyTerm,
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
  readonly operations?: readonly ElectroCraftDataExplorerOperation[];
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

export interface InternalDataRecord {
  readonly id: string;
  readonly modelId: string;
  readonly data: Readonly<Record<string, JsonValue>>;
  readonly state: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
}

export interface InternalDataFilter {
  readonly field: string;
  readonly value: JsonValue;
}

export interface InternalDataSort {
  readonly field: string;
  readonly direction: 'asc' | 'desc';
}

export interface InternalDataSearch {
  readonly text: string;
  readonly fields?: readonly string[];
}

export interface InternalDataFacetBucket {
  readonly value: JsonValue;
  readonly count: number;
}

export interface InternalDataQuery {
  readonly offset?: number;
  readonly limit?: number;
  readonly filter?: InternalDataFilter;
  readonly sort?: InternalDataSort;
  readonly search?: InternalDataSearch;
  readonly facets?: readonly string[];
  readonly includeDeleted?: boolean;
}

export interface InternalDataQueryResult {
  readonly rows: readonly InternalDataRecord[];
  readonly total: number;
  readonly offset: number;
  readonly limit: number;
  readonly facets?: Readonly<Record<string, readonly InternalDataFacetBucket[]>>;
}

export interface InternalDataRecordInput {
  readonly id?: string;
  readonly data: Readonly<Record<string, JsonValue>>;
  readonly state?: string;
}

export interface InternalDataRecordUpdate {
  readonly id: string;
  readonly data: Readonly<Record<string, JsonValue>>;
  readonly state?: string;
}

export interface InternalDataSourceStats {
  readonly modelCount: number;
  readonly recordCount: number;
}

export interface InternalDataFieldUsage {
  readonly modelId: string;
  readonly fieldKey: string;
  readonly recordCount: number;
  readonly populatedCount: number;
}

export interface InternalDataIndexStatus {
  readonly modelId: string;
  readonly status: 'disabled' | 'empty' | 'ready' | 'stale';
  readonly indexableFieldCount: number;
  readonly activeRecordCount: number;
  readonly indexedRecordCount: number;
  readonly indexRowCount: number;
}

export interface InternalTaxonomyTermInput {
  readonly id?: string;
  readonly slug: string;
  readonly name: string;
  readonly parentId?: string | null;
  readonly metadata?: ElectroTaxonomyTerm['metadata'];
}

export interface InternalTaxonomyTermUpdate extends InternalTaxonomyTermInput {
  readonly id: string;
}

export interface InternalDataRepository {
  testConnection(projectId: string): Promise<DataSourceConnectionResult>;
  listResources(projectId: string, sourceId: string): Promise<readonly DataSourceResourceDescriptor[]>;
  getSchema(projectId: string, sourceId: string): Promise<ElectroCraftDataSchema | null>;
  queryRecords(projectId: string, modelId: string, query?: InternalDataQuery): Promise<InternalDataQueryResult>;
  createRecord(projectId: string, modelId: string, input: InternalDataRecordInput): Promise<InternalDataRecord>;
  updateRecord(projectId: string, modelId: string, input: InternalDataRecordUpdate): Promise<InternalDataRecord>;
  deleteRecord(projectId: string, modelId: string, recordId: string): Promise<boolean>;
  getStats(projectId: string, sourceId: string): Promise<InternalDataSourceStats>;
  getFieldUsage(projectId: string, modelId: string, fieldKey: string): Promise<InternalDataFieldUsage>;
  getModelIndexStatus?(projectId: string, sourceId: string, modelId: string): Promise<InternalDataIndexStatus>;
  reindexModel?(projectId: string, sourceId: string, modelId: string): Promise<InternalDataIndexStatus>;
  listTaxonomyTerms(projectId: string, sourceId: string, taxonomyId: string): Promise<readonly ElectroTaxonomyTerm[]>;
  createTaxonomyTerm(
    projectId: string,
    sourceId: string,
    taxonomyId: string,
    input: InternalTaxonomyTermInput,
  ): Promise<ElectroTaxonomyTerm>;
  updateTaxonomyTerm(
    projectId: string,
    sourceId: string,
    taxonomyId: string,
    input: InternalTaxonomyTermUpdate,
  ): Promise<ElectroTaxonomyTerm>;
  deleteTaxonomyTerm(projectId: string, sourceId: string, taxonomyId: string, termId: string): Promise<boolean>;
}

export type InternalDataPermissionOperation = 'read' | 'create' | 'update' | 'delete';

export interface InternalDataPermissionRequest {
  readonly projectId: string;
  readonly sourceId: string;
  readonly resourceId: string;
  readonly operation: InternalDataPermissionOperation;
}

export interface InternalDataPermissionPort {
  authorize(request: InternalDataPermissionRequest): boolean | Promise<boolean>;
}

export function createStoredDataSourceObject(source: ElectroCraftDataSourceDefinition): StoredProjectObjectInput {
  return Object.freeze({
    objectId: source.id,
    kind: 'data-source',
    schemaVersion: source.schemaVersion,
    payload: structuredClone(source) as unknown as JsonValue,
  });
}

export function createStoredDataSchemaObject(dataSchema: ElectroCraftDataSchema): StoredProjectObjectInput {
  return Object.freeze({
    objectId: dataSchema.id,
    kind: 'data-schema',
    schemaVersion: dataSchema.schemaVersion,
    payload: structuredClone(dataSchema) as unknown as JsonValue,
  });
}
