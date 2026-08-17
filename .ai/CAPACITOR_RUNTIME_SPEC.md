# CAPACITOR EXPORT SPEC — Core

Capacitor is a first-class export target, not a fallback label.

## Why it exists

Android/iOS Expo output is native React Native.

Capacitor offers a different valid product target:
reuse the Web runtime inside a native container and access native plugins.

ElectroCraft does not automatically prefer one.
The user chooses.

## Engine owner

Capacitor official runtime/CLI/plugins.

ElectroCraft owns:
- ExportIR mapping;
- generated Web runtime;
- capacitor config;
- capability/plugin mapping;
- permissions;
- artifact verification.

## Pipeline

1. Require green `react-web` runtime build.
2. Generate dedicated Web build profile for Capacitor.
3. Generate `capacitor.config.*`.
4. Add only used official/native plugins.
5. Add Android/iOS platforms.
6. `cap sync`.
7. Verify generated native projects.
8. Build smoke where toolchain is available.
9. Report unsupported native capabilities explicitly.

## UI

`Publicar > Exportar > Capacitor`.

Sections:
- Aplicación
- Web Runtime
- Plataformas
- Plugins
- Permisos
- Compatibilidad
- Build

No "fallback" badge.
