// @ts-check
import { DataSourceAdapter, fail, normalizeError, ok } from './contracts.js';
import { assertSecretFreeConfig } from './secret-ref.js';
import { chooseRoute } from './gateway-policy.js';

/** @typedef {{id:string,endpoint:string,authRef?:unknown,cors?:'direct-safe'|'restricted'|'unknown',forceGateway?:boolean,fetchImpl?:typeof fetch,gatewayUrl?:string,supportsMutation?:boolean}} GraphqlConfig */

/** @extends {DataSourceAdapter<GraphqlConfig>} */
export class GraphqlDataSourceAdapter extends DataSourceAdapter {
  /** @param {GraphqlConfig} config */
  constructor(config) {
    super(config);
    assertSecretFreeConfig(config);
    this.fetchImpl = config.fetchImpl ?? fetch;
  }
  get capabilities() {
    return this.config.supportsMutation === false ? /** @type {ReadonlyArray<import('./contracts.js').DataCapability>} */ (['resources','schema','read']) : /** @type {ReadonlyArray<import('./contracts.js').DataCapability>} */ (['resources','schema','read','write']);
  }
  async listResources() {
    const resources = /** @type {import('./contracts.js').DataResource[]} */ ([{ id:'graphql', label:'GraphQL endpoint', kind:'graphql', capabilities:[...this.capabilities] }]);
    return ok(resources, this.#meta('list-resources','direct'));
  }
  /** @param {string} resourceId */
  async getSchema(resourceId) {
    if (resourceId !== 'graphql') return fail({code:'RESOURCE_NOT_FOUND',message:`Unknown GraphQL resource: ${resourceId}`}, this.#meta('schema','direct'));
    return ok({ id:'graphql', label:'GraphQL endpoint', schema:{ protocol:'GraphQL', introspection:'fixture-owned' } }, this.#meta('schema','direct'));
  }
  /** @param {import('./contracts.js').DataOperation} operation */
  async execute(operation) {
    if (operation.kind === 'write' && !this.capabilities.includes('write')) {
      return fail({ code:'UNSUPPORTED_CAPABILITY', message:'Mutation is not supported by this source.' }, this.#meta(operation.id,'direct'));
    }
    const query = String(operation.input?.query ?? '');
    const variables = isRecord(operation.input?.variables) ? operation.input.variables : {};
    if (!query.trim()) return fail({code:'GRAPHQL_QUERY_REQUIRED',message:'GraphQL query is required.'}, this.#meta(operation.id,'direct'));
    const route = chooseRoute(this.config);
    const target = route.mode === 'gateway' ? (this.config.gatewayUrl ?? '/gateway/graphql') : this.config.endpoint;
    const started = performance.now();
    try {
      const response = await this.fetchImpl(target, {
        method:'POST',
        headers:{'content-type':'application/json', ...(route.mode === 'gateway' ? {'x-electrocraft-source':this.config.id} : {})},
        body:JSON.stringify({query,variables,operationName:operation.input?.operationName ?? undefined})
      });
      const payload = await response.json();
      const meta = this.#meta(operation.id,route.mode,response.status,performance.now()-started);
      if (!response.ok) return fail({code:`HTTP_${response.status}`,message:'GraphQL transport failed.',details:payload},meta);
      if (isRecord(payload) && Array.isArray(payload.errors) && payload.errors.length) {
        return { data:'data' in payload ? payload.data : null, errors:payload.errors.map((/** @type {any} */ e)=>({code:'GRAPHQL_ERROR',message:String(e?.message ?? 'GraphQL error'),details:e})), pageInfo:null, meta };
      }
      return ok(isRecord(payload) && 'data' in payload ? payload.data : payload,meta);
    } catch (error) {
      return fail(normalizeError(error,'GRAPHQL_TRANSPORT_ERROR'),this.#meta(operation.id,route.mode,undefined,performance.now()-started));
    }
  }
  /** @param {string} operationId @param {'direct'|'gateway'} transport @param {number} [status] @param {number} [durationMs] */
  #meta(operationId, transport, status, durationMs) {
    return { sourceId:this.config.id, operationId, transport, ...(status !== undefined ? {status} : {}), ...(durationMs !== undefined ? {durationMs:Math.round(durationMs*100)/100} : {}) };
  }
}
/** @param {unknown} value @returns {value is Record<string,unknown>} */
function isRecord(value){ return Boolean(value && typeof value === 'object' && !Array.isArray(value)); }
