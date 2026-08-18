import {
  electroCraftPermissionPolicySchema,
  electroCraftRoleSchema,
  type ElectroCraftObjectId,
  type ElectroCraftPermissionPolicy,
  type ElectroCraftRole,
} from '@electrocraft/domain';
import { packageDescriptor as dep0 } from '@electrocraft/domain';
import { packageDescriptor as dep1 } from '@electrocraft/application';

type PermissionCapability = ElectroCraftPermissionPolicy['capabilities'][number];
type PermissionTarget = ElectroCraftPermissionPolicy['targets'][number];

export interface PermissionEvaluationRequest {
  roleRefs: readonly ElectroCraftObjectId[];
  capability: PermissionCapability;
  target: PermissionTarget;
}

export interface PermissionEvaluationResult {
  allowed: boolean;
  matchedPolicyRefs: ElectroCraftObjectId[];
  deniedBy: ElectroCraftObjectId[];
}

function targetMatches(policyTarget: PermissionTarget, requestedTarget: PermissionTarget): boolean {
  if (policyTarget.kind !== requestedTarget.kind) return false;
  if (policyTarget.resourceRef !== null && policyTarget.resourceRef !== requestedTarget.resourceRef) return false;
  if (policyTarget.fieldRef !== null && policyTarget.fieldRef !== requestedTarget.fieldRef) return false;
  return true;
}

export function evaluatePermission(
  request: PermissionEvaluationRequest,
  roleInputs: readonly unknown[],
  policyInputs: readonly unknown[],
): PermissionEvaluationResult {
  const roles: ElectroCraftRole[] = roleInputs.map((role) => electroCraftRoleSchema.parse(role));
  const policies: ElectroCraftPermissionPolicy[] = policyInputs.map((policy) =>
    electroCraftPermissionPolicySchema.parse(policy),
  );
  const requestedRoles = new Set(request.roleRefs);
  const activePolicyRefs = new Set<ElectroCraftObjectId>();

  for (const role of roles) {
    if (!requestedRoles.has(role.id)) continue;
    for (const ref of role.permissionPolicyRefs) activePolicyRefs.add(ref);
  }

  const matched = policies.filter(
    (policy) =>
      activePolicyRefs.has(policy.id) &&
      policy.capabilities.includes(request.capability) &&
      policy.targets.some((target) => targetMatches(target, request.target)),
  );
  const deniedBy = matched.filter(({ effect }) => effect === 'deny').map(({ id }) => id);

  return {
    allowed: deniedBy.length === 0 && matched.some(({ effect }) => effect === 'allow'),
    matchedPolicyRefs: matched.map(({ id }) => id),
    deniedBy,
  };
}

export const packageDescriptor = Object.freeze({
  name: '@electrocraft/auth-core',
  responsibility: 'contratos de autenticación y permisos',
  dependencies: [dep0.name, dep1.name] as const,
});

export type AuthCorePackageDescriptor = typeof packageDescriptor;
