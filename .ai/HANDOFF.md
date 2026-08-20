# HANDOFF — ElectroCraft

## Current
F04 / M04.2 — Inicializar PGlite Multi-Tab Worker y migrations — `ACTIVE`.

## Heredado
- F03/M03.12 cerró GREEN en head `af88c60264a243d97cd8e5ca708eedc8ded04028`.
- M04.1 cerró `COMPLETADA / GREEN` con source funcional validado `8fd9460a43a4a3b5eaf91e62b83f4b3cb7edf10b`.
- Evidencia M04.1: `.ai/evidence/F04/M04.1/VALIDATION_LATEST.md` + `.ai/evidence/F04/M04.1/CLOSURE_2026-08-20.md`.
- M04.1 dejó `@electrocraft/data-web`, PGlite `0.5.5`, Drizzle `0.45.2`, Worker browser, schema/migrations, repository transaccional, repair/diagnostics y E2E save→reload→reopen.
- Monorepo actual: 19 owner packages, 21 aliases, 2 apps.
- Blockers P0/P1 conocidos: `0`.

## Siguiente acción exacta
1. Releer `.ai/microphases/M04_2.md` y consultar la API pública actual del Worker multi-tab de PGlite antes de cambiar comportamiento.
2. Mantener una única DB lógica del Studio y consolidar el lifecycle bootstrap → migrations → health → repositories ready.
3. Usar IndexedDB persistente como baseline compatible (`idb://...`); mantener OPFS AHP como optimización feature-detected.
4. Incorporar observación de leader change/handoff sin crear otra conexión DB independiente en UI.
5. Mantener Drizzle/PGlite detrás de `@electrocraft/data-web` y application ports; React no importa clients raw.
6. Añadir prueba de dos clientes/tabs sobre la misma DB: write/read compartido y handoff del leader.
7. Añadir/ajustar integration fixture para migrations, reopen y recovery.
8. Validar lint, typecheck, boundaries, full tests, build y E2E específico.
9. Registrar evidencia M04.2 y avanzar automáticamente a la siguiente microfase de F04 solo con GREEN.

## Read set
`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M04_2.md → packages/data-web → packages/application/src/projects → apps/studio/src/features/projects → tooling/package-boundaries.json`.
