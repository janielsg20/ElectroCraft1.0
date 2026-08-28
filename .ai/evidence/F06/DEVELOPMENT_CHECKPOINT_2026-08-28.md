# F06 development checkpoint — 2026-08-28

Branch: `codex/f06-advanced-editor`

## Validation policy
Per user instruction, implementation is accumulated on the F06 branch without opening/updating a PR and without running GitHub Actions per microphase. `ElectroCraft Base CI` remains reserved for the final F06 gate. Therefore the items below are **implemented / pending phase gate**, not declared GREEN yet.

## M06.3 — Platform overrides y diagnostics
Implemented:
- transient Web/Android/iOS editor context;
- canonical per-property platform overrides with responsive/native inheritance;
- registry-backed capability badges and repairable diagnostics;
- Canvas resolution `responsive -> native -> exact platform`;
- unit/integration/contract coverage prepared.

## M06.4 — Advanced canvas guides/snapping
Implemented:
- editor-only rulers/guides/snapping preferences;
- guide priority over sibling/parent/grid candidates;
- keyboard movable/removable guides;
- overlay beside `Puck.Preview` without replacing Puck drag ownership;
- unit/E2E coverage prepared.

## M06.5 — Multi-select, Group/Ungroup y Resize
Implemented:
- session-only multi-selection containing IDs only;
- modifier-click and `Shift+Enter` keyboard alternative;
- public Puck `insert/move/remove` based Group/Ungroup;
- definition-driven `resizable` capability projected through Puck metadata;
- canonical Style width/height resize with visible fail-closed diagnostics;
- contextual Canvas toolbar;
- unit/contract/E2E flow prepared for group -> persist -> resize -> ungroup -> reopen.

Adaptation:
- visual resize handles are not coupled to Puck `componentOverlay` because the Overrides API is explicitly experimental in Puck 0.22.4. F06 uses stable canonical numeric/keyboard resize instead of a deep or experimental fork.

## Next exact action
Continue M06.6 — Breadcrumbs y context actions. Use public `getSelectorForId/getItemById`, `duplicate/remove`, dynamic permissions and canonical subtree mapping. Keep copy clipboard session-only and canonical; do not store Puck AppState/Data/history in clipboard.
