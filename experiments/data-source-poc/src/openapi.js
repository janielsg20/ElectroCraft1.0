// @ts-check
const HTTP_METHODS = new Set(['get','put','post','delete','options','head','patch','trace']);

/** @typedef {{operationId:string,method:string,path:string,summary:string,tags:string[],requestBody:boolean}} OpenApiOperation */

/** @param {unknown} document @returns {OpenApiOperation[]} */
export function discoverOpenApiOperations(document) {
  if (!document || typeof document !== 'object' || !('paths' in document) || !document.paths || typeof document.paths !== 'object') return [];
  /** @type {OpenApiOperation[]} */ const operations = [];
  for (const [path, pathItem] of Object.entries(document.paths)) {
    if (!pathItem || typeof pathItem !== 'object') continue;
    for (const [method, operation] of Object.entries(pathItem)) {
      if (!HTTP_METHODS.has(method.toLowerCase()) || !operation || typeof operation !== 'object') continue;
      const op = /** @type {Record<string,unknown>} */ (operation);
      operations.push({
        operationId: typeof op.operationId === 'string' ? op.operationId : `${method.toLowerCase()}_${path.replace(/[^a-zA-Z0-9]+/g,'_').replace(/^_|_$/g,'')}`,
        method:method.toUpperCase(), path,
        summary:typeof op.summary === 'string' ? op.summary : '',
        tags:Array.isArray(op.tags) ? op.tags.map(String) : [],
        requestBody:Boolean(op.requestBody)
      });
    }
  }
  return operations.sort((a,b)=>a.path.localeCompare(b.path)||a.method.localeCompare(b.method));
}

/**
 * Calls the real Scalar OSS parser API. This deliberately does not fall back to JSON.parse:
 * CI must prove the selected package is installed and executable.
 * @param {string|Record<string,unknown>} document
 */
export async function parseOpenApiWithScalar(document) {
  const { validate, dereference } = await import('@scalar/openapi-parser');
  const source = typeof document === 'string' ? document : JSON.stringify(document);
  const validation = await validate(source);
  if (!validation.valid) {
    const message = validation.errors?.map((e)=>e.message).filter(Boolean).join('; ') || 'OpenAPI document is invalid.';
    throw new Error(message);
  }
  const resolved = await dereference(source);
  if (resolved.errors?.length) throw new Error(resolved.errors.map((e)=>e.message).filter(Boolean).join('; ') || 'OpenAPI dereference failed.');
  return resolved.schema;
}
