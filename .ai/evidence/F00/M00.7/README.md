# F00 / M00.7 evidence — POC Native runtime

State: `IN_PROGRESS — source/build GREEN; final KVM Android runtime gate pending`.

## Local gates
- lint -> PASS, 34 source/config modules.
- tests -> PASS, 13/13.
- capability pruning fixture -> `PASS_CONFIG_PRUNING`.

## Package/source/build evidence already GREEN
- real npm dependency resolution -> PASS after aligning Refine peer `react-dom@19.2.3` with Expo React `19.2.3`;
- Expo SDK 57 Reanimated/Worklets pair pinned to `4.5.1` / `0.10.1` -> PASS;
- exact installed versions -> PASS;
- lockfile v3 -> PASS;
- TypeScript over real installed APIs -> PASS;
- tests -> 13/13 PASS;
- real package resolution -> PASS;
- Android target export -> PASS;
- iOS target export -> PASS without claiming an Xcode/IPA build on Linux;
- Android prebuild -> PASS;
- generated AndroidManifest sensitive-permission pruning -> PASS, no CAMERA/RECORD_AUDIO;
- x86_64 Android release APK -> PASS.

## Runtime harness adaptations
- An early emulator run failed only because `android-emulator-runner` executed script lines independently and a `cd` did not persist; paths were made explicit.
- The next software-emulated Linux run installed and launched the APK but produced `System UI isn't responding`; artifact `9303452724` proves the overlay belonged to package `android`, not ElectroCraft.
- The official `ReactiveCircus/android-emulator-runner` guidance requires enabling `/dev/kvm` permissions on `ubuntu-latest` for hardware acceleration. The final gate now enables KVM explicitly and fails distinctly on infrastructure System UI ANR.

## Reproducibility
- `experiments/m00-7-native-runtime/package-lock.json` is committed in `cbc9bb3fb41848ecf64af0be90c1f974fcd40b96`.
- Final source/build and Android jobs install only with `npm ci` from the committed lockfile.

## Remaining mandatory closure gate
- emulator-visible `M00.7 runtime OK` from real Expo SQLite + Drizzle + DataProvider + Zustand persistence;
- guarded deep link `electrocraft://guarded` -> visible `Inicio de sesión requerido`;
- Android runtime diagnostics/artifact;
- final auditable commit status = success.

The local execution container cannot install npm dependencies, so package/native results are never fabricated locally.
