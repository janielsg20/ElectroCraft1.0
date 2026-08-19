import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('M03.4 Topbar boundaries', () => {
  it('composes Topbar inside AppShell and consumes only the design-system root export', () => {
    const route = read('apps/studio/src/shell/app-shell-route.tsx');
    const topbar = read('apps/studio/src/shell/studio-topbar.tsx');

    expect(route).toContain('<StudioTopbar');
    expect(topbar).toContain("from '@electrocraft/design-system'");
    expect(topbar).not.toContain('@electrocraft/design-system/');
    expect(topbar).not.toContain("from 'lucide-react'");
  });

  it('keeps Settings as the last right-side action and uses the same WorkspacePreferencesPort', () => {
    const topbar = read('apps/studio/src/shell/studio-topbar.tsx');
    expect(topbar.lastIndexOf('data-topbar-settings-trigger')).toBeGreaterThan(
      topbar.lastIndexOf('ec-topbar-help-trigger'),
    );
    expect(topbar).toContain('preferencesPort.toggleSidebar');
    expect(topbar).toContain('data-topbar-settings-sheet');
  });

  it('uses real Radix Sheets for tools, help and settings without overriding restore-focus', () => {
    const topbar = read('apps/studio/src/shell/studio-topbar.tsx');
    const sheet = read('packages/design-system/src/components/ui/sheet.tsx');

    expect(topbar).toContain('SheetTrigger');
    expect(topbar).toContain('SheetContent');
    expect(topbar).toContain('SheetClose');
    expect(topbar).not.toContain('onCloseAutoFocus');
    expect(sheet).toContain('Dialog as DialogPrimitive');
  });

  it('keeps M03.5 Inspector behavior out of M03.4', () => {
    const topbar = read('apps/studio/src/shell/studio-topbar.tsx');
    expect(topbar).not.toContain('InspectorPanel');
    expect(topbar).not.toContain('InspectorTabs');
  });
});
