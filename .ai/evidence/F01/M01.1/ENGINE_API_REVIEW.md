# M01.1 — Engine/API review

La microfase usa tooling estándar; ElectroCraft no reconstruye compilador, bundler ni test runners.

## TypeScript
- Package pin CI: `typescript@7.0.2`.
- Responsabilidad: typecheck de superficies TS; M01.2 será owner del modo `strict`, aliases finales y reglas TS de arquitectura.
- Fuente primaria/package: https://www.npmjs.com/package/typescript

## Vite
- Package pin CI: `vite@8.2.0`.
- Responsabilidad: build real del entry library de `apps/studio`; no se crea bundler propio.
- API usada: `defineConfig` + library build.
- Fuente primaria/package: https://www.npmjs.com/package/vite

## Vitest
- Package pin CI: `vitest@4.1.10`.
- Responsabilidad: integration/negative gate sobre la matriz real de packages.
- API usada: `describe`, `it`, `expect`.
- Fuente primaria/package: https://www.npmjs.com/package/vitest

## Playwright Test
- Package pin CI: `@playwright/test@1.61.1`.
- Responsabilidad: test-runner E2E/architecture sobre artifacts construidos; M01.1 no necesita navegador porque no crea UI de producto.
- API usada: `test`, `expect`.
- Fuente primaria/package: https://www.npmjs.com/package/@playwright/test

## Boundary ElectroCraft
ElectroCraft solo aporta package graph, reglas canónicas de dependencia, fixtures, composition roots y CI. No implementa un compilador TS, bundler, unit runner o E2E runner alternativo.
