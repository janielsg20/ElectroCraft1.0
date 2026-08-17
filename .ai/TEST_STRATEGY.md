# TEST STRATEGY — ElectroCraft Eighth Final

# Global gate

Every relevant microphase:
- lint
- typecheck
- test
- build

No fake green result.
Environment-limited checks are explicitly `SKIPPED` with reason/evidence, never silently passed.

# Layers

1. domain/unit;
2. port/adapter contract;
3. persistence/integration;
4. component interaction;
5. browser E2E;
6. target compiler/runtime fixture;
7. security/accessibility/performance;
8. cross-target parity.

# Studio Spanish/Help

- missing i18n key;
- hardcoded release-English scan;
- all main routes have HelpDescriptor;
- CircleHelp focus/keyboard;
- Spanish truncation at 320/375/768/1024/1280/1440;
- Settings final far-right.

# Design System

- shadcn Radix components;
- no mixed primitive bases without ADR;
- focus/keyboard;
- disabled/error/loading;
- tokens/theme;
- lazy-load heavy workspaces.

# AI Elements

- Conversation scrolling;
- MessageResponse long Markdown;
- PromptInput;
- Tool pending/running/denied/error/completed;
- Plan display;
- cancel;
- Spanish labels;
- no React Flow graph components.

# Puck

- Components/Fields/Outline/Preview/Slots;
- nesting;
- screen switching;
- history isolation;
- canonical round-trip;
- advanced layout/responsive/overlays;
- no Puck state in project.

# PGlite

- multi-tab Worker;
- incremental project objects;
- revisions;
- recovery;
- Internal Data CRUD/index;
- migrations.

# Data Sources

Internal/REST/OpenAPI/GraphQL/Gateway/SecretRef.
Test CORS/direct/gateway, auth ref, schemas, errors and capabilities.

# Navigation

Stack/Tabs/Drawer/Modal.
routes/params/deep links/guards.
one model -> React/Expo/Capacitor/LAMP/WordPress contract fixtures.

# Query/Binding

RQB diagnostics, fail closed, cache invalidation, external source capabilities, listing/filter/facets.

# State

scopes/persistence/corrupt hydration/sensitivity.
Target adapters report unsupported mappings.

# Auth/RBAC

login/session restore/logout.
role/capability.
route/resource/field/action.
simulator.
target enforcement.

# Rete

graph/history/control/data flow.
node packs.
domain triggers.
loop/step protections.
target compiler boundaries.

# Forms

RHF/Zod Studio/Web/Native behavior.
conditions/multi-step/repeater/calculated/uploads/Action submit.
PHP/WordPress server validator compiler equivalence for constraints.

# Administration

Refine CRUD/Table/Quick Edit/Bulk/Saved Views/CSV/Chart/Calendar/Kanban.
External DataSource capability errors.

# Extensions/App Templates

manifest/conflict/permission/install/uninstall/connector registration/code quarantine.

# AI

CI:
deterministic AI SDK mock/model.

Tests:
provider missing/offline/context preview/structured artifacts/tool allowlist/prompt injection/Draft/Preview/Diff/Apply/stale conflict/image staging/code quarantine/no secret.

Real Gemini smoke:
only secure configured test environment; otherwise explicit SKIPPED.

# Export Target Contract

Every target:
descriptor/config/capability/compiler/verifier/report.

Registry test:
exactly all nine Core IDs.

Export Center:
all nine visible, no optional group, blocker disables Generate, toolchain missing distinct from project blocker.

# Local

ZIP/checksum/reimport.

# React

install/typecheck/build/runtime E2E.

# Static

generate/local serve; dynamic blockers must match Compatibility.

# PWA

build/manifest/service worker/offline.

# Android / iOS

Expo source/prebuild/build where environment supports.
artifact verification.
permissions/routes/data/state/forms/actions/auth.

# Capacitor

Web build/cap config/platform sync/plugins/permissions/deep links.
Android/iOS native project verification.
no Expo dependency.
build where toolchain permits.

# LAMP

Composer validate/install.
PHP syntax/static checks.
clean MySQL/MariaDB migration.
Slim routes/middleware.
PDO CRUD/query.
forms/CSRF/upload.
auth/session/RBAC.
actions.
Administration.
security: injection/XSS/CSRF/unauthorized.
deploy ZIP checksum.

# WordPress

clean WordPress test environment.
Theme ZIP recognition.
Plugin ZIP activation.
theme.json/templates/parts/patterns.
CPT/tax/meta/options/custom table as chosen.
REST/forms/actions.
roles/caps/nonces.
Media/Admin.
upgrade/deactivate/reactivate/uninstall policy.
artifact checksums.

# Final parity

One `Reserva Studio` project revision.
Run all nine targets.
Every capability/target cell:
Exact / Adapted / Blocked with pre-generation diagnostic.
No unexplained divergence.

# Evidence

`.ai/evidence/`
actual logs, screenshots, reports and checksums.
