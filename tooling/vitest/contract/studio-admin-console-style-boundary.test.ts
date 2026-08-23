import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('Studio neutral administrative console style boundary', () => {
  it('keeps a neutral shell with one primary accent and fixed density scale', () => {
    const tokens = read('packages/design-system/src/styles/tokens.css');
    expect(tokens).toContain('--primary: #0b57d0;');
    expect(tokens).toContain('--ec-control-sm: 1.75rem;');
    expect(tokens).toContain('--ec-control-md: 2rem;');
    expect(tokens).toContain('--ec-control-lg: 2.25rem;');
    expect(tokens).toContain('--ec-shell-sidebar-width: 256px;');
    expect(tokens).toContain('--ec-shell-topbar-height: 56px;');
    expect(tokens).toContain('--ec-shell-statusbar-height: 24px;');
    expect(tokens).not.toContain('Inter,');
  });

  it('does not color-code navigation or editor regions with decorative hues', () => {
    for (const file of [
      'apps/studio/src/styles.css',
      'apps/studio/src/shell/sidebar.css',
      'apps/studio/src/shell/topbar.css',
      'apps/studio/src/shell/editor-workspace.css',
      'apps/studio/src/shell/responsive-shell.css',
      'apps/studio/src/features/projects/project-home.css',
    ]) {
      const source = read(file);
      expect(source).not.toContain('--ec-violet');
      expect(source).not.toContain('--ec-cyan');
      expect(source).not.toContain('--ec-amber');
      expect(source).not.toContain('--ec-rose');
      expect(source).not.toContain('--ec-mobile-tone');
      expect(source).not.toContain('linear-gradient');
      expect(source).not.toContain('backdrop-filter');
    }
  });

  it('keeps the responsive geometry aligned with the same console baseline', () => {
    const layout = read('apps/studio/src/shell/app-shell-layout.ts');
    const responsive = read('apps/studio/src/shell/responsive-shell.css');
    expect(layout).toContain('sidebarExpandedPx: 256');
    expect(layout).toContain('sidebarCollapsedPx: 64');
    expect(layout).toContain('tabletRailPx: 56');
    expect(layout).toContain('topbarPx: 56');
    expect(layout).toContain('statusbarPx: 24');
    expect(responsive).toContain('grid-template-columns: 56px minmax(0, 1fr)');
    expect(responsive).toContain('min-height: 44px');
  });

  it('owns checkbox and radio selection through Radix primitives', () => {
    const checkbox = read('packages/design-system/src/components/ui/checkbox.tsx');
    const radio = read('packages/design-system/src/components/ui/radio-group.tsx');
    const wizard = read('apps/studio/src/features/projects/new-project-wizard.tsx');
    expect(checkbox).toContain("Checkbox as CheckboxPrimitive } from 'radix-ui'");
    expect(radio).toContain("RadioGroup as RadioGroupPrimitive } from 'radix-ui'");
    expect(wizard).toContain('<RadioGroup value={type}');
    expect(wizard).toContain('<Checkbox');
    expect(wizard).toContain('id="project-demo-content"');
    expect(wizard).not.toContain('type="radio"');
    expect(wizard).not.toContain('type="checkbox"');
  });
});
