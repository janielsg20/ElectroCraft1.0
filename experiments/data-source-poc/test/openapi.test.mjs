import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {discoverOpenApiOperations} from '../src/openapi.js';
const fixture=JSON.parse(await readFile(new URL('../fixtures/openapi.json',import.meta.url),'utf8'));
test('OpenAPI operation discovery finds GET and POST',()=>{const ops=discoverOpenApiOperations(fixture);assert.deepEqual(ops.map(x=>x.operationId).sort(),['createProduct','listProducts']);assert.equal(ops.find(x=>x.operationId==='createProduct').requestBody,true);});
test('OpenAPI discovery ignores non-method path fields',()=>{const ops=discoverOpenApiOperations({paths:{'/x':{parameters:[],get:{summary:'x'}}}});assert.equal(ops.length,1);assert.equal(ops[0].method,'GET');});
