# MEMORY — ElectroCraft

Solo contiene hechos estables y decisiones vigentes. Progreso y siguiente paso pertenecen a `STATE.md`, `TRACKING.md`, `HANDOFF.md` y `evidence/`.

## Producto
- ElectroCraft es un No-Code App Builder; CMS/Administración son capacidades subordinadas, no la raíz del producto.
- Screens y Navigation/Routes tienen ownership separado.
- Los nueve targets son Core: local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp y wordpress.
- Todos los targets comparten `TargetRegistry`, Capability Analyzer y Export Target Contract.

## Modelo y ownership
- Existe un único modelo canónico portable; internals de engines OSS nunca se persisten como proyecto canónico.
- `Puck` posee composición visual; ElectroCraft mapea `ElectroCraftDocument` y Slots sin crear un editor paralelo.
- `PGlite` + `Drizzle` poseen persistencia Studio/internal data; modelos lógicos no crean tablas por modelo.
- `React Query Builder` posee condición/formatting; ElectroCraft valida bindings/capabilities fail-closed.
- `Rete` posee graph/processing/history de workflows; `ElectroCraftActionGraph` es la definición persistida.
- `TanStack Query` posee async cache; `Refine` solo Administración; `RHF/Zod` Forms; `Tiptap` RichText; `Zustand` runtime state.
- Snapshots canónicos usan una única serialización JSON determinista y checksum portable; las migraciones de schema se encadenan mediante un registry explícito/fail-closed, no por rutas paralelas inline.

## AI
- AI SDK + `@ai-sdk/google` es la abstracción primaria; direct `@google/genai` solo para gaps estrechos y probados.
- Gemini genera/refina código para components/plugins/sections; output AI es Draft-only y Apply es explícito.
- Secrets se representan por `SecretRef`; valores secretos nunca llegan al cliente ni al proyecto canónico.

## Runtime/targets
- Native baseline usa Expo/React Native, Expo Router y Expo SQLite; no DOM/Puck/Table en runtime native.
- Capacitor es target híbrido propio, no fallback de Expo.
- LAMP usa Slim 4 + PSR-7 + Slim-CSRF + PDO/MySQL/MariaDB.
- WordPress usa Block Theme + Companion Plugin y APIs nativas antes de implementaciones custom.

## Reglas de continuidad
- Una sola microfase puede estar `ACTIVE`.
- `MEMORY.md` no guarda estado transitorio de ejecución, identificadores de CI, logs, hashes de cierre ni instrucciones de siguiente paso.
- `DONE` requiere evidencia real; errores unsupported deben permanecer visibles y fail-closed.
