import type {
  DataSourceAdapter,
  DataSourceAdapterContext,
  DataSourceConnectionResult,
  DataSourceMutationRequest,
  DataSourceQueryRequest,
  DataSourceResourceDescriptor,
} from '@electrocraft/application';
import {
  createDeterministicObjectId,
  electroCraftDataSchemaSchema,
  electroCraftGraphQLDataSourceConfigSchema,
  isSensitiveGraphQLHeaderName,
  type ElectroCraftDataFieldType,
  type ElectroCraftDataSchema,
  type ElectroCraftGraphQLDataResult,
  type ElectroCraftGraphQLDataSourceConfig,
  type ElectroCraftGraphQLOperationDefinition,
  type ElectroCraftGraphQLVariable,
  type JsonValue,
} from '@electrocraft/domain';

export const GRAPHQL_DATA_ADAPTER_ID = 'graphql.fetch' as const;

type JsonObject = Record<string, JsonValue>;
type GraphQLTypeKind = 'SCALAR' | 'OBJECT' | 'INTERFACE' | 'UNION' | 'ENUM' | 'INPUT_OBJECT' | 'LIST' | 'NON_NULL';

interface GraphQLTypeRef {
  readonly kind: GraphQLTypeKind;
  readonly name: string | null;
  readonly ofType: GraphQLTypeRef | null;
}

interface GraphQLArgumentIntrospection {
  readonly name: string;
  readonly type: GraphQLTypeRef;
}

interface GraphQLFieldIntrospection {
  readonly name: string;
  readonly args: readonly GraphQLArgumentIntrospection[];
  readonly type: GraphQLTypeRef;
}

interface GraphQLNamedTypeIntrospection {
  readonly kind: GraphQLTypeKind;
  readonly name: string;
  readonly fields: readonly GraphQLFieldIntrospection[];
}

interface GraphQLSchemaIntrospection {
  readonly queryType: { readonly name: string } | null;
  readonly mutationType: { readonly name: string } | null;
  readonly types: readonly GraphQLNamedTypeIntrospection[];
}

export interface GraphQLIntrospectionSnapshot {
  readonly schema: ElectroCraftDataSchema | null;
  readonly operations: readonly ElectroCraftGraphQLOperationDefinition[];
  readonly queryTypeName: string | null;
  readonly mutationTypeName: string | null;
}

export type GraphQLAdapterErrorCode =
  | 'GRAPHQL_CONFIG_INVALID'
  | 'GRAPHQL_OPERATION_MISSING'
  | 'GRAPHQL_OPERATION_KIND_MISMATCH'
  | 'GRAPHQL_INPUT_INVALID'
  | 'GRAPHQL_INTROSPECTION_DISABLED'
  | 'GRAPHQL_INTROSPECTION_DENIED'
  | 'GRAPHQL_RESPONSE_INVALID'
  | 'AUTH_REF_MISSING'
  | 'GATEWAY_REQUIRED'
  | 'GATEWAY_UNAVAILABLE';

export class GraphQLDataSourceError extends Error {
  constructor(
    readonly code: GraphQLAdapterErrorCode,
    message: string,
    readonly details: Readonly<Record<string, unknown>> = {},
  ) {
    super(message);
    this.name = 'GraphQLDataSourceError';
  }
}

export interface GraphQLGatewayExecutionRequest {
  readonly sourceId: string;
  readonly authRef: string | null;
  readonly environment: DataSourceAdapterContext['environment'];
  readonly endpoint: string;
  readonly headers: Readonly<Record<string, string>>;
  readonly document: string;
  readonly variables: Readonly<Record<string, JsonValue>>;
  readonly timeoutMs: number;
}

export interface GraphQLGatewayPort {
  execute(request: GraphQLGatewayExecutionRequest): Promise<ElectroCraftGraphQLDataResult>;
  testConnection?(
    context: DataSourceAdapterContext,
    config: ElectroCraftGraphQLDataSourceConfig,
  ): Promise<DataSourceConnectionResult>;
}

