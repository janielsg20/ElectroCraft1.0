import type { ElectroCraftObjectId, ElectroCraftProjectSnapshot, JsonValue } from '@electrocraft/domain';

export type ProjectStorageBackend = 'opfs-ahp' | 'indexeddb' | 'memory';
export type ProjectStorageHealth = 'ready' | 'degraded' | 'blocked';

export interface ProjectStorageStatus {
  readonly health: ProjectStorageHealth;
  readonly backend: ProjectStorageBackend;
  readonly persistent: boolean;
  readonly worker: boolean;
  readonly reasonCode?: 'OPFS_UNAVAILABLE' | 'OPFS_UNSAFE_BROWSER' | 'PERSISTENCE_UNAVAILABLE' | 'MIGRATION_FAILED';
}

export interface StoredProjectSummary {
  readonly id: ElectroCraftObjectId;
  readonly name: string;
  readonly schemaVersion: number;
  readonly updatedAt: string;
}

export interface ProjectObjectSearchResult {
  readonly projectId: ElectroCraftObjectId;
  readonly objectId: ElectroCraftObjectId;
  readonly kind: string;
  readonly payload: JsonValue;
}

export interface ProjectStoragePort {
  initialize(): Promise<ProjectStorageStatus>;
  getStatus(): ProjectStorageStatus;
  saveSnapshot(snapshot: ElectroCraftProjectSnapshot): Promise<void>;
  openSnapshot(projectId: ElectroCraftObjectId): Promise<ElectroCraftProjectSnapshot | null>;
  listProjects(): Promise<readonly StoredProjectSummary[]>;
  deleteProject(projectId: ElectroCraftObjectId): Promise<void>;
  recoverLatestSnapshot(projectId: ElectroCraftObjectId): Promise<ElectroCraftProjectSnapshot | null>;
  searchProjectObjects(projectId: ElectroCraftObjectId, query: string): Promise<readonly ProjectObjectSearchResult[]>;
}

export class ProjectStorageError extends Error {
  constructor(
    readonly code: 'PROJECT_STORAGE_INIT_FAILED' | 'PROJECT_SAVE_FAILED' | 'PROJECT_OPEN_FAILED' | 'PROJECT_RECOVERY_FAILED',
    message: string,
    readonly causeValue?: unknown,
  ) {
    super(message);
    this.name = 'ProjectStorageError';
  }
}
