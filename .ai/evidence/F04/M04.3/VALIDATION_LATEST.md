# M04.3 — Validación local

Fecha: 2026-08-21.

## Resultado

`GREEN` local.

## Evidencia funcional

- El contrato de aplicación valida dirty objects/deletes y rechaza deltas vacíos o ambiguos.
- PGlite + Drizzle escriben únicamente los `project_objects` afectados dentro de la transacción incremental.
- El autosave conserva cambios pendientes tras un commit fallido y solo publica `Guardado` después del commit.
- Los checkpoints contienen payloads restaurables; recovery ignora revisiones corruptas y restaura explícitamente la última válida.
- `Configuración > Almacenamiento` expone comprobación de integridad y acción `Restaurar` en español.
- Screenshot browser: `storage-recovery-settings.png`.

## Gates ejecutados

- `npm ci --ignore-scripts --no-audit --no-fund`: PASS.
- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm run test:boundaries`: PASS (`19` packages, `21` aliases).
- Vitest dedicado M04.3: PASS (`17/17`, incluyendo regresión M04.1).
- `npm run test`: PASS (`82` archivos, `300` tests).
- `npm run build`: PASS.
- Playwright M04.3 Chromium: PASS (`1/1`).

## Advertencias no bloqueantes

- Vite conserva los warnings conocidos de `eval` dentro de PGlite y chunk principal mayor de 500 kB; build concluye correctamente.
- La primera ejecución browser requirió instalar Chromium y librerías del sistema en el contenedor.

## Blockers

P0/P1: `0`.
