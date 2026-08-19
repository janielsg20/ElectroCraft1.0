# TRACKING — ElectroCraft current position

Date: 2026-08-19.

Historial detallado:
- hasta M00.8: `.ai/TRACKING_HISTORY_THROUGH_M00.8.md`;
- M00.9–M01.5: `.ai/archive/TRACKING_THROUGH_M01.5_2026-08-18.md`;
- changelog histórico: `.ai/archive/CHANGELOG_THROUGH_M00.8_2026-08-17.md`.

| Scope | Estado | Evidencia principal |
|---|---|---|
| F00 | COMPLETADA | `.ai/evidence/F00/` |
| M01.1–M01.6 | COMPLETADAS | `.ai/evidence/F01/` + workflows heredados |
| F01 Gate | GREEN | `.ai/evidence/F01/M01.6/CLOSURE_2026-08-18.md` |
| M02.1 | COMPLETADA | `.ai/evidence/F02/M02.1/CLOSURE_2026-08-18.md` |
| M02.2 | COMPLETADA | `.ai/evidence/F02/M02.2/CLOSURE_2026-08-18.md` |
| M02.3 | COMPLETADA | `.ai/evidence/F02/M02.3/CLOSURE_2026-08-18.md` |
| M02.4 | COMPLETADA | `.ai/evidence/F02/M02.4/CLOSURE_2026-08-18.md` |
| M02.5 | COMPLETADA | `.ai/evidence/F02/M02.5/CLOSURE_2026-08-18.md` |
| M02.6 | COMPLETADA | `.ai/evidence/F02/M02.6/CLOSURE_2026-08-18.md` |
| M02.7 | COMPLETADA | `.ai/evidence/F02/M02.7/CLOSURE_2026-08-18.md` |
| M02.8 | COMPLETADA | `.ai/evidence/F02/M02.8/CLOSURE_2026-08-18.md` |
| M02.9 | COMPLETADA | `.ai/evidence/F02/M02.9/CLOSURE_2026-08-18.md` |
| F02 Gate | GREEN | `.ai/evidence/F02/CLOSURE_2026-08-18.md` |
| M03.1 | COMPLETADA / GREEN | `.ai/evidence/F03/M03.1/CLOSURE_2026-08-19.md` |
| F03 / M03.2 | ACTIVE | `.ai/microphases/M03_2.md` + `.ai/evidence/F03/M03.2/IMPLEMENTATION_2026-08-19.md` |

## Cierre M02.1
- PR `#3`; squash merge `cf4649d98f96a553daa020581a918d9559131137`.
- Zod `4.4.3`; ProjectDefinition/Document/IDs/refs/migración `page -> screen`; 12/12 tests; artifact `9336023224`.

## Cierre M02.2
- PR `#4`; squash merge `80a30bb992804a5c0bc839b001022f844001754a`.
- ComponentDefinition/Layout/Style portables/versionados; adapter real Puck `0.22.4`; 12/12 tests; run `32170341661`; artifact `9337016899`.

## Cierre M02.3
- Implementación integrada: `9bc51e70407ea37b48072e48cf5c01a1e2719565`.
- DataSource/DataSchema/DataModel/Query/Form bindings portables/versionados; RQB `8.23.0` + PGlite `0.5.5`.
- Gate `32173466071` success; artifact `9338135809`; digest `sha256:59cb527f9451c0e1c1e1d22f9fc5ee3600041b0a29bd0c44f53ab8fbf0428382`.

## Cierre M02.4
- PR `#6`; squash merge `786a3364ed342ac39c50d5e8d30e9705c02cf8df`.
- ActionGraph/State/Route/Navigation/Role/PermissionPolicy; Rete `2.0.6`; Zustand `5.0.14`; fail-closed permissions.
- Gate main `32179623373` success; artifact `9340298589`; digest `sha256:0e5510f45d214343131e5c203f8ab04fc85c9f677e0aa027b71e5726e4abfc64`.

