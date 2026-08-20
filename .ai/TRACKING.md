# TRACKING — ElectroCraft current position

Date: 2026-08-19.

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
| F03 / M03.10 | ACTIVE | `.ai/microphases/M03_10.md` |

## Cierre canónico M03.9
- Rama `codex/m03-9-editor-session-appearance-profile`; PR `#23` abierto contra `main`.
- Head final `457375512fcc3cc9da056720b86bad0c7233d920`.
- Workflow propietario `M03.9 Editor Appearance Profile Gate`: run `32315742507` success; job `96267423764`.
- Artifact `9388009972`; digest `sha256:d802096889a8ffed4a3806e5bb3bce8e11e570676cdee142afc9ba74a3a3cb5d`.
- Suite dedicada: unit `8/8`, contract `4/4`, integration `2/2`; Playwright dedicado `7/7`.
- Full gate: Node `37/37`, Vitest `244/244` en 66 archivos, Playwright `52/52`, lint/format/typecheck/boundaries/build GREEN.
- `StudioAppearanceProfile` permanece fuera de ElectroCraftDocument/Theme/ExportIR y se aplica mediante tokens del Studio.
- M01.4 histórico quedó reparado para instalación bloqueada + Chromium; run `32315742430` success.
- Base CI run `32315742400` success y gates M03.1–M03.8 revalidados GREEN.

## Transición M03.10
- M03.10 es la única microfase `ACTIVE`.
- Owner OSS: `i18next + react-i18next + i18next CLI/tooling` detrás de adapters ElectroCraft.
- Ubicación transversal; selector visible en `Configuración > General > Idioma`.
- Debe consolidar los catálogos españoles ya existentes en una infraestructura tipada y verificable, sin crear un segundo sistema i18n paralelo.
- Debe mantener IDs/slugs/component IDs canónicos estables en inglés y traducir únicamente copy visible.
- Artefactos obligatorios: `packages/i18n/`, `locales/es/`, `I18N_SPEC.md` y ui-string lint/test.
- Gates obligatorios: namespaces, fallback español, missing-key failure, Intl/pluralización, E2E sin labels inglesas, lint/typecheck/test/build.

## Historial extendido
- hasta M00.8: `.ai/TRACKING_HISTORY_THROUGH_M00.8.md`;
- M00.9–M01.5: `.ai/archive/TRACKING_THROUGH_M01.5_2026-08-18.md`;
- changelog histórico: `.ai/archive/CHANGELOG_THROUGH_M00.8_2026-08-17.md`;
- cierres F02: `.ai/evidence/F02/`;
- cierres/progreso F03: `.ai/evidence/F03/`.
