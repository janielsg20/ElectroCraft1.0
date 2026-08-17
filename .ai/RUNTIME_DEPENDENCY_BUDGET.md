# RUNTIME DEPENDENCY BUDGET — ElectroCraft Eighth Final

Dependencies derive from ExportIR + target capabilities.

# Studio-only

- Puck.
- Rete editor/history.
- PGlite Studio project tooling.
- AI SDK/@ai-sdk-google/@ai-sdk-react.
- AI Elements.
- Studio Help/Settings/AppShell.
- shadcn Studio source not reused by generated runtime unless the runtime generator explicitly emits compatible components.

# React/PWA

Conditional:
TanStack Query, Zustand, RHF/Zod, Action runtime, Refine/TanStack Table for Administration, Tiptap editor, ECharts, FullCalendar, dnd-kit, connector runtime.

# Static

Include only runtime JS required by accepted static profile.
Block server/mutable semantics the target cannot safely provide.

# Expo Android/iOS

React Native/Expo/Router.
Expo SQLite only when required.
Device modules only when used.
Native charts/calendar only when used.

# Capacitor

React Web runtime dependencies + Capacitor core + only used plugins.
No Expo packages.

# LAMP

Composer manifest includes only required:
Slim, PSR-7 implementation, Slim-CSRF and any approved HTTP/helper package proven necessary.

PDO is PHP runtime functionality.

No Refine/Puck/Rete editor/AI Studio packages.
No React by default.

# WordPress

Prefer WordPress native runtime and `@wordpress/*` externalized dependencies where plugin JS uses them.
Do not bundle another React copy when WordPress provides the dependency.
Custom JS bundle contains only project/plugin code and non-WP libraries genuinely needed.

# AI in exported apps

Studio Gemini usage does not add AI SDK/Gemini to any export.

Only a future explicit user-created app AI capability may request target runtime AI dependencies.

# Verification

Every RuntimeDependencyManifest row:
package/runtime requirement
target
reason/capability
version
required/conditional.

A target build fails if an undeclared Studio dependency leaks.