## Cierre M02.5
- PR `#7`; squash merge `7cb7016d6ae6e4e91cef3a7de41de66cb861fc55`.
- Theme visual-only, Blueprint install/conflict/rollback, registries de application y capability analysis neutral; ProjectDefinition/Document schema v3.
- Suite dedicada `14/14`; gate main `32182633428` success; artifact `9341317925`; digest `sha256:13d612fd3c8ae4af6cb88b52e5f3b1ce6d56d77e844b38f6625d959638a7f026`.

## Cierre M02.6
- PR `#8`; squash merge `c74fc8284a56487dc56b9dbb90775fb592f803d8`.
- JSON canónico determinista compartido, checksum `fnv1a64`, MigrationRegistry v1→v2→v3 e import transaccional fail-closed.
- Suite dedicada `14/14`; suite acumulada: Node `27/27`, Vitest `97/97`, Playwright `1/1`.
- Gate main `32186495673` success; artifact `9342646837`; digest `sha256:35ce99bc90392494dd1d0e6a276a41ec245e4b62a849a6d6f59fb454404121cc`.

## Cierre M02.7
- PR `#9`; squash merge `572baebbd6aa5bb62b57d085f7d178d49dd699e2`.
- `ElectroCraftExportIR` immutable/versionado y neutral a target; nueve targets Core y `TargetCompileContext` separado.
- Checksum fixture `fnv1a64:3f5ab54591022ac0`; suite dedicada `11/11`; acumulada Node `27/27`, Vitest `108/108`, Playwright `1/1`.
- Gate main `32191193359` success; artifact `9344256616`; digest `sha256:52f1fd78d673b8094bf29be9d1b47e8aa7a1b92aa8f8c4b9e6f219687a3d375b`.

## Cierre M02.8
- PR `#10`; squash merge `cd89199a44ffbd2efda7892a4e658145de70b500`.
- Taxonomía ejecutable: 14 Project Objects + 6 Application Registries + 6 Content Entities; ownership/export boundary fail-closed.
- ProjectDefinition/Document permanecen v3; suite dedicada `9/9`.
- Gate main `32193738411` success; artifact `9345132952`; digest `sha256:7751ba52ff3cf167dad37e604617a1ac2fef808491952394bdb83023c825af1f`.

## Cierre M02.9
- PR `#11`; squash merge `53401b29df8ef44deb69468c92cd36ae5f547761`.
- Wrapper portable determinista `{ engine, schemaVersion, value }`; domain permanece engine-agnostic.
- RQB rules con `@react-querybuilder/core@8.23.0`; Tiptap rich-text JSON con grafo exacto `3.29.2` de core/html/Document/Paragraph/Text.
- Runtime/editor state de Puck/Rete/Zustand permanece fuera del modelo canónico.
- Suite dedicada `11/11`; acumulada Node `27/27`, Vitest `128/128`, Playwright `1/1`.
- Gate main `32196416073` success; artifact `9346006290`; digest `sha256:0083bf96e88e0935a9876a37d8fc465b8315e03ec836dcd1d8bd8609c0d8770b`.

## Cierre F02
- Gate final `.github/workflows/f02-canonical-model-gate.yml` ejecutó las nueve suites dedicadas y luego `npm run check` sobre el árbol integrado.
- Run definitivo `32197039836` — `success` sobre `83d67d31ab10ac5b588b43ff7136e9cd219c62ef`.
- Marker: `PASS_F02_CANONICAL_MODEL_GATE`.
- Artifact: `9346213452` — `f02-canonical-model-evidence`.
- Digest: `sha256:160658d864ba742265c958ecab629fe855e5d425a78a3f643ecfce908c0aaa12`.
- Invariantes: 17 owners, sin `packages/contracts`, ProjectDefinition/Document v3, ownership 14/6/6, ExportIR target-neutral, wrappers OSS fail-closed, Node 27/27, Vitest 128/128, Playwright 1/1, blockers P0/P1 `0`.

