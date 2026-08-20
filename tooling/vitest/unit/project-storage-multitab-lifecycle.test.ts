import { describe, expect, it, vi } from 'vitest';
import {
  M04_1_MIGRATION_CHECKSUM,
  STUDIO_STORAGE_SCHEMA_VERSION,
  verifyStudioStorageHealth,
} from '@electrocraft/data-web';

describe('M04.2 storage lifecycle health', () => {
  it('accepts the current migration journal after the database responds', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [{ healthy: 1 }] })
      .mockResolvedValueOnce({ rows: [{ checksum: M04_1_MIGRATION_CHECKSUM }] });

    await expect(verifyStudioStorageHealth({ query })).resolves.toEqual({
      schemaVersion: STUDIO_STORAGE_SCHEMA_VERSION,
      migrationChecksum: M04_1_MIGRATION_CHECKSUM,
    });
    expect(query).toHaveBeenCalledTimes(2);
  });

  it('fails closed when the migration journal does not match the active schema', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [{ healthy: 1 }] })
      .mockResolvedValueOnce({ rows: [{ checksum: 'unexpected' }] });

    await expect(verifyStudioStorageHealth({ query })).rejects.toThrow('storage migration health check failed');
  });
});
