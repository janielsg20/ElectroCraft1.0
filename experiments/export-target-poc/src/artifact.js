// @ts-check
/** @typedef {{target:string,irFingerprint:string,files:Record<string,string>,capability:import('./capabilities.js').CapabilityResult}} CompiledArtifact */

/** @param {string} input */
export function escapePhpSingle(input) {
  return input.replaceAll('\\', '\\\\').replaceAll("'", "\\'");
}

/** @param {string} input */
export function escapeHtml(input) {
  return input.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
}

/** @param {Record<string,string>} files */
export function assertSafeArtifactPaths(files) {
  for (const path of Object.keys(files)) {
    if (!path || path.startsWith('/') || path.includes('..') || path.includes('\\')) throw new Error(`Unsafe artifact path: ${path}`);
  }
  return true;
}
