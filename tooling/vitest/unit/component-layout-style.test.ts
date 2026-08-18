import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  canonicalComponentDefinitionRoundTrip,
  electroCraftComponentDefinitionSchema,
  electroCraftLayoutSchema,
  importElectroCraftComponentDefinition,
} from '@electrocraft/domain';

function fixture(name: string): unknown {
  return JSON.parse(readFileSync(resolve(`tooling/fixtures/canonical-model/${name}.json`), 'utf8')) as unknown;
}

describe('M02.2 canonical Component/Layout/Style', () => {
  it('round-trips a portable component definition deterministically', () => {
    const definition = electroCraftComponentDefinitionSchema.parse(fixture('component-definition-v1'));
    expect(canonicalComponentDefinitionRoundTrip(definition)).toEqual(definition);
  });

  it('migrates legacy horizontal layout to semantic row', () => {
    const imported = importElectroCraftComponentDefinition(fixture('component-definition-v0'));
    expect(imported.migratedFrom).toBe(0);
    expect(imported.definition.schemaVersion).toBe(1);
    expect(imported.definition.layout.mode).toBe('row');
    expect(imported.definition.layout.columns).toBeNull();
  });

  it('requires grid columns and rejects columns on non-grid layouts', () => {
    expect(
      electroCraftLayoutSchema.safeParse({
        mode: 'grid',
        gap: null,
        align: 'stretch',
        justify: 'start',
        wrap: false,
        columns: null,
      }).success,
    ).toBe(false);

    expect(
      electroCraftLayoutSchema.safeParse({
        mode: 'row',
        gap: null,
        align: 'stretch',
        justify: 'start',
        wrap: false,
        columns: 2,
      }).success,
    ).toBe(false);
  });

  it('rejects Tailwind and NativeWind class strings as canonical style source', () => {
    const definition = fixture('component-definition-v1') as Record<string, unknown>;
    const style = definition.style as Record<string, unknown>;
    const result = electroCraftComponentDefinitionSchema.safeParse({
      ...definition,
      style: {
        ...style,
        className: 'p-4 md:p-8',
        nativeWind: 'flex-row',
      },
    });
    expect(result.success).toBe(false);
  });

  it('rejects undeclared default props', () => {
    const definition = fixture('component-definition-v1') as Record<string, unknown>;
    const result = electroCraftComponentDefinitionSchema.safeParse({
      ...definition,
      defaultProps: {
        ...((definition.defaultProps as Record<string, unknown>) ?? {}),
        ghost: true,
      },
    });
    expect(result.success).toBe(false);
  });

  it('keeps responsive and platform overrides as structured values', () => {
    const definition = electroCraftComponentDefinitionSchema.parse(fixture('component-definition-v1'));
    expect(definition.style.responsive.mobile?.fontSize).toEqual({ kind: 'value', value: 1.5, unit: 'rem' });
    expect(definition.style.platform.native?.fontSize).toEqual({ kind: 'value', value: 1.75, unit: 'rem' });
  });
});
