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
export interface DuplicateProjectRequest {
  readonly sourceProjectId: string;
  readonly projectId: string;
  readonly name: string;
}
export const PROJECT_BACKUP_FORMAT_VERSION = 1 as const;
export interface ProjectBackupPackage {
  readonly format: 'electrocraft-project-backup';
  readonly version: typeof PROJECT_BACKUP_FORMAT_VERSION;
  readonly createdAt: string;
  readonly project: StoredProjectDefinition;
  readonly objects: readonly StoredProjectObjectInput[];
  readonly mediaRefs: readonly string[];
  readonly checksum: ElectroCraftCanonicalSnapshotChecksum;
}
export type ProjectImportStrategy = 'copy' | 'replace';
export interface StudioWorkspaceLayout {
  readonly id: string;
  readonly name: string;
  readonly contextWidth: number;
  readonly inspectorWidth: number;
  readonly visiblePanels: readonly string[];
}
export interface StudioWorkspacePreferences {
  readonly sidebarSide: 'left' | 'right';
  readonly sidebarCollapsed: boolean;
  readonly sidebarWidth: number;
  readonly sidebarDisplay: 'icons' | 'text' | 'icons+text';
  readonly groupOrder: readonly string[];
  readonly contextWidth: number;
  readonly inspectorWidth: number;
  readonly lastTab: string | null;
  readonly lastDocumentId: string | null;
  readonly layouts: readonly StudioWorkspaceLayout[];
}
export const DEFAULT_STUDIO_WORKSPACE_PREFERENCES: StudioWorkspacePreferences = Object.freeze({
  sidebarSide: 'left',
  sidebarCollapsed: false,
  sidebarWidth: 240,
  sidebarDisplay: 'icons+text',
  groupOrder: [],
  contextWidth: 288,
  inspectorWidth: 320,
  lastTab: null,
  lastDocumentId: null,
  layouts: [],
});
export function normalizeStudioWorkspacePreferences(
  input: Partial<StudioWorkspacePreferences>,
  viewportWidth = 1440,
): StudioWorkspacePreferences {
  const mobile = viewportWidth < 768;
  const tablet = viewportWidth < 1024;
  const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
  return Object.freeze({
    ...DEFAULT_STUDIO_WORKSPACE_PREFERENCES,
    ...input,
    sidebarSide: input.sidebarSide === 'right' ? 'right' : 'left',
    sidebarWidth: clamp(input.sidebarWidth ?? 240, 64, 320),
    contextWidth: mobile ? 288 : clamp(input.contextWidth ?? 288, 240, 380),
    inspectorWidth: mobile || tablet ? 320 : clamp(input.inspectorWidth ?? 320, 280, 440),
    groupOrder: Object.freeze([...(input.groupOrder ?? [])]),
    layouts: Object.freeze([...(input.layouts ?? [])]),
  });
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
export interface ProjectRevisionSummary {
  readonly id: string;
  readonly projectId: string;
  readonly reason: string;
  readonly createdAt: string;
  readonly objectCount: number;
  readonly objectsByKind: Readonly<Record<string, number>>;
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
  listRevisions(projectId: string): Promise<readonly ProjectRevisionSummary[]>;
  openProject(projectId: string): Promise<OpenProjectResult | null>;
  listProjects(request: Required<ListProjectsRequest>): Promise<readonly ProjectSummary[]>;
  setProjectStatus(projectId: string, status: ProjectLifecycleStatus): Promise<ProjectSummary>;
  renameProject(projectId: string, name: string): Promise<ProjectSummary>;
  duplicateProject(request: DuplicateProjectRequest): Promise<ProjectSummary>;
  deleteProjectPermanently(projectId: string): Promise<void>;
  getWorkspacePreferences(workspaceId: string): Promise<StudioWorkspacePreferences>;
  saveWorkspacePreferences(
    workspaceId: string,
    preferences: StudioWorkspacePreferences,
  ): Promise<StudioWorkspacePreferences>;
  resetWorkspacePreferences(workspaceId: string): Promise<StudioWorkspacePreferences>;
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
  async function createBackup(projectIdInput: string): Promise<ProjectBackupPackage> {
    const projectId = requireNonEmpty(projectIdInput, 'projectId');
    const opened = await port.openProject(projectId);
    if (!opened) throw new Error(`project not found: ${projectId}`);
    const body = {
      format: 'electrocraft-project-backup' as const,
      version: PROJECT_BACKUP_FORMAT_VERSION,
      createdAt: new Date().toISOString(),
      project: opened.project,
      objects: opened.objects.map(({ objectId, kind, schemaVersion, payload, checksum }) => ({
        objectId,
        kind,
        schemaVersion,
        payload,
        checksum,
      })),
      mediaRefs: opened.objects.filter((o) => o.kind === 'media').map((o) => o.objectId),
    };
    return Object.freeze({ ...body, checksum: createElectroCraftCanonicalSnapshotChecksum(body) });
  }
  async function importBackup(
    input: ProjectBackupPackage,
    strategy: ProjectImportStrategy,
    copyId = globalThis.crypto.randomUUID(),
  ) {
    if (input.format !== 'electrocraft-project-backup' || input.version !== PROJECT_BACKUP_FORMAT_VERSION)
      throw new TypeError('unsupported project backup format');
    const { checksum, ...body } = input;
    if (createElectroCraftCanonicalSnapshotChecksum(body) !== checksum)
      throw new TypeError('project backup checksum mismatch');
    const existing = await port.openProject(input.project.id);
    if (strategy === 'replace' && existing) await port.createCheckpoint(input.project.id, 'pre-restore');
    const projectId =
      strategy === 'copy' || (existing && strategy !== 'replace')
        ? requireNonEmpty(copyId, 'copyId')
        : input.project.id;
    await port.saveProject(
      normalizeSaveProjectRequest({
        project: {
          ...input.project,
          id: projectId,
          name: strategy === 'copy' ? `${input.project.name} (importado)` : input.project.name,
        },
        objects: input.objects,
        reason: strategy === 'replace' ? 'backup-restored' : 'backup-imported',
      }),
    );
    return port.openProject(projectId);
  }
  return Object.freeze({
    initialize: () => port.initialize(),
    diagnostics: () => port.getDiagnostics(),
    openProject: (projectId: string) => port.openProject(requireNonEmpty(projectId, 'projectId')),
    listProjects: (request: ListProjectsRequest = {}) => port.listProjects(normalizeListProjectsRequest(request)),
    setProjectStatus: (projectId: string, status: ProjectLifecycleStatus) =>
      port.setProjectStatus(requireNonEmpty(projectId, 'projectId'), normalizeProjectLifecycleStatus(status)),
    renameProject: (projectId: string, name: string) =>
      port.renameProject(requireNonEmpty(projectId, 'projectId'), requireNonEmpty(name, 'name')),
    duplicateProject: (sourceProjectId: string, name: string, projectId = globalThis.crypto.randomUUID()) =>
      port.duplicateProject({
        sourceProjectId: requireNonEmpty(sourceProjectId, 'sourceProjectId'),
        projectId: requireNonEmpty(projectId, 'projectId'),
        name: requireNonEmpty(name, 'name'),
      }),
    deleteProjectPermanently: (projectId: string) =>
      port.deleteProjectPermanently(requireNonEmpty(projectId, 'projectId')),
    createBackup,
    importBackup,
    getWorkspacePreferences: (workspaceId: string) =>
      port.getWorkspacePreferences(requireNonEmpty(workspaceId, 'workspaceId')),
    saveWorkspacePreferences: (
      workspaceId: string,
      input: Partial<StudioWorkspacePreferences>,
      viewportWidth?: number,
    ) =>
      port.saveWorkspacePreferences(
        requireNonEmpty(workspaceId, 'workspaceId'),
        normalizeStudioWorkspacePreferences(input, viewportWidth),
      ),
    resetWorkspacePreferences: (workspaceId: string) =>
      port.resetWorkspacePreferences(requireNonEmpty(workspaceId, 'workspaceId')),
    verifyProject: (projectId: string) => port.verifyProject(requireNonEmpty(projectId, 'projectId')),
    saveProject: (request: SaveProjectRequest) => port.saveProject(normalizeSaveProjectRequest(request)),
    saveProjectIncremental: (request: IncrementalSaveProjectRequest) =>
      port.saveProjectIncremental(normalizeIncrementalSaveProjectRequest(request)),
    createCheckpoint: (projectId: string, reason = 'manual') =>
      port.createCheckpoint(requireNonEmpty(projectId, 'projectId'), requireNonEmpty(reason, 'reason')),
    recoveryCandidate: (projectId: string) => port.findRecoveryCandidate(requireNonEmpty(projectId, 'projectId')),
    restoreRevision: (projectId: string, revisionId: string) =>
      port.restoreRevision(requireNonEmpty(projectId, 'projectId'), requireNonEmpty(revisionId, 'revisionId')),
    listRevisions: (projectId: string) => port.listRevisions(requireNonEmpty(projectId, 'projectId')),
    async restoreRevisionAsCheckpoint(projectId: string, revisionId: string) {
      const id = requireNonEmpty(projectId, 'projectId');
      await port.restoreRevision(id, requireNonEmpty(revisionId, 'revisionId'));
      return port.createCheckpoint(id, 'restored-revision');
    },
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