export interface GraphQLDataSourceAdapterOptions {
  readonly fetch?: typeof globalThis.fetch;
  readonly gateway?: GraphQLGatewayPort;
}

const INTROSPECTION_QUERY = `query ElectroCraftIntrospection {
  __schema {
    queryType { name }
    mutationType { name }
    types {
      kind
      name
      fields(includeDeprecated: true) {
        name
        args {
          name
          type {
            kind name
            ofType { kind name
              ofType { kind name
                ofType { kind name
                  ofType { kind name
                    ofType { kind name
                      ofType { kind name }
                    }
                  }
                }
              }
            }
          }
        }
        type {
          kind name
          ofType { kind name
            ofType { kind name
              ofType { kind name
                ofType { kind name
                  ofType { kind name
                    ofType { kind name }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}`;

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function configFor(context: DataSourceAdapterContext) {
  const parsed = electroCraftGraphQLDataSourceConfigSchema.safeParse(context.config);
  if (!parsed.success) {
    throw new GraphQLDataSourceError('GRAPHQL_CONFIG_INVALID', 'Configuración GraphQL inválida.', {
      issues: parsed.error.issues.map(({ path, message }) => ({ path, message })),
    });
  }
  return parsed.data;
}

function operationFor(config: ElectroCraftGraphQLDataSourceConfig, resourceId: string) {
  const operation = config.operations.find(({ id }) => id === resourceId);
  if (!operation) {
    throw new GraphQLDataSourceError('GRAPHQL_OPERATION_MISSING', `Operación GraphQL no encontrada: ${resourceId}.`, {
      resourceId,
    });
  }
  return operation;
}

function inputObject(input: JsonValue | undefined): JsonObject {
  if (input === undefined) return {};
  if (!input || Array.isArray(input) || typeof input !== 'object') {
    throw new GraphQLDataSourceError('GRAPHQL_INPUT_INVALID', 'El input GraphQL debe ser un objeto.');
  }
  return input as JsonObject;
}

function hasValueType(value: JsonValue, variable: ElectroCraftGraphQLVariable) {
  if (value === null) return !variable.required;
  if (variable.valueType === 'string') return typeof value === 'string';
  if (variable.valueType === 'number') return typeof value === 'number' && Number.isFinite(value);
  if (variable.valueType === 'boolean') return typeof value === 'boolean';
  if (variable.valueType === 'array') return Array.isArray(value);
  return true;
}

function variablesFor(operation: ElectroCraftGraphQLOperationDefinition, input: JsonValue | undefined) {
  const root = inputObject(input);
  const variableInput = Object.hasOwn(root, 'variables') ? root.variables : root;
  if (!variableInput || Array.isArray(variableInput) || typeof variableInput !== 'object') {
    throw new GraphQLDataSourceError('GRAPHQL_INPUT_INVALID', 'Variables debe ser un objeto JSON.');
  }
  const provided = variableInput as JsonObject;
  const output: Record<string, JsonValue> = {};
  const known = new Set(operation.variables.map(({ name }) => name));

  for (const name of Object.keys(provided)) {
    if (!known.has(name)) {
      throw new GraphQLDataSourceError('GRAPHQL_INPUT_INVALID', `Variable GraphQL no declarada: ${name}.`);
    }
  }

  for (const variable of operation.variables) {
    const hasProvidedValue = Object.hasOwn(provided, variable.name);
    const value = hasProvidedValue
      ? provided[variable.name]
      : Object.hasOwn(variable, 'defaultValue')
        ? variable.defaultValue
        : undefined;
    if ((value === undefined || value === null) && variable.required) {
      throw new GraphQLDataSourceError('GRAPHQL_INPUT_INVALID', `Falta la variable obligatoria $${variable.name}.`, {
        variable: variable.name,
      });
    }
    if (value === undefined) continue;
    if (!hasValueType(value, variable)) {
      throw new GraphQLDataSourceError(
        'GRAPHQL_INPUT_INVALID',
        `La variable $${variable.name} no coincide con ${variable.valueType}.`,
      );
    }
    output[variable.name] = value;
  }
  return Object.freeze(output);
}

