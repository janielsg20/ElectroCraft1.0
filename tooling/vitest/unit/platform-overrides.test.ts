import { describe, expect, it } from 'vitest';
import {
  createDefaultElectroCraftStyle,
  createDeterministicObjectId,
  electroCraftRegistryDefinitionSchema,
  electroPlatformCapabilityDefinitionSchema,
  resetPlatformStyleOverride,
  resolveDeclaredPlatformCapabilities,
  resolvePlatformStyleProperty,
  setPlatformStyleOverride,
  summarizeDeclaredPlatformCapabilities,
} from '@electrocraft/domain';

describe('platform overrides', () => {
  const responsive = createDefaultElectroCraftStyle().base;

  it('resolves responsive, native and exact platform values in order', () => {
    let style = createDefaultElectroCraftStyle();
    style = {
      ...style,
      platform: {
        native: { padding: { kind: 'value', value: 12, unit: 'px' } },
      },
    };
    style = setPlatformStyleOverride(style, 'ios', 'padding', { kind: 'value', value: 8, unit: 'px' });

    expect(resolvePlatformStyleProperty(style, responsive, 'web', 'padding').source).toEqual({ kind: 'responsive' });
    expect(resolvePlatformStyleProperty(style, responsive, 'android', 'padding')).toMatchObject({
      value: { value: 12 },
      source: { kind: 'native' },
    });
    expect(resolvePlatformStyleProperty(style, responsive, 'ios', 'padding')).toMatchObject({
      value: { value: 8 },
      source: { kind: 'platform', platform: 'ios' },
    });
  });

  it('writes and resets only the selected property', () => {
    const base = createDefaultElectroCraftStyle();
    const width = setPlatformStyleOverride(base, 'android', 'width', { kind: 'value', value: 320, unit: 'px' });
    const opacity = setPlatformStyleOverride(width, 'android', 'opacity', 0.8);
    const reset = resetPlatformStyleOverride(opacity, 'android', 'width');

    expect(reset.platform.android).toEqual({ opacity: 0.8 });
    expect(base.platform).toEqual({});
  });

  it('uses registry declarations for target badges and fails closed when a capability is missing', () => {
    const registry = electroCraftRegistryDefinitionSchema.parse({
      schemaVersion: 1,
      id: createDeterministicObjectId('registry', 'test:Button'),
      version: 1,
      kind: 'component',
      key: 'Button',
      label: 'Botón',
      origin: 'core',
      capabilityRefs: ['editor.platform-overrides', 'editor.missing-capability'],
      metadata: {},
    });
    const capabilities = [
      electroPlatformCapabilityDefinitionSchema.parse({
        schemaVersion: 1,
        id: 'editor.platform-overrides',
        version: 2,
        label: 'Estilo por plataforma',
        support: [
          { target: 'react-web', mode: 'supported', adapter: null, reason: null },
          {
            target: 'android-expo',
            mode: 'adapted',
            adapter: 'react-native-style',
            reason: 'Conversión portable.',
          },
          {
            target: 'ios-expo',
            mode: 'adapted',
            adapter: 'react-native-style',
            reason: 'Conversión portable.',
          },
        ],
        metadata: {},
      }),
    ];

    const android = resolveDeclaredPlatformCapabilities(registry, capabilities, 'android');
    expect(android[0]).toMatchObject({ target: 'android-expo', mode: 'adapted', version: 2 });
    expect(android[1]).toMatchObject({ mode: 'blocked', source: 'missing' });
    expect(summarizeDeclaredPlatformCapabilities(android)).toBe('blocked');
  });
});
