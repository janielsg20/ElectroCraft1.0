import * as z from 'zod';
import { electroCraftMetadataSchema, jsonValueSchema } from './json-value';
import { electroCraftObjectIdSchema, type ElectroCraftObjectId } from './object-id';

const canonicalKeySchema = z.string().regex(/^[A-Za-z][A-Za-z0-9_-]{0,79}$/);
const packageIdSchema = z.string().regex(/^[a-z][a-z0-9]*(?:[.-][a-z0-9]+){1,15}$/);
const semverSchema = z.string().regex(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?$/);
const sha256Schema = z.string().regex(/^[a-f0-9]{64}$/);

export const electroCraftCapabilityIdSchema = z.string().regex(/^[a-z][a-z0-9]*(?:[.-][a-z0-9]+){1,15}$/);
export type ElectroCraftCapabilityId = z.infer<typeof electroCraftCapabilityIdSchema>;

export const electroCraftCapabilitySupportModeSchema = z.enum(['supported', 'adapted', 'blocked']);
export type ElectroCraftCapabilitySupportMode = z.infer<typeof electroCraftCapabilitySupportModeSchema>;

export const electroCraftOriginBlueprintSchema = z.strictObject({
  packageId: packageIdSchema,
  version: semverSchema,
});
export type ElectroCraftOriginBlueprint = z.infer<typeof electroCraftOriginBlueprintSchema>;

export const electroCraftTypographyTokenSchema = z.strictObject({
  fontFamily: z.string().trim().min(1).max(200),
  fontSize: z.number().positive().max(512),
  lineHeight: z.number().positive().max(10),
  fontWeight: z.number().int().min(100).max(900),
  letterSpacing: z.number().min(-20).max(100),
});

export const electroCraftMotionTokenSchema = z.strictObject({
  durationMs: z.number().int().nonnegative().max(60_000),
  easing: z.string().trim().min(1).max(120),
  reduceMotion: z.boolean(),
});

export const electroCraftThemeSchema = z.strictObject({
  schemaVersion: z.literal(1),
  id: electroCraftObjectIdSchema,
  version: z.number().int().positive(),
  key: canonicalKeySchema,
  label: z.string().trim().min(1).max(160),
  tokens: z.record(z.string().regex(/^[A-Za-z][A-Za-z0-9_.-]{0,119}$/), z.union([z.string(), z.number()])),
  typography: z.record(canonicalKeySchema, electroCraftTypographyTokenSchema),
  variants: z.record(canonicalKeySchema, z.record(z.string().min(1).max(120), jsonValueSchema)),
  spacing: z.record(canonicalKeySchema, z.number().nonnegative().max(4096)),
  radius: z.record(canonicalKeySchema, z.number().nonnegative().max(4096)),
  shadows: z.record(canonicalKeySchema, z.string().trim().min(1).max(500)),
  motion: z.record(canonicalKeySchema, electroCraftMotionTokenSchema),
  metadata: electroCraftMetadataSchema,
});
export type ElectroCraftTheme = z.infer<typeof electroCraftThemeSchema>;

export const electroCraftBlueprintArtifactKindSchema = z.enum([
  'document',
  'component-definition',
  'theme',
  'data-source',
  'data-schema',
  'query',
  'action-graph',
  'state',
  'role',
  'permission-policy',
  'registry-definition',
]);

export const electroCraftBlueprintArtifactSchema = z.strictObject({
  objectId: electroCraftObjectIdSchema,
  kind: electroCraftBlueprintArtifactKindSchema,
  operation: z.enum(['create', 'replace']),
  contentHash: sha256Schema,
});
export type ElectroCraftBlueprintArtifact = z.infer<typeof electroCraftBlueprintArtifactSchema>;

function duplicateValues(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    else seen.add(value);
  }
  return [...duplicates].sort();
}

export const electroCraftBlueprintPackageSchema = z
  .strictObject({
    schemaVersion: z.literal(1),
    packageId: packageIdSchema,
    version: semverSchema,
    name: z.string().trim().min(1).max(160),
    requiredCapabilities: z.array(electroCraftCapabilityIdSchema).max(200),
    artifacts: z.array(electroCraftBlueprintArtifactSchema).min(1).max(5_000),
    metadata: electroCraftMetadataSchema,
  })
  .superRefine((blueprint, context) => {
    for (const duplicate of duplicateValues(blueprint.requiredCapabilities)) {
      context.addIssue({
        code: 'custom',
        path: ['requiredCapabilities'],
        message: `duplicate blueprint capability: ${duplicate}`,
      });
    }
    for (const duplicate of duplicateValues(blueprint.artifacts.map(({ objectId }) => objectId))) {
      context.addIssue({ code: 'custom', path: ['artifacts'], message: `duplicate blueprint object id: ${duplicate}` });
    }
  });
export type ElectroCraftBlueprintPackage = z.infer<typeof electroCraftBlueprintPackageSchema>;

export const electroCraftRegistryDefinitionKindSchema = z.enum(['component', 'field', 'action', 'provider']);
export type ElectroCraftRegistryDefinitionKind = z.infer<typeof electroCraftRegistryDefinitionKindSchema>;

export const electroCraftRegistryDefinitionSchema = z.strictObject({
  schemaVersion: z.literal(1),
  id: electroCraftObjectIdSchema,
  version: z.number().int().positive(),
  kind: electroCraftRegistryDefinitionKindSchema,
  key: canonicalKeySchema,
  label: z.string().trim().min(1).max(160),
  origin: z.enum(['core', 'extension', 'user']),
  capabilityRefs: z.array(electroCraftCapabilityIdSchema).max(100),
  metadata: electroCraftMetadataSchema,
});
export type ElectroCraftRegistryDefinition = z.infer<typeof electroCraftRegistryDefinitionSchema>;

export const electroPlatformCapabilitySupportSchema = z.strictObject({
  target: z.string().regex(/^[a-z][a-z0-9-]{0,79}$/),
  mode: electroCraftCapabilitySupportModeSchema,
  adapter: z.string().trim().min(1).max(160).nullable(),
  reason: z.string().trim().min(1).max(500).nullable(),
});
export type ElectroPlatformCapabilitySupport = z.infer<typeof electroPlatformCapabilitySupportSchema>;

export const electroPlatformCapabilityDefinitionSchema = z
  .strictObject({
    schemaVersion: z.literal(1),
    id: electroCraftCapabilityIdSchema,
    version: z.number().int().positive(),
    label: z.string().trim().min(1).max(160),
    support: z.array(electroPlatformCapabilitySupportSchema).min(1).max(100),
    metadata: electroCraftMetadataSchema,
  })
  .superRefine((definition, context) => {
    for (const duplicate of duplicateValues(definition.support.map(({ target }) => target))) {
      context.addIssue({ code: 'custom', path: ['support'], message: `duplicate capability target: ${duplicate}` });
    }
  });
export type ElectroPlatformCapabilityDefinition = z.infer<typeof electroPlatformCapabilityDefinitionSchema>;

export interface ElectroCraftRegistryReferenceDiagnostic {
  code: 'duplicate-user-definition-ref' | 'non-user-definition-persisted';
  ownerId: ElectroCraftObjectId;
  ref: string;
}
