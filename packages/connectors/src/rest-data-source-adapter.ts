import type {
  DataSourceAdapter,
  DataSourceAdapterContext,
  DataSourceConnectionResult,
  DataSourceMutationRequest,
  DataSourceQueryRequest,
  DataSourceResourceDescriptor,
} from '@electrocraft/application';
import {
  electroCraftRestDataSourceConfigSchema,
  isSensitiveRestHeaderName,
  type ElectroCraftDataOperationDefinition,
  type ElectroCraftRestDataResult,
  type ElectroCraftRestDataSourceConfig,
  type ElectroCraftRestMethod,
  type JsonValue,
} from '@electrocraft/domain';

export const REST_DATA_ADAPTER_ID = 'rest.fetch' as const;

type JsonObject = Record<string, JsonValue>;

export type RestAdapterErrorCode =
  | 'REST_CONFIG_INVALID'
  | 'REST_OPERATION_MISSING'
  | 'REST_OPERATION_KIND_MISMATCH'
  | 'REST_INPUT_INVALID'
  | 'AUTH_REF_MISSING'
  | 'GATEWAY_REQUIRED'
  | 'GATEWAY_UNAVAILABLE';

export class RestDataSourceError extends Error {
  constructor(
    readonly code: RestAdapterErrorCode,
    message: string,
    readonly details: Readonly<Record<string, unknown>> = {},
  ) {
    super(message);
    this.name = 'RestDataSourceError';
  }
}

export interface RestGatewayExecutionRequest {
  readonly sourceId: string;
  readonly authRef: string | null;
  readonly environment: DataSourceAdapterContext['environment'];
  readonly operation: ElectroCraftDataOperationDefinition;
  readonly url: string;
  readonly method: ElectroCraftRestMethod;
  readonly headers: Readonly<Record<string, string>>;
  readonly body: JsonValue | null;
  readonly timeoutMs: number;
}

export interface RestGatewayPort {
  execute(request: RestGatewayExecutionRequest): Promise<ElectroCraftRestDataResult>;
  testConnection?(context: DataSourceAdapterContext, config: ElectroCraftRestDataSourceConfig): Promise<DataSourceConnectionResult>;
}

export interface RestDataSourceAdapterOptions {
  readonly fetch?: typeof globalThis.fetch;
  readonly gateway?: RestGatewayPort;
}

function jsonObject(value: JsonValue | undefined, field: string): JsonObject {
  if (value === undefined) return {};
  if (!value || Array.isArray(value) || typeof value !== 'object') {
    throw new RestDataSourceError('REST_INPUT_INVALID', `${field} debe ser un objeto.`);
  }
  return value as JsonObject;
}

function scalar(value: JsonValue | undefined, field: string) {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  throw new RestDataSourceError('REST_INPUT_INVALID', `${field} debe ser string, number o boolean.`);
}

function parseInput(input: JsonValue | undefined) {
  const root = jsonObject(input, 'input');
  return Object.freeze({
    path: jsonObject(root.path as JsonValue | undefined, 'input.path'),
    query: jsonObject(root.query as JsonValue | undefined, 'input.query'),
    headers: jsonObject(root.headers as JsonValue | undefined, 'input.headers'),
    body: Object.hasOwn(root, 'body') ? (root.body ?? null) : null,
  });
}

function configFor(context: DataSourceAdapterContext) {
  const parsed = electroCraftRestDataSourceConfigSchema.safeParse(context.config);
  if (!parsed.success) {
    throw new RestDataSourceError('REST_CONFIG_INVALID', 'Configuración REST inválida.', {
      issues: parsed.error.issues.map(({ path, message }) => ({ path, message })),
    });
  }
  return parsed.data;
}

function operationFor(config: ElectroCraftRestDataSourceConfig, resourceId: string) {
  const operation = config.operations.find(({ id }) => id === resourceId);
  if (!operation) {
    throw new RestDataSourceError('REST_OPERATION_MISSING', `Operación REST no encontrada: ${resourceId}.`, { resourceId });
  }
  return operation;
}

