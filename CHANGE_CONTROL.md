# Dunn Residence — Project State Change Control

## Current source-of-truth architecture

The active workspace separates three responsibilities so a scope change cannot erase useful operating knowledge:

- `data/current-authorization.json` — active contractual, commercial, schedule, and scope authority
- `data/operating-doctrine.json` — stable BDPC drafting standards, source hierarchy, enterprise controls, decisions, and historical evidence references
- `data/production-controls.json` — activation gates, milestones, CAD preparation, automation, QA, risks, runtime, and zero-friction acceptance controls

The active client pages are:

- `/index.html` + `/authorization.js` + `/scope-focus.js` — ten enterprise workspace tabs with retired report access neutralized after rendering
- `/sow/index.html` — current client-readable SOW
- `/sow/current/index.html` + `/sow/current/manifest.json` — checksum-verified governing issued PDF
- `/reports/index.html` — focused-scope disclaimer and expanded-reporting teaser only

The current contractual state is:

- One Existing Main Level As-Built Floor Plan
- Native AutoCAD DWG + PDF
- $600 fixed fee
- 8.0-hour included ceiling
- One working day
- One consolidated minor correction pass
- Delivery directed for 4:00 PM EDT on July 22, 2026
- Written authorization complete; payment due after delivery; pre-AutoCAD source/trace package ready; native AutoCAD license/runtime setup pending

## 2026-07-22 pre-AutoCAD update

The current pre-AutoCAD package now records:

- Payment will be provided after delivery; payment is no longer a pre-production blocker.
- The remaining production gate is licensed AutoCAD availability, plus final scale/source confirmation.
- `Thomas CAD` is organized into active source, support source, standards, reference-only, trace-reference, and read-first folders.
- A current Desktop `BDPC` crawl classified 930 media/CAD/point-cloud files totaling 3,470,993,306 bytes.
- 897 image files are represented in contact-sheet artifacts; the 829-image mass is exterior driveway/deck/yard/facade context, not an interior room-photo set.
- Point-cloud trace references are ready: 12 individual slice DXFs, one combined master DXF, one AutoCAD 2018 master DWG, slice screenshots, and manifests.
- Kickoff transcript requirements are now explicit: 1/2-inch precision, 3.5-inch typical framed-wall baseline, TCADD for floor-plan drafting logic, 1419 for paper-space/title-block standard, and the floor-plate PNG as LiDAR scale anchor.

This update does not expand scope. The current deliverable remains one Existing Main Level As-Built Floor Plan in native AutoCAD DWG and PDF.

The governing issued source document is SOW Version 3, revision `2026.07.21.4`. Its manifest records 5 pages, 22,974 bytes, and SHA-256 `8a1195f91f909e7528d94ff9a1695cea977aa85acf60b609ee3e219367229602`.

## Preserved operating doctrine

Requirement reductions may narrow contractual output, but they must not delete reusable standards, decision history, QA controls, or production doctrine.

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

## Report-retirement policy

Detailed project-control reports are not part of the active one-sheet client workspace.

Previously emailed report URLs remain stable and must never expose stale or superseded report content. Each route redirects to `/reports/`, which must display:

- A clear focused-scope disclaimer
- The current one-sheet deliverable boundary
- A `Return to Project Home` button
- A link to the current SOW
- A restrained teaser for optimized reporting available only through separate written authorization

The preserved emailed routes are:

- `/reports/`
- `/reports/intake/`
- `/reports/scan-visual/`
- `/reports/las-header/`
- `/reports/las-core/`
- `/reports/registration/`
- `/reports/completion/`
- `/reports/context-visual/`
- `/reports/cad-prep/`

The home workspace must not actively advertise report access. `scope-focus.js` converts any report cards generated from preserved historical data into non-clickable expanded-scope teasers and removes report navigation links.

## Archive policy

Historical commercial proposals and report implementations remain immutable through Git history and archived data:

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
7. Preserve previously shared public URLs; retire stale content behind explicit status pages rather than breaking links.
8. Publish any newly issued governing PDF under `sow/current/` and update its checksum manifest.
9. Run `python scripts/validate_current_scope.py`, `node --check authorization.js`, and `node --check scope-focus.js`.
10. Commit to `main`.
11. Fast-forward `gh-pages` to the validated `main` commit.
12. Verify `/bdpc/`, `/bdpc/sow/`, `/bdpc/sow/current/`, every preserved report route, and the Stripe CTA.

## Regression controls

The validation script checks:

- Current authorization and commercial invariants
- One-sheet scope and $600 payment link
- 8.0-hour ceiling and current delivery date
- Every workspace tab has an active renderer
- Enterprise doctrine and production-control data drive the renderer
- At least 18 preserved standards, 20 QA checks, 15 milestones, 14 CAD-prep controls, 14 automation controls, 12 enterprise controls, eight risks, and six decisions remain
- The 1/2-inch dimension rule, 3.5-inch wall basis, block-reuse rule, model-space source, paper-space source, LiDAR boundary, unknown-condition rule, and conflict-escalation rule remain intact
- Payment-after-delivery status is accepted; redundant reconfirmation is not introduced
- Root payment/closeout access works before JavaScript loads
- Active home navigation does not advertise retired reports
- The focused-scope controller loads after the enterprise renderer and neutralizes dynamically generated report links
- All previously emailed report routes resolve to the retirement disclaimer
- The disclaimer includes a home redirect button and expanded-scope reporting teaser
- Governing PDF segments reconstruct to the exact declared byte count and SHA-256
- Current and archived paths remain separated and directly linked
- `index.html` does not load the legacy three-sheet renderer

The legacy evidence dataset and scripts may remain available in Git history or protected internal storage, but they must not drive the active client workspace.
