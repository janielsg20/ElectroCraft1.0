# M03.1 — cierre reproducible v5

Base de aplicación: `main@1ab2ce7f9f1340cd07ad20c66370d65aa56d2bf9`.

Este overlay ya incorpora el `package-lock.json` real generado por GitHub Actions run `32266099186`.
SHA-256 del lock: `1025aa726810d4fbbc313829ae59df9b4c5e85bf5f7ddb553daa754c75ca8789`.

El primer run real confirmó: verifier, `npm ci`, pins exactos, suite M03.1 `15/15` e instalación de Chromium. El full gate se detuvo únicamente en Prettier, que reportó 14 archivos.

## Ruta automática recomendada
El workflow v5:
1. verifica que el lock versionado siga siendo reproducible;
2. ejecuta `npm ci`;
3. ejecuta `npm run format` solo en el checkout desechable;
4. captura `m03-1-formatting-candidate` (patch + lista + tar de archivos formateados) si hay diff;
5. ejecuta la suite M03.1 y `npm run check` sobre ese árbol temporalmente formateado;
6. falla cerrado al final si existe formatting candidate, aunque el resto del gate sea verde.

Así se obtiene el parche exacto de Prettier y, en la misma pasada, se detectan posibles fallos posteriores de typecheck/tests/build/Playwright.

No activar M03.2 hasta una pasada final sin candidatos pendientes y con `PASS_M03_1_DESIGN_SYSTEM`.