## Avance M03.1 — sesión local 2026-08-18
- Base exacta: `main@0afa33651a677fb2a1d47cf45c38fa7b22df6239`.
- Docs oficiales actuales de shadcn Vite/theming/components/CLI verificadas.
- Foundation local preparada: tokens light/dark + High Density, primitives reales `radix-ui`, Lucide registry, Tailwind v4, galería `/__design-system`, i18n/help/shell y tests dedicados.
- Parseo sintáctico TypeScript/TSX de archivos editados: `PASS` mediante TypeScript compiler API; el typecheck completo sigue pendiente de dependencias.
- JSON de `components.json` y `packages/design-system/package.json`: `PASS` mediante parser estándar.
- Auditoría del contrato visual: la spec M03.1 requiere visual/E2E responsive, pero no un SVG externo; se elimina ese falso blocker y la evidencia visual queda en `/__design-system` + Playwright.
- Resolución/instalación npm local: `BLOCKED` por registry inaccesible. Se añadió bootstrap seguro en GitHub Actions: genera lock candidato real, ejecuta el gate completo, sube `m03-1-lockfile-candidate` y falla al final hasta versionarlo; no modifica el repo automáticamente.
- Gate ejecutable offline: `PASS_M03_1_DESIGN_SYSTEM_STRUCTURE`; parseo TS/TSX `26 archivos / 0 errores`; JSON `5/5`; YAML `2/2`; runtime foundation/migración `PASS`.
- Boundary compatibility corregida: sin subpath exports de workspace, sin aliases wildcard y sin deep import desde Studio; shadcn usa `package.json#imports` locales dentro del owner.
- Tailwind monorepo corregido: `@source` registra explícitamente `packages/design-system/src`; CI base y gate M03.1 instalan Chromium antes del E2E real.
- Revisión React/shadcn 2026-08-19: se eliminó memoización trivial, se hoistaron lookups Lucide y el copy nuevo visible de M03.1 pasa por el catálogo tipado; i18next real se mantiene reservado para M03.10 según su spec.
- `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` y Playwright real: `NOT_RUN` por checkout/dependencias completas no disponibles.
- En ese corte M03.1 permanecía `ACTIVE`; quedó cerrada posteriormente en `.ai/evidence/F03/M03.1/CLOSURE_2026-08-19.md`.

## M03.1 — Actions run 32266099186 (2026-08-19)
- Head: `1ab2ce7f9f1340cd07ad20c66370d65aa56d2bf9`.
- `Prepare reproducible M03.1 lock candidate`: PASS.
- `Verify M03.1 closure inputs and structure`: PASS (`blockers=0`, `lockVerified=true`).
- `npm ci`: PASS, 625 packages instalados.
- Pins instalados: PASS (`radix-ui@1.6.7`, `lucide-react@1.31.0`, `tailwindcss@4.3.3`).
- Suite dedicada: PASS, `3` test files / `15` tests.
- Playwright Chromium install: PASS.
- Full `npm run check`: STOP en `format:check`; Prettier reportó exactamente `14` archivos con estilo pendiente antes de llegar a typecheck/tests/build/E2E.
- Lock artifact: `9370267875`, digest del artifact ZIP `sha256:e8f3bc70e3d639cf840798eff418441a99db55593c36cea8fe3f2e9010d79f48`.
- Evidence artifact: `9370268489`, digest `sha256:a6100d24028f977c166437e6361622868bcf8314892a9e4d23e38ee1c5c4f91f`.
- Lock recuperado: `package-lock.json` SHA-256 `1025aa726810d4fbbc313829ae59df9b4c5e85bf5f7ddb553daa754c75ca8789`.
- Overlay v5 incorpora el lock real y convierte Prettier en candidato reproducible: formatea temporalmente, sube patch/tar exacto y continúa el full gate sobre el árbol ya formateado.
- Estado de ese run: M03.1 seguía `ACTIVE`; este bloqueo quedó resuelto antes del cierre definitivo.

