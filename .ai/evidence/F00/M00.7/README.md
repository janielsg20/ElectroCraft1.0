# F00 / M00.7 evidence — POC Native runtime

State: `COMPLETADA — GREEN`.

## Final reproducible gate
- workflow run `32078336103`;
- head `c6e05a475fa0df7fd7ba2a8138e1392bcf6df797`;
- lockfile-bootstrap `95536121263` -> SUCCESS;
- source/build `95536145137` -> SUCCESS;
- Android runtime `95536362004` -> SUCCESS;
- report-status `95539234874` -> SUCCESS.

## Source/package/build
- npm registry -> PASS;
- `npm ci` from committed lockfile -> PASS;
- exact installed versions -> PASS;
- lockfile v3 -> PASS;
- lint -> `PASS_LINT 34 source/config modules`;
- typecheck -> PASS;
- tests -> 13/13 PASS, 0 fail/skipped;
- real package resolution -> PASS;
- baseline/camera capability pruning -> PASS;
- Android target export -> PASS;
- iOS target export -> PASS without claiming Xcode/IPA on Linux;
- Android prebuild -> PASS;
- no CAMERA/RECORD_AUDIO in baseline manifest;
- x86_64 Android release APK -> PASS.

## Real Android runtime
- KVM emulator boots, installs and launches the release APK;
- UI -> `M00.7 runtime OK`;
- self-test -> SQLite=true, Drizzle=true, DataProvider=true, ZustandPersistence=true, recordCount=1;
- Refine getList path executes;
- `electrocraft://guarded` -> visible `Inicio de sesión requerido`;
- runtime evidence -> `PASS_ANDROID_NATIVE_RUNTIME`.

## Final adaptation
A previous run exposed a real Expo SQLite directory-creation race caused by concurrent automatic Zustand kv-store hydration and canonical DB startup. Accepted fix: Zustand `skipHydration: true`; `rehydrate()` occurs only after `ensureNativeSchema()`. A regression test freezes that order.

## Artifacts
- `9304563117` — `m00-7-android-runtime-evidence`, digest `sha256:ef6bcc5fe1eb7750a3731a89b5daa0c7af7c1fbe7c550cb81bb277041141f3d8`.
- `9304237635` — `m00-7-native-source-build-evidence`, digest `sha256:c7be19042662e0845bd650af2da8e157bd8a0493d2d51981836fd7c913c46f63`.
- lockfile SHA-256 `1eeb7b543cbc3876c5467fedfa21bd6d8f84466b5dbff9dd71ec340337c17882`.

No package/native result was fabricated locally; published/native truth comes from the final Actions run above.
