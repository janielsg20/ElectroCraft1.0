import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8');

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.(?:ts|tsx)$/.test(entry.name) ? [full] : [];
  });
}

describe('M03.11 Help system boundaries', () => {
  it('keeps Popover ownership in Design System and consumes only its public root', () => {
    const primitive = read('packages/design-system/src/components/ui/popover.tsx');
    expect(primitive).toContain("Popover as PopoverPrimitive } from 'radix-ui'");
    expect(primitive).toContain('PopoverPrimitive.Portal');
    expect(primitive).toContain("w-[360px]");

    const helpUi = read('apps/studio/src/help/help-ui.tsx');
    expect(helpUi).toContain("from '@electrocraft/design-system'");
    expect(helpUi).not.toContain('@electrocraft/design-system/');
    expect(helpUi).not.toContain("from 'radix-ui'");
  });

  it('does not create module-specific Popover implementations', () => {
    const files = walk(path.join(root, 'apps/studio/src'));
    const popoverConsumers = files
      .filter((file) => read(path.relative(root, file)).includes('<Popover'))
      .map((file) => path.relative(root, file).replaceAll(path.sep, '/'));
    expect(popoverConsumers).toEqual(['apps/studio/src/help/help-ui.tsx']);
  });

  it('keeps Ayuda before Settings and Settings as the final right action', () => {
    const topbar = read('apps/studio/src/shell/studio-topbar.tsx');
    const helpIndex = topbar.indexOf('ec-topbar-help-trigger');
    const settingsIndex = topbar.indexOf('data-topbar-settings-trigger');
    expect(helpIndex).toBeGreaterThan(-1);
    expect(settingsIndex).toBeGreaterThan(helpIndex);
    expect(topbar).toContain('<HelpDrawerTrigger');
  });

  it('keeps metrics local and disabled by default', () => {
    const helpUi = read('apps/studio/src/help/help-ui.tsx');
    expect(helpUi).toContain('HELP_METRICS_ENABLED = false');
    expect(helpUi).toContain('window.localStorage');
    expect(helpUi).not.toContain('fetch(');
    expect(helpUi).not.toContain('navigator.sendBeacon');
  });

  it('keeps stale destinations out of the canonical Help registry', () => {
    const registry = read('apps/studio/src/help/help-registry.ts');
    expect(registry).not.toContain('help.section.taxonomies');
    expect(registry).not.toContain('help.section.relations');
    expect(registry).not.toContain('help.section.roles');
  });
});
