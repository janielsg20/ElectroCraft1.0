import {
  collectNavigationRouteRefs,
  createDeterministicObjectId,
  electroCraftDocumentSchema,
  electroCraftNavigationDefinitionV2Schema,
  electroCraftRouteDefinitionV2Schema,
  importElectroCraftDocument,
  importElectroCraftNavigationDefinition,
  importElectroCraftRouteDefinition,
  validateElectroCraftNavigationGraph,
  type ElectroCraftActionGraph,
  type ElectroCraftDocument,
  type ElectroCraftNavigationDefinition,
  type ElectroCraftNavigationDiagnostic,
  type ElectroCraftNavigationNavigatorNode,
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

function canonicalRouteKey(name: string): string {
  const normalized = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);
  if (!normalized) return 'screen';
  return /^[A-Za-z]/.test(normalized) ? normalized : `screen-${normalized}`;
}

export function suggestScreenRoutePath(nameInput: string): string {
  const name = nameInput.trim();
  if (!name) return '/pantalla';
  const slug = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return `/${slug || 'pantalla'}`;
}

export interface CreateScreenInput {
  readonly name: string;
  readonly idSeed: string;
  readonly templateRef?: string | null;
}

export function createScreenDocument(input: CreateScreenInput): ElectroCraftDocument {
  const name = input.name.trim();
  const idSeed = input.idSeed.trim();
  if (!name) throw new TypeError('El nombre de la pantalla no puede estar vacío.');
  if (!idSeed) throw new TypeError('La creación de pantalla requiere un idSeed estable.');

  const id = createDeterministicObjectId('document', `screen:${idSeed}`);
  const rootId = createDeterministicObjectId('node', `${id}:root`);
  return electroCraftDocumentSchema.parse({
    schemaVersion: 4,
    id,
    version: 1,
    name,
    kind: 'screen',
    root: {
      id: rootId,
      componentRef: 'core.root',
      props: { label: name },
      layout: null,
      style: null,
      children: [],
    },
    references: { documentRefs: [] },
    metadata: {
      source: 'm07.2-screen-crud',
      status: 'draft',
      ...(input.templateRef ? { templateRef: input.templateRef } : {}),
    },
    formMeta: null,
    templateMeta: null,
  });
}

export interface CreateScreenRouteInput {
  readonly screen: ElectroCraftDocument;
  readonly path: string;
  readonly idSeed: string;
  readonly name?: string;
}

