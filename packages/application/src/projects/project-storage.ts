import {
  createElectroCraftCanonicalSnapshotChecksum,
  type ElectroCraftCanonicalSnapshotChecksum,
  type ElectroCraftMetadata,
  type JsonValue,
} from '@electrocraft/domain';

export const PROJECT_STORAGE_SCHEMA_VERSION = 1 as const;

export type ProjectStorageBackend = 'opfs-ahp' | 'indexeddb' | 'memory';
export type ProjectStorageState = 'initial' | 'loading' | 'ready' | 'saving' | 'saved' | 'error' | 'blocked';
export type ProjectStorageLifecyclePhase =
  'idle' | 'bootstrap' | 'migrations' | 'health-check' | 'ready' | 'leader-handoff';
export type ProjectStorageCoordinationRole = 'leader' | 'follower' | 'unknown';

export interface ProjectStorageCoordinationDiagnostics {
  readonly mode: 'multi-tab';
  readonly role: ProjectStorageCoordinationRole;
  readonly leaderChanges: number;
}

export interface ProjectStorageDiagnostics {
  readonly state: ProjectStorageState;
  readonly backend: ProjectStorageBackend;
  readonly persistent: boolean;
  readonly durable: boolean;
  readonly usageBytes: number | null;
  readonly quotaBytes: number | null;
  readonly migrationVersion: number;
  readonly repairSupported: boolean;
  readonly message: string;
  readonly fallbackReason?: string;
  readonly lifecyclePhase?: ProjectStorageLifecyclePhase;
  readonly coordination?: ProjectStorageCoordinationDiagnostics;
}

export interface StoredProjectDefinition {
  readonly id: string;
  readonly name: string;
  readonly metadata: ElectroCraftMetadata;
}
export type ProjectLifecycleStatus = 'active' | 'archived' | 'trashed';
export type ProjectListSort = 'updated-desc' | 'updated-asc' | 'name-asc' | 'name-desc';
export interface ProjectSummary extends StoredProjectDefinition {
  readonly status: ProjectLifecycleStatus;
  readonly objectCount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}
export interface ListProjectsRequest {
  readonly search?: string;
  readonly status?: ProjectLifecycleStatus | 'all';
  readonly sort?: ProjectListSort;
}

export interface StoredProjectObjectInput {
  readonly objectId: string;
  readonly kind: string;
  readonly schemaVersion: number;
  readonly payload: JsonValue;
  readonly checksum?: ElectroCraftCanonicalSnapshotChecksum;
}

export interface StoredProjectObject extends StoredProjectObjectInput {
  readonly projectId: string;
  readonly checksum: ElectroCraftCanonicalSnapshotChecksum;
  readonly updatedAt: string;
}

export interface ProjectRevisionManifestEntry {
  readonly objectId: string;
  readonly kind: string;
  readonly schemaVersion: number;
  readonly checksum: ElectroCraftCanonicalSnapshotChecksum;
  readonly payload?: JsonValue;
}

export interface ProjectRevisionManifest {
  readonly schemaVersion: typeof PROJECT_STORAGE_SCHEMA_VERSION;
  readonly projectId: string;
  readonly objects: readonly ProjectRevisionManifestEntry[];
}

export interface ProjectStorageRevision {
  readonly id: string;
  readonly projectId: string;
  readonly reason: string;
  readonly manifest: ProjectRevisionManifest;
  readonly checksum: ElectroCraftCanonicalSnapshotChecksum;
  readonly createdAt: string;
}

export interface SaveProjectRequest {
  readonly project: StoredProjectDefinition;
  readonly objects: readonly StoredProjectObjectInput[];
  readonly reason?: string;
}

export interface NormalizedSaveProjectRequest {
  readonly project: StoredProjectDefinition;
  readonly objects: readonly StoredProjectObject[];
  readonly revision: ProjectStorageRevision;
}

export interface IncrementalSaveProjectRequest {
  readonly project: StoredProjectDefinition;
  readonly dirtyObjects: readonly StoredProjectObjectInput[];
  readonly deletedObjectIds?: readonly string[];
}

export interface NormalizedIncrementalSaveProjectRequest {
  readonly project: StoredProjectDefinition;
  readonly dirtyObjects: readonly StoredProjectObject[];
  readonly deletedObjectIds: readonly string[];
  readonly updatedAt: string;
}

export interface ProjectIncrementalSaveResult {
  readonly projectId: string;
  readonly updatedAt: string;
  readonly upsertedObjectIds: readonly string[];
  readonly deletedObjectIds: readonly string[];
  readonly currentRevisionBase: string | null;
}

export interface ProjectRecoveryCandidate {
  readonly projectId: string;
  readonly revisionId: string;
  readonly reason: string;
  readonly createdAt: string;
  readonly objectCount: number;
}

export interface OpenProjectResult {
  readonly project: StoredProjectDefinition;
  readonly objects: readonly StoredProjectObject[];
  readonly revision: ProjectStorageRevision | null;
}

