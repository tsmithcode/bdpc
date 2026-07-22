# Dunn Residence — Project State Change Control

## Current source-of-truth architecture

The active workspace separates three responsibilities so a scope change cannot erase useful operating knowledge:

- `data/current-authorization.json` — active contractual, commercial, schedule, and scope authority
- `data/operating-doctrine.json` — stable BDPC drafting standards, source hierarchy, enterprise controls, decisions, and evidence links
- `data/production-controls.json` — activation gates, milestones, CAD preparation, automation, QA, risks, runtime, and zero-friction acceptance controls

The active pages consume or align to those files:

- `/index.html` + `/authorization.js` — all ten enterprise workspace tabs
- `/sow/index.html` — current client-readable SOW
- `/sow/current/index.html` + `/sow/current/manifest.json` — checksum-verified governing issued PDF
- `/reports/index.html` — supporting evidence library

The current contractual state is:

- One Existing Main Level As-Built Floor Plan
- Native AutoCAD DWG + PDF
- $600 fixed fee
- 8.0-hour included ceiling
- One working day
- One consolidated minor correction pass
- Delivery directed for 4:00 PM EDT on July 22, 2026
- Written authorization complete; payment and native setup pending

The governing issued source document is SOW Version 3, revision `2026.07.21.4`. Its manifest records 5 pages, 22,974 bytes, and SHA-256 `8a1195f91f909e7528d94ff9a1695cea977aa85acf60b609ee3e219367229602`.

## Preserved operating doctrine

Requirement reductions may narrow contractual output, but they must not delete reusable standards, evidence, decision history, QA controls, or production doctrine.

The minimum preserved doctrine includes:

- Residential dimensions no finer than 1/2 inch unless Brian directs otherwise
- Typical 2×4 framed-wall baseline of 3.5 inches
- Chained and overall dimension reconciliation
- Reuse and validation of established BDPC / TCADD blocks
- TCADD model-space drafting logic where compatible
- Current BDPC paper-space, title-block, font, dimension, plotting, and presentation logic
- LiDAR treated as measured evidence, not automatic truth
- City floor plate used only as scale/orientation corroboration
- Material discrepancies escalated rather than silently resolved
- Unsupported or concealed conditions never invented

A rule that does not apply to the active assignment must be marked future, conditional, or not applicable. It must not be removed merely because the current scope is smaller.

## Archive policy

Historical commercial proposals are immutable audit records:

- Human-readable SOW revisions: `sow/archive/`
- Machine-readable revisions: `data/archive/`
- Governing source PDF and integrity manifest: `sow/current/`
- Git history remains the byte-level audit trail

Never edit an archived revision to make it look current. Create a new revision, preserve the prior governing document under the archive, update the archive index, and change the current source of truth.

## Safe requirement-change procedure

1. Read the newest mutually accepted written client direction.
2. Separate contractual changes from stable operating doctrine.
3. Preserve the superseded SOW, governing PDF, and machine-readable state under the archive.
4. Update `data/current-authorization.json` only for active scope, fee, schedule, payment, or commercial authority.
5. Update `data/operating-doctrine.json` only when an accepted standard, hierarchy, or decision is added or changed.
6. Update `data/production-controls.json` for gates, milestones, CAD preparation, automation, QA, risks, runtime, or acceptance workflow.
7. Publish any newly issued governing PDF under `sow/current/` and update its checksum manifest.
8. Update the concise current SOW and report index only where needed.
9. Run `python scripts/validate_current_scope.py` and `node --check authorization.js`.
10. Commit to `main`.
11. Fast-forward `gh-pages` to the validated `main` commit.
12. Verify `/bdpc/`, `/bdpc/sow/`, `/bdpc/sow/current/`, `/bdpc/reports/`, and the Stripe CTA.

## Regression controls

The validation script checks:

- Current authorization and commercial invariants
- One-sheet scope and $600 payment link
- 8.0-hour ceiling and current delivery date
- Every workspace tab has an active renderer
- Enterprise doctrine and production-control data drive the renderer
- At least 18 preserved standards, 20 QA checks, 15 milestones, 14 CAD-prep controls, 14 automation controls, 12 enterprise controls, eight risks, and six decisions remain
- The 1/2-inch dimension rule, 3.5-inch wall basis, block-reuse rule, model-space source, paper-space source, LiDAR boundary, unknown-condition rule, and conflict-escalation rule remain intact
- Payment is the only remaining commercial acceptance action; redundant reconfirmation is not introduced
- Root payment access works before JavaScript loads
- Current SOW, report pages, and governing-document viewer expose the secure payment action
- Governing PDF segments reconstruct to the exact declared byte count and SHA-256
- Current and archived paths are separated and directly linked
- `index.html` does not load the legacy three-sheet renderer

The legacy evidence dataset and scripts may remain available for historical analysis, but they must not drive the active client workspace.
