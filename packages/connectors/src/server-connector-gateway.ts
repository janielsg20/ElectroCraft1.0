import type {
  ConnectorGatewayGraphQLExecutionRequest,
  ConnectorGatewayPort,
  ConnectorGatewayRestExecutionRequest,
  ConnectorGatewayStatus,
  SecretStorePort,
} from '@electrocraft/application';
import {
  resolveSecretEnvironment,
  type ElectroCraftGraphQLDataResult,
  type ElectroCraftGraphQLError,
  type ElectroCraftRestDataResult,
  type ElectroCraftSecretRef,
  type JsonValue,
} from '@electrocraft/domain';

export class ConnectorGatewayError extends Error {
  constructor(
    readonly code:
      | 'SECRET_REF_NOT_FOUND'
      | 'SECRET_VALUE_MISSING'
      | 'GATEWAY_FETCH_FAILED'
      | 'GATEWAY_RESPONSE_INVALID',
    message: string,
  ) {
    super(message);
    this.name = 'ConnectorGatewayError';
  }
}

export interface ServerConnectorGatewayOptions {
  readonly secretStore: SecretStorePort;
  readonly resolveSecretRef: (refId: string) => ElectroCraftSecretRef | null | Promise<ElectroCraftSecretRef | null>;
  readonly fetch?: typeof globalThis.fetch;
  readonly provider?: string;
}

function errorCode(status: number) {
  if (status >= 500) return 'HTTP_5XX';
  if (status >= 400) return 'HTTP_4XX';
  return 'HTTP_ERROR';
}

async function responseData(response: Response): Promise<JsonValue | null> {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  if ((response.headers.get('content-type') ?? '').includes('json')) {
    try {
      return JSON.parse(text) as JsonValue;
    } catch {
      return text;
    }
  }
  return text;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && !Array.isArray(value) && typeof value === 'object';
}

function graphQLErrors(value: unknown): readonly ElectroCraftGraphQLError[] {
  if (!Array.isArray(value)) return Object.freeze([]);
  return Object.freeze(
    value.flatMap((entry) => {
      if (!isObject(entry) || typeof entry.message !== 'string') return [];
      const path = Array.isArray(entry.path)
        ? entry.path.filter((segment): segment is string | number => typeof segment === 'string' || typeof segment === 'number')
        : null;
      return [Object.freeze({ message: entry.message, path: path ? Object.freeze(path) : null })];
    }),
  );
}