export interface ProjectIntegrityReport {
  readonly projectId: string;
  readonly coherent: boolean;
  readonly checkedObjects: number;
  readonly invalidObjectIds: readonly string[];
  readonly revisionChecksumValid: boolean;
}

export interface ProjectStoragePort {
  initialize(): Promise<ProjectStorageDiagnostics>;
  saveProject(request: NormalizedSaveProjectRequest): Promise<ProjectStorageRevision>;
  saveProjectIncremental(request: NormalizedIncrementalSaveProjectRequest): Promise<ProjectIncrementalSaveResult>;
  createCheckpoint(projectId: string, reason: string): Promise<ProjectStorageRevision>;
  findRecoveryCandidate(projectId: string): Promise<ProjectRecoveryCandidate | null>;
  restoreRevision(projectId: string, revisionId: string): Promise<ProjectStorageRevision>;
  openProject(projectId: string): Promise<OpenProjectResult | null>;
  listProjects(request: Required<ListProjectsRequest>): Promise<readonly ProjectSummary[]>;
  setProjectStatus(projectId: string, status: ProjectLifecycleStatus): Promise<ProjectSummary>;
  verifyProject(projectId: string): Promise<ProjectIntegrityReport>;
  getDiagnostics(): Promise<ProjectStorageDiagnostics>;
  repair(): Promise<ProjectStorageDiagnostics>;
  close(): Promise<void>;
}

function requireNonEmpty(value: string, field: string) {
  const normalized = value.trim();
  if (!normalized) throw new TypeError(`${field} must not be empty`);
  return normalized;
}

function normalizeStoredProjectDefinition(project: StoredProjectDefinition) {
  return Object.freeze({
    ...project,
    id: requireNonEmpty(project.id, 'project.id'),
    name: requireNonEmpty(project.name, 'project.name'),
  });
}

export function normalizeStoredProjectObject(
  projectIdInput: string,
  input: StoredProjectObjectInput,
  updatedAt = new Date().toISOString(),
): StoredProjectObject {
  const projectId = requireNonEmpty(projectIdInput, 'projectId');
  const objectId = requireNonEmpty(input.objectId, 'objectId');
  const kind = requireNonEmpty(input.kind, 'kind');
  if (!Number.isSafeInteger(input.schemaVersion) || input.schemaVersion < 1) {
    throw new TypeError('schemaVersion must be a positive safe integer');
  }

  const checksum = createElectroCraftCanonicalSnapshotChecksum(input.payload);
  if (input.checksum !== undefined && input.checksum !== checksum) {
    throw new TypeError(`project object checksum mismatch: ${objectId}`);
  }

  return Object.freeze({
    projectId,
    objectId,
    kind,
    schemaVersion: input.schemaVersion,
    payload: input.payload,
    checksum,
    updatedAt,
  });
}

export function validateStoredProjectObject(input: StoredProjectObject): StoredProjectObject {
  return normalizeStoredProjectObject(input.projectId, input, input.updatedAt);
}

export function createProjectStorageRevision(
  projectIdInput: string,
  objects: readonly StoredProjectObject[],
  reasonInput = 'checkpoint',
  revisionId = globalThis.crypto?.randomUUID?.() ?? `revision-${Date.now()}`,
  createdAt = new Date().toISOString(),
): ProjectStorageRevision {
  const projectId = requireNonEmpty(projectIdInput, 'projectId');
  const reason = requireNonEmpty(reasonInput, 'reason');
  const manifest: ProjectRevisionManifest = Object.freeze({
    schemaVersion: PROJECT_STORAGE_SCHEMA_VERSION,
    projectId,
    objects: Object.freeze(
      [...objects]
        .sort(({ objectId: left }, { objectId: right }) => left.localeCompare(right))
        .map(({ objectId, kind, schemaVersion, checksum, payload }) =>
          Object.freeze({ objectId, kind, schemaVersion, checksum, payload }),
        ),
    ),
  });

  return Object.freeze({
    id: requireNonEmpty(revisionId, 'revisionId'),
    projectId,
    reason,
    manifest,
    checksum: createElectroCraftCanonicalSnapshotChecksum(manifest),
    createdAt,
  });
}

export function validateProjectStorageRevision(input: ProjectStorageRevision): ProjectStorageRevision {
  if (input.manifest.schemaVersion !== PROJECT_STORAGE_SCHEMA_VERSION) {
    throw new TypeError(`unsupported project storage schema version: ${input.manifest.schemaVersion}`);
  }
  if (input.manifest.projectId !== input.projectId) {
    throw new TypeError('revision manifest projectId mismatch');
  }
  const checksum = createElectroCraftCanonicalSnapshotChecksum(input.manifest);
  if (checksum !== input.checksum) throw new TypeError('revision manifest checksum mismatch');
  return input;
}

