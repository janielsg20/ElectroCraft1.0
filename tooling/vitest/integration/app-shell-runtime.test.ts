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
  menuDescription: 'Navegación responsive',
  closeMenuLabel: 'Cerrar navegación',
  collapseSidebarLabel: 'Contraer barra lateral',
  expandSidebarLabel: 'Expandir barra lateral',
  workspaceLabel: 'Área de trabajo del Studio',
  emptyWorkspace: 'Área de trabajo vacía',
  statusLabel: 'Estado del Studio',
  statusLabels: Object.freeze({
    ready: 'Listo',
    saving: 'Guardando',
    error: 'Error',
    blocked: 'Bloqueado',
  }),
});

describe('M03.2 AppShell runtime integration', () => {
  it('renders the real shell landmarks and an empty workspace without demo data', () => {
    const markup = renderToStaticMarkup(
      createElement(AppShell, {
        copy,
        navigationGroups: studioSidebarNavigation,
        activeItemId: 'editor',
        preferencesPort: createMemoryWorkspacePreferencesPort(),
        helpId: 'help.studio.shell',
        status: 'ready',
      }),
    );

    expect(markup).toContain('class="ec-design-system ec-app-shell"');
    expect(markup).toContain('data-help-id="help.studio.shell"');
    expect(markup).toContain('<aside');
    expect(markup).toContain('<header');
    expect(markup).toContain('<main');
    expect(markup).toContain('<footer');
    expect(markup).toContain('Área de trabajo vacía');
    expect(markup).toContain('Listo');
  });

  it('keeps real Radix mobile menu intent while the Sidebar evolves after M03.2', () => {
    const markup = renderToStaticMarkup(
      createElement(
        AppShell,
        {
          copy,
          navigationGroups: studioSidebarNavigation,
          activeItemId: 'editor',
          preferencesPort: createMemoryWorkspacePreferencesPort(),
          helpId: 'help.studio.shell',
          status: 'blocked',
        },
        createElement('section', null, 'Contenido de ruta'),
      ),
    );

    expect(markup).toContain('Editor');
    expect(markup).toContain('aria-label="Abrir navegación"');
    expect(markup).toContain('data-status="blocked"');
    expect(markup).toContain('Bloqueado');
    expect(markup).toContain('Contenido de ruta');
  });
});
