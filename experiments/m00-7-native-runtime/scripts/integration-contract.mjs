import assert from 'node:assert/strict';
const required = ['@refinedev/core','drizzle-orm/expo-sqlite','expo-router','expo-sqlite','expo-sqlite/kv-store','zustand','zustand/middleware'];
for (const specifier of required) {
  const resolved = import.meta.resolve(specifier);
  assert.ok(resolved.startsWith('file:'), `${specifier} must resolve to installed package source`);
}
console.log(JSON.stringify({ status: 'PASS_REAL_PACKAGE_RESOLUTION', required }));
