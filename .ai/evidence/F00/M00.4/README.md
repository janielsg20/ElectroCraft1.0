# Evidence — F00 / M00.4 Studio DB genérica

M00.4 se cerró con paquetes publicados y runtime browser real mediante GitHub Actions, evitando convertir la limitación DNS del contenedor de desarrollo en un falso PASS.

## Run de cierre

- Workflow: `Verify M00.4 Studio DB`
- Run ID: `32061372828`
- Job ID: `95483180935`
- Head SHA: `92a1a0b7f21d4db4ebad637e11084bd80415f640`
- Conclusion: `success`
- Artifact ID: `9298292283`
- Artifact digest: `sha256:0590acc6ba339f9d02cd1d62caffe6f7c889f1a06ba8a58df717422e7af90643`

## Evidencia guardada

- `integration-result.json` — PGlite + Drizzle reales, persistencia, rollback, índices y latencia.
- `two-tab-runtime.json` — dos tabs Chromium, visibilidad cruzada, leader/follower y close/reopen.
- `browser-contract.json` — contrato oficial Worker + persistencia `idb://` + harness técnico.
- `ci-summary.json` — identidad del run/artifact y gates.
- `test-output.txt` — resumen exacto de los gates del cierre.
- `source-audit.md` — ownership/API upstream ejecutada.

El artifact original de GitHub Actions también contiene el `package-lock.json` resuelto durante la corrida. Los direct pins del POC permanecen exactos en `package.json`; el workspace de producto deberá generar/validar su propio lockfile al instalarse según la política de dependency baseline.

## Historia de diagnóstico

Run 1 (`32060993171`) alcanzó integración real GREEN y falló únicamente por una navegación transitoria del contexto Playwright durante optimización de Vite. Se estabilizó el harness sin reducir cobertura.

Run 2 (`32061187841`) volvió a dejar PGlite/Drizzle GREEN y detectó un error real de semántica del harness: `Date.now()` no cabe en `project_objects.version integer`. Se corrigió a `version: 1`, manteniendo timestamps/secuencia fuera de esa columna.

Run 3 (`32061372828`) pasó todos los gates, incluido `PASS_TWO_TAB` y el closure gate.
