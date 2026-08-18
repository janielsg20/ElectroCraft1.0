# ENGINE PAYLOAD POLICY — ElectroCraft

Purpose: allow selected serializable OSS payloads without turning engine internals into opaque canonical state.

## Portable wrapper
Every approved engine payload uses exactly this canonical envelope:

```ts
{
  engine: string;
  schemaVersion: number;
  value: JsonValue;
}
```

`@electrocraft/domain` owns the JSON wrapper, deterministic serialization and portable engine identifiers/policy metadata. Domain never imports engine types.

## Approved initial payloads

### React Query Builder rules
- `engine`: `react-querybuilder`
- wrapper `schemaVersion`: `1`
- adapter owner: `@electrocraft/query-rqb`
- current engine pin: `@react-querybuilder/core@8.23.0`
- allowed value: serializable RuleGroup-style condition tree containing combinators/rules/field/operator/value/valueSource.
- adapter validation: structural rule validation plus execution through the real RQB parameterized formatter.
- migration owner: `@electrocraft/query-rqb`; current v1 payload is identity-migrated and future wrapper revisions must be migrated there.

The canonical `ElectroCraftQueryDefinition.conditions` remains the primary portable query definition. The wrapper exists for places where preserving an OSS rules payload is explicitly useful; it does not replace canonical query ownership.

### Tiptap rich text JSON
- `engine`: `tiptap`
- wrapper `schemaVersion`: `1`
- adapter owner: `@electrocraft/media-tiptap`
- coherent engine family pinned exactly to `3.29.2`: `@tiptap/core`, `@tiptap/html`, `@tiptap/extension-document`, `@tiptap/extension-paragraph` and `@tiptap/extension-text`.
- allowed value: Tiptap/ProseMirror JSON document rooted at `{ type: "doc" }` using the extension set available in the pinned adapter.
- adapter validation: structural root validation plus real Tiptap JSON-to-HTML generation using only Document + Paragraph + Text for the baseline wrapper.
- migration owner: `@electrocraft/media-tiptap`; current v1 payload is identity-migrated and future wrapper revisions must be migrated there.

The baseline intentionally avoids the broad StarterKit aggregate. StarterKit permits compatible extension ranges, which can resolve multiple patch versions under a workspace lock and create type/runtime drift. Additional rich-text capabilities will be added as explicit pinned extensions when their owning microphase requires them.

Tiptap JSON is used as the persisted engine payload rather than HTML so the editor can reconstruct structured rich text while keeping the wrapper JSON-portable.

## Compatibility Analyzer
`@electrocraft/application` checks wrapper shape, engine allowlist and wrapper schema version before an adapter is selected. Unknown engines or versions are `blocked`, never silently accepted.

Adapter-specific validation remains inside the owner package because only the adapter may know engine types and engine format semantics.

## Explicitly prohibited payloads
The following runtime/editor states must never be represented as persistent engine wrappers:

- Puck AppState, React nodes, callbacks, editor history or classes.
- Rete `NodeEditor`, sockets, connection/node classes, engine instances or history.
- Zustand store instances.
- TanStack Query cache/state.
- DOM nodes, functions, class instances, cyclic objects or non-JSON values.
- provider/API secrets.

For Puck and Rete, persist the existing ElectroCraft canonical `Document` / component definitions / `ActionGraph` and reconstruct engine state in the adapter.

## Migration rule
Wrapper `schemaVersion` versions the ElectroCraft-to-engine persisted payload contract, not the npm package version. An engine package upgrade does not automatically bump wrapper schema. A bump is required only when the persisted `value` interpretation changes.

Each adapter exposes a migration entrypoint even when the current v1 path is identity-only. Unsupported older/newer versions fail closed until an explicit migration is added.

## Export rule
Engine wrappers may enter ExportIR only if the consuming canonical shape explicitly permits them in a future schema. M02.9 does not add RQB/Tiptap wrappers to ProjectDefinition or ExportIR, so ProjectDefinition/Document remain v3 and no project migration is introduced.

Targets must never receive live engine instances through `TargetCompileContext`.

## Contracts location
F01 fixed exactly 17 owner packages. Historical references to `packages/contracts/` are implemented by `packages/domain/src/contracts/`; no 18th package is created.
