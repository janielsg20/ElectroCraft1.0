import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AppShell, type AppShellCopy } from '../../../apps/studio/src/shell/app-shell';

const copy: AppShellCopy = Object.freeze({
  title: 'ElectroCraft Studio',
  sidebarLabel: 'Navegación principal del Studio',
  navigationLabel: 'Navegación del Studio',
  menuLabel: 'Abrir navegación',
  menuTitle: 'Navegación',
  menuDescription: 'Navegación responsive',
  closeMenuLabel: 'Cerrar navegación',
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

const navigationLabels = Object.freeze(['Editor', 'Pantallas', 'Plantillas', 'Componentes']);

describe('M03.2 AppShell runtime integration', () => {
  it('renders the real shell landmarks and an empty workspace without demo data', () => {
    const markup = renderToStaticMarkup(
      createElement(AppShell, {
        copy,
        navigationLabels,
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

  it('routes navigation vocabulary and accessible mobile menu intent through the shared Radix composition', () => {
    const markup = renderToStaticMarkup(
      createElement(
        AppShell,
        {
          copy,
          navigationLabels,
          helpId: 'help.studio.shell',
          status: 'blocked',
        },
        createElement('section', null, 'Contenido de ruta'),
      ),
    );

    for (const label of navigationLabels) {
      expect(markup).toContain(label);
    }

    expect(markup).toContain('aria-label="Abrir navegación"');
    expect(markup).toContain('data-status="blocked"');
    expect(markup).toContain('Bloqueado');
    expect(markup).toContain('Contenido de ruta');
  });
});
