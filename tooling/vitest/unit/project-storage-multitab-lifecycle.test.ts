import { describe, expect, it } from 'vitest';
import {
  M04_1_MIGRATION_CHECKSUM,
  M04_3_MIGRATION_CHECKSUM,
  M04_4_MIGRATION_CHECKSUM,
  M04_6_REFERENTIAL_INTEGRITY_CHECKSUM,
  M04_8_REVISION_STORE_CHECKSUM,
  M08_10_TAXONOMY_TERMS_CHECKSUM,
  M08_12_RECORD_SOFT_DELETE_CHECKSUM,
  M08_13_GENERIC_FIELD_INDEX_CHECKSUM,
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
      return {
        rows: [
          M04_1_MIGRATION_CHECKSUM,
          M04_3_MIGRATION_CHECKSUM,
          M04_4_MIGRATION_CHECKSUM,
          M04_6_REFERENTIAL_INTEGRITY_CHECKSUM,
          M04_8_REVISION_STORE_CHECKSUM,
          M08_10_TAXONOMY_TERMS_CHECKSUM,
          M08_12_RECORD_SOFT_DELETE_CHECKSUM,
          checksum,
        ].map(
          (migrationChecksum, index) => ({ schema_version: index + 1, checksum: migrationChecksum }) as unknown as T,
        ),
      };
    },
  };
}

describe('M04.2 storage lifecycle health', () => {
  it('accepts the current migration journal after the database responds', async () => {
    const client = createHealthClient(M08_13_GENERIC_FIELD_INDEX_CHECKSUM);

    await expect(verifyStudioStorageHealth(client)).resolves.toEqual({
      schemaVersion: STUDIO_STORAGE_SCHEMA_VERSION,
      migrationChecksum: M08_13_GENERIC_FIELD_INDEX_CHECKSUM,
    });
    expect(client.calls).toBe(2);
  });

  it('fails closed when the migration journal does not match the active schema', async () => {
    const client = createHealthClient('unexpected');

    await expect(verifyStudioStorageHealth(client)).rejects.toThrow('storage migration health check failed');
  });
});
