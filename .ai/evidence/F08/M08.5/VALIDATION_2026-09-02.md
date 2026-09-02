# M08.5 — validación del cierre candidato

Fecha: 2026-09-02  
Rama: `codex/m08-5-connector-gateway-secrets`  
Estado: `ACTIVE` — candidato local completo; pendiente Base CI del commit final.

## Cambio de gate

- `tooling/scripts/verify-m08-5-secret-leaks.mjs` inspecciona el bundle productivo, source maps y artefactos PWA.
- `build:studio` ejecuta el scan después de construir y verificar Studio.
- El test M08.5 prueba que TargetCompileContext exporta solo IDs de `SecretRef`.
- El test M08.5 prueba que fallos del Gateway normalizan el error sin valor secreto y sin escritura a consola.
- El reporte determinista se guarda en `secret-leak-scan.json`.

## Resultado local

| Gate | Resultado |
| --- | --- |
| Instalación reproducible | `npm@10.9.2 ci`, 709 paquetes |
| Formato y lint | GREEN |
| TypeScript | GREEN |
| Límites TypeScript | GREEN |
| Node | 41/41 |
| Vitest | 525/525 en 144 archivos |
| Build offline + Studio | GREEN |
| Secret leak scan | 115 archivos, 14,145,844 bytes, 0 diagnósticos |
| Empty-repo | GREEN, incluido smoke Playwright del fixture |
| CI/docs artifacts | GREEN |

## Navegador

El contenedor local no permite que Chrome cree su socket de proceso y aborta antes de abrir una página con `socket() failed: Operation not permitted`. Esto no es un fallo de la aplicación ni de los assertions E2E.

El baseline exacto anterior a los cambios de test/gate, `ca30a68d8b8a7d77cc26aa526e5ba7945cca0e52`, fue validado por ElectroCraft Base CI `33651876477` (#836): instalación, documentación, lint, typecheck, tests, build, Playwright repository gate, empty-repo y artifacts terminaron en `success`.

## Decisión

No declarar M08.5 GREEN con evidencia combinada. Ejecutar Base CI una sola vez sobre el commit que contiene el nuevo scan; cerrar y activar M08.6 únicamente si ese run termina en `success`.
