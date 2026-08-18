import * as z from 'zod';

export const electroCraftModelOwnershipCategorySchema = z.enum([
  'project-object',
  'registry-definition',
  'content-entity',
]);
export type ElectroCraftModelOwnershipCategory = z.infer<typeof electroCraftModelOwnershipCategorySchema>;

export const electroCraftModelOwnershipKeySchema = z.enum([
  'project-definition',
  'document',
  'data-source',
  'data-schema',
  'query-definition',
  'form-definition',
  'action-graph',
  'state-definition',
  'role',
  'permission-policy',
  'route',
  'navigation',
  'theme',
  'reusable-component',
  'component-definition',
  'field-type',
  'action-node',
  'provider',
  'platform-capability',
  'blueprint-catalog',
  'record',
  'term',
  'relation-edge',
  'media-metadata',
  'user-profile',
  'audit-event',
]);
export type ElectroCraftModelOwnershipKey = z.infer<typeof electroCraftModelOwnershipKeySchema>;

export const electroCraftModelStorageAuthoritySchema = z.enum([
  'canonical-project',
  'application-registry',
  'content-storage',
]);
export type ElectroCraftModelStorageAuthority = z.infer<typeof electroCraftModelStorageAuthoritySchema>;

export const electroCraftModelExportAccessSchema = z.enum([
  'embedded',
  'reference',
  'manifest',
  'resolver',
  'none',
]);
export type ElectroCraftModelExportAccess = z.infer<typeof electroCraftModelExportAccessSchema>;

export const electroCraftModelVersioningAuthoritySchema = z.enum([
  'project-schema',
  'app-version',
  'content-schema',
]);
export type ElectroCraftModelVersioningAuthority = z.infer<typeof electroCraftModelVersioningAuthoritySchema>;

const ownerPackageSchema = z.enum([
  '@electrocraft/domain',
  '@electrocraft/application',
  '@electrocraft/data-core',
  '@electrocraft/media-tiptap',
  '@electrocraft/auth-core',
]);

export const electroCraftModelOwnershipDescriptorSchema = z.strictObject({
  key: electroCraftModelOwnershipKeySchema,
  category: electroCraftModelOwnershipCategorySchema,
  ownerPackage: ownerPackageSchema,
  storageAuthority: electroCraftModelStorageAuthoritySchema,
  serializerOwner: z.string().trim().min(1).max(120),
  migrationOwner: z.string().trim().min(1).max(120),
  exportAccess: electroCraftModelExportAccessSchema,
  versioningAuthority: electroCraftModelVersioningAuthoritySchema,
  canonicalShape: z.string().trim().min(1).max(160),
  notes: z.string().trim().min(1).max(500),
});
export type ElectroCraftModelOwnershipDescriptor = z.infer<typeof electroCraftModelOwnershipDescriptorSchema>;

export const electroCraftModelOwnershipCatalogSchema = z
  .array(electroCraftModelOwnershipDescriptorSchema)
  .min(electroCraftModelOwnershipKeySchema.options.length)
  .max(electroCraftModelOwnershipKeySchema.options.length)
  .superRefine((catalog, context) => {
    const keys = catalog.map(({ key }) => key);
    for (const expected of electroCraftModelOwnershipKeySchema.options) {
      if (!keys.includes(expected)) {
        context.addIssue({ code: 'custom', path: [], message: `missing ownership descriptor: ${expected}` });
      }
    }
    for (const key of new Set(keys)) {
      if (keys.filter((candidate) => candidate === key).length > 1) {
        context.addIssue({ code: 'custom', path: [], message: `duplicate ownership descriptor: ${key}` });
      }
    }
  });

const PROJECT_SERIALIZER = '@electrocraft/domain canonical serializer';
const PROJECT_MIGRATION = '@electrocraft/domain MigrationRegistry';
const REGISTRY_SERIALIZER = '@electrocraft/application registry loader';
const REGISTRY_MIGRATION = '@electrocraft/application app-version migration';
const CONTENT_SERIALIZER = 'content storage adapter';
const CONTENT_MIGRATION = 'content schema migration';

