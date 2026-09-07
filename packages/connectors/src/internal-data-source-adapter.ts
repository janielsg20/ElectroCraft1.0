import type {
  DataSourceAdapter,
  DataSourceAdapterContext,
  DataSourceMutationRequest,
  DataSourceQueryRequest,
  InternalDataPermissionOperation,
  InternalDataPermissionPort,
  InternalDataQuery,
  InternalDataRecordInput,
  InternalDataRecordUpdate,
  InternalDataRepository,
  InternalRelationEdgeInput,
  InternalRelationEdgeQuery,
  InternalRelationEdgeUpdate,
  InternalRelationRepository,
  InternalTaxonomyTermInput,
  InternalTaxonomyTermUpdate,
} from '@electrocraft/application';
import { parseRelationResourceId, parseTaxonomyResourceId, type JsonValue } from '@electrocraft/domain';
import { compileElectroCraftRecordValidator } from './record-validation';

export const INTERNAL_DATA_ADAPTER_ID = 'internal.pglite' as const;

export class InternalDataPermissionError extends Error {
  constructor(
    readonly operation: InternalDataPermissionOperation,
    readonly resourceId: string,
  ) {
    super(`Operación ${operation} no permitida para ${resourceId}.`);
    this.name = 'InternalDataPermissionError';
  }
}

export interface InternalDataSourceAdapterOptions {
  readonly projectId: string;
  readonly repository: InternalDataRepository;
  readonly relations?: InternalRelationRepository;
  readonly permissions: InternalDataPermissionPort;
}

function asObject(value: JsonValue | undefined, field: string): Record<string, JsonValue> {
  if (!value || Array.isArray(value) || typeof value !== 'object') {
    throw new TypeError(`${field} debe ser un objeto JSON.`);
  }
  return value as Record<string, JsonValue>;
}

function optionalNumber(value: JsonValue | undefined, field: string) {
  if (value === undefined) return undefined;
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new TypeError(`${field} debe ser numérico.`);
  return value;
}

function parseQuery(value: JsonValue | undefined): InternalDataQuery {
  if (value === undefined) return Object.freeze({});
  const input = asObject(value, 'query.input');
  const filterValue = input.filter;
  const sortValue = input.sort;
  const filter =
    filterValue && !Array.isArray(filterValue) && typeof filterValue === 'object'
      ? (() => {
          const candidate = filterValue as Record<string, JsonValue>;
          if (typeof candidate.field !== 'string' || candidate.field.trim() === '') {
            throw new TypeError('filter.field es obligatorio.');
          }
          if (!Object.hasOwn(candidate, 'value')) throw new TypeError('filter.value es obligatorio.');
          return Object.freeze({ field: candidate.field, value: candidate.value });
        })()
      : undefined;
  const sort =
    sortValue && !Array.isArray(sortValue) && typeof sortValue === 'object'
      ? (() => {
          const candidate = sortValue as Record<string, JsonValue>;
          if (typeof candidate.field !== 'string' || candidate.field.trim() === '') {
            throw new TypeError('sort.field es obligatorio.');
          }
          if (candidate.direction !== 'asc' && candidate.direction !== 'desc') {
            throw new TypeError('sort.direction debe ser asc o desc.');
          }
          return Object.freeze({ field: candidate.field, direction: candidate.direction });
        })()
      : undefined;
  if (input.includeDeleted !== undefined && typeof input.includeDeleted !== 'boolean') {
    throw new TypeError('includeDeleted debe ser booleano.');
  }
  return Object.freeze({
    offset: optionalNumber(input.offset, 'offset'),
    limit: optionalNumber(input.limit, 'limit'),
    ...(filter ? { filter } : {}),
    ...(sort ? { sort } : {}),
    ...(typeof input.includeDeleted === 'boolean' ? { includeDeleted: input.includeDeleted } : {}),
  });
}

