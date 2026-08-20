# TRACKING — ElectroCraft current position

Date: 2026-08-20.

| Scope | Estado | Evidencia |
|---|---|---|
| F00 | COMPLETADA / GREEN | `.ai/evidence/F00/` |
| F01 | COMPLETADA / GREEN | `.ai/evidence/F01/` |
| F02 | COMPLETADA / GREEN | `.ai/evidence/F02/` |
| F03 / M03.1–M03.12 | COMPLETADA / GREEN | `.ai/evidence/F03/CLOSURE_2026-08-20.md` |
| F04 / M04.1 | ACTIVE | `.ai/microphases/M04_1.md` |

## Cierre M03.12 / F03
- Rama `codex/m03-12-appshell-e2e`; PR `#26`.
- Head funcional `af88c60264a243d97cd8e5ca708eedc8ded04028`.
- Gate M03.12 run `32320810295` success; job `96282469768`.
- Artifact `9389767563`; digest `sha256:f810fda738509fca06660cc248ddbe576ebe68a885bb2d8ba026944668d4c015`.
- Dedicado `7/7`; matriz E2E 6 viewports GREEN; full `npm run check` GREEN.
- Base CI `32320810328` success; artifact `9389760505`.
- F03 queda COMPLETADA/GREEN; blockers P0/P1 `0`.

## Entrada M04.1
- Owner nuevo previsto: `@electrocraft/data-web` detrás de ports en `@electrocraft/application`.
- PGlite + Drizzle deben quedar versionados exactamente tras revalidación de paquetes disponibles.
- Persistencia browser debe ejecutarse detrás de Worker y seleccionar backend persistente según capacidad: OPFS cuando sea seguro/soportado, fallback compatible documentado cuando no.
- Schema obligatorio: project, project_object, project_revision, app_extension_state, capability_snapshot, user_preference + búsqueda FTS/migration journal.
- Deben existir transacciones save/open, recovery, rollback/atomicidad, Settings > Almacenamiento, ayuda española y tests browser capability.
- Añadir owner cambia el invariant del monorepo de 18 a 19 paquetes; aliases públicos de 20 a 21.
