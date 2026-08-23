import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('M04.6 project backup/import/restore boundaries', () => {
  it('keeps the application contract engine-neutral and validates before storage writes', () => {
    const application = read('packages/application/src/projects/project-backup.ts');
    expect(application).toContain("PROJECT_BACKUP_FORMAT = 'electrocraft-project-backup'");
    expect(application).toContain('PROJECT_BACKUP_VERSION = 1');
    expect(application).toContain('mediaFilesIncluded: false');
    expect(application).toContain('validateProjectBackupPackage(input: unknown)');
    expect(application).toContain('normalizeProjectBackupImportRequest');
    expect(application).not.toContain('@electric-sql/pglite');
    expect(application).not.toContain('drizzle-orm');
  });

  it('uses the existing Drizzle database and one transaction for destructive restore', () => {
    const browser = read('packages/data-web/src/browser.ts');
    const repository = read('packages/data-web/src/project-backup-repository.ts');
    expect(browser).toContain('const db = createWorkerDrizzleDatabase(runtime.client);');
    expect(browser).toContain('repository = createDrizzleProjectRepository(db);');
    expect(browser).toContain('backupRepository = createDrizzleProjectBackupRepository(db);');
    expect(repository).toContain('return db.transaction(async (tx) => {');
    expect(repository).toContain("'pre-import-restore-safety'");
    expect(repository).toContain("request.strategy === 'replace' ? 'backup-restored' : 'backup-imported'");
  });

  it('does not introduce a premature MediaBlobStore or serialize derived field indexes', () => {
    const application = read('packages/application/src/projects/project-backup.ts');
    const repository = read('packages/data-web/src/project-backup-repository.ts');
    expect(application).toContain('mediaFilesIncluded: false');
    expect(application).not.toContain('MediaBlobStore');
    expect(repository).toContain('schema.mediaMetadata');
    expect(repository).not.toContain('recordFieldIndex).values');
  });

  it('keeps PGlite behind the storage runtime and exposes both required UI surfaces', () => {
    const runtime = read('apps/studio/src/features/projects/project-storage-runtime.ts');
    const home = read('apps/studio/src/features/projects/project-home.tsx');
    const settings = read('apps/studio/src/features/projects/storage-settings.tsx');
    const dialog = read('apps/studio/src/features/projects/project-backup-dialog.tsx');
    for (const source of [runtime, home, settings, dialog]) {
      expect(source).not.toContain('@electric-sql/pglite');
      expect(source).not.toContain('drizzle-orm');
    }
    expect(home).toContain('Importar copia');
    expect(home).toContain('Crear copia');
    expect(home).toContain('Restaurar desde copia');
    expect(settings).toContain('Copias de seguridad');
    expect(settings).toContain('Importar copia');
    expect(dialog).toContain('2. Impacto');
    expect(dialog).toContain('Validando formato, versión y checksums');
  });

  it('flushes pending autosave before backup, import and revision restore operations', () => {
    const runtime = read('apps/studio/src/features/projects/project-storage-runtime.ts');
    expect(runtime).toContain('async createBackup(projectId: string)');
    expect(runtime).toContain('async importBackup(request: ProjectBackupImportRequest)');
    expect(runtime).toContain('async restoreRevision(projectId: string, revisionId: string)');
    expect(runtime.match(/await autosave\.flush\(\);/g)?.length ?? 0).toBeGreaterThanOrEqual(4);
  });
});
