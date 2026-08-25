# M05.1 — Implementation Candidate — 2026-08-25

## Scope

Crear PuckAdapter y component mapping sobre F04 ya cerrada.

## Implementación actual en rama `codex/m05-1-puck-adapter`

- `@electrocraft/editor-puck` encapsula imports y tipos públicos de Puck.
- Config mapping transforma ComponentDefinitions canónicos a Puck Fields/Slots.
- `ElectroCraftDocument.root` se mantiene como envelope canónico y sus hijos se proyectan a `Data.content`.
- IDs/nesting se preservan mediante round-trip.
- Unknown components usan diagnostic visible y recuperable.
- `zones` legacy con contenido falla cerrado para impedir pérdida silenciosa.
- Studio usa `@electrocraft/editor-puck`; no importa `@puckeditor/core` directamente en la feature del adapter.
- Editor history permanece separado de Project Revisions.

## Pruebas preparadas

- `tooling/vitest/unit/puck-document-adapter.test.ts`.
- `tooling/vitest/contract/puck-adapter-boundary.test.ts`.
- `tooling/vitest/integration/puck-document-session.test.ts`.
- `tooling/playwright/m05-1-puck-adapter.spec.ts`.

M05.1 sigue `ACTIVE` hasta que Base CI final sobre su PR quede GREEN.
