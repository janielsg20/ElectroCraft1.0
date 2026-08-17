# F00 / M00.7 evidence — POC Native runtime

State: `IN_PROGRESS — local contract/config gates GREEN; package/native CI pending`.

## Local gates
- lint -> PASS, 34 source/config modules.
- tests -> PASS, 13/13.
- capability pruning fixture -> `PASS_CONFIG_PRUNING`.

## Mandatory CI gates
- npm registry and exact version/lock verification;
- TypeScript over real installed APIs;
- Expo Android/iOS target exports;
- Android `expo prebuild`;
- sensitive-permission pruning from generated AndroidManifest;
- Android release APK;
- emulator-visible `M00.7 runtime OK` from real Expo SQLite + Drizzle + DataProvider + Zustand persistence;
- deep-link guard dump containing `Inicio de sesión requerido`;
- source/build/runtime artifacts.

The local execution container cannot install npm dependencies, so package/native results are not marked PASS locally.
