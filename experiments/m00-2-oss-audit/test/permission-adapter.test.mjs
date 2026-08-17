import test from 'node:test';
import assert from 'node:assert/strict';
import { authorize, canonicalActions, createPermissionAdapter } from '../src/permission-adapter.mjs';

test('allow when canonical role and engine both allow', () => {
  assert.deepEqual(authorize({action:'edit',roleAllows:true,engineAllows:true,secretRef:'secret:gemini.primary'}), {allowed:true,action:'edit',reason:'allowed'});
});
test('role deny is authoritative', () => assert.equal(authorize({action:'delete',roleAllows:false,engineAllows:true}).reason, 'role-deny'));
test('engine deny is authoritative', () => assert.equal(authorize({action:'insert',roleAllows:true,engineAllows:false}).reason, 'engine-deny'));
test('unknown actions default deny', () => assert.equal(authorize({action:'admin-everything',roleAllows:true,engineAllows:true}).reason, 'unknown-action'));
test('raw secrets and invalid SecretRefs are rejected', () => {
  assert.equal(authorize({action:'execute',roleAllows:true,engineAllows:true,payload:{apiKey:'raw'}}).reason, 'raw-secret-rejected');
  assert.equal(authorize({action:'execute',roleAllows:true,engineAllows:true,secretRef:'raw-key'}).reason, 'invalid-secret-ref');
});
test('unsafe prototype keys are rejected', () => {
  const unsafe = JSON.parse('{"__proto__":{"polluted":true}}');
  assert.equal(authorize({action:'edit',roleAllows:true,engineAllows:true,payload:unsafe}).reason, 'unsafe-payload-key');
});
test('canonical action surface stays narrow', () => assert.deepEqual(canonicalActions, ['view','edit','delete','insert','execute']));
test('policy adapter strips secret fields before evaluation', async () => {
  let seen;
  const adapter = createPermissionAdapter({can: ({context}) => { seen=context; return true; }});
  assert.equal((await adapter.decide('view','screen',{apiKey:'x',nested:{token:'y',safe:1}})).allowed, true);
  assert.equal(seen.apiKey, undefined); assert.equal(seen.nested.token, undefined); assert.equal(seen.nested.safe, 1);
});
test('policy exceptions fail closed', async () => {
  const adapter = createPermissionAdapter({can: () => { throw new Error('policy failure'); }});
  assert.deepEqual(await adapter.decide('edit','screen'), {allowed:false,reason:'policy-error'});
});
