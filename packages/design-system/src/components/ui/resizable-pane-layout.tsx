import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/utils';

export interface ResizablePaneConstraint {
  readonly defaultSize: number;
  readonly minSize: number;
  readonly maxSize: number;
}

export interface ResizableTriPaneProps {
  readonly left: ReactNode;
  readonly center: ReactNode;
  readonly right: ReactNode;
  readonly leftLabel: string;
  readonly rightLabel: string;
  readonly leftConstraint: ResizablePaneConstraint;
  readonly rightConstraint: ResizablePaneConstraint;
  readonly className?: string;
}

export function clampPaneSize(value: number, constraint: ResizablePaneConstraint): number {
  const candidate = Number.isFinite(value) ? value : constraint.defaultSize;
  return Math.min(constraint.maxSize, Math.max(constraint.minSize, Math.round(candidate)));
}

interface PaneHandleProps {
  readonly label: string;
  readonly side: 'left' | 'right';
  readonly value: number;
  readonly constraint: ResizablePaneConstraint;
  readonly onChange: (value: number) => void;
}

function PaneHandle({ label, side, value, constraint, onChange }: PaneHandleProps) {
  const dragStartRef = useRef<{ pointerX: number; size: number } | null>(null);

  const commit = useCallback(
    (next: number) => onChange(clampPaneSize(next, constraint)),
    [constraint, onChange],
  );

  const onPointerMove = useCallback(
    (event: globalThis.PointerEvent) => {
      const start = dragStartRef.current;
      if (!start) return;
      const delta = event.clientX - start.pointerX;
      commit(start.size + (side === 'left' ? delta : -delta));
    },
    [commit, side],
  );

  const endDrag = useCallback(() => {
    dragStartRef.current = null;
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', endDrag);
    window.removeEventListener('pointercancel', endDrag);
  }, [onPointerMove]);

  useEffect(() => endDrag, [endDrag]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    dragStartRef.current = { pointerX: event.clientX, size: value };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 24 : 8;
    let next: number | null = null;
    if (event.key === 'Home') next = constraint.minSize;
    if (event.key === 'End') next = constraint.maxSize;
    if (event.key === 'ArrowLeft') next = value + (side === 'left' ? -step : step);
    if (event.key === 'ArrowRight') next = value + (side === 'left' ? step : -step);
    if (next === null) return;
    event.preventDefault();
    commit(next);
  };

  return (
    <div
      className="ec-resizable-pane-handle"
      role="separator"
      tabIndex={0}
      aria-label={label}
      aria-orientation="vertical"
      aria-valuemin={constraint.minSize}
      aria-valuemax={constraint.maxSize}
      aria-valuenow={value}
      data-resize-side={side}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
    >
      <span className="ec-resizable-pane-grip" aria-hidden="true" />
    </div>
  );
}

export function ResizableTriPane({
  left,
  center,
  right,
  leftLabel,
  rightLabel,
  leftConstraint,
  rightConstraint,
  className,
}: ResizableTriPaneProps) {
  const [leftSize, setLeftSize] = useState(() =>
    clampPaneSize(leftConstraint.defaultSize, leftConstraint),
  );
  const [rightSize, setRightSize] = useState(() =>
    clampPaneSize(rightConstraint.defaultSize, rightConstraint),
  );

  const style = {
    '--ec-resizable-left': `${leftSize}px`,
    '--ec-resizable-right': `${rightSize}px`,
  } as CSSProperties;

  return (
    <div className={cn('ec-resizable-tri-pane', className)} style={style}>
      <div className="ec-resizable-tri-pane-left">{left}</div>
      <PaneHandle
        side="left"
        label={leftLabel}
        value={leftSize}
        constraint={leftConstraint}
        onChange={setLeftSize}
      />
      <div className="ec-resizable-tri-pane-center">{center}</div>
      <PaneHandle
        side="right"
        label={rightLabel}
        value={rightSize}
        constraint={rightConstraint}
        onChange={setRightSize}
      />
      <div className="ec-resizable-tri-pane-right">{right}</div>
    </div>
  );
}
