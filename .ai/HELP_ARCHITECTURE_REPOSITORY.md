# HelpDescriptor — `help.architecture.repository`

**Idioma:** Español.

## Título
Arquitectura del repositorio

## Resumen
ElectroCraft usa un monorepo con límites explícitos para que cada engine OSS conserve su responsabilidad y el producto mantenga un único modelo canónico.

## Ayuda persistente
- `domain` contiene contratos y modelo canónico sin frameworks.
- `application` contiene casos de uso y ports; depende de `domain`.
- Los packages adapter integran su engine OSS propietario sin convertir internals del engine en datos canónicos.
- `runtime-native` no depende de DOM, Puck, Administración ni runtime Web.
- `exporters` consume `export-ir`/contratos y nunca la UI del Studio.
- `apps/studio` y `apps/native-preview` son composition roots; no son owners del modelo canónico.

La misma información queda disponible como fixture estructurado en `tooling/fixtures/help.architecture.repository.json` para el futuro `HelpRegistry` de F03; F01 no crea un registro de ayuda paralelo.

## M01.2 — TypeScript y límites de importación
- TypeScript se ejecuta con `strict: true` desde `tsconfig.base.json`.
- Cada `@electrocraft/*` resuelve únicamente al `src/index.ts` público de su owner; no existen aliases wildcard.
- Los deep imports (`@electrocraft/pkg/src/...`) están prohibidos.
- Un import relativo no puede cruzar desde un package/app hacia otro owner.
- `domain` no puede importar React, Puck, Drizzle, Expo/React Native, DOM ni filesystem/path.
- Los errores de arquitectura se consideran errores de build reparables, no warnings.

## M01.3 — Toolchain de calidad
- ESLint valida JS/tooling con flat config.
- Prettier es el único owner de formato.
- TypeScript 7 se mantiene bajo `tsc` strict; no se fuerza un typescript-eslint fuera de su rango soportado.
- Vitest separa unit/contract/integration.
- Playwright Test ejecuta el gate E2E/QA.
- `npm run check` es el pipeline completo antes de avanzar.

## M01.4 — Studio Vite/PWA bootstrap
- `apps/studio` pasa de artifact arquitectónico a composition root React/Vite real.
- La ruta `/` contiene únicamente Project Home temporal de desarrollo; no crea el modelo final de navegación.
- La PWA es un shell técnico: manifiesto + service worker generado, sin runtime caching ni estrategia avanzada en esta microfase.
- El Studio referencia este descriptor mediante `help.architecture.repository`; F01 no introduce un HelpRegistry paralelo antes de F03.
- El bootstrap no persiste datos demo, internals de Vite/Workbox ni un segundo modelo canónico.
