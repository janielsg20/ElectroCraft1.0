import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Badge, Button, Separator, cn, getElectroCraftIcon } from '@electrocraft/design-system';

describe('M03.1 React/Radix/Lucide integration', () => {
  it('renders shadcn-style Button and Radix Separator through the design-system owner', () => {
    const html = renderToStaticMarkup(
      <div>
        <Button variant="outline" size="sm">Guardar</Button>
        <Separator />
        <Badge variant="success">Listo</Badge>
      </div>,
    );

    expect(html).toContain('data-slot="button"');
    expect(html).toContain('data-slot="separator"');
    expect(html).toContain('data-slot="badge"');
    expect(html).toContain('Guardar');
  });

  it('renders a semantic Lucide icon without dynamic icon-name imports', () => {
    const SettingsIcon = getElectroCraftIcon('settings');
    const html = renderToStaticMarkup(<SettingsIcon aria-label="Configuración" />);
    expect(html).toContain('<svg');
    expect(html).toContain('Configuración');
  });

  it('merges Tailwind classes through the shared shadcn cn utility', () => {
    expect(cn('px-2', 'px-4', false && 'hidden', 'text-sm')).toContain('px-4');
    expect(cn('px-2', 'px-4')).not.toContain('px-2');
  });
});
