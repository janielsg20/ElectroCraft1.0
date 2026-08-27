import type { ElectroCraftComponentDefinition, ElectroCraftDocument } from '@electrocraft/domain';
import {
  createPuckConfig,
  createPuckDocumentAdapter,
  electroCraftCorePuckInlineEditing,
  electroCraftCorePuckSlots,
  type PuckDocumentReconstruction,
  type PuckEditorData,
  type PuckRendererRegistry,
} from '@electrocraft/editor-puck';
import { studioPuckDiagnosticRenderer } from './puck-diagnostic-renderer';

export function createStudioPuckDocumentSession(
  document: ElectroCraftDocument,
  definitions: readonly ElectroCraftComponentDefinition[],
  renderers: PuckRendererRegistry,
) {
  const config = createPuckConfig(definitions, renderers, undefined, {
    slots: electroCraftCorePuckSlots,
    inlineEditing: electroCraftCorePuckInlineEditing,
    diagnosticRenderer: studioPuckDiagnosticRenderer,
    diagnosticLabel: 'Componente no disponible',
  });
  const adapter = createPuckDocumentAdapter({
    knownComponentRefs: definitions.map((definition) => definition.key),
    migrationConfig: config,
  });
  const projection = adapter.toPuck(document);

  return Object.freeze({
    config,
    data: projection.data,
    diagnostics: projection.diagnostics,
    reconstruct(data: PuckEditorData): PuckDocumentReconstruction {
      return adapter.fromPuck(data, document);
    },
  });
}

export type StudioPuckDocumentSession = ReturnType<typeof createStudioPuckDocumentSession>;
