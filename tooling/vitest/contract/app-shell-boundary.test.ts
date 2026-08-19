import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { studioNavigationMessageKeys, studioShellMessagesEs } from '../../../apps/studio/src/i18n/studio-shell.es';

const root = process.cwd();

function read(relativePath: string) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

describe('M03.2 AppShell boundaries', () => {
  it('keeps the shell inside the phase-owned Studio seams and the shared design-system root export', () => {
    const shell = read('apps/studio/src/shell/app-shell.tsx');
    const route = read('apps/studio/src/shell/app-shell-route.tsx');

    expect(shell).toContain("from '@electrocraft/design-system'");
    expect(shell).not.toContain('@electrocraft/design-system/');
    expect(route).toContain("from '@electrocraft/design-system'");
    expect(route).not.toContain('@electrocraft/design-system/');
  });

  it('preserves the M03.2 Spanish vocabulary seam while later microphases extend the shell', () => {
    expect(studioNavigationMessageKeys).toHaveLength(21);
    expect(studioNavigationMessageKeys.map((key) => studioShellMessagesEs[key])).toEqual([
      'Editor',
      'Pantallas',
      'Plantillas',
      'Componentes',
      'Generar con IA',
      'Contenido',
      'Modelos',
      'Consultas',
      'Formularios',
      'Automatizaciones',
      'Administración',
      'Roles',
      'Medios',
      'Extensiones',
      'Temas',
      'Vista previa',
      'Compatibilidad',
      'Exportar',
      'Desplegar',
      'Ayuda',
      'Configuración',
    ]);

    const shell = read('apps/studio/src/shell/app-shell.tsx');
    expect(shell).not.toContain("'Editor'");
    expect(shell).not.toContain("'Configuración'");
  });

  it('preserves exact AppShell geometry as later responsive microphases extend it', () => {
    const layout = read('apps/studio/src/shell/app-shell-layout.ts');
    expect(layout).toContain('sidebarExpandedPx: 240');
    expect(layout).toContain('sidebarCollapsedPx: 64');
    expect(layout).toContain('topbarPx: 52');
    expect(layout).toContain('statusbarPx: 26');
  });

  it('uses persistent help and a left/right-capable real Radix Sheet while M03.6 adds bottom support', () => {
    const sheet = read('packages/design-system/src/components/ui/sheet.tsx');
    expect(read('apps/studio/src/help/help-registry.ts')).toContain("id: 'help.studio.shell'");
    expect(sheet).toContain("'left'");
    expect(sheet).toContain("'right'");
    expect(sheet).toContain("from 'radix-ui'");
    expect(read('packages/design-system/src/icons/studio-icon-registry.ts')).toContain("'studio.menu': Menu");
  });
});
