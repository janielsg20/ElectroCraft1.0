export const EDITOR_WORKSPACE_LAYOUT = Object.freeze({
  context: Object.freeze({ defaultPx: 288, minPx: 240, maxPx: 380 }),
  canvas: Object.freeze({ minPx: 320 }),
  inspector: Object.freeze({ defaultPx: 320, minPx: 280, maxPx: 440 }),
  statusbarPx: 26,
});

export type EditorWorkspaceLayout = typeof EDITOR_WORKSPACE_LAYOUT;
