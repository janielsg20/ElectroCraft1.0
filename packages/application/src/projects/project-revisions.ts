import type { ProjectRevisionManifestEntry, ProjectStorageRevision } from './project-storage';

export type ProjectRevisionActor = 'user' | 'system';
export type ProjectRevisionSource =
  | 'initial'
  | 'manual'
  | 'automatic'
  | 'pre-import'
  | 'pre-migration'
  | 'publish'
  | 'export'
  | 'restore'
  | 'recovery';

export interface ProjectObjectVersionReference {
  readonly objectId: string;
  readonly kind: string;
  readonly schemaVersion: number;
  readonly checksum: ProjectRevisionManifestEntry['checksum'];
  readonly versionId: string;
}

export interface ProjectRevisionKindDiff {
  readonly kind: string;
  readonly added: number;
  readonly changed: number;
  readonly removed: number;
  readonly unchanged: number;
}

export interface ProjectRevisionDiffSummary {
  readonly added: number;
  readonly changed: number;
  readonly removed: number;
  readonly unchanged: number;
  readonly byKind: readonly ProjectRevisionKindDiff[];
}

export interface ProjectRevisionHistoryEntry {
  readonly revisionId: string;
  readonly projectId: string;
  readonly timestamp: string;
  readonly reason: string;
  readonly actor: ProjectRevisionActor;
  readonly source: ProjectRevisionSource;
  readonly objectCount: number;
  readonly diff: ProjectRevisionDiffSummary;
}

export interface ProjectRevisionRestoreResult {
  readonly projectId: string;
  readonly restoredFromRevisionId: string;
  readonly safetyRevisionId: string;
  readonly currentRevision: ProjectStorageRevision;
}

export interface ProjectRevisionPort {
  createCheckpoint(projectId: string, reason: string): Promise<ProjectStorageRevision>;
  listRevisionHistory(projectId: string): Promise<readonly ProjectRevisionHistoryEntry[]>;
  restoreRevision(projectId: string, revisionId: string): Promise<ProjectRevisionRestoreResult>;
}

interface ProjectRevisionDiffCounts {
  added: number;
  changed: number;
  removed: number;
  unchanged: number;
}

function requireNonEmpty(value: string, field: string) {
  const normalized = value.trim();
  if (!normalized) throw new TypeError(`${field} must not be empty`);
  return normalized;
}

export function inferProjectRevisionSource(reason: string): ProjectRevisionSource {
  if (reason === 'initial') return 'initial';
  if (reason === 'manual') return 'manual';
  if (['automatic', 'interval', 'autosave-interval'].includes(reason)) return 'automatic';
  if (reason.startsWith('pre-import')) return 'pre-import';
  if (reason.startsWith('pre-migration')) return 'pre-migration';
  if (reason.startsWith('pre-publish') || reason === 'publish') return 'publish';
  if (reason.startsWith('pre-export') || reason === 'export') return 'export';
  if (reason === 'restore' || reason.startsWith('restore:')) return 'restore';
  if (reason.includes('recovery') || reason.includes('safety')) return 'recovery';
  return 'manual';
}

export function inferProjectRevisionActor(source: ProjectRevisionSource): ProjectRevisionActor {
  return source === 'manual' ? 'user' : 'system';
}

function revisionIdentity(entry: ProjectRevisionManifestEntry) {
  return `${entry.schemaVersion}:${entry.checksum}`;
}

function emptyDiffCounts(): ProjectRevisionDiffCounts {
  return { added: 0, changed: 0, removed: 0, unchanged: 0 };
}

export function summarizeProjectRevisionDiff(
  previous: readonly ProjectRevisionManifestEntry[],
  next: readonly ProjectRevisionManifestEntry[],
): ProjectRevisionDiffSummary {
  const before = new Map(previous.map((entry) => [entry.objectId, entry]));
  const after = new Map(next.map((entry) => [entry.objectId, entry]));
  const kinds = new Map<string, ProjectRevisionDiffCounts>();
  let added = 0;
  let changed = 0;
  let removed = 0;
  let unchanged = 0;

  function bucket(kind: string) {
    const current = kinds.get(kind) ?? emptyDiffCounts();
    kinds.set(kind, current);
    return current;
  }

  for (const [objectId, entry] of after) {
    const previousEntry = before.get(objectId);
    const kindBucket = bucket(entry.kind);

    if (!previousEntry) {
      added += 1;
      kindBucket.added += 1;
      continue;
    }

    if (revisionIdentity(previousEntry) === revisionIdentity(entry)) {
      unchanged += 1;
      kindBucket.unchanged += 1;
      continue;
    }

    changed += 1;
    kindBucket.changed += 1;
  }

  for (const [objectId, entry] of before) {
    if (after.has(objectId)) continue;
    removed += 1;
    bucket(entry.kind).removed += 1;
  }

  const byKind = [...kinds.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([kind, counts]) => Object.freeze({ kind, ...counts }));

  return Object.freeze({
    added,
    changed,
    removed,
    unchanged,
    byKind: Object.freeze(byKind),
  });
}

export function createProjectRevisionService(port: ProjectRevisionPort) {
  return Object.freeze({
    list(projectId: string) {
      const normalizedProjectId = requireNonEmpty(projectId, 'projectId');
      return port.listRevisionHistory(normalizedProjectId);
    },
    checkpoint(projectId: string, reason: string) {
      const normalizedProjectId = requireNonEmpty(projectId, 'projectId');
      const normalizedReason = requireNonEmpty(reason, 'reason');
      return port.createCheckpoint(normalizedProjectId, normalizedReason);
    },
    saveRevision(projectId: string) {
      const normalizedProjectId = requireNonEmpty(projectId, 'projectId');
      return port.createCheckpoint(normalizedProjectId, 'manual');
    },
    restore(projectId: string, revisionId: string) {
      const normalizedProjectId = requireNonEmpty(projectId, 'projectId');
      const normalizedRevisionId = requireNonEmpty(revisionId, 'revisionId');
      return port.restoreRevision(normalizedProjectId, normalizedRevisionId);
    },
  });
}

export type ProjectRevisionService = ReturnType<typeof createProjectRevisionService>;
