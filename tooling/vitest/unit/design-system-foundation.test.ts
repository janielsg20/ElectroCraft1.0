import { describe, expect, it } from 'vitest';
import {
  defaultElectroCraftStudioAppearance,
  electroCraftIconRegistry,
  electroCraftStudioAppearanceSchema,
  migrateElectroCraftStudioAppearance,
  resolveElectroCraftTheme,
  roundTripElectroCraftStudioAppearance,
} from '@electrocraft/design-system';

describe('M03.1 ElectroCraft design system foundation', () => {
  it('round-trips the versioned Studio appearance preference', () => {
    const appearance = electroCraftStudioAppearanceSchema.parse({
      schemaVersion: 1,
      theme: 'system',
      density: 'compact',
    });
    expect(roundTripElectroCraftStudioAppearance(appearance)).toEqual(appearance);
  });

  it('migrates legacy v0 appearance without inventing a second theme model', () => {
    expect(migrateElectroCraftStudioAppearance({ schemaVersion: 0, theme: 'dark' })).toEqual({
      schemaVersion: 1,
      theme: 'dark',
      density: 'compact',
    });
  });

  it('resolves system theme deterministically and keeps compact density as baseline', () => {
    expect(resolveElectroCraftTheme('system', true)).toBe('dark');
    expect(resolveElectroCraftTheme('system', false)).toBe('light');
    expect(defaultElectroCraftStudioAppearance.density).toBe('compact');
  });

  it('exposes a typed semantic Lucide registry for Studio navigation and shell actions', () => {
    expect(Object.keys(electroCraftIconRegistry)).toEqual(
      expect.arrayContaining(['editor', 'screens', 'components', 'automations', 'preview', 'help', 'settings']),
    );
    expect(typeof electroCraftIconRegistry.settings).toBe('object');
  });
});
