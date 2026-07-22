# Dunn Residence — Project State Change Control

## Current source of truth

`data/current-authorization.json` is the only machine-readable source for the active commercial and production state.

The active pages consume or align to that file:

- `/index.html` + `/authorization.js` — all ten workspace tabs
- `/sow/index.html` — current client-readable SOW
- `/sow/current/index.html` + `/sow/current/manifest.json` — checksum-verified governing issued PDF
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

The governing issued source document is SOW Version 3, revision `2026.07.21.4`. Its manifest records 5 pages, 22,974 bytes, and SHA-256 `8a1195f91f909e7528d94ff9a1695cea977aa85acf60b609ee3e219367229602`.

## Archive policy

Historical commercial proposals are immutable audit records:

- Human-readable SOW revisions: `sow/archive/`
- Machine-readable revisions: `data/archive/`
- Governing source PDF and integrity manifest: `sow/current/`
- Git history remains the byte-level audit trail

Never edit an archived revision to make it look current. Create a new revision, preserve the prior governing document under the archive, update the archive index, and change the current source of truth.

## Safe requirement-change procedure

1. Read the newest mutually accepted written client direction.
2. Preserve the superseded SOW, governing PDF, and machine-readable state under the archive.
3. Update `data/current-authorization.json`.
4. Publish the newly issued governing PDF under `sow/current/` and update its checksum manifest.
5. Update the concise current SOW and report index only where needed.
6. Run `python scripts/validate_current_scope.py`.
7. Commit to `main`.
8. Fast-forward `gh-pages` to the validated `main` commit.
9. Verify `/bdpc/`, `/bdpc/sow/`, `/bdpc/sow/current/`, `/bdpc/reports/`, and the Stripe CTA.

## Regression controls

The validation script checks:

- Current authorization schema and commercial invariants
- One-sheet scope and $600 payment link
- 8.0-hour ceiling and current delivery date
- Every workspace tab has an active renderer
- Root payment access works before JavaScript loads
- Current SOW, report pages, and governing-document viewer expose the secure payment action
- Governing PDF segments reconstruct to the exact declared byte count and SHA-256
- Current and archived paths are separated and directly linked
- `index.html` does not load the legacy three-sheet renderer

The legacy evidence dataset and scripts may remain available for historical analysis, but they must not drive the active client workspace.
