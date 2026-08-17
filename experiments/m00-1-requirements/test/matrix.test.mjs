import test from 'node:test';
import assert from 'node:assert/strict';
import { data, expectedTargets, validateMatrix } from '../scripts/validate-matrix.mjs';

test('84 requisitos tienen ownership completo',()=>assert.deepEqual(validateMatrix(),[]));
test('los nueve targets son Core y tienen exporter owner explícito',()=>{
  assert.deepEqual(data.coreTargets, expectedTargets);
  const map=new Map(data.requirements.map(r=>[r.requirement,r]));
  const ids=['R047','R048','R049','R050','R051','R052','R053','R054','R055'];
  assert.deepEqual(ids.map(id=>map.get(id).targetApplicability[0]), expectedTargets);
});
test('CMS queda subordinado a Datos y no al modelo raíz',()=>{
  const r=data.requirements.find(x=>x.requirement==='R016');
  assert.equal(r.mentalModel,'Fuentes de datos y Datos');
  assert.equal(r.phase,'F08');
});
test('Pantallas y Navegación no comparten owner canónico',()=>{
  const screen=data.requirements.find(x=>x.requirement==='R006');
  const nav=data.requirements.find(x=>x.requirement==='R010');
  assert.notEqual(screen.canonicalOwner,nav.canonicalOwner);
});
test('AI conserva Draft/Apply explícito',()=>{
  const apply=data.requirements.find(x=>x.requirement==='R042');
  const direct=data.requirements.find(x=>x.requirement==='R043');
  assert.equal(apply.phase,'F18'); assert.equal(direct.phase,'F18');
  assert.match(apply.adaptationRule,/Draft/); assert.match(direct.adaptationRule,/ningún cambio directo/);
});
