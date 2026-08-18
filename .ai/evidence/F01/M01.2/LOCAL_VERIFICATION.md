# M01.2 — verificación local

Estado: **LOCAL GREEN / CI REAL PENDIENTE**.

La implementación activa TypeScript estricto y convierte el mapa de ownership de M01.1 en reglas ejecutables de importación.

## Gates locales
- `npm run lint`
- `npm run typecheck`
- `npm run test:boundaries`
- `npm test`
- `npm run build`

## Negative coverage
- Domain -> React/Puck/Drizzle/Expo/filesystem: bloqueado.
- Deep workspace import: bloqueado.
- Relative import entre owners: bloqueado.
- Application -> runtime/adapter: bloqueado.
- Wildcard alias: bloqueado por contrato de tsconfig.

El cierre formal permanece pendiente del workflow real M01.2.

## Entorno real OSS
El contenedor local no pudo resolver/alcanzar el registry npm dentro del probe acotado (`npm view typescript@7.0.2 version` terminó por timeout). Por tanto, no se declara como ejecutado el toolchain publicado de TypeScript/Vite/Vitest/Playwright. Ese gate permanece en GitHub Actions y debe quedar GREEN antes del cierre formal.
