# ADR-0007 — M00.7 Native runtime POC

Status: `PROVISIONAL — LOCAL CONTRACT GREEN; PUBLISHED/NATIVE CI PENDING`
Date: 2026-08-17
Owner: F00 / M00.7

## Decision under test
ElectroCraft Native keeps one canonical project/data model and maps it into the official Expo/React Native runtime. Expo Router owns native route mechanics; Expo SQLite owns local SQLite; Drizzle owns typed schema/query; Zustand owns declared JS runtime state/persist middleware; Refine Core remains headless administration/data-hook orchestration. ElectroCraft only supplies canonical adapters, route policy, capability pruning and target diagnostics.

## Candidate pinned baseline
- Expo SDK `57.0.9` (MIT)
- Expo Router `57.0.9` (MIT)
- Expo SQLite `57.0.1` (MIT)
- Expo Constants `57.0.8` (MIT)
- Expo Linking `57.0.4` (MIT)
- React `19.2.3`
- React DOM `19.2.3` only as Refine Core peer-resolution compatibility; no DOM renderer/table is used by the Native POC.
- React Native `0.86.2` (MIT)
- React Native Reanimated `4.5.1` and React Native Worklets `0.10.1`, explicitly pinned to the Expo SDK 57 bundled-native-module baseline so npm optional-peer resolution cannot float them independently.
- react-native-safe-area-context `5.7.0` (MIT)
- react-native-screens `4.26.0` (MIT)
- Drizzle ORM `0.45.2` (Apache-2.0)
- Zustand `5.0.14` (MIT)
- Refine Core `5.0.12` (MIT)

Npm-published package versions are the runtime source of truth. Expo SDK 57 `bundledNativeModules.json` is the compatibility source for React/React Native/Reanimated/Worklets pairings. The Expo `sdk-57` source branch can contain later Expo patch metadata, so source-branch package versions are API provenance rather than proof that a later patch is the chosen runtime pin.

## POC surface
- stable Expo Router `<Stack />`;
- standard JS `<Tabs />` only in `(tabs)` test group;
- no `unstable-native-tabs` and no direct `@react-navigation/*` imports;
- generic SQLite tables: `content_records`, `relation_edges`, `record_field_index`;
- Drizzle over `expo-sqlite`;
- native `Container/Text/Button/List` mapping;
- Zustand persist via `expo-sqlite/kv-store`;
- Refine Core `useList` / `useCreate` on custom native `ElectroCraftDataProvider`;
- fail-closed deep-link/guard policy;
- permission-free sensitive-capability baseline, with camera as capability-pruning fixture only.

## Capability pruning
The baseline does not install `expo-camera` and must not produce CAMERA or RECORD_AUDIO. The camera fixture declares `expo-camera@57.0.3` only when requested, adds the camera config plugin and only `android.permission.CAMERA`; record-audio behavior is disabled.

## Closure gate
M00.7 remains open until Actions proves exact installed/locked graph, strict TS and tests, Android+iOS target exports, Android prebuild without sensitive baseline permissions, Android binary, real Android Expo SQLite+Drizzle round-trip, persisted Zustand via SQLite kv-store, Refine DataProvider path, guarded deep link redirect and evidence without claiming an iOS Xcode binary on Linux.
