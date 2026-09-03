# M08.6 — Validación local

Fecha: 2026-09-03.

## Gates verdes

- `npm run lint`: `PASS`.
- `npm run typecheck`: `PASS`.
- `npm run test`: `PASS`.
  - documentación activa: `M08.6`;
  - Node: `41/41`;
  - Vitest: `529/529` en `145/145` archivos;
  - build offline: `PASS`;
  - build Studio/PWA: `PASS`;
  - scan M08.5 de secretos: `PASS`.
- `git diff --check`: `PASS`.

## Prueba focal M08.6

`tooling/vitest/unit/m08-6-data-explorer.test.ts`: `4/4 PASS`.

Casos:

1. read operation explícita y parámetros tipados;
2. mutation confirmation fail-closed;
3. redaction y error recuperable sin leak;
4. source-to-query handoff canónico.

## E2E pendiente del gate remoto

`tooling/playwright/m08-6-data-explorer.spec.ts` está incorporado. La ejecución local se bloqueó antes de abrir la app porque Playwright no encontró Chromium en el contenedor. No es un fallo de la aplicación; se requiere Base CI para certificar el flujo visual y producir `.ai/evidence/F08/M08.6/data-explorer-desktop.png`.

M08.6 permanece `ACTIVE` hasta que CI termine en verde y la PR se fusione.
