import {
  createElectroCraftCanonicalSnapshotChecksum,
  electroCraftMetadataSchema,
  jsonValueSchema,
  type ElectroCraftCanonicalSnapshotChecksum,
  type ElectroCraftMetadata,
  type JsonValue,
} from '@electrocraft/domain';
import type { OpenProjectResult, StoredProjectDefinition } from './project-storage';

export const PROJECT_BACKUP_FORMAT = 'electrocraft.project-backup' as const;
export const PROJECT_BACKUP_VERSION = 1 as const;

export type ProjectBackupCollisionStrategy = 'copy' | 'replace' | 'reject';

export interface ProjectBackupObject {
  readonly objectId: string;
  readonly kind: string;
  readonly schemaVersion: number;
  readonly payload: JsonValue;
  readonly checksum: ElectroCraftCanonicalSnapshotChecksum;
}

export interface ProjectBackupContent {
  readonly format: typeof PROJECT_BACKUP_FORMAT;
  readonly version: typeof PROJECT_BACKUP_VERSION;
  readonly exportedAt: string;
  readonly project: StoredProjectDefinition;
  readonly objects: readonly ProjectBackupObject[];
}

export interface ProjectBackupPackage extends ProjectBackupContent {
  readonly checksum: ElectroCraftCanonicalSnapshotChecksum;
}

export interface ProjectBackupImportResult {
  readonly projectId: string;
  readonly sourceProjectId: string;
  readonly objectCount: number;
  readonly collision: 'none' | ProjectBackupCollisionStrategy;
  readonly checksum: ElectroCraftCanonicalSnapshotChecksum;
}

function requireRecord(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(`${field} must be an object`);
  return value as Record<string, unknown>;
}

function requireNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${field} must not be empty`);
  return value.trim();
}

function requireIsoDate(value: unknown, field: string): string {
  const text = requireNonEmptyString(value, field);
  if (Number.isNaN(Date.parse(text))) throw new TypeError(`${field} must be a valid ISO date`);
  return text;
}

function canonicalContent(content: ProjectBackupContent): JsonValue {
  return {
    format: content.format,
    version: content.version,
    exportedAt: content.exportedAt,
    project: {
      id: content.project.id,
      name: content.project.name,
      metadata: content.project.metadata,
    },
    objects: content.objects.map((object) => ({
      objectId: object.objectId,
      kind: object.kind,
      schemaVersion: object.schemaVersion,
      payload: object.payload,
      checksum: object.checksum,
    })),
  } as JsonValue;
}

function freezePackage(content: ProjectBackupContent, checksum: ElectroCraftCanonicalSnapshotChecksum): ProjectBackupPackage {
  return Object.freeze({
    ...content,
    project: Object.freeze({ ...content.project }),
    objects: Object.freeze(content.objects.map((object) => Object.freeze({ ...object }))),
    checksum,
  });
}

export function createProjectBackupPackage(
  opened: OpenProjectResult,
  exportedAt = new Date().toISOString(),
): ProjectBackupPackage {
  const project: StoredProjectDefinition = Object.freeze({
    id: requireNonEmptyString(opened.project.id, 'project.id'),
    name: requireNonEmptyString(opened.project.name, 'project.name'),
    metadata: electroCraftMetadataSchema.parse(opened.project.metadata),
  });
  const objects = Object.freeze(
    [...opened.objects]
      .sort((left, right) => left.objectId.localeCompare(right.objectId))
      .map((object) => {
        const checksum = createElectroCraftCanonicalSnapshotChecksum(object.payload);
        if (checksum !== object.checksum) throw new TypeError(`project object checksum mismatch: ${object.objectId}`);
        return Object.freeze({
          objectId: requireNonEmptyString(object.objectId, 'object.objectId'),
          kind: requireNonEmptyString(object.kind, 'object.kind'),
          schemaVersion: object.schemaVersion,
          payload: object.payload,
          checksum,
        });
      }),
  );
  const content: ProjectBackupContent = Object.freeze({
    format: PROJECT_BACKUP_FORMAT,
    version: PROJECT_BACKUP_VERSION,
    exportedAt: requireIsoDate(exportedAt, 'exportedAt'),
    project,
    objects,
  });
  return freezePackage(content, createElectroCraftCanonicalSnapshotChecksum(canonicalContent(content)));
}

export function validateProjectBackupPackage(input: unknown): ProjectBackupPackage {
  const root = requireRecord(input, 'backup');
  if (root.format !== PROJECT_BACKUP_FORMAT) throw new TypeError(`unsupported project backup format: ${String(root.format)}`);
  if (root.version !== PROJECT_BACKUP_VERSION) {
    throw new TypeError(`unsupported project backup version: ${String(root.version)}`);
  }
  const projectInput = requireRecord(root.project, 'project');
  const project: StoredProjectDefinition = Object.freeze({
    id: requireNonEmptyString(projectInput.id, 'project.id'),
    name: requireNonEmptyString(projectInput.name, 'project.name'),
    metadata: electroCraftMetadataSchema.parse(projectInput.metadata) as ElectroCraftMetadata,
  });
  if (!Array.isArray(root.objects)) throw new TypeError('objects must be an array');
  const objectIds = new Set<string>();
  const objects = Object.freeze(
    root.objects.map((value, index) => {
      const object = requireRecord(value, `objects[${index}]`);
      const objectId = requireNonEmptyString(object.objectId, `objects[${index}].objectId`);
      if (objectIds.has(objectId)) throw new TypeError(`duplicate project backup object: ${objectId}`);
      objectIds.add(objectId);
      const kind = requireNonEmptyString(object.kind, `objects[${index}].kind`);
      if (!Number.isSafeInteger(object.schemaVersion) || Number(object.schemaVersion) < 1) {
        throw new TypeError(`objects[${index}].schemaVersion must be a positive safe integer`);
      }
      const payload = jsonValueSchema.parse(object.payload);
      const checksum = createElectroCraftCanonicalSnapshotChecksum(payload);
      if (object.checksum !== checksum) throw new TypeError(`project object checksum mismatch: ${objectId}`);
      return Object.freeze({
        objectId,
        kind,
        schemaVersion: Number(object.schemaVersion),
        payload,
        checksum,
      });
    }),
  );
  const content: ProjectBackupContent = Object.freeze({
    format: PROJECT_BACKUP_FORMAT,
    version: PROJECT_BACKUP_VERSION,
    exportedAt: requireIsoDate(root.exportedAt, 'exportedAt'),
    project,
    objects,
  });
  const checksum = createElectroCraftCanonicalSnapshotChecksum(canonicalContent(content));
  if (root.checksum !== checksum) throw new TypeError('project backup checksum mismatch');
  return freezePackage(content, checksum);
}

export function serializeProjectBackupPackage(backup: ProjectBackupPackage): string {
  return JSON.stringify(validateProjectBackupPackage(backup));
}

export function parseProjectBackupPackage(serialized: string): ProjectBackupPackage {
  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized) as unknown;
  } catch (error) {
    throw new TypeError(error instanceof Error ? `invalid project backup JSON: ${error.message}` : 'invalid project backup JSON');
  }
  return validateProjectBackupPackage(parsed);
}
