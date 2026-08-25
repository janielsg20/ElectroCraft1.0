import type { ElectroCraftComponentDefinition, ElectroCraftDocument } from '@electrocraft/domain';
import {
  createPuckConfig,
  createPuckDocumentAdapter,
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
  const adapter = createPuckDocumentAdapter({
    knownComponentRefs: definitions.map((definition) => definition.key),
  });
  const projection = adapter.toPuck(document);
  const config = createPuckConfig(definitions, renderers, undefined, {
    slots: electroCraftCorePuckSlots,
    diagnosticRenderer: studioPuckDiagnosticRenderer,
    diagnosticLabel: 'Componente no disponible',
  });

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
