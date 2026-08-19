import { describe, expect, it } from 'vitest';
import {
  getEmptyState,
  resolveModuleEmptyState,
  studioInformationOptions,
  validateInformationArchitecture,
} from '../../../apps/studio/src/shell/information-architecture';
import { getStudioSidebarNavigationItem } from '../../../apps/studio/src/shell/sidebar-navigation';

describe('M03.7 information architecture runtime integration', () => {
  it('resolves only canonical module empty states and fails closed for unknown routes', () => {
    expect(resolveModuleEmptyState('/queries')?.id).toBe('queries');
    expect(resolveModuleEmptyState('/forms')?.id).toBe('forms');
    expect(resolveModuleEmptyState('/admin')?.id).toBe('administration');
    expect(resolveModuleEmptyState('/media')?.id).toBe('media');
    expect(resolveModuleEmptyState('/export')?.id).toBe('export');
    expect(resolveModuleEmptyState('/unknown')).toBeNull();
    expect(resolveModuleEmptyState('/content')).toBeNull();
  });

  it('keeps Content List/Detail on the canonical Sidebar route', () => {
    expect(getStudioSidebarNavigationItem('records')).toMatchObject({ href: '/content', label: 'Registros' });
    expect(getEmptyState('content')).toMatchObject({ route: '/content', pattern: 'list' });
    expect(getEmptyState('content-detail')).toMatchObject({ route: '/content', pattern: 'detail' });
  });

  it('keeps top-level module routes unique after IA classification', () => {
    const routes = studioInformationOptions
      .filter((option) => option.surface === 'navigation')
      .map((option) => option.route);
    expect(new Set(routes).size).toBe(routes.length);
    expect(validateInformationArchitecture(studioInformationOptions)).toEqual([]);
  });

  it('throws for unknown empty-state ids instead of inventing fallback content', () => {
    expect(() => getEmptyState('missing' as never)).toThrow(/Unknown Studio empty state/);
  });
});
