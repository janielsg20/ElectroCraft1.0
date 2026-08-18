import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  electroCraftActionGraphSchema,
  electroCraftDocumentSchema,
  electroCraftNavigationDefinitionSchema,
  electroCraftObjectIdSchema,
  electroCraftPermissionPolicySchema,
  electroCraftRoleSchema,
  electroCraftRouteDefinitionSchema,
  electroCraftStateDefinitionSchema,
} from '@electrocraft/domain';
import { parseAppBehaviorGraph, validateAppBehaviorGraph } from '@electrocraft/application';
import { evaluatePermission } from '@electrocraft/auth-core';
import { createElectroCraftStateRuntime } from '@electrocraft/state-zustand';
import { createReteActionGraphRuntime, snapshotCanonicalActionGraph } from '@electrocraft/workflow-rete';

function fixture(name: string): unknown {
  return JSON.parse(readFileSync(resolve(`tooling/fixtures/canonical-model/${name}.json`), 'utf8')) as unknown;
}

describe('M02.4 runtime adapters and reference integration', () => {
  it('maps canonical ActionGraph into a real Rete NodeEditor without changing persistence shape', async () => {
    const graph = electroCraftActionGraphSchema.parse(fixture('action-graph-v1'));
    const runtime = await createReteActionGraphRuntime(graph);

    expect(runtime.editor.getNodes()).toHaveLength(graph.nodes.length);
    expect(runtime.editor.getConnections()).toHaveLength(graph.edges.length);
    expect(snapshotCanonicalActionGraph(runtime)).toEqual(graph);
    expect(JSON.stringify(graph)).not.toContain('NodeEditor');
  });

  it('uses a real Zustand vanilla store while respecting state scope/persistence rules', () => {
    const state = electroCraftStateDefinitionSchema.parse(fixture('state-v1'));
    const runtime = createElectroCraftStateRuntime([state]);

    expect(runtime.get(state.id)).toBe(0);
    runtime.set(state.id, 3);
    expect(runtime.get(state.id)).toBe(3);
    expect(runtime.getPersistableSnapshot('session')).toEqual({ [state.id]: 3 });

    runtime.reset();
    expect(runtime.get(state.id)).toBe(0);
    runtime.hydrate('session', { [state.id]: 7 });
    expect(runtime.get(state.id)).toBe(7);
    expect(() => runtime.set(state.id, 'invalid')).toThrow(/state value/);
  });

  it('validates stable refs and evaluates canonical permission policies fail-closed', () => {
    const screen = electroCraftDocumentSchema.parse(fixture('screen-v3'));
    const route = electroCraftRouteDefinitionSchema.parse(fixture('route-v1'));
    const navigation = electroCraftNavigationDefinitionSchema.parse(fixture('navigation-v1'));
    const action = electroCraftActionGraphSchema.parse(fixture('action-graph-v1'));
    const state = electroCraftStateDefinitionSchema.parse(fixture('state-v1'));
    const policy = electroCraftPermissionPolicySchema.parse(fixture('permission-policy-v1'));
    const role = electroCraftRoleSchema.parse(fixture('role-v1'));

    const graph = parseAppBehaviorGraph({
      documents: [screen],
      routes: [route],
      navigations: [navigation],
      actionGraphs: [action],
      states: [state],
      policies: [policy],
      roles: [role],
    });
    expect(validateAppBehaviorGraph(graph)).toEqual([]);

    const allowed = evaluatePermission(
      {
        roleRefs: [role.id],
        capability: 'navigate',
        target: { kind: 'route', resourceRef: route.id, fieldRef: null },
      },
      [role],
      [policy],
    );
    expect(allowed.allowed).toBe(true);

    const unknownRole = evaluatePermission(
      {
        roleRefs: [electroCraftObjectIdSchema.parse('ec_role_000000000000z')],
        capability: 'navigate',
        target: { kind: 'route', resourceRef: route.id, fieldRef: null },
      },
      [role],
      [policy],
    );
    expect(unknownRole.allowed).toBe(false);
  });
});