function parseRelationQuery(value: JsonValue | undefined): InternalRelationEdgeQuery {
  if (value === undefined) return Object.freeze({});
  const input = asObject(value, 'query.input');
  if (input.fromRecordId !== undefined && typeof input.fromRecordId !== 'string') {
    throw new TypeError('query.input.fromRecordId debe ser texto.');
  }
  if (input.toRecordId !== undefined && typeof input.toRecordId !== 'string') {
    throw new TypeError('query.input.toRecordId debe ser texto.');
  }
  return Object.freeze({
    ...(typeof input.fromRecordId === 'string' ? { fromRecordId: input.fromRecordId } : {}),
    ...(typeof input.toRecordId === 'string' ? { toRecordId: input.toRecordId } : {}),
  });
}

function parseCreateInput(value: JsonValue | undefined): InternalDataRecordInput {
  const input = asObject(value, 'mutation.input');
  const data = asObject(input.data, 'mutation.input.data');
  if (input.id !== undefined && typeof input.id !== 'string') throw new TypeError('mutation.input.id debe ser texto.');
  if (input.state !== undefined && typeof input.state !== 'string') {
    throw new TypeError('mutation.input.state debe ser texto.');
  }
  if (input.state === 'deleted') throw new TypeError('El estado deleted está reservado para la política de borrado.');
  return Object.freeze({
    ...(typeof input.id === 'string' ? { id: input.id } : {}),
    data: Object.freeze({ ...data }),
    ...(typeof input.state === 'string' ? { state: input.state } : {}),
  });
}

function parseUpdateInput(value: JsonValue | undefined): InternalDataRecordUpdate {
  const input = asObject(value, 'mutation.input');
  if (typeof input.id !== 'string' || input.id.trim() === '') throw new TypeError('mutation.input.id es obligatorio.');
  const data = asObject(input.data, 'mutation.input.data');
  if (input.state !== undefined && typeof input.state !== 'string') {
    throw new TypeError('mutation.input.state debe ser texto.');
  }
  if (input.state === 'deleted') throw new TypeError('El estado deleted está reservado para la política de borrado.');
  return Object.freeze({
    id: input.id,
    data: Object.freeze({ ...data }),
    ...(typeof input.state === 'string' ? { state: input.state } : {}),
  });
}

function parseDeleteId(value: JsonValue | undefined) {
  const input = asObject(value, 'mutation.input');
  if (typeof input.id !== 'string' || input.id.trim() === '') throw new TypeError('mutation.input.id es obligatorio.');
  return input.id;
}

function parseRelationEdgeInput(value: JsonValue | undefined, requireId = false) {
  const input = asObject(value, 'mutation.input');
  if (requireId && (typeof input.id !== 'string' || input.id.trim() === '')) {
    throw new TypeError('mutation.input.id es obligatorio.');
  }
  if (input.id !== undefined && typeof input.id !== 'string') throw new TypeError('mutation.input.id debe ser texto.');
  if (typeof input.fromRecordId !== 'string' || input.fromRecordId.trim() === '') {
    throw new TypeError('mutation.input.fromRecordId es obligatorio.');
  }
  if (typeof input.toRecordId !== 'string' || input.toRecordId.trim() === '') {
    throw new TypeError('mutation.input.toRecordId es obligatorio.');
  }
  return Object.freeze({
    ...(typeof input.id === 'string' ? { id: input.id } : {}),
    fromRecordId: input.fromRecordId,
    toRecordId: input.toRecordId,
    ...(input.payload !== undefined ? { payload: input.payload } : {}),
  });
}

function parseTaxonomyTermInput(value: JsonValue | undefined, requireId = false) {
  const input = asObject(value, 'mutation.input');
  if (requireId && (typeof input.id !== 'string' || input.id.trim() === '')) {
    throw new TypeError('mutation.input.id es obligatorio.');
  }
  if (input.id !== undefined && typeof input.id !== 'string') throw new TypeError('mutation.input.id debe ser texto.');
  if (typeof input.slug !== 'string' || input.slug.trim() === '') {
    throw new TypeError('mutation.input.slug es obligatorio.');
  }
  if (typeof input.name !== 'string' || input.name.trim() === '') {
    throw new TypeError('mutation.input.name es obligatorio.');
  }
  if (input.parentId !== undefined && input.parentId !== null && typeof input.parentId !== 'string') {
    throw new TypeError('mutation.input.parentId debe ser texto o null.');
  }
  const metadata = input.metadata === undefined ? undefined : asObject(input.metadata, 'mutation.input.metadata');
  return Object.freeze({
    ...(typeof input.id === 'string' ? { id: input.id } : {}),
    slug: input.slug,
    name: input.name,
    parentId: typeof input.parentId === 'string' ? input.parentId : null,
    ...(metadata ? { metadata } : {}),
  });
}

