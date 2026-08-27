import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  canonicalDocumentRoundTrip,
  createDefaultElectroCraftLayout,
  createDefaultElectroCraftStyle,
  electroCraftDocumentSchema,
  importElectroCraftDocument,
} from '@electrocraft/domain';
import { parsePuckNodePresentation, projectPuckNodePresentation } from '@electrocraft/editor-puck';

function fixture(name: string): unknown {
  return JSON.parse(readFileSync(resolve(`tooling/fixtures/canonical-model/${name}.json`), 'utf8')) as unknown;
}

describe('M06.1 canonical Layout/Style inspector model', () => {
  it('migrates every v3 node to explicit inherited presentation in document v4', () => {
    const imported = importElectroCraftDocument(fixture('screen-v3'));
    expect(imported.migratedFrom).toBe(3);
    expect(imported.document).toMatchObject({
      schemaVersion: 4,
      root: { layout: null, style: null },
    });
    expect(canonicalDocumentRoundTrip(imported.document)).toEqual(imported.document);
  });

  it('validates semantic overrides and rejects raw CSS payloads fail-closed', () => {
    const document = electroCraftDocumentSchema.parse(fixture('screen-v4'));
    const layout = { ...createDefaultElectroCraftLayout(), mode: 'grid' as const, columns: 3 };
    const style = createDefaultElectroCraftStyle();
    document.root.layout = layout;
    document.root.style = style;
    expect(electroCraftDocumentSchema.parse(document).root.layout).toEqual(layout);

    expect(
      electroCraftDocumentSchema.safeParse({
        ...document,
        root: { ...document.root, style: { ...style, className: 'grid grid-cols-3' } },
      }).success,
    ).toBe(false);
  });

  it('projects and parses only the reserved Puck transport props', () => {
    const layout = { ...createDefaultElectroCraftLayout(), mode: 'row' as const };
    const projected = projectPuckNodePresentation({ label: 'Conservar' }, { layout, style: null });
    expect(parsePuckNodePresentation(projected)).toEqual({ layout, style: null });
    expect(projected).toMatchObject({ label: 'Conservar' });
    expect(() => parsePuckNodePresentation({ __electrocraftLayout: { mode: 'raw-css', display: 'flex' } })).toThrow();
  });
});
