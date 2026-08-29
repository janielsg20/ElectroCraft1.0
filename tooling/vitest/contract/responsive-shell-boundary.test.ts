import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('M03.6 responsive shell boundaries', () => {
  it('extends the existing Radix Sheet instead of introducing another drawer subsystem', () => {
    const sheet = read('packages/design-system/src/components/ui/sheet.tsx');
    expect(sheet).toContain("export type SheetSide = 'left' | 'right' | 'bottom'");
    expect(sheet).toContain("from 'radix-ui'");
    expect(sheet).toContain('data-sheet-side={side}');
  });

  it('keeps mobile editor icons behind the semantic design-system registry', () => {
    const icons = read('packages/design-system/src/icons/studio-icon-registry.ts');
    for (const iconId of [
      'studio.mobile.components',
      'studio.mobile.screens',
      'studio.mobile.canvas',
      'studio.mobile.properties',
      'studio.mobile.more',
      'studio.mobile.outline',
    ]) {
      expect(icons).toContain(`'${iconId}'`);
    }
  });

  it('keeps Puck owned by editor-puck and resolves Screens through the Screen Composer selector', () => {
    const workspace = read('apps/studio/src/shell/editor-workspace.tsx');
    expect(workspace).toContain("from '@electrocraft/editor-puck'");
    expect(workspace).not.toContain("from '@puckeditor/core'");
    expect(workspace).toContain('EditorScreensContextPanel');
    expect(workspace).toContain('data-editor-mobile-sheet="screens"');
    expect(workspace).not.toContain('href="/screens"');
  });

  it('uses a bottom Sheet for Properties and an inset near-full-height Sheet for Outline', () => {
    const workspace = read('apps/studio/src/shell/editor-workspace.tsx');
    const css = read('apps/studio/src/shell/responsive-shell.css');
    expect(workspace).toContain('data-editor-mobile-sheet="properties"');
    expect(workspace).toContain('side="bottom"');
    expect(workspace).toContain('data-editor-mobile-sheet="outline"');
    expect(workspace).toContain('data-mobile-tool="outline"');
    expect(css).toContain('.ec-editor-mobile-full-sheet');
    expect(css).toContain('width: calc(100vw - 1rem) !important');
  });

  it('keeps one controlled secondary surface active at a time', () => {
    const workspace = read('apps/studio/src/shell/editor-workspace.tsx');
    expect(workspace).toContain('useState<SecondaryTool | null>(null)');
    expect(workspace).toContain('useState<MobileTool | null>(null)');
    expect(workspace).toContain("activeTool === 'properties'");
    expect(workspace).toContain("activeTool === 'outline'");
  });
});
