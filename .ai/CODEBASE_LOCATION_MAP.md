# CODEBASE LOCATION MAP — ElectroCraft Eighth Final

Este mapa es obligatorio para impedir que una IA cree módulos en lugares arbitrarios.

## Monorepo

### F00
- `experiments/`
- `.ai/adr/`
- `.ai/evidence/F00/`

### F01
- `apps/studio/`
- `packages/*/`
- `.github/workflows/`
- `tooling/`

### F02
- `packages/domain/`
- `packages/application/`
- `packages/contracts/`

### F03
- `packages/design-system/`
- `apps/studio/src/shell/`
- `apps/studio/src/i18n/`
- `apps/studio/src/help/`

### F04
- `packages/data-web/`
- `packages/application/src/projects/`
- `apps/studio/src/features/projects/`

### F05
- `packages/editor-puck/`
- `apps/studio/src/features/editor/`

### F06
- `packages/editor-puck/`
- `packages/design-system/`
- `apps/studio/src/features/editor/advanced/`

### F07
- `packages/domain/src/navigation/`
- `packages/application/src/navigation/`
- `apps/studio/src/features/navigation/`

### F08
- `packages/connectors/`
- `packages/data-web/`
- `packages/domain/src/data/`
- `apps/studio/src/features/data/`

### F09
- `packages/query-builder/`
- `packages/application/src/query/`
- `apps/studio/src/features/queries/`

### F10
- `packages/media/`
- `packages/rich-text/`
- `apps/studio/src/features/media/`

### F11
- `packages/state-runtime/`
- `packages/domain/src/state/`
- `apps/studio/src/features/state/`

### F12
- `packages/auth/`
- `packages/permissions/`
- `apps/studio/src/features/access/`

### F13
- `packages/workflow-rete/`
- `packages/domain/src/actions/`
- `apps/studio/src/features/workflows/`

### F14
- `packages/forms/`
- `apps/studio/src/features/forms/`

### F15
- `packages/admin-refine/`
- `apps/studio/src/features/administration/`

### F16
- `packages/themes/`
- `packages/reusables/`
- `apps/studio/src/features/appearance/`
- `apps/studio/src/features/templates/`

### F17
- `packages/extensions/`
- `packages/app-templates/`
- `apps/studio/src/features/extensions/`

### F18
- `packages/ai/`
- `apps/studio/src/features/ai/`
- `apps/studio/src/components/ai-elements/`

### F19
- `packages/preview/`
- `apps/studio/src/features/preview/`

### F20
- `packages/export-core/`
- `packages/compatibility/`
- `apps/studio/src/features/export/`

### F21
- `packages/runtime-web/`
- `packages/export-web/`
- `packages/export-core/`

### F22
- `packages/runtime-native/`
- `packages/data-native/`

### F23
- `packages/export-native/`
- `packages/runtime-native/`

### F24
- `packages/export-capacitor/`
- `packages/export-core/`

### F25
- `packages/export-lamp/`
- `packages/export-core/`
- `fixtures/lamp/`

### F26
- `packages/export-wordpress/`
- `packages/export-core/`
- `fixtures/wordpress/`

### F27
- `packages/testing/`
- `fixtures/canonical-app/`
- `.ai/evidence/F27/`
- `.ai/`

## Regla
Una microfase puede crear un submódulo dentro de estas raíces, pero no una raíz paralela sin ADR.
Los nombres finales de archivos se derivan de la capacidad; los packages anteriores son ownership boundaries.
UI nunca importa directamente una base de datos/engine target que pertenezca a otro package.
