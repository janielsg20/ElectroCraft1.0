# ElectroCraft1.0 — M03.1 update v5 overlay

Base de aplicación: `main@1ab2ce7f9f1340cd07ad20c66370d65aa56d2bf9`.

## Objetivo de v5
Cerrar los dos hallazgos reales del primer run de Actions sin inventar evidencia:
- versionar el `package-lock.json` exacto generado por npm real;
- convertir el formato Prettier pendiente en un artifact reproducible, mientras se continúa el full gate sobre el árbol temporalmente formateado.

## Evidencia heredada del run 32266099186
- verifier: PASS, blockers=0, lockVerified=true;
- `npm ci`: PASS, 625 packages;
- engine pins: PASS;
- M03.1 dedicated suite: 15/15 PASS;
- Chromium install: PASS;
- repository gate: detenido en Prettier, 14 archivos;
- lock artifact: 9370267875;
- evidence artifact: 9370268489.

## Cambio principal
- `package-lock.json`: lockfile v3 real, SHA-256 `1025aa726810d4fbbc313829ae59df9b4c5e85bf5f7ddb553daa754c75ca8789`.
- `.github/workflows/m03-1-design-system.yml`: añade formatting candidate reproducible y ejecuta el full gate después de formatear temporalmente.
- `tooling/scripts/verify-m03-1-design-system.mjs`: verifica también el contrato del formatting candidate.
- evidencia/STATE/TRACKING/HANDOFF actualizados con el run real.

M03.1 permanece ACTIVE. M03.2 sigue bloqueada hasta gate GREEN.
