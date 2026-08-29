import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  attachActionGraphToRoute,
  createRouteNavigateActionGraph,
  createRouteParamBinding,
  validateNavigateActionConfig,
  validateRouteParamBinding,
} from '@electrocraft/application';
import {
  electroCraftDocumentSchema,
  electroCraftExternalUrlActionConfigSchema,
  electroCraftNavigateActionConfigSchema,
  electroCraftRouteDefinitionV2Schema,
  routeParamBindingToBindingRef,
} from '@electrocraft/domain';

function fixture<T = unknown>(name: string): T {
  return JSON.parse(readFileSync(resolve(`tooling/fixtures/canonical-model/${name}.json`), 'utf8')) as T;
}

describe('M07.5 route params, deep links and navigation actions', () => {
  it('validates typed Route param bindings against the referenced Route', () => {
    const route = electroCraftRouteDefinitionV2Schema.parse(fixture('route-v2'));
    const binding = createRouteParamBinding({ route, param: 'productId' });
    expect(validateRouteParamBinding(binding, route)).toEqual([]);
    expect(routeParamBindingToBindingRef(binding)).toEqual({
      source: 'route',
      ref: route.id,
      path: ['params', 'productId'],
    });
    expect(validateRouteParamBinding({ ...binding, valueType: 'number' }, route)).toContainEqual({
      code: 'binding-type-mismatch',
      param: 'productId',
    });
  });

  it('blocks missing required params and literal type mismatches', () => {
    const route = electroCraftRouteDefinitionV2Schema.parse(fixture('route-v2'));
    const screen = electroCraftDocumentSchema.parse(fixture('screen-v4'));
    const missing = electroCraftNavigateActionConfigSchema.parse({
      schemaVersion: 1,
      action: 'navigate',
      mode: 'push',
      destination: { kind: 'route', routeRef: route.id },
      params: [],
    });
    expect(validateNavigateActionConfig({ config: missing, routes: [route], documents: [screen] })).toContainEqual({
      code: 'required-param-missing',
      param: 'productId',
    });

    const mismatch = electroCraftNavigateActionConfigSchema.parse({
      ...missing,
      params: [{ param: 'productId', value: { source: 'literal', value: 42 } }],
    });
    expect(validateNavigateActionConfig({ config: mismatch, routes: [route], documents: [screen] })).toContainEqual({
      code: 'literal-type-mismatch',
      param: 'productId',
    });
  });

  it('creates a canonical navigation ActionGraph and keeps refs stable when route labels change', () => {
    const route = electroCraftRouteDefinitionV2Schema.parse(fixture('route-v2'));
    const screen = electroCraftDocumentSchema.parse(fixture('screen-v4'));
    const config = electroCraftNavigateActionConfigSchema.parse({
      schemaVersion: 1,
      action: 'navigate',
      mode: 'replace',
      destination: { kind: 'route', routeRef: route.id },
      params: [
        { param: 'productId', value: { source: 'literal', value: 'sku-10' } },
        { param: 'preview', value: { source: 'literal', value: true } },
      ],
    });
    expect(validateNavigateActionConfig({ config, routes: [route], documents: [screen] })).toEqual([]);
    const graph = createRouteNavigateActionGraph({ sourceRoute: route, config, idSeed: 'fixture' });
    const action = graph.nodes.find(({ type }) => type === 'navigation.go');
    expect(action?.routeRefs).toContain(route.id);
    expect(action?.config).toMatchObject({ action: 'navigate', mode: 'replace' });

    const renamed = electroCraftRouteDefinitionV2Schema.parse({ ...route, name: 'Producto renombrado' });
    const attached = attachActionGraphToRoute(renamed, graph);
    expect(attached.id).toBe(route.id);
    expect(attached.actionRefs).toContain(graph.id);
    expect(action?.routeRefs).toContain(attached.id);
  });

  it('keeps deep links and external URLs explicit and rejects unsafe protocols', () => {
    const route = electroCraftRouteDefinitionV2Schema.parse(fixture('route-v2'));
    expect(route.deepLink).toMatchObject({ enabled: true, aliases: ['/p/:productId'] });
    expect(
      electroCraftExternalUrlActionConfigSchema.safeParse({
        schemaVersion: 1,
        action: 'external-url',
        url: 'javascript:alert(1)',
        mode: 'same-context',
      }).success,
    ).toBe(false);
    expect(
      electroCraftExternalUrlActionConfigSchema.safeParse({
        schemaVersion: 1,
        action: 'external-url',
        url: 'https://example.com/product?id=10',
        mode: 'new-context',
      }).success,
    ).toBe(true);
  });

  it('exposes the Spanish Route detail and real navigation action editor', () => {
    const ui = readFileSync(resolve('apps/studio/src/features/navigation/route-action-editor.tsx'), 'utf8');
    for (const label of ['Parámetros', 'Enlace profundo', 'Destino', 'Reemplazar', 'Volver', 'Abrir enlace externo']) {
      expect(ui).toContain(label);
    }
    expect(ui).toContain('routeNavigationActionRuntime.createNavigateAction');
    expect(ui).toContain('routeNavigationActionRuntime.createExternalUrlAction');
  });
});
