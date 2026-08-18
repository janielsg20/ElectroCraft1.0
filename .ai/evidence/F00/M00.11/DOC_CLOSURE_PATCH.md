# Documentation patch after GREEN

M00.11 cannot truthfully pre-write CI run IDs before GitHub Actions executes. After GREEN:
- change `ADR-ARCHITECTURE-CLOSURE.md` status to `ACCEPTED — GREEN` and record run/head/artifact;
- change `ARCHITECTURE_CLOSURE_MATRIX.md` status to `ACCEPTED — GREEN`;
- append the provided TRACKING closure template with real IDs;
- update `FINAL_EIGHTH_REVIEW_AUDIT.md` with an executable F00 closure section;
- append final frozen decisions to `DECISIONS.md` only if they differ from D001–D030;
- update `.ai/STATE.md` to the first F01 microphase.

This post-CI metadata update is intentionally not fabricated in the pre-run overlay.
