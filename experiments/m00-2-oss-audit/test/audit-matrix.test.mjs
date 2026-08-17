import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const audit = JSON.parse(readFileSync(new URL('../engine-audit.json', import.meta.url), 'utf8'));
const by = Object.fromEntries(audit.engines.map((engine) => [engine.id, engine]));
const required = ['puck','shadcn-radix','ai-elements','i18next','react-i18next','pglite','drizzle','refine','tanstack-query','tanstack-table','rhf','zod','rqb','rete','tiptap','zustand','ai-sdk','ai-sdk-google','google-genai','gemini-interactions','gemini-images','expo','expo-router','expo-sqlite','lucide','echarts','victory-native','fullcalendar','rn-calendars','dnd-kit'];

test('all 30 approved engine decisions have one audited owner', () => {
  assert.equal(audit.engines.length, 30);
  const ids = new Set(audit.engines.map((engine) => engine.id));
  for (const id of required) assert.ok(ids.has(id), `missing ${id}`);
});

test('every engine records API, stability, license, targets, boundary and primary sources', () => {
  for (const engine of audit.engines) {
    assert.ok(engine.responsibility);
    assert.ok(engine.publicApis.length);
    assert.ok(engine.stability);
    assert.ok(engine.license);
    assert.ok(engine.targets.length);
    assert.ok(engine.boundary);
    assert.ok(engine.sources.length);
    assert.ok(engine.sources.every((source) => /^https:\/\//.test(source)));
  }
});

test('nine Core targets remain exact and equal-status', () => {
  assert.deepEqual(audit.coreTargets, ['local-project','react-web','static-web','pwa','android-expo','ios-expo','capacitor','lamp','wordpress']);
});

test('single-owner guardrails prohibit parallel subsystem engines', () => {
  assert.match(by['tanstack-query'].boundary, /segundo query cache/i);
  assert.match(by.refine.boundary, /no posee query cache/i);
  assert.match(by.rhf.boundary, /form-state engine paralelo/i);
  assert.match(by.rete.boundary, /Rete posee graph editing\/processing/i);
  assert.match(by.tiptap.boundary, /único formato rich-text/i);
  assert.match(by.zustand.boundary, /No usar Zustand como query-cache ni base de datos/i);
});

test('2026 upstream corrections are frozen instead of following defaults blindly', () => {
  assert.match(by['shadcn-radix'].stability, /Base UI.*default.*Radix.*supported/i);
  assert.match(by['gemini-interactions'].stability, /GA.*v1/i);
  assert.match(by['tanstack-table'].stability, /v8.*stable.*v9.*beta/i);
  assert.match(by['dnd-kit'].stability, /transition/i);
  assert.match(by['expo-sqlite'].stability, /web support is alpha/i);
});

test('Puck and AI ownership stay separated', () => {
  assert.match(by.puck.boundary, /Puck AI no es la arquitectura AI/i);
  assert.match(by['ai-sdk'].boundary, /Draft.*Apply/i);
  assert.match(by['google-genai'].boundary, /secret refs/i);
});