async function withTimeout<T>(timeoutMs: number, run: (signal: AbortSignal) => Promise<T>) {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await run(controller.signal);
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

export class ServerConnectorGateway implements ConnectorGatewayPort {
  private readonly fetchImpl: typeof globalThis.fetch;
  private readonly provider: string;

  constructor(private readonly options: ServerConnectorGatewayOptions) {
    this.fetchImpl = options.fetch ?? globalThis.fetch;
    this.provider = options.provider ?? 'electrocraft-server';
  }

  async status(): Promise<ConnectorGatewayStatus> {
    return Object.freeze({ configured: true, provider: this.provider, message: 'Gateway de conectores configurado.' });
  }

  private async applySecret(
    authRef: string | null,
    environment: ConnectorGatewayRestExecutionRequest['environment'],
    url: string,
    headersInput: Readonly<Record<string, string>>,
  ) {
    const headers: Record<string, string> = { ...headersInput };
    if (!authRef) return Object.freeze({ url, headers: Object.freeze(headers) });

    const ref = await this.options.resolveSecretRef(authRef);
    if (!ref) {
      throw new ConnectorGatewayError('SECRET_REF_NOT_FOUND', 'La referencia de secreto no está registrada en el Gateway.');
    }
    const secretEnvironment = resolveSecretEnvironment(environment);
    const value = await this.options.secretStore.resolve(ref, secretEnvironment);
    if (!value) {
      throw new ConnectorGatewayError(
        'SECRET_VALUE_MISSING',
        `Falta configuración para ${ref.label} en ${secretEnvironment}.`,
      );
    }

    if (ref.binding.kind === 'bearer') {
      headers[ref.binding.headerName] = `${ref.binding.scheme} ${value}`;
      return Object.freeze({ url, headers: Object.freeze(headers) });
    }
    if (ref.binding.kind === 'header') {
      headers[ref.binding.headerName] = `${ref.binding.prefix}${value}`;
      return Object.freeze({ url, headers: Object.freeze(headers) });
    }
    const nextUrl = new URL(url);
    nextUrl.searchParams.set(ref.binding.queryName, value);
    return Object.freeze({ url: nextUrl.toString(), headers: Object.freeze(headers) });
  }

  async executeRest(request: ConnectorGatewayRestExecutionRequest): Promise<ElectroCraftRestDataResult> {
    const authorized = await this.applySecret(request.authRef, request.environment, request.url, request.headers);
    try {
      return await withTimeout(request.timeoutMs, async (signal) => {
        const response = await this.fetchImpl(authorized.url, {
          method: request.method,
          headers: authorized.headers,
          body: request.body === null ? undefined : JSON.stringify(request.body),
          signal,
        });
        const data = await responseData(response);
        return Object.freeze({
          ok: response.ok,
          status: response.status,
          data,
          pagination: null,
          error: response.ok
            ? null
            : Object.freeze({ code: errorCode(response.status), message: `La API respondió HTTP ${response.status}.` }),
          transport: 'gateway' as const,
        });
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return Object.freeze({
          ok: false,
          status: null,
          data: null,
          pagination: null,
          error: Object.freeze({ code: 'TIMEOUT', message: `La solicitud excedió ${request.timeoutMs} ms.` }),
          transport: 'gateway' as const,
        });
      }
      if (error instanceof ConnectorGatewayError) throw error;
      throw new ConnectorGatewayError('GATEWAY_FETCH_FAILED', 'ConnectorGateway no pudo ejecutar la solicitud REST.');
    }
  }

  async executeGraphQL(request: ConnectorGatewayGraphQLExecutionRequest): Promise<ElectroCraftGraphQLDataResult> {
    const authorized = await this.applySecret(request.authRef, request.environment, request.endpoint, request.headers);
    try {
      return await withTimeout(request.timeoutMs, async (signal) => {
        const response = await this.fetchImpl(authorized.url, {
          method: 'POST',
          headers: authorized.headers,
          body: JSON.stringify({ query: request.document, variables: request.variables }),
          signal,
        });
        const payload = await responseData(response);
        if (response.ok && !isObject(payload)) {
          throw new ConnectorGatewayError(
            'GATEWAY_RESPONSE_INVALID',
            'GraphQL devolvió una respuesta que no es un objeto JSON.',
          );
        }
        const payloadObject = isObject(payload) ? payload : {};
        const errors = graphQLErrors(payloadObject.errors);
        const data = (payloadObject.data ?? null) as JsonValue | null;
        const ok = response.ok && errors.length === 0;
        return Object.freeze({
          ok,
          status: response.status,
          data,
          errors,
          error: !response.ok
            ? Object.freeze({ code: errorCode(response.status), message: `GraphQL respondió HTTP ${response.status}.` })
            : errors.length > 0
              ? Object.freeze({ code: 'GRAPHQL_ERROR', message: errors[0]?.message ?? 'GraphQL devolvió errores.' })
              : null,
          transport: 'gateway' as const,
        });
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return Object.freeze({
          ok: false,
          status: null,
          data: null,
          errors: Object.freeze([]),
          error: Object.freeze({ code: 'TIMEOUT', message: `La solicitud excedió ${request.timeoutMs} ms.` }),
          transport: 'gateway' as const,
        });
      }
      if (error instanceof ConnectorGatewayError) throw error;
      throw new ConnectorGatewayError('GATEWAY_FETCH_FAILED', 'ConnectorGateway no pudo ejecutar la solicitud GraphQL.');
    }
  }
}

export function createServerConnectorGateway(options: ServerConnectorGatewayOptions) {
  return new ServerConnectorGateway(options);
}
