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
} from '@electrocraft/application';
import type { JsonValue } from '@electrocraft/domain';

export const INTERNAL_DATA_ADAPTER_ID = 'electrocraft.internal' as const;

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
  return Object.freeze({
    offset: optionalNumber(input.offset, 'offset'),
    limit: optionalNumber(input.limit, 'limit'),
    ...(filter ? { filter } : {}),
    ...(sort ? { sort } : {}),
  });
}

function parseCreateInput(value: JsonValue | undefined): InternalDataRecordInput {
  const input = asObject(value, 'mutation.input');
  const data = asObject(input.data, 'mutation.input.data');
  if (input.id !== undefined && typeof input.id !== 'string') throw new TypeError('mutation.input.id debe ser texto.');
  if (input.state !== undefined && typeof input.state !== 'string') {
    throw new TypeError('mutation.input.state debe ser texto.');
  }
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
  ] as const;
  readonly supportsSchemaDiscovery = true;

  constructor(private readonly options: InternalDataSourceAdapterOptions) {
    if (!options.projectId.trim()) throw new TypeError('projectId must not be empty');
  }

  private async authorize(context: DataSourceAdapterContext, resourceId: string, operation: InternalDataPermissionOperation) {
    const allowed = await this.options.permissions.authorize({
      projectId: this.options.projectId,
      sourceId: context.source.id,
      resourceId,
      operation,
    });
    if (!allowed) throw new InternalDataPermissionError(operation, resourceId);
  }

  testConnection() {
    return this.options.repository.testConnection(this.options.projectId);
  }

  async listResources(context: DataSourceAdapterContext) {
    await this.authorize(context, context.source.id, 'read');
    return this.options.repository.listResources(this.options.projectId, context.source.id);
  }

  async getSchema(context: DataSourceAdapterContext) {
    await this.authorize(context, context.source.id, 'read');
    return this.options.repository.getSchema(this.options.projectId, context.source.id);
  }

  async query(context: DataSourceAdapterContext, request: DataSourceQueryRequest): Promise<JsonValue> {
    await this.authorize(context, request.resourceId, 'read');
    return (await this.options.repository.queryRecords(
      this.options.projectId,
      request.resourceId,
      parseQuery(request.input),
    )) as unknown as JsonValue;
  }

  async mutate(context: DataSourceAdapterContext, request: DataSourceMutationRequest): Promise<JsonValue> {
    await this.authorize(context, request.resourceId, request.operation);
    if (request.operation === 'create') {
      return (await this.options.repository.createRecord(
        this.options.projectId,
        request.resourceId,
        parseCreateInput(request.input),
      )) as unknown as JsonValue;
    }
    if (request.operation === 'update') {
      return (await this.options.repository.updateRecord(
        this.options.projectId,
        request.resourceId,
        parseUpdateInput(request.input),
      )) as unknown as JsonValue;
    }
    return Object.freeze({
      deleted: await this.options.repository.deleteRecord(
        this.options.projectId,
        request.resourceId,
        parseDeleteId(request.input),
      ),
    }) as unknown as JsonValue;
  }
}

export function createInternalDataSourceAdapter(options: InternalDataSourceAdapterOptions) {
  return new InternalDataSourceAdapter(options);
}
