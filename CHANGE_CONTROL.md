# Dunn Residence — Project State Change Control

## Current source of truth

`data/current-authorization.json` is the only machine-readable source for the active commercial and production state.

The active pages consume that file:

- `/index.html` + `/authorization.js` — all ten workspace tabs
- `/sow/index.html` — current client-readable SOW
- `/reports/index.html` — supporting evidence library

The current state is:

- One Existing Main Level As-Built Floor Plan
- Native AutoCAD DWG + PDF
- $600 fixed fee
- 8.0-hour included ceiling
- One working day
- One consolidated minor correction pass
- Delivery directed for 4:00 PM EDT on July 22, 2026
- Written authorization complete; payment and native setup pending

## Archive policy

Historical commercial proposals are immutable audit records:

- Human-readable SOW revisions: `sow/archive/`
- Machine-readable revisions: `data/archive/`
- Git history remains the byte-level audit trail

Never edit an archived revision to make it look current. Create a new revision, update the archive index, and change the current source of truth.

## Safe requirement-change procedure

1. Read the newest mutually accepted written client direction.
2. Update `data/current-authorization.json`.
3. Update the concise current SOW and report index only where needed.
4. Preserve the superseded state under `sow/archive/` and `data/archive/`.
5. Run `python scripts/validate_current_scope.py`.
6. Commit to `main`.
7. Fast-forward `gh-pages` to the validated `main` commit.
8. Verify `/bdpc/`, `/bdpc/sow/`, `/bdpc/reports/`, and the Stripe CTA.

## Regression controls

The validation script checks:

- Current authorization schema and commercial invariants
- One-sheet scope and $600 payment link
- 8.0-hour ceiling and current delivery date
- Every workspace tab has an active renderer
- Current SOW and report pages expose the secure payment action
- Current and archived paths are separated
- `index.html` does not load the legacy three-sheet renderer

The legacy evidence dataset and scripts may remain available for historical analysis, but they must not drive the active client workspace.
