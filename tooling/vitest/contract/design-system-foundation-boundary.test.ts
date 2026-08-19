import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

function read(path: string): string {
  return readFileSync(resolve(path), 'utf8');
}

describe('M03.1 design system architecture boundary', () => {
  it('pins shadcn configuration to new-york Radix ownership and Lucide', () => {
    const config = JSON.parse(read('packages/design-system/components.json')) as {
      style: string;
      iconLibrary: string;
      tailwind: { css: string; cssVariables: boolean };
    };
    expect(config).toMatchObject({
      style: 'new-york',
      iconLibrary: 'lucide',
      tailwind: { css: 'src/theme.css', cssVariables: true },
    });

    const pkg = JSON.parse(read('packages/design-system/package.json')) as { dependencies?: Record<string, string> };
    expect(pkg.dependencies?.['radix-ui']).toBeTruthy();
    expect(pkg.dependencies?.['lucide-react']).toBeTruthy();
    expect(Object.keys(pkg.dependencies ?? {})).not.toContain(expect.stringMatching(/^@radix-ui\/react-/));
  });

  it('defines semantic CSS variables, Tailwind v4 theme mapping and density tokens', () => {
    const css = read('packages/design-system/src/theme.css');
    expect(css).toMatch(/@import ['"]tailwindcss['"];/);
    expect(css).toContain('@theme inline');
    expect(css).toContain('--color-background: var(--background)');
    expect(css).toContain('--ec-control-height');
    expect(css).toMatch(/\[data-density=['"]compact['"]\]/);
    expect(css).toContain('.dark');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
  });

  it('keeps Studio shell copy behind typed Spanish i18n and registers contextual help', () => {
    const i18n = read('apps/studio/src/i18n/es.ts');
    for (const copy of ['Editor', 'Pantallas', 'Generar con IA', 'Automatizaciones', 'Vista previa', 'Configuración']) {
      expect(i18n).toContain(`'${copy}'`);
    }
    const help = read('apps/studio/src/help/studio-shell-help.ts');
    expect(help).toContain("id: 'help.studio.shell'");
    expect(help).toContain('shadcn/Radix');
  });

  it('keeps shell composition on the public design-system root and avoids raw Studio form controls', () => {
    const gallery = read('apps/studio/src/shell/DesignSystemGallery.tsx');
    expect(gallery).toContain("from '@electrocraft/design-system'");
    expect(gallery).not.toMatch(/<select\b|<input\b|<textarea\b/);
    expect(gallery).toContain('TooltipTrigger');
    expect(gallery).toContain('DropdownMenuTrigger');
    expect(gallery).toContain('SheetTrigger');
  });
});
