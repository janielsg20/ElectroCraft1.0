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

  it('exposes the exact 21 Spanish navigation labels without hardcoded shell copy', () => {
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

  it('keeps M03.3 and M03.4 responsibilities out of the structural shell', () => {
    const shell = read('apps/studio/src/shell/app-shell.tsx');
    const layout = read('apps/studio/src/shell/app-shell-layout.ts');

    expect(shell).not.toContain('WorkspacePreferencesPort');
    expect(shell).not.toContain('aria-current');
    expect(layout).not.toContain('WorkspacePreferencesPort');
  });

  it('uses persistent help and a left-capable real Radix Sheet for tablet/mobile navigation', () => {
    expect(read('apps/studio/src/help/help-registry.ts')).toContain("id: 'help.studio.shell'");
    expect(read('packages/design-system/src/components/ui/sheet.tsx')).toContain("side?: 'left' | 'right'");
    expect(read('packages/design-system/src/components/ui/sheet.tsx')).toContain("from 'radix-ui'");
    expect(read('packages/design-system/src/icons/studio-icon-registry.ts')).toContain("'studio.menu': Menu");
  });
});
