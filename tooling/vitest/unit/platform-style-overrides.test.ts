import { describe, expect, it } from 'vitest';
import {
  createDefaultElectroCraftStyle,
  resolvePlatformStyleDeclaration,
  resolvePlatformStyleProperty,
  resetPlatformStyleOverride,
  setPlatformStyleOverride,
} from '@electrocraft/domain';

const px = (value: number) => ({ kind: 'value' as const, value, unit: 'px' as const });

describe('M06.3 canonical platform style overrides', () => {
  it('resolves native inheritance before the concrete mobile platform', () => {
    const base = createDefaultElectroCraftStyle();
    const withNative = {
      ...base,
      base: { ...base.base, width: px(960) },
      platform: { native: { width: px(430), opacity: 0.8 }, android: { width: px(412) } },
    };

    expect(resolvePlatformStyleProperty(withNative, 'android', 'width')).toMatchObject({
      value: px(412),
      source: 'android',
      overriddenHere: true,
    });
    expect(resolvePlatformStyleProperty(withNative, 'ios', 'width')).toMatchObject({
      value: px(430),
      source: 'native',
      overriddenHere: false,
    });
    expect(resolvePlatformStyleDeclaration(withNative, 'ios')).toMatchObject({ width: px(430), opacity: 0.8 });
    expect(resolvePlatformStyleProperty(withNative, 'web', 'width').source).toBe('base');
  });

  it('sets and resets only the selected property without mutating canonical input', () => {
    const base = createDefaultElectroCraftStyle();
    const overridden = setPlatformStyleOverride(base, 'ios', 'width', px(390));
    const withOpacity = setPlatformStyleOverride(overridden, 'ios', 'opacity', 0.75);
    const reset = resetPlatformStyleOverride(withOpacity, 'ios', 'width');

    expect(base.platform).toEqual({});
    expect(reset.platform.ios).toEqual({ opacity: 0.75 });
    expect(resetPlatformStyleOverride(reset, 'ios', 'opacity').platform).toEqual({});
  });

  it('fails closed for an unsupported Studio platform context', () => {
    expect(() => resolvePlatformStyleProperty(createDefaultElectroCraftStyle(), 'desktop' as 'web', 'width')).toThrow();
  });
});
