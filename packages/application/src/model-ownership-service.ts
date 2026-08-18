import {
  ELECTROCRAFT_MODEL_OWNERSHIP_CATALOG,
  electroCraftProjectDefinitionSchema,
  listElectroCraftModelOwnershipByCategory,
  validateElectroCraftProjectOwnershipBoundary,
  type ElectroCraftModelOwnershipCategory,
  type ElectroCraftModelOwnershipDescriptor,
  type ElectroCraftOwnershipBoundaryDiagnostic,
} from '@electrocraft/domain';
import { validateProjectRegistryDefinitions } from './ownership-registry-service';

export interface ElectroCraftModelOwnershipReport {
  status: 'ready' | 'blocked';
  descriptors: ElectroCraftModelOwnershipDescriptor[];
  counts: Record<ElectroCraftModelOwnershipCategory, number>;
  diagnostics: Array<
    | ElectroCraftOwnershipBoundaryDiagnostic
    | {
        code: 'INVALID_PROJECT' | 'INVALID_USER_REGISTRY_DEFINITION';
        path: Array<string | number>;
        cause: string;
        repair: string;
      }
  >;
}

export function createElectroCraftModelOwnershipReport(
  projectInput: unknown,
  projectRegistryDefinitionInputs: readonly unknown[] = [],
): ElectroCraftModelOwnershipReport {
  const boundaryDiagnostics = validateElectroCraftProjectOwnershipBoundary(projectInput);
  const counts = {
    'project-object': listElectroCraftModelOwnershipByCategory('project-object').length,
    'registry-definition': listElectroCraftModelOwnershipByCategory('registry-definition').length,
    'content-entity': listElectroCraftModelOwnershipByCategory('content-entity').length,
  } as const;

  const projectResult = electroCraftProjectDefinitionSchema.safeParse(projectInput);
  if (!projectResult.success) {
    return {
      status: 'blocked',
      descriptors: [...ELECTROCRAFT_MODEL_OWNERSHIP_CATALOG],
      counts,
      diagnostics: [
        ...boundaryDiagnostics,
        {
          code: 'INVALID_PROJECT',
          path: projectResult.error.issues[0]?.path.filter(
            (part): part is string | number => typeof part === 'string' || typeof part === 'number',
          ) ?? [],
          cause: projectResult.error.issues[0]?.message ?? 'ProjectDefinition schema validation failed.',
          repair: 'Repair the canonical ProjectDefinition before applying ownership classification.',
        },
      ],
    };
  }

  const registryDiagnostics = validateProjectRegistryDefinitions(projectResult.data, projectRegistryDefinitionInputs).map(
    (diagnostic) => ({
      code: 'INVALID_USER_REGISTRY_DEFINITION' as const,
      path: ['userRegistryDefinitionRefs', diagnostic.ref],
      cause:
        diagnostic.code === 'missing-user-definition-ref'
          ? `Referenced user registry definition ${diagnostic.ref} is missing.`
          : `Registry definition ${diagnostic.ref} is not user-owned and cannot be persisted with the project.`,
      repair:
        diagnostic.code === 'missing-user-definition-ref'
          ? 'Supply the referenced user-origin definition or remove the stale ref.'
          : 'Keep core/extension definitions in application registries and persist only user-origin definitions by stable ref.',
    }),
  );

  const diagnostics = [...boundaryDiagnostics, ...registryDiagnostics];
  return {
    status: diagnostics.length === 0 ? 'ready' : 'blocked',
    descriptors: [...ELECTROCRAFT_MODEL_OWNERSHIP_CATALOG],
    counts,
    diagnostics,
  };
}
