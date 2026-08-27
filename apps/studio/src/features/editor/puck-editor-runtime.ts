import type { OpenProjectResult, StoredProjectDefinition } from '@electrocraft/application';
import {
  createDeterministicObjectId,
  electroCraftDocumentSchema,
  importElectroCraftDocument,
  type ElectroCraftComponentDefinition,
  type ElectroCraftDocument,
} from '@electrocraft/domain';
import { puckEditorCommandControls, type PuckRendererRegistry } from '@electrocraft/editor-puck';
import { projectStorageRuntime } from '../projects/project-storage-runtime';
import { createStudioPuckActionSync } from './puck-action-sync';
import { studioCoreEditorDefinitions, studioCoreEditorRenderers } from './puck-core-components';
import { createStudioPuckDocumentPersistenceBridge, type PuckDocumentAutosavePort } from './puck-document-persistence';
import { createStudioPuckDocumentSession } from './puck-document-session';

export interface StudioPuckProjectRuntimePort extends PuckDocumentAutosavePort {
  initialize(): Promise<unknown>;
  openProject(projectId: string): Promise<OpenProjectResult | null>;
}

export interface LoadStudioPuckEditorOptions {
  readonly projectId: string;
  readonly definitions?: readonly ElectroCraftComponentDefinition[];
  readonly renderers?: PuckRendererRegistry;
  readonly projectRuntime?: StudioPuckProjectRuntimePort;
  readonly onSynchronized?: Parameters<typeof createStudioPuckActionSync>[0]['onSynchronized'];
  readonly onError?: Parameters<typeof createStudioPuckActionSync>[0]['onError'];
}

function createInitialScreen(project: StoredProjectDefinition): ElectroCraftDocument {
  const documentId = createDeterministicObjectId('document', `${project.id}:studio-primary-screen`);
  return electroCraftDocumentSchema.parse({
    schemaVersion: 3,
    id: documentId,
    version: 1,
    name: project.name,
    kind: 'screen',
    root: {
      id: createDeterministicObjectId('node', `${documentId}:root`),
      componentRef: 'core.root',
      props: {},
      children: [],
    },
    references: { documentRefs: [] },
    metadata: {},
    formMeta: null,
    templateMeta: null,
  });
}

function resolveProjectDocument(opened: OpenProjectResult): { document: ElectroCraftDocument; created: boolean } {
  const documentObjects = opened.objects
    .filter((object) => object.kind === 'document')
    .sort((left, right) => left.objectId.localeCompare(right.objectId));

  if (documentObjects.length === 0) {
    return { document: createInitialScreen(opened.project), created: true };
  }

  const object = documentObjects[0];
  try {
    return { document: importElectroCraftDocument(object.payload).document, created: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'documento canónico inválido';
    throw new TypeError(`No se pudo abrir el documento ${object.objectId}: ${message}`);
  }
}

/**
 * Opens the current local project, establishes one canonical Puck session and
 * wires Puck onAction -> canonical reconstruction -> F04 incremental autosave.
 * The real Studio defaults to the deterministic core editor kit so Palette and
 * Puck.Components can insert Container/Text/Image/Button in a fresh project.
 * Definitions/renderers remain injectable for tests and later component packs
 * without introducing a second registry or persisting editor-only internals.
 */
export async function loadStudioPuckEditor(options: LoadStudioPuckEditorOptions) {
  const runtime = options.projectRuntime ?? projectStorageRuntime;
  await runtime.initialize();
  const opened = await runtime.openProject(options.projectId);
  if (!opened) throw new Error('El proyecto seleccionado ya no está disponible.');

  const { document, created } = resolveProjectDocument(opened);
  const definitions = options.definitions ?? studioCoreEditorDefinitions;
  const renderers = options.renderers ?? studioCoreEditorRenderers;
  const session = createStudioPuckDocumentSession(document, definitions, renderers);
  const persistence = createStudioPuckDocumentPersistenceBridge({
    project: opened.project,
    session,
    autosave: runtime,
  });
  const actionSync = createStudioPuckActionSync({
    persistence,
    onSynchronized: options.onSynchronized,
    onError: options.onError,
  });

  if (created) persistence.apply(session.data);

  return Object.freeze({
    project: opened.project,
    document,
    created,
    session,
    persistence,
    actionSync,
  });
}

/**
 * Studio-facing command delegation for documented Puck actions. This is the
 * same session-only bridge mounted by PuckEditorRoot and carries no editor
 * state of its own.
 */
export const studioPuckEditorCommands = puckEditorCommandControls;

export type StudioPuckEditorRuntime = Awaited<ReturnType<typeof loadStudioPuckEditor>>;