function applyParameters(
  config: ElectroCraftRestDataSourceConfig,
  operation: ElectroCraftDataOperationDefinition,
  inputValue: JsonValue | undefined,
) {
  const input = parseInput(inputValue);
  let path = operation.path;
  const query = new URLSearchParams();
  const headers: Record<string, string> = { ...config.defaultHeaders };

  for (const parameter of operation.parameters) {
    const source = parameter.location === 'path' ? input.path : parameter.location === 'query' ? input.query : input.headers;
    const raw = source[parameter.name];
    if ((raw === undefined || raw === null || raw === '') && parameter.required) {
      throw new RestDataSourceError('REST_INPUT_INVALID', `Falta el parámetro obligatorio ${parameter.name}.`, {
        parameter: parameter.name,
        location: parameter.location,
      });
    }
    if (raw === undefined || raw === null || raw === '') continue;

    if (parameter.location === 'header') {
      if (isSensitiveRestHeaderName(parameter.name)) {
        throw new RestDataSourceError('REST_INPUT_INVALID', `El header ${parameter.name} debe resolverse por authRef/Gateway.`);
      }
      const value = scalar(raw, `headers.${parameter.name}`);
      if (value !== null) headers[parameter.name] = value;
      continue;
    }
    if (parameter.location === 'path') {
      const value = scalar(raw, `path.${parameter.name}`);
      if (value !== null) path = path.replaceAll(`{${parameter.name}}`, encodeURIComponent(value));
      continue;
    }
    if (Array.isArray(raw)) {
      for (const item of raw) {
        const value = scalar(item, `query.${parameter.name}`);
        if (value !== null) query.append(parameter.name, value);
      }
    } else {
      const value = scalar(raw, `query.${parameter.name}`);
      if (value !== null) query.append(parameter.name, value);
    }
  }

  if (/\{[^}]+\}/.test(path)) {
    throw new RestDataSourceError('REST_INPUT_INVALID', 'Quedan parámetros de ruta sin resolver.', { path });
  }

  const base = config.baseUrl.replace(/\/+$/, '');
  const url = new URL(`${base}${path}`);
  for (const [name, value] of query) url.searchParams.append(name, value);

  const body = operation.method === 'GET' ? null : input.body;
  if (body !== null && !Object.keys(headers).some((name) => name.toLowerCase() === 'content-type')) {
    headers['Content-Type'] = 'application/json';
  }
  return Object.freeze({ url: url.toString(), headers: Object.freeze(headers), body });
}

function valueAtPath(data: JsonValue | null, path: string): JsonValue | null {
  if (!data) return null;
  let current: JsonValue | undefined = data;
  for (const segment of path.split('.').filter(Boolean)) {
    if (!current || Array.isArray(current) || typeof current !== 'object') return null;
    current = (current as Record<string, JsonValue>)[segment];
  }
  return current ?? null;
}

function paginationResult(
  operation: ElectroCraftDataOperationDefinition,
  inputValue: JsonValue | undefined,
  data: JsonValue | null,
  response: Response,
): Readonly<Record<string, JsonValue>> | null {
  if (operation.pagination.kind === 'none') return null;
  const input = parseInput(inputValue);
  const total = response.headers.get('x-total-count');
  const output: Record<string, JsonValue> = {};
  if (total && Number.isFinite(Number(total))) output.total = Number(total);
  if (operation.pagination.kind === 'page') {
    output.page = input.query[operation.pagination.pageParam] ?? null;
    if (operation.pagination.pageSizeParam) {
      output.pageSize = input.query[operation.pagination.pageSizeParam] ?? null;
    }
  } else if (operation.pagination.kind === 'offset') {
    output.offset = input.query[operation.pagination.offsetParam] ?? null;
    if (operation.pagination.limitParam) output.limit = input.query[operation.pagination.limitParam] ?? null;
  } else {
    output.nextCursor = valueAtPath(data, operation.pagination.nextCursorPath);
  }
  return Object.freeze(output);
}

async function responseData(response: Response): Promise<JsonValue | null> {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('json')) {
    try {
      return JSON.parse(text) as JsonValue;
    } catch {
      return text;
    }
  }
  return text;
}

function errorCode(status: number) {
  if (status >= 500) return 'HTTP_5XX';
  if (status >= 400) return 'HTTP_4XX';
  return 'HTTP_ERROR';
}

