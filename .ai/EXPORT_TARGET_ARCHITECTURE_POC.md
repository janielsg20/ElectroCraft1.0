# EXPORT_TARGET_ARCHITECTURE_POC — M00.10

Date: 2026-08-17
Closed: 2026-08-18
Status: `ACCEPTED — GREEN`
Owner: F00 / M00.10

## Decision
ElectroCraft keeps **one canonical ExportIR** and compiles it through target-specific adapters. Capacitor, LAMP and WordPress are equal Core targets, but they are not the same runtime and must not share a fake Web-only artifact.

The POC proves one `ExportIrPoc` containing:
- screen `/appointments`;
- `Container`, `Text`, `Form`;
- model `Appointment`;
- query `listAppointments`;
- screen state `appointmentDraft`;
- `ActionGraph createAppointment`;
- role `staff`.

The identical IR fingerprint is embedded in all three target outputs. No `capacitorModel`, `lampModel`, `wordpressModel`, `wpModel` or `phpModel` exists.

## Target ownership

### Capacitor
Official Capacitor owns native container/project generation and sync. ElectroCraft owns the Web runtime emitted from ExportIR, `capacitor.config.json`, capability mapping and verification policy.

POC pin:
- `@capacitor/core@8.5.0`
- `@capacitor/cli@8.5.0`
- `@capacitor/android@8.5.0`

Real gate: install official packages, `cap add android`, `cap sync android`, then verify generated Android project source.

### LAMP
Slim 4 owns routing/middleware, Slim-Psr7 owns PSR-7, Slim-CSRF owns CSRF, PDO owns DB access, MySQL owns storage. ElectroCraft only compiles routes, schema/migration, repository calls and ActionGraph semantics.

POC pin:
- PHP `8.4`
- `slim/slim@4.15.2`
- `slim/psr7@1.8.0`
- `slim/csrf@1.5.1`
- MySQL `8.4` CI fixture

Real gate: Composer validate/install, PDO migration, GET route, valid CSRF POST, rejected CSRF-negative POST.

### WordPress
WordPress native APIs own block theme, CPT, REST, capabilities, nonce and lifecycle primitives. ElectroCraft compiles mappings from ExportIR.

POC pin:
- WordPress `7.0.2` stable fixture
- `theme.json` version `3`
- `@wordpress/env@11.11.0`

Theme output uses core blocks wherever semantics fit. The Appointment form is an adapted dynamic block in the Companion Plugin because server mutation semantics are not representable as a static theme block alone. `Appointment` maps to a CPT with `show_in_rest`; the protected REST route uses `permission_callback` and `current_user_can('edit_posts')`.

## Capability semantics
Every target emits `CapabilityResult` using only:
- `exact`
- `adapted`
- `blocked`

The fixture has zero blockers. Adaptation is explicit and target-specific; no capability is silently removed.

## Shared vs target-specific logic
Shared:
- canonical IR schema/validation;
- fingerprint/identity;
- CapabilityResult shape;
- safe artifact paths;
- target registry semantics and blocker policy.

Target-specific:
- Capacitor config/native sync;
- Slim routes/PSR-7/CSRF/PDO/MySQL;
- WordPress block/CPT/REST/lifecycle mapping;
- runtime verification commands.

## Executed closure evidence
GitHub Actions run `32100542215` on head `3fe3815824d7847e88c7f91006d7a6236f00e527` completed successfully with:
1. M00.9 real Scalar parser precondition: PASS;
2. static M00.10 parity: PASS;
3. real Capacitor sync: PASS;
4. real Slim/PDO/CSRF/MySQL runtime: PASS;
5. real wp-env WordPress theme/plugin activation fixture: PASS;
6. combined closure gate: `PASS_M00_10_CLOSURE_GATE`.

Artifacts:
- `9311394160` — static artifacts;
- `9311399715` — Capacitor source;
- `9311407473` — LAMP source;
- `9311441488` — WordPress source.

Commit status: `electrocraft/M00.10 = success`.

M00.10 is formally closed and authorized M00.11 on the exact same head.
