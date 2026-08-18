# M02.1 — Implementation Candidate — 2026-08-18

## Scope
Define `ElectroCraftProjectDefinition` and `ElectroCraftDocument` as the first versioned canonical project contracts for F02.

## Engine/API
- Zod `4.4.3` is the runtime validation boundary.
- Canonical objects use strict schemas, `safeParse`, recursive schemas, JSON-value validation and JSON Schema inspection in tests.
- Domain contracts remain independent from React, Puck, persistence engines and target runtimes.

## Canonical contracts
- `ElectroCraftProjectDefinition` stores identity, schema/object version, app settings, default targets, refs, theme ref, feature flags and metadata.
- Documents remain separate objects referenced by IDs; ProjectDefinition does not embed a document mega-JSON.
- `ElectroCraftDocument.kind` is `screen | template | form | admin-screen | reusable-component`.
- `page` is accepted only by the explicit legacy import boundary and migrates to `screen`.
- Document root/node tree is portable and contains no Puck AppState.
- Object IDs are deterministic and namespaced.

## Application/persistence contract
- `ProjectDocumentService` consumes only the public `@electrocraft/domain` surface.
- Persistence is represented by `CanonicalProjectObjectRepository` with versioned project/document records.
- Save/reopen fail closed on invalid schemas, semantic/ref errors, missing records, corrupted payloads and persistence errors.
- Integration tests use a real filesystem-backed repository adapter to verify save, reopen with a new repository instance, missing-reference recovery and legacy page migration.

## Adaptations
### `packages/contracts/`
M02.1 names `packages/contracts/` as a code location, but F01 formally froze exactly 17 stable owner packages and no `@electrocraft/contracts` owner exists. Creating an eighteenth owner would violate the completed ownership gate. Contract modules therefore live under `packages/domain/src/contracts/` and are exported only through `@electrocraft/domain`.

### DB migration
M02.1 does not introduce a new physical database schema. The persisted unit is the existing generic canonical project object record (`kind`, `id`, `schemaVersion`, `payload`). The relevant migration is the versioned payload import `page -> screen`; a concrete PGlite/Drizzle storage adapter belongs to later persistence phases. This avoids inventing a second storage owner while still proving persistence/reopen/recovery through the repository port.

## Tests/evidence planned
- unit: deterministic IDs, strict schemas, round-trip, legacy migration, semantic diagnostics;
- contract: ProjectDefinition references documents instead of embedding, missing refs fail closed, engine internals rejected, domain import boundary;
- integration: file-backed persistence/reopen/recovery;
- dedicated GitHub Actions gate with marker `PASS_M02_1_PROJECT_DOCUMENT_MODEL`;
- full root `npm run check` before formal closure.

This is implementation-candidate evidence only. M02.1 remains `ACTIVE` until real GitHub Actions is green and closure evidence is recorded.
