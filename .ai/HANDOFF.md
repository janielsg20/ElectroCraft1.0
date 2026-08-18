# HANDOFF — ElectroCraft

## Current
F02 / M02.7 — Definir `ElectroCraftExportIR` — `ACTIVE`.

## Siguiente acción exacta
1. Mantener `packages/domain/src/contracts/` como ubicación efectiva de contracts; no crear package 18 `@electrocraft/contracts`.
2. Reutilizar Zod `4.4.3` como boundary owner y la ruta determinista/checksum de M02.6; no crear otro serializer.
3. Auditar `packages/export-ir`, `packages/domain` y `packages/application` para no duplicar manifests/target contracts existentes.
4. Definir `ElectroCraftExportIR` como snapshot immutable/versionado neutral a target, con Documents, Navigation, Data Sources sanitizadas, DataSchema, Queries, State, Actions, Forms, Roles, Theme, Media manifest y required capabilities.
5. Excluir Studio workspace state, Puck/Rete histories, TanStack cache, AI history/prompts y secret values; los secretos se representan solo mediante refs.
6. Definir el closed set `ExportTargetId`: local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress.
7. Definir `TargetCompileContext` y `ExportValidationReport` sin importar engines ni tipos target-specific al IR.
8. Reutilizar serialización/checksum deterministas para garantizar que dos exporters reciban exactamente la misma revisión.
9. Añadir fixture round-trip, negative/boundary tests y target/native fixture que demuestre que Slim/WP/Expo/Capacitor internals no entran al IR.
10. Actualizar `help.architecture.models`, scripts/gate M02.7 y ejecutar suite dedicada + `npm run check` + gates heredados; fusionar solo verde.
11. Validar nuevamente M02.7 sobre `main`, registrar artifact/digest y solo entonces activar M02.8.

## Engine/API verificado
- Zod 4 estable; `z.object`/schemas siguen siendo el boundary canónico.
- Zod 4 ofrece `z.toJSONSchema()` como conversión oficial cuando se necesite una representación JSON Schema; no sustituye el snapshot/checksum determinista de ElectroCraft.

## Read set
`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M02_7.md`.

M02.1–M02.6 están cerradas; no reabrirlas salvo regresión reproducible.
