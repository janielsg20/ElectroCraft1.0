import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  canonicalActionGraphRoundTrip,
  canonicalNavigationDefinitionRoundTrip,
  canonicalPermissionPolicyRoundTrip,
  canonicalRoleRoundTrip,
  canonicalRouteDefinitionRoundTrip,
  canonicalStateDefinitionRoundTrip,
  electroCraftActionGraphSchema,
  electroCraftNavigationDefinitionSchema,
  electroCraftPermissionPolicySchema,
  electroCraftRoleSchema,
  electroCraftRouteDefinitionSchema,
  electroCraftStateDefinitionSchema,
} from '@electrocraft/domain';

function fixture(name: string): unknown {
  return JSON.parse(readFileSync(resolve(`tooling/fixtures/canonical-model/${name}.json`), 'utf8')) as unknown;
}

describe('M02.4 canonical action/state/navigation/permission contracts', () => {
  it('round-trips every new persisted contract as plain canonical data', () => {
    const action = electroCraftActionGraphSchema.parse(fixture('action-graph-v1'));
    const state = electroCraftStateDefinitionSchema.parse(fixture('state-v1'));
    const route = electroCraftRouteDefinitionSchema.parse(fixture('route-v1'));
    const navigation = electroCraftNavigationDefinitionSchema.parse(fixture('navigation-v1'));
    const role = electroCraftRoleSchema.parse(fixture('role-v1'));
    const policy = electroCraftPermissionPolicySchema.parse(fixture('permission-policy-v1'));

    expect(canonicalActionGraphRoundTrip(action)).toEqual(action);
    expect(canonicalStateDefinitionRoundTrip(state)).toEqual(state);
    expect(canonicalRouteDefinitionRoundTrip(route)).toEqual(route);
    expect(canonicalNavigationDefinitionRoundTrip(navigation)).toEqual(navigation);
    expect(canonicalRoleRoundTrip(role)).toEqual(role);
    expect(canonicalPermissionPolicyRoundTrip(policy)).toEqual(policy);
  });

  it('fails closed when an ActionGraph edge points outside its node set', () => {
    const graph = electroCraftActionGraphSchema.parse(fixture('action-graph-v1'));
    const invalid = {
      ...graph,
      edges: [
        {
          ...graph.edges[0],
          targetNodeRef: 'ec_action-node_000000000000z',
        },
      ],
    };
    expect(electroCraftActionGraphSchema.safeParse(invalid).success).toBe(false);
  });

  it('enforces StateDefinition value type, sensitivity and persistence boundaries', () => {
    const state = electroCraftStateDefinitionSchema.parse(fixture('state-v1'));
    expect(electroCraftStateDefinitionSchema.safeParse({ ...state, defaultValue: 'zero' }).success).toBe(false);
    expect(
      electroCraftStateDefinitionSchema.safeParse({ ...state, sensitive: true, persistence: 'local' }).success,
    ).toBe(false);
    expect(
      electroCraftStateDefinitionSchema.safeParse({ ...state, scope: 'component', persistence: 'session' }).success,
    ).toBe(false);
  });

  it('keeps RouteDefinition portable and rejects non-canonical route paths', () => {
    const route = electroCraftRouteDefinitionSchema.parse(fixture('route-v1'));
    expect(electroCraftRouteDefinitionSchema.safeParse({ ...route, path: 'inicio' }).success).toBe(false);
    expect(
      electroCraftRouteDefinitionSchema.safeParse({ ...route, reactRouterObject: { index: true } }).success,
    ).toBe(false);
  });

  it('rejects duplicate navigation item IDs across a nested tree', () => {
    const navigation = electroCraftNavigationDefinitionSchema.parse(fixture('navigation-v1'));
    const item = navigation.items[0];
    const invalid = {
      ...navigation,
      items: [{ ...item, children: [{ ...item, children: [] }] }],
    };
    expect(electroCraftNavigationDefinitionSchema.safeParse(invalid).success).toBe(false);
  });

  it('requires fieldRef only for field-scoped permission targets', () => {
    const policy = electroCraftPermissionPolicySchema.parse(fixture('permission-policy-v1'));
    const invalid = {
      ...policy,
      targets: [{ kind: 'route' as const, resourceRef: policy.targets[0].resourceRef, fieldRef: 'ec_field_000000000000c' }],
    };
    expect(electroCraftPermissionPolicySchema.safeParse(invalid).success).toBe(false);
  });
});
