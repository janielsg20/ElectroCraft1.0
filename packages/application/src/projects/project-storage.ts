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
  openProject(projectId: string): Promise<OpenProjectResult | null>;
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
        .map(({ objectId, kind, schemaVersion, checksum }) =>
          Object.freeze({ objectId, kind, schemaVersion, checksum }),
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

export function normalizeSaveProjectRequest(
  request: SaveProjectRequest,
  now = new Date().toISOString(),
): NormalizedSaveProjectRequest {
  const projectId = requireNonEmpty(request.project.id, 'project.id');
  const name = requireNonEmpty(request.project.name, 'project.name');
  const objectIds = new Set<string>();
  const objects = request.objects.map((object) => {
    const normalized = normalizeStoredProjectObject(projectId, object, now);
    if (objectIds.has(normalized.objectId)) throw new TypeError(`duplicate project object: ${normalized.objectId}`);
    objectIds.add(normalized.objectId);
    return normalized;
  });
  const project = Object.freeze({ ...request.project, id: projectId, name });
  const revision = createProjectStorageRevision(projectId, objects, request.reason, undefined, now);
  return Object.freeze({ project, objects: Object.freeze(objects), revision });
}

export function createProjectStorageService(port: ProjectStoragePort) {
  return Object.freeze({
    initialize: () => port.initialize(),
    diagnostics: () => port.getDiagnostics(),
    openProject: (projectId: string) => port.openProject(requireNonEmpty(projectId, 'projectId')),
    verifyProject: (projectId: string) => port.verifyProject(requireNonEmpty(projectId, 'projectId')),
    saveProject: (request: SaveProjectRequest) => port.saveProject(normalizeSaveProjectRequest(request)),
    repair: () => port.repair(),
    close: () => port.close(),
  });
}

export type ProjectStorageService = ReturnType<typeof createProjectStorageService>;
