# DECISIONS — ElectroCraft

D001 ElectroCraft = No-Code App Builder.

D002 Spanish default/fallback via i18next.

D003 HelpRegistry/CircleHelp.

D004 Studio shadcn base = Radix, pinned explicitly.

D005 selected AI Elements for standard AI Workbench message/conversation/prompt/tool/plan UI.

D006 Lucide icons.

D007 Puck = Screen Composer, Slots for new nesting.

D008 one ElectroCraftDocument model.

D009 one Navigation/Route model.

D010 PGlite/Drizzle = Studio + Internal Data Source.

D011 Data Sources first-class; Internal/REST/OpenAPI/GraphQL Core.

D012 SecretRef/Gateway.

D013 TanStack Query async cache.

D014 Refine is Administration-specialized.

D015 RHF/Zod Forms for JS runtimes; server targets compile equivalent validation.

D016 Rete = Workflows.

D017 Tiptap = RichText.

D018 Zustand = JS runtime State.

D019 AI SDK + @ai-sdk/google = AI invocation/orchestration; Gemini default.

D020 direct @google/genai only narrow proven capability gap.

D021 AI Draft only; explicit Apply.

D022 generated code quarantined.

D023 all nine export targets are Core: Local, React, Static, PWA, Android, iOS, Capacitor, LAMP, WordPress.

D024 all targets implement shared Export Target Contract.

D025 Capacitor is a full hybrid target, not Expo fallback.

D026 LAMP uses Slim 4 + PSR-7 + Slim-CSRF + PDO/MySQL/MariaDB.

D027 WordPress default output = Block Theme + Companion Plugin.

D028 WordPress native APIs precede custom implementations.

D029 CPTs/data registrations live in Companion Plugin, not Theme.

D030 final release requires parity evidence for all nine targets.

D031 documentation continuity has single ownership: AGENTS=entry point, README=map, MEMORY=stable facts, STATE=current state/one ACTIVE, TRACKING=position, HANDOFF=next action; detailed decision in `adr/ADR-DOCUMENT-CONVENTIONS.md`.
