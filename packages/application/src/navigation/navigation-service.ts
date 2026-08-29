import {
  createDeterministicObjectId,
  electroCraftDocumentSchema,
  electroCraftNavigationDefinitionV2Schema,
  electroCraftRouteDefinitionV2Schema,
  importElectroCraftDocument,
  importElectroCraftNavigationDefinition,
  importElectroCraftRouteDefinition,
  validateElectroCraftNavigationGraph,
  type ElectroCraftDocument,
  type ElectroCraftNavigationDefinition,
  type ElectroCraftNavigationDiagnostic,
  type ElectroCraftRouteDefinition,
  type JsonValue,
} from '@electrocraft/domain';

export interface NavigationWorkspaceGraph {
  readonly documents: readonly ElectroCraftDocument[];
  readonly routes: readonly ElectroCraftRouteDefinition[];
  readonly navigations: readonly ElectroCraftNavigationDefinition[];
  readonly diagnostics: readonly ElectroCraftNavigationDiagnostic[];
  readonly migratedRouteIds: readonly string[];
  readonly migratedNavigationIds: readonly string[];
}

export function parseNavigationWorkspaceGraph(input: {
  readonly documents: readonly unknown[];
  readonly routes: readonly unknown[];
  readonly navigations: readonly unknown[];
}): NavigationWorkspaceGraph {
  const documents = input.documents.map((value) => importElectroCraftDocument(value).document);
  const routeImports = input.routes.map(importElectroCraftRouteDefinition);
  const navigationImports = input.navigations.map(importElectroCraftNavigationDefinition);
  const routes = routeImports.map(({ route }) => route);
  const navigations = navigationImports.map(({ navigation }) => navigation);
  const diagnostics = validateElectroCraftNavigationGraph({ documents, routes, navigations });

  return Object.freeze({
    documents: Object.freeze(documents),
    routes: Object.freeze(routes),
    navigations: Object.freeze(navigations),
    diagnostics: Object.freeze(diagnostics),
    migratedRouteIds: Object.freeze(
      routeImports.filter(({ migratedFrom }) => migratedFrom !== null).map(({ route }) => route.id),
    ),
    migratedNavigationIds: Object.freeze(
      navigationImports.filter(({ migratedFrom }) => migratedFrom !== null).map(({ navigation }) => navigation.id),
    ),
  });
}

export function createInitialNavigationGraph(screenInput: unknown) {
  const screen = importElectroCraftDocument(screenInput).document;
  if (screen.kind !== 'screen') throw new TypeError('La navegación inicial requiere un documento kind=screen.');

  const route = electroCraftRouteDefinitionV2Schema.parse({
    schemaVersion: 2,
    id: createDeterministicObjectId('route', `${screen.id}:initial-route`),
    version: 1,
    key: 'inicio',
    name: 'Inicio',
    path: '/',
    screenRef: screen.id,
    parentRouteRef: null,
    params: [],
    guards: [],
    deepLink: { enabled: true, aliases: [], metadata: {} },
    actionRefs: [],
    stateRefs: [],
    metadata: { source: 'm07.1-initial-navigation' },
  });

  const rootNodeRef = createDeterministicObjectId('nav-node', `${screen.id}:initial-root`);
  const screenNodeRef = createDeterministicObjectId('nav-node', `${screen.id}:initial-screen`);
  const navigation = electroCraftNavigationDefinitionV2Schema.parse({
    schemaVersion: 2,
    id: createDeterministicObjectId('navigation', `${screen.id}:initial-navigation`),
    version: 1,
    key: 'mainNavigation',
    label: 'Navegación principal',
    rootNodeRef,
    nodes: [
      {
        id: rootNodeRef,
        kind: 'stack',
        label: 'Principal',
        childRefs: [screenNodeRef],
        initialNodeRef: screenNodeRef,
        metadata: {},
      },
      {
        id: screenNodeRef,
        kind: 'screen',
        label: screen.name,
        routeRef: route.id,
        metadata: {},
      },
    ],
    metadata: { source: 'm07.1-initial-navigation' },
  });

  return Object.freeze({ screen, route, navigation });
}

export function renameScreenPreservingNavigationRefs(
  screenInput: unknown,
  nameInput: string,
  routes: readonly ElectroCraftRouteDefinition[],
): ElectroCraftDocument {
  const screen = importElectroCraftDocument(screenInput).document;
  if (screen.kind !== 'screen') throw new TypeError('Solo una pantalla puede renombrarse desde este caso de uso.');
  const name = nameInput.trim();
  if (!name) throw new TypeError('El nombre de la pantalla no puede estar vacío.');

  const renamed = electroCraftDocumentSchema.parse({ ...screen, version: screen.version + 1, name });
  for (const route of routes) {
    if (route.screenRef === screen.id && route.screenRef !== renamed.id) {
      throw new TypeError('La referencia estable de la ruta cambió durante el renombrado.');
    }
  }
  return renamed;
}

export function assertNavigationGraphIntegrity(graph: NavigationWorkspaceGraph): NavigationWorkspaceGraph {
  if (graph.diagnostics.length === 0) return graph;
  const summary = graph.diagnostics.map(({ code, ref }) => `${code}${ref ? `:${ref}` : ''}`).join(', ');
  throw new TypeError(`Navigation Graph inválido: ${summary}`);
}

export interface ElectroCraftNavigationCompilerSource {
  readonly schemaVersion: 1;
  readonly routes: readonly ElectroCraftRouteDefinition[];
  readonly navigations: readonly ElectroCraftNavigationDefinition[];
}

/**
 * Boundary portable entregado a futuros compilers. No contiene objetos de
 * React Router, Expo Router, URLPattern ni rutas de archivo de plataforma.
 */
export function createNavigationCompilerSource(graph: NavigationWorkspaceGraph): ElectroCraftNavigationCompilerSource {
  assertNavigationGraphIntegrity(graph);
  return Object.freeze({
    schemaVersion: 1,
    routes: Object.freeze(graph.routes.map((route) => structuredClone(route))),
    navigations: Object.freeze(graph.navigations.map((navigation) => structuredClone(navigation))),
  });
}

export interface NavigationStoredObjectInput {
  readonly objectId: string;
  readonly kind: 'route' | 'navigation';
  readonly schemaVersion: 2;
  readonly payload: JsonValue;
}

export function navigationGraphStoredObjects(input: {
  readonly routes?: readonly ElectroCraftRouteDefinition[];
  readonly navigations?: readonly ElectroCraftNavigationDefinition[];
}): readonly NavigationStoredObjectInput[] {
  return Object.freeze([
    ...(input.routes ?? []).map((route) =>
      Object.freeze({
        objectId: route.id,
        kind: 'route' as const,
        schemaVersion: 2 as const,
        payload: structuredClone(route) as unknown as JsonValue,
      }),
    ),
    ...(input.navigations ?? []).map((navigation) =>
      Object.freeze({
        objectId: navigation.id,
        kind: 'navigation' as const,
        schemaVersion: 2 as const,
        payload: structuredClone(navigation) as unknown as JsonValue,
      }),
    ),
  ]);
}
