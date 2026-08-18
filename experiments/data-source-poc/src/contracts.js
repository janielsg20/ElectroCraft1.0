// @ts-check

/** @typedef {'read'|'write'|'schema'|'resources'} DataCapability */
/** @typedef {{code:string,message:string,details?:unknown}} DataError */
/** @typedef {{cursor?:string|null,hasNextPage?:boolean,total?:number}} PageInfo */
/** @typedef {{sourceId:string,operationId:string,transport:'direct'|'gateway',status?:number,durationMs?:number}} DataMeta */
/** @template T @typedef {{data:T|null,errors:DataError[],pageInfo:PageInfo|null,meta:DataMeta}} DataResult */
/** @typedef {{id:string,label:string,kind:'rest'|'graphql',capabilities:ReadonlyArray<DataCapability>}} DataResource */
/** @typedef {{id:string,kind:'read'|'write',resourceId:string,input?:Record<string,unknown>}} DataOperation */
/** @typedef {{id:string,label:string,schema:unknown}} ResourceSchema */

/**
 * @template TConfig
 * @interface
 */
export class DataSourceAdapter {
  /** @param {TConfig} config */
  constructor(config) { this.config = config; }
  /** @returns {ReadonlyArray<DataCapability>} */
  get capabilities() { throw new Error('Not implemented'); }
  /** @returns {Promise<DataResult<DataResource[]>>} */
  async listResources() { throw new Error('Not implemented'); }
  /** @param {string} _resourceId @returns {Promise<DataResult<ResourceSchema>>} */
  async getSchema(_resourceId) { throw new Error('Not implemented'); }
  /** @param {DataOperation} _operation @returns {Promise<DataResult<unknown>>} */
  async execute(_operation) { throw new Error('Not implemented'); }
}

/** @template T @param {T} data @param {DataMeta} meta @param {PageInfo|null} [pageInfo] @returns {DataResult<T>} */
export function ok(data, meta, pageInfo = null) {
  return { data, errors: [], pageInfo, meta };
}

/** @template T @param {DataError|DataError[]} errors @param {DataMeta} meta @returns {DataResult<T>} */
export function fail(errors, meta) {
  return { data: null, errors: Array.isArray(errors) ? errors : [errors], pageInfo: null, meta };
}

/** @param {unknown} error @param {string} [fallbackCode] @returns {DataError} */
export function normalizeError(error, fallbackCode = 'DATA_SOURCE_ERROR') {
  if (error && typeof error === 'object' && 'message' in error) {
    return { code: fallbackCode, message: String(error.message) };
  }
  return { code: fallbackCode, message: String(error) };
}
