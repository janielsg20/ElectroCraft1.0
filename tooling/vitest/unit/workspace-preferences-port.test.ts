import { describe, expect, it, vi } from 'vitest';
import { createInMemoryWorkspacePreferencesPort } from '../../../apps/studio/src/shell/workspace-preferences-port';

describe('M03.3 WorkspacePreferencesPort', () => {
  it('starts expanded and publishes deterministic collapse changes', () => {
    const port = createInMemoryWorkspacePreferencesPort();
    const listener = vi.fn();
    const unsubscribe = port.subscribe(listener);

    expect(port.getSnapshot()).toEqual({ sidebarCollapsed: false });
    port.setSidebarCollapsed(true);
    expect(port.getSnapshot()).toEqual({ sidebarCollapsed: true });
    expect(listener).toHaveBeenCalledTimes(1);

    port.setSidebarCollapsed(true);
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    port.setSidebarCollapsed(false);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('accepts an explicit initial preference', () => {
    expect(createInMemoryWorkspacePreferencesPort({ sidebarCollapsed: true }).getSnapshot()).toEqual({
      sidebarCollapsed: true,
    });
  });

  it('fails closed for non-boolean runtime input', () => {
    const port = createInMemoryWorkspacePreferencesPort();
    expect(() => port.setSidebarCollapsed('yes' as unknown as boolean)).toThrow(/must be boolean/);
  });
});
