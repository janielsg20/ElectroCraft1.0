import { describe, expect, it } from 'vitest';
import { studioHelpDescriptors } from '../../../apps/studio/src/help/help-registry';
import { resolveEditorLayoutMode, resolveLaptopPanelStrategy } from '../../../apps/studio/src/shell/editor-layout-model';
import { resolveSidebarActiveItem, studioSidebarNavigation } from '../../../apps/studio/src/shell/sidebar-navigation';

const matrix = [
  [1440, 'desktop'],
  [1280, 'desktop'],
  [1024, 'laptop'],
  [768, 'tablet'],
  [375, 'mobile'],
  [320, 'mobile'],
] as const;

describe('M03.12 observable AppShell matrix', () => {
  it('maps every required width to the canonical responsive mode', () => {
    for (const [width, mode] of matrix) expect(resolveEditorLayoutMode(width)).toBe(mode);
    expect(resolveLaptopPanelStrategy(1024)).toBe('overlay');
  });

  it('keeps 24 canonical top-level destinations and one contextual Help descriptor each', () => {
    const items = studioSidebarNavigation.flatMap((group) => group.items);
    expect(items).toHaveLength(24);
    expect(studioHelpDescriptors).toHaveLength(27);
    for (const item of items) {
      expect(resolveSidebarActiveItem(item.href)).toBe(item.id);
      expect(studioHelpDescriptors.some((descriptor) => descriptor.id === `help.section.${item.id}`)).toBe(true);
    }
  });

  it('fails closed for unknown routes instead of inventing an active destination', () => {
    expect(resolveSidebarActiveItem('/ruta-inexistente-m03-12')).toBeNull();
  });
});