export function projectRevisionSnapshotObjects(
  revisionInput: ProjectStorageRevision,
): readonly StoredProjectObjectInput[] | null {
  const revision = validateProjectStorageRevision(revisionInput);
  const objects: StoredProjectObjectInput[] = [];
  for (const entry of revision.manifest.objects) {
    if (entry.payload === undefined) return null;
    if (createElectroCraftCanonicalSnapshotChecksum(entry.payload) !== entry.checksum) return null;
    objects.push(
      Object.freeze({
        objectId: entry.objectId,
        kind: entry.kind,
        schemaVersion: entry.schemaVersion,
        payload: entry.payload,
        checksum: entry.checksum,
      }),
    );
  }
  return Object.freeze(objects);
}

export function normalizeSaveProjectRequest(
  request: SaveProjectRequest,
  now = new Date().toISOString(),
): NormalizedSaveProjectRequest {
  const project = normalizeStoredProjectDefinition(request.project);
  const objectIds = new Set<string>();
  const objects = request.objects.map((object) => {
    const normalized = normalizeStoredProjectObject(project.id, object, now);
    if (objectIds.has(normalized.objectId)) throw new TypeError(`duplicate project object: ${normalized.objectId}`);
    objectIds.add(normalized.objectId);
    return normalized;
  });
  const revision = createProjectStorageRevision(project.id, objects, request.reason, undefined, now);
  return Object.freeze({ project, objects: Object.freeze(objects), revision });
}

export function normalizeIncrementalSaveProjectRequest(
  request: IncrementalSaveProjectRequest,
  now = new Date().toISOString(),
): NormalizedIncrementalSaveProjectRequest {
  const project = normalizeStoredProjectDefinition(request.project);
  const dirtyIds = new Set<string>();
  const dirtyObjects = request.dirtyObjects.map((object) => {
    const normalized = normalizeStoredProjectObject(project.id, object, now);
    if (dirtyIds.has(normalized.objectId))
      throw new TypeError(`duplicate dirty project object: ${normalized.objectId}`);
    dirtyIds.add(normalized.objectId);
    return normalized;
  });

  const deletedIds = new Set<string>();
  for (const input of request.deletedObjectIds ?? []) {
    const objectId = requireNonEmpty(input, 'deletedObjectId');
    if (deletedIds.has(objectId)) throw new TypeError(`duplicate deleted project object: ${objectId}`);
    if (dirtyIds.has(objectId)) throw new TypeError(`project object cannot be dirty and deleted: ${objectId}`);
    deletedIds.add(objectId);
  }

  if (dirtyObjects.length === 0 && deletedIds.size === 0) {
    throw new TypeError('incremental project save requires at least one dirty or deleted object');
  }

  return Object.freeze({
    project,
    dirtyObjects: Object.freeze(dirtyObjects),
    deletedObjectIds: Object.freeze([...deletedIds]),
    updatedAt: now,
  });
}

export function createProjectStorageService(port: ProjectStoragePort) {
  return Object.freeze({
    initialize: () => port.initialize(),
    diagnostics: () => port.getDiagnostics(),
    openProject: (projectId: string) => port.openProject(requireNonEmpty(projectId, 'projectId')),
    listProjects: (request: ListProjectsRequest = {}) => port.listProjects(normalizeListProjectsRequest(request)),
    setProjectStatus: (projectId: string, status: ProjectLifecycleStatus) =>
      port.setProjectStatus(requireNonEmpty(projectId, 'projectId'), normalizeProjectLifecycleStatus(status)),
    verifyProject: (projectId: string) => port.verifyProject(requireNonEmpty(projectId, 'projectId')),
    saveProject: (request: SaveProjectRequest) => port.saveProject(normalizeSaveProjectRequest(request)),
    saveProjectIncremental: (request: IncrementalSaveProjectRequest) =>
      port.saveProjectIncremental(normalizeIncrementalSaveProjectRequest(request)),
    createCheckpoint: (projectId: string, reason = 'manual') =>
      port.createCheckpoint(requireNonEmpty(projectId, 'projectId'), requireNonEmpty(reason, 'reason')),
    recoveryCandidate: (projectId: string) => port.findRecoveryCandidate(requireNonEmpty(projectId, 'projectId')),
    restoreRevision: (projectId: string, revisionId: string) =>
      port.restoreRevision(requireNonEmpty(projectId, 'projectId'), requireNonEmpty(revisionId, 'revisionId')),
    repair: () => port.repair(),
    close: () => port.close(),
  });
}

export function normalizeProjectLifecycleStatus(value: string): ProjectLifecycleStatus {
  if (value === 'active' || value === 'archived' || value === 'trashed') return value;
  throw new TypeError(`unsupported project status: ${value}`);
}
export function normalizeListProjectsRequest(request: ListProjectsRequest): Required<ListProjectsRequest> {
  const status = request.status ?? 'active';
  if (status !== 'all') normalizeProjectLifecycleStatus(status);
  const sort = request.sort ?? 'updated-desc';
  if (!['updated-desc', 'updated-asc', 'name-asc', 'name-desc'].includes(sort))
    throw new TypeError(`unsupported project sort: ${sort}`);
  return Object.freeze({ search: request.search?.trim() ?? '', status, sort });
}

export type ProjectStorageService = ReturnType<typeof createProjectStorageService>;
