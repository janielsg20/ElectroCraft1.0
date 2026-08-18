# STATE — ElectroCraft Eighth Final

## Estado actual
- F00 — Reconocimiento, verificación y arquitectura: `COMPLETADA`.
- Fase formal activa: F01 — Monorepo, límites, documentación y CI.
- Última microfase con gate dedicado verde: M01.4 — Studio Vite/PWA bootstrap.
- Estado: `IN_PROGRESS`.
- Gate actual: `GREEN_THROUGH_M01.3` + `M01.4_DEDICATED_GREEN`; cierre formal M01.4 pendiente de terminar la revalidación heredada sobre el head de compatibilidad.
- M01.5 — Crear CI base: `BLOCKED_UNTIL_M01.4_FORMAL_CLOSURE`.

## Evidencia de cierre anterior — 2026-08-18
Baseline funcional validada M01.1–M01.3: `3fe3815824d7847e88c7f91006d7a6236f00e527`.

- M00.9 — `success`; marker `PASS_REAL_OPENAPI_PARSER`; validado dentro del run M00.10 `32100542215` y publicado como `electrocraft/M00.9`.
- M00.10 — `success`; run `32100542215`; static parity + Capacitor + LAMP/MySQL/PDO/CSRF + WordPress wp-env + closure gate verdes; status `electrocraft/M00.10`.
- M00.11 — `success`; run `32100737146`; real engine matrix + architecture closure verdes; status `electrocraft/M00.11`.
- M01.1 — `success`; run `32100786113`; lint/typecheck/tests/build/Vitest/Vite/Playwright + `PASS_M01_1_MONOREPO`; status `electrocraft/M01.1`.
- M01.2 — `success`; mismo run `32100786113`; strict TypeScript/import boundaries + `PASS_M01_2_TYPESCRIPT_BOUNDARIES`; status `electrocraft/M01.2`.
- M01.3 — `success`; mismo run `32100786113`; root quality pipeline + empty-repo fixture + `PASS_M01_3_QUALITY_TOOLCHAIN`; status `electrocraft/M01.3`.

Los seis contextos de commit fueron observados simultáneamente como `success` sobre la baseline. La evidencia detallada queda en `.ai/evidence/CI_CHAIN_M00_9_M01_3_2026-08-18.md` y `.ai/TRACKING.md`.

## M01.4 — gate dedicado verde
- Implementación inicial: `e3f8ef23de22918f27d68a69e188fa9daf09553e`.
- Corrección de formato: `c91eeb43c8f73960b6f55d1b62c03d3799bd5d2a`.
- Corrección de tipos Vite: `e0a73dd0163e62c02aeebb79c2414f38e261d7cc`.
- Run dedicado verde: `32146389103`.
- Job `M01.4 React/Vite/PWA bootstrap`: `success`.
- Marker `PASS_M01_4_STUDIO_BOOTSTRAP`.
- Status `electrocraft/M01.4 = success`.
- Artifact `9327946718` — `m01-4-studio-bootstrap-evidence`.
- Digest `sha256:294db22929694beea2197dedf20f2acb9d9d8f241dd655a972d2d67bcdfa332a`.
- Gates verdes: exact dependency pins, Prettier/lint, TypeScript, boundaries, Node tests, Vitest, Vite production build, PWA artifact verification y Playwright.

## Compatibilidad heredada tras M01.4
- M01.4 reemplaza el artifact temporal `apps/studio/dist/studio-architecture.js` por el artifact real PWA: `index.html`, `manifest.webmanifest`, `sw.js` y `tooling/dist/m01-4-studio-bootstrap-report.json`.
- La revalidación heredada M01.1 expuso únicamente esa aserción obsoleta después de pasar lint, typecheck, Node tests, build, Vitest, Vite y Playwright.
- Commit de compatibilidad: `ed4e9f12486b3ddf4f3351517867a6ee9cd73a15`.
- La revalidación M00.9→M01.3 sobre ese head debe terminar verde antes de declarar M01.4 `COMPLETADA`.

## Decisiones de ejecución cerradas
- La visibilidad CI usa commit statuses con URL al run real.
- M01.2 y M01.3 son reusable workflows invocados desde M01.1 para evitar exceder la profundidad de `workflow_run`.
- Los pipelines F01 usan Bash con `pipefail`; `tee` no puede ocultar un exit code no-cero.
- TypeScript 7 conserva aliases relativos y no `baseUrl`.
- Studio usa Vite desde `apps/studio` como root.
- React estable verificado para M01.4: `19.2.8`.
- `@vitejs/plugin-react` fijado a `6.0.5` y `vite-plugin-pwa` a `1.3.0` para el bootstrap Vite 8.
- M01.1 valida el artifact PWA vigente después de M01.4 y no el artifact temporal de librería.

## Próximo paso exacto
Esperar únicamente a que termine verde la revalidación heredada provocada por `ed4e9f12486b3ddf4f3351517867a6ee9cd73a15`. Entonces publicar el cierre documental, cambiar M01.4 a `COMPLETADA`, establecer `GREEN_THROUGH_M01.4` e iniciar M01.5 — **Crear CI base** siguiendo `.ai/microphases/M01_5.md`.
