import { describe, expect, it } from 'vitest';
import {
  M04_3_MIGRATION_CHECKSUM,
  STUDIO_STORAGE_SCHEMA_VERSION,
  verifyStudioStorageHealth,
} from '@electrocraft/data-web';

function createHealthClient(checksum: string) {
  let calls = 0;
  return {
    get calls() {
      return calls;
    },
    async query<T extends Record<string, unknown>>(query: string): Promise<{ rows: T[] }> {
      calls += 1;
      if (query.startsWith('SELECT 1')) {
        return { rows: [{ healthy: 1 } as unknown as T] };
      }
      return { rows: [{ checksum } as unknown as T] };
    },
  };
}

describe('M04.2 storage lifecycle health', () => {
  it('accepts the current migration journal after the database responds', async () => {
    const client = createHealthClient(M04_3_MIGRATION_CHECKSUM);

    await expect(verifyStudioStorageHealth(client)).resolves.toEqual({
      schemaVersion: STUDIO_STORAGE_SCHEMA_VERSION,
      migrationChecksum: M04_3_MIGRATION_CHECKSUM,
    });
    expect(client.calls).toBe(2);
  });

  it('fails closed when the migration journal does not match the active schema', async () => {
    const client = createHealthClient('unexpected');

    await expect(verifyStudioStorageHealth(client)).rejects.toThrow('storage migration health check failed');
  });
});
