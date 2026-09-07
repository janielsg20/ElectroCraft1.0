import type {
  DataSourceAdapter,
  DataSourceAdapterContext,
  DataSourceMutationRequest,
  DataSourceQueryRequest,
  InternalDataIndexStatus,
} from '@electrocraft/application';
import {
  dataModelIndexResourceId,
  parseDataModelIndexResourceId,
  type JsonValue,
} from '@electrocraft/domain';
import {
  createInternalDataSourceAdapter,
  type InternalDataSourceAdapterOptions,
} from './internal-data-source-adapter';

function indexStatusAsJson(status: InternalDataIndexStatus) {
  return status as unknown as JsonValue;
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
    return this.base.capabilities;
  }

  get supportsSchemaDiscovery() {
    return this.base.supportsSchemaDiscovery;
  }

  private async authorize(
    context: DataSourceAdapterContext,
    resourceId: string,
    operation: 'read' | 'update',
  ) {
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
    if (!modelId) return this.base.query(context, request);
    await this.authorize(context, request.resourceId, 'read');
    if (!this.options.repository.getModelIndexStatus) {
      throw new Error('El GenericFieldIndexer no está disponible para esta fuente.');
    }
    return indexStatusAsJson(
      await this.options.repository.getModelIndexStatus(
        this.options.projectId,
        context.source.id,
        modelId,
      ),
    );
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
