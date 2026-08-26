# HANDOFF — ElectroCraft

## Current

F05 / M05.3 — Nested Slots, permissions y Puck data migration — `ACTIVE`.

## Heredado

- F04/M04.1–M04.8 cerró `COMPLETADA / GREEN` con persistencia, recovery, Project Home, backup/import, workspace preferences y revisiones no destructivas.
- M05.1 cerró `COMPLETADA / GREEN`; PR `#49`, Base CI `32868029914` (#656), squash `733abdc44f21d16b56b4624c7bec61f0131bd3f1`.
- M05.2 cerró `COMPLETADA / GREEN`; head validado `9321356994e5cc48748f1d406c920e28b8c9b141`, Base CI `32990513971` (#661), PR `#50` fusionada a `main` en `fadc2ecb64764c120c75cb5e4c7b154d3cc4ade6`.
- PR `#51` fue solo de validación M05.2 y quedó cerrada sin merge para evitar duplicación.
- `@electrocraft/editor-puck` sigue siendo el boundary propietario; Studio no persiste internals Puck.
- Composition pública Puck ya vive dentro del AppShell; Preview mantiene aislamiento de tema por iframe.
- Editor history permanece separado de Project Revisions.
- No crear workflow dedicado M05.3; usar un solo Base CI final.
- Blockers P0/P1 conocidos: `0`.

## Implementado en M05.3

1. Slots recursivos estables para `Container`, `Section`, `Tabs` y `Accordion` mediante `field.type = "slot"`.
2. Restricciones `allow/disallow` permanecen en el field del Slot para que también se respeten desde Outline.
3. Política owner-neutral `locked/editable/insertable` se traduce a permisos Puck públicos; no se añadió un campo Puck al modelo canónico.
4. Legacy `zones` se migra con `migrate(data, config)` oficial antes de reconstruir el `ElectroCraftDocument`.
5. `walkTree()` Puck valida el árbol de Slots migrado; contenido legacy no mapeable falla cerrado.
6. Studio entrega al adapter el mismo `Config` activo utilizado por Puck como configuración de migración.
7. Tests unit/integration cubren nesting, restricciones, permisos, migration y errores.
8. Playwright cubre round-trip browser/storage legacy -> canonical sin persistir `zones`.

## Siguiente acción exacta

1. Abrir PR M05.3 contra `main`.
2. Ejecutar únicamente `ElectroCraft Base CI` como gate final.
3. Corregir solo fallos reales si el gate detecta alguno; no añadir workflows de microfase.
4. Registrar head/run/PR GREEN y marcar M05.3 `COMPLETADA` únicamente con evidencia.
5. Activar la siguiente microfase F05 definida por el sistema documental.

## Read set

`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M05_3.md → packages/editor-puck → apps/studio/src/features/editor → tooling/vitest → tooling/playwright`.
