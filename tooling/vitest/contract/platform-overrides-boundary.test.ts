import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (relativePath: string) => readFileSync(new URL(`../../../${relativePath}`, import.meta.url), 'utf8');

describe('M06.3 platform override boundaries', () => {
  it('keeps Studio advanced UI behind editor-puck instead of importing Puck directly', () => {
    const inspector = read('apps/studio/src/features/editor/advanced/platform-style-inspector.tsx');
    const topbar = read('apps/studio/src/shell/studio-topbar.tsx');

    expect(inspector).not.toContain("from '@puckeditor/core'");
    expect(topbar).not.toContain("from '@puckeditor/core'");
    expect(inspector).toContain('usePuckEditorConfig');
    expect(topbar).toContain('puckPlatformControls');
  });

  it('keeps platform preview context session-only and persists only canonical Style overrides', () => {
    const controls = read('packages/editor-puck/src/puck-platform-controls.ts');
    const contracts = read('packages/domain/src/contracts/platform-overrides.ts');

    expect(controls).not.toContain('localStorage');
    expect(controls).not.toContain('workspace_preferences');
    expect(controls).not.toContain('queueAutosave');
    expect(controls).not.toContain('projectStorageRuntime');
    expect(controls).not.toContain('electroCraftDocumentSchema');
    expect(contracts).toContain('setPlatformStyleOverride');
    expect(contracts).toContain('resetPlatformStyleOverride');
  });

  it('consumes declared registry capabilities without invoking the later global Compatibility Analyzer', () => {
    const projection = read('packages/editor-puck/src/puck-platform-capabilities.ts');
    const inspector = read('apps/studio/src/features/editor/advanced/platform-style-inspector.tsx');

    expect(projection).toContain('electrocraftRegistryDefinition');
    expect(projection).toContain('electrocraftCapabilityDefinitions');
    expect(inspector).toContain('resolveDeclaredPlatformCapabilities');
    expect(inspector).not.toContain('CapabilityAnalysisReport');
    expect(inspector).not.toContain('CompatibilityAnalyzer');
  });
});
