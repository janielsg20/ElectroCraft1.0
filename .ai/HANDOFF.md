# HANDOFF — ElectroCraft

## Current
F02 / M02.8 — Clasificar ownership: Project Objects vs Registries vs Content Entities — `ACTIVE`.

## Siguiente acción exacta
1. Leer `.ai/microphases/M02_8.md` y auditar la clasificación implícita ya presente en domain/application/export-ir antes de crear documentación o código.
2. Mantener exactamente 17 owner packages y `packages/domain/src/contracts/` como ubicación canónica; no introducir un package/registry paralelo.
3. Crear una taxonomía versionada/verificable con las categorías `project-object`, `registry-definition` y `content-entity`.
4. Clasificar ProjectDefinition/Documents/Components/DataSource/DataSchema/Query/State/Action/Route/Navigation/Role/Policy/Theme y cualquier metadata portable según ownership real.
5. Clasificar Component/Field/Action/Provider/Capability registries como definitions/registries disponibles; el proyecto solo puede guardar refs/overrides/definitions de usuario explícitas, nunca el registry runtime completo.
6. Clasificar records/content data y futuros user/content entities como contenido administrado/runtime; no pueden convertirse en ProjectDefinition config ni copiarse al snapshot por defecto.
7. Documentar owner package, storage authority, serializer/migration access y ExportIR participation en `.ai/MODEL_OWNERSHIP.md` o el documento exacto indicado por el spec.
8. Añadir helpers/tests que detecten category drift, IDs duplicados, registry snapshots persistidos y content entities embebidas en Project Objects.
9. Verificar que M02.7 ExportIR solo toma project objects + manifests/refs permitidas y nunca un registry vivo o content records arbitrarios.
10. Actualizar ayuda arquitectónica y gate M02.8; ejecutar suite dedicada, `npm run check`, gates heredados y export parity cuando aplique.
11. Fusionar solo verde; validar M02.8 nuevamente en `main`, registrar artifact/digest y solo entonces activar M02.9.

## Read set
`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M02_8.md`.

M02.1–M02.7 están cerradas; no reabrirlas salvo regresión reproducible.