export function createRouteForScreen(input: CreateScreenRouteInput): ElectroCraftRouteDefinition {
  if (input.screen.kind !== 'screen') throw new TypeError('Solo una pantalla puede recibir una Ruta.');
  const path = input.path.trim();
  const name = (input.name ?? input.screen.name).trim();
  return electroCraftRouteDefinitionV2Schema.parse({
    schemaVersion: 2,
    id: createDeterministicObjectId('route', `${input.screen.id}:${input.idSeed}`),
    version: 1,
    key: canonicalRouteKey(name),
    name,
    path,
    screenRef: input.screen.id,
    parentRouteRef: null,
    params: [],
    guards: [],
    deepLink: { enabled: true, aliases: [], metadata: {} },
    actionRefs: [],
    stateRefs: [],
    metadata: { source: 'm07.2-screen-crud' },
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

export function addScreenRouteToNavigation(input: {
  readonly navigation: ElectroCraftNavigationDefinition;
  readonly route: ElectroCraftRouteDefinition;
  readonly screenName: string;
  readonly navigatorRef?: string | null;
}): ElectroCraftNavigationDefinition {
  const navigation = electroCraftNavigationDefinitionV2Schema.parse(input.navigation);
  const navigatorRef = input.navigatorRef ?? navigation.rootNodeRef;
  const target = navigation.nodes.find(({ id }) => id === navigatorRef);
  if (!target || target.kind === 'screen') {
    throw new TypeError('El Navigator seleccionado no existe o no puede contener pantallas.');
  }
  const nodeId = createDeterministicObjectId('nav-node', `${navigation.id}:${input.route.id}:screen`);
  if (navigation.nodes.some(({ id }) => id === nodeId)) {
    throw new TypeError('La Ruta ya está conectada a este Navigation Graph.');
  }

  const nextTarget: ElectroCraftNavigationNavigatorNode = {
    ...target,
    childRefs: [...target.childRefs, nodeId],
    initialNodeRef: target.initialNodeRef ?? nodeId,
  };
  return electroCraftNavigationDefinitionV2Schema.parse({
    ...navigation,
    version: navigation.version + 1,
    nodes: [
      ...navigation.nodes.map((node) => (node.id === target.id ? nextTarget : node)),
      { id: nodeId, kind: 'screen', label: input.screenName, routeRef: input.route.id, metadata: {} },
    ],
  });
}

function cloneScreenNodeTree(
  node: ElectroCraftDocument['root'],
  documentId: string,
  path: string,
): ElectroCraftDocument['root'] {
  const id = createDeterministicObjectId('node', `${documentId}:${path}:${node.id}`);
  return {
    ...structuredClone(node),
    id,
    children: node.children.map((child, index) => cloneScreenNodeTree(child, documentId, `${path}.${index}`)),
  };
}

export interface DuplicateScreenResult {
  readonly screen: ElectroCraftDocument;
  readonly routeSuggestion: string;
}

export function duplicateScreenDocument(input: {
  readonly source: unknown;
  readonly idSeed: string;
  readonly name?: string;
}): DuplicateScreenResult {
  const source = importElectroCraftDocument(input.source).document;
  if (source.kind !== 'screen') throw new TypeError('Solo se pueden duplicar documentos kind=screen.');
  const name = (input.name ?? `${source.name} copia`).trim();
  const id = createDeterministicObjectId('document', `screen:${input.idSeed}`);
  const screen = electroCraftDocumentSchema.parse({
    ...structuredClone(source),
    id,
    version: 1,
    name,
    root: cloneScreenNodeTree(source.root, id, 'root'),
    metadata: { ...source.metadata, source: 'm07.2-screen-duplicate', status: 'draft' },
  });
  return Object.freeze({ screen, routeSuggestion: suggestScreenRoutePath(name) });
}

export type ScreenDeleteUsageKind = 'route' | 'navigation' | 'action' | 'document';
export interface ScreenDeleteUsage {
  readonly kind: ScreenDeleteUsageKind;
  readonly ownerId: string;
  readonly ref: string;
}

export interface ScreenDeleteAnalysis {
  readonly allowed: boolean;
  readonly usages: readonly ScreenDeleteUsage[];
}

export function analyzeScreenDelete(input: {
  readonly screenId: string;
  readonly documents: readonly ElectroCraftDocument[];
  readonly routes: readonly ElectroCraftRouteDefinition[];
  readonly navigations: readonly ElectroCraftNavigationDefinition[];
  readonly actionGraphs?: readonly ElectroCraftActionGraph[];
}): ScreenDeleteAnalysis {
  const usages: ScreenDeleteUsage[] = [];
  const routeIds = new Set<string>();
  for (const route of input.routes) {
    if (route.screenRef === input.screenId) {
      routeIds.add(route.id);
      usages.push({ kind: 'route', ownerId: route.id, ref: input.screenId });
    }
  }
  for (const navigation of input.navigations) {
    for (const routeRef of collectNavigationRouteRefs(navigation)) {
      if (routeIds.has(routeRef)) usages.push({ kind: 'navigation', ownerId: navigation.id, ref: routeRef });
    }
  }
  for (const graph of input.actionGraphs ?? []) {
    for (const node of graph.nodes) {
      for (const routeRef of node.routeRefs) {
        if (routeIds.has(routeRef)) usages.push({ kind: 'action', ownerId: graph.id, ref: routeRef });
      }
    }
  }
  for (const document of input.documents) {
    if (document.id === input.screenId) continue;
    if (document.references.documentRefs.includes(input.screenId as never)) {
      usages.push({ kind: 'document', ownerId: document.id, ref: input.screenId });
    }
  }
  return Object.freeze({ allowed: usages.length === 0, usages: Object.freeze(usages) });
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
