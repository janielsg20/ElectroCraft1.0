# HANDOFF — ElectroCraft

## Current

F08 / M08.9 — Group, Repeater, Calculated y Conditional Fields — `ACTIVE / CANDIDATA A GATE`.

Rama activa: `codex/m08-9-advanced-fields`.

M08.8 quedó certificada por ElectroCraft Base CI `33804227049` (#875) y PR `#74` fusionada por squash a `main` en `8225f3aa5797972265a470f49c8aff75c5bab87c`.

## M08.9 owner y límites

Owner: `PGlite generic content store` existente.

- `ElectroCraftDataModel` y `ElectroCraftDataField` siguen siendo el modelo canónico.
- Group/Repeater expresan nesting portable mediante `parentFieldRef` y `order`.
- Calculated usa únicamente `add|subtract|multiply|divide|concat|coalesce`.
- Conditional usa rule AST tipado; no `eval`, `Function` ni código del usuario.
- dependencias y ciclos se validan fail-closed antes del autosave o de mutar registros;
- create/update del adapter interno normaliza los datos antes de escribir en `content_records`;
- `storageHint` y `advancedField` son metadata portable, nunca DDL;
- M08.10/M08.11 conservan taxonomías y relaciones avanzadas.

## UX implementada

Ruta: `Datos > Modelos > <modelo> > Campos` (`/models`).

- jerarquía Group/Repeater indentada;
- editor persistente `Estructura y dependencias`;
- límites mínimo/máximo de Repeater;
- operación y dependencias de Calculated;
- campo, operador y value type de Conditional;
- botones `Subir`/`Bajar` como alternativa de teclado a DnD;
- estados y errores visibles en español;
- ayuda existente `help.content.models` preservada.

## Validación local

- `npm run lint`: GREEN.
- `npm run typecheck`: GREEN.
- `npm run test:boundaries`: GREEN.
- `npm run test`: GREEN; Node `41/41`, Vitest `547/547`, build Studio y secret scan.
- tests M08.9 dedicados: `6/6` GREEN.
- E2E M08.9 escrito; la ejecución local quedó bloqueada antes de abrir la app porque el CDN de Playwright agotó el timeout al descargar Chromium. El gate de GitHub Actions debe instalar Chromium y ejecutar el repository gate.

## Siguiente acción exacta

Publicar una única candidata M08.9 y ejecutar ElectroCraft Base CI/Playwright. Si queda `success`, registrar VALIDATION/CLOSURE, fusionar y activar `M08.10 — Taxonomías dentro de Modelos`. Si falla, corregir solo la evidencia observada sin ampliar ownership.

## Read set

`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/phases/F08.md → .ai/microphases/M08_9.md → packages/domain/src/data/advanced-fields.ts → packages/connectors/src/advanced-field-runtime.ts → packages/connectors/src/internal-data-source-adapter.ts → packages/data-web/src/advanced-field-storage.ts → apps/studio/src/features/data/advanced-field-model.ts → apps/studio/src/features/data/advanced-field-editor.tsx → apps/studio/src/features/data/data-model-runtime.ts → apps/studio/src/features/data/data-models-workspace.tsx → tooling/vitest → tooling/playwright`.
