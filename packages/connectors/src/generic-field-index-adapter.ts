import type {
  DataSourceAdapter,
  DataSourceAdapterContext,
  DataSourceMutationRequest,
  DataSourceQueryRequest,
  InternalDataIndexStatus,
  InternalDataQuery,
} from '@electrocraft/application';
import {
  dataModelIndexResourceId,
  parseDataModelIndexResourceId,
  type ElectroCraftCanonicalDataSourceCapability,
  type JsonValue,
} from '@electrocraft/domain';
import { createInternalDataSourceAdapter, type InternalDataSourceAdapterOptions } from './internal-data-source-adapter';

function indexStatusAsJson(status: InternalDataIndexStatus) {
  return status as unknown as JsonValue;
}

function asObject(value: JsonValue | undefined) {
  return value && !Array.isArray(value) && typeof value === 'object' ? (value as Record<string, JsonValue>) : null;
}

function parseIndexedQuery(value: JsonValue | undefined): InternalDataQuery | null {
  const input = asObject(value);
  if (!input || (input.search === undefined && input.facets === undefined)) return null;
  const filterValue = asObject(input.filter);
  const sortValue = asObject(input.sort);
  const searchValue = asObject(input.search);
  if (input.offset !== undefined && typeof input.offset !== 'number') throw new TypeError('offset debe ser numérico.');
  if (input.limit !== undefined && typeof input.limit !== 'number') throw new TypeError('limit debe ser numérico.');
  if (input.includeDeleted !== undefined && typeof input.includeDeleted !== 'boolean') {
    throw new TypeError('includeDeleted debe ser booleano.');
  }
  const filter = filterValue
    ? (() => {
        if (typeof filterValue.field !== 'string' || !filterValue.field.trim()) {
          throw new TypeError('filter.field es obligatorio.');
        }
        if (!Object.hasOwn(filterValue, 'value')) throw new TypeError('filter.value es obligatorio.');
        return Object.freeze({ field: filterValue.field, value: filterValue.value });
      })()
    : undefined;
  const sort = sortValue
    ? (() => {
        if (typeof sortValue.field !== 'string' || !sortValue.field.trim()) {
          throw new TypeError('sort.field es obligatorio.');
        }
        if (sortValue.direction !== 'asc' && sortValue.direction !== 'desc') {
          throw new TypeError('sort.direction debe ser asc o desc.');
        }
        return Object.freeze({ field: sortValue.field, direction: sortValue.direction });
      })()
    : undefined;
  const search = searchValue
    ? (() => {
        if (typeof searchValue.text !== 'string') throw new TypeError('search.text debe ser texto.');
        const fields = searchValue.fields;
        if (fields !== undefined && (!Array.isArray(fields) || fields.some((field) => typeof field !== 'string'))) {
          throw new TypeError('search.fields debe ser una lista de claves de campo.');
        }
        return Object.freeze({
          text: searchValue.text,
          ...(Array.isArray(fields) ? { fields: Object.freeze(fields as string[]) } : {}),
        });
      })()
    : undefined;
  const facets = input.facets;
  if (facets !== undefined && (!Array.isArray(facets) || facets.some((field) => typeof field !== 'string'))) {
    throw new TypeError('facets debe ser una lista de claves de campo.');
  }
  return Object.freeze({
    ...(typeof input.offset === 'number' ? { offset: input.offset } : {}),
    ...(typeof input.limit === 'number' ? { limit: input.limit } : {}),
    ...(filter ? { filter } : {}),
    ...(sort ? { sort } : {}),
    ...(search ? { search } : {}),
    ...(Array.isArray(facets) ? { facets: Object.freeze(facets as string[]) } : {}),
    ...(typeof input.includeDeleted === 'boolean' ? { includeDeleted: input.includeDeleted } : {}),
  });
}

export class GenericFieldIndexedInternalDataSourceAdapter implements DataSourceAdapter {
  private readonly base: DataSourceAdapter;

  constructor(private readonly options: InternalDataSourceAdapterOptions) {
    this.base = createInternalDataSourceAdapter(options);
  }

