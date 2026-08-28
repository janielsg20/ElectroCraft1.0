import { useSyncExternalStore, type KeyboardEvent, type MouseEvent } from 'react';
import { puckCanvasGuideControls, type PuckCanvasGuide } from './puck-canvas-guides';

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

/**
 * Editor-only visual extension layered beside Puck.Preview. It never intercepts
 * Puck's component drag surface; only rulers and guide handles are interactive.
 */
export function PuckCanvasGuideOverlay() {
  const snapshot = useSyncExternalStore(
    puckCanvasGuideControls.subscribe,
    puckCanvasGuideControls.getSnapshot,
    puckCanvasGuideControls.getSnapshot,
  );

  if (!snapshot.rulersVisible && !snapshot.guidesVisible) return null;

  return (
    <div className="ec-canvas-guides" data-canvas-guides aria-label="Guías y ajuste del lienzo">
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
  );
}
