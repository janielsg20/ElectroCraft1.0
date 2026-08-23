import {
  createElectroCraftCanonicalSnapshotChecksum,
  type ElectroCraftCanonicalSnapshotChecksum,
  type ElectroCraftMetadata,
  type JsonValue,
} from '@electrocraft/domain';
import {
  normalizeStoredProjectObject,
  type ProjectLifecycleStatus,
  type StoredProjectDefinition,
  type StoredProjectObjectInput,
} from './project-storage';

export const PROJECT_BACKUP_FORMAT = 'electrocraft-project-backup' as const;
export const PROJECT_BACKUP_VERSION = 1 as const;

export interface ProjectBackupContentRecord {
  readonly id: string;
  readonly modelId: string;
  readonly data: JsonValue;
  readonly state: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ProjectBackupTaxonomyTerm {
  readonly id: string;
  readonly taxonomyId: string;
  readonly slug: string;
  readonly name: string;
  readonly metadata: ElectroCraftMetadata;
}

export interface ProjectBackupRecordTerm {
  readonly recordId: string;
  readonly termId: string;
}

export interface ProjectBackupRelationEdge {
  readonly id: string;
  readonly relationId: string;
  readonly fromModelId: string;
  readonly fromRecordId: string;
  readonly toModelId: string;
  readonly toRecordId: string;
  readonly payload: JsonValue;
  readonly createdAt: string;
}

export interface ProjectBackupMediaReference {
  readonly mediaId: string;
  readonly metadata: ElectroCraftMetadata;
  readonly updatedAt: string;
}

export interface ProjectBackupContentSnapshot {
  readonly records: readonly ProjectBackupContentRecord[];
  readonly terms: readonly ProjectBackupTaxonomyTerm[];
  readonly recordTerms: readonly ProjectBackupRecordTerm[];
  readonly relations: readonly ProjectBackupRelationEdge[];
}

export interface ProjectBackupSnapshot {
  readonly project: StoredProjectDefinition;
  readonly status: ProjectLifecycleStatus;
  readonly objects: readonly StoredProjectObjectInput[];
  readonly content: ProjectBackupContentSnapshot;
  readonly media: readonly ProjectBackupMediaReference[];
}

export interface ProjectBackupManifest {
  readonly format: typeof PROJECT_BACKUP_FORMAT;
  readonly version: typeof PROJECT_BACKUP_VERSION;
  readonly createdAt: string;
  readonly projectId: string;
  readonly projectName: string;
  readonly objectCount: number;
  readonly contentRecordCount: number;
  readonly taxonomyTermCount: number;
  readonly relationCount: number;
  readonly mediaReferenceCount: number;
  readonly mediaFilesIncluded: false;
  readonly snapshotChecksum: ElectroCraftCanonicalSnapshotChecksum;
}

export interface ProjectBackupPackage {
  readonly manifest: ProjectBackupManifest;
  readonly snapshot: ProjectBackupSnapshot;
  readonly checksum: ElectroCraftCanonicalSnapshotChecksum;
}

export type ProjectBackupImportStrategy = 'reject' | 'copy' | 'replace';

export interface ProjectBackupImportRequest {
  readonly package: ProjectBackupPackage;
  readonly strategy?: ProjectBackupImportStrategy;
  readonly copyProjectId?: string;
  readonly copyName?: string;
}

export interface NormalizedProjectBackupImportRequest {
  readonly package: ProjectBackupPackage;
  readonly strategy: ProjectBackupImportStrategy;
  readonly targetProjectId: string;
  readonly targetName: string;
}

export interface ProjectBackupImpactSummary {
  readonly sourceProjectId: string;
  readonly targetProjectId: string;
  readonly strategy: ProjectBackupImportStrategy;
  readonly projectCollision: boolean;
  readonly objectCount: number;
  readonly contentRecordCount: number;
  readonly taxonomyTermCount: number;
  readonly relationCount: number;
  readonly mediaReferenceCount: number;
  readonly mediaFilesIncluded: false;
}

export interface ProjectBackupImportResult extends ProjectBackupImpactSummary {
  readonly safetyRevisionId: string | null;
  readonly importedRevisionId: string;
}

export interface ProjectBackupPort {
  createProjectBackup(projectId: string): Promise<ProjectBackupPackage>;
  inspectProjectBackupImport(request: NormalizedProjectBackupImportRequest): Promise<ProjectBackupImpactSummary>;
  importProjectBackup(request: NormalizedProjectBackupImportRequest): Promise<ProjectBackupImportResult>;
}

function requireRecord(value: unknown, field: string): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(`${field} must be an object`);
  return value as Record<string, unknown>;
}

