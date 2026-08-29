import { describe, expect, it } from 'vitest';
import {
  addScreenRouteToNavigation,
  analyzeScreenDelete,
  createNavigationForScreenRoute,
  createRouteForScreen,
  createScreenDocument,
  duplicateScreenDocument,
  suggestScreenRoutePath,
} from '@electrocraft/application';

describe('M07.2 screen CRUD use cases', () => {
  it('creates a canonical screen, portable route and navigation root', () => {
    const screen = createScreenDocument({ name: 'Inicio', idSeed: 'm07.2:create:inicio' });
    const route = createRouteForScreen({ screen, path: '/', idSeed: 'm07.2:create:route', name: 'Inicio' });
    const navigation = createNavigationForScreenRoute({
      screen,
      route,
      idSeed: 'm07.2:create:navigation',
    });

    expect(screen).toMatchObject({ schemaVersion: 4, kind: 'screen', name: 'Inicio' });
    expect(route).toMatchObject({ schemaVersion: 2, path: '/', screenRef: screen.id });
    expect(navigation.schemaVersion).toBe(2);
    expect(navigation.nodes.some((node) => node.kind === 'stack')).toBe(true);
    expect(
      navigation.nodes.some((node) => node.kind === 'screen' && node.routeRef === route.id),
    ).toBe(true);
  });

  it('duplicates screen and every node identity while suggesting a new route', () => {
    const source = createScreenDocument({ name: 'Productos', idSeed: 'm07.2:duplicate:source' });
    const duplicate = duplicateScreenDocument({
      source,
      idSeed: 'm07.2:duplicate:copy',
      name: 'Productos copia',
    });

    expect(duplicate.screen.id).not.toBe(source.id);
    expect(duplicate.screen.root.id).not.toBe(source.root.id);
    expect(duplicate.screen.name).toBe('Productos copia');
    expect(duplicate.routeSuggestion).toBe('/productos-copia');
    expect(suggestScreenRoutePath('Órdenes activas')).toBe('/ordenes-activas');
  });

  it('adds a second screen to an existing navigator without changing the first route reference', () => {
    const first = createScreenDocument({ name: 'Inicio', idSeed: 'm07.2:add:first' });
    const firstRoute = createRouteForScreen({ screen: first, path: '/', idSeed: 'm07.2:add:first-route' });
    const navigation = createNavigationForScreenRoute({
      screen: first,
      route: firstRoute,
      idSeed: 'm07.2:add:navigation',
    });
    const second = createScreenDocument({ name: 'Perfil', idSeed: 'm07.2:add:second' });
    const secondRoute = createRouteForScreen({ screen: second, path: '/perfil', idSeed: 'm07.2:add:second-route' });
    const updated = addScreenRouteToNavigation({ navigation, route: secondRoute, screenName: second.name });

    expect(updated.version).toBe(navigation.version + 1);
    expect(updated.nodes.some((node) => node.kind === 'screen' && node.routeRef === firstRoute.id)).toBe(true);
    expect(updated.nodes.some((node) => node.kind === 'screen' && node.routeRef === secondRoute.id)).toBe(true);
  });

  it('blocks deleting a referenced screen and permits an unreferenced duplicate', () => {
    const screen = createScreenDocument({ name: 'Detalle', idSeed: 'm07.2:delete:source' });
    const route = createRouteForScreen({ screen, path: '/detalle', idSeed: 'm07.2:delete:route' });
    const navigation = createNavigationForScreenRoute({
      screen,
      route,
      idSeed: 'm07.2:delete:navigation',
    });
    const duplicate = duplicateScreenDocument({ source: screen, idSeed: 'm07.2:delete:duplicate' }).screen;

    const used = analyzeScreenDelete({
      screenId: screen.id,
      documents: [screen, duplicate],
      routes: [route],
      navigations: [navigation],
    });
    const unused = analyzeScreenDelete({
      screenId: duplicate.id,
      documents: [screen, duplicate],
      routes: [route],
      navigations: [navigation],
    });

    expect(used.allowed).toBe(false);
    expect(used.usages.map(({ kind }) => kind)).toEqual(expect.arrayContaining(['route', 'navigation']));
    expect(unused).toEqual({ allowed: true, usages: [] });
  });
});
