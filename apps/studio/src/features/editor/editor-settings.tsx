import { VISUAL_HISTORY_LIMITS } from '@electrocraft/application';
import { Button, Checkbox, Input } from '@electrocraft/design-system';
import { puckCanvasGuideControls } from '@electrocraft/editor-puck';
import { useSyncExternalStore } from 'react';
import { HelpTrigger } from '../../help/help-ui';
import { editorCanvasPreferencesRuntime } from './editor-canvas-preferences-runtime';
import { editorHistoryPreferencesRuntime } from './editor-history-preferences-runtime';

function patchCanvasPreferences(patch: Parameters<typeof editorCanvasPreferencesRuntime.patch>[0]) {
  const next = editorCanvasPreferencesRuntime.patch(patch);
  puckCanvasGuideControls.configure({
    rulersVisible: next.rulersVisible,
    guidesVisible: next.guidesVisible,
    snappingEnabled: next.snappingEnabled,
    gridSize: next.snapGridSize,
  });
}

export function EditorSettings() {
  const historyPreferences = useSyncExternalStore(
    editorHistoryPreferencesRuntime.subscribe,
    editorHistoryPreferencesRuntime.getSnapshot,
    editorHistoryPreferencesRuntime.getSnapshot,
  );
  const canvasPreferences = useSyncExternalStore(
    editorCanvasPreferencesRuntime.subscribe,
    editorCanvasPreferencesRuntime.getSnapshot,
    editorCanvasPreferencesRuntime.getSnapshot,
  );

  return (
    <section
      className="ec-topbar-settings-section"
      aria-labelledby="editor-settings-title"
      data-information-level="primary"
      data-settings-destination="editor"
    >
      <div className="ec-workspace-settings-heading">
        <div>
          <div className="flex items-center gap-2">
            <h2 id="editor-settings-title">Editor</h2>
            <HelpTrigger helpId="help.section.editor" />
          </div>
          <p>Configura el comportamiento de edición visual sin modificar el proyecto publicado.</p>
        </div>
      </div>

      <div className="ec-topbar-setting-row">
        <label htmlFor="editor-visual-history-limit">
          <strong>Historial visual</strong>
          <p>
            Conserva entre {VISUAL_HISTORY_LIMITS.min} y {VISUAL_HISTORY_LIMITS.max} pasos de Deshacer/Rehacer por
            sesión. No modifica el Historial de versiones del proyecto.
          </p>
        </label>
        <Input
          id="editor-visual-history-limit"
          type="number"
          min={VISUAL_HISTORY_LIMITS.min}
          max={VISUAL_HISTORY_LIMITS.max}
          value={historyPreferences.visualHistoryLimit}
          aria-label="Límite del historial visual"
          onChange={(event) => editorHistoryPreferencesRuntime.setVisualHistoryLimit(Number(event.target.value))}
        />
      </div>

      <div className="ec-topbar-setting-row">
        <label htmlFor="editor-rulers-visible">
          <strong>Regla</strong>
          <p>Muestra reglas en los bordes del Canvas para crear guías.</p>
        </label>
        <Checkbox
          id="editor-rulers-visible"
          checked={canvasPreferences.rulersVisible}
          aria-label={canvasPreferences.rulersVisible ? 'Ocultar regla' : 'Mostrar regla'}
          onCheckedChange={(checked) => patchCanvasPreferences({ rulersVisible: checked === true })}
        />
      </div>

      <div className="ec-topbar-setting-row">
        <label htmlFor="editor-guides-visible">
          <strong>Guías</strong>
          <p>Visible u oculto solo en el editor; las guías no se publican.</p>
        </label>
        <Checkbox
          id="editor-guides-visible"
          checked={canvasPreferences.guidesVisible}
          aria-label={canvasPreferences.guidesVisible ? 'Ocultar guías' : 'Mostrar guías'}
          onCheckedChange={(checked) => patchCanvasPreferences({ guidesVisible: checked === true })}
        />
      </div>

      <div className="ec-topbar-setting-row">
        <label htmlFor="editor-snapping-enabled">
          <strong>Ajuste</strong>
          <p>Prioriza guías, hermanos, padre y cuadrícula durante ajustes compatibles.</p>
        </label>
        <Checkbox
          id="editor-snapping-enabled"
          checked={canvasPreferences.snappingEnabled}
          aria-label={canvasPreferences.snappingEnabled ? 'Desactivar ajuste' : 'Activar ajuste'}
          onCheckedChange={(checked) => patchCanvasPreferences({ snappingEnabled: checked === true })}
        />
      </div>

      <div className="ec-topbar-setting-row">
        <label htmlFor="editor-snap-grid-size">
          <strong>Cuadrícula de ajuste</strong>
          <p>Separación base en píxeles cuando no existe una guía de mayor prioridad.</p>
        </label>
        <Input
          id="editor-snap-grid-size"
          type="number"
          min={1}
          max={64}
          value={canvasPreferences.snapGridSize}
          aria-label="Tamaño de la cuadrícula de ajuste"
          onChange={(event) => patchCanvasPreferences({ snapGridSize: Number(event.target.value) })}
        />
      </div>

      <div className="ec-topbar-setting-row">
        <div>
          <strong>Valores predeterminados</strong>
          <p>50 pasos de historial, regla/guías/ajuste visibles y cuadrícula de 8px.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            editorHistoryPreferencesRuntime.restoreDefault();
            const next = editorCanvasPreferencesRuntime.restoreDefault();
            puckCanvasGuideControls.configure({
              rulersVisible: next.rulersVisible,
              guidesVisible: next.guidesVisible,
              snappingEnabled: next.snappingEnabled,
              gridSize: next.snapGridSize,
            });
          }}
        >
          Restaurar
        </Button>
      </div>
    </section>
  );
}
