#!/usr/bin/env bash
set -euo pipefail

ROOT="experiments/m00-7-native-runtime"
ARTIFACTS="$ROOT/artifacts"
APK="$ROOT/android/app/build/outputs/apk/release/app-release.apk"
PACKAGE="com.electrocraft.m007"
mkdir -p "$ARTIFACTS"

capture_diagnostics() {
  adb logcat -d -v threadtime > "$ARTIFACTS/android-logcat.txt" 2>&1 || true
  adb shell dumpsys activity processes > "$ARTIFACTS/activity-processes.txt" 2>&1 || true
  adb shell dumpsys activity activities > "$ARTIFACTS/activity-activities.txt" 2>&1 || true
}
trap 'capture_diagnostics' EXIT

poll_ui() {
  local expected="$1"
  local output="$2"
  local attempts="${3:-30}"
  local i
  for ((i=1; i<=attempts; i++)); do
    adb shell uiautomator dump /sdcard/m007-ui.xml >/dev/null 2>&1 || true
    adb pull /sdcard/m007-ui.xml "$output" >/dev/null 2>&1 || true
    if [[ -f "$output" ]] && grep -Fq "$expected" "$output"; then
      return 0
    fi
    if [[ -f "$output" ]] && grep -Fq "M00.7 runtime ERROR:" "$output"; then
      echo "APP_RUNTIME_ERROR detected while waiting for: $expected" >&2
      grep -o 'M00\.7 runtime ERROR:[^<]*' "$output" | head -1 >&2 || true
      return 3
    fi
    if [[ -f "$output" ]] && grep -Fq "System UI isn't responding" "$output"; then
      echo "INFRA_SYSTEM_UI_ANR detected while waiting for: $expected" >&2
      return 2
    fi
    sleep 2
  done
  echo "Timed out waiting for UI text: $expected" >&2
  return 1
}

adb install -r "$APK"
adb shell am force-stop "$PACKAGE" || true
adb shell monkey -p "$PACKAGE" -c android.intent.category.LAUNCHER 1
poll_ui "M00.7 runtime OK" "$ARTIFACTS/m007-runtime.xml" 40

adb shell am start -W -a android.intent.action.VIEW -d 'electrocraft://guarded' "$PACKAGE"
poll_ui "Inicio de sesión requerido" "$ARTIFACTS/m007-guard.xml" 30

node "$ROOT/scripts/native-log-gate.mjs" "$ARTIFACTS/m007-runtime.xml" "$ARTIFACTS/m007-guard.xml"
capture_diagnostics
trap - EXIT
