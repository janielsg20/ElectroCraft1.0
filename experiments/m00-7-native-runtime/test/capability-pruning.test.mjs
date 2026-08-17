import test from 'node:test';
import assert from 'node:assert/strict';
import { CAMERA_PACKAGE, resolveNativeCapabilities } from '../src/capabilities/native-config.mjs';

test('permission-free baseline prunes camera package and permission', () => {
  assert.deepEqual(resolveNativeCapabilities([]), { dependencies: {}, plugins: [], sensitivePermissions: [] });
});
test('camera capability adds only camera package/plugin/permission', () => {
  const result = resolveNativeCapabilities(['camera']);
  assert.equal(result.dependencies['expo-camera'], CAMERA_PACKAGE);
  assert.deepEqual(result.sensitivePermissions, ['android.permission.CAMERA']);
  assert.equal(result.plugins[0][0], 'expo-camera');
  assert.equal(result.plugins[0][1].recordAudioAndroid, false);
});
test('unsupported capability fails closed', () => {
  assert.throws(() => resolveNativeCapabilities(['bluetooth-unknown']), /Unsupported native capability/);
});
