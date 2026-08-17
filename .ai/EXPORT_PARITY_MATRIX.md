# EXPORT PARITY MATRIX — ElectroCraft

Todos los destinos son Core.

| Capability | Proyecto local | React Web | Sitio estático | PWA | Android | iOS | Capacitor | LAMP | WordPress |
|---|---|---|---|---|---|---|---|---|---|
| Project package | Exact | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| Screens | Stored | Exact | Exact* | Exact | Native map | Native map | WebView map | Server/Web map | Block/theme map |
| Navigation | Stored | React Router | URLs | React Router | Expo Router | Expo Router | Web Router | Slim routes | WP routes/templates |
| Internal Data | Stored | client/gateway profile | limited* | client/offline profile | SQLite/gateway | SQLite/gateway | Web/gateway | MySQL/MariaDB | WP data APIs |
| REST/GraphQL | Stored | adapter | build/client* | adapter | adapter/gateway | adapter/gateway | web adapter | server/client adapter | WP HTTP/REST adapter |
| State | Stored | Zustand | build/client* | Zustand | Zustand/RN | Zustand/RN | Web state | PHP/session/JS mapping | WP/JS/session mapping |
| Forms | Stored | RHF/Zod | limited* | RHF/Zod | RN forms | RN forms | Web forms | server forms | WP forms |
| Actions | Stored | JS runtime | limited* | JS runtime | Native runtime | Native runtime | JS runtime | PHP/JS compiler | WP/PHP/JS compiler |
| Auth | Stored | adapter | limited* | adapter | native adapter | native adapter | web adapter | PHP sessions | WP users/caps |
| Administration | Stored | Refine output | limited* | Refine output | Native Admin | Native Admin | Web Admin | generated admin | WP Admin |
| Media | Stored | assets | assets | assets/cache | bundled/remote | bundled/remote | web assets | public/storage | Media Library |
| Theme/Tokens | Stored | CSS | CSS | CSS | RN styles | RN styles | CSS | CSS/templates | theme.json/styles |
| Reusables | Stored | source | baked | source | source | source | source | compiled | patterns/blocks |
| Permissions | Stored | runtime | build/runtime* | runtime | runtime | runtime | runtime | middleware/service | WP capabilities/nonces |
| AI Studio history | Excluded default | Excluded | Excluded | Excluded | Excluded | Excluded | Excluded | Excluded | Excluded |

`*` Static target may legitimately block features that need mutable server/runtime state. It remains a full target: the analyzer must explain blockers instead of silently stripping them.

---

# Acceptance principle

Every row has one of:
- Exact
- Adapted
- Blocked with reason

Never:
- silently omitted
- fake implementation
- placeholder.

A release is not export-complete until every target has run its applicable fixture.
