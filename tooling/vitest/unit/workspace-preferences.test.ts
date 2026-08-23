import {
  DEFAULT_WORKSPACE_LAYOUT,
  MAX_SAVED_WORKSPACE_LAYOUTS,
  WORKSPACE_LAYOUT_LIMITS,
  createWorkspacePreferencesService,
  normalizeWorkspaceLayout,
  resolveResponsiveWorkspaceLayout,
  type WorkspacePreferences,
  type WorkspacePreferencesStoragePort,
} from '@electrocraft/application';
import { describe, expect, it } from 'vitest';

function createMemoryStorage(): WorkspacePreferencesStoragePort {
  let value: WorkspacePreferences | null = null;
  return {
    async read() {
      return value;
    },
    async write(_workspaceId, _key, next) {
      value = structuredClone(next);
    },
  };
}

describe('M04.7 workspace preferences contract', () => {
  it('normalizes unsafe dimensions and preserves the official defaults', () => {
    expect(DEFAULT_WORKSPACE_LAYOUT).toMatchObject({
      sidebarSide: 'left',
      sidebarCollapsed: false,
      sidebarWidth: 240,
      contextWidth: 288,
      inspectorWidth: 320,
    });
    expect(WORKSPACE_LAYOUT_LIMITS.topbar.defaultSize).toBe(52);
    expect(WORKSPACE_LAYOUT_LIMITS.sidebar.collapsedSize).toBe(64);
    expect(WORKSPACE_LAYOUT_LIMITS.status.defaultSize).toBe(26);

    expect(
      normalizeWorkspaceLayout({
        sidebarSide: 'invalid',
        sidebarDisplay: 'invalid',
        sidebarWidth: -100,
        contextWidth: 9999,
        inspectorWidth: Number.NaN,
        visiblePanels: ['context', 'context', 'unknown'],
        sidebarGroupOrder: ['data', 'data', 'build'],
        lastTabs: ['context:components', 'context:components'],
      }),
    ).toMatchObject({
      sidebarSide: 'left',
      sidebarDisplay: 'icons+text',
      sidebarWidth: WORKSPACE_LAYOUT_LIMITS.sidebar.minSize,
      contextWidth: WORKSPACE_LAYOUT_LIMITS.context.maxSize,
      inspectorWidth: WORKSPACE_LAYOUT_LIMITS.inspector.defaultSize,
      visiblePanels: ['context'],
      sidebarGroupOrder: ['data', 'build'],
      lastTabs: ['context:components'],
    });
  });

  it('clamps the effective mobile layout without overwriting the persisted desktop choice', () => {
    const desktop = normalizeWorkspaceLayout({
      ...DEFAULT_WORKSPACE_LAYOUT,
      sidebarCollapsed: false,
      contextWidth: 420,
      inspectorWidth: 460,
    });
    const mobile = resolveResponsiveWorkspaceLayout(desktop, 360);

    expect(mobile.sidebarCollapsed).toBe(true);
    expect(mobile.contextWidth).toBeLessThanOrEqual(Math.floor(360 * 0.82));
    expect(mobile.inspectorWidth).toBeLessThanOrEqual(Math.floor(360 * 0.82));
    expect(desktop.sidebarCollapsed).toBe(false);
    expect(desktop.contextWidth).toBe(420);
    expect(desktop.inspectorWidth).toBe(460);
  });

  it('round-trips saved layouts and keeps saved presets when defaults are restored', async () => {
    const storage = createMemoryStorage();
    let counter = 0;
    const service = createWorkspacePreferencesService(storage, {
      now: () => '2026-08-23T13:00:00.000Z',
      randomId: () => `layout-${++counter}`,
    });

    await service.patchLayout({ sidebarSide: 'right', sidebarWidth: 312, contextWidth: 336 });
    await service.saveCurrentAs('Edición amplia');
    await service.patchLayout({ sidebarSide: 'left', sidebarWidth: 220, contextWidth: 250 });
    let current = await service.applySavedLayout('layout-1');

    expect(current.layout).toMatchObject({ sidebarSide: 'right', sidebarWidth: 312, contextWidth: 336 });
    expect(current.savedLayouts).toHaveLength(1);

    current = await service.renameSavedLayout('layout-1', 'Edición principal');
    expect(current.savedLayouts[0]?.name).toBe('Edición principal');

    current = await service.restoreDefaults();
    expect(current.layout).toEqual(DEFAULT_WORKSPACE_LAYOUT);
    expect(current.savedLayouts).toHaveLength(1);

    current = await service.deleteSavedLayout('layout-1');
    expect(current.savedLayouts).toHaveLength(0);
  });

  it('rejects invalid names, missing presets and more than twenty saved layouts', async () => {
    const service = createWorkspacePreferencesService(createMemoryStorage(), {
      now: () => '2026-08-23T13:00:00.000Z',
      randomId: (() => {
        let counter = 0;
        return () => `layout-${++counter}`;
      })(),
    });

    await expect(service.saveCurrentAs('   ')).rejects.toThrow('workspace layout name is required');
    await expect(service.applySavedLayout('missing')).rejects.toThrow('workspace layout not found');
    await expect(service.renameSavedLayout('missing', 'Otro')).rejects.toThrow('workspace layout not found');
    await expect(service.deleteSavedLayout('missing')).rejects.toThrow('workspace layout not found');

    for (let index = 0; index < MAX_SAVED_WORKSPACE_LAYOUTS; index += 1) {
      await service.saveCurrentAs(`Layout ${index + 1}`);
    }
    await expect(service.saveCurrentAs('Layout extra')).rejects.toThrow('workspace layout limit reached');
  });
});
