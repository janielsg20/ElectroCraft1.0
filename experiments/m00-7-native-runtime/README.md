# M00.7 — POC Native runtime

Experimento aislado de F00. No crea una ruta ni UI de producto.

## Ownership
- Expo SDK / React Native: runtime nativo.
- Expo Router: Stack y Tabs JS de prueba; `unstable-native-tabs` está prohibido.
- Expo SQLite: SQLite persistente y `expo-sqlite/kv-store`.
- Drizzle: schema/query adapter sobre Expo SQLite.
- Zustand persist: estado JS declarado, con storage SQLite.
- Refine Core: administración headless sobre `ElectroCraftDataProvider`; UI React Native, nunca tabla DOM.
- ElectroCraft: mapping canónico, route policy, capability pruning, provider adapter y diagnósticos.

## Native runtime proof
El POC ejecuta en Android un self-test visible que crea/lista un `content_record` vía Drizzle/Expo SQLite, verifica persistencia Zustand sobre `expo-sqlite/kv-store` y prueba el DataProvider. El E2E abre además `electrocraft://guarded` y exige redirección visible a `Inicio de sesión requerido`.

Android binary/runtime se valida en GitHub Actions. En Linux solo se exporta el target iOS; no se inventa un `.ipa` ni una compilación Xcode.

## Capability pruning
La baseline no instala `expo-camera` ni declara CAMERA/RECORD_AUDIO. El fixture `camera` requiere `expo-camera@57.0.3` solo cuando se solicita, con audio deshabilitado.
