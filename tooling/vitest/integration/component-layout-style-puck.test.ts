import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Render } from '@puckeditor/core';
import { describe, expect, it } from 'vitest';
import { electroCraftComponentDefinitionSchema, type ElectroCraftObjectId } from '@electrocraft/domain';
import {
  ComponentDefinitionService,
  type CanonicalComponentDefinitionRecord,
  type CanonicalComponentDefinitionRepository,
} from '@electrocraft/application';
import { createPuckConfig, type PuckCanonicalRenderer } from '@electrocraft/editor-puck';

function fixture(name: string): unknown {
  return JSON.parse(readFileSync(resolve(`tooling/fixtures/canonical-model/${name}.json`), 'utf8')) as unknown;
}

class MemoryComponentDefinitionRepository implements CanonicalComponentDefinitionRepository {
  readonly records = new Map<ElectroCraftObjectId, CanonicalComponentDefinitionRecord>();

  async put(record: CanonicalComponentDefinitionRecord): Promise<void> {
    this.records.set(record.id, structuredClone(record));
  }

  async get(id: ElectroCraftObjectId): Promise<CanonicalComponentDefinitionRecord | null> {
    return structuredClone(this.records.get(id) ?? null);
  }
}

describe('M02.2 Puck adapter and component persistence', () => {
  it('maps canonical component metadata into a real Puck Config and renders with Render', () => {
    const definition = electroCraftComponentDefinitionSchema.parse(fixture('component-definition-v1'));
    const renderer: PuckCanonicalRenderer = ({ title }) => createElement('h2', null, String(title));
    const config = createPuckConfig([definition], { HeadingBlock: renderer });

    expect(config.components.HeadingBlock.label).toBe('Encabezado');
    expect(config.components.HeadingBlock.fields?.title).toMatchObject({ type: 'text', label: 'Título' });
    expect(config.components.HeadingBlock.fields?.emphasis).toMatchObject({ type: 'radio', label: 'Énfasis' });

    const markup = renderToStaticMarkup(
      createElement(Render, {
        config,
        data: {
          content: [
            {
              type: 'HeadingBlock',
              props: { id: 'heading-instance-1', title: 'Hola ElectroCraft', emphasis: true },
            },
          ],
          root: {},
        },
      }),
    );

    expect(markup).toContain('Hola ElectroCraft');
  });

  it('saves and reopens canonical component definitions without engine internals', async () => {
    const repository = new MemoryComponentDefinitionRepository();
    const service = new ComponentDefinitionService(repository);
    const definition = electroCraftComponentDefinitionSchema.parse(fixture('component-definition-v1'));

    await expect(service.save(definition)).resolves.toMatchObject({ status: 'saved' });
    await expect(new ComponentDefinitionService(repository).reopen(definition.id)).resolves.toMatchObject({
      status: 'ready',
      migrated: false,
      definition,
    });
  });

  it('migrates persisted legacy ComponentDefinition and writes the canonical payload back', async () => {
    const repository = new MemoryComponentDefinitionRepository();
    const legacy = fixture('component-definition-v0') as { id: ElectroCraftObjectId };
    repository.records.set(legacy.id, {
      kind: 'component-definition',
      id: legacy.id,
      schemaVersion: 1,
      payload: legacy,
    });

    const result = await new ComponentDefinitionService(repository).reopen(legacy.id);
    expect(result).toMatchObject({ status: 'ready', migrated: true });
    expect(repository.records.get(legacy.id)?.payload).toMatchObject({ schemaVersion: 1, layout: { mode: 'row' } });
  });
});
