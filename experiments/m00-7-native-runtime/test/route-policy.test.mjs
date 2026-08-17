import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeElectroCraftDeepLink, resolveNativeRoute } from '../src/navigation/route-policy.mjs';

test('deep link normalizes guarded route', () => {
  assert.equal(normalizeElectroCraftDeepLink('electrocraft://guarded'), '/guarded');
});
test('guard fails closed to signin when unauthenticated', () => {
  assert.deepEqual(resolveNativeRoute({ path: '/guarded', authenticated: false }), { state: 'redirect', href: '/signin' });
});
test('guard allows route when authenticated', () => {
  assert.deepEqual(resolveNativeRoute({ path: '/guarded', authenticated: true }), { state: 'ready', href: '/guarded' });
});
test('unknown route is blocked', () => {
  assert.deepEqual(resolveNativeRoute({ path: '/not-real', authenticated: true }), { state: 'blocked', href: '/' });
});
test('foreign deep-link scheme is rejected', () => {
  assert.throws(() => normalizeElectroCraftDeepLink('https://example.com/guarded'), /Unsupported deep-link scheme/);
});
