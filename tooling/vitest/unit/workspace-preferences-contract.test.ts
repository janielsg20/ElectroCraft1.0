import { describe, expect, it } from 'vitest';
import { normalizeStudioWorkspacePreferences } from '@electrocraft/application';
describe('M04.7 workspace preferences', () => {
  it('clamps desktop widths', () => {
    const p = normalizeStudioWorkspacePreferences(
      { sidebarSide: 'right', sidebarWidth: 999, contextWidth: 1, inspectorWidth: 999 },
      1440,
    );
    expect(p).toMatchObject({ sidebarSide: 'right', sidebarWidth: 320, contextWidth: 240, inspectorWidth: 440 });
  });
  it('applies adaptive mobile layout without losing saved choices', () => {
    const p = normalizeStudioWorkspacePreferences(
      { sidebarSide: 'right', contextWidth: 380, inspectorWidth: 440 },
      375,
    );
    expect(p.contextWidth).toBe(288);
    expect(p.inspectorWidth).toBe(320);
    expect(p.sidebarSide).toBe('right');
  });
});
