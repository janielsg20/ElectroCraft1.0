import { describe, expect, it } from 'vitest';
import {
  addNavigationNavigator,
  addScreenRouteToNavigation,
  analyzeScreenDelete,
  applyRouteAccessConfig,
  attachActionGraphToRoute,
  collectNavigationCompilerDiagnostics,
  createNavigationCompilerSource,
  createNavigationForScreenRoute,
  createNavigationPreviewRows,
  createRouteForScreen,
  createRouteNavigateActionGraph,
  createScreenDocument,
  evaluateRouteAccessPreview,
  parseNavigationWorkspaceGraph,
  validateNavigateActionConfig,
} from '@electrocraft/application';
import {
  createDeterministicObjectId,
  electroCraftNavigateActionConfigSchema,
  electroCraftRouteDefinitionV2Schema,
} from '@electrocraft/domain';

describe('M07.8 Navigation E2E flow', () => {
  it('creates four screens and runs one canonical Stack + Tabs + Modal flow end to end', () => {
    const home = createScreenDocument({ name: 'Inicio', idSeed: 'm07.8-home' });
    const catalog = createScreenDocument({ name: 'Productos', idSeed: 'm07.8-catalog' });
    const detail = createScreenDocument({ name: 'Detalle', idSeed: 'm07.8-detail' });
    const login = createScreenDocument({ name: 'Iniciar sesión', idSeed: 'm07.8-login' });

    const homeRoute = createRouteForScreen({ screen: home, path: '/', idSeed: 'm07.8-home-route' });
    const catalogRoute = createRouteForScreen({
      screen: catalog,
      path: '/productos',
      idSeed: 'm07.8-catalog-route',
    });
    const detailRouteSeed = createRouteForScreen({
      screen: detail,
      path: '/detalle',
      idSeed: 'm07.8-detail-route',
    });
    const detailRoute = electroCraftRouteDefinitionV2Schema.parse({
      ...detailRouteSeed,
      path: '/productos/:productId',
      params: [
        {
          name: 'productId',
          source: 'path',
          valueType: 'string',
          required: true,
          defaultValue: null,
        },
        {
          name: 'preview',
          source: 'query',
          valueType: 'boolean',
          required: false,
          defaultValue: false,
        },
      ],
      deepLink: { enabled: true, aliases: ['/p/:productId'], metadata: {} },
    });
    const loginRoute = createRouteForScreen({ screen: login, path: '/login', idSeed: 'm07.8-login-route' });

    let navigation = createNavigationForScreenRoute({ screen: home, route: homeRoute, idSeed: 'm07.8-navigation' });
    navigation = addNavigationNavigator({
      navigation,
      parentNavigatorRef: navigation.rootNodeRef,
      kind: 'tabs',
      label: 'Principal',
      idSeed: 'm07.8-tabs',
    });
    const tabs = navigation.nodes.find((node) => node.kind === 'tabs' && node.label === 'Principal');
    expect(tabs?.kind).toBe('tabs');
    if (!tabs || tabs.kind === 'screen') throw new Error('Tabs navigator missing from test setup.');

    navigation = addScreenRouteToNavigation({
      navigation,
      route: catalogRoute,
      screenName: catalog.name,
      navigatorRef: tabs.id,
    });
    navigation = addScreenRouteToNavigation({
      navigation,
      route: detailRoute,
      screenName: detail.name,
      navigatorRef: tabs.id,
    });
    navigation = addNavigationNavigator({
      navigation,
      parentNavigatorRef: navigation.rootNodeRef,
      kind: 'modal',
      label: 'Acceso',
      idSeed: 'm07.8-modal',
    });
    const modal = navigation.nodes.find((node) => node.kind === 'modal' && node.label === 'Acceso');
    expect(modal?.kind).toBe('modal');
    if (!modal || modal.kind === 'screen') throw new Error('Modal navigator missing from test setup.');
    navigation = addScreenRouteToNavigation({
      navigation,
      route: loginRoute,
      screenName: login.name,
      navigatorRef: modal.id,
    });

    const navigateConfig = electroCraftNavigateActionConfigSchema.parse({
      schemaVersion: 1,
      action: 'navigate',
      mode: 'push',
      destination: { kind: 'route', routeRef: detailRoute.id },
      params: [
        { param: 'productId', value: { source: 'literal', value: 'sku-42' } },
        { param: 'preview', value: { source: 'literal', value: true } },
      ],
    });
    expect(
      validateNavigateActionConfig({
        config: navigateConfig,
        routes: [homeRoute, catalogRoute, detailRoute, loginRoute],
        documents: [home, catalog, detail, login],
      }),
    ).toEqual([]);

    const navigateGraph = createRouteNavigateActionGraph({
      sourceRoute: catalogRoute,
      config: navigateConfig,
      idSeed: 'm07.8-open-detail',
    });
    const catalogRouteWithAction = attachActionGraphToRoute(catalogRoute, navigateGraph);
    const policyRef = createDeterministicObjectId('policy', 'm07.8-detail-read');
    const guardedDetail = applyRouteAccessConfig({
      route: detailRoute,
      config: {
        schemaVersion: 1,
        mode: 'permission',
        policyRef,
        conditionActionRef: null,
        redirectRouteRef: loginRoute.id,
      },
      routes: [homeRoute, catalogRouteWithAction, detailRoute, loginRoute],
    });

    const graph = parseNavigationWorkspaceGraph({
      documents: [home, catalog, detail, login],
      routes: [homeRoute, catalogRouteWithAction, guardedDetail, loginRoute],
      navigations: [navigation],
    });
    expect(graph.diagnostics).toEqual([]);
    expect(createNavigationPreviewRows(navigation).map(({ kind }) => kind)).toEqual(
      expect.arrayContaining(['stack', 'tabs', 'modal', 'screen']),
    );

    const denied = evaluateRouteAccessPreview(guardedDetail, {
      authenticated: true,
      allowedPolicyRefs: [],
      passedConditionActionRefs: [],
    });
    expect(denied).toMatchObject({ allowed: false, reason: 'permission-denied', redirectRouteRef: loginRoute.id });
    const allowed = evaluateRouteAccessPreview(guardedDetail, {
      authenticated: true,
      allowedPolicyRefs: [policyRef],
      passedConditionActionRefs: [],
    });
    expect(allowed.allowed).toBe(true);

    const deleteAnalysis = analyzeScreenDelete({
      screenId: detail.id,
      documents: [home, catalog, detail, login],
      routes: [homeRoute, catalogRouteWithAction, guardedDetail, loginRoute],
      navigations: [navigation],
      actionGraphs: [navigateGraph],
    });
    expect(deleteAnalysis.allowed).toBe(false);
    expect(deleteAnalysis.usages.map(({ kind }) => kind)).toEqual(
      expect.arrayContaining(['route', 'navigation', 'action']),
    );

    const compilerSource = createNavigationCompilerSource(graph);
    expect(compilerSource.routes).toHaveLength(4);
    expect(collectNavigationCompilerDiagnostics(compilerSource, 'react-router')).toEqual([]);
    expect(collectNavigationCompilerDiagnostics(compilerSource, 'expo-router')).toEqual([]);
  });
});
