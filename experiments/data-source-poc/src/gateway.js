// @ts-check
import { isSecretRef } from './secret-ref.js';

/** @typedef {{resolve:(id:string)=>Promise<string>|string}} SecretResolver */
/** @typedef {{sourceId:string,targetUrl:string,authRef:import('./secret-ref.js').SecretRef,request:{method:string,headers?:Record<string,string>,body?:string}}} GatewayEnvelope */

/**
 * Server-only gateway executor. The client sends only SecretRef; resolution happens here.
 * @param {GatewayEnvelope} envelope
 * @param {{secretResolver:SecretResolver,fetchImpl?:typeof fetch}} deps
 */
export async function executeGateway(envelope, deps) {
  if (!isSecretRef(envelope.authRef)) throw new Error('Gateway requires a valid SecretRef.');
  const secret = await deps.secretResolver.resolve(envelope.authRef.secretRef);
  if (!secret) throw new Error('SecretRef could not be resolved.');
  const fetchImpl = deps.fetchImpl ?? fetch;
  const headers = { ...(envelope.request.headers ?? {}), authorization:`Bearer ${secret}` };
  return fetchImpl(envelope.targetUrl,{ method:envelope.request.method, headers, body:envelope.request.body });
}

/** @param {GatewayEnvelope} envelope */
export function sanitizeGatewayEnvelope(envelope) {
  return { sourceId:envelope.sourceId, targetUrl:envelope.targetUrl, authRef:envelope.authRef, request:{...envelope.request,headers:{...(envelope.request.headers??{}),authorization:undefined}} };
}
