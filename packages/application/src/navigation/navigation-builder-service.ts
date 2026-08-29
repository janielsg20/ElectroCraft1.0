import {
  createDefaultNavigationBuilderPresentation,
  createDeterministicObjectId,
  electroCraftNavigationBuilderPresentationSchema,
  electroCraftNavigationDefinitionV2Schema,
  navigationBuilderMetadata,
  readNavigationBuilderPresentation,
  type ElectroCraftNavigationBuilderPresentation,
  type ElectroCraftNavigationDefinition,
  type ElectroCraftNavigationNode,
  type ElectroCraftNavigationNavigatorNode,
  type ElectroCraftNavigatorKind,
} from '@electrocraft/domain';

function canonicalNavigation(input: unknown) {
  return electroCraftNavigationDefinitionV2Schema.parse(input);
}

function requireNavigator(navigation: ElectroCraftNavigationDefinition, navigatorRef: string) {
  const node = navigation.nodes.find(({ id }) => id === navigatorRef);
  if (!node || node.kind === 'screen') throw new TypeError('El Navigator seleccionado no existe.');
  return node;
}

function replaceNode(
  navigation: ElectroCraftNavigationDefinition,
  node: ElectroCraftNavigationNode,
): ElectroCraftNavigationDefinition {
  return canonicalNavigation({
    ...navigation,
    version: navigation.version + 1,
    nodes: navigation.nodes.map((current) => (current.id === node.id ? node : current)),
  });
}

export function findNavigationParent(
  navigation: ElectroCraftNavigationDefinition,
  childRef: string,
): ElectroCraftNavigationNavigatorNode | null {
  return (
    navigation.nodes.find(
      (node): node is ElectroCraftNavigationNavigatorNode =>
        node.kind !== 'screen' && node.childRefs.includes(childRef as never),
    ) ?? null
  );
}

export function addNavigationNavigator(input: {
  readonly navigation: ElectroCraftNavigationDefinition;
  readonly parentNavigatorRef: string;
  readonly kind: ElectroCraftNavigatorKind;
  readonly label: string;
  readonly idSeed: string;
}): ElectroCraftNavigationDefinition {
  const navigation = canonicalNavigation(input.navigation);
  const parent = requireNavigator(navigation, input.parentNavigatorRef);
  const label = input.label.trim();
  if (!label) throw new TypeError('El nombre del Navigator no puede estar vacío.');
  const id = createDeterministicObjectId('nav-node', `${navigation.id}:${input.kind}:${input.idSeed}`);
  if (navigation.nodes.some((node) => node.id === id)) throw new TypeError('El Navigator ya existe.');

  const navigator: ElectroCraftNavigationNavigatorNode = {
    id,
    kind: input.kind,
    label,
    childRefs: [],
    initialNodeRef: null,
    metadata: {
      navigationBuilder: createDefaultNavigationBuilderPresentation(input.kind),
    },
  };
  const nextParent: ElectroCraftNavigationNavigatorNode = {
    ...parent,
    childRefs: [...parent.childRefs, id],
    initialNodeRef: parent.initialNodeRef ?? id,
  };

  return canonicalNavigation({
    ...navigation,
    version: navigation.version + 1,
    nodes: [...navigation.nodes.map((node) => (node.id === parent.id ? nextParent : node)), navigator],
  });
}

export function reorderNavigationChild(input: {
  readonly navigation: ElectroCraftNavigationDefinition;
  readonly parentNavigatorRef: string;
  readonly childRef: string;
  readonly direction: 'up' | 'down';
}): ElectroCraftNavigationDefinition {
  const navigation = canonicalNavigation(input.navigation);
  const parent = requireNavigator(navigation, input.parentNavigatorRef);
  const index = parent.childRefs.indexOf(input.childRef as never);
  if (index < 0) throw new TypeError('El nodo no pertenece al Navigator seleccionado.');
  const targetIndex = input.direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= parent.childRefs.length) return navigation;

  const childRefs = [...parent.childRefs];
  [childRefs[index], childRefs[targetIndex]] = [childRefs[targetIndex], childRefs[index]];
  return replaceNode(navigation, { ...parent, childRefs });
}

export function setNavigationInitialChild(input: {
  readonly navigation: ElectroCraftNavigationDefinition;
  readonly navigatorRef: string;
  readonly childRef: string;
}): ElectroCraftNavigationDefinition {
  const navigation = canonicalNavigation(input.navigation);
  const navigator = requireNavigator(navigation, input.navigatorRef);
  if (!navigator.childRefs.includes(input.childRef as never)) {
    throw new TypeError('La Pantalla inicial debe ser hija directa del Navigator.');
  }
  return replaceNode(navigation, { ...navigator, initialNodeRef: input.childRef as never });
}

export function updateNavigationNodeLabel(input: {
  readonly navigation: ElectroCraftNavigationDefinition;
  readonly nodeRef: string;
  readonly label: string;
}): ElectroCraftNavigationDefinition {
  const navigation = canonicalNavigation(input.navigation);
  const node = navigation.nodes.find(({ id }) => id === input.nodeRef);
  if (!node) throw new TypeError('El nodo de Navegación seleccionado no existe.');
  const label = input.label.trim();
  if (!label) throw new TypeError('El nombre del nodo no puede estar vacío.');
  return replaceNode(navigation, { ...node, label });
}

export function updateNavigationNodePresentation(input: {
  readonly navigation: ElectroCraftNavigationDefinition;
  readonly nodeRef: string;
  readonly presentation: ElectroCraftNavigationBuilderPresentation;
}): ElectroCraftNavigationDefinition {
  const navigation = canonicalNavigation(input.navigation);
  const node = navigation.nodes.find(({ id }) => id === input.nodeRef);
  if (!node) throw new TypeError('El nodo de Navegación seleccionado no existe.');
  const presentation = electroCraftNavigationBuilderPresentationSchema.parse(input.presentation);
  return replaceNode(navigation, {
    ...node,
    metadata: navigationBuilderMetadata(node, presentation),
  });
}

export interface NavigationPreviewRow {
  readonly id: string;
  readonly label: string;
  readonly kind: ElectroCraftNavigationNode['kind'];
  readonly depth: number;
  readonly initial: boolean;
  readonly visible: boolean;
}

export function createNavigationPreviewRows(
  navigationInput: ElectroCraftNavigationDefinition,
): readonly NavigationPreviewRow[] {
  const navigation = canonicalNavigation(navigationInput);
  const nodesById = new Map(navigation.nodes.map((node) => [node.id, node] as const));
  const rows: NavigationPreviewRow[] = [];
  const active = new Set<string>();

  const visit = (nodeRef: string, depth: number, initial: boolean) => {
    if (active.has(nodeRef)) return;
    const node = nodesById.get(nodeRef as never);
    if (!node) return;
    active.add(nodeRef);
    rows.push({
      id: node.id,
      label: node.label,
      kind: node.kind,
      depth,
      initial,
      visible: readNavigationBuilderPresentation(node).item.visible,
    });
    if (node.kind !== 'screen') {
      for (const childRef of node.childRefs) visit(childRef, depth + 1, node.initialNodeRef === childRef);
    }
    active.delete(nodeRef);
  };

  visit(navigation.rootNodeRef, 0, true);
  return Object.freeze(rows.map((row) => Object.freeze(row)));
}
