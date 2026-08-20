# TRACKING — ElectroCraft current position

Date: 2026-08-20.

El historial detallado previo permanece versionado en Git y en los archivos de evidencia/archivo. Este documento mantiene la posición operativa actual sin duplicar logs extensos.

## Estado por fase
| Scope | Estado | Evidencia principal |
|---|---|---|
| F00 | COMPLETADA | `.ai/evidence/F00/` |
| F01 / M01.1–M01.6 | COMPLETADA / GREEN | `.ai/evidence/F01/` |
| F02 / M02.1–M02.9 | COMPLETADA / GREEN | `.ai/evidence/F02/` |
| M03.1 | COMPLETADA / GREEN | `.ai/evidence/F03/M03.1/CLOSURE_2026-08-19.md` |
| M03.2 | COMPLETADA / GREEN | `.ai/evidence/F03/M03.2/CLOSURE_2026-08-19.md` |
| M03.3 | COMPLETADA / GREEN | `.ai/evidence/F03/M03.3/CLOSURE_2026-08-19.md` |
| M03.4 | COMPLETADA / GREEN | `.ai/evidence/F03/M03.4/CLOSURE_2026-08-19.md` |
| M03.5 | COMPLETADA / GREEN | `.ai/evidence/F03/M03.5/CLOSURE_2026-08-19.md` |
| M03.6 | COMPLETADA / GREEN | `.ai/evidence/F03/M03.6/CLOSURE_2026-08-19.md` |
| M03.7 | COMPLETADA / GREEN | `.ai/evidence/F03/M03.7/CLOSURE_2026-08-19.md` |
| M03.8 | COMPLETADA / GREEN | `.ai/evidence/F03/M03.8/CLOSURE_2026-08-19.md` |
| M03.9 | COMPLETADA / GREEN | `.ai/evidence/F03/M03.9/CLOSURE_2026-08-19.md` |
| M03.10 | COMPLETADA / GREEN | `.ai/evidence/F03/M03.10/CLOSURE_2026-08-20.md` |
| F03 / M03.11 | ACTIVE | `.ai/microphases/M03_11.md` |

## Cierre canónico M03.10
- Rama `codex/m03-10-spanish-first-i18n`; PR `#24` apilado sobre M03.9.
- Head funcional `4731b1056bf8e75377e45f3ff1b438a4d9e9a101`.
- Workflow propietario `M03.10 Spanish-first i18n Gate`: run `32318184912` success; job `96274840342`.
- Artifact `9388906418`; digest `sha256:3f7573c3af3da92fd002097155d926505d1711feb6b09da336caf42511b0dba6`.
- Owner `@electrocraft/i18n`; pins i18next `26.3.6`, react-i18next `17.0.11`, i18next-cli `1.69.0`.
- 13 namespaces españoles; `es` inicial/fallback; strict keys; missing-key failure; Intl/error-code mapping.
- Settings > General > Idioma, AppShell/Sidebar centralizados y PuckLabelResolver preservando IDs internos.
- Suite dedicada `12/12`; browser audit `4/4`.
- Full gate: Node `39/39`, Vitest `256/256` en 69 archivos, Playwright `56/56`, lint/format/typecheck/boundaries/build/PWA GREEN.
- Boundary marker: aliases `20`, packages `18`, apps `2`.
- Base CI run `32318184871` success; artifact `9388919028`.
- M03.2 full repository gate independiente también GREEN sobre el mismo head.
- Blockers funcionales P0/P1: `0`.

## Transición M03.11
- M03.11 es la única microfase `ACTIVE`.
- Owner UI: Lucide + shadcn/ui Radix Tooltip/Popover/Sheet + infraestructura i18n M03.10.
- Debe crear un único HelpRegistry tipado, no popovers ad hoc por módulo.
- Debe crear HelpTrigger reutilizable y Help Drawer global con búsqueda por título, descripción, keyword y sección.
- Desktop usa Tooltip + Popover; móvil usa Sheet.
- Ayuda debe ser accesible por teclado, devolver foco al trigger y usar copy español del namespace `help`.
- Empty states reales deben enlazar `¿Qué puedo hacer aquí?` sin inventar datos ni capacidades.
- Debe respetar la navegación canónica cerrada por M03.3/APP_SHELL_SPEC aunque el wording antiguo de M03.11 enumere destinos obsoletos.

## Historial extendido
- hasta M00.8: `.ai/TRACKING_HISTORY_THROUGH_M00.8.md`;
- M00.9–M01.5: `.ai/archive/TRACKING_THROUGH_M01.5_2026-08-18.md`;
- changelog histórico: `.ai/archive/CHANGELOG_THROUGH_M00.8_2026-08-17.md`;
- cierres F02: `.ai/evidence/F02/`;
- cierres/progreso F03: `.ai/evidence/F03/`.
