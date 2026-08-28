import * as z from 'zod';
import {
  electroCraftResponsiveBreakpointIdSchema,
  electroCraftStyleDeclarationSchema,
  type ElectroCraftStyleDeclaration,
} from './component-definition';

export const electroCraftBreakpointIdSchema = electroCraftResponsiveBreakpointIdSchema;
export type ElectroCraftBreakpointId = z.infer<typeof electroCraftBreakpointIdSchema>;

export const electroCraftBreakpointDefinitionSchema = z.strictObject({
  id: electroCraftBreakpointIdSchema,
  label: z.string().trim().min(1).max(80),
  width: z.number().int().min(240).max(7680),
  height: z.number().int().min(240).max(7680).nullable(),
  orientation: z.enum(['portrait', 'landscape']),
  custom: z.boolean(),
});
export type ElectroCraftBreakpointDefinition = z.infer<typeof electroCraftBreakpointDefinitionSchema>;

export const electroCraftResponsiveConfigurationSchema = z
  .strictObject({
    schemaVersion: z.literal(1),
    breakpoints: z.array(electroCraftBreakpointDefinitionSchema).min(1).max(24),
  })
  .superRefine((configuration, context) => {
    const ids = new Set<string>();
    for (const [index, breakpoint] of configuration.breakpoints.entries()) {
      if (ids.has(breakpoint.id)) {
        context.addIssue({ code: 'custom', path: ['breakpoints', index, 'id'], message: 'duplicate breakpoint id' });
      }
      ids.add(breakpoint.id);
    }
  });
export type ElectroCraftResponsiveConfiguration = z.infer<typeof electroCraftResponsiveConfigurationSchema>;
export const ELECTROCRAFT_RESPONSIVE_METADATA_KEY = 'responsive';

export function readResponsiveConfigurationMetadata(
  metadata: Readonly<Record<string, unknown>>,
): ElectroCraftResponsiveConfiguration {
  const value = metadata[ELECTROCRAFT_RESPONSIVE_METADATA_KEY];
  return electroCraftResponsiveConfigurationSchema.parse(value ?? ELECTROCRAFT_RESPONSIVE_PRESETS);
}

export const electroCraftResponsiveStyleSchema = z.strictObject({
  base: electroCraftStyleDeclarationSchema,
  overrides: z.record(electroCraftBreakpointIdSchema, electroCraftStyleDeclarationSchema.partial()),
});
export type ElectroCraftResponsiveStyle = z.infer<typeof electroCraftResponsiveStyleSchema>;

export const ELECTROCRAFT_RESPONSIVE_PRESETS = electroCraftResponsiveConfigurationSchema.parse({
  schemaVersion: 1,
  breakpoints: [
    { id: 'desktop', label: 'Escritorio', width: 1440, height: 900, orientation: 'landscape', custom: false },
    { id: 'laptop', label: 'Portátil', width: 1280, height: 800, orientation: 'landscape', custom: false },
    {
      id: 'tablet-landscape',
      label: 'Tablet horizontal',
      width: 1024,
      height: 768,
      orientation: 'landscape',
      custom: false,
    },
    {
      id: 'tablet-portrait',
      label: 'Tablet vertical',
      width: 768,
      height: 1024,
      orientation: 'portrait',
      custom: false,
    },
    { id: 'mobile-large', label: 'Móvil grande', width: 430, height: 932, orientation: 'portrait', custom: false },
    { id: 'mobile-small', label: 'Móvil pequeño', width: 360, height: 800, orientation: 'portrait', custom: false },
  ],
});

export type ElectroCraftStyleProperty = keyof ElectroCraftStyleDeclaration;
export type ElectroCraftResponsiveValueSource =
  | Readonly<{ kind: 'base' }>
  | Readonly<{ kind: 'inherited'; breakpointId: ElectroCraftBreakpointId }>
  | Readonly<{ kind: 'override'; breakpointId: ElectroCraftBreakpointId }>;

export function resolveResponsiveStyleProperty<K extends ElectroCraftStyleProperty>(
  responsive: ElectroCraftResponsiveStyle,
  orderedBreakpointIds: readonly ElectroCraftBreakpointId[],
  breakpointId: ElectroCraftBreakpointId | null,
  property: K,
): Readonly<{ value: ElectroCraftStyleDeclaration[K]; source: ElectroCraftResponsiveValueSource }> {
  if (breakpointId === null) return { value: responsive.base[property], source: { kind: 'base' } };
  const index = orderedBreakpointIds.indexOf(breakpointId);
  if (index < 0) throw new Error(`Unknown responsive breakpoint: ${breakpointId}`);

  for (let cursor = index; cursor >= 0; cursor -= 1) {
    const sourceId = orderedBreakpointIds[cursor];
    const override = responsive.overrides[sourceId];
    if (override && Object.hasOwn(override, property)) {
      return {
        value: override[property] as ElectroCraftStyleDeclaration[K],
        source:
          sourceId === breakpointId
            ? { kind: 'override', breakpointId }
            : { kind: 'inherited', breakpointId: sourceId },
      };
    }
  }
  return { value: responsive.base[property], source: { kind: 'base' } };
}

export function setResponsiveStyleOverride<K extends ElectroCraftStyleProperty>(
  responsive: ElectroCraftResponsiveStyle,
  breakpointId: ElectroCraftBreakpointId,
  property: K,
  value: ElectroCraftStyleDeclaration[K],
): ElectroCraftResponsiveStyle {
  return electroCraftResponsiveStyleSchema.parse({
    ...responsive,
    overrides: {
      ...responsive.overrides,
      [breakpointId]: { ...responsive.overrides[breakpointId], [property]: value },
    },
  });
}

export function resetResponsiveStyleOverride(
  responsive: ElectroCraftResponsiveStyle,
  breakpointId: ElectroCraftBreakpointId,
  property: ElectroCraftStyleProperty,
): ElectroCraftResponsiveStyle {
  const current = { ...responsive.overrides[breakpointId] };
  delete current[property];
  const overrides = { ...responsive.overrides };
  if (Object.keys(current).length === 0) delete overrides[breakpointId];
  else overrides[breakpointId] = current;
  return electroCraftResponsiveStyleSchema.parse({ ...responsive, overrides });
}

export function resolveResponsiveStyleDeclaration(
  responsive: ElectroCraftResponsiveStyle,
  orderedBreakpointIds: readonly ElectroCraftBreakpointId[],
  breakpointId: ElectroCraftBreakpointId | null,
): ElectroCraftStyleDeclaration {
  const declaration = {} as ElectroCraftStyleDeclaration;
  for (const property of Object.keys(responsive.base) as ElectroCraftStyleProperty[]) {
    declaration[property] = resolveResponsiveStyleProperty(responsive, orderedBreakpointIds, breakpointId, property)
      .value as never;
  }
  return electroCraftStyleDeclarationSchema.parse(declaration);
}
