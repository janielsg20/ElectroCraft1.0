# HANDOFF — ElectroCraft

## Current
F02 / M02.6 — Serializer y migrations de proyecto — `ACTIVE`.

## Siguiente acción exacta
1. Consultar la API pública actual de Zod antes de modificar serializers/migrations; Zod es el engine owner del boundary.
2. Auditar `packages/domain/src/contracts/serialization.ts` e imports v1/v2/v3 existentes para no crear un segundo serializer/migration path.
3. Consolidar serialización determinista canónica y definir checksum estable del snapshot sin depender de orden accidental de claves.
4. Crear un `MigrationRegistry` versionado en domain/application para encadenar migrations de `schemaVersion` de forma explícita y fail-closed.
5. Añadir una migration real mínima y verificable entre versiones de fixture; preservar las migrations v1/v2/v3 actuales detrás del registry.
6. Implementar import/preview de proyecto que valide y devuelva diagnostics reparables; un import inválido no puede mutar el repository/storage.
7. Mantener `packages/domain/src/contracts/` como ubicación de contratos: no crear package 18 `@electrocraft/contracts`.
8. Añadir fixtures de round-trip/checksum/migration/error, tests unit/contract/integration/negative/persistence y evidencia generada.
9. Ejecutar `npm run test:m02-6`, `npm run check`, gates heredados y CI real en PR; fusionar solo verde.
10. Validar nuevamente el gate M02.6 sobre `main`, registrar artifact/digest y solo entonces activar M02.7.

## Read set
`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M02_6.md`.

M02.1–M02.5 están cerradas; no reabrirlas salvo regresión reproducible.
