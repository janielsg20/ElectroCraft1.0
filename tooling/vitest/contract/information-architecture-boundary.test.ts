import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('M03.7 information architecture boundaries', () => {
  it('uses the real Radix Collapsible owner for Progressive Disclosure', () => {
    const collapsible = read('packages/design-system/src/components/ui/collapsible.tsx');
    const patterns = read('apps/studio/src/shell/information-architecture-ui.tsx');
    expect(collapsible).toContain("from 'radix-ui'");
    expect(patterns).toContain('CollapsibleTrigger asChild');
    expect(patterns).toContain('data-progressive-disclosure');
  });

  it('keeps Settings primary controls visible and diagnostics outside Advanced', () => {
    const topbar = read('apps/studio/src/shell/studio-topbar.tsx');
    const diagnosticIndex = topbar.indexOf('ec-ia-diagnostic-alert');
    const primaryIndex = topbar.indexOf('data-information-level="primary"');
    const disclosureIndex = topbar.indexOf('id="settings-advanced"');
    expect(diagnosticIndex).toBeGreaterThan(0);
    expect(primaryIndex).toBeGreaterThan(diagnosticIndex);
    expect(disclosureIndex).toBeGreaterThan(primaryIndex);
    expect(topbar).not.toContain('onCloseAutoFocus');
  });

  it('keeps Puck ownership while applying Inspector and empty-state composition', () => {
    const editor = read('apps/studio/src/shell/editor-workspace.tsx');
    expect(editor).toContain("from '@electrocraft/editor-puck'");
    expect(editor).not.toContain("from '@puckeditor/core'");
    expect(editor).toContain('<PuckEditorFields');
    expect(editor).toContain('<PuckEditorPreview');
    expect(editor).toContain('<PuckEditorOutline');
    expect(editor).toContain('id="inspector-advanced"');
    expect(editor).toContain('<StudioEmptyState id="canvas"');
    expect(editor).toContain('<StudioEmptyState id="outline"');
    expect(editor).toContain('<StudioEmptyState id="inspector"');
  });

  it('keeps List/Detail within the canonical Content route without a redundant detail route', () => {
    const app = read('apps/studio/src/App.tsx');
    const patterns = read('apps/studio/src/shell/information-architecture-ui.tsx');
    expect(app).toContain("const contentRoute = '/content'");
    expect(app).toContain('<StudioContentListDetailRoute');
    expect(app).not.toContain('/content/detail');
    expect(patterns).toContain('data-list-detail-pattern');
    expect(patterns).not.toContain('/content/detail');
  });

  it('keeps the canonical IA document and compatibility alias without forking them', () => {
    const owner = read('.ai/INFORMATION_ARCHITECTURE.md');
    const alias = read('.ai/UX_INFORMATION_ARCHITECTURE.md');
    expect(owner).toContain('# M03.7 — Progressive Disclosure contract');
    expect(owner).toContain('primary');
    expect(owner).toContain('diagnostic');
    expect(alias).toContain('INFORMATION_ARCHITECTURE.md');
  });
});
