import type {
  ElectroCraftDataOperationDefinition,
  ElectroCraftDataSourceEnvironment,
  ElectroCraftGraphQLDataResult,
  ElectroCraftRestDataResult,
  ElectroCraftRestMethod,
  JsonValue,
} from '@electrocraft/domain';

export interface ConnectorGatewayStatus {
  readonly configured: boolean;
  readonly provider: string;
  readonly message: string;
}

interface ConnectorGatewayExecutionBase {
  readonly sourceId: string;
  readonly authRef: string | null;
  readonly environment: ElectroCraftDataSourceEnvironment;
  readonly headers: Readonly<Record<string, string>>;
  readonly timeoutMs: number;
}

export interface ConnectorGatewayRestExecutionRequest extends ConnectorGatewayExecutionBase {
  readonly protocol: 'rest';
  readonly operation: ElectroCraftDataOperationDefinition;
  readonly url: string;
  readonly method: ElectroCraftRestMethod;
  readonly body: JsonValue | null;
}

export interface ConnectorGatewayGraphQLExecutionRequest extends ConnectorGatewayExecutionBase {
  readonly protocol: 'graphql';
  readonly endpoint: string;
  readonly document: string;
  readonly variables: Readonly<Record<string, JsonValue>>;
}

export interface ConnectorGatewayPort {
  status(): Promise<ConnectorGatewayStatus>;
  executeRest(request: ConnectorGatewayRestExecutionRequest): Promise<ElectroCraftRestDataResult>;
  executeGraphQL(request: ConnectorGatewayGraphQLExecutionRequest): Promise<ElectroCraftGraphQLDataResult>;
}
