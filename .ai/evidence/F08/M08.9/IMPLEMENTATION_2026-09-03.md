# M08.9 — Group, Repeater, Calculated y Conditional Fields — Implementación 2026-09-03

## Estado

`IMPLEMENTADA / CANDIDATA A GATE CI`.

La microfase permanece `ACTIVE` hasta que ElectroCraft Base CI/Playwright termine en `success`.

## Ownership y storage

- modelo canónico: `ElectroCraftDataModel` / `ElectroCraftDataField`;
- runtime portable: `packages/connectors/src/advanced-field-runtime.ts`;
- ejecución de mutaciones: `InternalDataSourceAdapter` detrás del único `ConnectorRegistry`;
- persistencia: tabla genérica PGlite `content_records`, columna JSONB `data`;
- metadata: `advancedField` con parent/order/repeater/calculated/conditional;
- no DDL dinámico, tabla por modelo/campo, engine internals, `eval` ni valores secretos.

## Contrato y runtime

- Group y Repeater modelan scopes anidados mediante `parentFieldRef`.
- Repeater valida límites y cada elemento de forma independiente.
- Calculated limita ejecución a `add`, `subtract`, `multiply`, `divide`, `concat` y `coalesce`.
- Conditional interpreta comparison/and/or/not mediante rule AST tipado.
- el validator detecta parent cycles, dependency cycles, dependencias ausentes y cross-scope;
- create/update normalizan valores calculados/condicionales y validan nesting antes de persistir.
- capability portable: `data.advanced-fields`.

## Studio

- `AdvancedFieldEditor` quedó integrado en el tab Campos de `/models`.
- lista jerárquica indentada para children de Group/Repeater.
- configuración de parent, límites Repeater, operaciones/dependencias Calculated y reglas Conditional.
- `Subir`/`Bajar` proporciona alternativa accesible de reordenamiento.
- copy, errores y ayuda se mantienen en español mediante `help.content.models`.
- responsive existente conserva layout apilado en tablet/mobile y botones full-width en mobile.

## Pruebas

- `tooling/vitest/unit/m08-9-advanced-fields.test.ts`: runtime seguro, nesting, cálculo, condición, negativos y ciclos.
- `tooling/vitest/contract/m08-9-advanced-field-boundary.test.ts`: owner PGlite, store genérico, ausencia de DDL/eval e integración UI.
- `tooling/vitest/integration/m08-9-advanced-fields-pglite.test.ts`: ConnectorRegistry + adapter + PGlite real + round-trip/negative.
- `tooling/playwright/m08-9-advanced-fields.spec.ts`: authoring y persistencia observable de los cuatro tipos.

## Gate local

- lint: GREEN;
- typecheck: GREEN;
- boundaries: GREEN;
- Node: `41/41`;
- Vitest: `547/547`;
- build Studio + PWA + secret scan: GREEN;
- pruebas M08.9 dedicadas: `6/6` GREEN.

La ejecución E2E local no comenzó porque el CDN de Playwright agotó el timeout en todos los intentos de descargar Chromium. La prueba quedó compilada y el gate final se delega a la única ejecución de Base CI/Playwright de la candidata.

## Primer gate remoto y adaptación

- PR: `#75`;
- Base CI: `33810318819` (#877);
- documentación, lint, typecheck, tests, build, instalación de Chromium y `120/121` pruebas Playwright: GREEN;
- único fallo: el assertion de confirmación de reordenamiento resolvía dos regiones `status` con el mismo copy (sidebar y panel Campos);
- la interacción y persistencia habían concluido correctamente; se acotó el locator al `tabpanel` Campos sin modificar comportamiento productivo.

El run #877 se conserva como evidencia roja y M08.9 continúa `ACTIVE` hasta que la candidata reparada termine el gate en `success`.

## Siguiente acción

Publicar la adaptación del selector, ejecutar Base CI y cerrar/fusionar solo con resultado `success`; después activar `M08.10`.
