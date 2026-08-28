import { Button, Input } from '@electrocraft/design-system';
import { puckAdvancedSelectionControls } from '@electrocraft/editor-puck';
import { useState, useSyncExternalStore } from 'react';
import './advanced-selection-toolbar.css';

function safely(action: () => void) {
  try {
    action();
  } catch {
    // The adapter publishes a visible diagnostic before rethrowing.
  }
}

export function AdvancedSelectionToolbar() {
  const selection = useSyncExternalStore(
    puckAdvancedSelectionControls.subscribe,
    puckAdvancedSelectionControls.getSnapshot,
    puckAdvancedSelectionControls.getSnapshot,
  );
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');

  if (!selection.connected || selection.selectedIds.length === 0) return null;

  const selectedCount = selection.selectedIds.length;
  const resizeValue = (value: string) => (value.trim() === '' ? null : Math.max(0, Number(value) || 0));

  return (
    <div className="ec-advanced-selection-toolbar" data-advanced-selection-toolbar role="toolbar" aria-label="Selección avanzada">
      <span className="ec-advanced-selection-count" aria-live="polite">
        {selectedCount === 1 ? '1 elemento seleccionado' : `${selectedCount} elementos seleccionados`}
      </span>

      {selectedCount >= 2 ? (
        <Button size="sm" variant="outline" onClick={() => safely(() => puckAdvancedSelectionControls.group())}>
          Agrupar
        </Button>
      ) : (
        <Button size="sm" variant="outline" onClick={() => safely(() => puckAdvancedSelectionControls.ungroup())}>
          Desagrupar
        </Button>
      )}

      {selectedCount === 1 ? (
        <div className="ec-advanced-resize" aria-label="Cambiar tamaño base">
          <label>
            <span>Ancho</span>
            <Input
              inputMode="numeric"
              type="number"
              min={0}
              value={width}
              placeholder="Auto"
              aria-label="Ancho base en píxeles"
              onChange={(event) => setWidth(event.currentTarget.value)}
            />
          </label>
          <label>
            <span>Alto</span>
            <Input
              inputMode="numeric"
              type="number"
              min={0}
              value={height}
              placeholder="Auto"
              aria-label="Alto base en píxeles"
              onChange={(event) => setHeight(event.currentTarget.value)}
            />
          </label>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              safely(() => puckAdvancedSelectionControls.resize(resizeValue(width), resizeValue(height)))
            }
          >
            Aplicar tamaño
          </Button>
        </div>
      ) : null}

      <Button size="sm" variant="ghost" onClick={() => puckAdvancedSelectionControls.clear()}>
        Limpiar selección
      </Button>

      {selection.message ? (
        <span className="ec-advanced-selection-diagnostic" role="alert">
          {selection.message}
        </span>
      ) : null}
    </div>
  );
}
