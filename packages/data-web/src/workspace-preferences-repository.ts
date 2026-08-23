import type { WorkspacePreferences, WorkspacePreferencesStoragePort } from '@electrocraft/application';
import type { JsonValue } from '@electrocraft/domain';
import { and, eq } from 'drizzle-orm';
import type { StudioProjectDatabase } from './repository';
import { workspacePreferences } from './schema';

export interface DrizzleWorkspacePreferencesRepository extends WorkspacePreferencesStoragePort {}

export function createDrizzleWorkspacePreferencesRepository(
  db: StudioProjectDatabase,
): DrizzleWorkspacePreferencesRepository {
  return Object.freeze({
    async read(workspaceId: string, key: string): Promise<unknown | null> {
      const rows = await db
        .select({ value: workspacePreferences.value })
        .from(workspacePreferences)
        .where(and(eq(workspacePreferences.workspaceId, workspaceId), eq(workspacePreferences.key, key)))
        .limit(1);
      return rows[0]?.value ?? null;
    },

    async write(workspaceId: string, key: string, value: WorkspacePreferences): Promise<void> {
      await db.transaction(async (tx) => {
        await tx
          .insert(workspacePreferences)
          .values({
            workspaceId,
            key,
            value: value as unknown as JsonValue,
            updatedAt: new Date(value.updatedAt),
          })
          .onConflictDoUpdate({
            target: [workspacePreferences.workspaceId, workspacePreferences.key],
            set: {
              value: value as unknown as JsonValue,
              updatedAt: new Date(value.updatedAt),
            },
          });
      });
    },
  });
}
