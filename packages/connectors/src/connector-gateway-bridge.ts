import type {
  ConnectorGatewayPort,
  DataSourceAdapterContext,
  DataSourceConnectionResult,
} from '@electrocraft/application';
import type { ElectroCraftGraphQLDataSourceConfig, ElectroCraftRestDataSourceConfig } from '@electrocraft/domain';
import type { GraphQLGatewayExecutionRequest, GraphQLGatewayPort } from './graphql-data-source-adapter';
import type { RestGatewayExecutionRequest, RestGatewayPort } from './rest-data-source-adapter';

export function createRestGatewayBridge(gateway: Pick<ConnectorGatewayPort, 'executeRest'>): RestGatewayPort {
  return Object.freeze({
    execute(request: RestGatewayExecutionRequest) {
      return gateway.executeRest({ protocol: 'rest', ...request });
    },
    async testConnection(
      context: DataSourceAdapterContext,
      config: ElectroCraftRestDataSourceConfig,
    ): Promise<DataSourceConnectionResult> {
      const base = config.baseUrl.replace(/\/+$/, '');
      const result = await gateway.executeRest({
        protocol: 'rest',
        sourceId: context.source.id,
        authRef: context.source.authRef,
        environment: context.environment,
        operation: {
          id: 'connection-probe',
          label: 'Probar conexión',
          kind: 'read',
          method: 'GET',
          path: '/',
          requiresAuth: Boolean(context.source.authRef),
          parameters: [],
          inputSchema: null,
          outputSchema: null,
          pagination: { kind: 'none' },
        },
        url: `${base}/`,
        method: 'GET',
        headers: config.defaultHeaders,
        body: null,
        timeoutMs: config.timeoutMs,
      });
      return Object.freeze({
        ok: result.ok,
        message: result.ok
          ? 'REST API disponible mediante Gateway.'
          : (result.error?.message ?? 'REST API no disponible.'),
      });
    },
  });
}

export function createGraphQLGatewayBridge(gateway: Pick<ConnectorGatewayPort, 'executeGraphQL'>): GraphQLGatewayPort {
  return Object.freeze({
    execute(request: GraphQLGatewayExecutionRequest) {
      return gateway.executeGraphQL({ protocol: 'graphql', ...request });
    },
    async testConnection(
      context: DataSourceAdapterContext,
      config: ElectroCraftGraphQLDataSourceConfig,
    ): Promise<DataSourceConnectionResult> {
      const result = await gateway.executeGraphQL({
        protocol: 'graphql',
        sourceId: context.source.id,
        authRef: context.source.authRef,
        environment: context.environment,
        endpoint: config.endpoint,
        headers: Object.freeze({ 'Content-Type': 'application/json', ...config.defaultHeaders }),
        document: 'query ElectroCraftProbe { __typename }',
        variables: {},
        timeoutMs: config.timeoutMs,
      });
      return Object.freeze({
        ok: result.ok,
        message: result.ok
          ? 'GraphQL disponible mediante Gateway.'
          : (result.error?.message ?? 'GraphQL no disponible.'),
      });
    },
  });
}
