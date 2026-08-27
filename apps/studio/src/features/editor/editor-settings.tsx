import { VISUAL_HISTORY_LIMITS } from '@electrocraft/application';
import { Button, Input } from '@electrocraft/design-system';
import { useSyncExternalStore } from 'react';
import { HelpTrigger } from '../../help/help-ui';
import { editorHistoryPreferencesRuntime } from './editor-history-preferences-runtime';

export function EditorSettings() {
  const preferences = useSyncExternalStore(
    editorHistoryPreferencesRuntime.subscribe,
    editorHistoryPreferencesRuntime.getSnapshot,
    editorHistoryPreferencesRuntime.getSnapshot,
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
          value={preferences.visualHistoryLimit}
          aria-label="Límite del historial visual"
          onChange={(event) => editorHistoryPreferencesRuntime.setVisualHistoryLimit(Number(event.target.value))}
        />
      </div>

      <div className="ec-topbar-setting-row">
        <div>
          <strong>Valor predeterminado</strong>
          <p>{VISUAL_HISTORY_LIMITS.defaultValue} pasos por sesión.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => editorHistoryPreferencesRuntime.restoreDefault()}>
          Restaurar
        </Button>
      </div>
    </section>
  );
}
