import {
  M04_1_MIGRATION_CHECKSUM,
  M04_3_MIGRATION_CHECKSUM,
  M04_4_MIGRATION_CHECKSUM,
  M04_6_REFERENTIAL_INTEGRITY_CHECKSUM,
} from './migration';
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
  const result = await client.query<{ schema_version: number; checksum: string }>(
    'SELECT schema_version, checksum FROM storage_migration_journal ORDER BY schema_version',
  );
  const expected = [
    M04_1_MIGRATION_CHECKSUM,
    M04_3_MIGRATION_CHECKSUM,
    M04_4_MIGRATION_CHECKSUM,
    M04_6_REFERENTIAL_INTEGRITY_CHECKSUM,
  ];
  const valid = expected.every(
    (checksum, index) => result.rows[index]?.schema_version === index + 1 && result.rows[index]?.checksum === checksum,
  );
  if (!valid || result.rows.length !== expected.length) {
    throw new Error('storage migration health check failed');
  }
  const checksum = result.rows.at(-1)!.checksum;
  return Object.freeze({
    schemaVersion: STUDIO_STORAGE_SCHEMA_VERSION,
    migrationChecksum: checksum,
  });
}
