import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

function source(path: string) {
  return readFileSync(resolve(path), 'utf8');
}

describe('M05.1 Puck adapter boundary', () => {
  it('keeps Studio feature code behind @electrocraft/editor-puck', () => {
    const session = source('apps/studio/src/features/editor/puck-document-session.ts');
    const diagnostic = source('apps/studio/src/features/editor/puck-diagnostic-renderer.ts');
    const persistence = source('apps/studio/src/features/editor/puck-document-persistence.ts');
    expect(session).not.toContain('@puckeditor/core');
    expect(diagnostic).not.toContain('@puckeditor/core');
    expect(persistence).not.toContain('@puckeditor/core');
    expect(session).toContain('@electrocraft/editor-puck');
    expect(diagnostic).toContain('@electrocraft/editor-puck');
    expect(persistence).toContain('@electrocraft/editor-puck');
  });

  it('uses public Puck Data/ComponentData/Slot and treats canonical root as the Puck root envelope', () => {
    const adapter = source('packages/editor-puck/src/puck-document-adapter.ts');
    const config = source('packages/editor-puck/src/puck-component-adapter.ts');
    expect(adapter).toContain("from '@puckeditor/core'");
    expect(adapter).toContain('ComponentData');
    expect(adapter).toContain('Data');
    expect(config).toContain("type: 'slot'");
    expect(adapter).toContain('canonical.root.children.map');
    expect(adapter).toContain('root: { props: cloneCanonicalProps(canonical.root.props) }');
    expect(adapter).toContain('hasLegacyZoneContent');
    expect(adapter).toContain('legacy zones with content are not supported');
    expect(adapter).not.toContain('selectedItem');
    expect(adapter).not.toContain('draggedItem');
  });

  it('reuses Puck public Composition pieces instead of recreating editor chrome', () => {
    const composition = source('packages/editor-puck/src/puck-editor-composition.ts');
    expect(composition).toContain('export const PuckEditorComponents = Puck.Components');
    expect(composition).toContain('export const PuckEditorOutline = Puck.Outline');
    expect(composition).toContain('export const PuckEditorPreview = Puck.Preview');
    expect(composition).toContain('export const PuckEditorFields = Puck.Fields');
    expect(composition).toContain('export function PuckEditorRoot');
    expect(composition).toContain('createElement(');
    expect(composition).toContain('Puck,');
    expect(composition).toContain('...electroCraftPuckIframeConfig');
  });

  it('persists only reconstructed canonical document data through project autosave', () => {
    const persistence = source('apps/studio/src/features/editor/puck-document-persistence.ts');
    expect(persistence).toContain('session.reconstruct(data)');
    expect(persistence).toContain('queueAutosave');
    expect(persistence).toContain("kind: 'document'");
    expect(persistence).not.toContain('saveRevision');
    expect(persistence).not.toContain('selectedItem');
    expect(persistence).not.toContain('history');
  });
});
