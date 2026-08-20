import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const viewportWidths = [1440, 1280, 1024, 768, 375, 320] as const;

describe('M03.12 AppShell QA boundary', () => {
  it('freezes the six required viewport widths without fixed sleeps', () => {
    const e2e = read('tooling/playwright/m03-12-appshell.spec.ts');
    for (const width of viewportWidths) expect(e2e).toContain(`width: ${width}`);
    expect(e2e).not.toContain('waitForTimeout');
    expect(e2e).not.toMatch(/setTimeout\s*\(/);
  });

  it('retains trace and screenshot evidence on browser failures', () => {
    const config = read('playwright.config.ts');
    expect(config).toContain("trace: 'retain-on-failure'");
    expect(config).toContain("screenshot: 'only-on-failure'");
  });

  it('keeps StudioAppearanceProfile outside canonical project Theme and ExportIR', () => {
    const provider = read('apps/studio/src/theme-provider.tsx');
    const theme = read('apps/studio/src/theme.ts');
    expect(theme).toContain("EDITOR_APPEARANCE_STORAGE_KEY = 'electrocraft.studio.appearance.v1'");
    expect(provider).not.toContain('ElectroCraftDocument');
    expect(provider).not.toContain('ExportIR');
    expect(provider).not.toContain('source.theme');
    expect(theme).not.toContain('ElectroCraftDocument');
    expect(theme).not.toContain('ExportIR');
    expect(theme).not.toContain('source.theme');
    expect(theme).not.toContain('@electrocraft/export-ir');
  });

  it('documents the observed QA matrix without inventing obsolete navigation', () => {
    const qa = read('docs/qa/F03_APPSHELL_E2E.md');
    const screens = read('.ai/SCREEN_SPECS/F03_APPSHELL.md');
    for (const label of ['Acciones y workflows', 'Usuarios y permisos', 'Registros']) {
      expect(`${qa}\n${screens}`).toContain(label);
    }
    for (const obsolete of ['| Taxonomías |', '| Relaciones |', '| Roles |']) {
      expect(`${qa}\n${screens}`).not.toContain(obsolete);
    }
  });
});
