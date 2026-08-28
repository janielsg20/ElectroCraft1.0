import { readFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  createDefaultElectroCraftStyle,
  resolvePlatformStyleDeclaration,
  resolveResponsiveStyleDeclaration,
  setPlatformStyleOverride,
  setResponsiveStyleOverride,
} from '@electrocraft/domain';

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('M06.8 advanced editor QA', () => {
  it('keeps one Puck runtime across desktop, tablet and mobile without experimental overrides', () => {
    const workspace = read('apps/studio/src/shell/editor-workspace.tsx');
    const composition = read('packages/editor-puck/src/puck-editor-composition.ts');

    expect(workspace.match(/<PuckEditorRoot/g)).toHaveLength(1);
    expect(workspace).toContain('<MobileEditorLayout />');
    expect(workspace).toContain('<ResponsiveEditorLayout mode={mode}');
    expect(workspace).not.toContain("from '@puckeditor/core'");
    expect(composition).not.toContain('componentOverlay:');
    expect(composition).not.toContain('overrides:');
  });

  it('keeps advanced editor session state out of canonical persistence', () => {
    const persistence = read('apps/studio/src/features/editor/puck-document-persistence.ts');
    const adapter = read('packages/editor-puck/src/puck-document-adapter.ts');
    const advancedSelection = read('packages/editor-puck/src/puck-advanced-selection.ts');
    const context = read('packages/editor-puck/src/puck-context-controls.ts');
    const guides = read('packages/editor-puck/src/puck-canvas-guides.ts');

    for (const forbidden of ['selectedIds', 'lockedIds', 'clipboardAvailable', 'guidesVisible', 'feedback']) {
      expect(persistence).not.toContain(forbidden);
      expect(adapter).not.toContain(forbidden);
    }
    for (const sessionOnlyModule of [advancedSelection, context, guides]) {
      expect(sessionOnlyModule).not.toContain('projectStorageRuntime');
      expect(sessionOnlyModule).not.toContain('queueAutosave');
      expect(sessionOnlyModule).not.toContain('ElectroCraftDocument');
    }
  });

  it('keeps advanced Canvas styling single-owned and platform declarations application-owned', () => {
    const designSystemIndex = read('packages/design-system/src/index.ts');
    const puckStyles = read('apps/studio/src/features/editor/puck-composition.css');
    const platformRegistry = read('apps/studio/src/features/editor/advanced/platform-capabilities.ts');
    const platformProjection = read('packages/editor-puck/src/puck-platform-capabilities.ts');

    expect(designSystemIndex).not.toContain('editor-guides.css');
    expect(puckStyles).toContain('.ec-canvas-guides');
    expect(puckStyles).toContain('.ec-canvas-context-bar');
    expect(platformRegistry).toContain("metadata: { owner: 'editor-puck', phase: 'M06.3' }");
    expect(platformProjection).toContain('projectPlatformCapabilitiesToPuckConfig');
    expect(platformProjection).not.toContain("id: 'editor.platform-overrides'");
  });

  it('resolves a medium advanced document style workload without mutating canonical state', () => {
    const ids = ['desktop', 'tablet-portrait', 'mobile-small'] as const;
    let style = createDefaultElectroCraftStyle();
    const responsiveStyle = setResponsiveStyleOverride(
      { base: style.base, overrides: style.responsive },
      'mobile-small',
      'padding',
      { kind: 'value', value: 8, unit: 'px' },
    );
    style = { ...style, base: responsiveStyle.base, responsive: responsiveStyle.overrides };
    style = setPlatformStyleOverride(style, 'android', 'opacity', 0.85);
    const before = structuredClone(style);
    let lastOpacity: number | null | undefined;

    const started = performance.now();
    for (let index = 0; index < 1_000; index += 1) {
      const responsive = resolveResponsiveStyleDeclaration(
        { base: style.base, overrides: style.responsive },
        ids,
        index % 2 === 0 ? 'mobile-small' : 'tablet-portrait',
      );
      const platform = resolvePlatformStyleDeclaration(style, responsive, index % 3 === 0 ? 'android' : 'web');
      lastOpacity = platform.opacity;
    }
    const duration = performance.now() - started;

    expect(lastOpacity).toBeDefined();
    expect(style).toEqual(before);
    expect(duration).toBeLessThan(1_500);
  });
});
