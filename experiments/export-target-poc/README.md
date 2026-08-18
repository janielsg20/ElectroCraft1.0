# M00.10 — POC de paridad de exportación

Este experimento prueba que **un solo `ExportIrPoc`** produce artifacts diferenciados para Capacitor, LAMP/Slim y WordPress Block Theme + Companion Plugin.

## Qué prueba
- un único modelo canónico `Appointment`, pantalla, query, estado, ActionGraph y rol;
- compiladores separados por target sin duplicar el modelo canónico;
- CapabilityResult `exact | adapted | blocked` por destino;
- Capacitor con Web build + config + gate real `cap add/sync android`;
- LAMP con Slim 4 + Slim-Psr7 + Slim-CSRF + PDO/MySQL + migration;
- WordPress con Block Theme `theme.json` v3 + CPT + REST protegido + activation lifecycle;
- harness técnico accesible en español.

## Qué no prueba
No es implementación de producto ni crea rutas release. No intenta fingir que Web output equivale a PHP o WordPress. Los gates OSS reales están separados y deben pasar antes de aceptar el ADR.

## Local
`npm run check:static` no instala dependencias externas y valida generación determinista, tests, PHP syntax y build del harness. El entorno CI instala los runtimes OSS reales y ejecuta Capacitor, Composer/Slim/MySQL y wp-env/WordPress.
