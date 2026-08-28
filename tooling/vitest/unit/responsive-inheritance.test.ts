import { describe, expect, it } from 'vitest';
import {
  ELECTROCRAFT_RESPONSIVE_PRESETS,
  createDefaultElectroCraftStyle,
  electroCraftResponsiveConfigurationSchema,
  resetResponsiveStyleOverride,
  resolveResponsiveStyleDeclaration,
  resolveResponsiveStyleProperty,
  setResponsiveStyleOverride,
} from '@electrocraft/domain';
import { projectResponsiveConfigurationToPuckViewports } from '@electrocraft/editor-puck';
import { puckResponsiveControls } from '@electrocraft/editor-puck';

describe('responsive inheritance', () => {
  const ids = ['desktop', 'tablet-portrait', 'mobile-small'] as const;
  const initial = { base: createDefaultElectroCraftStyle().base, overrides: {} };

  it('writes and resets only the current property', () => {
    const desktop = setResponsiveStyleOverride(initial, 'desktop', 'gap', { kind: 'value', value: 16, unit: 'px' });
    const mobile = setResponsiveStyleOverride(desktop, 'mobile-small', 'width', {
      kind: 'value',
      value: 100,
      unit: 'percent',
    });
    expect(resolveResponsiveStyleProperty(mobile, ids, 'tablet-portrait', 'gap')).toMatchObject({
      value: { value: 16 },
      source: { kind: 'inherited', breakpointId: 'desktop' },
    });
    expect(resolveResponsiveStyleProperty(mobile, ids, 'mobile-small', 'width').source.kind).toBe('override');
    expect(resetResponsiveStyleOverride(mobile, 'mobile-small', 'width').overrides).toEqual(desktop.overrides);
  });

  it('fails closed for unknown and duplicate breakpoint ids', () => {
    expect(() => resolveResponsiveStyleProperty(initial, ids, 'unknown', 'gap')).toThrow(
      /Unknown responsive breakpoint/,
    );
    const duplicate = {
      ...ELECTROCRAFT_RESPONSIVE_PRESETS,
      breakpoints: [ELECTROCRAFT_RESPONSIVE_PRESETS.breakpoints[0], ELECTROCRAFT_RESPONSIVE_PRESETS.breakpoints[0]],
    };
    expect(electroCraftResponsiveConfigurationSchema.safeParse(duplicate).success).toBe(false);
  });

  it('maps all canonical presets and custom widths to public Puck viewports without losing canonical ids', () => {
    const custom = electroCraftResponsiveConfigurationSchema.parse({
      schemaVersion: 1,
      breakpoints: [
        ...ELECTROCRAFT_RESPONSIVE_PRESETS.breakpoints,
        { id: 'kiosk', label: 'Quiosco', width: 1920, height: null, orientation: 'landscape', custom: true },
      ],
    });
    const viewports = projectResponsiveConfigurationToPuckViewports(custom);
    expect(viewports).toHaveLength(7);
    expect(viewports.at(-1)).toEqual({ width: 1920, height: 'auto', label: 'Quiosco', icon: 'Monitor' });
    expect(custom.breakpoints.at(-1)?.id).toBe('kiosk');
  });

  it('delegates viewport changes to Puck without writing canonical overrides', () => {
    const applied: Array<{ width: number | '100%'; height: number | 'auto' }> = [];
    const persisted: unknown[] = [];
    const disconnect = puckResponsiveControls.connect({
      setViewport: (viewport) => applied.push(viewport),
      setBreakpoints: (breakpoints) => persisted.push(breakpoints),
    });
    const before = structuredClone(initial);
    puckResponsiveControls.select('tablet-portrait');
    expect(applied).toEqual([{ width: 768, height: 1024 }]);
    expect(initial).toEqual(before);
    expect(puckResponsiveControls.getSnapshot().currentId).toBe('tablet-portrait');
    puckResponsiveControls.syncCurrent(360);
    expect(puckResponsiveControls.getSnapshot().currentId).toBe('mobile-small');
    puckResponsiveControls.addCustom({
      id: 'kiosk',
      label: 'Quiosco',
      width: 1920,
      height: 1080,
      orientation: 'landscape',
    });
    expect(persisted).toHaveLength(1);
    disconnect();
  });

  it('materializes the effective declaration for the Canvas without mutating canonical data', () => {
    const responsive = setResponsiveStyleOverride(initial, 'desktop', 'padding', {
      kind: 'value',
      value: 12,
      unit: 'px',
    });
    const mobile = setResponsiveStyleOverride(responsive, 'mobile-small', 'padding', {
      kind: 'value',
      value: 4,
      unit: 'px',
    });
    const before = structuredClone(mobile);
    expect(resolveResponsiveStyleDeclaration(mobile, ids, 'mobile-small').padding).toEqual({
      kind: 'value',
      value: 4,
      unit: 'px',
    });
    expect(resolveResponsiveStyleDeclaration(mobile, ids, 'tablet-portrait').padding).toEqual({
      kind: 'value',
      value: 12,
      unit: 'px',
    });
    expect(mobile).toEqual(before);
  });

  it('resolves optional visibility overrides for legacy base declarations that do not contain the key', () => {
    const legacyBase = structuredClone(createDefaultElectroCraftStyle().base);
    delete legacyBase.visibility;
    const responsive = setResponsiveStyleOverride(
      { base: legacyBase, overrides: {} },
      'mobile-small',
      'visibility',
      'hidden',
    );

    expect(resolveResponsiveStyleDeclaration(responsive, ids, 'mobile-small').visibility).toBe('hidden');
  });
});
