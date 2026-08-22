import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  defaultDesignSystemFoundationConfig,
  isDesignSystemFoundationConfigV1,
} from '../../../packages/design-system/src/foundation/design-system-foundation';
import { packageDescriptor } from '../../../packages/design-system/src/index';
import { studioNavigationMessageKeys, studioT } from '../../../apps/studio/src/i18n/studio-shell.es';
import { getStudioHelpDescriptor, studioShellHelpDescriptor } from '../../../apps/studio/src/help/help-registry';

describe('M03.1 design-system owner boundary', () => {
  it('pins Radix/Lucide semantics and a single ElectroCraft Studio theme', () => {
    expect(isDesignSystemFoundationConfigV1(defaultDesignSystemFoundationConfig)).toBe(true);
    expect(defaultDesignSystemFoundationConfig.primitiveBase).toBe('radix');
    expect(defaultDesignSystemFoundationConfig.iconLibrary).toBe('lucide');
    expect(defaultDesignSystemFoundationConfig.density).toBe('high');
    expect(packageDescriptor.engine.studioTheme).toBe('electrocraft');
    expect(packageDescriptor.engine.colorModes).toEqual(['light', 'dark']);
  });

  it('keeps closure blockers executable instead of documentation-only', () => {
    const verifier = fs.readFileSync('tooling/scripts/verify-m03-1-design-system.mjs', 'utf8');

    expect(verifier).toContain("route: '/__design-system'");
    expect(verifier).toContain('package-lock.json');
    expect(verifier).toContain('m03-1-design-system-report.json');
    expect(verifier).toContain("studioTheme: 'electrocraft'");
    expect(verifier).toContain("colorModes: ['light', 'dark']");
  });

  it('routes M03.1 Studio-visible shell copy through the typed Spanish catalog', () => {
    const app = fs.readFileSync('apps/studio/src/App.tsx', 'utf8');

    expect(app).not.toContain('Estado del entorno</p>');
    expect(app).not.toContain('Ruta no disponible en este bootstrap</p>');
    expect(app).not.toContain('Arquitectura del repositorio</strong>');
    expect(studioT('studio.bootstrap.environmentStatus')).toBe('Estado del entorno');
    expect(studioT('studio.bootstrap.architectureHelpTitle')).toBe('Arquitectura del repositorio');
  });

  it('registers required Spanish navigation vocabulary before rendering it', () => {
    expect(studioNavigationMessageKeys).toHaveLength(21);
    expect(studioNavigationMessageKeys.map((key) => studioT(key))).toEqual([
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
  });

  it('registers visible gallery states and density in Spanish', () => {
    expect(studioT('studio.designSystem.densityHigh')).toBe('Alta');
    expect([
      studioT('studio.designSystem.state.initial'),
      studioT('studio.designSystem.state.loading'),
      studioT('studio.designSystem.state.ready'),
      studioT('studio.designSystem.state.empty'),
      studioT('studio.designSystem.state.error'),
      studioT('studio.designSystem.state.disabled'),
      studioT('studio.designSystem.state.saving'),
      studioT('studio.designSystem.state.saved'),
      studioT('studio.designSystem.state.blocked'),
    ]).toEqual([
      'Inicial',
      'Cargando',
      'Listo',
      'Vacío',
      'Error',
      'Deshabilitado',
      'Guardando',
      'Guardado',
      'Bloqueado',
    ]);
  });

  it('exposes persistent critical help outside tooltip-only UI', () => {
    expect(getStudioHelpDescriptor('help.studio.shell')).toBe(studioShellHelpDescriptor);
    expect(studioShellHelpDescriptor.details.length).toBeGreaterThanOrEqual(3);
    expect(studioShellHelpDescriptor.summary).toContain('Radix');
  });
});
