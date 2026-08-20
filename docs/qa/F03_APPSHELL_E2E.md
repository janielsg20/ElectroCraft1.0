# F03 AppShell E2E QA

Fecha operativa: 2026-08-20.

## Objetivo
Cerrar F03 con una auditoría observable del AppShell real. La suite no crea pantallas ni datos para satisfacer tests: valida únicamente capacidades ya presentes y exige fail-closed en rutas desconocidas.

## Matriz
| Viewport | Modo esperado | Navegación/Editor |
|---|---|---|
| 1440 | desktop | Sidebar 240px; Contexto + Lienzo + Inspector |
| 1280 | desktop | Sidebar 240px; layout completo high-density |
| 1024 | laptop | rail 64px; Lienzo principal; secundarios en overlay |
| 768 | tablet | rail 56px; navegación/herramientas en Sheet |
| 375 | mobile | dock inferior + Sheets; sin Sidebar desktop |
| 320 | mobile | mismo flujo móvil; sin overflow horizontal |

Cada caso produce screenshot de evidencia mediante `testInfo.outputPath`. Playwright conserva además trace y screenshot de fallos desde la configuración global.

## Navegación canónica auditada
`Editor`, `Pantallas`, `Componentes`, `Plantillas`, `Generar con IA`, `Registros`, `Modelos`, `Fuentes de datos`, `Consultas`, `Acciones y workflows`, `Estado y variables`, `Formularios`, `Navegación`, `Usuarios y permisos`, `Administración`, `Medios`, `Extensiones`, `Temas`, `Sistema de diseño`, `Tokens`, `Vista previa`, `Compatibilidad`, `Exportar`, `Desplegar`.

El wording antiguo de M03.12 que enumera Automatizaciones/Roles no reemplaza la navegación cerrada por M03.3. Taxonomías y Relaciones tampoco son destinos superiores.

## Estados auditados
- `ready`: Statusbar visible en español;
- `empty`: Consultas muestra empty state real y `¿Qué puedo hacer aquí?`;
- `disabled`: Deshacer/Rehacer deshabilitados explicablemente;
- `blocked/fail-closed`: ruta desconocida no recibe destino activo;
- `saving/error`: permanecen cubiertos por los contratos AppShell/Topbar tipados y las suites F03 previas; M03.12 no introduce un simulador de estado para aparentar cobertura.

## Accesibilidad
- overlays se operan con teclado y `Escape` devuelve foco al trigger;
- icon-only mantienen aria-label;
- touch targets y mobile dock continúan cubiertos por M03.6;
- Help Drawer se abre con `Enter`, búsqueda tiene label persistente y el cierre devuelve foco.

## i18n y aislamiento
- se buscan labels inglesas conocidas, missing-key diagnostics y fugas visibles;
- la preferencia `electrocraft.studio.appearance.v1` se modifica sin crear storage de proyecto/Theme/Export;
- contract tests comprueban que StudioAppearanceProfile no importa `ElectroCraftDocument` ni `ExportIR` y no escribe `source.theme`.

## Timing
No se permiten `page.waitForTimeout`, `setTimeout` ni sleeps fijos en la suite M03.12. Se usan locators y web-first assertions con auto-waiting.
