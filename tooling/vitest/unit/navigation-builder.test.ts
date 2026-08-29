import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  addNavigationNavigator,
  createNavigationPreviewRows,
  reorderNavigationChild,
  setNavigationInitialChild,
  updateNavigationNodePresentation,
} from '@electrocraft/application';
import {
  electroCraftNavigationDefinitionV2Schema,
  readNavigationBuilderPresentation,
  validateElectroCraftNavigationGraph,
} from '@electrocraft/domain';

function fixture<T = unknown>(name: string): T {
  return JSON.parse(readFileSync(resolve(`tooling/fixtures/canonical-model/${name}.json`), 'utf8')) as T;
}

describe('M07.4 Navigation Builder', () => {
  it('builds nested Pila + Pestañas + Menú lateral without a second navigation model', () => {
    const base = electroCraftNavigationDefinitionV2Schema.parse(fixture('navigation-v2'));
    const withTabs = addNavigationNavigator({
      navigation: base,
      parentNavigatorRef: base.rootNodeRef,
      kind: 'tabs',
      label: 'Principal tabs',
      idSeed: 'tabs-fixture',
    });
    const tabs = withTabs.nodes.find((node) => node.kind === 'tabs');
    expect(tabs).toBeTruthy();

    const nested = addNavigationNavigator({
      navigation: withTabs,
      parentNavigatorRef: tabs!.id,
      kind: 'drawer',
      label: 'Menú de cuenta',
      idSeed: 'drawer-fixture',
    });
    const drawer = nested.nodes.find((node) => node.kind === 'drawer');
    expect(drawer).toBeTruthy();
    expect(nested.nodes.find((node) => node.id === tabs!.id && node.kind !== 'screen')?.childRefs).toContain(
      drawer!.id,
    );

    const preview = createNavigationPreviewRows(nested);
    expect(preview.map(({ kind }) => kind)).toContain('tabs');
    expect(preview.map(({ kind }) => kind)).toContain('drawer');
    expect(preview.find(({ id }) => id === drawer!.id)?.depth).toBeGreaterThan(1);
  });

  it('reorders siblings and keeps an explicit initial child', () => {
    const base = electroCraftNavigationDefinitionV2Schema.parse(fixture('navigation-v2'));
    const withTabs = addNavigationNavigator({
      navigation: base,
      parentNavigatorRef: base.rootNodeRef,
      kind: 'tabs',
      label: 'Tabs',
      idSeed: 'tabs-reorder',
    });
    const tabs = withTabs.nodes.find((node) => node.kind === 'tabs')!;
    const withModal = addNavigationNavigator({
      navigation: withTabs,
      parentNavigatorRef: base.rootNodeRef,
      kind: 'modal',
      label: 'Modal',
      idSeed: 'modal-reorder',
    });
    const modal = withModal.nodes.find((node) => node.kind === 'modal')!;
    const rootBefore = withModal.nodes.find((node) => node.id === base.rootNodeRef && node.kind !== 'screen')!;
    expect(rootBefore.childRefs.at(-1)).toBe(modal.id);

    const reordered = reorderNavigationChild({
      navigation: withModal,
      parentNavigatorRef: base.rootNodeRef,
      childRef: modal.id,
      direction: 'up',
    });
    const rootAfter = reordered.nodes.find((node) => node.id === base.rootNodeRef && node.kind !== 'screen')!;
    expect(rootAfter.childRefs.indexOf(modal.id)).toBeLessThan(rootAfter.childRefs.indexOf(tabs.id));

    const initial = setNavigationInitialChild({
      navigation: reordered,
      navigatorRef: base.rootNodeRef,
      childRef: modal.id,
    });
    expect(initial.nodes.find((node) => node.id === base.rootNodeRef && node.kind !== 'screen')?.initialNodeRef).toBe(
      modal.id,
    );
  });

  it('stores target-neutral presentation semantics on node metadata', () => {
    const base = electroCraftNavigationDefinitionV2Schema.parse(fixture('navigation-v2'));
    const root = base.nodes.find((node) => node.id === base.rootNodeRef)!;
    const defaults = readNavigationBuilderPresentation(root);
    const nextPresentation = {
      ...defaults,
      item: { icon: 'home', visible: true },
      header: { visible: true, title: 'Inicio', backBehavior: 'hidden' as const },
    };
    const updated = updateNavigationNodePresentation({
      navigation: base,
      nodeRef: root.id,
      presentation: nextPresentation,
    });
    const nextRoot = updated.nodes.find((node) => node.id === root.id)!;
    expect(readNavigationBuilderPresentation(nextRoot)).toMatchObject(nextPresentation);
    expect(JSON.stringify(nextRoot.metadata)).not.toMatch(/reactRouter|expoRouter|coordinates|xPosition|yPosition/i);
  });

  it('reports an invalid screen ref through the canonical graph validator', () => {
    const navigation = electroCraftNavigationDefinitionV2Schema.parse(fixture('navigation-v2'));
    const route = fixture<Record<string, unknown>>('route-v2');
    const screen = fixture<Record<string, unknown>>('screen-v4');
    const diagnostics = validateElectroCraftNavigationGraph({
      documents: [screen as never],
      routes: [{ ...route, screenRef: 'ec_document_000000000000z' } as never],
      navigations: [navigation],
    });
    expect(diagnostics.map(({ code }) => code)).toContain('missing-screen-ref');
  });

  it('keeps the UI tree-based with drag plus keyboard alternatives and a mobile inspector Sheet', () => {
    const ui = readFileSync(resolve('apps/studio/src/features/navigation/navigation-builder.tsx'), 'utf8');
    expect(ui).toContain('draggable={parent !== null}');
    expect(ui).toContain('Mover ${node.label} arriba');
    expect(ui).toContain('Mover ${node.label} abajo');
    expect(ui).toContain('ec-nav-builder-mobile-sheet');
    expect(ui).toContain('Esta representación se deriva del árbol');
    expect(ui).not.toMatch(/ReactFlow|rete|position:\s*\{\s*x|coordinates/i);
  });
});
