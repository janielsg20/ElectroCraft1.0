# M01.3 — Empty functional repository fixture

`tooling/fixtures/empty-repo` contiene un repo mínimo sin datos demo ni código de producto.

En CI `tooling/scripts/verify-empty-repo-toolchain.mjs` lo copia a un directorio temporal y ejecuta, usando exactamente `node_modules/.bin` del root:
1. ESLint.
2. Prettier `--check`.
3. `tsc --noEmit`.
4. Vitest.
5. Vite production build.
6. Playwright Test sobre el artifact de build, sin necesidad de navegador porque M01.3 no crea interacción UI.

Marker esperado: `PASS_M01_3_EMPTY_REPO_TOOLCHAIN`.
