# Sistema documental `.ai/` — ElectroCraft

Este archivo es el mapa documental canónico. `AGENTS.md` es solo el entry point corto.

## Orden mínimo por sesión
`RULES → MEMORY → STATE → TRACKING → HANDOFF → microfase ACTIVE`.

La microfase activa enlaza las specs adicionales necesarias. No cargues todo `.ai/` por defecto.

## Fuentes de verdad
- `PROMPT_MAESTRO_ELECTROCRAFT_2.md` — alias estable del Prompt Maestro canónico.
- `MASTER_SPEC.md` — índice del contrato maestro.
- `REQUIREMENTS.md` — requisitos atómicos.
- `RULES.md` — reglas obligatorias de implementación.
- `ARCHITECTURE.md` / `DATA_MODELS.md` — ownership y modelos portables.
- `DECISIONS.md` — resumen de ADR vigentes; detalle en `adr/`.
- `PHASES.md`, `phases/`, `microphases/` — ejecución prescriptiva.

## Continuidad
- `MEMORY.md` — solo hechos estables y decisiones vigentes; nunca logs/progreso.
- `STATE.md` — estado actual compacto y única microfase `ACTIVE`.
- `TRACKING.md` — tabla de posición/gates; evidencia detallada vive en `evidence/`.
- `HANDOFF.md` — siguiente acción exacta para retomar trabajo.
- `BLOCKERS.md` — bloqueos reales P0/P1/P2 con evidencia.
- `CHANGELOG.md` — historia de cambios de producto/arquitectura.

## Specs por área
### UI/editor
`EDITOR_ENGINE.md`, `WIDGET_SYSTEM.md`, `DESIGN_SYSTEM.md`, `THEME_SYSTEM.md`, `APP_SHELL_SPEC.md`, `SCREEN_BY_SCREEN_SPEC.md`, `UI_UX_LAYOUT_RULES.md`, `ACCESSIBILITY.md`.

### Datos/administración
`DATA_ARCHITECTURE.md`, `DATA_SOURCE_ARCHITECTURE.md`, `CONTENT_ENGINE.md`, `BACKEND_BUILDER.md`.

### AI
`AI_ARCHITECTURE.md`, `AI_PROVIDER_GEMINI.md`, `AI_UI_ELEMENTS_SPEC.md`, `AI_TOOL_CATALOG.md`, `AI_SECURITY_PRIVACY.md`.

### Export
`EXPORT_TARGET_CONTRACT.md`, `EXPORT_PARITY_MATRIX.md` y la spec específica del target.

### QA/seguridad
`TEST_STRATEGY.md`, `SECURITY.md`, `ACCESSIBILITY.md`, `TRACEABILITY_MATRIX.md`.

## Convenciones de archivos
- Evidencia real: `evidence/<fase>/<microfase>/`.
- Templates: `templates/` (`MICROPHASE`, `ADR`, `BUG`, `HANDOFF`).
- ADR detallados: `adr/`; `DECISIONS.md` conserva solo el resumen vigente.
- Historia y review reports no canónicos: `archive/` o archivos `*_HISTORY_*`.
- Un archivo archivado nunca compite con `STATE`, `TRACKING`, `HANDOFF`, `MASTER_SPEC` o la microfase activa.

## Validación automática
`npm run test:docs` valida required files, phase/microphase references, templates, MEMORY sin progreso y una única microfase `ACTIVE`.
`npm run build:docs` genera `tooling/dist/m01-6-doc-conventions-report.json`.

Ayuda persistente: `help.architecture.repository`.
