import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AppShell, type AppShellCopy, type AppShellNavigationGroup } from '../../../apps/studio/src/shell/app-shell';
import { createInMemoryWorkspacePreferencesPort } from '../../../apps/studio/src/shell/workspace-preferences-port';

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

const navigationGroups: readonly AppShellNavigationGroup[] = Object.freeze([
  Object.freeze({
    id: 'build',
    label: 'Construir',
    items: Object.freeze([
      Object.freeze({ id: 'editor', label: 'Editor', href: '/', iconId: 'studio.navigation.editor' }),
      Object.freeze({ id: 'screens', label: 'Pantallas', href: '/pantallas', iconId: 'studio.navigation.screens' }),
    ]),
  }),
]);

describe('M03.2 AppShell runtime regression integration', () => {
  it('renders the real shell landmarks and an empty workspace without demo data', () => {
    const markup = renderToStaticMarkup(
      createElement(AppShell, {
        copy,
        navigationGroups,
        activeItemId: 'editor',
        preferencesPort: createInMemoryWorkspacePreferencesPort(),
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

  it('keeps responsive menu intent and route content through the shared Radix composition', () => {
    const markup = renderToStaticMarkup(
      createElement(
        AppShell,
        {
          copy,
          navigationGroups,
          activeItemId: 'editor',
          preferencesPort: createInMemoryWorkspacePreferencesPort(),
          helpId: 'help.studio.shell',
          status: 'blocked',
        },
        createElement('section', null, 'Contenido de ruta'),
      ),
    );

    expect(markup).toContain('Editor');
    expect(markup).toContain('Pantallas');
    expect(markup).toContain('aria-label="Abrir navegación"');
    expect(markup).toContain('data-status="blocked"');
    expect(markup).toContain('Bloqueado');
    expect(markup).toContain('Contenido de ruta');
  });
});
