import { describe, expect, it, vi } from 'vitest';
import { resolveSidebarActiveItem, studioSidebarNavigation } from '../../../apps/studio/src/shell/sidebar-navigation';
import { createMemoryWorkspacePreferencesPort } from '../../../apps/studio/src/shell/workspace-preferences';

describe('M03.3 Sidebar navigation', () => {
  it('matches the exact APP_SHELL_SPEC groups and order', () => {
    expect(studioSidebarNavigation.map((group) => group.label)).toEqual([
      'Construir',
      'Datos',
      'Lógica',
      'App',
      'Recursos',
      'Apariencia',
      'Publicar',
    ]);

    expect(studioSidebarNavigation.map((group) => group.items.map((item) => item.label))).toEqual([
      ['Editor', 'Pantallas', 'Componentes', 'Plantillas', 'Generar con IA'],
      ['Registros', 'Modelos', 'Fuentes de datos', 'Consultas'],
      ['Acciones y workflows', 'Estado y variables', 'Formularios'],
      ['Navegación', 'Usuarios y permisos', 'Administración'],
      ['Medios', 'Extensiones'],
      ['Temas', 'Sistema de diseño', 'Tokens'],
      ['Vista previa', 'Compatibilidad', 'Exportar', 'Desplegar'],
    ]);

    const labels = studioSidebarNavigation.flatMap((group) => group.items.map((item) => item.label));
    expect(labels).toHaveLength(24);
    expect(labels).not.toContain('Taxonomías');
    expect(labels).not.toContain('Relaciones');
  });

  it('resolves active destinations without creating a second routing system', () => {
    expect(resolveSidebarActiveItem('/')).toBe('editor');
    expect(resolveSidebarActiveItem('/screens')).toBe('screens');
    expect(resolveSidebarActiveItem('/screens/hero')).toBe('screens');
    expect(resolveSidebarActiveItem('/compatibility/wordpress')).toBe('compatibility');
    expect(resolveSidebarActiveItem('/unknown')).toBeNull();
  });

  it('round-trips the F03 in-memory WorkspacePreferencesPort and avoids duplicate notifications', () => {
    const port = createMemoryWorkspacePreferencesPort();
    const listener = vi.fn();
    const unsubscribe = port.subscribe(listener);

    expect(port.getSnapshot()).toEqual({ sidebarCollapsed: false });
    port.setSidebarCollapsed(true);
    expect(port.getSnapshot()).toEqual({ sidebarCollapsed: true });
    expect(listener).toHaveBeenCalledTimes(1);

    port.setSidebarCollapsed(true);
    expect(listener).toHaveBeenCalledTimes(1);

    port.toggleSidebar();
    expect(port.getSnapshot()).toEqual({ sidebarCollapsed: false });
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    port.toggleSidebar();
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
