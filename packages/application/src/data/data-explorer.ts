import {
  createDeterministicObjectId,
  electroCraftQueryDefinitionSchema,
  normalizeDataSourceCapabilities,
  type ElectroCraftDataExplorerOperation,
  type ElectroCraftDataExplorerParameter,
  type ElectroCraftDataSourceDefinition,
  type ElectroCraftDataSourceEnvironment,
  type ElectroCraftObjectId,
  type ElectroCraftQueryDefinition,
  type JsonValue,
} from '@electrocraft/domain';
import type { ConnectorRegistry } from '../connector-registry';
import type { DataSourceResourceDescriptor } from './index';

export type DataExplorerOperationCapability = ElectroCraftDataExplorerOperation['capability'];

export interface DataExplorerOperationDescriptor extends ElectroCraftDataExplorerOperation {
  readonly resourceId: string;
  readonly resourceLabel: string;
  readonly resourceKind: string;
  readonly dataSchemaId: ElectroCraftObjectId | null;
}

export interface DataExplorerExecutionTrace {
  readonly sourceId: string;
  readonly environment: ElectroCraftDataSourceEnvironment;
  readonly resourceId: string;
  readonly operationId: string;
  readonly capability: DataExplorerOperationCapability;
  readonly input: JsonValue;
  readonly output: JsonValue | null;
}

export interface DataExplorerExecutionResult {
  readonly status: 'success' | 'error';
  readonly durationMs: number;
  readonly preview: JsonValue | null;
  readonly trace: DataExplorerExecutionTrace;
  readonly truncated: boolean;
  readonly error: string | null;
}

export interface DataExplorerExecuteRequest {
  readonly source: ElectroCraftDataSourceDefinition;
  readonly environment: ElectroCraftDataSourceEnvironment;
  readonly operation: DataExplorerOperationDescriptor;
  readonly input: JsonValue;
  readonly mutationConfirmed?: boolean;
}

export interface CreateDataExplorerDraftRequest {
  readonly source: ElectroCraftDataSourceDefinition;
  readonly operation: DataExplorerOperationDescriptor;
  readonly input: JsonValue;
  readonly idSeed: string;
}

export class DataExplorerMutationConfirmationError extends Error {
  readonly code = 'MUTATION_CONFIRMATION_REQUIRED';

  constructor(readonly operationId: string) {
    super('Confirma la mutación antes de ejecutarla.');
    this.name = 'DataExplorerMutationConfirmationError';
  }
}

const sensitiveKeyPattern = /(?:authorization|cookie|token|secret|password|api[-_]?key|credential)/i;
const sensitiveTextPattern = /(?:bearer|basic)\s+\S+|(?:token|secret|password|api[-_]?key|credential)\s*[:=]\s*\S+/i;
const REDACTED = '[REDACTADO]';

function isObject(value: JsonValue | undefined | null): value is Record<string, JsonValue> {
  return value !== null && value !== undefined && !Array.isArray(value) && typeof value === 'object';
}

export function sanitizeDataExplorerValue(value: JsonValue): JsonValue {
  if (Array.isArray(value)) return value.map(sanitizeDataExplorerValue);
  if (!isObject(value)) {
    return typeof value === 'string' && sensitiveTextPattern.test(value) ? REDACTED : value;
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [
      key,
      sensitiveKeyPattern.test(key) ? REDACTED : sanitizeDataExplorerValue(child),
    ]),
  );
}

