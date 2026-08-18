// @ts-check
import { isSecretRef } from './secret-ref.js';

/** @typedef {'direct'|'gateway'} RouteMode */
/** @typedef {{mode:RouteMode,reason:'direct-safe'|'secret-ref'|'cors-restricted'|'forced-gateway'}} RouteDecision */
/** @typedef {{authRef?:unknown,cors?:'direct-safe'|'restricted'|'unknown',forceGateway?:boolean}} RoutePolicyInput */

/** @param {RoutePolicyInput} input @returns {RouteDecision} */
export function chooseRoute(input) {
  if (input.forceGateway) return { mode: 'gateway', reason: 'forced-gateway' };
  if (isSecretRef(input.authRef)) return { mode: 'gateway', reason: 'secret-ref' };
  if (input.cors === 'restricted') return { mode: 'gateway', reason: 'cors-restricted' };
  return { mode: 'direct', reason: 'direct-safe' };
}