const catalogInput: ElectroCraftModelOwnershipDescriptor[] = [
  {
    key: 'project-definition',
    category: 'project-object',
    ownerPackage: '@electrocraft/domain',
    storageAuthority: 'canonical-project',
    serializerOwner: PROJECT_SERIALIZER,
    migrationOwner: PROJECT_MIGRATION,
    exportAccess: 'embedded',
    versioningAuthority: 'project-schema',
    canonicalShape: 'ElectroCraftProjectDefinition',
    notes: 'Project root identity/settings/refs; never a mega blob of registries or content records.',
  },
  {
    key: 'document',
    category: 'project-object',
    ownerPackage: '@electrocraft/domain',
    storageAuthority: 'canonical-project',
    serializerOwner: PROJECT_SERIALIZER,
    migrationOwner: PROJECT_MIGRATION,
    exportAccess: 'embedded',
    versioningAuthority: 'project-schema',
    canonicalShape: 'ElectroCraftDocument',
    notes: 'Screens/templates/admin screens and portable composition documents.',
  },
  {
    key: 'data-source',
    category: 'project-object',
    ownerPackage: '@electrocraft/domain',
    storageAuthority: 'canonical-project',
    serializerOwner: PROJECT_SERIALIZER,
    migrationOwner: PROJECT_MIGRATION,
    exportAccess: 'embedded',
    versioningAuthority: 'project-schema',
    canonicalShape: 'ElectroCraftDataSourceDefinition',
    notes: 'Portable adapter/capability/config definition; secrets remain external through authRef.',
  },
  {
    key: 'data-schema',
    category: 'project-object',
    ownerPackage: '@electrocraft/domain',
    storageAuthority: 'canonical-project',
    serializerOwner: PROJECT_SERIALIZER,
    migrationOwner: PROJECT_MIGRATION,
    exportAccess: 'embedded',
    versioningAuthority: 'project-schema',
    canonicalShape: 'ElectroCraftDataSchema',
    notes: 'Logical model/field/relation definition, not physical content rows.',
  },
  {
    key: 'query-definition',
    category: 'project-object',
    ownerPackage: '@electrocraft/domain',
    storageAuthority: 'canonical-project',
    serializerOwner: PROJECT_SERIALIZER,
    migrationOwner: PROJECT_MIGRATION,
    exportAccess: 'embedded',
    versioningAuthority: 'project-schema',
    canonicalShape: 'ElectroCraftQueryDefinition',
    notes: 'Portable query intent and bindings, without React Query Builder runtime state.',
  },
  {
    key: 'form-definition',
    category: 'project-object',
    ownerPackage: '@electrocraft/domain',
    storageAuthority: 'canonical-project',
    serializerOwner: PROJECT_SERIALIZER,
    migrationOwner: PROJECT_MIGRATION,
    exportAccess: 'reference',
    versioningAuthority: 'project-schema',
    canonicalShape: 'ElectroCraftDocument kind=form',
    notes: 'No parallel Form tree; ExportIR references the canonical form document ID.',
  },
  {
    key: 'action-graph',
    category: 'project-object',
    ownerPackage: '@electrocraft/domain',
    storageAuthority: 'canonical-project',
    serializerOwner: PROJECT_SERIALIZER,
    migrationOwner: PROJECT_MIGRATION,
    exportAccess: 'embedded',
    versioningAuthority: 'project-schema',
    canonicalShape: 'ElectroCraftActionGraph',
    notes: 'Portable graph definition; Rete editor/history/runtime objects are excluded.',
  },
  {
    key: 'state-definition',
    category: 'project-object',
    ownerPackage: '@electrocraft/domain',
    storageAuthority: 'canonical-project',
    serializerOwner: PROJECT_SERIALIZER,
    migrationOwner: PROJECT_MIGRATION,
    exportAccess: 'embedded',
    versioningAuthority: 'project-schema',
    canonicalShape: 'ElectroCraftStateDefinition',
    notes: 'State declaration only; Zustand store instances are runtime-only.',
  },
  {
    key: 'role',
    category: 'project-object',
    ownerPackage: '@electrocraft/domain',
    storageAuthority: 'canonical-project',
    serializerOwner: PROJECT_SERIALIZER,
    migrationOwner: PROJECT_MIGRATION,
    exportAccess: 'embedded',
    versioningAuthority: 'project-schema',
    canonicalShape: 'ElectroCraftRole',
    notes: 'Role definition referencing portable permission-policy IDs.',
  },
  {
    key: 'permission-policy',
    category: 'project-object',
    ownerPackage: '@electrocraft/domain',
    storageAuthority: 'canonical-project',
    serializerOwner: PROJECT_SERIALIZER,
    migrationOwner: PROJECT_MIGRATION,
    exportAccess: 'embedded',
    versioningAuthority: 'project-schema',
    canonicalShape: 'ElectroCraftPermissionPolicy',
    notes: 'Declarative fail-closed permission policy, not an auth-session object.',
  },
  {
    key: 'route',
    category: 'project-object',
    ownerPackage: '@electrocraft/domain',
    storageAuthority: 'canonical-project',
    serializerOwner: PROJECT_SERIALIZER,
    migrationOwner: PROJECT_MIGRATION,
    exportAccess: 'embedded',
    versioningAuthority: 'project-schema',
    canonicalShape: 'ElectroCraftRouteDefinition',
    notes: 'Portable route definition; no React Router/Expo Router objects persisted.',
  },
  {
    key: 'navigation',
    category: 'project-object',
    ownerPackage: '@electrocraft/domain',
    storageAuthority: 'canonical-project',
    serializerOwner: PROJECT_SERIALIZER,
    migrationOwner: PROJECT_MIGRATION,
    exportAccess: 'embedded',
    versioningAuthority: 'project-schema',
    canonicalShape: 'ElectroCraftNavigationDefinition',
    notes: 'Navigation remains a project object separate from route compiler internals.',
  },
  {
    key: 'theme',
    category: 'project-object',
    ownerPackage: '@electrocraft/domain',
    storageAuthority: 'canonical-project',
    serializerOwner: PROJECT_SERIALIZER,
    migrationOwner: PROJECT_MIGRATION,
    exportAccess: 'embedded',
    versioningAuthority: 'project-schema',
    canonicalShape: 'ElectroCraftTheme',
    notes: 'Portable visual/design-system tokens owned by the project.',
  },
  {
    key: 'reusable-component',
    category: 'project-object',
    ownerPackage: '@electrocraft/domain',
    storageAuthority: 'canonical-project',
    serializerOwner: PROJECT_SERIALIZER,
    migrationOwner: PROJECT_MIGRATION,
    exportAccess: 'embedded',
    versioningAuthority: 'project-schema',
    canonicalShape: 'ElectroCraftDocument kind=reusable-component',
    notes: 'Project-specific reusable composition; distinct from the core ComponentDefinition registry.',
  },
  {
    key: 'component-definition',
    category: 'registry-definition',
    ownerPackage: '@electrocraft/application',
    storageAuthority: 'application-registry',
    serializerOwner: REGISTRY_SERIALIZER,
    migrationOwner: REGISTRY_MIGRATION,
    exportAccess: 'reference',
    versioningAuthority: 'app-version',
    canonicalShape: 'ElectroCraftRegistryDefinition kind=component',
    notes: 'Core/extension definitions stay in the app registry; only explicit user definitions may be referenced by project ID.',
  },
  {
    key: 'field-type',
    category: 'registry-definition',
    ownerPackage: '@electrocraft/application',
    storageAuthority: 'application-registry',
    serializerOwner: REGISTRY_SERIALIZER,
    migrationOwner: REGISTRY_MIGRATION,
    exportAccess: 'reference',
    versioningAuthority: 'app-version',
    canonicalShape: 'ElectroCraftRegistryDefinition kind=field',
    notes: 'Available field definitions are app-versioned and never copied wholesale into ProjectDefinition.',
  },
  {
    key: 'action-node',
    category: 'registry-definition',
    ownerPackage: '@electrocraft/application',
    storageAuthority: 'application-registry',
    serializerOwner: REGISTRY_SERIALIZER,
    migrationOwner: REGISTRY_MIGRATION,
    exportAccess: 'reference',
    versioningAuthority: 'app-version',
    canonicalShape: 'ElectroCraftRegistryDefinition kind=action',
    notes: 'Action-node catalog is runtime/application availability; ActionGraphs persist only portable node refs/config.',
  },
  {
    key: 'provider',
    category: 'registry-definition',
    ownerPackage: '@electrocraft/application',
    storageAuthority: 'application-registry',
    serializerOwner: REGISTRY_SERIALIZER,
    migrationOwner: REGISTRY_MIGRATION,
    exportAccess: 'reference',
    versioningAuthority: 'app-version',
    canonicalShape: 'ElectroCraftRegistryDefinition kind=provider',
    notes: 'Provider catalog remains app-owned; projects retain portable refs/settings only.',
  },
  {
    key: 'platform-capability',
    category: 'registry-definition',
    ownerPackage: '@electrocraft/application',
    storageAuthority: 'application-registry',
    serializerOwner: REGISTRY_SERIALIZER,
    migrationOwner: REGISTRY_MIGRATION,
    exportAccess: 'reference',
    versioningAuthority: 'app-version',
    canonicalShape: 'ElectroPlatformCapabilityDefinition',
    notes: 'ExportIR carries required capability IDs/reports, never the complete capability registry.',
  },
  {
    key: 'blueprint-catalog',
    category: 'registry-definition',
    ownerPackage: '@electrocraft/application',
    storageAuthority: 'application-registry',
    serializerOwner: REGISTRY_SERIALIZER,
    migrationOwner: REGISTRY_MIGRATION,
    exportAccess: 'none',
    versioningAuthority: 'app-version',
    canonicalShape: 'ElectroCraftBlueprintPackage catalog',
    notes: 'Blueprint packages are external/catalog inputs; installed project objects become normal canonical objects and only originBlueprint remains.',
  },
  {
    key: 'record',
    category: 'content-entity',
    ownerPackage: '@electrocraft/data-core',
    storageAuthority: 'content-storage',
    serializerOwner: CONTENT_SERIALIZER,
    migrationOwner: CONTENT_MIGRATION,
    exportAccess: 'resolver',
    versioningAuthority: 'content-schema',
    canonicalShape: 'content record',
    notes: 'Runtime/admin content row; referenced through model/record IDs and exported only when target content packaging requires it.',
  },
  {
    key: 'term',
    category: 'content-entity',
    ownerPackage: '@electrocraft/data-core',
    storageAuthority: 'content-storage',
    serializerOwner: CONTENT_SERIALIZER,
    migrationOwner: CONTENT_MIGRATION,
    exportAccess: 'resolver',
    versioningAuthority: 'content-schema',
    canonicalShape: 'taxonomy term',
    notes: 'Content taxonomy data belongs to content storage, not ProjectDefinition configuration.',
  },
  {
    key: 'relation-edge',
    category: 'content-entity',
    ownerPackage: '@electrocraft/data-core',
    storageAuthority: 'content-storage',
    serializerOwner: CONTENT_SERIALIZER,
    migrationOwner: CONTENT_MIGRATION,
    exportAccess: 'resolver',
    versioningAuthority: 'content-schema',
    canonicalShape: 'content relation edge',
    notes: 'Runtime relation data is resolved by IDs and never copied into the project model wholesale.',
  },
  {
    key: 'media-metadata',
    category: 'content-entity',
    ownerPackage: '@electrocraft/media-tiptap',
    storageAuthority: 'content-storage',
    serializerOwner: CONTENT_SERIALIZER,
    migrationOwner: CONTENT_MIGRATION,
    exportAccess: 'manifest',
    versioningAuthority: 'content-schema',
    canonicalShape: 'media metadata record',
    notes: 'ExportIR receives only the portable MediaManifest required by the frozen revision, not MediaBlobStore/runtime records.',
  },
  {
    key: 'user-profile',
    category: 'content-entity',
    ownerPackage: '@electrocraft/auth-core',
    storageAuthority: 'content-storage',
    serializerOwner: CONTENT_SERIALIZER,
    migrationOwner: CONTENT_MIGRATION,
    exportAccess: 'resolver',
    versioningAuthority: 'content-schema',
    canonicalShape: 'user/profile record',
    notes: 'User/profile data is runtime/auth content; roles/policies are project definitions but user rows are not.',
  },
  {
    key: 'audit-event',
    category: 'content-entity',
    ownerPackage: '@electrocraft/application',
    storageAuthority: 'content-storage',
    serializerOwner: CONTENT_SERIALIZER,
    migrationOwner: CONTENT_MIGRATION,
    exportAccess: 'none',
    versioningAuthority: 'content-schema',
    canonicalShape: 'audit event record',
    notes: 'Operational audit history stays in runtime storage and never enters ProjectDefinition or ExportIR snapshots.',
  },
];

