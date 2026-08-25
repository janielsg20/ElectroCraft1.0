import type { IncrementalSaveProjectRequest, StoredProjectDefinition } from '@electrocraft/application';
import type { JsonValue } from '@electrocraft/domain';
import type { PuckDocumentReconstruction, PuckEditorData } from '@electrocraft/editor-puck';
import { projectStorageRuntime } from '../projects/project-storage-runtime';
import type { StudioPuckDocumentSession } from './puck-document-session';

export interface PuckDocumentAutosavePort {
  queueAutosave(request: IncrementalSaveProjectRequest): unknown;
}

export interface StudioPuckDocumentPersistenceOptions {
  readonly project: StoredProjectDefinition;
  readonly session: StudioPuckDocumentSession;
  readonly autosave?: PuckDocumentAutosavePort;
}

export function createStudioPuckDocumentPersistenceBridge(options: StudioPuckDocumentPersistenceOptions) {
  const autosave = options.autosave ?? projectStorageRuntime;

  return Object.freeze({
    apply(data: PuckEditorData): PuckDocumentReconstruction {
      const reconstruction = options.session.reconstruct(data);
      const document = reconstruction.document;
      autosave.queueAutosave({
        project: options.project,
        dirtyObjects: [
          {
            objectId: document.id,
            kind: 'document',
            schemaVersion: document.schemaVersion,
            payload: structuredClone(document) as unknown as JsonValue,
          },
        ],
      });
      return reconstruction;
    },
  });
}
