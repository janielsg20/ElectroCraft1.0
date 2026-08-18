import * as z from 'zod';

export const electroCraftStudioThemeModeSchema = z.enum(['light', 'dark', 'system']);
export type ElectroCraftStudioThemeMode = z.infer<typeof electroCraftStudioThemeModeSchema>;

export const electroCraftStudioDensitySchema = z.enum(['compact', 'comfortable']);
export type ElectroCraftStudioDensity = z.infer<typeof electroCraftStudioDensitySchema>;

export const electroCraftStudioAppearanceSchema = z.strictObject({
  schemaVersion: z.literal(1),
  theme: electroCraftStudioThemeModeSchema,
  density: electroCraftStudioDensitySchema,
});
export type ElectroCraftStudioAppearance = z.infer<typeof electroCraftStudioAppearanceSchema>;

const legacyAppearanceV0Schema = z.strictObject({
  schemaVersion: z.literal(0),
  theme: z.enum(['light', 'dark']),
});

export const defaultElectroCraftStudioAppearance: ElectroCraftStudioAppearance = Object.freeze({
  schemaVersion: 1,
  theme: 'system',
  density: 'compact',
});

export function migrateElectroCraftStudioAppearance(input: unknown): ElectroCraftStudioAppearance {
  const current = electroCraftStudioAppearanceSchema.safeParse(input);
  if (current.success) return current.data;

  const legacy = legacyAppearanceV0Schema.safeParse(input);
  if (!legacy.success) throw current.error;

  return electroCraftStudioAppearanceSchema.parse({
    schemaVersion: 1,
    theme: legacy.data.theme,
    density: 'compact',
  });
}

export function serializeElectroCraftStudioAppearance(input: unknown): string {
  return JSON.stringify(electroCraftStudioAppearanceSchema.parse(input));
}

export function deserializeElectroCraftStudioAppearance(serialized: string): ElectroCraftStudioAppearance {
  return migrateElectroCraftStudioAppearance(JSON.parse(serialized) as unknown);
}

export function roundTripElectroCraftStudioAppearance(input: unknown): ElectroCraftStudioAppearance {
  return deserializeElectroCraftStudioAppearance(serializeElectroCraftStudioAppearance(input));
}

export function resolveElectroCraftTheme(
  mode: ElectroCraftStudioThemeMode,
  systemPrefersDark: boolean,
): Exclude<ElectroCraftStudioThemeMode, 'system'> {
  return mode === 'system' ? (systemPrefersDark ? 'dark' : 'light') : mode;
}
