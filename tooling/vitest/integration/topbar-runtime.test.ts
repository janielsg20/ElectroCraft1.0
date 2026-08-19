import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { studioShellHelpDescriptor } from '../../../apps/studio/src/help/help-registry';
import { StudioTopbar, type StudioTopbarCopy } from '../../../apps/studio/src/shell/studio-topbar';
import { createMemoryWorkspacePreferencesPort } from '../../../apps/studio/src/shell/workspace-preferences';

const copy: StudioTopbarCopy = Object.freeze({
  breadcrumbRoot: 'Studio',
  projectLabel: 'Proyecto local',
  saveLabels: Object.freeze({ ready: 'Sin cambios', saving: 'Guardando', error: 'Error', blocked: 'Bloqueado' }),
  documentLabel: 'Documento',
  platformLabel: 'Plataforma',
  platformValue: 'Web',
  breakpointLabel: 'Breakpoint',
  breakpointLabels: Object.freeze({ mobile: 'Móvil', tablet: 'Tablet', laptop: 'Portátil', desktop: 'Escritorio' }),
  undoLabel: 'Deshacer',
  redoLabel: 'Rehacer',
  historyUnavailable: 'No disponible',
  zoomLabel: 'Zoom',
  toolsLabel: 'Abrir herramientas contextuales',
  toolsTitle: 'Herramientas contextuales',
  toolsDescription: 'Herramientas responsive',
  previewLabel: 'Vista previa',
  exportLabel: 'Exportar',
  localLabel: 'Local',
  helpLabel: 'Ayuda',
  helpDescription: 'Ayuda persistente',
  closeHelpLabel: 'Cerrar ayuda',
  settingsLabel: 'Configuración',
  settingsTitle: 'Configuración',
  settingsDescription: 'Preferencias del Studio',
  closeSettingsLabel: 'Cerrar configuración',
  workspaceSettingsTitle: 'Espacio de trabajo',
  sidebarPreferenceLabel: 'Barra lateral',
  sidebarExpandedLabel: 'Expandida',
  sidebarCollapsedLabel: 'Contraída',
  collapseSidebarAction: 'Contraer',
  expandSidebarAction: 'Expandir',
});

describe('M03.4 Topbar runtime integration', () => {
  it('renders the three Topbar regions with semantic context and Settings last', () => {
    const markup = renderToStaticMarkup(
      createElement(StudioTopbar, {
        copy,
        activeLabel: 'Editor',
        status: 'ready',
        preferencesPort: createMemoryWorkspacePreferencesPort(),
        help: studioShellHelpDescriptor,
      }),
    );

    expect(markup).toContain('class="ec-topbar-left"');
    expect(markup).toContain('class="ec-topbar-center"');
    expect(markup).toContain('class="ec-topbar-right"');
    expect(markup).toContain('Editor');
    expect(markup).toContain('Web');
    expect(markup).toContain('Escritorio');
    expect(markup).toContain('data-topbar-settings-trigger');
    expect(markup.indexOf('data-topbar-settings-trigger')).toBeGreaterThan(markup.indexOf('ec-topbar-help-trigger'));
  });

  it('reports saving state without persisting it into project data', () => {
    const markup = renderToStaticMarkup(
      createElement(StudioTopbar, {
        copy,
        activeLabel: 'Pantallas',
        status: 'saving',
        preferencesPort: createMemoryWorkspacePreferencesPort({ sidebarCollapsed: true }),
        help: studioShellHelpDescriptor,
      }),
    );

    expect(markup).toContain('data-save-state="saving"');
    expect(markup).toContain('Guardando');
    expect(markup).toContain('Pantallas');
  });
});
