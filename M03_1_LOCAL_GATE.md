# M03.1 — cierre local reproducible

Este overlay parte exactamente de `main@0afa33651a677fb2a1d47cf45c38fa7b22df6239`.

El runtime que generó el paquete no tuvo acceso al registry npm. Por eso `package-lock.json` se deja deliberadamente sin fabricar. En un checkout con red npm disponible:

```bash
npm install --package-lock-only --ignore-scripts --no-audit --no-fund
node tooling/scripts/verify-m03-1-design-system.mjs
npm ci
npm run test:m03-1
npx playwright install --with-deps chromium
npm run check
```

Después comprueba `/__design-system` a 360, 768 y 1440 px con teclado, focus-visible, Dropdown, Sheet, tema y ayuda persistente. La cobertura Playwright incluida automatiza estas comprobaciones observables.

No cierres M03.1 ni actives M03.2 hasta que:
- el lockfile regenerado esté incluido en el commit;
- `node tooling/scripts/verify-m03-1-design-system.mjs` quede sin blockers;
- `npm run check` sea green;
- la validación real de navegador sea green.

## Comprobación estructural sin falsear el cierre
Mientras el lockfile siga desactualizado, se puede inspeccionar el overlay con:

```bash
ELECTROCRAFT_M03_1_ALLOW_EXTERNAL_BLOCKERS=1 node tooling/scripts/verify-m03-1-design-system.mjs
```

Ese modo **no cierra** M03.1: genera `tooling/dist/m03-1-design-system-report.json` con el blocker de lockfile explícito. CI no usa este override y falla cerrado.

## Aclaración de contrato visual
La spec canónica `.ai/microphases/M03_1.md` exige validación visual/E2E y responsive, pero no exige ningún SVG externo. Por tanto el gate usa la ruta técnica `/__design-system` + Playwright como evidencia visual ejecutable y no depende de un archivo de referencia inexistente.

## Ruta automática con GitHub Actions
Si el overlay se publica con GitHub Desktop sin regenerar el lock localmente, el workflow `M03.1 Design System Gate` hace lo siguiente sin escribir en el repositorio:
1. genera un `package-lock.json` candidato con npm real;
2. ejecuta el verifier, `npm ci`, la suite M03.1, Chromium y `npm run check` contra ese lock;
3. sube `m03-1-lockfile-candidate` como artifact si el lock cambió;
4. falla intencionalmente al final hasta que ese lockfile quede versionado.

Esto permite recuperar el artifact en la siguiente iteración y construir un ZIP posterior con el lock real, sin fabricar integridades y sin commits automáticos.