function normalizeGraphQLErrors(value: unknown) {
  if (!Array.isArray(value)) return Object.freeze([]);
  return Object.freeze(
    value.flatMap((item) => {
      if (!isObject(item) || typeof item.message !== 'string') return [];
      const path = Array.isArray(item.path)
        ? item.path.filter(
            (segment): segment is string | number => typeof segment === 'string' || typeof segment === 'number',
          )
        : null;
      return [Object.freeze({ message: item.message, path: path ? Object.freeze(path) : null })];
    }),
  );
}

function httpErrorCode(status: number) {
  if (status >= 500) return 'HTTP_5XX';
  if (status >= 400) return 'HTTP_4XX';
  return 'HTTP_ERROR';
}

async function browserExecute(
  fetchImpl: typeof globalThis.fetch,
  config: ElectroCraftGraphQLDataSourceConfig,
  document: string,
  variables: Readonly<Record<string, JsonValue>>,
): Promise<ElectroCraftGraphQLDataResult> {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), config.timeoutMs);
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...config.defaultHeaders };
  for (const name of Object.keys(headers)) {
    if (isSensitiveGraphQLHeaderName(name)) {
      throw new GraphQLDataSourceError(
        'GRAPHQL_CONFIG_INVALID',
        `El header ${name} debe resolverse por authRef/Gateway.`,
      );
    }
  }

  try {
    const response = await fetchImpl(config.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: document, variables }),
      signal: controller.signal,
    });
    const text = await response.text();
    let payload: unknown = null;
    if (text) {
      try {
        payload = JSON.parse(text) as unknown;
      } catch {
        return Object.freeze({
          ok: false,
          status: response.status,
          data: null,
          errors: Object.freeze([]),
          error: Object.freeze({
            code: 'GRAPHQL_RESPONSE_INVALID',
            message: 'La respuesta GraphQL no es JSON válido.',
          }),
          transport: 'browser' as const,
        });
      }
    }
    const payloadObject = isObject(payload) ? payload : {};
    const errors = normalizeGraphQLErrors(payloadObject.errors);
    const data = (payloadObject.data ?? null) as JsonValue | null;
    const ok = response.ok && errors.length === 0;
    return Object.freeze({
      ok,
      status: response.status,
      data,
      errors,
      error: !response.ok
        ? Object.freeze({ code: httpErrorCode(response.status), message: `GraphQL respondió HTTP ${response.status}.` })
        : errors.length > 0
          ? Object.freeze({ code: 'GRAPHQL_ERROR', message: errors[0]?.message ?? 'GraphQL devolvió errores.' })
          : null,
      transport: 'browser' as const,
    });
  } catch (error) {
    if (controller.signal.aborted) {
      return Object.freeze({
        ok: false,
        status: null,
        data: null,
        errors: Object.freeze([]),
        error: Object.freeze({ code: 'TIMEOUT', message: `La solicitud excedió ${config.timeoutMs} ms.` }),
        transport: 'browser' as const,
      });
    }
    throw error;
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

function typeRef(value: unknown): GraphQLTypeRef | null {
  if (!isObject(value) || typeof value.kind !== 'string') return null;
  const kind = value.kind as GraphQLTypeKind;
  const name = typeof value.name === 'string' ? value.name : null;
  return Object.freeze({ kind, name, ofType: typeRef(value.ofType) });
}

function schemaFromResult(result: ElectroCraftGraphQLDataResult): GraphQLSchemaIntrospection {
  if (!result.ok) {
    throw new GraphQLDataSourceError(
      'GRAPHQL_INTROSPECTION_DENIED',
      result.error?.message ?? 'El endpoint rechazó introspection GraphQL.',
      { errors: result.errors },
    );
  }
  const root = isObject(result.data) ? result.data : null;
  const rawSchema = root && isObject(root.__schema) ? root.__schema : null;
  if (!rawSchema || !Array.isArray(rawSchema.types)) {
    throw new GraphQLDataSourceError('GRAPHQL_RESPONSE_INVALID', 'La respuesta de introspection no contiene __schema.');
  }

  const types = rawSchema.types.flatMap((rawType) => {
    if (!isObject(rawType) || typeof rawType.kind !== 'string' || typeof rawType.name !== 'string') return [];
    const fields = Array.isArray(rawType.fields)
      ? rawType.fields.flatMap((rawField) => {
          if (!isObject(rawField) || typeof rawField.name !== 'string') return [];
          const fieldType = typeRef(rawField.type);
          if (!fieldType) return [];
          const args = Array.isArray(rawField.args)
            ? rawField.args.flatMap((rawArg) => {
                if (!isObject(rawArg) || typeof rawArg.name !== 'string') return [];
                const argType = typeRef(rawArg.type);
                return argType ? [Object.freeze({ name: rawArg.name, type: argType })] : [];
              })
            : [];
          return [Object.freeze({ name: rawField.name, args: Object.freeze(args), type: fieldType })];
        })
      : [];
    return [
      Object.freeze({
        kind: rawType.kind as GraphQLTypeKind,
        name: rawType.name,
        fields: Object.freeze(fields),
      }),
    ];
  });

  const queryType =
    isObject(rawSchema.queryType) && typeof rawSchema.queryType.name === 'string'
      ? Object.freeze({ name: rawSchema.queryType.name })
      : null;
  const mutationType =
    isObject(rawSchema.mutationType) && typeof rawSchema.mutationType.name === 'string'
      ? Object.freeze({ name: rawSchema.mutationType.name })
      : null;
  return Object.freeze({ queryType, mutationType, types: Object.freeze(types) });
}

function unwrapType(reference: GraphQLTypeRef) {
  let current = reference;
  let list = false;
  const nullable = current.kind !== 'NON_NULL';
  if (current.kind === 'NON_NULL' && current.ofType) current = current.ofType;
  while (current.kind === 'LIST' || current.kind === 'NON_NULL') {
    if (current.kind === 'LIST') list = true;
    if (!current.ofType) break;
    current = current.ofType;
  }
  return Object.freeze({ named: current, list, nullable });
}

function graphQLTypeString(reference: GraphQLTypeRef): string {
  if (reference.kind === 'NON_NULL' && reference.ofType) return `${graphQLTypeString(reference.ofType)}!`;
  if (reference.kind === 'LIST' && reference.ofType) return `[${graphQLTypeString(reference.ofType)}]`;
  return reference.name ?? 'JSON';
}

function variableValueType(reference: GraphQLTypeRef): ElectroCraftGraphQLVariable['valueType'] {
  const unwrapped = unwrapType(reference);
  if (unwrapped.list) return 'array';
  if (unwrapped.named.name === 'Boolean') return 'boolean';
  if (unwrapped.named.name === 'Int' || unwrapped.named.name === 'Float') return 'number';
  if (unwrapped.named.name === 'JSON' || unwrapped.named.name === 'JSONObject') return 'json';
  return 'string';
}

function fieldType(reference: GraphQLTypeRef, modelNames: ReadonlySet<string>): ElectroCraftDataFieldType {
  const unwrapped = unwrapType(reference);
  if (unwrapped.list) return 'json';
  const name = unwrapped.named.name ?? '';
  if (unwrapped.named.kind === 'OBJECT' && modelNames.has(name)) return 'relation';
  if (name === 'Boolean') return 'boolean';
  if (name === 'Int' || name === 'Float' || name === 'BigInt' || name === 'Decimal') return 'number';
  if (/date.?time/i.test(name)) return 'datetime';
  if (/^date$/i.test(name)) return 'date';
  if (name === 'JSON' || name === 'JSONObject') return 'json';
  return 'text';
}

function operationKind(fieldName: string): 'create' | 'update' | 'delete' {
  const normalized = fieldName.toLocaleLowerCase('en');
  if (/^(?:delete|remove|destroy)/.test(normalized)) return 'delete';
  if (/^(?:create|add|insert|new)/.test(normalized)) return 'create';
  return 'update';
}

function humanize(value: string) {
  const spaced = value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim();
  return spaced ? `${spaced[0]?.toUpperCase() ?? ''}${spaced.slice(1)}` : value;
}

function canonicalKey(value: string, fallback: string) {
  const normalized = value.replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
  const candidate = /^[A-Za-z]/.test(normalized) ? normalized : `${fallback}-${normalized || 'value'}`;
  return candidate.slice(0, 80);
}

function scalarSelection(reference: GraphQLTypeRef, typesByName: ReadonlyMap<string, GraphQLNamedTypeIntrospection>) {
  const unwrapped = unwrapType(reference);
  if (unwrapped.named.kind !== 'OBJECT' || !unwrapped.named.name) return '';
  const objectType = typesByName.get(unwrapped.named.name);
  const fields = (objectType?.fields ?? [])
    .filter(
      (field) =>
        field.args.length === 0 && !['OBJECT', 'INTERFACE', 'UNION'].includes(unwrapType(field.type).named.kind),
    )
    .slice(0, 8)
    .map(({ name }) => name);
  return fields.length > 0 ? ` { ${fields.join(' ')} }` : ' { __typename }';
}

export function graphQLIntrospectionToOperations(
  schema: GraphQLSchemaIntrospection,
): readonly ElectroCraftGraphQLOperationDefinition[] {
  const typesByName = new Map(schema.types.map((type) => [type.name, type]));
  const operations: ElectroCraftGraphQLOperationDefinition[] = [];

  for (const [operationType, rootName] of [
    ['query', schema.queryType?.name ?? null],
    ['mutation', schema.mutationType?.name ?? null],
  ] as const) {
    if (!rootName) continue;
    const root = typesByName.get(rootName);
    if (!root) continue;
    for (const field of root.fields) {
      const variables = field.args.map((argument) =>
        Object.freeze({
          name: argument.name,
          graphQLType: graphQLTypeString(argument.type),
          valueType: variableValueType(argument.type),
          required: argument.type.kind === 'NON_NULL',
        }),
      );
      const variableDefinitions = variables.map((variable) => `$${variable.name}: ${variable.graphQLType}`).join(', ');
      const argumentBindings = variables.map((variable) => `${variable.name}: $${variable.name}`).join(', ');
      const operationName = `ElectroCraft_${operationType}_${field.name}`.replace(/[^_0-9A-Za-z]/g, '_');
      const document = `${operationType} ${operationName}${variableDefinitions ? `(${variableDefinitions})` : ''} { ${field.name}${
        argumentBindings ? `(${argumentBindings})` : ''
      }${scalarSelection(field.type, typesByName)} }`;
      operations.push(
        Object.freeze({
          id: `${operationType}_${field.name}`.slice(0, 80),
          label: humanize(field.name),
          operationType,
          kind: operationType === 'query' ? 'read' : operationKind(field.name),
          fieldName: field.name,
          document,
          requiresAuth: false,
          variables: Object.freeze(variables),
          outputSchema: null,
        }),
      );
    }
  }
  return Object.freeze(operations);
}

export function graphQLIntrospectionToDataSchema(
  sourceId: DataSourceAdapterContext['source']['id'],
  schema: GraphQLSchemaIntrospection,
): ElectroCraftDataSchema | null {
  const reserved = new Set(
    [schema.queryType?.name, schema.mutationType?.name].filter((value): value is string => Boolean(value)),
  );
  const objectTypes = schema.types.filter(
    (type) =>
      type.kind === 'OBJECT' && !type.name.startsWith('__') && !reserved.has(type.name) && type.fields.length > 0,
  );
  if (objectTypes.length === 0) return null;
  const modelNames = new Set(objectTypes.map(({ name }) => name));
  const modelIds = new Map(
    objectTypes.map(({ name }) => [name, createDeterministicObjectId('data-model', `${sourceId}:${name}`)]),
  );
  return electroCraftDataSchemaSchema.parse({
    schemaVersion: 1,
    id: createDeterministicObjectId('data-schema', `${sourceId}:graphql`),
    version: 1,
    sourceRef: sourceId,
    name: 'GraphQL Schema',
    models: objectTypes.map((type) => ({
      id: modelIds.get(type.name),
      key: canonicalKey(type.name, 'type'),
      label: humanize(type.name),
      fields: type.fields.slice(0, 500).map((field) => {
        const unwrapped = unwrapType(field.type);
        const canonicalType = fieldType(field.type, modelNames);
        return {
          id: createDeterministicObjectId('data-field', `${sourceId}:${type.name}:${field.name}`),
          key: canonicalKey(field.name, 'field'),
          label: humanize(field.name),
          type: canonicalType,
          nullable: unwrapped.nullable,
          indexed: false,
          faceted: false,
          relationModelRef:
            canonicalType === 'relation' && unwrapped.named.name ? (modelIds.get(unwrapped.named.name) ?? null) : null,
          metadata: { graphQLType: graphQLTypeString(field.type) },
        };
      }),
      metadata: { graphQLType: type.name },
    })),
    metadata: { owner: 'GraphQL introspection', queryType: schema.queryType?.name ?? null },
  });
}

export class GraphQLDataSourceAdapter implements DataSourceAdapter {
  readonly adapterId = GRAPHQL_DATA_ADAPTER_ID;
  readonly displayName = 'GraphQL';
  readonly supportedDataSourceKinds = ['graphql'] as const;
  readonly capabilities = ['read', 'create', 'update', 'delete'] as const;
  readonly supportsSchemaDiscovery = true;
  private readonly fetchImpl: typeof globalThis.fetch;

  constructor(private readonly options: GraphQLDataSourceAdapterOptions = {}) {
    this.fetchImpl = options.fetch ?? globalThis.fetch;
  }

  private async executeDocument(
    context: DataSourceAdapterContext,
    document: string,
    variables: Readonly<Record<string, JsonValue>>,
  ): Promise<ElectroCraftGraphQLDataResult> {
    const config = configFor(context);
    const headers = Object.freeze({ 'Content-Type': 'application/json', ...config.defaultHeaders });
    const requiresGateway = config.executionMode === 'gateway' || Boolean(context.source.authRef);
    if (requiresGateway) {
      if (!this.options.gateway) {
        throw new GraphQLDataSourceError(
          'GATEWAY_UNAVAILABLE',
          'La solicitud GraphQL requiere ConnectorGateway y no está disponible.',
        );
      }
      return this.options.gateway.execute({
        sourceId: context.source.id,
        authRef: context.source.authRef,
        environment: context.environment,
        endpoint: config.endpoint,
        headers,
        document,
        variables,
        timeoutMs: config.timeoutMs,
      });
    }
    try {
      return await browserExecute(this.fetchImpl, config, document, variables);
    } catch (error) {
      if (config.executionMode === 'auto' && this.options.gateway) {
        return this.options.gateway.execute({
          sourceId: context.source.id,
          authRef: context.source.authRef,
          environment: context.environment,
          endpoint: config.endpoint,
          headers,
          document,
          variables,
          timeoutMs: config.timeoutMs,
        });
      }
      throw new GraphQLDataSourceError(
        config.executionMode === 'auto' ? 'GATEWAY_REQUIRED' : 'GRAPHQL_INPUT_INVALID',
        config.executionMode === 'auto'
          ? 'El navegador no pudo ejecutar GraphQL; configura ConnectorGateway para CORS/red privada.'
          : 'El navegador no pudo ejecutar la solicitud GraphQL.',
        { cause: error instanceof Error ? error.message : String(error) },
      );
    }
  }

  async introspect(context: DataSourceAdapterContext): Promise<GraphQLIntrospectionSnapshot> {
    const config = configFor(context);
    if (!config.introspectionEnabled) {
      throw new GraphQLDataSourceError(
        'GRAPHQL_INTROSPECTION_DISABLED',
        'Introspection está deshabilitada para esta fuente.',
      );
    }
    const result = await this.executeDocument(context, INTROSPECTION_QUERY, {});
    const introspection = schemaFromResult(result);
    return Object.freeze({
      schema: graphQLIntrospectionToDataSchema(context.source.id, introspection),
      operations: graphQLIntrospectionToOperations(introspection),
      queryTypeName: introspection.queryType?.name ?? null,
      mutationTypeName: introspection.mutationType?.name ?? null,
    });
  }

  async testConnection(context: DataSourceAdapterContext): Promise<DataSourceConnectionResult> {
    const config = configFor(context);
    if ((config.executionMode === 'gateway' || context.source.authRef) && this.options.gateway?.testConnection) {
      return this.options.gateway.testConnection(context, config);
    }
    const result = await this.executeDocument(context, 'query ElectroCraftProbe { __typename }', {});
    return Object.freeze({
      ok: result.ok,
      message: result.ok ? 'GraphQL disponible.' : (result.error?.message ?? 'GraphQL respondió con errores.'),
    });
  }

  async listResources(context: DataSourceAdapterContext): Promise<readonly DataSourceResourceDescriptor[]> {
    const config = configFor(context);
    return Object.freeze(
      config.operations.map((operation) =>
        Object.freeze({
          id: operation.id,
          label: operation.label,
          kind: `graphql:${operation.operationType}`,
          metadata: Object.freeze({
            fieldName: operation.fieldName,
            operationType: operation.operationType,
            operationKind: operation.kind,
            requiresAuth: operation.requiresAuth,
            variables: operation.variables.map(({ name }) => name),
          }),
        }),
      ),
    );
  }

  async getSchema(context: DataSourceAdapterContext) {
    return (await this.introspect(context)).schema;
  }

  async executeOperation(
    context: DataSourceAdapterContext,
    operation: ElectroCraftGraphQLOperationDefinition,
    input: JsonValue | undefined,
  ) {
    if (operation.requiresAuth && !context.source.authRef) {
      throw new GraphQLDataSourceError('AUTH_REF_MISSING', `La operación ${operation.label} requiere authRef.`);
    }
    return this.executeDocument(context, operation.document, variablesFor(operation, input));
  }

  query(context: DataSourceAdapterContext, request: DataSourceQueryRequest): Promise<JsonValue> {
    const operation = operationFor(configFor(context), request.resourceId);
    if (operation.operationType !== 'query' || operation.kind !== 'read') {
      throw new GraphQLDataSourceError(
        'GRAPHQL_OPERATION_KIND_MISMATCH',
        `${operation.label} no es una consulta GraphQL de lectura.`,
      );
    }
    return this.executeOperation(context, operation, request.input) as Promise<unknown> as Promise<JsonValue>;
  }

  mutate(context: DataSourceAdapterContext, request: DataSourceMutationRequest): Promise<JsonValue> {
    const operation = operationFor(configFor(context), request.resourceId);
    if (operation.operationType !== 'mutation' || operation.kind !== request.operation) {
      throw new GraphQLDataSourceError(
        'GRAPHQL_OPERATION_KIND_MISMATCH',
        `${operation.label} es ${operation.kind}, no ${request.operation}.`,
      );
    }
    return this.executeOperation(context, operation, request.input) as Promise<unknown> as Promise<JsonValue>;
  }
}

export function createGraphQLDataSourceAdapter(options?: GraphQLDataSourceAdapterOptions) {
  return new GraphQLDataSourceAdapter(options);
}
