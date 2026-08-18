# TRACKING — ElectroCraft current position

Date: 2026-08-18.

El detalle histórico hasta M00.8 vive en `.ai/TRACKING_HISTORY_THROUGH_M00.8.md`; el detalle M00.9–M01.5 previo a esta normalización queda preservado en `.ai/archive/TRACKING_THROUGH_M01.5_2026-08-18.md`.

| Scope | Estado | Evidencia principal |
|---|---|---|
| F00 | COMPLETADA | `.ai/evidence/F00/` |
| M01.1 | COMPLETADA | run `32159790719` revalidado en head de cierre M01.5 |
| M01.2 | COMPLETADA | run `32159790719` revalidado en head de cierre M01.5 |
| M01.3 | COMPLETADA | run `32159790719` revalidado en head de cierre M01.5 |
| M01.4 | COMPLETADA | run `32159482757` en head de cierre M01.5 |
| M01.5 | COMPLETADA | Base CI run `32158198590`; cierre `.ai/evidence/F01/M01.5/CLOSURE_2026-08-18.md` |
| M01.6 | ACTIVE | `.ai/evidence/F01/M01.6/` |

## Gate actual
`GREEN_THROUGH_M01.5`; M01.6 está en ejecución.

## M01.6 — alcance activo
- Normalizar `AGENTS.md` y `.ai/README.md` con minimal read set.
- Mantener required docs/templates/evidence/ADR.
- Limpiar `MEMORY.md` de logs/progreso y hacer `STATE/TRACKING/HANDOFF` coherentes.
- Archivar review reports no canónicos.
- Añadir doc-consistency tooling + unit/negative/contract/integration tests.
- Ejecutar lint, typecheck, test, build y CI real antes del Gate F01.

## Siguiente transición permitida
Solo después de M01.6 verde: cerrar Gate F01 y activar F02 / M02.1 — Definir `ElectroCraftProjectDefinition` y `ElectroCraftDocument`.
