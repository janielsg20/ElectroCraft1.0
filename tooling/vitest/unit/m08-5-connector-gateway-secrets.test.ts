import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import {
  createConnectorGatewayHttpHandler,
  createServerConnectorGateway,
  createServerEnvironmentSecretStore,
} from '@electrocraft/connectors';
import { createBrowserConnectorGateway, createBrowserSecretStoreAdmin } from '@electrocraft/data-web';
import {
  electroCraftDataSourceDefinitionSchema,
  electroCraftSecretRefSchema,
  resolveSecretEnvironment,
  secretEnvironmentVariableName,
} from '@electrocraft/domain';

function secretFixture() {
  return electroCraftSecretRefSchema.parse(
    JSON.parse(readFileSync(resolve('tooling/fixtures/canonical-model/secret-ref-v1.json'), 'utf8')) as unknown,
  );
}

describe('M08.5 ConnectorGateway y SecretStore', () => {
  it('writes server secrets without read-back and resolves preview through development scope', async () => {
    const ref = secretFixture();
    const environment: Record<string, string | undefined> = {};
    const store = createServerEnvironmentSecretStore({ environment, allowWrites: true });

    expect(resolveSecretEnvironment('preview')).toBe('development');
    expect(await store.status(ref, 'development')).toMatchObject({ configured: false, provider: 'server-env' });

    const status = await store.write({ ref, environment: 'development', value: 'super-secret-value' });
    expect(status).toMatchObject({ refId: ref.id, environment: 'development', configured: true });
    expect(status).not.toHaveProperty('value');
    expect(JSON.stringify(status)).not.toContain('super-secret-value');
    expect(await store.resolve(ref, 'development')).toBe('super-secret-value');
    expect(environment[secretEnvironmentVariableName(ref, 'development')]).toBe('super-secret-value');
  });

  it('injects auth only inside the server Gateway and never returns the secret', async () => {
    const ref = secretFixture();
    const environment: Record<string, string | undefined> = {};
    const store = createServerEnvironmentSecretStore({ environment, allowWrites: true });
    await store.write({ ref, environment: 'development', value: 'gateway-only-token' });

    let authorization: string | null = null;
    const upstreamFetch = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      authorization = new Headers(init?.headers).get('Authorization');
      return new Response(JSON.stringify({ id: 'p-1', name: 'Gateway product' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }) as unknown as typeof fetch;
    const gateway = createServerConnectorGateway({
      secretStore: store,
      resolveSecretRef: (refId) => (refId === ref.id ? ref : null),
      fetch: upstreamFetch,
    });

    const result = await gateway.executeRest({
      protocol: 'rest',
      sourceId: 'ec_data-source_0000000000081',
      authRef: ref.id,
      environment: 'preview',
      operation: {
        id: 'getProduct',
        label: 'Get product',
        kind: 'read',
        method: 'GET',
        path: '/products/{id}',
        requiresAuth: true,
        parameters: [],
        inputSchema: null,
        outputSchema: null,
        pagination: { kind: 'none' },
      },
      url: 'https://api.example.test/products/p-1',
      method: 'GET',
      headers: {},
      body: null,
      timeoutMs: 1000,
    });

    expect(authorization).toBe('Bearer gateway-only-token');
    expect(result).toMatchObject({ ok: true, status: 200, transport: 'gateway', data: { id: 'p-1' } });
    expect(JSON.stringify(result)).not.toContain('gateway-only-token');
  });

  it('round-trips browser Gateway and secret administration through the Web-standard HTTP handler', async () => {
    const ref = secretFixture();
    const environment: Record<string, string | undefined> = {};
    const store = createServerEnvironmentSecretStore({ environment, allowWrites: true });
    const upstreamFetch = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const body = typeof init?.body === 'string' ? (JSON.parse(init.body) as Record<string, unknown>) : {};
      if (typeof body.query === 'string') {
        return new Response(JSON.stringify({ data: { __typename: 'Query' } }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }) as unknown as typeof fetch;
    const serverGateway = createServerConnectorGateway({
      secretStore: store,
      resolveSecretRef: (refId) => (refId === ref.id ? ref : null),
      fetch: upstreamFetch,
    });
    const handler = createConnectorGatewayHttpHandler({ gateway: serverGateway, secretStore: store });
    const gatewayFetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) =>
      handler(new Request(String(input), init)),
    ) as unknown as typeof fetch;
    const browserGateway = createBrowserConnectorGateway({ baseUrl: 'https://gateway.example.test', fetch: gatewayFetch });
    const browserSecrets = createBrowserSecretStoreAdmin({ baseUrl: 'https://gateway.example.test', fetch: gatewayFetch });

    await expect(browserGateway.status()).resolves.toMatchObject({ configured: true, provider: 'electrocraft-server' });
    const writeStatus = await browserSecrets.write({ ref, environment: 'development', value: 'rotated-token' });
    expect(writeStatus).toMatchObject({ configured: true, environment: 'development' });
    expect(writeStatus).not.toHaveProperty('value');

    await expect(
      browserGateway.executeGraphQL({
        protocol: 'graphql',
        sourceId: 'ec_data-source_0000000000082',
        authRef: ref.id,
        environment: 'development',
        endpoint: 'https://graphql.example.test/graphql',
        headers: { 'Content-Type': 'application/json' },
        document: 'query ElectroCraftProbe { __typename }',
        variables: {},
        timeoutMs: 1000,
      }),
    ).resolves.toMatchObject({ ok: true, transport: 'gateway', data: { __typename: 'Query' } });

    await browserSecrets.remove(ref, 'development');
    await expect(browserSecrets.status(ref, 'development')).resolves.toMatchObject({ configured: false });
  });

  it('keeps secret material out of project config, source files and .env.example', () => {
    expect(() =>
      electroCraftDataSourceDefinitionSchema.parse({
        schemaVersion: 1,
        id: 'ec_data-source_0000000000084',
        version: 1,
        key: 'unsafe',
        label: 'Unsafe source',
        kind: 'rest',
        adapterId: 'rest.fetch',
        authRef: null,
        config: { apiKey: 'must-not-persist' },
        environmentScope: ['development'],
        environmentOverrides: {},
        schemaDiscovery: 'manual',
        capabilities: ['read'],
        metadata: {},
      }),
    ).toThrow(/secrets are not allowed/i);

    const envExample = readFileSync(resolve('.env.example'), 'utf8');
    expect(envExample).toContain('VITE_ELECTROCRAFT_CONNECTOR_GATEWAY_URL=');
    expect(envExample).not.toMatch(/Bearer\s+[A-Za-z0-9]|api[_-]?key\s*=\s*\S+/i);

    for (const path of [
      'packages/data-web/src/browser-connector-gateway.ts',
      'packages/connectors/src/server-secret-store.ts',
      'packages/connectors/src/server-connector-gateway.ts',
    ]) {
      expect(readFileSync(resolve(path), 'utf8')).not.toContain('localStorage');
    }
  });
});
