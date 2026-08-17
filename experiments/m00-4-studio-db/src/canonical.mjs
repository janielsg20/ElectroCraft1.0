const encoder = new TextEncoder();

export function stableJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  const entries = Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`);
  return `{${entries.join(",")}}`;
}

export async function checksumCanonical(value) {
  const digest = await globalThis.crypto.subtle.digest("SHA-256", encoder.encode(stableJson(value)));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function canonicalProjectObject({ projectId, objectId, kind, version = 1, payload, updatedAt = new Date() }) {
  if (!projectId || !objectId || !kind) throw new Error("projectId, objectId y kind son obligatorios");
  if (!Number.isInteger(version) || version < 1) throw new Error("version debe ser un entero positivo");
  const normalizedPayload = structuredClone(payload ?? {});
  return {
    projectId,
    objectId,
    kind,
    version,
    payload: normalizedPayload,
    checksum: await checksumCanonical({ kind, version, payload: normalizedPayload }),
    updatedAt,
  };
}