export const ELECTROCRAFT_MODEL_OWNERSHIP_CATALOG = Object.freeze(
  electroCraftModelOwnershipCatalogSchema.parse(catalogInput),
);

const catalogByKey = new Map(ELECTROCRAFT_MODEL_OWNERSHIP_CATALOG.map((descriptor) => [descriptor.key, descriptor]));

export function getElectroCraftModelOwnership(
  key: ElectroCraftModelOwnershipKey,
): ElectroCraftModelOwnershipDescriptor {
  const descriptor = catalogByKey.get(key);
  if (!descriptor) throw new TypeError(`unknown ElectroCraft model ownership key: ${key}`);
  return descriptor;
}

export function listElectroCraftModelOwnershipByCategory(
  category: ElectroCraftModelOwnershipCategory,
): ElectroCraftModelOwnershipDescriptor[] {
  return ELECTROCRAFT_MODEL_OWNERSHIP_CATALOG.filter((descriptor) => descriptor.category === category);
}

export const electroCraftOwnershipBoundaryDiagnosticSchema = z.strictObject({
  code: z.enum(['CORE_REGISTRY_EMBEDDED', 'CONTENT_ENTITY_EMBEDDED']),
  path: z.array(z.union([z.string(), z.number()])),
  cause: z.string().trim().min(1).max(500),
  repair: z.string().trim().min(1).max(500),
});
export type ElectroCraftOwnershipBoundaryDiagnostic = z.infer<typeof electroCraftOwnershipBoundaryDiagnosticSchema>;

