# ElectroCraft — Eighth Final Master Specification

**ElectroCraft** is a Spanish-first **No-Code App Builder**.

This package is an executable Markdown specification for an implementation AI.

## Final structure

- **28 phases**: F00–F27.
- **270 prescriptive microphases**.
- every microphase includes exact code ownership/location, app location, visual design, Spanish copy, Help, ordered implementation, artifacts and tests.
- one active microphase at a time.

## Main product model

Screens
Navigation
Components
Data Sources
Models/Records
Queries
State
Actions/Workflows
Forms
Users/Permissions
Administration
Media
Themes/Reusables
Extensions
AI Drafts

## Studio

- React/TypeScript/Vite.
- shadcn/ui with explicit **Radix** base.
- Tailwind.
- Lucide.
- i18next.
- Puck.
- PGlite/Drizzle.
- Rete.
- Refine/TanStack.
- Tiptap.
- Zustand.
- Vercel AI SDK + Gemini.
- selected AI Elements.

## Export destinations — all Core / equal product status

1. Proyecto local
2. React Web
3. Sitio estático
4. PWA
5. Android
6. iOS
7. Capacitor
8. LAMP
9. WordPress

All use the same Export Target Contract and Capability Analyzer.

## Target runtimes

- Android/iOS: React Native + Expo.
- Capacitor: Web Runtime + Capacitor.
- LAMP: Slim 4 + PSR-7 + Slim-CSRF + PDO + MySQL/MariaDB.
- WordPress: Block Theme + Companion Plugin using native WordPress APIs.

## Start

Read:
`AGENTS.md`.

Canonical prompt:
`.ai/PROMPT_MAESTRO_ELECTROCRAFT.md`.

Initial execution:
`F00 / M00.1`.

## Entorno de desarrollo

Si el entorno define proxies, usa las variables estándar `HTTP_PROXY` y
`HTTPS_PROXY`. No definas `npm_config_http_proxy` ni
`npm_config_https_proxy`: npm 11 las considera aliases obsoletos y las
rechazará en su próxima versión mayor.

Los entornos que todavía inyecten esos aliases pueden limpiarlos antes de
ejecutar npm cargando el helper del repositorio:

```sh
. tooling/shell/npm-proxy-env.sh
npm --version
```
