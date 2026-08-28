import { useState, useSyncExternalStore, type KeyboardEvent, type MouseEvent } from 'react';
import { puckAdvancedSelectionControls } from './puck-advanced-selection';
import { puckCanvasGuideControls, type PuckCanvasGuide } from './puck-canvas-guides';
import { PuckContextBridge } from './puck-context-bridge';
import { puckContextControls } from './puck-context-controls';

function addGuideFromRuler(event: MouseEvent<HTMLButtonElement>, axis: 'x' | 'y') {
  const rect = event.currentTarget.getBoundingClientRect();
  const position = axis === 'x' ? event.clientX - rect.left : event.clientY - rect.top;
  puckCanvasGuideControls.addGuide(axis, position);
}

function handleGuideKey(event: KeyboardEvent<HTMLButtonElement>, guide: PuckCanvasGuide) {
  if (event.key === 'Delete' || event.key === 'Backspace') {
    event.preventDefault();
    puckCanvasGuideControls.removeGuide(guide.id);
    return;
  }
  const negative = guide.axis === 'x' ? event.key === 'ArrowLeft' : event.key === 'ArrowUp';
  const positive = guide.axis === 'x' ? event.key === 'ArrowRight' : event.key === 'ArrowDown';
  if (!negative && !positive) return;
  event.preventDefault();
  const step = event.shiftKey ? 8 : 1;
  puckCanvasGuideControls.moveGuide(guide.id, guide.position + (negative ? -step : step));
}

function safely(action: () => void) {
  try {
    action();
  } catch {
    // The adapter publishes a visible diagnostic before rethrowing.
  }
}

function ContextBar() {
  const context = useSyncExternalStore(
    puckContextControls.subscribe,
    puckContextControls.getSnapshot,
    puckContextControls.getSnapshot,
  );
  if (!context.connected || !context.selectedId) return null;
  const locked = context.lockedIds.includes(context.selectedId);

  return (
    <div className="ec-canvas-context-bar" data-canvas-context-bar>
      <nav className="ec-canvas-breadcrumbs" aria-label="Jerarquía del componente seleccionado">
        {context.breadcrumbs.map((crumb, index) => (
          <span key={crumb.id}>
            {index > 0 ? <span aria-hidden="true">›</span> : null}
            <span>{crumb.label}</span>
          </span>
        ))}
      </nav>
      <details className="ec-canvas-context-menu">
        <summary>Acciones</summary>
        <div className="ec-canvas-context-menu-content" role="menu" aria-label="Acciones contextuales">
          <button type="button" role="menuitem" onClick={() => safely(() => puckContextControls.copy())}>
            Copiar
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={!context.clipboardAvailable}
            onClick={() => safely(() => puckContextControls.paste())}
          >
            Pegar
          </button>
          <button type="button" role="menuitem" onClick={() => safely(() => puckContextControls.duplicate())}>
            Duplicar
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={!context.blockSaverConnected}
            onClick={() => safely(() => puckContextControls.saveAsBlock())}
          >
            Guardar como bloque
          </button>
          <button type="button" role="menuitem" onClick={() => safely(() => puckContextControls.setVisible(context.hidden))}>
            {context.hidden ? 'Visible' : 'Ocultar'}
          </button>
          <button type="button" role="menuitem" onClick={() => safely(() => puckContextControls.toggleLock())}>
            {locked ? 'Desbloquear' : 'Bloquear'}
          </button>
          <button
            type="button"
            role="menuitem"
            className="ec-context-action-destructive"
            onClick={() => safely(() => puckContextControls.remove())}
          >
            Eliminar
          </button>
        </div>
      </details>
      {context.message ? (
        <span className="ec-context-diagnostic" role="alert">
          {context.message}
        </span>
      ) : null}
    </div>
  );
}

