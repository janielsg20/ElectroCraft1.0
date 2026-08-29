import {
  createDeterministicObjectId,
  electroCraftNavigationDefinitionV2Schema,
  type ElectroCraftDocument,
  type ElectroCraftRouteDefinition,
} from '@electrocraft/domain';

export function createNavigationForScreenRoute(input: {
  readonly screen: ElectroCraftDocument;
  readonly route: ElectroCraftRouteDefinition;
  readonly idSeed: string;
}) {
  if (input.screen.kind !== 'screen') throw new TypeError('Navigation requiere un documento kind=screen.');
  if (input.route.screenRef !== input.screen.id) throw new TypeError('La Ruta no pertenece a la Pantalla indicada.');
  const rootNodeRef = createDeterministicObjectId('nav-node', `${input.idSeed}:root`);
  const screenNodeRef = createDeterministicObjectId('nav-node', `${input.idSeed}:screen:${input.route.id}`);
  return electroCraftNavigationDefinitionV2Schema.parse({
    schemaVersion: 2,
    id: createDeterministicObjectId('navigation', `${input.idSeed}:navigation`),
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
        label: input.screen.name,
        routeRef: input.route.id,
        metadata: {},
      },
    ],
    metadata: { source: 'm07.2-screen-crud' },
  });
}
