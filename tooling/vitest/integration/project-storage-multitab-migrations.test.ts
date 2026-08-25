import { afterEach, describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import {
  M04_1_MIGRATION_CHECKSUM,
  M04_3_MIGRATION_CHECKSUM,
  M04_4_MIGRATION_CHECKSUM,
  M04_6_REFERENTIAL_INTEGRITY_CHECKSUM,
  M04_8_REVISION_STORE_CHECKSUM,
  STUDIO_STORAGE_SCHEMA_VERSION,
  applyStudioStorageMigrations,
  verifyStudioStorageHealth,
} from '@electrocraft/data-web';

const clients: PGlite[] = [];

afterEach(async () => {
  await Promise.all(clients.splice(0).map((client) => client.close()));
});

describe('M04.2 migration lifecycle with real PGlite', () => {
  it('runs migrations idempotently and reports the current schema healthy', async () => {
    const client = await PGlite.create('memory://');
    clients.push(client);

    await applyStudioStorageMigrations(client);
    await applyStudioStorageMigrations(client);

    await expect(verifyStudioStorageHealth(client)).resolves.toEqual({
      schemaVersion: STUDIO_STORAGE_SCHEMA_VERSION,
      migrationChecksum: M04_8_REVISION_STORE_CHECKSUM,
    });

    const journal = await client.query<{ schema_version: number; checksum: string }>(
      'SELECT schema_version, checksum FROM storage_migration_journal ORDER BY schema_version',
    );
    expect(journal.rows).toEqual([
      { schema_version: 1, checksum: M04_1_MIGRATION_CHECKSUM },
      { schema_version: 2, checksum: M04_3_MIGRATION_CHECKSUM },
      { schema_version: 3, checksum: M04_4_MIGRATION_CHECKSUM },
      { schema_version: 4, checksum: M04_6_REFERENTIAL_INTEGRITY_CHECKSUM },
      { schema_version: STUDIO_STORAGE_SCHEMA_VERSION, checksum: M04_8_REVISION_STORE_CHECKSUM },
    ]);
  });

  it('fails closed when the persisted migration journal is corrupted', async () => {
    const client = await PGlite.create('memory://');
    clients.push(client);
    await applyStudioStorageMigrations(client);
    await client.query('UPDATE storage_migration_journal SET checksum = $1 WHERE schema_version = $2', [
      'corrupted-checksum',
      STUDIO_STORAGE_SCHEMA_VERSION,
    ]);

    await expect(verifyStudioStorageHealth(client)).rejects.toThrow('storage migration health check failed');
  });
});
