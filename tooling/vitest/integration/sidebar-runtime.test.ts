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
  menuDescription: 'Navegación global',
  closeMenuLabel: 'Cerrar navegación',
  collapseSidebarLabel: 'Contraer barra lateral',
  expandSidebarLabel: 'Expandir barra lateral',
  workspaceLabel: 'Área de trabajo del Studio',
  emptyWorkspace: 'Área de trabajo vacía',
  statusLabel: 'Estado del Studio',
  statusLabels: Object.freeze({ ready: 'Listo', saving: 'Guardando', error: 'Error', blocked: 'Bloqueado' }),
});

const groups: readonly AppShellNavigationGroup[] = Object.freeze([
  Object.freeze({
    id: 'build',
    label: 'Construir',
    items: Object.freeze([
      Object.freeze({ id: 'editor', label: 'Editor', href: '/', iconId: 'studio.navigation.editor' }),
      Object.freeze({ id: 'screens', label: 'Pantallas', href: '/pantallas', iconId: 'studio.navigation.screens' }),
    ]),
  }),
]);

describe('M03.3 Sidebar runtime integration', () => {
  it('renders groups, Lucide-backed links, active state and collapse control', () => {
    const markup = renderToStaticMarkup(
      createElement(AppShell, {
        copy,
        navigationGroups: groups,
        activeItemId: 'editor',
        preferencesPort: createInMemoryWorkspacePreferencesPort(),
        helpId: 'help.studio.shell',
      }),
    );

    expect(markup).toContain('Construir');
    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain('aria-label="Editor"');
    expect(markup).toContain('aria-label="Contraer barra lateral"');
    expect(markup).toContain('data-sidebar-collapsed="false"');
  });

  it('renders the collapsed preference through the same AppShell contract', () => {
    const markup = renderToStaticMarkup(
      createElement(AppShell, {
        copy,
        navigationGroups: groups,
        activeItemId: 'screens',
        preferencesPort: createInMemoryWorkspacePreferencesPort({ sidebarCollapsed: true }),
        helpId: 'help.studio.shell',
      }),
    );

    expect(markup).toContain('data-sidebar-collapsed="true"');
    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain('aria-label="Expandir barra lateral"');
  });
});
