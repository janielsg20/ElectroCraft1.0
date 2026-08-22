import { describe, expect, it } from 'vitest';
import {
  MARKET_APPEARANCE_DESCRIPTORS,
  MARKET_APPEARANCE_DESCRIPTOR_BY_ID,
  MARKET_STUDIO_APPEARANCE_PRESETS,
  resolveMarketAppearanceDescriptor,
} from '../../../apps/studio/src/market-appearance-presets';
import { DEFAULT_EDITOR_APPEARANCE_PROFILE } from '../../../apps/studio/src/theme';

describe('market-inspired Studio appearance presets', () => {
  it('ships ten distinct product layouts with complete descriptor coverage', () => {
    expect(MARKET_STUDIO_APPEARANCE_PRESETS).toHaveLength(10);
    expect(MARKET_APPEARANCE_DESCRIPTORS).toHaveLength(10);

    const ids = new Set(MARKET_STUDIO_APPEARANCE_PRESETS.map((preset) => preset.id));
    const layouts = new Set(MARKET_APPEARANCE_DESCRIPTORS.map((descriptor) => descriptor.layout));

    expect(ids.size).toBe(10);
    expect(layouts.size).toBe(10);
    expect(MARKET_STUDIO_APPEARANCE_PRESETS.every((preset) => MARKET_APPEARANCE_DESCRIPTOR_BY_ID.has(preset.id))).toBe(
      true,
    );
    expect(MARKET_STUDIO_APPEARANCE_PRESETS.every((preset) => preset.profile.productDesign === preset.id)).toBe(true);
  });

  it('keeps every design accessible, high-density capable and intentionally differentiated', () => {
    for (const preset of MARKET_STUDIO_APPEARANCE_PRESETS) {
      const descriptor = MARKET_APPEARANCE_DESCRIPTOR_BY_ID.get(preset.id);
      expect(descriptor).toBeDefined();
      expect(descriptor?.traits).toHaveLength(3);
      expect(descriptor?.recommendedFor.length).toBeGreaterThan(8);
      expect(descriptor?.interaction.length).toBeGreaterThan(12);
      expect(descriptor?.stateFeedback.length).toBeGreaterThan(12);
      expect(['high', 'comfortable']).toContain(preset.profile.density);
      expect(['standard', 'high']).toContain(preset.profile.contrastPreference);
    }
  });

  it('resolves the product identity independently from editable profile values', () => {
    const carbon = MARKET_STUDIO_APPEARANCE_PRESETS.find((preset) => preset.id === 'market:studio-carbon');
    expect(carbon).toBeDefined();

    const personalized = {
      ...carbon!.profile,
      name: 'Mi entorno de desarrollo',
      accent: 'rose' as const,
      typographyFamily: 'humanist' as const,
      animationIntensity: 'reduced' as const,
    };
    expect(resolveMarketAppearanceDescriptor(personalized)).toMatchObject({
      presetId: 'market:studio-carbon',
      layout: 'ide',
    });
  });

  it('drops the market layout only when the product design is explicitly reset', () => {
    const carbon = MARKET_STUDIO_APPEARANCE_PRESETS.find((preset) => preset.id === 'market:studio-carbon');
    expect(carbon).toBeDefined();

    expect(resolveMarketAppearanceDescriptor({ ...carbon!.profile, productDesign: 'custom' })).toBeNull();
    expect(resolveMarketAppearanceDescriptor(DEFAULT_EDITOR_APPEARANCE_PROFILE)).toBeNull();
  });

  it('contains the requested neutral, accent-driven, expressive and low-motion choices', () => {
    const byId = new Map(MARKET_STUDIO_APPEARANCE_PRESETS.map((preset) => [preset.id, preset] as const));

    expect(byId.get('market:linear-neutral')?.profile.semanticColors).toBe('muted');
    expect(byId.get('market:commerce-desk')?.profile.accent).toBe('emerald');
    expect(byId.get('market:aurora-glass')?.profile.animationIntensity).toBe('high');
    expect(byId.get('market:zen-canvas')?.profile.animationIntensity).toBe('reduced');
    expect(byId.get('market:data-command')?.profile.typographyFamily).toBe('mono');
    expect(byId.get('market:cms-editorial')?.profile.tone).toBe('light');
  });
});
