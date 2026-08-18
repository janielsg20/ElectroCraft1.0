# TRACKING — ElectroCraft current status

Date: 2026-08-18.

El tracking histórico previo se conserva íntegro en `.ai/TRACKING_HISTORY_THROUGH_M00.8.md`.

## Sincronización del repositorio
- Branch: `main`.
- Head auditado antes de la sincronización: `3fba1a4c0033b346b78969f3fc118a99ebd36b3c`.
- Código presente: M00.9, M00.10, M00.11, M01.1, M01.2 y M01.3.
- Última microfase con cierre CI verificado en la evidencia histórica: M00.8.
- M00.9–M01.3: `IMPLEMENTED / CI EVIDENCE PENDING` hasta verificar los runs reales.
- M01.4: `BLOCKED` hasta completar la cadena de cierre.

## Cadena de evidencia esperada
### M00.9 — Data Sources
Workflow: `.github/workflows/data-source-poc.yml`.
Marker requerido: `PASS_REAL_OPENAPI_PARSER`.

### M00.10 — Export Target Parity
Workflow: `.github/workflows/export-target-poc.yml`.
Markers requeridos:
- `PASS_STATIC_PARITY`;
- `PASS_REAL_CAPACITOR_SYNC`;
- `PASS_REAL_LAMP`;
- `PASS_REAL_WORDPRESS`;
- `PASS_M00_10_CLOSURE_GATE`.

### M00.11 — Architecture Closure
Workflow: `.github/workflows/architecture-closure-poc.yml`.
Markers requeridos:
- `PASS_REAL_ENGINE_MATRIX 11`;
- `PASS_M00_11_ARCHITECTURE_CLOSURE`.

### M01.1 — Monorepo Ownership
Workflow: `.github/workflows/m01-1-monorepo.yml`.
Marker requerido: `PASS_M01_1_MONOREPO`.

### M01.2 — TypeScript Boundaries
Workflow: `.github/workflows/m01-2-typescript-boundaries.yml`.
Marker requerido: `PASS_M01_2_TYPESCRIPT_BOUNDARIES`.

### M01.3 — Quality Toolchain
Workflow: `.github/workflows/m01-3-quality-toolchain.yml`.
Marker requerido: `PASS_M01_3_QUALITY_TOOLCHAIN`.

## Regla de cierre
La presencia del código o de evidencia local no sustituye GitHub Actions cuando la microfase exige ejecución real del engine/toolchain. No se promueve ninguna microfase a `COMPLETADA` ni se activa M01.4 hasta registrar run, head, conclusión y artifacts/markers requeridos.

## Higiene del repositorio
En esta sincronización se retiran del árbol canónico archivos de transporte (`APPLY.md`, `PATCH_BASE.txt`, `FILES.sha256`, `COMPLETE_PACKAGE_MANIFEST.md`) y outputs regenerables bajo `experiments/*/dist` y `experiments/*/artifacts`. El source, tests, workflows, ADRs, fixtures y evidencia `.ai/evidence` se conservan.
