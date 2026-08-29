import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  createNavigationCompilerSource,
  parseNavigationWorkspaceGraph,
  renameScreenPreservingNavigationRefs,
} from '@electrocraft/application';
import {
  canonicalNavigationDefinitionRoundTrip,
  canonicalRouteDefinitionRoundTrip,
  deserializeElectroCraftNavigationDefinitionWithMigration,
  deserializeElectroCraftRouteDefinitionWithMigration,
  electroCraftDocumentSchema,
  electroCraftNavigationDefinitionSchema,
  electroCraftRouteDefinitionSchema,
  importElectroCraftNavigationDefinition,
  importElectroCraftRouteDefinition,
  serializeElectroCraftNavigationDefinition,
  serializeElectroCraftRouteDefinition,
  validateElectroCraftNavigationGraph,
} from '@electrocraft/domain';

function fixture(name: string): unknown {
  return JSON.parse(readFileSync(resolve(`tooling/fixtures/canonical-model/${name}.json`), 'utf8')) as unknown;
}

describe('M07.1 screen, route and Navigation Graph model', () => {
  it('round-trips Route v2 params/guards/deep links and Navigation Graph v2 without target-specific router objects', () => {
    const screen = electroCraftDocumentSchema.parse(fixture('screen-v4'));
    const route = electroCraftRouteDefinitionSchema.parse(fixture('route-v2'));
    const navigation = electroCraftNavigationDefinitionSchema.parse(fixture('navigation-v2'));
    const graph = parseNavigationWorkspaceGraph({ documents: [screen], routes: [route], navigations: [navigation] });

    expect(graph.diagnostics).toEqual([]);
    expect(route.params).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'productId', source: 'path', valueType: 'string', required: true }),
        expect.objectContaining({ name: 'preview', source: 'query', valueType: 'boolean', defaultValue: false }),
      ]),
    );
    expect(route.guards[0]).toMatchObject({ kind: 'permission', policyRef: 'ec_policy_000000000000k' });
    expect(route.deepLink).toMatchObject({ enabled: true, aliases: ['/p/:productId'] });
    expect(canonicalRouteDefinitionRoundTrip(route)).toEqual(route);
    expect(canonicalNavigationDefinitionRoundTrip(navigation)).toEqual(navigation);

    const compilerSource = createNavigationCompilerSource(graph);
    expect(compilerSource.routes[0]?.schemaVersion).toBe(2);
    expect(compilerSource.navigations[0]?.nodes.map(({ kind }) => kind)).toEqual(['stack', 'screen']);
    expect(JSON.stringify(compilerSource)).not.toMatch(/reactRouter|expoRouter|URLPattern/);
  });

  it('migrates persisted Route/Navigation v1 into v2 and serializes only the current model', () => {
    const routeImport = importElectroCraftRouteDefinition(fixture('route-v1'));
    const navigationImport = importElectroCraftNavigationDefinition(fixture('navigation-v1'));

    expect(routeImport).toMatchObject({ migratedFrom: 1, route: { schemaVersion: 2, name: 'inicio' } });
    expect(routeImport.route.guards).toHaveLength(1);
    expect(routeImport.route.guards[0]).toMatchObject({
      kind: 'permission',
      policyRef: 'ec_policy_000000000000k',
    });
    expect(navigationImport.migratedFrom).toBe(1);
    expect(navigationImport.navigation.schemaVersion).toBe(2);
    expect(navigationImport.navigation.nodes.some(({ kind }) => kind === 'stack')).toBe(true);
    expect(navigationImport.navigation.nodes.some(({ kind }) => kind === 'screen')).toBe(true);

    const serializedRoute = serializeElectroCraftRouteDefinition(routeImport.route);
    const serializedNavigation = serializeElectroCraftNavigationDefinition(navigationImport.navigation);
    expect(JSON.parse(serializedRoute)).toMatchObject({ schemaVersion: 2 });
    expect(JSON.parse(serializedNavigation)).toMatchObject({ schemaVersion: 2 });
    expect(deserializeElectroCraftRouteDefinitionWithMigration(serializedRoute).migratedFrom).toBeNull();
    expect(deserializeElectroCraftNavigationDefinitionWithMigration(serializedNavigation).migratedFrom).toBeNull();
  });

  it('rejects invalid initial navigation and diagnoses cycles, duplicate paths and missing screens', () => {
    const screen = electroCraftDocumentSchema.parse(fixture('screen-v4'));
    const route = electroCraftRouteDefinitionSchema.parse(fixture('route-v2'));
    const navigation = electroCraftNavigationDefinitionSchema.parse(fixture('navigation-v2'));
    const root = navigation.nodes.find(({ id }) => id === navigation.rootNodeRef);
    if (!root || root.kind === 'screen') throw new Error('fixture root must be a navigator');

    expect(
      electroCraftNavigationDefinitionSchema.safeParse({
        ...navigation,
        nodes: navigation.nodes.map((node) =>
          node.id === root.id ? { ...node, initialNodeRef: 'ec_nav-node_000000000000z' } : node,
        ),
      }).success,
    ).toBe(false);

    const cyclicNavigation = electroCraftNavigationDefinitionSchema.parse({
      ...navigation,
      nodes: navigation.nodes.map((node) =>
        node.id === root.id ? { ...node, childRefs: [root.id], initialNodeRef: root.id } : node,
      ),
    });
    const duplicateRoute = electroCraftRouteDefinitionSchema.parse({
      ...route,
      id: 'ec_route_0000000000006',
      key: 'productoDuplicado',
      name: 'Producto duplicado',
    });
    const missingScreenRoute = electroCraftRouteDefinitionSchema.parse({
      ...route,
      id: 'ec_route_0000000000007',
      key: 'productoFaltante',
      name: 'Producto faltante',
      path: '/faltante/:productId',
      screenRef: 'ec_document_000000000000z',
    });

    const diagnostics = validateElectroCraftNavigationGraph({
      documents: [screen],
      routes: [route, duplicateRoute, missingScreenRoute],
      navigations: [cyclicNavigation],
    });
    const codes = diagnostics.map(({ code }) => code);
    expect(codes).toContain('navigation-cycle');
    expect(codes).toContain('duplicate-route-path');
    expect(codes).toContain('missing-screen-ref');
  });

  it('keeps route references stable when a screen is renamed', () => {
    const screen = electroCraftDocumentSchema.parse(fixture('screen-v4'));
    const route = electroCraftRouteDefinitionSchema.parse(fixture('route-v2'));
    const renamed = renameScreenPreservingNavigationRefs(screen, 'Detalle de producto', [route]);

    expect(renamed.id).toBe(screen.id);
    expect(renamed.name).toBe('Detalle de producto');
    expect(renamed.version).toBe(screen.version + 1);
    expect(route.screenRef).toBe(renamed.id);
  });
});
