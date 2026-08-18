import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { electroCraftComponentDefinitionSchema } from '@electrocraft/domain';

function fixture(name: string): unknown {
  return JSON.parse(readFileSync(resolve(`tooling/fixtures/canonical-model/${name}.json`), 'utf8')) as unknown;
}

describe('M02.2 component/layout/style boundaries', () => {
  it('keeps renderer and CSS engine internals out of canonical component data', () => {
    const definition = fixture('component-definition-v1') as Record<string, unknown>;
    expect(definition).not.toHaveProperty('renderer');
    expect(definition).not.toHaveProperty('reactComponent');
    expect(definition).not.toHaveProperty('className');
    expect(definition).not.toHaveProperty('tailwind');
    expect(definition).not.toHaveProperty('nativeWind');

    expect(
      electroCraftComponentDefinitionSchema.safeParse({
        ...definition,
        renderer: 'HeadingBlockReact',
      }).success,
    ).toBe(false);
  });

  it('keeps Zod contracts in domain and Puck ownership in editor-puck', () => {
    const domainSource = [
      'packages/domain/src/contracts/component-definition.ts',
      'packages/domain/src/contracts/serialization.ts',
    ]
      .map((file) => readFileSync(resolve(file), 'utf8'))
      .join('\n');
    const adapterSource = readFileSync(resolve('packages/editor-puck/src/puck-component-adapter.ts'), 'utf8');

    expect(domainSource).not.toMatch(/from ['"](?:react|@puckeditor\/core|tailwindcss|nativewind)['"]/);
    expect(adapterSource).toMatch(/from ['"]@puckeditor\/core['"]/);
    expect(adapterSource).toMatch(/from ['"]@electrocraft\/domain['"]/);
  });

  it('stores semantic layout modes instead of Puck or CSS layout payloads', () => {
    const definition = electroCraftComponentDefinitionSchema.parse(fixture('component-definition-v1'));
    expect(['flow', 'stack', 'row', 'grid', 'overlay']).toContain(definition.layout.mode);
    expect(definition.layout).not.toHaveProperty('display');
    expect(definition.layout).not.toHaveProperty('flexDirection');
    expect(definition.layout).not.toHaveProperty('puck');
  });
});
