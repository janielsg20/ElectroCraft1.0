# ADR-0007 — M00.7 Native runtime POC

Status: `ACCEPTED — GREEN`
Date: 2026-08-17
Owner: F00 / M00.7

## Decision
ElectroCraft Native keeps one canonical project/data model and maps it into the official Expo/React Native runtime. Expo Router owns native route mechanics; Expo SQLite owns local SQLite; Drizzle owns typed schema/query; Zustand owns declared JS runtime state/persist middleware; Refine Core remains headless administration/data-hook orchestration. ElectroCraft supplies canonical adapters, route policy, capability pruning and target diagnostics.

## Accepted pinned baseline
- Expo SDK `57.0.9`
- Expo Router `57.0.9`
- Expo SQLite `57.0.1`
- Expo Constants `57.0.8`
- Expo Linking `57.0.4`
- React / React DOM `19.2.3`
- React Native `0.86.2`
- React Native Reanimated `4.5.1`
- React Native Worklets `0.10.1`
- react-native-safe-area-context `5.7.0`
- react-native-screens `4.26.0`
- Drizzle ORM `0.45.2`
- Zustand `5.0.14`
- Refine Core `5.0.12`

React DOM is present only to satisfy Refine Core peer resolution; no DOM renderer/table is used by the Native POC.

## Accepted surface
- stable Expo Router `<Stack />`;
- standard JS `<Tabs />` only in test group;
- no `unstable-native-tabs` and no direct `@react-navigation/*` imports;
- generic SQLite tables `content_records`, `relation_edges`, `record_field_index`;
- Drizzle over Expo SQLite;
- native `Container/Text/Button/List` mapping;
- Zustand persist via `expo-sqlite/kv-store`;
- Refine Core native DataProvider path;
- fail-closed deep-link/guard policy;
- permission-free sensitive-capability baseline.

## Runtime adaptation frozen
Initial parallel SQLite opens exposed a native directory-creation race: automatic Zustand hydration could open the kv-store while the canonical DB was creating the same Expo SQLite directory. The accepted integration uses `skipHydration: true` and explicitly calls `rehydrate()` only after `ensureNativeSchema()`. This preserves Zustand ownership and Expo SQLite storage without a custom persistence engine.

## Closure evidence
- GitHub Actions final run `32078336103` on `c6e05a475fa0df7fd7ba2a8138e1392bcf6df797`: SUCCESS.
- 13/13 tests, typecheck and locked package graph: PASS.
- Android/iOS target exports: PASS; no iOS Xcode binary claimed on Linux.
- Android prebuild sensitive-permission pruning: PASS.
- Android x86_64 release APK: PASS.
- KVM emulator real runtime: `PASS_ANDROID_NATIVE_RUNTIME`.
- Visible `M00.7 runtime OK`, `PASS_NATIVE_RUNTIME`, recordCount 1.
- Deep link `electrocraft://guarded` -> `Inicio de sesión requerido`.
- Android artifact `9304563117`, source/build artifact `9304237635`.

M00.7 is closed. M00.8 may proceed.
