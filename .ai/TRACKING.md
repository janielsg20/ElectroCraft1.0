# TRACKING — ElectroCraft current position

Date: 2026-08-29.

| Scope | Estado | Evidencia |
| --- | --- | --- |
| F00 | COMPLETADA / GREEN | `.ai/evidence/F00/` |
| F01 | COMPLETADA / GREEN | `.ai/evidence/F01/` |
| F02 | COMPLETADA / GREEN | `.ai/evidence/F02/` |
| F03 / M03.1–M03.12 | COMPLETADA / GREEN | `.ai/evidence/F03/CLOSURE_2026-08-20.md` |
| F04 / M04.1–M04.8 | COMPLETADA / GREEN | `.ai/evidence/F04/CLOSURE_2026-08-25.md` |
| F05 / M05.1–M05.8 | COMPLETADA / GREEN | PR `#60`; Base CI `33101434587` |
| F06 / M06.1–M06.8 | IMPLEMENTACIÓN FUSIONADA; reparaciones certificadas en F07 | PR `#64`; reparaciones incluidas en Base CI F07 `33262949215` |
| F07 / M07.1–M07.8 | COMPLETADA / GREEN | PR `#68`; Base CI `33262949215`; merge `e697a42546d23f89412e6dd616018759e719e448` |
| F08 / M08.1 | ACTIVE | `.ai/evidence/F08/M08.1/IMPLEMENTATION_2026-08-29.md` |

## Rama activa

`codex/m08-1-data-sources`

## F07 — cierre certificado

Base CI run `33262949215` (#795) terminó `success` en documentación, lint, typecheck, Vitest, build, Playwright, empty-repo y artefactos. PR `#68` fue fusionada a `main` mediante merge commit `e697a42546d23f89412e6dd616018759e719e448`.

Las reparaciones heredadas de F06 quedaron incluidas en ese mismo gate, por lo que ya no se mantiene un blocker F06/F07 abierto.

## F08 / M08.1 — implementación actual

- owner único `ElectroCraftDataSourceDefinition` en `packages/domain/src/data/source-definition.ts`;
- capability set exacto M08.1 con aliases legacy solo para migración;
- secrets excluidos del payload portable; `authRef` conserva solo referencia;
- `DataSourceAdapter` con connection/resources/schema/query/mutate;
- un único `ConnectorRegistry`, operaciones fail-closed por capability/kind/environment;
- `packages/connectors` incorporado al grafo estable como paquete #20;
- `packages/data-web` reutilizado como facade repository, sin segundo store PGlite;
- `/data-sources` en `apps/studio/src/features/data/` con list/detail/inspector responsive;
- `help.data.sources` registrado;
- tests M08.1 y Help/AppShell matrix actualizados.

## Validación

No se ejecuta Actions por microfase. `package-lock.json`, Prettier y suite completa se certificarán de forma reproducible en el Gate F08. Esta condición permanece visible y no se declara un GREEN ficticio para M08.1.

## Siguiente acción exacta

Completar la transición documental de `M08.1 — Fuentes de datos y ConnectorRegistry` y comenzar `M08.2 — Fuente interna ElectroCraft Data sobre PGlite` sin abrir PR ni ejecutar Actions intermedias.
