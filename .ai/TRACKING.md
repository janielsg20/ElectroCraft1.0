# TRACKING — ElectroCraft current position

Date: 2026-08-19.

El historial detallado previo permanece versionado en Git hasta `main@5d6e5d341222b924c3f8eb40567ab15dc1628ff8` y en los archivos de evidencia/archivo indicados abajo. Este documento mantiene la posición operativa actual sin duplicar logs extensos.

## Estado por fase
| Scope | Estado | Evidencia principal |
|---|---|---|
| F00 | COMPLETADA | `.ai/evidence/F00/` |
| F01 / M01.1–M01.6 | COMPLETADA / GREEN | `.ai/evidence/F01/` |
| F02 / M02.1–M02.9 | COMPLETADA / GREEN | `.ai/evidence/F02/` |
| M03.1 | COMPLETADA / GREEN | `.ai/evidence/F03/M03.1/CLOSURE_2026-08-19.md` |
| M03.2 | COMPLETADA / GREEN | `.ai/evidence/F03/M03.2/CLOSURE_2026-08-19.md` |
| M03.3 | COMPLETADA / GREEN | `.ai/evidence/F03/M03.3/CLOSURE_2026-08-19.md` |
| F03 / M03.4 | ACTIVE | `.ai/microphases/M03_4.md` + `.ai/evidence/F03/M03.4/IMPLEMENTATION_2026-08-19.md` |

## Cierres canónicos recientes
### F02
- Run final `32197039836` — success.
- Artifact `9346213452`; digest `sha256:160658d864ba742265c958ecab629fe855e5d425a78a3f643ecfce908c0aaa12`.
- ProjectDefinition/Document v3; ownership 14/6/6; ExportIR target-neutral; wrappers OSS fail-closed.

### M03.1
- Head `c0ee291f29405a1f1dd9fb1c14afe7d13b3a45ae`.
- Run `32267795991` — success.
- Artifact `9370938322`; digest `sha256:0aa9467b713fcc66f19d91acfd6d31c783b35aaa5ddddda04a8d5a379760156f`.
- shadcn/ui Radix, Lucide, Tailwind v4, tokens, theme, galería, help/i18n y full gate GREEN.

### M03.2
- PR `#13`; merge `38b2f5aac504a406b42537b7aade8f3d26626e7d`.
- Run `32272740576` — success.
- Artifact `9372820239`; digest `sha256:81531bf99ddd82d56ba813ec87f15305f6af0407498915363d802b174c97bce8`.
- AppShell `100dvh`, Sidebar 240/64, Topbar 52, workspace flexible, Statusbar 26 y Sheet responsive.

### M03.3
- PR `#15`; merge `5d6e5d341222b924c3f8eb40567ab15dc1628ff8`.
- Run en `main` `32275890306` — success.
- Job `96143103350`; artifact `9374022673`; digest `sha256:3068924b873f9ccbff75f5ddfbfefa57ee8ddbb55c7baa2fce5bd0d0ce153923`.
- Node `27/27`, Vitest `161/161`, build PASS, Playwright `12/12`.
- Sidebar: 7 grupos / 24 destinos, Lucide, aria-current, Tooltip, 240→64 y WorkspacePreferencesPort in-memory.

## Implementación M03.4
- Base exacta: `main@5d6e5d341222b924c3f8eb40567ab15dc1628ff8`.
- Topbar 52px con left/center/right.
- Herramientas contextuales responsive; tablet/mobile a Sheet.
- Vista previa, Exportar, Local, Ayuda y Settings.
- Settings gear último; Sheet controla el mismo WorkspacePreferencesPort y conserva restore-focus Radix.
- Unit/contract/integration/Playwright + verifier/workflow preparados.
- M03.5 no puede iniciar hasta Gate GREEN de M03.4.

## Historial extendido
- hasta M00.8: `.ai/TRACKING_HISTORY_THROUGH_M00.8.md`;
- M00.9–M01.5: `.ai/archive/TRACKING_THROUGH_M01.5_2026-08-18.md`;
- changelog histórico: `.ai/archive/CHANGELOG_THROUGH_M00.8_2026-08-17.md`;
- cierres F02: `.ai/evidence/F02/`;
- cierres/progreso F03: `.ai/evidence/F03/`.
