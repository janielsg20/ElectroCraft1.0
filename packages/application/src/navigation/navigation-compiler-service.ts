import {
  readNavigationBuilderPresentation,
  type ElectroCraftNavigationCompilerDiagnostic,
  type ElectroCraftNavigationCompilerTarget,
  type ElectroCraftNavigationDefinition,
  type ElectroCraftNavigationNode,
  type ElectroCraftRouteDefinition,
} from '@electrocraft/domain';
import type { ElectroCraftNavigationCompilerSource } from './navigation-service';

export interface NavigationCompilerPort<TTargetOutput> {
  readonly target: ElectroCraftNavigationCompilerTarget;
  compile(source: ElectroCraftNavigationCompilerSource): TTargetOutput;
  diagnostics(source: ElectroCraftNavigationCompilerSource): readonly ElectroCraftNavigationCompilerDiagnostic[];
}

export interface ReactRouterContract {
  readonly target: 'react-router';
  readonly routes: readonly {
    readonly routeRef: string;
    readonly path: string;
    readonly name: string;
    readonly screenRef: string;
    readonly params: readonly string[];
    readonly guardCount: number;
  }[];
  readonly navigators: readonly { readonly nodeRef: string; readonly kind: ElectroCraftNavigationNode['kind'] }[];
}

export interface ExpoRouterContract {
  readonly target: 'expo-router';
  readonly screens: readonly {
    readonly routeRef: string;
    readonly path: string;
    readonly screenRef: string;
    readonly deepLinks: readonly string[];
  }[];
  readonly navigators: readonly { readonly nodeRef: string; readonly kind: ElectroCraftNavigationNode['kind'] }[];
}

export interface LampSlimRouteContract {
  readonly target: 'lamp-slim';
  readonly routes: readonly {
    readonly routeRef: string;
    readonly method: 'GET';
    readonly path: string;
    readonly name: string;
    readonly params: readonly { readonly name: string; readonly type: string; readonly required: boolean }[];
    readonly guards: readonly string[];
  }[];
}

export interface WordPressNavigationContract {
  readonly target: 'wordpress';
  readonly mappings: readonly {
    readonly routeRef: string;
    readonly mode: 'page' | 'rewrite' | 'endpoint';
    readonly slug: string;
    readonly templateKey: string;
  }[];
}

export interface CapacitorNavigationContract {
  readonly target: 'capacitor';
  readonly web: ReactRouterContract;
  readonly deepLinks: readonly { readonly routeRef: string; readonly aliases: readonly string[] }[];
}

export interface StaticNavigationContract {
  readonly target: 'static-web';
  readonly routes: readonly {
    readonly routeRef: string;
    readonly path: string;
    readonly mode: 'pre-generate' | 'runtime-blocked';
    readonly blockers: readonly string[];
  }[];
}

export type NavigationCompilerContractOutput =
  | ReactRouterContract
  | ExpoRouterContract
  | LampSlimRouteContract
  | WordPressNavigationContract
  | CapacitorNavigationContract
  | StaticNavigationContract;

function allNodes(source: ElectroCraftNavigationCompilerSource) {
  return source.navigations.flatMap(({ nodes }) => nodes);
}

function routeContract(route: ElectroCraftRouteDefinition) {
  return {
    routeRef: route.id,
    path: route.path,
    name: route.name,
    screenRef: route.screenRef,
    params: route.params.map(({ name }) => name),
    guardCount: route.guards.length,
  } as const;
}

function navigatorContracts(navigations: readonly ElectroCraftNavigationDefinition[]) {
  return navigations.flatMap(({ nodes }) =>
    nodes.filter((node) => node.kind !== 'screen').map((node) => ({ nodeRef: node.id, kind: node.kind } as const)),
  );
}

function compileReactRouter(source: ElectroCraftNavigationCompilerSource): ReactRouterContract {
  return Object.freeze({
    target: 'react-router',
    routes: Object.freeze(source.routes.map(routeContract)),
    navigators: Object.freeze(navigatorContracts(source.navigations)),
  });
}

function compileExpoRouter(source: ElectroCraftNavigationCompilerSource): ExpoRouterContract {
  return Object.freeze({
    target: 'expo-router',
    screens: Object.freeze(
      source.routes.map((route) =>
        Object.freeze({
          routeRef: route.id,
          path: route.path,
          screenRef: route.screenRef,
          deepLinks: Object.freeze([route.path, ...route.deepLink.aliases]),
        }),
      ),
    ),
    navigators: Object.freeze(navigatorContracts(source.navigations)),
  });
}

function compileLampSlim(source: ElectroCraftNavigationCompilerSource): LampSlimRouteContract {
  return Object.freeze({
    target: 'lamp-slim',
    routes: Object.freeze(
      source.routes.map((route) =>
        Object.freeze({
          routeRef: route.id,
          method: 'GET' as const,
          path: route.path,
          name: route.name,
          params: Object.freeze(
            route.params.map((param) =>
              Object.freeze({ name: param.name, type: param.valueType, required: param.required }),
            ),
          ),
          guards: Object.freeze(route.guards.map(({ kind }) => kind)),
        }),
      ),
    ),
  });
}

function wordpressMode(route: ElectroCraftRouteDefinition) {
  if (route.params.some(({ source }) => source === 'path')) return 'rewrite' as const;
  if (route.path.startsWith('/api/')) return 'endpoint' as const;
  return 'page' as const;
}

