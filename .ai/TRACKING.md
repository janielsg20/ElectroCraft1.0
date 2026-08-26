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
| F05 / M05.2        | ACTIVE             | PR `#50`; head corregido `9321356994e5cc4`     |

## Cierre F04 / M04.8

- Head funcional M04.8: `1df11b22fcd3bee7ea37846a459e28374271fc85`.
- PR `#48`; squash merge a `main`: `ad64c0e5468b13a3fa3a712adb6621fa33d22fd0`.
- `ElectroCraft Base CI` run `32859794266`: `success`.
- Base CI verificó documentación, lint/Prettier, typecheck, tests, build, Playwright repository gate, empty-repo y artifacts base.
- El E2E heredado M04.3 de autosave/recovery volvió a GREEN después de unificar Studio recovery/restore sobre `ProjectRevisionService`.
- `project_object_versions` deduplica payloads por versión/checksum; manifests de revisión usan refs y conservan compatibilidad con manifests legacy embebidos.
- Restore crea checkpoint de seguridad y una nueva revisión restaurada; no borra historial ni mueve destructivamente un pointer.
- `RevisionHistoryPanel` usa design-system/Radix, español, diff summary, estados loading/error/empty y confirmación accesible.
- Workflow dedicado M04.7 archivado tras el cierre de F04 para evitar duplicar GitHub Actions; Base CI queda como gate transversal.
- Blockers P0/P1: `0`.

## Cierre M05.1

- Head funcional: `9aa330dbf44b39485516ee0d3dc181a9aee4196b`.
- PR `#49`; squash merge a `main`: `733abdc44f21d16b56b4624c7bec61f0131bd3f1`.
- `ElectroCraft Base CI` run `32868029914` (#656): `success`.
- Puck queda encapsulado por `@electrocraft/editor-puck`; Studio no importa `@puckeditor/core` para el adapter.
- `ElectroCraftDocument.root` se conserva como envelope canónico y sus hijos se proyectan a `Data.content`.
- Slots públicos preservan IDs/nesting; unknown components generan diagnostics visibles y recuperables.
- `zones` legacy con contenido falla cerrado para impedir pérdida silenciosa.
- Puck Data vuelve al documento canónico y al autosave sin persistir selección, DnD o historial del engine.

## M05.2 en curso

Rama de implementación: `codex/m05-2-puck-composition`.

Archivos/áreas modificadas:
- `packages/editor-puck/src/puck-editor-composition.ts`: Composition pública, active Config hook e iframe aislado;
- `apps/studio/src/features/editor/puck-composition.css`: tokens Electro Studio -> variables oficiales `--puck-*`;
- `apps/studio/src/shell/palette-panel.tsx`: click-to-insert resuelve disponibilidad desde el Config Puck activo;
- `apps/studio/src/i18n/editor.es.ts`: explicación visible en español de Components/Preview/Fields;
- `tooling/vitest/contract/puck-composition-boundary.test.ts`;
- `tooling/vitest/unit/puck-composition.test.ts`;
- `tooling/playwright/m05-2-puck-composition.spec.ts`.

API/engine utilizado:
- Puck Composition pública: `Puck.Components`, `Puck.Outline`, `Puck.Preview`, `Puck.Fields`;
- `createUsePuck` para leer el `Config` activo y despachar inserción sin duplicar state;
- iframe Puck con `enabled`, `waitForStyles` y `syncHostStyles: false`;
- CSS custom properties oficiales `--puck-*`; sin `overrides` para styling y sin Puck AI.

Validación y adaptación 2026-08-26:
- Base CI `32879821898` (#660) completó documentación, lint, typecheck, tests y build antes del gate Playwright.
- Suite Vitest del run: `99` archivos / `353` tests GREEN.
- Playwright llegó a `90/91` tests GREEN; el único fallo estaba en `m05-2-puck-composition.spec.ts`.
- Causa confirmada: el test cambiaba de `Componentes` a `Capas`, desmontaba correctamente `StudioPalette` y después buscaba `data-studio-palette`.
- Corrección aplicada en `9321356994e5cc48748f1d406c920e28b8c9b141`: la aserción del Config activo se ejecuta mientras `Componentes` sigue montado y después se valida `Puck.Outline` en `Capas`.
- No se añadió workflow dedicado. Se abrió PR de validación `#51` sobre el mismo SHA porque el actor de la integración no emitió un nuevo evento `pull_request`; hasta ahora GitHub no ha creado un run para ese PR.
- Se intentó reutilizar el artifact `m01-5-base-ci-evidence` para E2E local sin consumir Actions, pero el Chromium disponible en este entorno bloquea navegación por política administrativa; no se registra como gate válido.

Blockers funcionales P0/P1 conocidos: `0`.
Blocker de cierre: obtener un gate ejecutable sobre el head corregido `9321356994e5cc48748f1d406c920e28b8c9b141`. M05.2 no se declara COMPLETADA hasta disponer de esa evidencia.

## Próxima microfase exacta

Completar el gate de `M05.2 — Componer Components/Outline/Preview/Fields`; solo después activar `M05.3 — Nested Slots, permissions y Puck data migration`.
