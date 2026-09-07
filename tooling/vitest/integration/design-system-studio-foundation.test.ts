import fs from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Slot } from 'radix-ui';
import { describe, expect, it } from 'vitest';
import { Button } from '../../../packages/design-system/src/components/ui/button';
import { Separator } from '../../../packages/design-system/src/components/ui/separator';
import { getStudioIcon } from '../../../packages/design-system/src/icons/studio-icon-registry';

const root = process.cwd();

function read(relativePath: string) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

describe('M03.1 Studio foundation integration', () => {
  it('executes the real Radix engine through ElectroCraft primitives', () => {
    expect(Slot.Root).toBeDefined();

    const buttonMarkup = renderToStaticMarkup(
      createElement(
        Button,
        { asChild: true, variant: 'outline' },
        createElement('a', { href: '/__design-system' }, 'Abrir'),
      ),
    );
    const separatorMarkup = renderToStaticMarkup(createElement(Separator));

    expect(buttonMarkup).toContain('<a');
    expect(buttonMarkup).toContain('href="/__design-system"');
    expect(buttonMarkup).toContain('border-input');
    expect(separatorMarkup).toContain('data-orientation="horizontal"');
  });

  it('executes Lucide through the semantic icon registry', () => {
    const ThemeIcon = getStudioIcon('studio.theme');
    const markup = renderToStaticMarkup(createElement(ThemeIcon, { 'aria-hidden': true }));

    expect(markup).toContain('<svg');
    expect(markup).toContain('aria-hidden="true"');
  });

  it('uses the real Radix engine in all interactive primitives', () => {
    for (const file of ['tooltip.tsx', 'dropdown-menu.tsx', 'sheet.tsx', 'scroll-area.tsx', 'separator.tsx']) {
      expect(read(`packages/design-system/src/components/ui/${file}`)).toContain("from 'radix-ui'");
    }
  });

  it('uses Lucide through a typed semantic registry', () => {
    const registry = read('packages/design-system/src/icons/studio-icon-registry.ts');
    expect(registry).toContain("from 'lucide-react'");
    expect(registry).toContain('satisfies Record<string, LucideIcon>');
  });

  it('keeps M03.1 inside design-system + the explicit Studio shell/i18n/help seams', () => {
    expect(read('apps/studio/src/shell/design-system-route.tsx')).toContain('DesignSystemDevelopmentRoute');
    expect(read('apps/studio/src/i18n/studio-shell.es.ts')).toContain("'studio.navigation.editor': 'Editor'");
    expect(read('apps/studio/src/help/help-registry.ts')).toContain("id: 'help.studio.shell'");
  });

  it('pins the single shadcn Radix and Tailwind v4 integration points', () => {
    const components = JSON.parse(read('packages/design-system/components.json'));
    const designSystemPackage = JSON.parse(read('packages/design-system/package.json'));
    const studioPackage = JSON.parse(read('apps/studio/package.json'));

    expect(components.style).toBe('new-york');
    expect(components.tailwind.baseColor).toBe('neutral');
    expect(components.registries).toBeUndefined();
    expect(components.iconLibrary).toBe('lucide');
    expect(designSystemPackage.dependencies['radix-ui']).toBe('1.6.7');
    expect(designSystemPackage.dependencies['lucide-react']).toBe('1.31.0');
    expect(designSystemPackage.exports).toEqual({ '.': './src/index.ts' });
    expect(studioPackage.devDependencies.tailwindcss).toBe('4.3.3');
    expect(studioPackage.devDependencies['@tailwindcss/vite']).toBe('4.3.3');
    expect(read('apps/studio/vite.config.ts')).toContain('tailwindcss()');
    expect(read('packages/design-system/src/styles/globals.css')).toContain("@import 'tailwindcss'");
  });
});
