# HANDOFF — ElectroCraft

## Current

F08 / M08.6 — Data Explorer y prueba de operaciones — `IMPLEMENTADA / CANDIDATA A GATE CI / ACTIVE`.

Rama activa: `codex/m08-6-data-explorer`.

M08.5 quedó certificada por ElectroCraft Base CI `33685072920` (#837) y PR `#71` fusionada por squash a `main` en `64da0f30d46730b9f29a4cc05edaf941b0714e85`.

## M08.6 owner y límites

Owner: `ConnectorRegistry + DataSourceAdapter`.

- reutiliza el único ConnectorRegistry y los adapters Internal/REST/GraphQL existentes;
- Explorer es una herramienta de Studio, no un runtime de producción;
- una operación se ejecuta solo mediante acción explícita `Ejecutar`;
- mutaciones requieren confirmación previa;
- auth headers, query secrets y traces se redactan antes de llegar a UI/logs;
- resultados grandes se truncan de forma visible;
- `Crear consulta desde esta operación` crea Draft QueryDefinition canónico, no un formato paralelo.

## Resultado implementado

1. DataExplorer conectado a source/schema/capabilities reales;
2. resources/operations y parameter controls derivados del contrato;
3. ejecución read + confirmación de mutation;
4. tabla/lista y JSON avanzado sanitizado;
5. source-to-query handoff Draft persistible;
6. estados español, Help `help.data.explorer`, responsive y accesibilidad;
7. pruebas de read, mutation confirm, redaction, truncation, errors y query handoff.

Validación local: lint, typecheck, build, Node `41/41`, Vitest `529/529`. El E2E se incorporó, pero requiere Chromium en Base CI.

## Siguiente acción exacta

Publicar commit/PR candidata M08.6 y ejecutar Base CI. Si Playwright queda verde, fusionar y documentar cierre; si falla, corregir la evidencia concreta sin reabrir ownership.

## Read set

`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/phases/F08.md → .ai/microphases/M08_6.md → packages/domain/src/data → packages/application/src/data → packages/connectors/src → packages/data-web/src → apps/studio/src/features/data → apps/studio/src/help → tooling/vitest → tooling/playwright`.
