import {
  createElectroCraftCanonicalSnapshotChecksum,
  type ElectroCraftCanonicalSnapshotChecksum,
  type ElectroCraftMetadata,
} from '@electrocraft/domain';
import {
  PROJECT_STORAGE_SCHEMA_VERSION,
  normalizeSaveProjectRequest,
  normalizeStoredProjectObject,
  type NormalizedSaveProjectRequest,
  type OpenProjectResult,
  type ProjectStoragePort,
  type ProjectStorageRevision,
  type StoredProjectDefinition,
  type StoredProjectObjectInput,
} from './project-storage';

export const PROJECT_BACKUP_FORMAT = 'electrocraft-project-backup' as const;
export const PROJECT_BACKUP_FORMAT_VERSION = 1 as const;

export type ProjectBackupImportMode = 'reject-collision' | 'import-as-copy' | 'replace-existing';

export interface ProjectBackupMediaEntry {
  readonly mediaId: string;
  readonly metadata: ElectroCraftMetadata;
  readonly fileName?: string;
  readonly mimeType?: string;
  readonly contentBase64?: string;
  readonly checksum?: ElectroCraftCanonicalSnapshotChecksum;
}

export interface ProjectBackupManifest {
  readonly format: typeof PROJECT_BACKUP_FORMAT;
  readonly formatVersion: typeof PROJECT_BACKUP_FORMAT_VERSION;
  readonly storageSchemaVersion: typeof PROJECT_STORAGE_SCHEMA_VERSION;
  readonly projectId: string;
  readonly createdAt: string;
  readonly objectCount: number;
  readonly mediaCount: number;
}

export interface ProjectBackupSnapshot {
  readonly project: StoredProjectDefinition;
  readonly objects: readonly StoredProjectObjectInput[];
}

export interface ProjectBackupPackage {
  readonly manifest: ProjectBackupManifest;
  readonly snapshot: ProjectBackupSnapshot;
  readonly media: readonly ProjectBackupMediaEntry[];
  readonly checksum: ElectroCraftCanonicalSnapshotChecksum;
}

export interface ImportProjectBackupOptions {
  readonly mode?: ProjectBackupImportMode;
  readonly targetProjectId?: string;
  readonly name?: string;
}

export interface ProjectBackupImportResult {
  readonly sourceProjectId: string;
  readonly projectId: string;
  readonly mode: ProjectBackupImportMode;
  readonly revisionId: string;
  readonly safetyRevisionId: string | null;
}

export interface ProjectBackupPersistenceRequest {
  readonly mode: ProjectBackupImportMode;
  readonly saveRequest: NormalizedSaveProjectRequest;
  readonly media: readonly ProjectBackupMediaEntry[];
  readonly createSafetyCheckpoint: boolean;
}

export interface ProjectBackupPersistenceResult {
  readonly revision: ProjectStorageRevision;
  readonly safetyRevisionId: string | null;
}

export interface ProjectBackupStoragePort {
  listProjectBackupMedia(projectId: string): Promise<readonly ProjectBackupMediaEntry[]>;
  importProjectBackupSnapshot(request: ProjectBackupPersistenceRequest): Promise<ProjectBackupPersistenceResult>;
}

function requireNonEmpty(value: string, field: string) {
  const normalized = value.trim();
  if (!normalized) throw new TypeError(`${field} must not be empty`);
  return normalized;
}

function backupPayload(input: Omit<ProjectBackupPackage, 'checksum'>) {
  return Object.freeze({
    manifest: input.manifest,
    snapshot: input.snapshot,
    media: input.media,
  });
}

export function normalizeProjectBackupMediaEntry(input: ProjectBackupMediaEntry): ProjectBackupMediaEntry {
  const mediaId = requireNonEmpty(input.mediaId, 'media.mediaId');
  const fileName = input.fileName?.trim();
  const mimeType = input.mimeType?.trim();
  const contentBase64 = input.contentBase64;

  if (contentBase64 !== undefined) {
    if (!input.checksum) throw new TypeError(`media checksum missing: ${mediaId}`);
    const checksum = createElectroCraftCanonicalSnapshotChecksum(contentBase64);
    if (checksum !== input.checksum) throw new TypeError(`media checksum mismatch: ${mediaId}`);
  } else if (input.checksum !== undefined) {
    throw new TypeError(`media checksum requires embedded content: ${mediaId}`);
  }

  return Object.freeze({
    mediaId,
    metadata: input.metadata,
    ...(fileName ? { fileName } : {}),
    ...(mimeType ? { mimeType } : {}),
    ...(contentBase64 !== undefined ? { contentBase64, checksum: input.checksum } : {}),
  });
}

export function createProjectBackupPackage(
  opened: OpenProjectResult,
  media: readonly ProjectBackupMediaEntry[] = [],
  createdAt = new Date().toISOString(),
): ProjectBackupPackage {
  const projectId = requireNonEmpty(opened.project.id, 'project.id');
  const objectIds = new Set<string>();
  const objects = opened.objects.map((object) => {
    const normalized = normalizeStoredProjectObject(projectId, object, object.updatedAt);
    if (objectIds.has(normalized.objectId)) throw new TypeError(`duplicate project object: ${normalized.objectId}`);
    objectIds.add(normalized.objectId);
    return Object.freeze({
      objectId: normalized.objectId,
      kind: normalized.kind,
      schemaVersion: normalized.schemaVersion,
      payload: normalized.payload,
      checksum: normalized.checksum,
    });
  });

  const mediaIds = new Set<string>();
  const normalizedMedia = media.map((entry) => {
    const normalized = normalizeProjectBackupMediaEntry(entry);
    if (mediaIds.has(normalized.mediaId)) throw new TypeError(`duplicate backup media: ${normalized.mediaId}`);
    mediaIds.add(normalized.mediaId);
    return normalized;
  });

  const manifest: ProjectBackupManifest = Object.freeze({
    format: PROJECT_BACKUP_FORMAT,
    formatVersion: PROJECT_BACKUP_FORMAT_VERSION,
    storageSchemaVersion: PROJECT_STORAGE_SCHEMA_VERSION,
    projectId,
    createdAt,
    objectCount: objects.length,
    mediaCount: normalizedMedia.length,
  });
  const snapshot: ProjectBackupSnapshot = Object.freeze({
    project: Object.freeze({ ...opened.project, id: projectId }),
    objects: Object.freeze(objects),
  });
  const payload = backupPayload({ manifest, snapshot, media: Object.freeze(normalizedMedia) });

  return Object.freeze({
    ...payload,
    checksum: createElectroCraftCanonicalSnapshotChecksum(payload),
  });
}

