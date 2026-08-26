# TRACKING — ElectroCraft current position

Date: 2026-08-26.

| Scope              | Estado             | Evidencia                                      |
| ------------------ | ------------------ | ---------------------------------------------- |
| F00                | COMPLETADA / GREEN | `.ai/evidence/F00/`                            |
| F01                | COMPLETADA / GREEN | `.ai/evidence/F01/`                            |
| F02                | COMPLETADA / GREEN | `.ai/evidence/F02/`                            |
| F03 / M03.1–M03.12 | COMPLETADA / GREEN | `.ai/evidence/F03/CLOSURE_2026-08-20.md`       |
| F04 / M04.1–M04.8  | COMPLETADA / GREEN | `.ai/evidence/F04/CLOSURE_2026-08-25.md`       |
| F05 / M05.1        | COMPLETADA / GREEN | PR `#49`; Base CI `32868029914`                |
| F05 / M05.2        | COMPLETADA / GREEN | PR `#50`; Base CI `32990513971` (#661)         |
| F05 / M05.3        | COMPLETADA / GREEN | PR `#52`; Base CI `33016557679` (#674)         |
| F05 / M05.4        | ACTIVE             | `codex/m05-4-puck-action-sync`                 |

## Cierre M05.1

- Head funcional: `9aa330dbf44b39485516ee0d3dc181a9aee4196b`.
- PR `#49`; squash merge a `main`: `733abdc44f21d16b56b4624c7bec61f0131bd3f1`.
- `ElectroCraft Base CI` run `32868029914` (#656): `success`.
- Puck queda encapsulado por `@electrocraft/editor-puck`; Studio no importa `@puckeditor/core` para el adapter.
- `ElectroCraftDocument.root` se conserva como envelope canónico y sus hijos se proyectan a `Data.content`.
- Slots públicos preservan IDs/nesting; unknown components generan diagnostics visibles y recuperables.
- Puck Data vuelve al documento canónico y al autosave sin persistir selección, DnD o historial del engine.

## Cierre M05.2

- Head funcional validado: `9321356994e5cc48748f1d406c920e28b8c9b141`.
- PR `#50`; squash merge a `main`: `fadc2ecb64764c120c75cb5e4c7b154d3cc4ade6`.
- `ElectroCraft Base CI` run `32990513971` (#661): `success`.
- Composition pública integrada: `Puck.Components`, `Puck.Outline`, `Puck.Preview`, `Puck.Fields`.
- Palette resuelve disponibilidad desde el `Config` Puck activo; no existe segundo ComponentRegistry.
- Preview usa iframe con aislamiento de estilos del host.

## Cierre M05.3

- Head funcional validado: `176b41a31a017f800cb8f63b41be3b7e65f52324`.
- PR `#52`; squash merge a `main`: `fd5901dff66acca5d92ffee832a2ac881721458b`.
- `ElectroCraft Base CI` run `33016557679` (#674): `success`.
- Slots recursivos estables para `Container`, `Section`, `Tabs` y `Accordion` mediante `field.type = "slot"`.
- `allow/disallow` permanece en el field del Slot y la política owner-neutral se traduce a permisos públicos Puck.
- Legacy `zones` se migra con `migrate(data, config)` oficial; `walkTree()` valida el árbol posterior.
- Migraciones incompletas fallan cerrado con diagnóstico ElectroCraft estable sin filtrar errores internos Puck.
- Playwright cubre round-trip browser/storage legacy -> canonical sin persistir `zones`.
- La mejora visual independiente PR `#54` quedó fusionada a `main` en `c1240c33d4e38c911b1f0b5b33c9351955bcddd3`; Base CI #665 (`33012604339`) GREEN.

## M05.4 en curso

Rama: `codex/m05-4-puck-action-sync`.

Objetivo exacto:
- consumir `onAction/appState/prevAppState` del API público Puck;
- reconstruir `ElectroCraftDocument` después de acciones estables;
- reutilizar debounce/autosave F04 y repository canónico existente;
- probar reorder/edit/duplicate/delete, nesting, selection e history;
- mantener editor history separado de Project Revisions y no persistir internals Puck.

API/engine propietario: Puck mediante `@electrocraft/editor-puck`.

Blockers funcionales P0/P1 conocidos: `0` al activar M05.4.

## Próxima microfase exacta

Completar y validar `M05.4 — Sincronizar Puck actions con ElectroCraftDocument`; solo después activar `M05.5` según `.ai/microphases/M05_5.md`.
