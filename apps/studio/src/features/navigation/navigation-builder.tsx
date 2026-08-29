import {
  Button,
  Checkbox,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  getStudioIcon,
} from '@electrocraft/design-system';
import { createNavigationPreviewRows, findNavigationParent } from '@electrocraft/application';
import {
  readNavigationBuilderPresentation,
  type ElectroCraftNavigationBuilderPresentation,
  type ElectroCraftNavigationDefinition,
  type ElectroCraftNavigationNode,
  type ElectroCraftNavigationNavigatorNode,
  type ElectroCraftNavigatorKind,
  type ElectroCraftRouteDefinition,
} from '@electrocraft/domain';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { navigationWorkspaceRuntime } from './navigation-workspace-runtime';
import './navigation-builder.css';

const AddIcon = getStudioIcon('action.add');
const UpIcon = getStudioIcon('action.back');
const DownIcon = getStudioIcon('action.next');
const SettingsIcon = getStudioIcon('studio.settings');

const navigatorLabels: Readonly<Record<ElectroCraftNavigatorKind, string>> = Object.freeze({
  stack: 'Pila',
  tabs: 'Pestañas',
  drawer: 'Menú lateral',
  modal: 'Modal',
});

function routeLabel(routes: readonly ElectroCraftRouteDefinition[], node: ElectroCraftNavigationNode) {
  if (node.kind !== 'screen') return null;
  return routes.find(({ id }) => id === node.routeRef)?.path ?? 'Ruta inválida';
}

function NavigationTreeNode({
  navigation,
  node,
  parent,
  nodesById,
  routes,
  selectedNodeId,
  draggedNodeId,
  onSelect,
  onDragStart,
  onDropSibling,
}: {
  readonly navigation: ElectroCraftNavigationDefinition;
  readonly node: ElectroCraftNavigationNode;
  readonly parent: ElectroCraftNavigationNavigatorNode | null;
  readonly nodesById: ReadonlyMap<string, ElectroCraftNavigationNode>;
  readonly routes: readonly ElectroCraftRouteDefinition[];
  readonly selectedNodeId: string | null;
  readonly draggedNodeId: string | null;
  readonly onSelect: (nodeId: string) => void;
  readonly onDragStart: (nodeId: string) => void;
  readonly onDropSibling: (parent: ElectroCraftNavigationNavigatorNode, draggedId: string, targetId: string) => void;
}) {
  const isNavigator = node.kind !== 'screen';
  const route = routeLabel(routes, node);
  const index = parent?.childRefs.indexOf(node.id) ?? -1;
  const canMoveUp = Boolean(parent && index > 0);
  const canMoveDown = Boolean(parent && index >= 0 && index < parent.childRefs.length - 1);

  return (
    <li className="ec-nav-builder-tree-item" role="treeitem" aria-expanded={isNavigator ? true : undefined}>
      <div
        className="ec-nav-builder-tree-row"
        data-selected={selectedNodeId === node.id ? 'true' : 'false'}
        draggable={parent !== null}
        onDragStart={() => onDragStart(node.id)}
        onDragOver={(event) => {
          if (parent && draggedNodeId) event.preventDefault();
        }}
        onDrop={(event) => {
          event.preventDefault();
          if (parent && draggedNodeId && draggedNodeId !== node.id) onDropSibling(parent, draggedNodeId, node.id);
        }}
      >
        <button type="button" className="ec-nav-builder-select" onClick={() => onSelect(node.id)}>
          <span className="ec-nav-builder-kind">{node.kind === 'screen' ? 'Pantalla' : navigatorLabels[node.kind]}</span>
          <strong>{node.label}</strong>
          {route ? <code>{route}</code> : null}
          {node.id === navigation.rootNodeRef ? <em>Raíz</em> : null}
          {parent?.initialNodeRef === node.id ? <em>Pantalla inicial</em> : null}
        </button>
        {parent ? (
          <div className="ec-nav-builder-reorder" aria-label={`Reordenar ${node.label}`}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={!canMoveUp}
              aria-label={`Mover ${node.label} arriba`}
              onClick={() => void navigationWorkspaceRuntime.reorderNode(parent.id, node.id, 'up')}
            >
              <UpIcon aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={!canMoveDown}
              aria-label={`Mover ${node.label} abajo`}
              onClick={() => void navigationWorkspaceRuntime.reorderNode(parent.id, node.id, 'down')}
            >
              <DownIcon aria-hidden="true" />
            </Button>
          </div>
        ) : null}
      </div>
      {isNavigator && node.childRefs.length > 0 ? (
        <ul role="group">
          {node.childRefs.map((childRef) => {
            const child = nodesById.get(childRef);
            return child ? (
              <NavigationTreeNode
                key={child.id}
                navigation={navigation}
                node={child}
                parent={node}
                nodesById={nodesById}
                routes={routes}
                selectedNodeId={selectedNodeId}
                draggedNodeId={draggedNodeId}
                onSelect={onSelect}
                onDragStart={onDragStart}
                onDropSibling={onDropSibling}
              />
            ) : null;
          })}
        </ul>
      ) : null}
    </li>
  );
}