## M03.1 — Actions run 32267262219 (2026-08-19)
- Head: `cecce5531050b3617911d21de8ac3d65cbf8892c`.
- Lockfile: sincronizado; no se requirió nuevo candidato.
- Verifier M03.1: PASS.
- `npm ci`: PASS.
- Pins instalados: PASS.
- Formatting candidate: generado por Prettier 3.9.6 para exactamente 14 archivos.
- Suite dedicada: PASS, `15/15`.
- Chromium: PASS.
- Full `npm run check` sobre el árbol formateado: PASS completo, incluyendo lint, typecheck, boundaries, tests, build y Playwright E2E.
- Marker de ejecución: PASS.
- Artifact de formato: `9370734134`, digest `sha256:3cf346e520f2302250ca84e5bb81c920464a72b49ee989af7296ce6b69cd546a`.
- Job final: `failure` esperado exclusivamente por `Require committed formatting synchronization`.
- Overlay v6 incorpora exactamente esos 14 archivos; siguiente ejecución debe confirmar GREEN antes de activar M03.2.
- Estado de ese run: M03.1 seguía `ACTIVE`; el cierre definitivo ocurrió en run `32267795991`.

## Gate actual
F02 `COMPLETADA` / Gate F02 `GREEN`. F03 está `IN_PROGRESS`; M03.1 `COMPLETADA/GREEN` y M03.2 es la única microfase `ACTIVE`.

## Siguiente transición permitida
Cerrar exclusivamente M03.2 con gate completo y validación visual/teclado. Solo después avanzar a M03.3 — Construir Sidebar global.

## M03.1 — progreso adicional 2026-08-18
- Se corrigió la primera implementación parcial: Tooltip/Dropdown/Sheet/ScrollArea/Separator ahora delegan en `radix-ui` real.
- Se añadieron Lucide registry, Tailwind v4, config versionada+migration/round-trip, `shell/`, `i18n/`, `help/`, Vitest y Playwright.
- En ese corte M03.1 continuaba `ACTIVE`; lockfile/CI/browser fueron resueltos y M03.1 cerró GREEN posteriormente.
- Revisión 2026-08-19: el schema oficial en vivo de shadcn confirma `style: radix-nova`; no se migra a una forma experimental.
- El gate M03.1 v4 convierte el bloqueo real en condición ejecutable: valida el grafo exacto en `package-lock.json`, documenta la validación visual Playwright en `tooling/dist/m03-1-design-system-report.json` y falla cerrado en CI.
- Si el lock del commit está obsoleto, el mismo workflow genera un candidato, corre verifier/npm ci/tests/build/Playwright con él, lo sube como artifact y devuelve fallo intencional de sincronización; una segunda pasada con el lock versionado puede cerrar GREEN.
- La especificación M03.2 fue preleída en ese corte; tras el cierre GREEN de M03.1, M03.2 quedó habilitada y ahora está `ACTIVE`.


## Cierre M03.1 — 2026-08-19
- Head definitivo: `c0ee291f29405a1f1dd9fb1c14afe7d13b3a45ae`.
- Run `32267795991`: success.
- Artifact `9370938322`; digest `sha256:0aa9467b713fcc66f19d91acfd6d31c783b35aaa5ddddda04a8d5a379760156f`.
- Lock y formato sincronizados; verifier, npm ci, suite dedicada, build y Playwright quedaron GREEN.
- M03.1: `COMPLETADA`.

## Inicio M03.2 — 2026-08-19
- AppShell estructural `100dvh`, Sidebar `240/64`, Topbar `52`, workspace flexible y Statusbar `26`.
- Responsive: desktop completo; laptop rail 64; tablet/mobile Sheet Radix.
- Ayuda `help.studio.shell`, copy español tipado y `studio.menu` Lucide.
- Suites dedicadas unit/contract/integration/E2E y workflow `m03-2-app-shell.yml` añadidos.
- Estado: `ACTIVE` hasta Gate GREEN.
- Próxima microfase permitida después del cierre: M03.3 — Construir Sidebar global.
