import { describe, expect, it } from 'vitest';
import { studioSidebarNavigation } from '../../../apps/studio/src/shell/sidebar-navigation';
import { resolveTopbarBreadcrumb, resolveTopbarSaveLabel } from '../../../apps/studio/src/shell/topbar';

describe('M03.4 Topbar model', () => {
  it('resolves the active breadcrumb from structural navigation', () => {
    expect(resolveTopbarBreadcrumb(studioSidebarNavigation, 'models')).toBe('Modelos');
    expect(resolveTopbarBreadcrumb(studioSidebarNavigation, 'editor')).toBe('Editor');
    expect(resolveTopbarBreadcrumb(studioSidebarNavigation, null)).toBe('Studio');
  });
  it('maps shell status to honest save-state copy', () => {
    expect(resolveTopbarSaveLabel('ready')).toBe('Sin cambios');
    expect(resolveTopbarSaveLabel('saving')).toBe('Guardando');
    expect(resolveTopbarSaveLabel('error')).toBe('Error al guardar');
    expect(resolveTopbarSaveLabel('blocked')).toBe('Bloqueado');
  });
});
