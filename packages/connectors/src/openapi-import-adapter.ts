import { dereference } from '@scalar/openapi-parser';
import {
  electroCraftDataOperationDefinitionSchema,
  isSensitiveRestHeaderName,
  type ElectroCraftDataOperationDefinition,
  type ElectroCraftRestPaginationHint,
  type ElectroCraftRestParameter,
  type ElectroCraftRestParameterValueType,
  type JsonValue,
} from '@electrocraft/domain';

export interface OpenApiImportResult {
  readonly title: string;
  readonly version: string;
  readonly suggestedBaseUrl: string | null;
  readonly operations: readonly ElectroCraftDataOperationDefinition[];
  readonly warnings: readonly string[];
}

export class OpenApiImportError extends Error {
  constructor(
    message: string,
    readonly diagnostics: readonly string[] = [],
  ) {
    super(message);
    this.name = 'OpenApiImportError';
  }
}

type UnknownObject = Record<string, unknown>;

function object(value: unknown): UnknownObject | null {
  return value && !Array.isArray(value) && typeof value === 'object' ? (value as UnknownObject) : null;
}

function array(value: unknown): readonly unknown[] {
  return Array.isArray(value) ? value : [];
}

function text(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function asJsonValue(value: unknown): JsonValue | null {
  if (value === undefined) return null;
  try {
    return JSON.parse(JSON.stringify(value)) as JsonValue;
  } catch {
    return null;
  }
}

function operationId(value: unknown, method: string, path: string, used: Set<string>) {
  const seed = text(value) ?? `${method}-${path}`;
  const normalized = seed
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const prefix = /^[A-Za-z]/.test(normalized) ? normalized : `operation-${normalized || method.toLowerCase()}`;
  const base = prefix.slice(0, 72);
  let candidate = base;
  let suffix = 2;
  while (used.has(candidate)) {
    candidate = `${base.slice(0, 72 - String(suffix).length)}-${suffix}`;
    suffix += 1;
  }
  used.add(candidate);
  return candidate;
}

function operationKind(method: string): ElectroCraftDataOperationDefinition['kind'] {
  if (method === 'GET') return 'read';
  if (method === 'POST') return 'create';
  if (method === 'DELETE') return 'delete';
  return 'update';
}

function parameterValueType(parameter: UnknownObject): ElectroCraftRestParameterValueType {
  const schema = object(parameter.schema);
  const type = text(schema?.type) ?? text(parameter.type);
  if (type === 'number' || type === 'integer') return 'number';
  if (type === 'boolean') return 'boolean';
  if (type === 'array') return 'array';
  if (type === 'object') return 'json';
  return 'string';
}

function parametersFor(pathItem: UnknownObject, operation: UnknownObject, warnings: string[]) {
  const combined = [...array(pathItem.parameters), ...array(operation.parameters)];
  const output: ElectroCraftRestParameter[] = [];
  const seen = new Set<string>();
  for (const candidate of combined) {
    const parameter = object(candidate);
    if (!parameter) continue;
    const location = text(parameter.in);
    const name = text(parameter.name);
    if (!name || (location !== 'path' && location !== 'query' && location !== 'header')) continue;
    if (location === 'header' && isSensitiveRestHeaderName(name)) {
      warnings.push(`El header sensible ${name} no se importó; usa authRef/Gateway.`);
      continue;
    }
    const key = `${location}:${name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    output.push({
      name,
      location,
      required: location === 'path' || parameter.required === true,
      valueType: parameterValueType(parameter),
    });
  }
  return output;
}

function requestSchema(operation: UnknownObject): JsonValue | null {
  const requestBody = object(operation.requestBody);
  const content = object(requestBody?.content);
  const jsonContent = object(content?.['application/json']) ?? object(Object.values(content ?? {})[0]);
  const oasSchema = jsonContent?.schema;
  if (oasSchema !== undefined) return asJsonValue(oasSchema);

  const swaggerBody = array(operation.parameters)
    .map(object)
    .find((parameter) => parameter?.in === 'body');
  return asJsonValue(swaggerBody?.schema);
}

function responseSchema(operation: UnknownObject): JsonValue | null {
  const responses = object(operation.responses);
  if (!responses) return null;
  const key = Object.keys(responses).find((candidate) => /^2\d\d$/.test(candidate)) ??
    (Object.hasOwn(responses, 'default') ? 'default' : Object.keys(responses)[0]);
  if (!key) return null;
  const response = object(responses[key]);
  if (!response) return null;
  const content = object(response.content);
  const jsonContent = object(content?.['application/json']) ?? object(Object.values(content ?? {})[0]);
  return asJsonValue(jsonContent?.schema ?? response.schema);
}

function paginationHint(parameters: readonly ElectroCraftRestParameter[]): ElectroCraftRestPaginationHint {
  const queryNames = new Set(parameters.filter(({ location }) => location === 'query').map(({ name }) => name.toLowerCase()));
  const original = (target: string) =>
    parameters.find(({ location, name }) => location === 'query' && name.toLowerCase() === target)?.name ?? target;
  if (queryNames.has('cursor')) {
    return { kind: 'cursor', cursorParam: original('cursor'), nextCursorPath: 'nextCursor' };
  }
  if (queryNames.has('offset')) {
    return {
      kind: 'offset',
      offsetParam: original('offset'),
      limitParam: queryNames.has('limit') ? original('limit') : null,
    };
  }
  if (queryNames.has('page')) {
    const size = ['pagesize', 'page_size', 'perpage', 'per_page'].find((candidate) => queryNames.has(candidate));
    return { kind: 'page', pageParam: original('page'), pageSizeParam: size ? original(size) : null };
  }
  return { kind: 'none' };
}

function requiresAuthentication(operation: UnknownObject, document: UnknownObject) {
  const local = operation.security;
  if (Array.isArray(local)) return local.length > 0;
  return array(document.security).length > 0;
}

function suggestedBaseUrl(document: UnknownObject) {
  const firstServer = object(array(document.servers)[0]);
  const serverUrl = text(firstServer?.url);
  if (serverUrl && /^https?:\/\//i.test(serverUrl)) return serverUrl;

  const host = text(document.host);
  if (!host) return null;
  const scheme = text(array(document.schemes)[0]) ?? 'https';
  const basePath = text(document.basePath) ?? '';
  const value = `${scheme}://${host}${basePath.startsWith('/') || !basePath ? basePath : `/${basePath}`}`;
  return /^https?:\/\//i.test(value) ? value : null;
}

function parseOperations(document: UnknownObject, warnings: string[]) {
  const paths = object(document.paths);
  if (!paths) return Object.freeze([] as ElectroCraftDataOperationDefinition[]);
  const output: ElectroCraftDataOperationDefinition[] = [];
  const usedIds = new Set<string>();
  for (const [path, pathValue] of Object.entries(paths)) {
    const pathItem = object(pathValue);
    if (!pathItem || !path.startsWith('/')) continue;
    for (const methodName of ['get', 'post', 'put', 'patch', 'delete'] as const) {
      const operation = object(pathItem[methodName]);
      if (!operation) continue;
      const method = methodName.toUpperCase() as ElectroCraftDataOperationDefinition['method'];
      const parameters = parametersFor(pathItem, operation, warnings);
      const parsed = electroCraftDataOperationDefinitionSchema.safeParse({
        id: operationId(operation.operationId, method, path, usedIds),
        label: text(operation.summary) ?? text(operation.operationId) ?? `${method} ${path}`,
        kind: operationKind(method),
        method,
        path,
        requiresAuth: requiresAuthentication(operation, document),
        parameters,
        inputSchema: requestSchema(operation),
        outputSchema: responseSchema(operation),
        pagination: paginationHint(parameters),
      });
      if (parsed.success) output.push(parsed.data);
      else warnings.push(`${method} ${path} no se importó: ${parsed.error.issues.map(({ message }) => message).join('; ')}`);
    }
  }
  return Object.freeze(output);
}

export async function importOpenApiDocument(document: string | JsonValue): Promise<OpenApiImportResult> {
  const result = await dereference(document as never);
  const record = object(result);
  const diagnostics = array(record?.errors).map((error) => {
    const candidate = object(error);
    return text(candidate?.message) ?? String(error);
  });
  const schema = object(record?.schema);
  if (!schema) {
    throw new OpenApiImportError('No se pudo interpretar el documento OpenAPI.', diagnostics);
  }
  const version = text(schema.openapi) ?? text(schema.swagger);
  if (!version) throw new OpenApiImportError('El documento no declara una versión OpenAPI/Swagger.', diagnostics);

  const warnings = [...diagnostics];
  const info = object(schema.info);
  const operations = parseOperations(schema, warnings);
  if (operations.length === 0) warnings.push('El documento no contiene operaciones REST importables.');

  return Object.freeze({
    title: text(info?.title) ?? 'REST API',
    version,
    suggestedBaseUrl: suggestedBaseUrl(schema),
    operations,
    warnings: Object.freeze(warnings),
  });
}