function AddNavigatorControls({ navigation, selected }: { readonly navigation: ElectroCraftNavigationDefinition; readonly selected: ElectroCraftNavigationNode | null }) {
  const [kind, setKind] = useState<ElectroCraftNavigatorKind>('stack');
  const [label, setLabel] = useState('Nueva Pila');
  const selectedParent = selected?.kind === 'screen' ? findNavigationParent(navigation, selected.id) : selected;
  const parent = selectedParent && selectedParent.kind !== 'screen'
    ? selectedParent
    : navigation.nodes.find((node) => node.id === navigation.rootNodeRef && node.kind !== 'screen') ?? null;

  useEffect(() => {
    setLabel(`Nuevo ${navigatorLabels[kind]}`);
  }, [kind]);

  return (
    <div className="ec-nav-builder-add">
      <Select value={kind} onValueChange={(value) => setKind(value as ElectroCraftNavigatorKind)}>
        <SelectTrigger aria-label="Tipo de navegador"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="stack">Pila</SelectItem>
          <SelectItem value="tabs">Pestañas</SelectItem>
          <SelectItem value="drawer">Menú lateral</SelectItem>
          <SelectItem value="modal">Modal</SelectItem>
        </SelectContent>
      </Select>
      <Input value={label} aria-label="Nombre del navegador" onChange={(event) => setLabel(event.target.value)} />
      <Button
        size="sm"
        disabled={!parent || !label.trim()}
        title={!parent ? 'Selecciona un Navigator que pueda contener hijos.' : undefined}
        onClick={() => parent && void navigationWorkspaceRuntime.addNavigator(parent.id, kind, label)}
      >
        <AddIcon aria-hidden="true" />
        Agregar navegador
      </Button>
    </div>
  );
}

