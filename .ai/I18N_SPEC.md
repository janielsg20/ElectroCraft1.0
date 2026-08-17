# I18N SPEC — ElectroCraft Eighth Final

Engine:
i18next + react-i18next.

Default/fallback:
es.

Namespaces:
common, navigation, builder, screens, data, queries, state, workflows, forms, auth, administration, media, extensions, appearance, preview, compatibility, export, capacitor, lamp, wordpress, settings, help, ai, errors.

Rules:
- every release-visible Studio string is translated;
- internal IDs remain technical/stable;
- missing key fails development/test;
- library defaults from Puck/Refine/Rete/AI Elements do not leak English;
- Intl handles date/number/currency.

Target labels exact:
Proyecto local
React Web
Sitio estático
PWA
Android
iOS
Capacitor
LAMP
WordPress

Forbidden release label:
`Opcional` applied to any export destination.