async function browserExecute(
  fetchImpl: typeof globalThis.fetch,
  config: ElectroCraftRestDataSourceConfig,
  operation: ElectroCraftDataOperationDefinition,
  inputValue: JsonValue | undefined,
): Promise<ElectroCraftRestDataResult> {
  const request = applyParameters(config, operation, inputValue);
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), config.timeoutMs);
  try {
    const response = await fetchImpl(request.url, {
      method: operation.method,
      headers: request.headers,
      body: request.body === null ? undefined : JSON.stringify(request.body),
      signal: controller.signal,
    });
    const data = await responseData(response);
    return Object.freeze({
      ok: response.ok,
      status: response.status,
      data,
      pagination: paginationResult(operation, inputValue, data, response),
      error: response.ok
        ? null
        : Object.freeze({ code: errorCode(response.status), message: `La API respondió HTTP ${response.status}.` }),
      transport: 'browser' as const,
    });
  } catch (error) {
    if (controller.signal.aborted) {
      return Object.freeze({
        ok: false,
        status: null,
        data: null,
        pagination: null,
        error: Object.freeze({ code: 'TIMEOUT', message: `La solicitud excedió ${config.timeoutMs} ms.` }),
        transport: 'browser' as const,
      });
    }
    throw error;
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

export class RestDataSourceAdapter implements DataSourceAdapter {
  readonly adapterId = REST_DATA_ADAPTER_ID;
  readonly displayName = 'REST API';
  readonly supportedDataSourceKinds = ['rest'] as const;
  readonly capabilities = ['read', 'create', 'update', 'delete', 'pagination', 'filtering', 'sort'] as const;
  readonly supportsSchemaDiscovery = false;
  private readonly fetchImpl: typeof globalThis.fetch;

  constructor(private readonly options: RestDataSourceAdapterOptions = {}) {
    this.fetchImpl = options.fetch ?? globalThis.fetch;
  }

  async testConnection(context: DataSourceAdapterContext): Promise<DataSourceConnectionResult> {
    const config = configFor(context);
    if ((config.executionMode === 'gateway' || context.source.authRef) && this.options.gateway?.testConnection) {
      return this.options.gateway.testConnection(context, config);
    }
    if (config.executionMode === 'gateway' || context.source.authRef) {
      return Object.freeze({ ok: false, message: 'La conexión requiere ConnectorGateway.' });
    }
    const operation: ElectroCraftDataOperationDefinition = {
      id: 'connection-probe',
      label: 'Probar conexión',
      kind: 'read',
      method: 'GET',
      path: '/',
      requiresAuth: false,
      parameters: [],
      inputSchema: null,
      outputSchema: null,
      pagination: { kind: 'none' },
    };
    const probeConfig = { ...config, baseUrl: config.baseUrl.replace(/\/+$/, '') };
    const result = await browserExecute(this.fetchImpl, probeConfig, operation, undefined);
    return Object.freeze({
      ok: result.ok,
      message: result.ok ? 'REST API disponible.' : (result.error?.message ?? 'La REST API no respondió correctamente.'),
    });
  }

  async listResources(context: DataSourceAdapterContext): Promise<readonly DataSourceResourceDescriptor[]> {
    const config = configFor(context);
    return Object.freeze(
      config.operations.map((operation) =>
        Object.freeze({
          id: operation.id,
          label: operation.label,
          kind: `rest:${operation.kind}`,
          metadata: Object.freeze({ method: operation.method, path: operation.path, requiresAuth: operation.requiresAuth }),
        }),
      ),
    );
  }

  async getSchema() {
    return null;
  }

  async executeOperation(
    context: DataSourceAdapterContext,
    operation: ElectroCraftDataOperationDefinition,
    inputValue: JsonValue | undefined,
  ): Promise<ElectroCraftRestDataResult> {
    const config = configFor(context);
    if (operation.requiresAuth && !context.source.authRef) {
      throw new RestDataSourceError('AUTH_REF_MISSING', `La operación ${operation.label} requiere authRef.`);
    }
    const request = applyParameters(config, operation, inputValue);
    const requiresGateway = config.executionMode === 'gateway' || Boolean(context.source.authRef);
    if (requiresGateway) {
      if (!this.options.gateway) {
        throw new RestDataSourceError('GATEWAY_UNAVAILABLE', 'La solicitud requiere ConnectorGateway y no está disponible.');
      }
      return this.options.gateway.execute({
        sourceId: context.source.id,
        authRef: context.source.authRef,
        environment: context.environment,
        operation,
        url: request.url,
        method: operation.method,
        headers: request.headers,
        body: request.body,
        timeoutMs: config.timeoutMs,
      });
    }

    try {
      return await browserExecute(this.fetchImpl, config, operation, inputValue);
    } catch (error) {
      if (config.executionMode === 'auto' && this.options.gateway) {
        return this.options.gateway.execute({
          sourceId: context.source.id,
          authRef: context.source.authRef,
          environment: context.environment,
          operation,
          url: request.url,
          method: operation.method,
          headers: request.headers,
          body: request.body,
          timeoutMs: config.timeoutMs,
        });
      }
      throw new RestDataSourceError(
        config.executionMode === 'auto' ? 'GATEWAY_REQUIRED' : 'REST_INPUT_INVALID',
        config.executionMode === 'auto'
          ? 'El navegador no pudo ejecutar la solicitud; configura ConnectorGateway para CORS/red privada.'
          : 'El navegador no pudo ejecutar la solicitud REST.',
        { cause: error instanceof Error ? error.message : String(error) },
      );
    }
  }

  query(context: DataSourceAdapterContext, request: DataSourceQueryRequest): Promise<JsonValue> {
    const operation = operationFor(configFor(context), request.resourceId);
    if (operation.kind !== 'read') {
      throw new RestDataSourceError('REST_OPERATION_KIND_MISMATCH', `${operation.label} no es una operación de lectura.`);
    }
    return this.executeOperation(context, operation, request.input) as Promise<unknown> as Promise<JsonValue>;
  }

  mutate(context: DataSourceAdapterContext, request: DataSourceMutationRequest): Promise<JsonValue> {
    const operation = operationFor(configFor(context), request.resourceId);
    if (operation.kind !== request.operation) {
      throw new RestDataSourceError(
        'REST_OPERATION_KIND_MISMATCH',
        `${operation.label} es ${operation.kind}, no ${request.operation}.`,
      );
    }
    return this.executeOperation(context, operation, request.input) as Promise<unknown> as Promise<JsonValue>;
  }
}

export function createRestDataSourceAdapter(options?: RestDataSourceAdapterOptions) {
  return new RestDataSourceAdapter(options);
}
