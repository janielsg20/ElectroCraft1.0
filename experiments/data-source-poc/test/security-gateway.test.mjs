import test from 'node:test';import assert from 'node:assert/strict';
import {assertSecretFreeConfig,chooseRoute,executeGateway,secretRef} from '../src/index.js';
test('SecretRef is allowed but secret value config is rejected',()=>{assert.doesNotThrow(()=>assertSecretFreeConfig({authRef:secretRef('prod.api')}));assert.throws(()=>assertSecretFreeConfig({apiKey:'literal-secret'}),/forbidden/);});
test('SecretRef requires Gateway',()=>{assert.deepEqual(chooseRoute({authRef:secretRef('prod.api')}),{mode:'gateway',reason:'secret-ref'});});
test('CORS direct-safe remains direct',()=>{assert.equal(chooseRoute({cors:'direct-safe'}).mode,'direct');});
test('CORS restricted requires Gateway',()=>{assert.equal(chooseRoute({cors:'restricted'}).mode,'gateway');});
test('Forced Gateway wins',()=>{assert.equal(chooseRoute({forceGateway:true,cors:'direct-safe'}).reason,'forced-gateway');});
test('Gateway resolves secret server-side and does not require secret in client envelope',async()=>{let seenAuth='';const envelope={sourceId:'s',targetUrl:'http://upstream',authRef:secretRef('prod.api'),request:{method:'GET'}};const response=await executeGateway(envelope,{secretResolver:{resolve:id=>id==='prod.api'?'VALUE_ONLY_ON_SERVER':''},fetchImpl:async(_u,init)=>{seenAuth=init.headers.authorization;return Response.json({ok:true});}});assert.equal(seenAuth,'Bearer VALUE_ONLY_ON_SERVER');assert.equal(JSON.stringify(envelope).includes('VALUE_ONLY_ON_SERVER'),false);assert.equal((await response.json()).ok,true);});