function AdvancedSelectionBar() {
  const selection = useSyncExternalStore(
    puckAdvancedSelectionControls.subscribe,
    puckAdvancedSelectionControls.getSnapshot,
    puckAdvancedSelectionControls.getSnapshot,
  );
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');

  if (!selection.connected || selection.selectedIds.length === 0) return null;
  const count = selection.selectedIds.length;
  const size = (value: string) => (value.trim() === '' ? null : Math.max(0, Number(value) || 0));

  return (
    <div className="ec-advanced-selection-toolbar" data-advanced-selection-toolbar role="toolbar" aria-label="Selección avanzada">
      <span className="ec-advanced-selection-count" aria-live="polite">
        {count === 1 ? '1 elemento seleccionado' : `${count} elementos seleccionados`}
      </span>
      {count >= 2 ? (
        <button type="button" className="ec-advanced-selection-action" onClick={() => safely(() => puckAdvancedSelectionControls.group())}>
          Agrupar
        </button>
      ) : (
        <button type="button" className="ec-advanced-selection-action" onClick={() => safely(() => puckAdvancedSelectionControls.ungroup())}>
          Desagrupar
        </button>
      )}
      {count === 1 ? (
        <div className="ec-advanced-resize" aria-label="Cambiar tamaño base">
          <label>
            <span>Ancho</span>
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={width}
              placeholder="Auto"
              aria-label="Ancho base en píxeles"
              onChange={(event) => setWidth(event.currentTarget.value)}
            />
          </label>
          <label>
            <span>Alto</span>
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={height}
              placeholder="Auto"
              aria-label="Alto base en píxeles"
              onChange={(event) => setHeight(event.currentTarget.value)}
            />
          </label>
          <button
            type="button"
            className="ec-advanced-selection-action"
            onClick={() => safely(() => puckAdvancedSelectionControls.resize(size(width), size(height)))}
          >
            Aplicar tamaño
          </button>
        </div>
      ) : null}
      <button type="button" className="ec-advanced-selection-action ec-advanced-selection-action--ghost" onClick={() => puckAdvancedSelectionControls.clear()}>
        Limpiar selección
      </button>
      {selection.message ? (
        <span className="ec-advanced-selection-diagnostic" role="alert">
          {selection.message}
        </span>
      ) : null}
    </div>
  );
}

/**
 * Editor-only visual extension layered beside Puck.Preview. It never intercepts
 * Puck's component drag surface; only rulers, guide handles and explicit
 * contextual controls are interactive.
 */
export function PuckCanvasGuideOverlay() {
  const snapshot = useSyncExternalStore(
    puckCanvasGuideControls.subscribe,
    puckCanvasGuideControls.getSnapshot,
    puckCanvasGuideControls.getSnapshot,
  );
  const selection = useSyncExternalStore(
    puckAdvancedSelectionControls.subscribe,
    puckAdvancedSelectionControls.getSnapshot,
    puckAdvancedSelectionControls.getSnapshot,
  );
  const context = useSyncExternalStore(
    puckContextControls.subscribe,
    puckContextControls.getSnapshot,
    puckContextControls.getSnapshot,
  );

  return (
    <>
      <PuckContextBridge />
      {snapshot.rulersVisible || snapshot.guidesVisible || selection.selectedIds.length > 0 || context.selectedId ? (
        <div className="ec-canvas-guides" data-canvas-guides aria-label="Guías, ajuste y acciones contextuales del lienzo">
          <ContextBar />
          <AdvancedSelectionBar />
          {snapshot.rulersVisible ? (
            <>
              <button
                type="button"
                className="ec-canvas-ruler ec-canvas-ruler--x"
                aria-label="Regla horizontal. Haz clic para crear una guía vertical"
                onClick={(event) => addGuideFromRuler(event, 'x')}
              />
              <button
                type="button"
                className="ec-canvas-ruler ec-canvas-ruler--y"
                aria-label="Regla vertical. Haz clic para crear una guía horizontal"
                onClick={(event) => addGuideFromRuler(event, 'y')}
              />
            </>
          ) : null}

          {snapshot.guidesVisible
            ? snapshot.guides.map((guide) => (
                <button
                  key={guide.id}
                  type="button"
                  className={`ec-canvas-guide ec-canvas-guide--${guide.axis}`}
                  style={guide.axis === 'x' ? { left: `${guide.position}px` } : { top: `${guide.position}px` }}
                  aria-label={`Guía ${guide.axis === 'x' ? 'vertical' : 'horizontal'} en ${guide.position} píxeles. Flechas para mover, Suprimir para eliminar.`}
                  onKeyDown={(event) => handleGuideKey(event, guide)}
                  onDoubleClick={() => puckCanvasGuideControls.removeGuide(guide.id)}
                >
                  <span>{guide.position}px</span>
                </button>
              ))
            : null}

          {snapshot.feedback?.snapped ? (
            <output className="ec-canvas-snap-feedback" aria-live="polite">
              Ajuste · {snapshot.feedback.label ?? snapshot.feedback.source} · {snapshot.feedback.distance >= 0 ? '+' : ''}
              {snapshot.feedback.distance}px
            </output>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
