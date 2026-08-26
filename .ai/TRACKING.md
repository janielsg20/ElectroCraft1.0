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
| F05 / M05.3        | ACTIVE             | `codex/m05-3-nested-slots-permissions`         |

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
- PR de implementación `#50`; squash merge a `main`: `fadc2ecb64764c120c75cb5e4c7b154d3cc4ade6`.
- PR `#51` fue únicamente de validación y se cerró sin merge para no duplicar cambios.
- `ElectroCraft Base CI` run `32990513971` (#661): `success`.
- Composition pública integrada: `Puck.Components`, `Puck.Outline`, `Puck.Preview`, `Puck.Fields`.
- Palette resuelve disponibilidad desde el `Config` Puck activo; no existe segundo ComponentRegistry.
- Preview usa iframe con `enabled`, `waitForStyles` y `syncHostStyles: false`.
- Tema Studio se mapea a variables oficiales `--puck-*`; no se añadió Puck AI ni workflow dedicado.

## M05.3 en curso

Rama: `codex/m05-3-nested-slots-permissions`.

Implementado hasta ahora:
- `packages/editor-puck/src/puck-component-adapter.ts`: slots estables para `Container`, `Section`, `Tabs` y `Accordion`; `allow/disallow`; política tipada `locked/editable/insertable` traducida a permisos públicos Puck sin persistir internals.
- `packages/editor-puck/src/puck-document-adapter.ts`: `migrate()` oficial para `zones -> slots`, validación con `walkTree()` y fallo cerrado si queda contenido legacy sin mapear.
- `apps/studio/src/features/editor/puck-document-session.ts`: la reconstrucción recibe el mismo `Config` activo usado por Puck como config de migración.
- `tooling/vitest/unit/puck-document-adapter.test.ts`: nesting, migración legacy, fallo sin config y zona no mapeable.
- `tooling/vitest/integration/component-layout-style-puck.test.ts`: restricciones de Slot, permisos y mappings recursivos.
- `tooling/playwright/m05-3-nested-slots.spec.ts`: round-trip browser/storage desde `zones` legacy hasta `ElectroCraftDocument` canónico sin persistir `zones`.

API/engine utilizado:
- Puck `field: { type: "slot" }` con `allow/disallow`.
- Puck component `permissions` para drag/delete/duplicate/edit/insert.
- Puck `migrate(data, config)` para DropZone legacy -> Slot.
- Puck `walkTree(data, config, callback)` para recorrido slot-aware posterior a migración.

Continuidad de `main`:
- La mejora visual independiente PR `#54` quedó fusionada a `main` en `c1240c33d4e38c911b1f0b5b33c9351955bcddd3`.
- `ElectroCraft Base CI` #665 (`33012604339`) cerró GREEN para esa revisión visual.
- No modifica ownership, persistencia ni APIs de M05.3; el gate de PR `#52` valida la combinación contra el `main` actual.

Blockers funcionales P0/P1 conocidos: `0` antes del gate final.

## Próxima microfase exacta

Completar y validar `M05.3 — Nested Slots, permissions y Puck data migration`; solo después activar `M05.4 — Sincronizar Puck actions con ElectroCraftDocument`.
