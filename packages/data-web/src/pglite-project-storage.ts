import { createHash } from './portable-hash';
import { and, desc, eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/pglite';
import { PGlite } from '@electric-sql/pglite';
import {
  ProjectStorageError,
  type ProjectObjectSearchResult,
  type ProjectStoragePort,
  type ProjectStorageStatus,
  type StoredProjectSummary,
} from '@electrocraft/application';
import {
  electroCraftProjectSnapshotSchema,
  type ElectroCraftObjectId,
  type ElectroCraftProjectSnapshot,
  type JsonValue,
} from '@electrocraft/domain';
import { studioDbMigrations } from './migrations';
import { migrationJournalTable, projectObjectTable, projectRevisionTable, projectTable } from './schema';

export class PGliteProjectStorage implements ProjectStoragePort {
  private readonly db;
  private initialized = false;

  constructor(
    private readonly client: PGlite,
    private status: ProjectStorageStatus,
  ) {
    this.db = drizzle({ client });
  }

  async initialize(): Promise<ProjectStorageStatus> {
    try {
      await this.client.exec(
        `CREATE TABLE IF NOT EXISTS migration_journal (migration_id text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now(), successful boolean NOT NULL DEFAULT true);`,
      );
      for (const migration of studioDbMigrations) {
        const existing = await this.client.query<{ checksum: string }>(
          'SELECT checksum FROM migration_journal WHERE migration_id = $1',
          [migration.id],
        );
        if (existing.rows[0]?.checksum === migration.checksum) continue;
        await this.client.transaction(async (tx) => {
          await tx.exec(migration.sql);
          await tx.query(
            `INSERT INTO migration_journal(migration_id, checksum, successful) VALUES ($1, $2, true)
             ON CONFLICT (migration_id) DO UPDATE SET checksum = EXCLUDED.checksum, applied_at = now(), successful = true`,
            [migration.id, migration.checksum],
          );
        });
      }
      this.initialized = true;
      return this.status;
    } catch (error) {
      this.status = { ...this.status, health: 'blocked', reasonCode: 'MIGRATION_FAILED' };
      throw new ProjectStorageError(
        'PROJECT_STORAGE_INIT_FAILED',
        'No se pudo preparar el almacenamiento local.',
        error,
      );
    }
  }

  getStatus(): ProjectStorageStatus {
    return this.status;
  }

  private assertInitialized() {
    if (!this.initialized)
      throw new ProjectStorageError('PROJECT_STORAGE_INIT_FAILED', 'El almacenamiento no está inicializado.');
  }

  async saveSnapshot(snapshot: ElectroCraftProjectSnapshot): Promise<void> {
    this.assertInitialized();
    const canonical = electroCraftProjectSnapshotSchema.parse(snapshot);
    const projectId = canonical.project.id;
    const projectPayload = canonical.project as unknown as JsonValue;
    const revisionPayload = canonical as unknown as JsonValue;
    const checksum = createHash(JSON.stringify(canonical));
    const revisionId = `${projectId}:${Date.now()}:${checksum.slice(0, 12)}`;

    try {
      await this.db.transaction(async (tx) => {
        await tx
          .insert(projectTable)
          .values({
            id: projectId,
            name: canonical.project.name,
            schemaVersion: canonical.project.schemaVersion,
            projectJson: projectPayload,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: projectTable.id,
            set: {
              name: canonical.project.name,
              schemaVersion: canonical.project.schemaVersion,
              projectJson: projectPayload,
              updatedAt: new Date(),
            },
          });

        await tx.delete(projectObjectTable).where(eq(projectObjectTable.projectId, projectId));
        if (canonical.documents.length > 0) {
          await tx.insert(projectObjectTable).values(
            canonical.documents.map((document) => ({
              projectId,
              objectId: document.id,
              kind: document.kind,
              schemaVersion: document.schemaVersion,
              payload: document as unknown as JsonValue,
              updatedAt: new Date(),
            })),
          );
        }
        await tx.insert(projectRevisionTable).values({
          id: revisionId,
          projectId,
          snapshot: revisionPayload,
          checksum,
        });
      });
    } catch (error) {
      throw new ProjectStorageError('PROJECT_SAVE_FAILED', 'No se pudo guardar el proyecto localmente.', error);
    }
  }

  async openSnapshot(projectId: ElectroCraftObjectId): Promise<ElectroCraftProjectSnapshot | null> {
    this.assertInitialized();
    try {
      const projects = await this.db.select().from(projectTable).where(eq(projectTable.id, projectId)).limit(1);
      if (!projects[0]) return null;
      const documents = await this.db
        .select({ payload: projectObjectTable.payload })
        .from(projectObjectTable)
        .where(eq(projectObjectTable.projectId, projectId));
      return electroCraftProjectSnapshotSchema.parse({
        project: projects[0].projectJson,
        documents: documents.map((row) => row.payload),
      });
    } catch (error) {
      throw new ProjectStorageError('PROJECT_OPEN_FAILED', 'No se pudo abrir el proyecto local.', error);
    }
  }

  async listProjects(): Promise<readonly StoredProjectSummary[]> {
    this.assertInitialized();
    const rows = await this.db.select().from(projectTable).orderBy(desc(projectTable.updatedAt));
    return rows.map((row) => ({
      id: row.id as ElectroCraftObjectId,
      name: row.name,
      schemaVersion: row.schemaVersion,
      updatedAt: row.updatedAt.toISOString(),
    }));
  }

  async deleteProject(projectId: ElectroCraftObjectId): Promise<void> {
    this.assertInitialized();
    await this.db.delete(projectTable).where(eq(projectTable.id, projectId));
  }

  async recoverLatestSnapshot(projectId: ElectroCraftObjectId): Promise<ElectroCraftProjectSnapshot | null> {
    this.assertInitialized();
    try {
      const revisions = await this.db
        .select({ snapshot: projectRevisionTable.snapshot })
        .from(projectRevisionTable)
        .where(eq(projectRevisionTable.projectId, projectId))
        .orderBy(desc(projectRevisionTable.createdAt))
        .limit(1);
      return revisions[0] ? electroCraftProjectSnapshotSchema.parse(revisions[0].snapshot) : null;
    } catch (error) {
      throw new ProjectStorageError('PROJECT_RECOVERY_FAILED', 'No se pudo recuperar la última revisión.', error);
    }
  }

  async searchProjectObjects(
    projectId: ElectroCraftObjectId,
    query: string,
  ): Promise<readonly ProjectObjectSearchResult[]> {
    this.assertInitialized();
    const normalized = query.trim();
    if (!normalized) return [];
    const rows = await this.db
      .select({
        projectId: projectObjectTable.projectId,
        objectId: projectObjectTable.objectId,
        kind: projectObjectTable.kind,
        payload: projectObjectTable.payload,
      })
      .from(projectObjectTable)
      .where(
        and(
          eq(projectObjectTable.projectId, projectId),
          sql`search_document @@ plainto_tsquery('simple', ${normalized})`,
        ),
      );
    return rows as readonly ProjectObjectSearchResult[];
  }
}
