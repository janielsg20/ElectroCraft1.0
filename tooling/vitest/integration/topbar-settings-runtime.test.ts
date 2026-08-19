import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { studioShellHelpDescriptor } from '../../../apps/studio/src/help/help-registry';
import { AppShell, type AppShellCopy } from '../../../apps/studio/src/shell/app-shell';
import { studioSidebarNavigation } from '../../../apps/studio/src/shell/sidebar-navigation';
import { createMemoryWorkspacePreferencesPort } from '../../../apps/studio/src/shell/workspace-preferences';

const copy: AppShellCopy = { title: 'ElectroCraft Studio', sidebarLabel: 'Navegación principal', navigationLabel: 'Navegación', menuLabel: 'Abrir navegación', menuTitle: 'Navegación', menuDescription: 'Navegación', closeMenuLabel: 'Cerrar navegación', collapseSidebarLabel: 'Contraer barra lateral', expandSidebarLabel: 'Expandir barra lateral', workspaceLabel: 'Área de trabajo', emptyWorkspace: 'Vacía', statusLabel: 'Estado', statusLabels: { ready: 'Listo', saving: 'Guardando', error: 'Error', blocked: 'Bloqueado' } };

describe('M03.4 Topbar Settings runtime', () => {
  it('renders the real topbar actions and semantic help/settings triggers', () => {
    const markup = renderToStaticMarkup(createElement(AppShell, { copy, navigationGroups: studioSidebarNavigation, activeItemId: 'editor', preferencesPort: createMemoryWorkspacePreferencesPort(), help: studioShellHelpDescriptor, status: 'ready' }));
    expect(markup).toContain('Proyecto local');
    expect(markup).toContain('Vista previa');
    expect(markup).toContain('Exportar');
    expect(markup).toContain('aria-label="Ayuda"');
    expect(markup).toContain('aria-label="Configuración"');
    expect(markup).toContain('Sin cambios');
  });
  it('keeps settings on the same WorkspacePreferencesPort contract', () => {
    const port = createMemoryWorkspacePreferencesPort();
    port.toggleSidebar();
    expect(port.getSnapshot().sidebarCollapsed).toBe(true);
  });
});
