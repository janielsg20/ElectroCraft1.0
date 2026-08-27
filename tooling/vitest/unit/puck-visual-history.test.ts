import { VISUAL_HISTORY_LIMITS, normalizeVisualHistoryLimit } from '@electrocraft/application';
import { applyPuckHistoryPolicy, puckEditorHistoryControls, resolvePuckHistoryWindow } from '@electrocraft/editor-puck';
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  puckEditorHistoryControls.setVisualHistoryLimit(VISUAL_HISTORY_LIMITS.defaultValue);
});

describe('M05.5 Puck visual history policy', () => {
  it('normalizes the safe default and clamps the supported range', () => {
    expect(normalizeVisualHistoryLimit(undefined)).toBe(50);
    expect(normalizeVisualHistoryLimit(Number.NaN)).toBe(50);
    expect(normalizeVisualHistoryLimit(0)).toBe(1);
    expect(normalizeVisualHistoryLimit(1)).toBe(1);
    expect(normalizeVisualHistoryLimit(101)).toBe(100);
    expect(normalizeVisualHistoryLimit(42.6)).toBe(43);
  });

  it('keeps current plus one undo step when the configured limit is one', () => {
    const histories = ['initial', 'edit', 'delete'];
    expect(resolvePuckHistoryWindow(histories, 2, 1)).toEqual({
      histories: ['edit', 'delete'],
      index: 1,
    });
  });

  it('keeps the default and maximum windows bounded at the current tip', () => {
    const defaultLimit = VISUAL_HISTORY_LIMITS.defaultValue;
    const defaultLength = defaultLimit + 8;
    const defaultHistories = Array.from({ length: defaultLength }, (_, index) => index);
    const defaultPlan = resolvePuckHistoryWindow(defaultHistories, defaultLength - 1, defaultLimit);
    expect(defaultPlan?.histories).toHaveLength(defaultLimit + 1);
    expect(defaultPlan?.histories.at(-1)).toBe(defaultHistories.at(-1));

    const maxLimit = VISUAL_HISTORY_LIMITS.max;
    const maxLength = maxLimit + 4;
    const maxHistories = Array.from({ length: maxLength }, (_, index) => index);
    const maxPlan = resolvePuckHistoryWindow(maxHistories, maxLength - 1, maxLimit);
    expect(maxPlan?.histories).toHaveLength(maxLimit + 1);
    expect(maxPlan?.index).toBe(maxLimit);
  });

  it('defers trimming while positioned before the tip so redo and branching stay intact', () => {
    const histories = ['initial', 'edit-a', 'drag', 'delete'];
    expect(resolvePuckHistoryWindow(histories, 1, 1)).toBeNull();

    const branchAfterUndo = ['initial', 'edit-a', 'edit-b'];
    expect(resolvePuckHistoryWindow(branchAfterUndo, 2, 1)).toEqual({
      histories: ['edit-a', 'edit-b'],
      index: 1,
    });
  });

  it('applies the bounded window through both public Puck setters without changing the tip', () => {
    const setHistories = vi.fn();
    const setHistoryIndex = vi.fn();
    const plan = applyPuckHistoryPolicy(
      {
        histories: ['initial', 'edit', 'drag', 'delete'],
        index: 3,
        setHistories,
        setHistoryIndex,
      },
      2,
    );

    expect(plan).toEqual({ histories: ['edit', 'drag', 'delete'], index: 2 });
    expect(setHistories).toHaveBeenCalledWith(['edit', 'drag', 'delete']);
    expect(setHistoryIndex).toHaveBeenCalledWith(2);

    setHistories.mockClear();
    setHistoryIndex.mockClear();
    expect(
      applyPuckHistoryPolicy(
        {
          histories: ['initial', 'edit', 'drag', 'delete'],
          index: 1,
          setHistories,
          setHistoryIndex,
        },
        2,
      ),
    ).toBeNull();
    expect(setHistories).not.toHaveBeenCalled();
    expect(setHistoryIndex).not.toHaveBeenCalled();
  });

  it('delegates undo and redo without owning a second history stack', () => {
    const undo = vi.fn();
    const redo = vi.fn();
    puckEditorHistoryControls.setVisualHistoryLimit(12);
    const disconnect = puckEditorHistoryControls.connect({ undo, redo });

    puckEditorHistoryControls.updateAvailability(true, false);
    let snapshot = puckEditorHistoryControls.getSnapshot();
    expect(snapshot.canUndo).toBe(true);
    expect(snapshot.canRedo).toBe(false);
    expect(snapshot.visualHistoryLimit).toBe(12);
    expect(puckEditorHistoryControls.undo()).toBe(true);
    expect(puckEditorHistoryControls.redo()).toBe(false);
    expect(undo).toHaveBeenCalledTimes(1);
    expect(redo).not.toHaveBeenCalled();

    puckEditorHistoryControls.updateAvailability(false, true);
    expect(puckEditorHistoryControls.redo()).toBe(true);
    expect(redo).toHaveBeenCalledTimes(1);

    disconnect();
    snapshot = puckEditorHistoryControls.getSnapshot();
    expect(snapshot.canUndo).toBe(false);
    expect(snapshot.canRedo).toBe(false);
    expect(snapshot.visualHistoryLimit).toBe(12);
  });
});