function compileWordPress(source: ElectroCraftNavigationCompilerSource): WordPressNavigationContract {
  return Object.freeze({
    target: 'wordpress',
    mappings: Object.freeze(
      source.routes.map((route) =>
        Object.freeze({
          routeRef: route.id,
          mode: wordpressMode(route),
          slug: route.path.replace(/^\//, '') || 'inicio',
          templateKey: `screen:${route.screenRef}`,
        }),
      ),
    ),
  });
}

function compileCapacitor(source: ElectroCraftNavigationCompilerSource): CapacitorNavigationContract {
  return Object.freeze({
    target: 'capacitor',
    web: compileReactRouter(source),
    deepLinks: Object.freeze(
      source.routes.map((route) =>
        Object.freeze({ routeRef: route.id, aliases: Object.freeze([route.path, ...route.deepLink.aliases]) }),
      ),
    ),
  });
}

function compileStatic(source: ElectroCraftNavigationCompilerSource): StaticNavigationContract {
  return Object.freeze({
    target: 'static-web',
    routes: Object.freeze(
      source.routes.map((route) => {
        const blockers = [
          ...(route.params.some(({ source, required }) => source === 'path' && required)
            ? ['required-path-param-without-static-values']
            : []),
          ...(route.guards.some(({ kind }) => kind === 'custom') ? ['custom-runtime-guard'] : []),
        ];
        return Object.freeze({
          routeRef: route.id,
          path: route.path,
          mode: blockers.length > 0 ? ('runtime-blocked' as const) : ('pre-generate' as const),
          blockers: Object.freeze(blockers),
        });
      }),
    ),
  });
}

export function collectNavigationCompilerDiagnostics(
  source: ElectroCraftNavigationCompilerSource,
  target: ElectroCraftNavigationCompilerTarget,
): readonly ElectroCraftNavigationCompilerDiagnostic[] {
  const diagnostics: ElectroCraftNavigationCompilerDiagnostic[] = [];
  for (const node of allNodes(source)) {
    if (node.kind === 'screen') continue;
    const presentation = readNavigationBuilderPresentation(node);
    if (target === 'static-web' && (node.kind === 'drawer' || node.kind === 'modal')) {
      diagnostics.push({
        code: 'UNSUPPORTED_NAVIGATOR_OPTION',
        severity: 'error',
        target,
        ownerRef: node.id,
        feature: node.kind,
        message: `El target estático no puede representar ${node.kind} como navegación runtime.`,
      });
    }
    if (target === 'wordpress' && node.kind === 'drawer' && presentation.drawer?.side === 'right') {
      diagnostics.push({
        code: 'UNSUPPORTED_NAVIGATOR_OPTION',
        severity: 'warning',
        target,
        ownerRef: node.id,
        feature: 'drawer.side.right',
        message: 'WordPress requiere adapter de tema para Menú lateral a la derecha.',
      });
    }
    if (target === 'wordpress' && node.kind === 'modal' && presentation.modal?.presentation === 'fullscreen') {
      diagnostics.push({
        code: 'UNSUPPORTED_NAVIGATOR_OPTION',
        severity: 'warning',
        target,
        ownerRef: node.id,
        feature: 'modal.fullscreen',
        message: 'WordPress requiere adapter de tema para Modal de pantalla completa.',
      });
    }
  }
  for (const route of source.routes) {
    if (target === 'static-web' && route.params.some(({ source: kind, required }) => kind === 'path' && required)) {
      diagnostics.push({
        code: 'RUNTIME_ROUTE_NOT_STATIC',
        severity: 'error',
        target,
        ownerRef: route.id,
        feature: 'route.params',
        message: 'La Ruta requiere valores estáticos para pre-generar parámetros de path.',
      });
    }
    if (target === 'capacitor' && !route.deepLink.enabled) {
      diagnostics.push({
        code: 'MISSING_DEEP_LINK',
        severity: 'warning',
        target,
        ownerRef: route.id,
        feature: 'deepLink',
        message: 'Capacitor reutiliza el router Web; habilita deep link si la Ruta debe abrirse desde el sistema.',
      });
    }
    if (route.guards.length > 0 && (target === 'lamp-slim' || target === 'wordpress')) {
      diagnostics.push({
        code: 'TARGET_GUARD_ADAPTER_REQUIRED',
        severity: 'warning',
        target,
        ownerRef: route.id,
        feature: 'guards',
        message: 'El target requiere un adapter de guards para aplicar esta política de acceso.',
      });
    }
  }
  return Object.freeze(diagnostics.map((diagnostic) => Object.freeze(diagnostic)));
}

export function compileNavigationContract(
  source: ElectroCraftNavigationCompilerSource,
  target: ElectroCraftNavigationCompilerTarget,
): NavigationCompilerContractOutput {
  if (target === 'react-router') return compileReactRouter(source);
  if (target === 'expo-router') return compileExpoRouter(source);
  if (target === 'lamp-slim') return compileLampSlim(source);
  if (target === 'wordpress') return compileWordPress(source);
  if (target === 'capacitor') return compileCapacitor(source);
  return compileStatic(source);
}

export function createNavigationCompilerPort<TTargetOutput extends NavigationCompilerContractOutput>(
  target: TTargetOutput['target'],
): NavigationCompilerPort<TTargetOutput> {
  return Object.freeze({
    target,
    compile(source: ElectroCraftNavigationCompilerSource) {
      return compileNavigationContract(source, target) as TTargetOutput;
    },
    diagnostics(source: ElectroCraftNavigationCompilerSource) {
      return collectNavigationCompilerDiagnostics(source, target);
    },
  });
}
