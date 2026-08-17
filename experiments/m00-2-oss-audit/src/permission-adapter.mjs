export const canonicalActions = Object.freeze(['view', 'edit', 'delete', 'insert', 'execute']);
const ACTIONS = new Set(canonicalActions);
const SECRET_KEYS = new Set(['apikey', 'api_key', 'token', 'secret', 'password', 'authorization']);
const UNSAFE_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

function isObject(value) { return value !== null && typeof value === 'object'; }

export function hasUnsafePayload(value) {
  if (!isObject(value)) return false;
  if (Array.isArray(value)) return value.some(hasUnsafePayload);
  for (const [key, nested] of Object.entries(value)) {
    if (UNSAFE_KEYS.has(key)) return true;
    if (hasUnsafePayload(nested)) return true;
  }
  return false;
}

export function hasRawSecret(value) {
  if (!isObject(value)) return false;
  if (Array.isArray(value)) return value.some(hasRawSecret);
  for (const [key, nested] of Object.entries(value)) {
    if (SECRET_KEYS.has(key.toLowerCase())) return true;
    if (hasRawSecret(nested)) return true;
  }
  return false;
}

export function sanitizePolicyContext(value) {
  if (!isObject(value)) return value;
  if (Array.isArray(value)) return value.map(sanitizePolicyContext);
  const clean = Object.create(null);
  for (const [key, nested] of Object.entries(value)) {
    if (UNSAFE_KEYS.has(key) || SECRET_KEYS.has(key.toLowerCase())) continue;
    clean[key] = sanitizePolicyContext(nested);
  }
  return clean;
}

export function authorize({ action, roleAllows = false, engineAllows = false, secretRef, payload }) {
  if (!ACTIONS.has(action)) return { allowed: false, action, reason: 'unknown-action' };
  if (hasUnsafePayload(payload)) return { allowed: false, action, reason: 'unsafe-payload-key' };
  if (hasRawSecret(payload)) return { allowed: false, action, reason: 'raw-secret-rejected' };
  if (secretRef !== undefined && !/^secret:[a-z0-9][a-z0-9._-]*$/i.test(secretRef)) {
    return { allowed: false, action, reason: 'invalid-secret-ref' };
  }
  if (!roleAllows) return { allowed: false, action, reason: 'role-deny' };
  if (!engineAllows) return { allowed: false, action, reason: 'engine-deny' };
  return { allowed: true, action, reason: 'allowed' };
}

export function createPermissionAdapter({ can }) {
  if (typeof can !== 'function') throw new TypeError('can must be a function');
  return {
    async decide(action, subject, context = {}) {
      if (!ACTIONS.has(action) || !subject) return { allowed: false, reason: 'invalid-request' };
      if (hasUnsafePayload(context)) return { allowed: false, reason: 'unsafe-payload-key' };
      try {
        const result = await can({ action, subject, context: sanitizePolicyContext(context) });
        if (result === true) return { allowed: true, reason: 'policy-allow' };
        if (result && typeof result === 'object' && result.allowed === true) {
          return { allowed: true, reason: result.reason || 'policy-allow' };
        }
        return { allowed: false, reason: (result && result.reason) || 'policy-deny' };
      } catch {
        return { allowed: false, reason: 'policy-error' };
      }
    },
  };
}
