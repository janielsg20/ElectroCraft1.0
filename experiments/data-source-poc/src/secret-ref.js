// @ts-check

/** @typedef {{secretRef:string}} SecretRef */

/** @param {string} id @returns {SecretRef} */
export function secretRef(id) {
  if (!/^[a-zA-Z0-9._:-]{2,128}$/.test(id)) throw new Error('Invalid SecretRef id');
  return Object.freeze({ secretRef: id });
}

/** @param {unknown} value @returns {value is SecretRef} */
export function isSecretRef(value) {
  return Boolean(value && typeof value === 'object' && 'secretRef' in value && typeof value.secretRef === 'string');
}

/**
 * Rejects accidental secret material in project/source configuration. SecretRef identifiers are allowed.
 * @param {unknown} value
 * @param {string[]} [path]
 */
export function assertSecretFreeConfig(value, path = []) {
  const sensitive = /(api[-_]?key|token|password|secretValue|authorizationValue|bearerValue)/i;
  if (!value || typeof value !== 'object') return;
  if (isSecretRef(value)) return;
  for (const [key, child] of Object.entries(value)) {
    if (sensitive.test(key) && typeof child === 'string' && child.length > 0) {
      throw new Error(`Secret material is forbidden at ${[...path, key].join('.')}`);
    }
    assertSecretFreeConfig(child, [...path, key]);
  }
}