function NodeInspector({
  navigation,
  node,
}: {
  readonly navigation: ElectroCraftNavigationDefinition;
  readonly node: ElectroCraftNavigationNode | null;
}) {
  const [label, setLabel] = useState(node?.label ?? '');
  const [presentation, setPresentation] = useState<ElectroCraftNavigationBuilderPresentation | null>(
    node ? readNavigationBuilderPresentation(node) : null,
  );

  useEffect(() => {
    setLabel(node?.label ?? '');
    setPresentation(node ? readNavigationBuilderPresentation(node) : null);
  }, [node]);

  if (!node || !presentation) return <p className="ec-nav-builder-inspector-empty">Selecciona un nodo para editar sus propiedades.</p>;
  const parent = findNavigationParent(navigation, node.id);
  const isNavigator = node.kind !== 'screen';

  function patchPresentation(patch: Partial<ElectroCraftNavigationBuilderPresentation>) {
    setPresentation((current) => (current ? { ...current, ...patch } : current));
  }

  return (
    <div className="ec-nav-builder-inspector-form">
      <label>
        <span>Nombre</span>
        <Input value={label} onChange={(event) => setLabel(event.target.value)} />
      </label>

      <label className="ec-nav-builder-check">
        <Checkbox
          checked={presentation.item.visible}
          onCheckedChange={(checked) => patchPresentation({ item: { ...presentation.item, visible: checked === true } })}
        />
        <span>Visible en navegación</span>
      </label>

      <label>
        <span>Icono</span>
        <Input
          value={presentation.item.icon ?? ''}
          placeholder="Opcional"
          onChange={(event) => patchPresentation({ item: { ...presentation.item, icon: event.target.value.trim() || null } })}
        />
      </label>

      <fieldset>
        <legend>Header</legend>
        <label className="ec-nav-builder-check">
          <Checkbox
            checked={presentation.header.visible}
            onCheckedChange={(checked) => patchPresentation({ header: { ...presentation.header, visible: checked === true } })}
          />
          <span>Mostrar header</span>
        </label>
        <label>
          <span>Título</span>
          <Input
            value={presentation.header.title ?? ''}
            placeholder={node.label}
            onChange={(event) => patchPresentation({ header: { ...presentation.header, title: event.target.value.trim() || null } })}
          />
        </label>
        <label>
          <span>Comportamiento Atrás</span>
          <Select
            value={presentation.header.backBehavior}
            onValueChange={(value) => patchPresentation({ header: { ...presentation.header, backBehavior: value as 'auto' | 'hidden' | 'parent' } })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Automático</SelectItem>
              <SelectItem value="parent">Volver al padre</SelectItem>
              <SelectItem value="hidden">Oculto</SelectItem>
            </SelectContent>
          </Select>
        </label>
      </fieldset>

      {isNavigator && node.kind === 'tabs' && presentation.tabs ? (
        <fieldset>
          <legend>Pestañas</legend>
          <label>
            <span>Posición</span>
            <Select
              value={presentation.tabs.placement}
              onValueChange={(value) => patchPresentation({ tabs: { ...presentation.tabs!, placement: value as 'top' | 'bottom' } })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="top">Arriba</SelectItem><SelectItem value="bottom">Abajo</SelectItem></SelectContent>
            </Select>
          </label>
          <label className="ec-nav-builder-check">
            <Checkbox
              checked={presentation.tabs.showLabels}
              onCheckedChange={(checked) => patchPresentation({ tabs: { ...presentation.tabs!, showLabels: checked === true } })}
            />
            <span>Mostrar etiquetas</span>
          </label>
        </fieldset>
      ) : null}

      {isNavigator && node.kind === 'drawer' && presentation.drawer ? (
        <fieldset>
          <legend>Menú lateral</legend>
          <label>
            <span>Lado</span>
            <Select
              value={presentation.drawer.side}
              onValueChange={(value) => patchPresentation({ drawer: { ...presentation.drawer!, side: value as 'left' | 'right' } })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="left">Izquierda</SelectItem><SelectItem value="right">Derecha</SelectItem></SelectContent>
            </Select>
          </label>
          <label>
            <span>Ancho</span>
            <Input
              type="number"
              min={220}
              max={520}
              value={presentation.drawer.width}
              onChange={(event) => patchPresentation({ drawer: { ...presentation.drawer!, width: Number(event.target.value) || 300 } })}
            />
          </label>
        </fieldset>
      ) : null}

      {isNavigator && node.kind === 'modal' && presentation.modal ? (
        <fieldset>
          <legend>Modal</legend>
          <label>
            <span>Presentación</span>
            <Select
              value={presentation.modal.presentation}
              onValueChange={(value) => patchPresentation({ modal: { presentation: value as 'dialog' | 'sheet' | 'fullscreen' } })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dialog">Diálogo</SelectItem>
                <SelectItem value="sheet">Hoja</SelectItem>
                <SelectItem value="fullscreen">Pantalla completa</SelectItem>
              </SelectContent>
            </Select>
          </label>
        </fieldset>
      ) : null}

      {isNavigator && node.childRefs.length > 0 ? (
        <label>
          <span>Pantalla inicial</span>
          <Select
            value={node.initialNodeRef ?? ''}
            onValueChange={(value) => void navigationWorkspaceRuntime.setInitialNode(node.id, value)}
          >
            <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
            <SelectContent>
              {node.childRefs.map((childRef) => (
                <SelectItem key={childRef} value={childRef}>{navigation.nodes.find(({ id }) => id === childRef)?.label ?? childRef}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      ) : null}

      {parent ? <small>Dentro de: {parent.label}</small> : <small>Nodo raíz</small>}
      <Button
        disabled={!label.trim()}
        onClick={() => {
          if (label.trim() !== node.label) void navigationWorkspaceRuntime.updateNodeLabel(node.id, label);
          void navigationWorkspaceRuntime.updateNodePresentation(node.id, presentation);
        }}
      >
        Guardar propiedades
      </Button>
    </div>
  );
}

export function NavigationBuilder() {
  const snapshot = useSyncExternalStore(
    navigationWorkspaceRuntime.subscribe,
    navigationWorkspaceRuntime.getSnapshot,
    navigationWorkspaceRuntime.getSnapshot,
  );
  const navigation = snapshot.graph?.navigations[0] ?? null;
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(navigation?.rootNodeRef ?? null);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  useEffect(() => {
    if (!navigation) return;
    if (!selectedNodeId || !navigation.nodes.some(({ id }) => id === selectedNodeId)) setSelectedNodeId(navigation.rootNodeRef);
  }, [navigation, selectedNodeId]);

  if (!navigation || !snapshot.graph) return null;
  const nodesById = new Map(navigation.nodes.map((node) => [node.id, node] as const));
  const root = nodesById.get(navigation.rootNodeRef);
  const selected = selectedNodeId ? nodesById.get(selectedNodeId) ?? null : null;
  const previewRows = createNavigationPreviewRows(navigation);

  function dropSibling(parent: ElectroCraftNavigationNavigatorNode, draggedId: string, targetId: string) {
    const draggedIndex = parent.childRefs.indexOf(draggedId as never);
    const targetIndex = parent.childRefs.indexOf(targetId as never);
    if (draggedIndex < 0 || targetIndex < 0 || draggedIndex === targetIndex) return;
    void navigationWorkspaceRuntime.reorderNode(parent.id, draggedId, draggedIndex < targetIndex ? 'down' : 'up');
    setDraggedNodeId(null);
  }

  return (
    <div className="ec-nav-builder" data-navigation-builder>
      <section className="ec-nav-builder-tree-panel" aria-labelledby="nav-builder-tree-title">
        <div className="ec-nav-builder-panel-heading">
          <div><p>Navigation Graph</p><h3 id="nav-builder-tree-title">{navigation.label}</h3></div>
          <span>{navigation.nodes.length} nodos</span>
        </div>
        <AddNavigatorControls navigation={navigation} selected={selected} />
        {root ? (
          <ul className="ec-nav-builder-tree" role="tree" aria-label="Árbol de Navegación">
            <NavigationTreeNode
              navigation={navigation}
              node={root}
              parent={null}
              nodesById={nodesById}
              routes={snapshot.graph.routes}
              selectedNodeId={selectedNodeId}
              draggedNodeId={draggedNodeId}
              onSelect={setSelectedNodeId}
              onDragStart={setDraggedNodeId}
              onDropSibling={dropSibling}
            />
          </ul>
        ) : <p role="alert">El Navigator raíz no existe.</p>}
      </section>

      <section className="ec-nav-builder-preview" aria-labelledby="nav-builder-preview-title">
        <div className="ec-nav-builder-panel-heading"><div><p>Vista derivada</p><h3 id="nav-builder-preview-title">Estructura de la app</h3></div></div>
        <p className="ec-nav-builder-preview-summary">Esta representación se deriva del árbol; no guarda coordenadas ni un segundo modelo.</p>
        <div className="ec-nav-builder-preview-list">
          {previewRows.map((row) => (
            <button
              key={row.id}
              type="button"
              className="ec-nav-builder-preview-row"
              data-visible={row.visible ? 'true' : 'false'}
              data-selected={selectedNodeId === row.id ? 'true' : 'false'}
              style={{ marginInlineStart: `${Math.min(row.depth, 6) * 18}px` }}
              onClick={() => setSelectedNodeId(row.id)}
            >
              <span>{row.kind === 'screen' ? 'Pantalla' : navigatorLabels[row.kind]}</span>
              <strong>{row.label}</strong>
              {row.initial ? <em>Pantalla inicial</em> : null}
            </button>
          ))}
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button className="ec-nav-builder-mobile-settings" variant="outline" size="sm">
              <SettingsIcon aria-hidden="true" />
              Propiedades
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="ec-nav-builder-mobile-sheet">
            <SheetHeader><SheetTitle>Propiedades de Navegación</SheetTitle><SheetDescription>Edita el nodo seleccionado.</SheetDescription></SheetHeader>
            <NodeInspector navigation={navigation} node={selected} />
          </SheetContent>
        </Sheet>
      </section>

      <aside className="ec-nav-builder-inspector" aria-label="Propiedades de Navegación">
        <div className="ec-nav-builder-panel-heading"><div><p>Inspector</p><h3>{selected?.label ?? 'Nodo'}</h3></div></div>
        <NodeInspector navigation={navigation} node={selected} />
      </aside>
    </div>
  );
}
