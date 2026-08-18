// @ts-check
import { DataSourceAdapter, fail, normalizeError, ok } from './contracts.js';
import { assertSecretFreeConfig } from './secret-ref.js';
import { chooseRoute } from './gateway-policy.js';

/** @typedef {{id:string,baseUrl:string,authRef?:unknown,cors?:'direct-safe'|'restricted'|'unknown',forceGateway?:boolean,fetchImpl?:typeof fetch,gatewayUrl?:string}} RestConfig */

/** @extends {DataSourceAdapter<RestConfig>} */
export class RestDataSourceAdapter extends DataSourceAdapter {
  /** @param {RestConfig} config */
  constructor(config) {
    super(config);
    assertSecretFreeConfig(config);
    this.fetchImpl = config.fetchImpl ?? fetch;
  }
  get capabilities() { return /** @type {ReadonlyArray<import('./contracts.js').DataCapability>} */ (['resources','schema','read','write']); }
  async listResources() {
    const resources = /** @type {import('./contracts.js').DataResource[]} */ ([{ id: 'products', label: 'Products', kind: 'rest', capabilities: ['read','write','schema','resources'] }]);
    return ok(resources, this.#meta('list-resources','direct'));
  }
  /** @param {string} resourceId */
  async getSchema(resourceId) {
    if (resourceId !== 'products') return fail({ code:'RESOURCE_NOT_FOUND', message:`Unknown REST resource: ${resourceId}` }, this.#meta('schema','direct'));
    return ok({ id:'products', label:'Products', schema:{ type:'object', required:['name'], properties:{ id:{type:'integer'}, name:{type:'string'} } } }, this.#meta('schema','direct'));
  }
  /** @param {import('./contracts.js').DataOperation} operation */
  async execute(operation) {
    const route = chooseRoute(this.config);
    const started = performance.now();
    const method = operation.kind === 'write' ? 'POST' : 'GET';
    const suffix = operation.kind === 'write' ? '/products' : '/products';
    const target = route.mode === 'gateway' ? `${this.config.gatewayUrl ?? '/gateway/rest'}` : `${this.config.baseUrl}${suffix}`;
    try {
      const response = await this.fetchImpl(target, {
        method,
        headers: { 'content-type': 'application/json', ...(route.mode === 'gateway' ? {'x-electrocraft-source': this.config.id} : {}) },
        body: method === 'POST' ? JSON.stringify(operation.input ?? {}) : undefined
      });
      const payload = await readPayload(response);
      const meta = this.#meta(operation.id, route.mode, response.status, performance.now() - started);
      if (!response.ok) return fail({ code:`HTTP_${response.status}`, message: extractMessage(payload, response.statusText), details: payload }, meta);
      return ok(payload, meta);
    } catch (error) {
      return fail(normalizeError(error, 'REST_TRANSPORT_ERROR'), this.#meta(operation.id, route.mode, undefined, performance.now() - started));
    }
  }
  /** @param {string} operationId @param {'direct'|'gateway'} transport @param {number} [status] @param {number} [durationMs] */
  #meta(operationId, transport, status, durationMs) {
    return { sourceId:this.config.id, operationId, transport, ...(status !== undefined ? {status} : {}), ...(durationMs !== undefined ? {durationMs:Math.round(durationMs*100)/100} : {}) };
  }
}

/** @param {Response} response */
async function readPayload(response) {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) return response.json();
  return response.text();
}
/** @param {unknown} payload @param {string} fallback */
function extractMessage(payload, fallback) {
  if (payload && typeof payload === 'object' && 'message' in payload) return String(payload.message);
  return fallback || 'REST request failed';
}
