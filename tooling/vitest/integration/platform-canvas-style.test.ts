import { describe, expect, it } from 'vitest';
import {
  createDefaultElectroCraftLayout,
  createDefaultElectroCraftStyle,
  setPlatformStyleOverride,
} from '@electrocraft/domain';
import { resolveStudioPresentationStyle } from '../../../apps/studio/src/features/editor/advanced/presentation-style';

describe('platform Canvas presentation', () => {
  it('renders the selected platform override without changing the canonical style', () => {
    const initial = createDefaultElectroCraftStyle();
    const style = setPlatformStyleOverride(initial, 'ios', 'width', { kind: 'value', value: 320, unit: 'px' });
    const before = structuredClone(style);

    const web = resolveStudioPresentationStyle({}, createDefaultElectroCraftLayout(), style, [], null, 'web');
    const ios = resolveStudioPresentationStyle({}, createDefaultElectroCraftLayout(), style, [], null, 'ios');

    expect(web.width).toBeUndefined();
    expect(ios.width).toBe('320px');
    expect(style).toEqual(before);
  });

  it('uses native fallback for Android and allows an iOS-specific override above it', () => {
    let style = createDefaultElectroCraftStyle();
    style = {
      ...style,
      platform: {
        native: { opacity: 0.7 },
      },
    };
    style = setPlatformStyleOverride(style, 'ios', 'opacity', 0.9);

    expect(
      resolveStudioPresentationStyle({}, createDefaultElectroCraftLayout(), style, [], null, 'android').opacity,
    ).toBe(0.7);
    expect(resolveStudioPresentationStyle({}, createDefaultElectroCraftLayout(), style, [], null, 'ios').opacity).toBe(
      0.9,
    );
  });
});
