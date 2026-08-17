import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
const manifest = await readFile(new URL('../android/app/src/main/AndroidManifest.xml', import.meta.url), 'utf8');
assert.doesNotMatch(manifest, /android\.permission\.CAMERA/);
assert.doesNotMatch(manifest, /android\.permission\.RECORD_AUDIO/);
const result = { status: 'PASS_ANDROID_PREBUILD_PRUNING', package: 'com.electrocraft.m007', cameraPermission: false, recordAudioPermission: false };
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/android-prebuild-summary.json', import.meta.url), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result));