function requireArray(value: unknown, field: string): readonly unknown[] {
  if (!Array.isArray(value)) throw new TypeError(`${field} must be an array`);
  return value;
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${field} must not be empty`);
  return value.trim();
}

function requireIsoDate(value: unknown, field: string): string {
  const text = requireString(value, field);
  if (Number.isNaN(Date.parse(text))) throw new TypeError(`${field} must be an ISO date`);
  return text;
}

function requireCount(value: unknown, field: string): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) throw new TypeError(`${field} must be a non-negative integer`);
  return value as number;
}

function requireLifecycleStatus(value: unknown): ProjectLifecycleStatus {
  if (value === 'active' || value === 'archived' || value === 'trashed') return value;
  throw new TypeError(`unsupported project status: ${String(value)}`);
}

function normalizeMetadata(value: unknown, field: string): ElectroCraftMetadata {
  return requireRecord(value, field) as ElectroCraftMetadata;
}

function normalizeContentSnapshot(value: unknown): ProjectBackupContentSnapshot {
  const content = requireRecord(value, 'snapshot.content');
  const records = requireArray(content.records, 'snapshot.content.records').map((input, index) => {
    const item = requireRecord(input, `snapshot.content.records[${index}]`);
    return Object.freeze({
      id: requireString(item.id, `snapshot.content.records[${index}].id`),
      modelId: requireString(item.modelId, `snapshot.content.records[${index}].modelId`),
      data: item.data as JsonValue,
      state: requireString(item.state, `snapshot.content.records[${index}].state`),
      createdAt: requireIsoDate(item.createdAt, `snapshot.content.records[${index}].createdAt`),
      updatedAt: requireIsoDate(item.updatedAt, `snapshot.content.records[${index}].updatedAt`),
    });
  });
  const terms = requireArray(content.terms, 'snapshot.content.terms').map((input, index) => {
    const item = requireRecord(input, `snapshot.content.terms[${index}]`);
    return Object.freeze({
      id: requireString(item.id, `snapshot.content.terms[${index}].id`),
      taxonomyId: requireString(item.taxonomyId, `snapshot.content.terms[${index}].taxonomyId`),
      slug: requireString(item.slug, `snapshot.content.terms[${index}].slug`),
      name: requireString(item.name, `snapshot.content.terms[${index}].name`),
      metadata: normalizeMetadata(item.metadata, `snapshot.content.terms[${index}].metadata`),
    });
  });
  const recordTerms = requireArray(content.recordTerms, 'snapshot.content.recordTerms').map((input, index) => {
    const item = requireRecord(input, `snapshot.content.recordTerms[${index}]`);
    return Object.freeze({
      recordId: requireString(item.recordId, `snapshot.content.recordTerms[${index}].recordId`),
      termId: requireString(item.termId, `snapshot.content.recordTerms[${index}].termId`),
    });
  });
  const relations = requireArray(content.relations, 'snapshot.content.relations').map((input, index) => {
    const item = requireRecord(input, `snapshot.content.relations[${index}]`);
    return Object.freeze({
      id: requireString(item.id, `snapshot.content.relations[${index}].id`),
      relationId: requireString(item.relationId, `snapshot.content.relations[${index}].relationId`),
      fromModelId: requireString(item.fromModelId, `snapshot.content.relations[${index}].fromModelId`),
      fromRecordId: requireString(item.fromRecordId, `snapshot.content.relations[${index}].fromRecordId`),
      toModelId: requireString(item.toModelId, `snapshot.content.relations[${index}].toModelId`),
      toRecordId: requireString(item.toRecordId, `snapshot.content.relations[${index}].toRecordId`),
      payload: item.payload as JsonValue,
      createdAt: requireIsoDate(item.createdAt, `snapshot.content.relations[${index}].createdAt`),
    });
  });
  return Object.freeze({
    records: Object.freeze(records),
    terms: Object.freeze(terms),
    recordTerms: Object.freeze(recordTerms),
    relations: Object.freeze(relations),
  });
}

function normalizeSnapshot(value: unknown, createdAt: string): ProjectBackupSnapshot {
  const snapshot = requireRecord(value, 'snapshot');
  const projectInput = requireRecord(snapshot.project, 'snapshot.project');
  const project = Object.freeze({
    id: requireString(projectInput.id, 'snapshot.project.id'),
    name: requireString(projectInput.name, 'snapshot.project.name'),
    metadata: normalizeMetadata(projectInput.metadata, 'snapshot.project.metadata'),
  });
  const objectIds = new Set<string>();
  const objects = requireArray(snapshot.objects, 'snapshot.objects').map((input, index) => {
    const object = requireRecord(input, `snapshot.objects[${index}]`) as unknown as StoredProjectObjectInput;
    const normalized = normalizeStoredProjectObject(project.id, object, createdAt);
    if (objectIds.has(normalized.objectId)) throw new TypeError(`duplicate backup project object: ${normalized.objectId}`);
    objectIds.add(normalized.objectId);
    return Object.freeze({
      objectId: normalized.objectId,
      kind: normalized.kind,
      schemaVersion: normalized.schemaVersion,
      payload: normalized.payload,
      checksum: normalized.checksum,
    });
  });
  const media = requireArray(snapshot.media, 'snapshot.media').map((input, index) => {
    const item = requireRecord(input, `snapshot.media[${index}]`);
    return Object.freeze({
      mediaId: requireString(item.mediaId, `snapshot.media[${index}].mediaId`),
      metadata: normalizeMetadata(item.metadata, `snapshot.media[${index}].metadata`),
      updatedAt: requireIsoDate(item.updatedAt, `snapshot.media[${index}].updatedAt`),
    });
  });
  return Object.freeze({
    project,
    status: requireLifecycleStatus(snapshot.status),
    objects: Object.freeze(objects),
    content: normalizeContentSnapshot(snapshot.content),
    media: Object.freeze(media),
  });
}

export function createProjectBackupPackage(
  snapshotInput: ProjectBackupSnapshot,
  createdAt = new Date().toISOString(),
): ProjectBackupPackage {
  const snapshot = normalizeSnapshot(snapshotInput, createdAt);
  const snapshotChecksum = createElectroCraftCanonicalSnapshotChecksum(snapshot);
  const manifest: ProjectBackupManifest = Object.freeze({
    format: PROJECT_BACKUP_FORMAT,
    version: PROJECT_BACKUP_VERSION,
    createdAt: requireIsoDate(createdAt, 'createdAt'),
    projectId: snapshot.project.id,
    projectName: snapshot.project.name,
    objectCount: snapshot.objects.length,
    contentRecordCount: snapshot.content.records.length,
    taxonomyTermCount: snapshot.content.terms.length,
    relationCount: snapshot.content.relations.length,
    mediaReferenceCount: snapshot.media.length,
    mediaFilesIncluded: false,
    snapshotChecksum,
  });
  return Object.freeze({
    manifest,
    snapshot,
    checksum: createElectroCraftCanonicalSnapshotChecksum({ manifest, snapshot }),
  });
}

export function validateProjectBackupPackage(input: unknown): ProjectBackupPackage {
  const root = requireRecord(input, 'backup');
  const manifestInput = requireRecord(root.manifest, 'backup.manifest');
  if (manifestInput.format !== PROJECT_BACKUP_FORMAT) throw new TypeError('unsupported project backup format');
  if (manifestInput.version !== PROJECT_BACKUP_VERSION) throw new TypeError('unsupported project backup version');
  if (manifestInput.mediaFilesIncluded !== false) {
    throw new TypeError('project backup v1 cannot claim embedded media files before MediaBlobStore is available');
  }
  const createdAt = requireIsoDate(manifestInput.createdAt, 'backup.manifest.createdAt');
  const snapshot = normalizeSnapshot(root.snapshot, createdAt);
  const snapshotChecksum = createElectroCraftCanonicalSnapshotChecksum(snapshot);
  if (manifestInput.snapshotChecksum !== snapshotChecksum) throw new TypeError('project backup snapshot checksum mismatch');

  const manifest: ProjectBackupManifest = Object.freeze({
    format: PROJECT_BACKUP_FORMAT,
    version: PROJECT_BACKUP_VERSION,
    createdAt,
    projectId: requireString(manifestInput.projectId, 'backup.manifest.projectId'),
    projectName: requireString(manifestInput.projectName, 'backup.manifest.projectName'),
    objectCount: requireCount(manifestInput.objectCount, 'backup.manifest.objectCount'),
    contentRecordCount: requireCount(manifestInput.contentRecordCount, 'backup.manifest.contentRecordCount'),
    taxonomyTermCount: requireCount(manifestInput.taxonomyTermCount, 'backup.manifest.taxonomyTermCount'),
    relationCount: requireCount(manifestInput.relationCount, 'backup.manifest.relationCount'),
    mediaReferenceCount: requireCount(manifestInput.mediaReferenceCount, 'backup.manifest.mediaReferenceCount'),
    mediaFilesIncluded: false,
    snapshotChecksum,
  });

  if (manifest.projectId !== snapshot.project.id || manifest.projectName !== snapshot.project.name) {
    throw new TypeError('project backup manifest identity mismatch');
  }
  if (
    manifest.objectCount !== snapshot.objects.length ||
    manifest.contentRecordCount !== snapshot.content.records.length ||
    manifest.taxonomyTermCount !== snapshot.content.terms.length ||
    manifest.relationCount !== snapshot.content.relations.length ||
    manifest.mediaReferenceCount !== snapshot.media.length
  ) {
    throw new TypeError('project backup manifest count mismatch');
  }
  const checksum = createElectroCraftCanonicalSnapshotChecksum({ manifest, snapshot });
  if (root.checksum !== checksum) throw new TypeError('project backup package checksum mismatch');
  return Object.freeze({ manifest, snapshot, checksum });
}

export function normalizeProjectBackupImportRequest(
  input: ProjectBackupImportRequest,
  defaultCopyProjectId = globalThis.crypto?.randomUUID?.() ?? `import-${Date.now()}`,
): NormalizedProjectBackupImportRequest {
  const pkg = validateProjectBackupPackage(input.package);
  const strategy = input.strategy ?? 'reject';
  if (strategy !== 'reject' && strategy !== 'copy' && strategy !== 'replace') {
    throw new TypeError(`unsupported project import strategy: ${String(strategy)}`);
  }
  const targetProjectId =
    strategy === 'copy' ? requireString(input.copyProjectId ?? defaultCopyProjectId, 'copyProjectId') : pkg.snapshot.project.id;
  const targetName =
    strategy === 'copy'
      ? requireString(input.copyName ?? `${pkg.snapshot.project.name} (importado)`, 'copyName')
      : pkg.snapshot.project.name;
  return Object.freeze({ package: pkg, strategy, targetProjectId, targetName });
}

export function createProjectBackupService(port: ProjectBackupPort) {
  return Object.freeze({
    createBackup: (projectId: string) => port.createProjectBackup(requireString(projectId, 'projectId')),
    inspectImport: (request: ProjectBackupImportRequest) =>
      port.inspectProjectBackupImport(normalizeProjectBackupImportRequest(request)),
    importBackup: (request: ProjectBackupImportRequest) =>
      port.importProjectBackup(normalizeProjectBackupImportRequest(request)),
    validateBackup: validateProjectBackupPackage,
  });
}

export type ProjectBackupService = ReturnType<typeof createProjectBackupService>;
