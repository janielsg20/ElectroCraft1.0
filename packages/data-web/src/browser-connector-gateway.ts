import type {
  ConnectorGatewayGraphQLExecutionRequest,
  ConnectorGatewayPort,
  ConnectorGatewayRestExecutionRequest,
  ConnectorGatewayStatus,
  SecretStoreAdminPort,
  SecretStoreStatus,
  SecretStoreWriteRequest,
} from '@electrocraft/application';
import type {
  ElectroCraftGraphQLDataResult,
  ElectroCraftRestDataResult,
  ElectroCraftSecretEnvironment,
  ElectroCraftSecretRef,
} from '@electrocraft/domain';

export class BrowserConnectorGatewayError extends Error {
  constructor(
    readonly code: 'GATEWAY_NOT_CONFIGURED' | 'GATEWAY_HTTP_ERROR' | 'GATEWAY_RESPONSE_INVALID',
    message: string,
  ) {
    super(message);
    this.name = 'BrowserConnectorGatewayError';
  }
}

export interface BrowserConnectorGatewayOptions {
  readonly baseUrl: string;
  readonly fetch?: typeof globalThis.fetch;
}

function normalizeBaseUrl(value: string) {
  const trimmed = value.trim().replace(/\/+$/, '');
  if (!trimmed) throw new BrowserConnectorGatewayError('GATEWAY_NOT_CONFIGURED', 'Falta configurar ConnectorGateway.');
  const url = new URL(trimmed);
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new BrowserConnectorGatewayError('GATEWAY_NOT_CONFIGURED', 'ConnectorGateway debe usar HTTP(S).');
  }
  return url.toString().replace(/\/+$/, '');
}

async function readJson<T>(response: Response): Promise<T> {
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'error' in payload && payload.error && typeof payload.error === 'object' &&
      'message' in payload.error && typeof payload.error.message === 'string'
        ? payload.error.message
        : `ConnectorGateway respondió HTTP ${response.status}.`;
    throw new BrowserConnectorGatewayError('GATEWAY_HTTP_ERROR', message);
  }
  if (payload === null || payload === undefined) {
    throw new BrowserConnectorGatewayError('GATEWAY_RESPONSE_INVALID', 'ConnectorGateway devolvió una respuesta vacía.');
  }
  return payload as T;
}

export class BrowserConnectorGateway implements ConnectorGatewayPort {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof globalThis.fetch;

  constructor(options: BrowserConnectorGatewayOptions) {
    this.baseUrl = normalizeBaseUrl(options.baseUrl);
    this.fetchImpl = options.fetch ?? globalThis.fetch;
  }

  private request<T>(path: string, body?: unknown) {
    return this.fetchImpl(`${this.baseUrl}${path}`, {
      method: body === undefined ? 'GET' : 'POST',
      headers: body === undefined ? undefined : { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    }).then((response) => readJson<T>(response));
  }

  status(): Promise<ConnectorGatewayStatus> {
    return this.request('/status');
  }

  executeRest(request: ConnectorGatewayRestExecutionRequest): Promise<ElectroCraftRestDataResult> {
    return this.request('/execute', request);
  }

  executeGraphQL(request: ConnectorGatewayGraphQLExecutionRequest): Promise<ElectroCraftGraphQLDataResult> {
    return this.request('/execute', request);
  }
}

export class BrowserSecretStoreAdmin implements SecretStoreAdminPort {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof globalThis.fetch;

  constructor(options: BrowserConnectorGatewayOptions) {
    this.baseUrl = normalizeBaseUrl(options.baseUrl);
    this.fetchImpl = options.fetch ?? globalThis.fetch;
  }

  private request<T>(path: string, body: unknown) {
    return this.fetchImpl(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }).then((response) => readJson<T>(response));
  }

  write(request: SecretStoreWriteRequest): Promise<SecretStoreStatus> {
    return this.request('/secrets/write', request);
  }

  status(ref: ElectroCraftSecretRef, environment: ElectroCraftSecretEnvironment): Promise<SecretStoreStatus> {
    return this.request('/secrets/status', { ref, environment });
  }

  async remove(ref: ElectroCraftSecretRef, environment: ElectroCraftSecretEnvironment) {
    await this.request('/secrets/remove', { ref, environment });
  }
}

export function createBrowserConnectorGateway(options: BrowserConnectorGatewayOptions) {
  return new BrowserConnectorGateway(options);
}

export function createBrowserSecretStoreAdmin(options: BrowserConnectorGatewayOptions) {
  return new BrowserSecretStoreAdmin(options);
}
