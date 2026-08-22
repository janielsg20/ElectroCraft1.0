import fs from 'node:fs';
import path from 'node:path';
import { buildElectroCraftExportIR } from '@electrocraft/application';
import { serializeElectroCraftExportIR } from '@electrocraft/domain';
import { structuralPuckData } from '@electrocraft/editor-puck';
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_EDITOR_APPEARANCE_PROFILE,
  persistEditorAppearanceProfile,
  resetEditorAppearanceProfile,
  type EditorAppearanceStorage,
} from '../../../apps/studio/src/theme';
import { canonicalExportIrSource } from '../helpers/export-ir-fixture';

const root = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('M03.9 appearance isolation contract', () => {
  it('keeps the appearance runtime outside editor document and export ownership', () => {
    const appearanceSources = [
      read('apps/studio/src/theme.ts'),
      read('apps/studio/src/theme-provider.tsx'),
      read('apps/studio/src/shell/appearance-panel.tsx'),
    ].join('\n');

    expect(appearanceSources).not.toContain('@electrocraft/editor-puck');
    expect(appearanceSources).not.toContain('@electrocraft/export-ir');
    expect(appearanceSources).not.toContain('@electrocraft/exporters');
    expect(appearanceSources).not.toContain('packages/frontend');
  });

  it('does not change serialized editor data, canonical project theme or ExportIR across appearance cycles', () => {
    let persisted: string | null = null;
    const storage: EditorAppearanceStorage = {
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

    const custom = persistEditorAppearanceProfile(storage, {
      ...DEFAULT_EDITOR_APPEARANCE_PROFILE,
      name: 'Aislamiento',
      tone: 'dark',
      accent: 'rose',
      typographyFamily: 'mono',
      iconStyle: 'strong',
      radii: 'rounded',
      elevation: 'raised',
      density: 'comfortable',
      canvasDensity: 'spacious',
      animationIntensity: 'high',
      contrastPreference: 'high',
    });
    persistEditorAppearanceProfile(storage, resetEditorAppearanceProfile(custom));

    expect(JSON.stringify(structuralPuckData)).toBe(editorBefore);
    expect(JSON.stringify(source.theme)).toBe(projectThemeBefore);
    expect(JSON.stringify(source)).toBe(sourceBefore);
    expect(serializeElectroCraftExportIR(buildElectroCraftExportIR(source).ir)).toBe(exportBefore);
    expect(DEFAULT_EDITOR_APPEARANCE_PROFILE.name).toBe('ElectroCraft');
  });

  it('wires appearance through Settings and mobile without replacing editor destinations', () => {
    const topbar = read('apps/studio/src/shell/studio-topbar.tsx');
    const workspace = read('apps/studio/src/shell/editor-workspace.tsx');
    const responsive = read('apps/studio/src/shell/responsive-shell.css');

    expect(topbar).toContain('data-settings-destination="appearance"');
    expect(topbar).toContain('<AppearancePanelTrigger />');
    expect(workspace).toContain('<AppearancePanelTrigger presentation="mobile" />');
    expect(workspace).toContain('data-mobile-destination="components"');
    expect(workspace).toContain('data-mobile-destination="screens"');
    expect(workspace).toContain('data-mobile-destination="canvas"');
    expect(workspace).toContain('data-mobile-destination="properties"');
    expect(workspace).toContain('data-mobile-destination="more"');
    expect(responsive).toContain('grid-template-columns: repeat(5, minmax(0, 1fr));');
  });

  it('keeps appearance values in the design-system token layer instead of feature CSS magic values', () => {
    const provider = read('apps/studio/src/theme-provider.tsx');
    const appearanceCss = read('apps/studio/src/shell/appearance.css');
    const tokens = read('packages/design-system/src/styles/studio-appearance-tokens.css');

    expect(provider).not.toContain('oklch(');
    expect(appearanceCss).not.toContain('oklch(');
    expect(tokens).toContain("[data-ec-typography-family='humanist']");
    expect(tokens).toContain("[data-ec-motion='high']");
    expect(tokens).toContain("[data-ec-contrast='high']");
  });
});
