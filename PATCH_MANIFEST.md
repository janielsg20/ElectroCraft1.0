# ElectroCraft1.0 — M03.1 update v4 overlay

Base exacta: `main@0afa33651a677fb2a1d47cf45c38fa7b22df6239`.

## Qué consolida
Esta revisión conserva los primitives reales `radix-ui`, Lucide, Tailwind v4, schema/migration, i18n/help/shell, High Density y coverage de navegador. Además corrige el gate de cierre: la spec canónica M03.1 exige validación visual/E2E pero no un SVG de referencia externo.

## Archivos principales
- `packages/design-system/**`
- `apps/studio/src/{shell,i18n,help}/**`
- `apps/studio/src/App.tsx` y `apps/studio/vite.config.ts`
- `tooling/vitest/**/design-system-*.test.ts`
- `tooling/playwright/m03-1-design-system.spec.ts`
- `tooling/scripts/verify-m03-1-design-system.mjs`
- `.github/workflows/{ci,m03-1-design-system}.yml`
- `.ai/evidence/F03/M03.1/**` y continuidad `STATE/TRACKING/MEMORY/HANDOFF`
- `M03_1_LOCAL_GATE.md`

## Compatibilidad arquitectónica
- `@electrocraft/design-system` conserva un único export público (`.`).
- Sin wildcard aliases ni deep workspace imports.
- shadcn usa aliases privados `#...` mediante `package.json#imports`.
- Tailwind v4 registra el source compartido mediante `@source`.
- UI visible nueva pasa por i18n español y la ayuda persistente usa `help.studio.shell`.
- Revisión React: sin `useMemo` trivial, Lucide lookups hoisted y sin nuevos hardcodes visibles de shell/galería fuera del seam tipado M03.1.
- Pins revalidados el 2026-08-19; `lucide-react` se actualiza a `1.31.0` antes del lockfile porque es el `latest` estable observado.

## Lockfile
`package-lock.json` no se fabrica en este runtime porque el registry npm no es alcanzable. Las versiones están fijadas en manifests y el verificador falla cerrado si el lock no queda sincronizado tras aplicar el overlay.

## Gate v4
- `tooling/scripts/verify-m03-1-design-system.mjs` genera `tooling/dist/m03-1-design-system-report.json`.
- Falla cerrado por `package-lock.json` ausente/desincronizado.
- Registra como contrato visual ejecutable `/__design-system` + Playwright en 360/768/1440 y teclado/focus/theme/Dropdown/Sheet.
- `ELECTROCRAFT_M03_1_ALLOW_EXTERNAL_BLOCKERS=1` sirve solo para inspección estructural local; nunca equivale a cierre.
- En GitHub Actions, un lock obsoleto se regenera de forma temporal, se prueba de extremo a extremo y se publica como artifact `m03-1-lockfile-candidate`; el job falla después para exigir que el lock real sea versionado.

M03.1 permanece `ACTIVE` hasta ejecutar el toolchain completo y obtener gate verde. M03.2 no se implementa en este ZIP.