const forbiddenProjectRegistryKeys = new Set([
  'componentregistry',
  'componentdefinitions',
  'fieldtyperegistry',
  'fieldtypes',
  'actionnoderegistry',
  'actionnodes',
  'providerregistry',
  'providers',
  'platformcapabilityregistry',
  'platformcapabilities',
  'blueprintcatalog',
]);

const forbiddenProjectContentKeys = new Set([
  'records',
  'contentrecords',
  'terms',
  'relationedges',
  'mediarecords',
  'mediametadatarecords',
  'users',
  'userprofiles',
  'auditevents',
]);

function normalizeOwnershipKey(key: string): string {
  return key.replace(/[-_.\s]/g, '').toLowerCase();
}

function scanOwnershipBoundary(
  value: unknown,
  diagnostics: ElectroCraftOwnershipBoundaryDiagnostic[],
  path: Array<string | number> = [],
): void {
  if (Array.isArray(value)) {
    value.forEach((child, index) => scanOwnershipBoundary(child, diagnostics, [...path, index]));
    return;
  }
  if (value === null || typeof value !== 'object') return;

  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    const normalized = normalizeOwnershipKey(key);
    if (forbiddenProjectRegistryKeys.has(normalized)) {
      diagnostics.push({
        code: 'CORE_REGISTRY_EMBEDDED',
        path: [...path, key],
        cause: `Application registry ${key} cannot be embedded in canonical project data.`,
        repair: 'Persist only stable registry definition refs/allowed user definitions; resolve core registries from application ownership.',
      });
      continue;
    }
    if (forbiddenProjectContentKeys.has(normalized)) {
      diagnostics.push({
        code: 'CONTENT_ENTITY_EMBEDDED',
        path: [...path, key],
        cause: `Runtime/content collection ${key} cannot be embedded in canonical project configuration.`,
        repair: 'Store content in its content authority and reference it by IDs, resolver, or the allowed export manifest.',
      });
      continue;
    }
    scanOwnershipBoundary(child, diagnostics, [...path, key]);
  }
}

export function validateElectroCraftProjectOwnershipBoundary(
  input: unknown,
): ElectroCraftOwnershipBoundaryDiagnostic[] {
  const diagnostics: ElectroCraftOwnershipBoundaryDiagnostic[] = [];
  scanOwnershipBoundary(input, diagnostics);
  return diagnostics.map((diagnostic) => electroCraftOwnershipBoundaryDiagnosticSchema.parse(diagnostic));
}