export class InternalDataSourceAdapter implements DataSourceAdapter {
  readonly adapterId = INTERNAL_DATA_ADAPTER_ID;
  readonly displayName = 'ElectroCraft Data';
  readonly supportedDataSourceKinds = ['internal'] as const;
  readonly capabilities = [
    'read',
    'create',
    'update',
    'delete',
    'pagination',
    'filtering',
    'sort',
    'transactions',
    'taxonomies',
    'relations',
  ] as const;
  readonly supportsSchemaDiscovery = true;

  constructor(private readonly options: InternalDataSourceAdapterOptions) {
    if (!options.projectId.trim()) throw new TypeError('projectId must not be empty');
  }

  private async authorize(
    context: DataSourceAdapterContext,
    resourceId: string,
    operation: InternalDataPermissionOperation,
  ) {
    const allowed = await this.options.permissions.authorize({
      projectId: this.options.projectId,
      sourceId: context.source.id,
      resourceId,
      operation,
    });
    if (!allowed) throw new InternalDataPermissionError(operation, resourceId);
  }

  private async normalizeMutationData(
    context: DataSourceAdapterContext,
    resourceId: string,
    data: Readonly<Record<string, JsonValue>>,
  ) {
    const schema = await this.options.repository.getSchema(this.options.projectId, context.source.id);
    if (!schema) throw new Error('No hay un schema de datos interno para esta fuente.');
    return compileElectroCraftRecordValidator(schema, resourceId).validate(data);
  }

  private requireRelations() {
    if (!this.options.relations) throw new Error('La capacidad de relaciones no está registrada para esta fuente.');
    return this.options.relations;
  }

  testConnection() {
    return this.options.repository.testConnection(this.options.projectId);
  }

  async listResources(context: DataSourceAdapterContext) {
    await this.authorize(context, context.source.id, 'read');
    const resources = await this.options.repository.listResources(this.options.projectId, context.source.id);
    const schema = await this.options.repository.getSchema(this.options.projectId, context.source.id);
    const relations = (schema?.relations ?? []).map((relation) =>
      Object.freeze({
        id: `relation:${relation.id}`,
        label: relation.label,
        kind: 'relation',
        operations: Object.freeze([
          Object.freeze({
            id: 'read',
            label: 'Listar vínculos',
            capability: 'read' as const,
            parameters: [],
            inputSchema: null,
          }),
          Object.freeze({
            id: 'create',
            label: 'Crear vínculo',
            capability: 'create' as const,
            parameters: [],
            inputSchema: null,
          }),
          Object.freeze({
            id: 'update',
            label: 'Actualizar vínculo',
            capability: 'update' as const,
            parameters: [],
            inputSchema: null,
          }),
          Object.freeze({
            id: 'delete',
            label: 'Eliminar vínculo',
            capability: 'delete' as const,
            parameters: [],
            inputSchema: null,
          }),
        ]),
        metadata: Object.freeze({
          relationId: relation.id,
          sourceModelRef: relation.sourceModelRef,
          targetModelRef: relation.targetModelRef,
          cardinality: relation.cardinality,
        }),
      }),
    );
    return Object.freeze([...resources, ...relations]);
  }

  async getSchema(context: DataSourceAdapterContext) {
    await this.authorize(context, context.source.id, 'read');
    return this.options.repository.getSchema(this.options.projectId, context.source.id);
  }