export function validateProjectBackupPackage(input: ProjectBackupPackage): ProjectBackupPackage {
  if (input.manifest.format !== PROJECT_BACKUP_FORMAT) throw new TypeError('unsupported project backup format');
  if (input.manifest.formatVersion !== PROJECT_BACKUP_FORMAT_VERSION) {
    throw new TypeError(`unsupported project backup format version: ${input.manifest.formatVersion}`);
  }
  if (input.manifest.storageSchemaVersion !== PROJECT_STORAGE_SCHEMA_VERSION) {
    throw new TypeError(`unsupported project backup storage schema version: ${input.manifest.storageSchemaVersion}`);
  }

  const projectId = requireNonEmpty(input.snapshot.project.id, 'snapshot.project.id');
  if (input.manifest.projectId !== projectId) throw new TypeError('backup manifest projectId mismatch');
  if (input.manifest.objectCount !== input.snapshot.objects.length) throw new TypeError('backup object count mismatch');
  if (input.manifest.mediaCount !== input.media.length) throw new TypeError('backup media count mismatch');

  const objectIds = new Set<string>();
  for (const object of input.snapshot.objects) {
    const normalized = normalizeStoredProjectObject(projectId, object);
    if (objectIds.has(normalized.objectId)) throw new TypeError(`duplicate project object: ${normalized.objectId}`);
    objectIds.add(normalized.objectId);
  }

  const mediaIds = new Set<string>();
  for (const entry of input.media) {
    const normalized = normalizeProjectBackupMediaEntry(entry);
    if (mediaIds.has(normalized.mediaId)) throw new TypeError(`duplicate backup media: ${normalized.mediaId}`);
    mediaIds.add(normalized.mediaId);
  }

  const checksum = createElectroCraftCanonicalSnapshotChecksum(
    backupPayload({ manifest: input.manifest, snapshot: input.snapshot, media: input.media }),
  );
  if (checksum !== input.checksum) throw new TypeError('project backup checksum mismatch');
  return input;
}

export function createProjectBackupService(port: ProjectStoragePort, backupPort?: ProjectBackupStoragePort) {
  return Object.freeze({
    async exportProject(projectIdInput: string) {
      const projectId = requireNonEmpty(projectIdInput, 'projectId');
      const opened = await port.openProject(projectId);
      if (!opened) throw new Error(`project not found: ${projectId}`);
      const media = backupPort ? await backupPort.listProjectBackupMedia(projectId) : [];
      return createProjectBackupPackage(opened, media);
    },

    async importProject(input: ProjectBackupPackage, options: ImportProjectBackupOptions = {}) {
      const backup = validateProjectBackupPackage(input);
      if (backup.media.length > 0 && !backupPort) {
        throw new Error('backup contains media payloads that the current storage port cannot restore safely');
      }

      const mode = options.mode ?? 'import-as-copy';
      const sourceProjectId = backup.snapshot.project.id;
      const targetProjectId =
        mode === 'import-as-copy'
          ? requireNonEmpty(options.targetProjectId ?? globalThis.crypto.randomUUID(), 'targetProjectId')
          : requireNonEmpty(options.targetProjectId ?? sourceProjectId, 'targetProjectId');
      const existing = await port.openProject(targetProjectId);

      if (mode === 'reject-collision' && existing) throw new Error(`project already exists: ${targetProjectId}`);
      if (mode === 'import-as-copy' && existing) throw new Error(`target project already exists: ${targetProjectId}`);

      const name = requireNonEmpty(
        options.name ??
          (mode === 'import-as-copy' ? `${backup.snapshot.project.name} (copia importada)` : backup.snapshot.project.name),
        'name',
      );
      const saveRequest = normalizeSaveProjectRequest({
        project: {
          id: targetProjectId,
          name,
          metadata: backup.snapshot.project.metadata,
        },
        objects: backup.snapshot.objects,
        reason: mode === 'replace-existing' ? 'restore-backup' : 'import-backup',
      });

      let revision: ProjectStorageRevision;
      let safetyRevisionId: string | null = null;
      if (backupPort) {
        const persisted = await backupPort.importProjectBackupSnapshot({
          mode,
          saveRequest,
          media: backup.media,
          createSafetyCheckpoint: mode === 'replace-existing' && existing !== null,
        });
        revision = persisted.revision;
        safetyRevisionId = persisted.safetyRevisionId;
      } else {
        if (mode === 'replace-existing' && existing) {
          safetyRevisionId = (await port.createCheckpoint(targetProjectId, 'pre-restore-safety')).id;
        }
        revision = await port.saveProject(saveRequest);
      }

      return Object.freeze<ProjectBackupImportResult>({
        sourceProjectId,
        projectId: targetProjectId,
        mode,
        revisionId: revision.id,
        safetyRevisionId,
      });
    },
  });
}

export type ProjectBackupService = ReturnType<typeof createProjectBackupService>;
