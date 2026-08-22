import fs from 'node:fs';
import path from 'node:path';
import { buildElectroCraftExportIR } from '@electrocraft/application';
import { serializeElectroCraftExportIR } from '@electrocraft/domain';
import { structuralPuckData } from '@electrocraft/editor-puck';
import { describe, expect, it } from 'vitest';
import { DEFAULT_STUDIO_THEME, persistStudioTheme, type StudioThemeStorage } from '../../../apps/studio/src/theme';
import { canonicalExportIrSource } from '../helpers/export-ir-fixture';

const root = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('M03.9 Studio theme isolation contract', () => {
  it('keeps the Studio theme runtime outside editor document and export ownership', () => {
    const appearanceSources = [
      read('apps/studio/src/theme.ts'),
      read('apps/studio/src/theme-provider.tsx'),
      read('apps/studio/src/shell/appearance-panel.tsx'),
    ].join('\n');

    expect(appearanceSources).not.toContain('@electrocraft/editor-puck');
    expect(appearanceSources).not.toContain('@electrocraft/export-ir');
    expect(appearanceSources).not.toContain('@electrocraft/exporters');
    expect(appearanceSources).not.toContain('market-appearance-presets');
    expect(appearanceSources).not.toContain('framework-themes');
  });

  it('does not change editor data, canonical app theme or ExportIR when switching Studio color mode', () => {
    let persisted: string | null = null;
    const storage: StudioThemeStorage = {
      read: () => persisted,
      write: (serialized) => {
        persisted = serialized;
      },
      remove: () => {
        persisted = null;
      },
    };
    const source = canonicalExportIrSource();
    const editorBefore = JSON.stringify(structuralPuckData);
    const projectThemeBefore = JSON.stringify(source.theme);
    const sourceBefore = JSON.stringify(source);
    const exportBefore = serializeElectroCraftExportIR(buildElectroCraftExportIR(source).ir);

    persistStudioTheme(storage, 'dark');
    persistStudioTheme(storage, 'light');

    expect(JSON.stringify(structuralPuckData)).toBe(editorBefore);
    expect(JSON.stringify(source.theme)).toBe(projectThemeBefore);
    expect(JSON.stringify(source)).toBe(sourceBefore);
    expect(serializeElectroCraftExportIR(buildElectroCraftExportIR(source).ir)).toBe(exportBefore);
    expect(DEFAULT_STUDIO_THEME).toBe('light');
  });

  it('wires appearance through Settings and the six-slot mobile dock without replacing editor destinations', () => {
    const topbar = read('apps/studio/src/shell/studio-topbar.tsx');
    const workspace = read('apps/studio/src/shell/editor-workspace.tsx');
    const responsive = read('apps/studio/src/shell/responsive-shell.css');
    const mobileAppearanceTrigger = '<AppearancePanelTrigger presentation="mobile" />';

    expect(topbar).toContain('data-settings-destination="appearance"');
    expect(topbar).toContain('<AppearancePanelTrigger />');
    expect(workspace).toContain(mobileAppearanceTrigger);
    expect(workspace.split(mobileAppearanceTrigger)).toHaveLength(2);
    expect(workspace).toContain('data-mobile-destination="components"');
    expect(workspace).toContain('data-mobile-destination="screens"');
    expect(workspace).toContain('data-mobile-destination="canvas"');
    expect(workspace).toContain('data-mobile-destination="properties"');
    expect(workspace).toContain('data-mobile-destination="more"');
    expect(responsive).toContain('grid-template-columns: repeat(6, minmax(0, 1fr));');
  });

  it('keeps visual values in one design-system token layer with no framework or preset selectors', () => {
    const provider = read('apps/studio/src/theme-provider.tsx');
    const appearanceCss = read('apps/studio/src/shell/appearance.css');
    const tokens = read('packages/design-system/src/styles/studio-appearance-tokens.css');

    expect(provider).not.toContain('oklch(');
    expect(appearanceCss).not.toContain('oklch(');
    expect(tokens).not.toContain('data-ec-framework');
    expect(tokens).not.toContain('data-ec-accent');
    expect(tokens).not.toContain('data-ec-market');
    expect(tokens).toContain('--ec-studio-button-radius: var(--radius);');
  });
});
