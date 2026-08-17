import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const build = JSON.parse(await readFile(new URL('../artifacts/build-summary.json', import.meta.url), 'utf8'));
const config = JSON.parse(await readFile(new URL('../artifacts/capability-pruning.json', import.meta.url), 'utf8'));
assert.equal(build.status, 'PASS_EXPO_TARGET_EXPORTS');
assert.equal(config.status, 'PASS_CONFIG_PRUNING');
console.log(JSON.stringify({ status: 'PASS_SOURCE_BUILD_GATE', expoTargetExports: true, capabilityPruning: true, nativeDeviceRuntime: 'required-in-android-runtime-job' }));