  get adapterId() {
    return this.base.adapterId;
  }

  get displayName() {
    return this.base.displayName;
  }

  get supportedDataSourceKinds() {
    return this.base.supportedDataSourceKinds;
  }

  get capabilities() {
    return Object.freeze([
      ...new Set([...this.base.capabilities, 'aggregate' as ElectroCraftCanonicalDataSourceCapability]),
    ]);
  }

  get supportsSchemaDiscovery() {
    return this.base.supportsSchemaDiscovery;
  }

  private async authorize(context: DataSourceAdapterContext, resourceId: string, operation: 'read' | 'update') {
    const allowed = await this.options.permissions.authorize({
      projectId: this.options.projectId,
      sourceId: context.source.id,
      resourceId,
      operation,
    });
    if (!allowed) throw new Error(`Operación ${operation} no permitida para ${resourceId}.`);
  }

  testConnection(context: DataSourceAdapterContext) {
    return this.base.testConnection(context);
  }

  async listResources(context: DataSourceAdapterContext) {
    const resources = await this.base.listResources(context);
    const dataSchema = await this.base.getSchema(context);
    if (!dataSchema) return resources;
    const indexResources = dataSchema.models.map((model) =>
      Object.freeze({
        id: dataModelIndexResourceId(model.id),
        label: `Índice · ${model.label}`,
        kind: 'model-index',
        operations: Object.freeze([
          Object.freeze({
            id: 'read-index-status',
            label: 'Estado del índice',
            capability: 'read' as const,
            parameters: Object.freeze([]),
            inputSchema: null,
          }),
          Object.freeze({
            id: 'reindex',
            label: 'Reconstruir índice',
            capability: 'update' as const,
            parameters: Object.freeze([]),
            inputSchema: null,
          }),
        ]),
        metadata: Object.freeze({ modelId: model.id, owner: 'GenericFieldIndexer' }),
      }),
    );
    return Object.freeze([...resources, ...indexResources]);
  }

  getSchema(context: DataSourceAdapterContext) {
    return this.base.getSchema(context);
  }

  async query(context: DataSourceAdapterContext, request: DataSourceQueryRequest): Promise<JsonValue> {
    const modelId = parseDataModelIndexResourceId(request.resourceId);
    if (modelId) {
      await this.authorize(context, request.resourceId, 'read');
      if (!this.options.repository.getModelIndexStatus) {
        throw new Error('El GenericFieldIndexer no está disponible para esta fuente.');
      }
      return indexStatusAsJson(
        await this.options.repository.getModelIndexStatus(this.options.projectId, context.source.id, modelId),
      );
    }
    const indexedQuery = parseIndexedQuery(request.input);
    if (!indexedQuery) return this.base.query(context, request);
    const dataSchema = await this.base.getSchema(context);
    if (!dataSchema?.models.some(({ id }) => id === request.resourceId)) return this.base.query(context, request);
    await this.authorize(context, request.resourceId, 'read');
    return (await this.options.repository.queryRecords(
      this.options.projectId,
      request.resourceId,
      indexedQuery,
    )) as unknown as JsonValue;
  }

  async mutate(context: DataSourceAdapterContext, request: DataSourceMutationRequest): Promise<JsonValue> {
    const modelId = parseDataModelIndexResourceId(request.resourceId);
    if (!modelId) return this.base.mutate(context, request);
    if (request.operation !== 'update') {
      throw new Error('El índice de modelo solo admite la operación de reconstrucción.');
    }
    await this.authorize(context, request.resourceId, 'update');
    if (!this.options.repository.reindexModel) {
      throw new Error('La reconstrucción del GenericFieldIndexer no está disponible.');
    }
    return indexStatusAsJson(
      await this.options.repository.reindexModel(this.options.projectId, context.source.id, modelId),
    );
  }
}

export function createGenericFieldIndexedInternalDataSourceAdapter(options: InternalDataSourceAdapterOptions) {
  return new GenericFieldIndexedInternalDataSourceAdapter(options);
}
