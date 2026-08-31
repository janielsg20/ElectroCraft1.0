import type { ConnectorGatewayPort, SecretStorePort } from '@electrocraft/application';
import { electroCraftSecretEnvironmentSchema, electroCraftSecretRefSchema } from '@electrocraft/domain';

export interface ConnectorGatewayHttpHandlerOptions {
  readonly gateway: ConnectorGatewayPort;
  readonly secretStore: SecretStorePort;
}

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { 'content-type': 'application/json; charset=utf-8', ...(init?.headers ?? {}) },
  });
}

function errorResponse(error: unknown) {
  const code =
    error && typeof error === 'object' && 'code' in error && typeof error.code === 'string'
      ? error.code
      : 'GATEWAY_REQUEST_FAILED';
  const message = error instanceof Error ? error.message : 'La solicitud al Gateway falló.';
  return json({ error: { code, message } }, { status: 400 });
}

async function bodyObject(request: Request) {
  const value: unknown = await request.json();
  if (!value || Array.isArray(value) || typeof value !== 'object') throw new TypeError('El body debe ser un objeto JSON.');
  return value as Record<string, unknown>;
}

export function createConnectorGatewayHttpHandler(options: ConnectorGatewayHttpHandlerOptions) {
  return async function handleConnectorGatewayRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);
    try {
      if (request.method === 'GET' && url.pathname.endsWith('/status')) {
        return json(await options.gateway.status());
      }

      if (request.method === 'POST' && url.pathname.endsWith('/execute')) {
        const body = await bodyObject(request);
        if (body.protocol === 'rest') {
          return json(await options.gateway.executeRest(body as never));
        }
        if (body.protocol === 'graphql') {
          return json(await options.gateway.executeGraphQL(body as never));
        }
        return json({ error: { code: 'GATEWAY_PROTOCOL_INVALID', message: 'Protocolo de Gateway inválido.' } }, { status: 400 });
      }

      if (request.method === 'POST' && url.pathname.endsWith('/secrets/write')) {
        const body = await bodyObject(request);
        const ref = electroCraftSecretRefSchema.parse(body.ref);
        const environment = electroCraftSecretEnvironmentSchema.parse(body.environment);
        if (typeof body.value !== 'string' || !body.value.trim()) throw new TypeError('El valor secreto no puede estar vacío.');
        return json(await options.secretStore.write({ ref, environment, value: body.value }));
      }

      if (request.method === 'POST' && url.pathname.endsWith('/secrets/status')) {
        const body = await bodyObject(request);
        const ref = electroCraftSecretRefSchema.parse(body.ref);
        const environment = electroCraftSecretEnvironmentSchema.parse(body.environment);
        return json(await options.secretStore.status(ref, environment));
      }

      if (request.method === 'POST' && url.pathname.endsWith('/secrets/remove')) {
        const body = await bodyObject(request);
        const ref = electroCraftSecretRefSchema.parse(body.ref);
        const environment = electroCraftSecretEnvironmentSchema.parse(body.environment);
        await options.secretStore.remove(ref, environment);
        return json({ ok: true });
      }

      return json({ error: { code: 'GATEWAY_ROUTE_NOT_FOUND', message: 'Ruta de Gateway no encontrada.' } }, { status: 404 });
    } catch (error) {
      return errorResponse(error);
    }
  };
}
