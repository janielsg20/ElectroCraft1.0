import { gatewayRequestSchema, type GatewayRequest } from "../shared/contracts.js";

export function createClientGatewayRequest(input: GatewayRequest): GatewayRequest {
  return gatewayRequestSchema.parse(input);
}
