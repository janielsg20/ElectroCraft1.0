# ElectroCraft1.0 — M03.1 update v6 overlay

Base de aplicación: `main@cecce5531050b3617911d21de8ac3d65cbf8892c`.

## Objetivo
Esta revisión incorpora exactamente el formatting candidate generado por GitHub Actions run `32267262219` sobre M03.1 v5. No cambia comportamiento funcional: sincroniza los 14 archivos que Prettier 3.9.6 modificó durante el gate real.

## Evidencia del run v5
- `Prepare reproducible M03.1 lock candidate`: PASS; el lock ya estaba sincronizado.
- `Verify M03.1 closure inputs and structure`: PASS.
- `npm ci`: PASS.
- Pins Radix/Lucide/Tailwind: PASS.
- `Prepare reproducible formatting candidate`: PASS.
- Suite dedicada M03.1: PASS, 15/15.
- Playwright Chromium install: PASS.
- `Execute repository gate` (`npm run check`) sobre el árbol temporalmente formateado: PASS completo, incluyendo lint, typecheck, tests, build y Playwright E2E.
- El job terminó en failure únicamente en `Require committed formatting synchronization`, por diseño fail-closed.

## Artifact aplicado
- Artifact: `9370734134` — `m03-1-formatting-candidate`.
- Digest artifact: `sha256:3cf346e520f2302250ca84e5bb81c920464a72b49ee989af7296ce6b69cd546a`.
- Contiene 14 archivos formateados + patch reproducible.

## Archivos sincronizados desde Actions
- `apps/studio/src/App.tsx`
- `apps/studio/src/i18n/studio-shell.es.ts`
- `apps/studio/src/shell/design-system-route.tsx`
- `packages/design-system/src/components/ui/button.tsx`
- `packages/design-system/src/components/ui/dropdown-menu.tsx`
- `packages/design-system/src/components/ui/scroll-area.tsx`
- `packages/design-system/src/components/ui/separator.tsx`
- `packages/design-system/src/components/ui/sheet.tsx`
- `packages/design-system/src/components/ui/tooltip.tsx`
- `packages/design-system/src/design-system-gallery.tsx`
- `packages/design-system/src/foundation/theme-provider.tsx`
- `tooling/scripts/verify-m03-1-design-system.mjs`
- `tooling/vitest/contract/design-system-owner-boundary.test.ts`
- `tsconfig.base.json`

## Estado
M03.1 permanece `ACTIVE` únicamente hasta reejecutar el mismo gate sobre estos 14 archivos ya versionados. Si no aparece un fallo nuevo, el siguiente run debe poder producir `electrocraft/M03.1 = success`, registrar el cierre y habilitar M03.2.
