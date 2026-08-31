import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { ConnectorRegistry } from '@electrocraft/application';
import { createRestDataSourceAdapter, importOpenApiDocument, REST_DATA_ADAPTER_ID } from '@electrocraft/connectors';
import { electroCraftDataSourceDefinitionSchema, electroCraftRestDataSourceConfigSchema } from '@electrocraft/domain';

function fixture(name: string): unknown {
  return JSON.parse(readFileSync(resolve(`tooling/fixtures/canonical-model/${name}.json`), 'utf8')) as unknown;
}

function sourceFixture() {
  return electroCraftDataSourceDefinitionSchema.parse(fixture('rest-data-source-v1'));
}

describe('M08.3 REST API Connector y OpenAPI import', () => {
  it('imports OpenAPI/Swagger through Scalar and preserves portable operations without sensitive headers', async () => {
    const document = readFileSync(resolve('tooling/fixtures/openapi/products-v1.yaml'), 'utf8');
    const imported = await importOpenApiDocument(document);

    expect(imported.title).toBe('Product Catalog API');
    expect(imported.version).toBe('3.1.0');
    expect(imported.suggestedBaseUrl).toBe('https://api.example.test/v1');
    expect(imported.operations.map(({ id }) => id)).toEqual(['listProducts', 'createProduct', 'getProduct']);
    expect(imported.operations[0]).toMatchObject({
      method: 'GET',
      kind: 'read',
      pagination: { kind: 'page', pageParam: 'page', pageSizeParam: 'page_size' },
    });
    expect(imported.operations[1]).toMatchObject({ method: 'POST', kind: 'create', requiresAuth: true });
    expect(imported.operations[2]).toMatchObject({ method: 'GET', path: '/products/{id}', requiresAuth: true });
    expect(imported.operations.flatMap(({ parameters }) => parameters.map(({ name }) => name))).not.toContain(
      'X-Api-Key',
    );
    expect(imported.warnings.join(' ')).toContain('X-Api-Key');
  });

  it('executes typed browser GET/POST operations and normalizes pagination/results behind ConnectorRegistry', async () => {
    const calls: Array<{ url: string; method: string; body: string | null }> = [];
    const fetchImpl = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? 'GET';
      calls.push({ url, method, body: typeof init?.body === 'string' ? init.body : null });
      if (method === 'POST') {
        return new Response(JSON.stringify({ id: 'p-2', name: 'Cable USB-C' }), {
          status: 201,
          headers: { 'content-type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ items: [{ id: 'p-1', name: 'Cable USB' }] }), {
        status: 200,
        headers: { 'content-type': 'application/json', 'x-total-count': '42' },
      });
    }) as unknown as typeof fetch;

    const source = sourceFixture();
    const registry = new ConnectorRegistry();
    registry.registerAdapter(createRestDataSourceAdapter({ fetch: fetchImpl }));

    expect(registry.list()).toEqual([
      expect.objectContaining({ adapterId: REST_DATA_ADAPTER_ID, adapterRegistered: true, displayName: 'REST API' }),
    ]);
    expect(registry.validateCompatibility(source)).toEqual([]);

    await expect(
      registry.query(source, 'development', {
        resourceId: 'listProducts',
        requiredCapabilities: ['pagination'],
        input: { query: { page: 2, pageSize: 25 } },
      }),
    ).resolves.toMatchObject({
      ok: true,
      status: 200,
      transport: 'browser',
      data: { items: [{ id: 'p-1', name: 'Cable USB' }] },
      pagination: { total: 42, page: 2, pageSize: 25 },
    });

    await expect(
      registry.mutate(source, 'development', {
        resourceId: 'createProduct',
        operation: 'create',
        input: { body: { name: 'Cable USB-C' } },
      }),
    ).resolves.toMatchObject({ ok: true, status: 201, transport: 'browser', data: { id: 'p-2' } });

    expect(calls[0]?.url).toBe('https://api.example.test/products?page=2&pageSize=25');
    expect(calls[1]).toMatchObject({ url: 'https://api.example.test/products', method: 'POST' });
    expect(JSON.parse(calls[1]?.body ?? '{}')).toEqual({ name: 'Cable USB-C' });
  });

  it('fails closed for missing authRef and routes authenticated execution through ConnectorGateway', async () => {
    const source = sourceFixture();
    const browserFetch = vi.fn(async () => new Response('{}', { status: 200 })) as unknown as typeof fetch;
    const registry = new ConnectorRegistry();
    registry.registerAdapter(createRestDataSourceAdapter({ fetch: browserFetch }));

    await expect(
      registry.query(source, 'development', {
        resourceId: 'getProduct',
        input: { path: { id: 'p-1' } },
      }),
    ).rejects.toMatchObject({ code: 'AUTH_REF_MISSING' });

    const gatewayExecute = vi.fn(async () => ({
      ok: true,
      status: 200,
      data: { id: 'p-1', name: 'Gateway product' },
      pagination: null,
      error: null,
      transport: 'gateway' as const,
    }));
    const secured = electroCraftDataSourceDefinitionSchema.parse({
      ...source,
      authRef: 'ec_secret_0000000000083',
      config: { ...source.config, executionMode: 'gateway' },
    });
    const gatewayRegistry = new ConnectorRegistry();
    gatewayRegistry.registerAdapter(
      createRestDataSourceAdapter({
        fetch: browserFetch,
        gateway: { execute: gatewayExecute },
      }),
    );

    await expect(
      gatewayRegistry.query(secured, 'development', {
        resourceId: 'getProduct',
        input: { path: { id: 'p-1' } },
      }),
    ).resolves.toMatchObject({ ok: true, status: 200, transport: 'gateway', data: { id: 'p-1' } });

    expect(browserFetch).not.toHaveBeenCalled();
    expect(gatewayExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        authRef: 'ec_secret_0000000000083',
        method: 'GET',
        url: 'https://api.example.test/products/p-1',
      }),
    );
  });

  it('normalizes 4xx/5xx and timeout while blocking secret-like headers in source config', async () => {
    const source = sourceFixture();
    const responseFetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'bad request' }), {
          status: 400,
          headers: { 'content-type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(new Response('upstream failed', { status: 503 }));
    const registry = new ConnectorRegistry();
    registry.registerAdapter(createRestDataSourceAdapter({ fetch: responseFetch as unknown as typeof fetch }));

    await expect(registry.query(source, 'development', { resourceId: 'listProducts' })).resolves.toMatchObject({
      ok: false,
      status: 400,
      error: { code: 'HTTP_4XX' },
    });
    await expect(registry.query(source, 'development', { resourceId: 'listProducts' })).resolves.toMatchObject({
      ok: false,
      status: 503,
      error: { code: 'HTTP_5XX' },
    });

    const timeoutFetch = vi.fn(
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), {
            once: true,
          });
        }),
    ) as unknown as typeof fetch;
    const timeoutSource = electroCraftDataSourceDefinitionSchema.parse({
      ...source,
      config: { ...source.config, timeoutMs: 100 },
    });
    const timeoutRegistry = new ConnectorRegistry();
    timeoutRegistry.registerAdapter(createRestDataSourceAdapter({ fetch: timeoutFetch }));

    await expect(
      timeoutRegistry.query(timeoutSource, 'development', { resourceId: 'listProducts' }),
    ).resolves.toMatchObject({
      ok: false,
      status: null,
      error: { code: 'TIMEOUT' },
    });

    expect(() =>
      electroCraftRestDataSourceConfigSchema.parse({
        ...source.config,
        defaultHeaders: { Authorization: 'Bearer forbidden' },
      }),
    ).toThrow(/sensitive authentication headers/i);
  });

  it('exposes the six-step Spanish REST wizard and registers the real adapter in Studio', () => {
    const wizard = readFileSync(resolve('apps/studio/src/features/data/rest-source-wizard.tsx'), 'utf8');
    const registration = readFileSync(resolve('apps/studio/src/features/data/studio-data-source-adapters.ts'), 'utf8');
    const workspace = readFileSync(resolve('apps/studio/src/features/data/data-sources-workspace.tsx'), 'utf8');

    for (const copy of [
      'Endpoint base',
      'Autenticación',
      'OpenAPI / Manual',
      'Operaciones',
      'Probar solicitud',
      'Guardar fuente',
      'Importar OpenAPI',
      'SecretRef',
      'ConnectorGateway',
    ]) {
      expect(wizard).toContain(copy);
    }
    expect(wizard).not.toMatch(/bearerToken|apiKey\s*[:=]|password\s*[:=]/i);
    expect(registration).toContain('createRestDataSourceAdapter');
    expect(registration).toContain('REST_DATA_ADAPTER_ID');
    expect(workspace).toContain('RestSourceWizardSheet');
  });
});
