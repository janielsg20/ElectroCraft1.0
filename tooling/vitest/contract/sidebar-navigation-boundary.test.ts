import { describe, expect, it } from 'vitest';
import { studioShellMessagesEs } from '../../../apps/studio/src/i18n/studio-shell.es';
import {
  resolveStudioSidebarItemId,
  studioSidebarNavigationGroups,
} from '../../../apps/studio/src/shell/sidebar-navigation';
import { studioIconRegistry } from '../../../packages/design-system/src/icons/studio-icon-registry';

describe('M03.3 Sidebar navigation contract', () => {
  it('exposes the exact seven groups in the required order', () => {
    expect(studioSidebarNavigationGroups.map((group) => studioShellMessagesEs[group.labelKey])).toEqual([
      'Construir',
      'Datos',
      'Lógica',
      'App',
      'Recursos',
      'Apariencia',
      'Publicar',
    ]);
  });

  it('exposes the exact 24 visible items without Taxonomías or Relaciones top-level', () => {
    const labels = studioSidebarNavigationGroups.flatMap((group) =>
      group.items.map((item) => studioShellMessagesEs[item.labelKey]),
    );

    expect(labels).toEqual([
      'Editor',
      'Pantallas',
      'Componentes',
      'Plantillas',
      'Generar con IA',
      'Registros',
      'Modelos',
      'Fuentes de datos',
      'Consultas',
      'Acciones y workflows',
      'Estado y variables',
      'Formularios',
      'Navegación',
      'Usuarios y permisos',
      'Administración',
      'Medios',
      'Extensiones',
      'Temas',
      'Sistema de diseño',
      'Tokens',
      'Vista previa',
      'Compatibilidad',
      'Exportar',
      'Desplegar',
    ]);
    expect(labels).not.toContain('Taxonomías');
    expect(labels).not.toContain('Relaciones');
  });

  it('maps every item to a registered Lucide ID and unique route', () => {
    const items = studioSidebarNavigationGroups.flatMap((group) => group.items);
    expect(new Set(items.map((item) => item.href)).size).toBe(24);
    for (const item of items) expect(studioIconRegistry[item.iconId]).toBeDefined();
  });

  it('resolves active routes deterministically', () => {
    expect(resolveStudioSidebarItemId('/')).toBe('editor');
    expect(resolveStudioSidebarItemId('/modelos')).toBe('models');
    expect(resolveStudioSidebarItemId('/modelos/')).toBe('models');
    expect(resolveStudioSidebarItemId('/ruta-no-definida')).toBeNull();
  });
});
