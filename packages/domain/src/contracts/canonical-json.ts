function sortCanonicalJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => sortCanonicalJsonValue(item));
  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return Object.fromEntries(
      Object.keys(record)
        .sort()
        .map((key) => [key, sortCanonicalJsonValue(record[key])]),
    );
  }
  return value;
}

export function stableCanonicalStringify(value: unknown): string {
  return JSON.stringify(sortCanonicalJsonValue(value));
}

export function parseCanonicalJson(serialized: string): unknown {
  if (!serialized.trim()) throw new SyntaxError('canonical payload cannot be empty');
  return JSON.parse(serialized) as unknown;
}
