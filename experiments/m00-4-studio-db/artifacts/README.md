# Runtime artifacts

`integration-result.json` lo genera `npm run integration`.

`two-tab-runtime.json` se reserva para evidencia **real** del harness abierto simultáneamente en dos tabs. No se incluye un PASS prefabricado. Debe tener `{"status":"PASS_TWO_TAB", ...evidence}` únicamente después de ejecutar y documentar esa prueba.

`npm run verify` falla por diseño mientras cualquiera de los dos gates reales no esté en PASS.
