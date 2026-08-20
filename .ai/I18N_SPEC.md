# I18N SPEC — ElectroCraft

## Owner

`@electrocraft/i18n` es el adapter estable y único owner runtime de i18n para el Studio.

Engine verificado para M03.10:

- `i18next@26.3.6`;
- `react-i18next@17.0.11`;
- `i18next-cli@1.69.0` como tooling/lint.

Los engines OSS permanecen detrás del adapter ElectroCraft. Studio no usa deep imports de i18next ni de `@electrocraft/i18n`.

## Idioma inicial y fallback

- idioma inicial: `es`;
- fallback: `es`;
- selector actual: `Configuración > General > Idioma`;
- valor disponible en M03.10: `Español`.

Añadir idiomas futuros no puede cambiar IDs, slugs, rutas, component keys ni contratos canónicos.

## Fuente de verdad

Los JSON de `locales/es/` son la fuente de verdad para las superficies migradas a M03.10. Los catálogos TS históricos de `apps/studio/src/i18n/` son seams de compatibilidad durante la migración y no deben recibir un segundo conjunto divergente para las superficies ya centralizadas.

Namespaces obligatorios de M03.10:

- `common`;
- `navigation`;
- `editor`;
- `content`;
- `queries`;
- `forms`;
- `backend`;
- `media`;
- `themes`;
- `export`;
- `settings`;
- `help`;
- `ai`.

## Estrategia de keys

- keys visibles: estables y técnicas, por ejemplo `studio.topbar.settingsTitle`;
- `keySeparator: false` para conservar keys planas con puntos;
- TypeScript infiere namespace/key desde `resourcesEs` y `CustomTypeOptions`;
- `translateStrict` falla con `MissingTranslationError` si una key requerida no existe;
- tests/dev deben fallar por missing keys; producción nunca debe inventar copy inglés.

## Reglas de UI

- toda string visible nueva usa una key antes de renderizarse;
- `Idioma`, `Español`, `Configuración general`, `Guardar` y `Cancelar` vienen del namespace `settings`;
- Sidebar y AppShell/Topbar migrados consumen `navigation`/`common` mediante el root público `@electrocraft/i18n`;
- known English shell labels son un failure de test/E2E;
- primitives del Design System siguen siendo responsables de accesibilidad/teclado/focus; i18n solo provee copy.

## Puck y engines OSS

- Puck conserva component keys e IDs internos en inglés/forma técnica estable;
- `packages/editor-puck` acepta `PuckLabelResolver` inyectable y no depende directamente de i18n;
- Studio/adapters pueden resolver component/field/boolean labels desde el namespace `editor`;
- ningún label default inglés de Puck/Refine/Rete/otros engines puede filtrarse al usuario.

## Errores

Los errores técnicos se normalizan a codes antes de mostrarse. `@electrocraft/i18n` expone el mapping español; stack traces y mensajes engine-only pertenecen a Debug, no a copy de release.

## Intl

Fecha, número y moneda usan `Intl` con locale español; cuando exista región/moneda de proyecto se suministra como opción sin cambiar el idioma visible del Studio.

Pluralización usa las reglas de i18next/Intl para `es` y se prueba con singular/plural real.

## Lint y gates

M03.10 exige:

- `tooling/scripts/verify-m03-10-ui-strings.mjs`;
- `i18next-cli lint`;
- unit tests de namespace/fallback/missing key/Intl/pluralización;
- contract tests de ownership, IDs estables y ausencia de deep imports;
- integration test React + Puck resolver;
- Playwright de Settings/Idioma y fuga de labels inglesas;
- lint, TypeScript strict, boundaries, tests, build y browser gate completos.

## Labels de targets que deben permanecer en español/forma contractual cuando esas superficies se activen

- `Proyecto local`;
- `React Web`;
- `Sitio estático`;
- `PWA`;
- `Android`;
- `iOS`;
- `Capacitor`;
- `LAMP`;
- `WordPress`.

Label de release prohibido: `Opcional` aplicado a cualquier destino de exportación.
