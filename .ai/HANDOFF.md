# HANDOFF — ElectroCraft

## Current
F02 / M02.5 — Definir Theme, Blueprint, Registries y Capability ownership — `ACTIVE`.

## Siguiente acción exacta
1. Leer `.ai/microphases/M02_5.md`, `.ai/MODEL_OWNERSHIP.md` y contratos cerrados M02.1–M02.4.
2. Definir `ElectroCraftTheme` exclusivamente para diseño visual: tokens, typography, variants, spacing, radius, shadows y motion.
3. Mantener template como `ElectroCraftDocument kind=template` + metadata/display conditions; no crear un segundo árbol visual.
4. Definir `ElectroCraftBlueprintPackage` externo/versionado con origen, installer plan, conflictos y rollback; el proyecto solo conserva `originBlueprint` opcional y objetos instalados normales.
5. Definir `ElectroPlatformCapabilityRegistry` y Component/Field/Action/Provider registries como registries versionados de aplicación; no serializar el registry completo dentro de cada proyecto.
6. Persistir/derivar únicamente `requiredCapabilities`, overrides específicos por target y definitions creadas por usuario cuando correspondan.
7. Actualizar `MODEL_OWNERSHIP.md`, `help.architecture.models`, domain schemas/serializers y application-facing services sin importar engines.
8. Añadir fixtures obligatorios: install/conflict/rollback, registry analyzer/report, supported/adapted/blocked y round-trip/boundary.
9. Ejecutar unit/contract/integration/negative/persistence, lint, typecheck, full check, build y CI real; registrar artifact y digest.
10. Solo después activar M02.6.

## Read set
`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M02_5.md`.

M02.1–M02.4 están cerradas; no reabrirlas salvo regresión reproducible.