function truncateValue(
  value: JsonValue,
  limits: { readonly maxItems: number; readonly maxDepth: number; readonly maxStringLength: number },
  depth = 0,
): { readonly value: JsonValue; readonly truncated: boolean } {
  if (typeof value === 'string' && value.length > limits.maxStringLength) {
    return { value: `${value.slice(0, limits.maxStringLength)}…`, truncated: true };
  }
  if (depth >= limits.maxDepth && (Array.isArray(value) || isObject(value))) {
    return { value: '[Resultado anidado truncado]', truncated: true };
  }
  if (Array.isArray(value)) {
    let truncated = value.length > limits.maxItems;
    const items = value.slice(0, limits.maxItems).map((item) => {
      const next = truncateValue(item, limits, depth + 1);
      truncated ||= next.truncated;
      return next.value;
    });
    return { value: items, truncated };
  }
  if (isObject(value)) {
    const maxObjectKeys = Math.max(limits.maxItems, 50);
    let truncated = Object.keys(value).length > maxObjectKeys;
    const entries = Object.entries(value)
      .slice(0, maxObjectKeys)
      .map(([key, child]) => {
        const next = truncateValue(child, limits, depth + 1);
        truncated ||= next.truncated;
        return [key, next.value] as const;
      });
    return { value: Object.fromEntries(entries), truncated };
  }
  return { value, truncated: false };
}

function operationFallback(resource: DataSourceResourceDescriptor): ElectroCraftDataExplorerOperation {
  return Object.freeze({
    id: 'read',
    label: 'Consultar',
    capability: 'read',
    parameters: Object.freeze([]),
    inputSchema: null,
  });
}

export function listDataExplorerOperations(
  source: ElectroCraftDataSourceDefinition,
  resources: readonly DataSourceResourceDescriptor[],
): readonly DataExplorerOperationDescriptor[] {
  const capabilities = new Set(normalizeDataSourceCapabilities(source.capabilities));
  return Object.freeze(
    resources.flatMap((resource) =>
      (resource.operations?.length ? resource.operations : [operationFallback(resource)])
        .filter((operation) => capabilities.has(operation.capability))
        .map((operation) =>
          Object.freeze({
            ...operation,
            parameters: Object.freeze([...operation.parameters]),
            resourceId: resource.id,
            resourceLabel: resource.label,
            resourceKind: resource.kind,
            dataSchemaId:
              typeof resource.metadata?.dataSchemaId === 'string'
                ? (resource.metadata.dataSchemaId as ElectroCraftObjectId)
                : null,
          }),
        ),
    ),
  );
}

function parseParameterValue(parameter: ElectroCraftDataExplorerParameter, raw: string): JsonValue | undefined {
  if (raw.trim() === '') {
    if (parameter.defaultValue !== undefined) return parameter.defaultValue;
    if (parameter.required) throw new TypeError(`El parámetro ${parameter.label} es obligatorio.`);
    return undefined;
  }
  if (parameter.valueType === 'string') return raw;
  if (parameter.valueType === 'number') {
    const value = Number(raw);
    if (!Number.isFinite(value)) throw new TypeError(`${parameter.label} debe ser numérico.`);
    return value;
  }
  if (parameter.valueType === 'boolean') {
    if (raw === 'true') return true;
    if (raw === 'false') return false;
    throw new TypeError(`${parameter.label} debe ser verdadero o falso.`);
  }
  try {
    const value = JSON.parse(raw) as JsonValue;
    if (parameter.valueType === 'array' && !Array.isArray(value)) {
      throw new TypeError(`${parameter.label} debe ser una lista JSON.`);
    }
    return value;
  } catch (error) {
    if (error instanceof TypeError) throw error;
    throw new TypeError(`${parameter.label} debe contener JSON válido.`);
  }
}

function setAtPath(root: Record<string, JsonValue>, path: readonly string[], value: JsonValue) {
  let current = root;
  for (const segment of path.slice(0, -1)) {
    const child = current[segment];
    if (!isObject(child)) current[segment] = {};
    current = current[segment] as Record<string, JsonValue>;
  }
  current[path.at(-1)!] = value;
}

export function buildDataExplorerInput(
  operation: DataExplorerOperationDescriptor,
  values: Readonly<Record<string, string>>,
): JsonValue {
  const input: Record<string, JsonValue> = {};
  for (const parameter of operation.parameters) {
    const value = parseParameterValue(parameter, values[parameter.name] ?? '');
    if (value !== undefined) setAtPath(input, parameter.inputPath, value);
  }
  return input;
}

function resultPreview(value: JsonValue): JsonValue {
  if (!isObject(value)) return value;
  if (value.data !== undefined && value.data !== null) return value.data;
  if (value.rows !== undefined && value.rows !== null) return value.rows;
  return value;
}

