import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AppShell, type AppShellCopy } from '../../../apps/studio/src/shell/app-shell';
import { studioSidebarNavigation } from '../../../apps/studio/src/shell/sidebar-navigation';
import { createMemoryWorkspacePreferencesPort } from '../../../apps/studio/src/shell/workspace-preferences';

const copy: AppShellCopy = Object.freeze({
  title: 'ElectroCraft Studio',
  sidebarLabel: 'Navegación principal del Studio',
  navigationLabel: 'Navegación del Studio',
  menuLabel: 'Abrir navegación',
  menuTitle: 'Navegación',
  menuDescription: 'Navegación agrupada',
  closeMenuLabel: 'Cerrar navegación',
  collapseSidebarLabel: 'Contraer barra lateral',
  expandSidebarLabel: 'Expandir barra lateral',
  workspaceLabel: 'Área de trabajo del Studio',
  emptyWorkspace: 'Área de trabajo vacía',
  statusLabel: 'Estado del Studio',
  statusLabels: Object.freeze({ ready: 'Listo', saving: 'Guardando', error: 'Error', blocked: 'Bloqueado' }),
});

describe('M03.3 Sidebar runtime integration', () => {
  it('renders grouped navigation, semantic icons and aria-current through the real AppShell', () => {
    const port = createMemoryWorkspacePreferencesPort();
    const markup = renderToStaticMarkup(
      createElement(AppShell, {
        copy,
        navigationGroups: studioSidebarNavigation,
        activeItemId: 'editor',
        preferencesPort: port,
        helpId: 'help.studio.shell',
        status: 'ready',
      }),
    );

    for (const group of ['Construir', 'Datos', 'Lógica', 'App', 'Recursos', 'Apariencia', 'Publicar']) {
      expect(markup).toContain(group);
    }
    expect(markup).toContain('data-nav-item="editor"');
    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain('data-sidebar-collapsed="false"');
  });

  it('reflects the adapter snapshot without persisting preference into canonical project data', () => {
    const port = createMemoryWorkspacePreferencesPort({ sidebarCollapsed: true });
    const markup = renderToStaticMarkup(
      createElement(AppShell, {
        copy,
        navigationGroups: studioSidebarNavigation,
        activeItemId: 'screens',
        preferencesPort: port,
        helpId: 'help.studio.shell',
        status: 'ready',
      }),
    );

    expect(markup).toContain('data-sidebar-collapsed="true"');
    expect(markup).toContain('aria-label="Expandir barra lateral"');
    expect(markup).toContain('data-nav-item="screens"');
    expect(markup).toContain('aria-current="page"');
  });
});
