# RULES — ElectroCraft Eighth Final

1. Product = No-Code App Builder.
2. Visible Studio UI = Spanish.
3. Every main section has contextual Help.
4. One active microphase.
5. Engine-first.
6. No fake features.
7. No second source of truth.
8. Puck owns visual authoring.
9. Puck new nesting uses Slots; DropZone migration only.
10. One ElectroCraftDocument tree for screen/template/form/admin/reusable component.
11. One portable Navigation/Route model.
12. Data Sources are first-class.
13. Internal Data is one Data Source.
14. Secrets are refs only.
15. TanStack Query owns async cache.
16. Refine is Administration engine, not normal Screen runtime.
17. RHF/Zod own forms.
18. RQB owns only condition-authoring/diagnostic scope.
19. Rete owns workflow graph/history/JS processing.
20. Tiptap is one richtext engine; do not persist a second Puck richtext format.
21. Zustand owns runtime state mechanics.
22. shadcn/ui uses **Radix base** in Studio.
23. Multi-framework appearance adapters are allowed only by `ADR-STUDIO-MULTI-FRAMEWORK-THEMES.md`, scoped to `@electrocraft/design-system`; Radix retains AppShell/overlay/focus ownership.
24. AI Elements owns standard AI message/conversation/prompt/tool/plan UI.
25. Do not install all AI Elements; install only used pieces.
26. Do not use AI Elements React Flow graph pieces to duplicate Rete.
27. AI SDK owns model/provider/tool/streaming abstraction.
28. Gemini is default provider through @ai-sdk/google.
29. Direct @google/genai is a narrow proven escape hatch only.
30. AI writes Draft only.
31. Apply requires explicit user action.
32. Generated code never auto-executes.
33. Extensions are declarative-first.
34. All nine export destinations are Core and first-class.
35. There is no Optional Target category.
36. Equal export status means same validation/evidence standard, not identical implementation technology.
37. Every exporter uses shared Export Target Contract.
38. Every exporter runs Compatibility before generation.
39. No silent loss.
40. Web runtime is independent from Puck.
41. Expo is Android/iOS native target.
42. Capacitor is a separate first-class hybrid target.
43. LAMP uses Slim/PDO instead of proprietary router/middleware/DB abstraction.
44. WordPress uses native WP APIs; CPTs belong in Companion Plugin, not Theme.
45. WordPress default output is Block Theme + Companion Plugin.
46. LAMP and WordPress must pass release fixtures like other targets.
47. Runtime dependencies are pruned.
48. UI implementation loads relevant shadcn/UI/UX/Layout/Accessibility skills.
49. React multi-component work gets React best-practices audit.
50. Current dependency/model/platform APIs are reverified before pinning.
51. DONE requires evidence.
