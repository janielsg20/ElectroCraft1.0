# TRACKING — ElectroCraft current position

Date: 2026-08-25.

| Scope              | Estado             | Evidencia                                      |
| ------------------ | ------------------ | ---------------------------------------------- |
| F00                | COMPLETADA / GREEN | `.ai/evidence/F00/`                            |
| F01                | COMPLETADA / GREEN | `.ai/evidence/F01/`                            |
| F02                | COMPLETADA / GREEN | `.ai/evidence/F02/`                            |
| F03 / M03.1–M03.12 | COMPLETADA / GREEN | `.ai/evidence/F03/CLOSURE_2026-08-20.md`       |
| F04 / M04.1–M04.8  | COMPLETADA / GREEN | `.ai/evidence/F04/CLOSURE_2026-08-25.md`       |
| F05 / M05.1        | ACTIVE             | `.ai/microphases/M05_1.md`                     |

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

## M05.1 en curso

Archivos/áreas preparadas en `codex/m05-1-puck-adapter`:
- `packages/editor-puck/src/puck-adapter-contract.ts`;
- `packages/editor-puck/src/puck-component-adapter.ts`;
- `packages/editor-puck/src/puck-document-adapter.ts`;
- `apps/studio/src/features/editor/puck-document-session.ts`;
- `apps/studio/src/features/editor/puck-diagnostic-renderer.ts`;
- unit/contract/integration/Playwright de M05.1.

Decisiones activas:
- Puck permanece encapsulado por `@electrocraft/editor-puck`.
- `ElectroCraftDocument.root` es envelope canónico y sus hijos se proyectan a `Data.content`.
- Slots públicos preservan nesting/IDs.
- Unknown components permanecen visibles y recuperables.
- `zones` legacy con contenido falla cerrado para impedir pérdida silenciosa.
- Editor history sigue separado de Project Revisions.

## Próxima microfase exacta

Completar y validar `M05.1 — Crear PuckAdapter y component mapping`; solo después activar M05.2.
