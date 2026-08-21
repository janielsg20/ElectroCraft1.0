import { M04_4_MIGRATION_CHECKSUM } from './migration';
import { STUDIO_STORAGE_SCHEMA_VERSION } from './schema-contract';

export interface StudioStorageHealthClient {
  query<T extends Record<string, unknown>>(query: string, params?: unknown[]): Promise<{ rows: T[] }>;
}

export interface StudioStorageHealth {
  readonly schemaVersion: number;
  readonly migrationChecksum: string;
}

export async function verifyStudioStorageHealth(client: StudioStorageHealthClient): Promise<StudioStorageHealth> {
  await client.query('SELECT 1 AS healthy');
  const result = await client.query<{ checksum: string }>(
    'SELECT checksum FROM storage_migration_journal WHERE schema_version = $1',
    [STUDIO_STORAGE_SCHEMA_VERSION],
  );
  const checksum = result.rows[0]?.checksum;
  if (checksum !== M04_4_MIGRATION_CHECKSUM) {
    throw new Error('storage migration health check failed');
  }
  return Object.freeze({
    schemaVersion: STUDIO_STORAGE_SCHEMA_VERSION,
    migrationChecksum: checksum,
  });
}
