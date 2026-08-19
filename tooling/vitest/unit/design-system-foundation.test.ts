import { describe, expect, it } from 'vitest';
import {
  defaultDesignSystemFoundationConfig,
  deserializeDesignSystemFoundationConfig,
  migrateDesignSystemFoundationConfig,
  serializeDesignSystemFoundationConfig,
} from '../../../packages/design-system/src/foundation/design-system-foundation';

describe('M03.1 design-system foundation config', () => {
  it('round-trips the v1 portable config deterministically', () => {
    const serialized = serializeDesignSystemFoundationConfig(defaultDesignSystemFoundationConfig);

    expect(serialized).toBe(
      '{"schemaVersion":1,"primitiveBase":"radix","iconLibrary":"lucide","theme":"system","density":"high"}',
    );
    expect(deserializeDesignSystemFoundationConfig(serialized)).toEqual(defaultDesignSystemFoundationConfig);
  });

  it('migrates the legacy v0 themeMode field to v1 theme', () => {
    expect(
      migrateDesignSystemFoundationConfig({
        schemaVersion: 0,
        primitiveBase: 'radix',
        iconLibrary: 'lucide',
        themeMode: 'dark',
        density: 'high',
      }),
    ).toEqual({
      schemaVersion: 1,
      primitiveBase: 'radix',
      iconLibrary: 'lucide',
      theme: 'dark',
      density: 'high',
    });
  });

  it('fails closed for future or malformed configs', () => {
    expect(() =>
      migrateDesignSystemFoundationConfig({
        schemaVersion: 2,
        primitiveBase: 'radix',
        iconLibrary: 'lucide',
        theme: 'system',
        density: 'high',
      }),
    ).toThrow(/Unsupported design-system schemaVersion/);

    expect(() => deserializeDesignSystemFoundationConfig('{bad json')).toThrow(/not valid JSON/);
  });
});