  async query(context: DataSourceAdapterContext, request: DataSourceQueryRequest): Promise<JsonValue> {
    await this.authorize(context, request.resourceId, 'read');
    const relationId = parseRelationResourceId(request.resourceId);
    if (relationId) {
      return (await this.requireRelations().listRelationEdges(
        this.options.projectId,
        context.source.id,
        relationId,
        parseRelationQuery(request.input),
      )) as unknown as JsonValue;
    }
    const taxonomyId = parseTaxonomyResourceId(request.resourceId);
    if (taxonomyId) {
      return (await this.options.repository.listTaxonomyTerms(
        this.options.projectId,
        context.source.id,
        taxonomyId,
      )) as unknown as JsonValue;
    }
    return (await this.options.repository.queryRecords(
      this.options.projectId,
      request.resourceId,
      parseQuery(request.input),
    )) as unknown as JsonValue;
  }

  async mutate(context: DataSourceAdapterContext, request: DataSourceMutationRequest): Promise<JsonValue> {
    await this.authorize(context, request.resourceId, request.operation);
    const relationId = parseRelationResourceId(request.resourceId);
    if (relationId) {
      const relations = this.requireRelations();
      if (request.operation === 'create') {
        return (await relations.createRelationEdge(
          this.options.projectId,
          context.source.id,
          relationId,
          parseRelationEdgeInput(request.input) as InternalRelationEdgeInput,
        )) as unknown as JsonValue;
      }
      if (request.operation === 'update') {
        return (await relations.updateRelationEdge(
          this.options.projectId,
          context.source.id,
          relationId,
          parseRelationEdgeInput(request.input, true) as InternalRelationEdgeUpdate,
        )) as unknown as JsonValue;
      }
      return Object.freeze({
        deleted: await relations.deleteRelationEdge(
          this.options.projectId,
          context.source.id,
          relationId,
          parseDeleteId(request.input),
        ),
      }) as unknown as JsonValue;
    }
    const taxonomyId = parseTaxonomyResourceId(request.resourceId);
    if (taxonomyId) {
      if (request.operation === 'create') {
        return (await this.options.repository.createTaxonomyTerm(
          this.options.projectId,
          context.source.id,
          taxonomyId,
          parseTaxonomyTermInput(request.input) as InternalTaxonomyTermInput,
        )) as unknown as JsonValue;
      }
      if (request.operation === 'update') {
        return (await this.options.repository.updateTaxonomyTerm(
          this.options.projectId,
          context.source.id,
          taxonomyId,
          parseTaxonomyTermInput(request.input, true) as InternalTaxonomyTermUpdate,
        )) as unknown as JsonValue;
      }
      return Object.freeze({
        deleted: await this.options.repository.deleteTaxonomyTerm(
          this.options.projectId,
          context.source.id,
          taxonomyId,
          parseDeleteId(request.input),
        ),
      }) as unknown as JsonValue;
    }
    if (request.operation === 'create') {
      const input = parseCreateInput(request.input);
      const data = await this.normalizeMutationData(context, request.resourceId, input.data);
      return (await this.options.repository.createRecord(this.options.projectId, request.resourceId, {
        ...input,
        data,
      })) as unknown as JsonValue;
    }
    if (request.operation === 'update') {
      const input = parseUpdateInput(request.input);
      const data = await this.normalizeMutationData(context, request.resourceId, input.data);
      return (await this.options.repository.updateRecord(this.options.projectId, request.resourceId, {
        ...input,
        data,
      })) as unknown as JsonValue;
    }
    const recordId = parseDeleteId(request.input);
    const deleted = this.options.relations
      ? await this.options.relations.prepareRecordDelete(
          this.options.projectId,
          context.source.id,
          request.resourceId,
          recordId,
        )
      : await this.options.repository.deleteRecord(this.options.projectId, request.resourceId, recordId);
    return Object.freeze({ deleted }) as unknown as JsonValue;
  }
}

export function createInternalDataSourceAdapter(options: InternalDataSourceAdapterOptions) {
  return new InternalDataSourceAdapter(options);
}
