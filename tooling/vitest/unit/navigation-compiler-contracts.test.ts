import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  addNavigationNavigator,
  collectNavigationCompilerDiagnostics,
  compileNavigationContract,
  createNavigationCompilerSource,
  parseNavigationWorkspaceGraph,
} from '@electrocraft/application';

function fixture<T = unknown>(name: string): T {
  return JSON.parse(readFileSync(resolve(`tooling/fixtures/canonical-model/${name}.json`), 'utf8')) as T;
}

function source() {
  const graph = parseNavigationWorkspaceGraph({
    documents: [fixture('screen-v4')],
    routes: [fixture('route-v2')],
    navigations: [fixture('navigation-v2')],
  });
  return { graph, compiler: createNavigationCompilerSource(graph) };
}

describe('M07.7 navigation compiler boundaries', () => {
  it('maps the same canonical model to React Router and Expo Router contract fixtures', () => {
    const { compiler } = source();
    expect(compileNavigationContract(compiler, 'react-router')).toEqual(
      fixture('navigation-react-router-contract-v1'),
    );
    expect(compileNavigationContract(compiler, 'expo-router')).toEqual(
      fixture('navigation-expo-router-contract-v1'),
    );
  });

  it('derives LAMP/Slim, WordPress, Capacitor and Static contracts without persisting router objects', () => {
    const { compiler } = source();
    const lamp = compileNavigationContract(compiler, 'lamp-slim');
    const wordpress = compileNavigationContract(compiler, 'wordpress');
    const capacitor = compileNavigationContract(compiler, 'capacitor');
    const staticWeb = compileNavigationContract(compiler, 'static-web');

    expect(lamp).toMatchObject({
      target: 'lamp-slim',
      routes: [{ method: 'GET', path: '/productos/:productId', name: 'Producto' }],
    });
    expect(wordpress).toMatchObject({
      target: 'wordpress',
      mappings: [{ routeRef: 'ec_route_0000000000005', mode: 'rewrite' }],
    });
    expect(capacitor).toMatchObject({
      target: 'capacitor',
      web: { target: 'react-router' },
      deepLinks: [{ aliases: ['/productos/:productId', '/p/:productId'] }],
    });
    expect(staticWeb).toMatchObject({
      target: 'static-web',
      routes: [{ mode: 'runtime-blocked', blockers: ['required-path-param-without-static-values'] }],
    });
    expect(JSON.stringify({ lamp, wordpress, capacitor, staticWeb })).not.toMatch(
      /RouteObject|ExpoRouter|WP_Query|WP_Post|Slim\\Route|capacitorConfig/i,
    );
  });

  it('reports unsupported drawer/modal options for static targets', () => {
    const { graph } = source();
    const base = graph.navigations[0];
    const withDrawer = addNavigationNavigator({
      navigation: base,
      parentNavigatorRef: base.rootNodeRef,
      kind: 'drawer',
      label: 'Menú',
      idSeed: 'compiler-drawer',
    });
    const withModal = addNavigationNavigator({
      navigation: withDrawer,
      parentNavigatorRef: base.rootNodeRef,
      kind: 'modal',
      label: 'Modal',
      idSeed: 'compiler-modal',
    });
    const compiler = createNavigationCompilerSource({ ...graph, navigations: [withModal], diagnostics: [] });
    const diagnostics = collectNavigationCompilerDiagnostics(compiler, 'static-web');
    expect(diagnostics.filter(({ code }) => code === 'UNSUPPORTED_NAVIGATOR_OPTION')).toHaveLength(2);
    expect(diagnostics.map(({ feature }) => feature)).toEqual(expect.arrayContaining(['drawer', 'modal']));
  });

  it('keeps domain/application boundaries free of concrete router imports', () => {
    const domain = readFileSync(resolve('packages/domain/src/navigation/compiler.ts'), 'utf8');
    const application = readFileSync(resolve('packages/application/src/navigation/navigation-compiler-service.ts'), 'utf8');
    expect(domain).not.toMatch(/from ['\"]react-router|from ['\"]expo-router|@react-navigation/);
    expect(application).not.toMatch(/from ['\"]react-router|from ['\"]expo-router|@react-navigation/);
  });
});
