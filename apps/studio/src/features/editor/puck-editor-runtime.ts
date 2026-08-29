import type { OpenProjectResult, StoredProjectDefinition } from '@electrocraft/application';
import {
  createDeterministicObjectId,
  electroCraftDocumentNodeSchema,
  electroCraftDocumentSchema,
  importElectroCraftDocument,
  type ElectroCraftComponentDefinition,
  type ElectroCraftDocument,
  type ElectroCraftDocumentNode,
  type JsonValue,
} from '@electrocraft/domain';
import {
  puckAdvancedSelectionControls,
  puckCanvasGuideControls,
  puckContextControls,
  puckEditorCommandControls,
  type PuckRendererRegistry,
} from '@electrocraft/editor-puck';
import { projectStorageRuntime } from '../projects/project-storage-runtime';
import { editorCanvasPreferencesRuntime } from './editor-canvas-preferences-runtime';
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
  readonly documentId?: string;
  readonly definitions?: readonly ElectroCraftComponentDefinition[];
  readonly renderers?: PuckRendererRegistry;
  readonly projectRuntime?: StudioPuckProjectRuntimePort;
  readonly onSynchronized?: Parameters<typeof createStudioPuckActionSync>[0]['onSynchronized'];
  readonly onError?: Parameters<typeof createStudioPuckActionSync>[0]['onError'];
}

function createInitialScreen(project: StoredProjectDefinition): ElectroCraftDocument {
  const documentId = createDeterministicObjectId('document', `${project.id}:studio-primary-screen`);
  return electroCraftDocumentSchema.parse({
    schemaVersion: 4,
    id: documentId,
    version: 1,
    name: project.name,
    kind: 'screen',
    root: {
      id: createDeterministicObjectId('node', `${documentId}:root`),
      componentRef: 'core.root',
      props: {},
      layout: null,
      style: null,
      children: [],
    },
    references: { documentRefs: [] },
    metadata: {},
    formMeta: null,
    templateMeta: null,
  });
}

function payloadDocumentKind(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
  const kind = (payload as { kind?: unknown }).kind;
  return typeof kind === 'string' ? kind : null;
}

function documentPriority(payload: unknown) {
  switch (payloadDocumentKind(payload)) {
    case 'screen':
      return 0;
    case 'admin-screen':
    case 'form':
    case 'template':
      return 1;
    case 'reusable-component':
      return 2;
    default:
      return 1;
  }
}

function parseProjectDocument(object: OpenProjectResult['objects'][number]): ElectroCraftDocument {
  try {
    return importElectroCraftDocument(object.payload).document;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'documento canónico inválido';
    throw new TypeError(`No se pudo abrir el documento ${object.objectId}: ${message}`);
  }
}

function resolveProjectDocument(
  opened: OpenProjectResult,
  preferredDocumentId?: string,
): { document: ElectroCraftDocument; created: boolean } {
  const documentObjects = opened.objects
    .filter((object) => object.kind === 'document')
    .sort((left, right) => {
      const priority = documentPriority(left.payload) - documentPriority(right.payload);
      return priority === 0 ? left.objectId.localeCompare(right.objectId) : priority;
    });

  if (preferredDocumentId) {
    const preferred = documentObjects.find(({ objectId }) => objectId === preferredDocumentId);
    if (!preferred) throw new Error('La Pantalla seleccionada ya no existe en este proyecto.');
    const document = parseProjectDocument(preferred);
    if (document.kind !== 'screen') throw new Error('El documento seleccionado no es una Pantalla editable.');
    return { document, created: false };
  }

  if (documentObjects.length === 0) {
    return { document: createInitialScreen(opened.project), created: true };
  }

  return { document: parseProjectDocument(documentObjects[0]), created: false };
}

function cloneReusableNode(
  node: ElectroCraftDocumentNode,
  documentId: string,
  path = 'root',
): ElectroCraftDocumentNode {
  return electroCraftDocumentNodeSchema.parse({
    ...structuredClone(node),
    id: createDeterministicObjectId('node', `${documentId}:${path}`),
    children: node.children.map((child, index) => cloneReusableNode(child, documentId, `${path}.${index}`)),
  });
}

function createReusableComponentDocument(node: ElectroCraftDocumentNode): ElectroCraftDocument {
  const documentId = createDeterministicObjectId(
    'document',
    `reusable:${node.componentRef}:${globalThis.crypto.randomUUID()}`,
  );
  return electroCraftDocumentSchema.parse({
    schemaVersion: 4,
    id: documentId,
    version: 1,
    name: `Bloque ${node.componentRef}`,
    kind: 'reusable-component',
    root: cloneReusableNode(node, documentId),
    references: { documentRefs: [] },
    metadata: { source: 'editor-context-save-as-block' },
    formMeta: null,
    templateMeta: null,
  });
}

/**
 * Opens the current local project, establishes one canonical Puck session and
 * wires Puck onAction -> canonical reconstruction -> F04 incremental autosave.
 * A preferred documentId lets Pantallas open the exact canonical screen while
 * preserving the existing deterministic fallback for direct Editor visits.
 */
export async function loadStudioPuckEditor(options: LoadStudioPuckEditorOptions) {
  const runtime = options.projectRuntime ?? projectStorageRuntime;
  await runtime.initialize();
  const canvasPreferences = editorCanvasPreferencesRuntime.getSnapshot();
  puckCanvasGuideControls.configure({
    rulersVisible: canvasPreferences.rulersVisible,
    guidesVisible: canvasPreferences.guidesVisible,
    snappingEnabled: canvasPreferences.snappingEnabled,
    gridSize: canvasPreferences.snapGridSize,
  });

  const opened = await runtime.openProject(options.projectId);
  if (!opened) throw new Error('El proyecto seleccionado ya no está disponible.');

  const { document, created } = resolveProjectDocument(opened, options.documentId);
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
  const disconnectBlockSaver = puckContextControls.connectBlockSaver((node) => {
    const block = createReusableComponentDocument(node);
    runtime.queueAutosave({
      project: opened.project,
      dirtyObjects: [
        {
          objectId: block.id,
          kind: 'document',
          schemaVersion: block.schemaVersion,
          payload: structuredClone(block) as unknown as JsonValue,
        },
      ],
    });
    return block.id;
  });

  if (created) persistence.apply(session.data);

  return Object.freeze({
    project: opened.project,
    document,
    created,
    session,
    persistence,
    actionSync,
    dispose() {
      disconnectBlockSaver();
    },
  });
}

/**
 * Studio-facing command delegation for documented Puck actions. These are the
 * same session-only bridges mounted by PuckEditorRoot and carry no editor Data,
 * AppState or history copy of their own.
 */
export const studioPuckEditorCommands = puckEditorCommandControls;
export const studioPuckAdvancedSelection = puckAdvancedSelectionControls;
export const studioPuckContextControls = puckContextControls;

export type StudioPuckEditorRuntime = Awaited<ReturnType<typeof loadStudioPuckEditor>>;
