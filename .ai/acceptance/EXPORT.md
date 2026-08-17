# EXPORT ACCEPTANCE — ElectroCraft Eighth Final

All destinations are Core:

1. Proyecto local
2. React Web
3. Sitio estático
4. PWA
5. Android
6. iOS
7. Capacitor
8. LAMP
9. WordPress

Every target must:

- be registered in ExportTargetRegistry;
- expose config schema;
- participate in Capability Analyzer;
- block generation on blockers;
- compile from the same ExportIR revision;
- produce target-specific source/package;
- run its verifier;
- produce ExportReport;
- preserve security/secrets policy;
- record actual evidence;
- participate in the canonical parity fixture.

Artifacts:
Local ZIP.
React source/build.
Static files.
PWA build.
Android source/build where available.
iOS source/build where available.
Capacitor source/platform sync/build where available.
LAMP deploy ZIP + Composer/DB/HTTP validation.
WordPress Theme ZIP + Plugin ZIP + clean install validation.

No destination may be omitted from release acceptance because it uses a different technology family.