function resultError(value: JsonValue): string | null {
  if (!isObject(value) || value.ok !== false) return null;
  if (isObject(value.error) && typeof value.error.message === 'string') return value.error.message;
  return 'La operación devolvió un error.';
}

export function createDataExplorerService(
  registry: ConnectorRegistry,
  options: {
    readonly now?: () => number;
    readonly maxItems?: number;
    readonly maxDepth?: number;
    readonly maxStringLength?: number;
  } = {},
) {
  const now = options.now ?? (() => performance.now());
  const limits = Object.freeze({
    maxItems: options.maxItems ?? 100,
    maxDepth: options.maxDepth ?? 8,
    maxStringLength: options.maxStringLength ?? 10_000,
  });

  return Object.freeze({
    async listOperations(source: ElectroCraftDataSourceDefinition, environment: ElectroCraftDataSourceEnvironment) {
      return listDataExplorerOperations(source, await registry.listResources(source, environment));
    },
    async execute(request: DataExplorerExecuteRequest): Promise<DataExplorerExecutionResult> {
      if (request.operation.capability !== 'read' && request.mutationConfirmed !== true) {
        throw new DataExplorerMutationConfirmationError(request.operation.id);
      }
      const startedAt = now();
      const traceBase = Object.freeze({
        sourceId: request.source.id,
        environment: request.environment,
        resourceId: request.operation.resourceId,
        operationId: request.operation.id,
        capability: request.operation.capability,
        input: sanitizeDataExplorerValue(request.input),
      });
      try {
        const output =
          request.operation.capability === 'read'
            ? await registry.query(request.source, request.environment, {
                resourceId: request.operation.resourceId,
                input: request.input,
              })
            : await registry.mutate(request.source, request.environment, {
                resourceId: request.operation.resourceId,
                operation: request.operation.capability,
                input: request.input,
              });
        const sanitized = sanitizeDataExplorerValue(output);
        const limited = truncateValue(sanitized, limits);
        const error = resultError(limited.value);
        return Object.freeze({
          status: error ? 'error' : 'success',
          durationMs: Math.max(0, now() - startedAt),
          preview: resultPreview(limited.value),
          trace: Object.freeze({ ...traceBase, output: limited.value }),
          truncated: limited.truncated,
          error,
        });
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : 'No se pudo ejecutar la operación.';
        return Object.freeze({
          status: 'error',
          durationMs: Math.max(0, now() - startedAt),
          preview: null,
          trace: Object.freeze({ ...traceBase, output: null }),
          truncated: false,
          error: sensitiveKeyPattern.test(message) ? 'La operación falló sin exponer datos sensibles.' : message,
        });
      }
    },
  });
}

export function createDataExplorerQueryDraft(request: CreateDataExplorerDraftRequest): ElectroCraftQueryDefinition {
  const dataSchemaRef =
    request.operation.dataSchemaId ?? createDeterministicObjectId('schema', `${request.source.id}:explorer`);
  const modelRef = request.operation.resourceId.startsWith('ec_')
    ? (request.operation.resourceId as ElectroCraftObjectId)
    : createDeterministicObjectId('model', `${request.source.id}:${request.operation.resourceId}`);
  return electroCraftQueryDefinitionSchema.parse({
    schemaVersion: 1,
    id: createDeterministicObjectId('query', request.idSeed),
    version: 1,
    name: `${request.operation.label} — borrador`,
    sourceRef: request.source.id,
    dataSchemaRef,
    modelRef,
    operation: 'list',
    resource: request.operation.resourceId,
    params: request.input,
    conditions: { combinator: 'and', rules: [] },
    sort: [],
    pagination: { mode: 'offset', limit: 50, offset: 0 },
    cache: { policy: 'none', ttlSeconds: 0 },
    metadata: {
      status: 'draft',
      explorerOperationId: request.operation.id,
      requiresSchemaBinding: request.operation.dataSchemaId === null,
    },
  });
}
