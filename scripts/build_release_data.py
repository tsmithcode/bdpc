#!/usr/bin/env python3
"""Build the client-safe Dunn Residence OS data and SQLite transport."""
from __future__ import annotations

import base64
import csv
import hashlib
import json
import os
import sqlite3
import tempfile
from pathlib import Path
from typing import Any, Iterable


REVISION = "2026.07.21.5"
RELEASE_MARKER = "OS_PUBLIC_CONTEXT_CAD_PREP_20260721"
OVERLAP_STATEMENT = (
    "Five native-coordinate scan pairs were analyzed: four showed weak native "
    "overlap and one showed no material overlap. No transform was applied, no "
    "registration tolerance was adopted, and no pair was declared registered."
)


def sha256_path(path: Path) -> str:
    """Return the SHA-256 digest for a file."""
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def atomic_write(path: Path, content: str | bytes) -> None:
    """Write a text or binary file atomically inside the repository."""
    path.parent.mkdir(parents=True, exist_ok=True)
    mode = "wb" if isinstance(content, bytes) else "w"
    kwargs: dict[str, Any] = {} if isinstance(content, bytes) else {"encoding": "utf-8", "newline": ""}
    with tempfile.NamedTemporaryFile(mode=mode, dir=path.parent, delete=False, **kwargs) as handle:
        temporary = Path(handle.name)
        handle.write(content)
        handle.flush()
        os.fsync(handle.fileno())
    temporary.replace(path)


def write_csv(path: Path, headers: list[str], rows: Iterable[Iterable[Any]]) -> None:
    """Write a client-safe CSV atomically."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(
        mode="w", encoding="utf-8", newline="", dir=path.parent, delete=False
    ) as handle:
        temporary = Path(handle.name)
        writer = csv.writer(handle, lineterminator="\n")
        writer.writerow(headers)
        writer.writerows(rows)
        handle.flush()
        os.fsync(handle.fileno())
    temporary.replace(path)


def load_public_registers(root: Path) -> dict[str, list[dict[str, str]]]:
    """Load the owner-approved public CAD-preparation CSV registers."""
    data = root / "reports/data"
    mapping = {
        "cad_drafter_checks": "cad-drafter-checklist.csv",
        "cad_area_rooms": "cad-area-room-register.csv",
        "cad_assets": "cad-asset-block-register.csv",
        "cad_orientation_controls": "cad-orientation-register.csv",
    }
    registers: dict[str, list[dict[str, str]]] = {}
    for key, filename in mapping.items():
        path = data / filename
        if not path.is_file():
            raise FileNotFoundError(f"Required public CAD register missing: {path}")
        with path.open(newline="", encoding="utf-8-sig") as handle:
            rows = [dict(row) for row in csv.DictReader(handle)]
        if not rows:
            raise ValueError(f"Public CAD register is empty: {path}")
        registers[key] = rows
    return registers


VALIDATION_SESSIONS = [
    {"session": "Session A", "role": "Primary building evidence", "points": 12_940_403, "status": "Complete", "limitation": "Analytical evidence; controlling drawing authority remains pending."},
    {"session": "Session B", "role": "Interior detail evidence", "points": 3_772_526, "status": "Complete", "limitation": "Analytical evidence; not survey certification."},
    {"session": "Session C", "role": "Interior diagnostic evidence", "points": 5_164_456, "status": "Complete", "limitation": "Analytical evidence; not survey certification."},
    {"session": "Session D", "role": "Immediate property evidence", "points": 27_679_943, "status": "Complete", "limitation": "Analytical evidence; not site or civil certification."},
    {"session": "Session E", "role": "Extended site context", "points": 42_131_618, "status": "Complete", "limitation": "Context only; not a survey."},
]

NATIVE_PAIRS = [
    {"pair": "Pair 01", "classification": "native_overlap_weak", "overlay": "../assets/evidence/native-overlap/pair-01.png"},
    {"pair": "Pair 02", "classification": "native_overlap_weak", "overlay": "../assets/evidence/native-overlap/pair-02.png"},
    {"pair": "Pair 03", "classification": "native_overlap_weak", "overlay": "../assets/evidence/native-overlap/pair-03.png"},
    {"pair": "Pair 04", "classification": "native_overlap_weak", "overlay": "../assets/evidence/native-overlap/pair-04.png"},
    {"pair": "Pair 05", "classification": "no_material_overlap", "overlay": "../assets/evidence/native-overlap/pair-05.png"},
]

SLICE_EVIDENCE = [
    {"id": "SL-01", "session": "Session A", "purpose": "Low wall footprint", "height_m": 0.25, "thickness_m": 0.20, "points": 860_400, "image": "../assets/evidence/slices/session-a-low-wall.png"},
    {"id": "SL-02", "session": "Session A", "purpose": "Plan control", "height_m": 1.10, "thickness_m": 0.25, "points": 3_384_060, "image": "../assets/evidence/slices/session-a-plan-control.png"},
    {"id": "SL-03", "session": "Session A", "purpose": "Upper opening check", "height_m": 1.95, "thickness_m": 0.20, "points": 36_175, "image": "../assets/evidence/slices/session-a-upper-opening.png"},
    {"id": "SL-04", "session": "Session B", "purpose": "Low wall footprint", "height_m": 0.25, "thickness_m": 0.20, "points": 193_829, "image": "../assets/evidence/slices/session-b-low-wall.png"},
    {"id": "SL-05", "session": "Session B", "purpose": "Plan control", "height_m": 1.10, "thickness_m": 0.25, "points": 35_248, "image": "../assets/evidence/slices/session-b-plan-control.png"},
    {"id": "SL-06", "session": "Session B", "purpose": "Upper opening check", "height_m": 1.95, "thickness_m": 0.20, "points": 0, "image": "../assets/evidence/slices/session-b-upper-opening.png"},
    {"id": "SL-07", "session": "Session C", "purpose": "Low wall footprint", "height_m": 0.25, "thickness_m": 0.20, "points": 526_082, "image": "../assets/evidence/slices/session-c-low-wall.png"},
    {"id": "SL-08", "session": "Session C", "purpose": "Plan control", "height_m": 1.10, "thickness_m": 0.25, "points": 1_319_734, "image": "../assets/evidence/slices/session-c-plan-control.png"},
    {"id": "SL-09", "session": "Session C", "purpose": "Upper opening check", "height_m": 1.95, "thickness_m": 0.20, "points": 0, "image": "../assets/evidence/slices/session-c-upper-opening.png"},
]

MILESTONES = [
    {"id": "M-01", "name": "Discovery and scope alignment", "status": "Complete", "phase": "Pre-license evidence", "evidence": "The three-sheet client scope, commercial terms, technical boundaries, and kickoff gates are documented.", "limitation": "Written authorization remains a separate kickoff gate."},
    {"id": "M-02", "name": "Source package inventory", "status": "Complete", "phase": "Pre-license evidence", "evidence": "908 files and 8,801,309,883 bytes were reconciled in the protected source inventory.", "limitation": "Aggregate client-safe counts only; confidential sources remain private."},
    {"id": "M-03", "name": "Five source / working validations", "status": "Complete", "phase": "Pre-license evidence", "evidence": "5 of 5 passed independent integrity, header, stride, endpoint, bounds, dimension, and manifest checks.", "limitation": "Not registration or survey certification."},
    {"id": "M-04", "name": "Bounded full-source statistics", "status": "Complete", "phase": "Pre-license evidence", "evidence": "91,688,946 source points were processed in bounded chunks and reconciled.", "limitation": "Analytical evidence only."},
    {"id": "M-05", "name": "Full-source visual index", "status": "Ready for human review", "phase": "Pre-license evidence", "evidence": "25 full-source figures are published in the client-safe visual inspection gallery.", "limitation": "Analytical controls, not issued drawings."},
    {"id": "M-06", "name": "Plan-control slice audit", "status": "Ready for human review", "phase": "Pre-license evidence", "evidence": "Nine trial slice figures are published with contributing-point counts.", "limitation": "Two upper bands contain zero contributing points; candidate floor and units remain controls."},
    {"id": "M-07", "name": "Native-coordinate pair audit", "status": "Complete", "phase": "Pre-license evidence", "evidence": "Five pairs were analyzed: four weak native overlaps and one no-material-overlap.", "limitation": "No transform, adopted tolerance, or registration pass."},
    {"id": "M-08", "name": "Public report library", "status": "Complete", "phase": "Pre-license evidence", "evidence": "Eight detailed reports cover intake, analytical figures, photographic context, header validation, slices, overlap, CAD preparation, and completion.", "limitation": "Reports document evidence, controls, and limitations; they are not professional certifications."},
    {"id": "M-09", "name": "Estimate and release package", "status": "Ready", "phase": "Client review", "evidence": "The $3,200 estimate, print-optimized SOW, and client-safe evidence package passed local QA.", "limitation": "Requires human review and written authorization."},
    {"id": "M-10", "name": "Written authorization", "status": "Awaiting input", "phase": "Kickoff", "evidence": "BDPC written authorization of the fixed-fee scope and included review round is required.", "limitation": "Production clock has not started."},
    {"id": "M-11", "name": "$1,600 start payment", "status": "Awaiting input", "phase": "Kickoff", "evidence": "The start payment arrangement is required before production begins.", "limitation": "Production clock has not started."},
    {"id": "M-12", "name": "Controlling project inputs", "status": "Awaiting input", "phase": "Kickoff", "evidence": "BDPC must confirm controlling CAD, design/redline intent, title block, standards, and dependencies.", "limitation": "Candidate status does not establish authority."},
    {"id": "M-13", "name": "Licensed compatible runtime", "status": "Blocked", "phase": "Kickoff", "evidence": "A licensed compatible Autodesk runtime or approved remote workstation is required.", "limitation": "Native compatibility and plotting fidelity remain unvalidated."},
    {"id": "M-14", "name": "Controlled CAD working set", "status": "Not started", "phase": "Production", "evidence": "Create protected working copies and validate native openability and dependencies after all kickoff gates.", "limitation": "Confidential originals remain immutable."},
    {"id": "M-15", "name": "Existing floor plan", "status": "Not started", "phase": "Production", "evidence": "Draft and dimension the confirmed existing-condition basis.", "limitation": "No native production drawing exists yet."},
    {"id": "M-16", "name": "Proposed floor plan", "status": "Not started", "phase": "Production", "evidence": "Coordinate the proposal to BDPC-confirmed design direction.", "limitation": "No native production drawing exists yet."},
    {"id": "M-17", "name": "Site and area plan", "status": "Not started", "phase": "Production", "evidence": "Document the agreed footprint, work limits, and area context.", "limitation": "Must not imply survey, civil, or field-verification services."},
    {"id": "M-18", "name": "Internal drawing and plot QA", "status": "Not started", "phase": "Production", "evidence": "Run geometry, annotation, layer, dependency, viewport, page-setup, and plotting checks.", "limitation": "Requires the licensed compatible runtime."},
    {"id": "M-19", "name": "BDPC check set and consolidated review", "status": "Not started", "phase": "Production", "evidence": "Issue the coordinated review PDF and resolve one consolidated BDPC review round.", "limitation": "Check-set target is three business days after all kickoff gates; client review time is excluded."},
    {"id": "M-20", "name": "Final issue and closeout", "status": "Not started", "phase": "Production", "evidence": "After QA and review, issue the approved native CAD/PDF package and closeout record.", "limitation": "No final production drawing or PDF exists yet."},
]

KICKOFF_GATES = [
    {"sequence": 1, "gate": "Written authorization", "status": "Awaiting input", "owner": "BDPC", "requirement": "Authorize the $3,200 fixed-fee scope and one consolidated review round in writing."},
    {"sequence": 2, "gate": "$1,600 start payment", "status": "Awaiting input", "owner": "BDPC / CAD Guardian", "requirement": "Arrange the start payment before production begins."},
    {"sequence": 3, "gate": "Controlling input confirmation", "status": "Awaiting input", "owner": "BDPC", "requirement": "Confirm controlling CAD, design/redline intent, title block, standards, and dependency inputs."},
    {"sequence": 4, "gate": "Licensed compatible runtime", "status": "Blocked", "owner": "CAD Guardian / BDPC", "requirement": "Provide a licensed compatible Autodesk runtime or approved remote workstation."},
]

COMMERCIAL = [
    {"term": "Fixed fee", "value": "$3,200", "status": "Ready for authorization"},
    {"term": "Start payment", "value": "$1,600", "status": "Required before production start"},
    {"term": "Final payment", "value": "$1,600", "status": "Due at final issue"},
    {"term": "Additional authorized services", "value": "$90/hour", "status": "Only with written authorization"},
    {"term": "Check-set target", "value": "3 business days after all kickoff gates", "status": "Target"},
    {"term": "Production duration", "value": "4–5 business days excluding client review", "status": "Target"},
    {"term": "Included review", "value": "1 consolidated review round", "status": "Included"},
    {"term": "Automation / standards library", "value": "Separate future scope", "status": "Not included"},
]

DELIVERABLES = [
    {"sequence": 1, "name": "Existing floor plan", "status": "Not started", "scope": "Measured existing-condition plan with unresolved conflicts documented.", "format": "Native CAD + PDF", "target": "Check set"},
    {"sequence": 2, "name": "Proposed floor plan", "status": "Not started", "scope": "Proposed planning coordinated to confirmed BDPC direction.", "format": "Native CAD + PDF", "target": "Check set"},
    {"sequence": 3, "name": "Site and area plan", "status": "Not started", "scope": "Agreed footprint, work limits, and area context without survey representation.", "format": "Native CAD + PDF", "target": "Check set"},
]

FILE_GROUPS = [
    {"group": "Images / scan-derived imagery", "formats": "PNG", "count": 838, "status": "Complete", "notes": "Aggregate count only; confidential source imagery remains private. Only reviewed client-safe derivatives appear in reports."},
    {"group": "Sensor packages", "formats": "Scanner packages and support files", "count": 32, "status": "Complete", "notes": "Raw scanner working files remain private, read-only, and unpublished."},
    {"group": "Text, CSV, and JSON support files", "formats": "Text and structured data", "count": 28, "status": "Complete", "notes": "Private metadata and analytical inputs remain outside the public OS."},
    {"group": "LiDAR point clouds", "formats": "LAS", "count": 5, "status": "Complete", "notes": "Five source/working pairs passed independent validation; no point-cloud source is published."},
    {"group": "CAD drawings", "formats": "DWG", "count": 3, "status": "Awaiting input", "notes": "Candidate current and standards-reference roles are documented; BDPC must confirm controlling authority and licensed openability remains unvalidated."},
    {"group": "PDF references", "formats": "PDF", "count": 2, "status": "Awaiting input", "notes": "Candidate conceptual and standards-reference roles are documented; BDPC must confirm controlling authority."},
]

STANDARDS = [
    {"item": "Dimension precision", "status": "Ready", "rule": "No finer than 1/2 inch unless BDPC directs otherwise.", "basis": "Client direction"},
    {"item": "Typical framed wall basis", "status": "Ready", "rule": "Start typical 2×4 framed partitions at 3.5 inches, then reconcile field evidence.", "basis": "Client direction"},
    {"item": "Door and window content", "status": "Ready", "rule": "Reuse established BDPC or controlling current-project blocks and known sizes before creating new content.", "basis": "Client direction"},
    {"item": "Model-space source hierarchy", "status": "Awaiting input", "rule": "Use only the Dunn CAD and design inputs that BDPC confirms as controlling, reconciled with reviewed scan evidence; reference files provide standards context only.", "basis": "Project control"},
    {"item": "Paper space / title block", "status": "Awaiting input", "rule": "Use the current BDPC presentation standard after BDPC confirms the controlling title block and any separately maintained dependency.", "basis": "Dependency"},
    {"item": "Plot style", "status": "Awaiting input", "rule": "No separately maintained CTB or STB is treated as controlling. Provide it if the confirmed drawing set depends on one.", "basis": "Dependency"},
    {"item": "Fonts / shape files", "status": "Awaiting input", "rule": "No separately maintained font or shape-file package is treated as controlling. Provide required dependencies with the confirmed set.", "basis": "Dependency"},
    {"item": "Point-cloud coordinates", "status": "Ready", "rule": "Preserve and review native coordinates before any transformation; validate discrete common features in a licensed compatible runtime before production reliance.", "basis": "Analytical control"},
    {"item": "Existing versus proposed graphics", "status": "Ready", "rule": "Maintain unambiguous condition hierarchy, lineweight, and annotation separation.", "basis": "QA standard"},
    {"item": "Unknown conditions", "status": "Ready", "rule": "Do not invent concealed conditions. Flag material conflicts and return design decisions to BDPC.", "basis": "Decision boundary"},
    {"item": "Site / area representation", "status": "Ready", "rule": "Do not imply survey, civil, or field-verification services; identify the basis and limitations of every site or area representation.", "basis": "Scope boundary"},
]

AUTOMATION = [
    {"item": "Source intake inventory", "status": "Complete", "tool": "Read-only metadata inventory", "result": "908 files and 8,801,309,883 bytes reconciled without modifying confidential sources.", "disposition": "Used"},
    {"item": "Source / working validation", "status": "Complete", "tool": "Independent hash, header, stride, endpoint, bounds, dimension, and manifest checks", "result": "Five of five source/working pairs passed.", "disposition": "Used"},
    {"item": "Full-source statistics", "status": "Complete", "tool": "Bounded Python processing", "result": "91,688,946 source points processed and reconciled.", "disposition": "Used"},
    {"item": "Full-source visual index", "status": "Ready for human review", "tool": "Python + Pillow", "result": "25 reviewed client-safe figures published across five generalized sessions.", "disposition": "Review"},
    {"item": "Plan-control slice audit", "status": "Ready for human review", "tool": "laspy + NumPy + Pillow", "result": "Nine trial slices published; two upper bands contain zero contributing points.", "disposition": "Review"},
    {"item": "Native-coordinate pair audit", "status": "Complete", "tool": "laspy + NumPy + Pillow", "result": "Five overlays: four weak native overlaps and one no-material-overlap; no transform, tolerance, or registration pass.", "disposition": "Used"},
    {"item": "DWG openability preflight", "status": "Blocked", "tool": "Licensed compatible Autodesk runtime", "result": "Required before native production; originals remain read-only.", "disposition": "Kickoff gate"},
    {"item": "Block and standards extractor", "status": "Not started", "tool": "Licensed runtime automation", "result": "Use only after controlling inputs are confirmed and only when it reduces production effort.", "disposition": "Conditional"},
    {"item": "Layer / plotting validator", "status": "Not started", "tool": "Licensed compatible Autodesk runtime", "result": "Validate layers, text, dimensions, viewports, page setup, and plot output before issue.", "disposition": "Planned"},
    {"item": "Publish / dependency package", "status": "Not started", "tool": "Licensed compatible Autodesk runtime", "result": "Package final approved native CAD, PDFs, and dependency record after QA.", "disposition": "Planned"},
    {"item": "Automated change summary", "status": "Not started", "tool": "Controlled production logs", "result": "Generate at final issue from actual approved changes.", "disposition": "Planned"},
    {"item": "Point-cloud wall suggestions", "status": "Not applicable", "tool": "Experimental", "result": "Excluded unless separately authorized; human CAD review controls issued drawings.", "disposition": "Deferred"},
]

QA_CHECKS = [
    {"check": "Source package inventory", "status": "Complete", "evidence": "908 files and 8,801,309,883 bytes reconciled."},
    {"check": "Source / working validation", "status": "Complete", "evidence": "Five of five pairs passed independent validation."},
    {"check": "Bounded full-source processing", "status": "Complete", "evidence": "91,688,946 source points processed and reconciled."},
    {"check": "Full-source figure review", "status": "Ready for human review", "evidence": "25 client-safe figures published for review."},
    {"check": "Plan-control slice review", "status": "Ready for human review", "evidence": "Nine trial slices published; two upper bands have zero contributing points."},
    {"check": "Native-coordinate overlap", "status": "Complete", "evidence": "Four weak native overlaps and one no-material-overlap; no transform, tolerance, or registration pass."},
    {"check": "Controlling input authority", "status": "Awaiting input", "evidence": "BDPC must confirm the controlling CAD, design/redline intent, title block, standards, and dependencies."},
    {"check": "Licensed DWG openability and version", "status": "Blocked", "evidence": "Validate in a licensed compatible Autodesk runtime before production."},
    {"check": "Xrefs, fonts, and object dependencies", "status": "Blocked", "evidence": "Validate from the confirmed controlling inputs in the licensed runtime."},
    {"check": "Existing-plan geometry QA", "status": "Not started", "evidence": "Review walls, partitions, openings, stairs, fixtures, and principal dimensions during production."},
    {"check": "Proposed-plan coordination QA", "status": "Not started", "evidence": "Coordinate confirmed design intent, interfaces, room planning, openings, and connections."},
    {"check": "Site / area plan QA", "status": "Not started", "evidence": "Confirm footprint, work limits, area labels, basis, and no-survey boundary."},
    {"check": "Paper-space / plotting QA", "status": "Blocked", "evidence": "Validate title block, layers, annotations, viewport scales, page setup, CTB/STB behavior, and plot fidelity in the licensed runtime."},
    {"check": "Review and final package QA", "status": "Not started", "evidence": "Issue the check set, resolve one consolidated review round, and validate final native CAD/PDF/dependency records."},
]

UPDATES = [
    {"date": "2026-07-21", "title": "Detailed OS preservation repair", "status": "Complete", "detail": "The nine tab groups, documented rules, milestone visualization, detailed inventories, and preservation checks were restored from the pre-regression implementation and reconciled to current evidence."},
    {"date": "2026-07-21", "title": "Detailed report and SOW preservation repair", "status": "Complete", "detail": "The image-driven report library and print-optimized estimate/SOW were restored with regression safeguards."},
    {"date": "2026-07-21", "title": "Client-safe evidence published", "status": "Ready for human review", "detail": "Twenty-five full-source figures, nine plan-control slices, and five native-coordinate overlays are available in the report library."},
    {"date": "2026-07-21", "title": "Source / working validation completed", "status": "Complete", "detail": "Five of five validation pairs passed independent integrity, header, stride, endpoint, bounds, dimension, and manifest checks."},
    {"date": "2026-07-21", "title": "Full-source processing completed", "status": "Complete", "detail": "91,688,946 source points were processed in bounded chunks and reconciled."},
    {"date": "2026-07-21", "title": "Native-coordinate pair analysis completed", "status": "Complete", "detail": "Four pairs showed weak native overlap and one showed no material overlap; no transform, tolerance, or registration pass was claimed."},
    {"date": "2026-07-21", "title": "Estimate and pre-license package ready", "status": "Ready", "detail": "The $3,200 fixed-fee estimate and supporting client-safe review are ready for human review and written authorization."},
    {"date": "Next", "title": "Clear all kickoff gates", "status": "Awaiting input", "detail": "Written authorization, $1,600 start payment, controlling-input confirmation, and licensed compatible runtime access are required before production starts."},
]

RUNTIME = [
    {"component": "Licensed native CAD runtime", "version": "Compatible Autodesk runtime or approved remote workstation", "status": "Blocked", "availability": "Kickoff gate", "purpose": "Required for native openability, dependency validation, drawing production, and plotting fidelity."},
    {"component": "Compatible point-cloud runtime", "version": "Licensed compatible workflow", "status": "Blocked", "availability": "Kickoff gate", "purpose": "Required for licensed point-cloud inspection and production coordination."},
    {"component": "Python", "version": "3.14", "status": "Complete", "availability": "Installed", "purpose": "Used for bounded intake, validation, data build, and QA scripts."},
    {"component": "laspy", "version": "2.7.0", "status": "Complete", "availability": "Installed", "purpose": "Used for bounded point access and analytical evidence."},
    {"component": "NumPy", "version": "2.5.1", "status": "Complete", "availability": "Installed", "purpose": "Used for deterministic analytical processing and figures."},
    {"component": "PyMuPDF", "version": "1.28.0", "status": "Complete", "availability": "Installed", "purpose": "Used for PDF inspection and print QA support."},
    {"component": "Pillow", "version": "12.3.0", "status": "Complete", "availability": "Installed", "purpose": "Used to validate and prepare client-safe derived imagery."},
    {"component": "Browser / static workspace", "version": "GitHub Pages", "status": "Ready", "availability": "Public client-safe only", "purpose": "Provides only reviewed client-safe OS content, reports, estimate/SOW, and verified downloads without client installation."},
    {"component": "Public context and CAD-prep access", "version": "Static public routes", "status": "Complete", "availability": "Client-facing", "purpose": "Provides the owner-approved historical contact sheets and full public CAD production-preparation registers."},
    {"component": "Local project workspace", "version": "Dunn_Preflight_v1_1", "status": "Complete", "availability": "Protected", "purpose": "Separates private evidence, client-safe publication candidates, runtime records, and release QA."},
    {"component": "AI assistance", "version": "Codex", "status": "Ready", "availability": "Available", "purpose": "Supports bounded analysis and release work; human CAD and client review control issued work."},
]

CAD_PREPARATION = [
    {"group": "Authority", "item": "Controlling project input set", "status": "Awaiting input", "current_evidence": "Candidate current CAD, conceptual intent, area reference, title block, and standards roles are recorded privately.", "next_action": "BDPC confirms the exact controlling set or supplies replacements.", "owner": "BDPC"},
    {"group": "Orientation", "item": "Project north and view rotations", "status": "Awaiting input", "current_evidence": "Private page review found differing displayed orientations across conceptual views.", "next_action": "Record project north and every comparison rotation before tracing or xref alignment.", "owner": "CAD Guardian / BDPC"},
    {"group": "Units", "item": "Native units and insertion scale", "status": "Blocked", "current_evidence": "Concept graphics are not a native-unit authority.", "next_action": "Validate INSUNITS, xref insertion, and dimension basis in the licensed runtime.", "owner": "CAD Guardian"},
    {"group": "Existing plan", "item": "Exterior footprint and area boundaries", "status": "Not started", "current_evidence": "Candidate topology and reference areas are recorded privately pending authority confirmation.", "next_action": "Reconcile closed boundaries to confirmed CAD and accepted controls.", "owner": "CAD Guardian"},
    {"group": "Existing plan", "item": "Room and space inventory", "status": "Not started", "current_evidence": "Reviewed reference material does not establish every room label.", "next_action": "Inventory each enclosed space; leave unsupported names and values explicitly blank.", "owner": "CAD Guardian / BDPC"},
    {"group": "Existing plan", "item": "Walls, windows, doors, and openings", "status": "Not started", "current_evidence": "Private visual context can support reconciliation but does not establish a complete schedule.", "next_action": "Count, tag, size when supported, and track every unresolved value.", "owner": "CAD Guardian"},
    {"group": "Existing plan", "item": "Stairs, fixtures, and equipment", "status": "Not started", "current_evidence": "Context evidence exists; complete production authority does not.", "next_action": "Inventory only supported items and separate observations from assumptions.", "owner": "CAD Guardian"},
    {"group": "Proposed plan", "item": "Kitchen and living organization", "status": "Awaiting input", "current_evidence": "Candidate concept establishes a kitchen/living/deck planning direction.", "next_action": "Confirm intent and controlling dimensions before native drafting.", "owner": "BDPC"},
    {"group": "Proposed plan", "item": "Cabinet, appliance, island, and furniture blocks", "status": "Not started", "current_evidence": "Required content categories are identified privately.", "next_action": "Source approved BDPC blocks first; create controlled content only where needed.", "owner": "CAD Guardian"},
    {"group": "Proposed plan", "item": "Deck, stairs, railings, and openings", "status": "Awaiting input", "current_evidence": "Candidate intent is visible; exact geometry and construction information are unresolved.", "next_action": "Resolve dimensions and draft without structural or code certification claims.", "owner": "BDPC / CAD Guardian"},
    {"group": "Site / area", "item": "Drive, walk, footprint, and work limits", "status": "Awaiting input", "current_evidence": "Candidate site context is recorded privately and marked as non-survey evidence.", "next_action": "Reconcile generalized limits to the controlling input and state the basis.", "owner": "CAD Guardian / BDPC"},
    {"group": "Phasing", "item": "Existing, demolition, and new-work graphics", "status": "Awaiting input", "current_evidence": "Concept overlays do not define every demolition decision.", "next_action": "Apply the confirmed BDPC graphic standard and return missing decisions.", "owner": "BDPC / CAD Guardian"},
    {"group": "Standards", "item": "Layers, dimensions, notes, and tags", "status": "Awaiting input", "current_evidence": "Documented OS rules are preserved; the controlling project package remains unconfirmed.", "next_action": "Map confirmed standards and record exceptions.", "owner": "BDPC / CAD Guardian"},
    {"group": "Dependencies", "item": "Title block, xrefs, fonts, shapes, and object support", "status": "Blocked", "current_evidence": "Native dependency behavior remains unvalidated.", "next_action": "Audit the confirmed package in a licensed compatible Autodesk runtime.", "owner": "CAD Guardian"},
    {"group": "Plot", "item": "Layouts, viewports, page setup, and CTB/STB", "status": "Blocked", "current_evidence": "Browser and open-source checks do not establish native plotting fidelity.", "next_action": "Create native check plots and compare paper/PDF output.", "owner": "CAD Guardian"},
    {"group": "QA", "item": "Geometry, dimension, and area closure", "status": "Not started", "current_evidence": "Acceptance checks are defined in the private drafter register.", "next_action": "Audit gaps, overlaps, duplicate entities, dimension closure, and classified areas.", "owner": "CAD Guardian"},
    {"group": "QA", "item": "Sheet-to-sheet coordination", "status": "Not started", "current_evidence": "Three deliverables share footprints, areas, orientation, and revision state.", "next_action": "Cross-check all shared controls before the check set.", "owner": "CAD Guardian"},
    {"group": "Delivery", "item": "Three-sheet check set", "status": "Not started", "current_evidence": "Target is three business days after all four kickoff gates.", "next_action": "Issue the controlled review PDF only after internal native QA.", "owner": "CAD Guardian"},
    {"group": "Delivery", "item": "Consolidated review and final issue", "status": "Not started", "current_evidence": "One consolidated review round is included.", "next_action": "Resolve the complete response and issue validated native CAD/PDF records.", "owner": "BDPC / CAD Guardian"},
]

ROLE_VIEWS = [
    {"role": "Architect", "focus": "Confirm design intent, controlling dimensions, room names, openings, title block, and standards authority.", "decision": "Approve or correct project controls; return one consolidated review."},
    {"role": "CAD drafter", "focus": "Work the private checklist across orientation, geometry, blocks, areas, dependencies, QA, and delivery.", "decision": "Do not fill unsupported blanks or silently resolve conflicts."},
    {"role": "B2B commercial", "focus": "Maintain the authorized three-sheet scope, four kickoff gates, schedule, payment, and change control.", "decision": "Route scope additions through written authorization at $90/hour."},
    {"role": "Delivery", "focus": "Control check-set, review, native/PDF package, dependency, revision, and checksum evidence.", "decision": "Issue only after native open/plot and package QA pass."},
    {"role": "Client customer (experimental)", "focus": "See clear readiness, required decisions, commercial terms, photographic context, and the full CAD production-preparation register.", "decision": "Use labeled candidate values and statuses; raw confidential source files remain outside the OS."},
]

ACCESS_CONTROLS = [
    {"control": "Public OS", "status": "Complete", "rule": "All published routes are intentionally public under explicit owner authorization."},
    {"control": "Historical contact sheets", "status": "Complete", "rule": "Four renamed local assets are published through the photographic-context report."},
    {"control": "CAD production-preparation registers", "status": "Complete", "rule": "Checklist, area/room, asset/block, and orientation CSVs are public and rendered in the CAD Prep report."},
    {"control": "Raw confidential source files", "status": "Prohibited", "rule": "CAD, point clouds, source PDF/PNG files, coordinates, hashes, and local paths remain outside Git."},
]

REPORTS = [
    {"id": "RPT-01", "name": "Source intake", "status": "Complete", "url": "/bdpc/reports/intake/", "summary": "Aggregate source inventory and authority boundaries."},
    {"id": "RPT-02", "name": "Visual inspection", "status": "Complete", "url": "/bdpc/reports/scan-visual/", "summary": "Twenty-five full-source figures across five generalized scan sessions."},
    {"id": "RPT-03", "name": "Header validation", "status": "Complete", "url": "/bdpc/reports/las-header/", "summary": "Five readable point-cloud headers and reconciled point totals."},
    {"id": "RPT-04", "name": "Plan-control slice evidence", "status": "Complete", "url": "/bdpc/reports/las-core/", "summary": "Nine trial slices with contributing-point and zero-band limitations."},
    {"id": "RPT-05", "name": "Native-coordinate overlap", "status": "Complete", "url": "/bdpc/reports/registration/", "summary": "Five current pair overlays with the four-weak/one-no-material result."},
    {"id": "RPT-06", "name": "Pre-license completion brief", "status": "Ready", "url": "/bdpc/reports/completion/", "summary": "Current completion, kickoff gates, evidence counts, and truth boundary."},
    {"id": "RPT-07", "name": "Photographic context", "status": "Complete", "url": "/bdpc/reports/context-visual/", "summary": "Four restored contact sheets covering exterior, site, facade, deck/porch, interior, entry, and companion scan context."},
    {"id": "RPT-08", "name": "CAD drafter preparation", "status": "Complete", "url": "/bdpc/reports/cad-prep/", "summary": "Full drafting checklist, areas, spaces, blocks, assets, orientation, dependencies, QA, and delivery controls."},
]


def build_project() -> dict[str, Any]:
    """Return the canonical browser-facing project object."""
    return {
        "schema_version": "2.1",
        "revision": REVISION,
        "release_marker": RELEASE_MARKER,
        "updated_date": "2026-07-21",
        "project": {
            "id": "BDPC-DUNN-OS",
            "name": "Dunn Residence",
            "client": "BDPC",
            "provider": "CAD Guardian",
            "phase": "Pre-license package ready",
            "current_gate": "Authorization, start payment, controlling inputs, and licensed runtime",
            "production_status": "Not started",
            "priority": "Client-authorized three-sheet production after all kickoff gates",
        },
        "metrics": {
            "source_files": 908,
            "source_bytes": 8_801_309_883,
            "source_size_gib": 8.20,
            "scan_sessions": 5,
            "source_points": 91_688_946,
            "validated_sessions": 5,
            "full_source_figures": 25,
            "plan_control_slices": 9,
            "native_overlays": 5,
            "weak_native_overlap": 4,
            "no_material_overlap": 1,
            "production_drawings_complete": 0,
        },
        "overlap_statement": OVERLAP_STATEMENT,
        "source_integrity_statement": "The fresh metadata inventory matches the prior 908-file path-and-size set, and all five source/working validation pairs passed. Confidential source material remains private and read-only.",
        "truth_boundary": [
            "No pair was declared registered and no survey accuracy is claimed.",
            "No architectural, engineering, code, zoning, permit, or life-safety certification is claimed.",
            "Native drawing production has not begun; no final production drawing or PDF exists.",
            "Licensed native openability, dependencies, title-block behavior, and plot fidelity remain unvalidated.",
        ],
        "client_actions": [
            "Review estimate",
            "Authorize project",
            "Confirm controlling inputs",
            "Provide or start licensed runtime access",
            "Submit start payment",
        ],
        "milestones": MILESTONES,
        "file_groups": FILE_GROUPS,
        "standards": STANDARDS,
        "automation": AUTOMATION,
        "kickoff_gates": KICKOFF_GATES,
        "validation_sessions": VALIDATION_SESSIONS,
        "native_pairs": NATIVE_PAIRS,
        "slices": SLICE_EVIDENCE,
        "commercial": COMMERCIAL,
        "deliverables": DELIVERABLES,
        "qa_checks": QA_CHECKS,
        "updates": UPDATES,
        "runtime": RUNTIME,
        "cad_preparation": CAD_PREPARATION,
        "role_views": ROLE_VIEWS,
        "access_controls": ACCESS_CONTROLS,
        "reports": REPORTS,
    }


SCHEMA_SQL = """-- BDPC Client Service OS client-safe SQLite schema
PRAGMA foreign_keys=ON;
CREATE TABLE project(id TEXT PRIMARY KEY,name TEXT NOT NULL,client TEXT NOT NULL,provider TEXT NOT NULL,phase TEXT NOT NULL,current_gate TEXT NOT NULL,production_status TEXT NOT NULL,revision TEXT NOT NULL,updated_date TEXT NOT NULL);
CREATE TABLE metrics(key TEXT PRIMARY KEY,value_num REAL,value_text TEXT,unit TEXT);
CREATE TABLE milestones(milestone_id TEXT PRIMARY KEY,name TEXT NOT NULL,status TEXT NOT NULL,phase TEXT NOT NULL,evidence TEXT NOT NULL,limitation TEXT NOT NULL);
CREATE TABLE kickoff_gates(sequence INTEGER PRIMARY KEY,gate TEXT NOT NULL,status TEXT NOT NULL,owner TEXT NOT NULL,requirement TEXT NOT NULL);
CREATE TABLE validation_sessions(session_label TEXT PRIMARY KEY,role TEXT NOT NULL,point_count INTEGER NOT NULL,status TEXT NOT NULL,limitation TEXT NOT NULL);
CREATE TABLE native_overlap_pairs(pair_label TEXT PRIMARY KEY,classification TEXT NOT NULL,transform_applied TEXT NOT NULL,tolerance_adopted TEXT NOT NULL,registration_pass TEXT NOT NULL,overlay TEXT NOT NULL,limitation TEXT NOT NULL);
CREATE TABLE slice_evidence(slice_id TEXT PRIMARY KEY,session_label TEXT NOT NULL,purpose TEXT NOT NULL,height_candidate_m REAL NOT NULL,thickness_candidate_m REAL NOT NULL,point_count INTEGER NOT NULL,status TEXT NOT NULL,image TEXT NOT NULL,limitation TEXT NOT NULL);
CREATE TABLE commercial(id INTEGER PRIMARY KEY AUTOINCREMENT,term TEXT NOT NULL,value TEXT NOT NULL,status TEXT NOT NULL);
CREATE TABLE deliverables(sequence INTEGER PRIMARY KEY,name TEXT NOT NULL,status TEXT NOT NULL,scope TEXT NOT NULL,output_format TEXT NOT NULL,target TEXT NOT NULL);
CREATE TABLE reports(report_id TEXT PRIMARY KEY,name TEXT NOT NULL,status TEXT NOT NULL,url TEXT NOT NULL,summary TEXT NOT NULL);
CREATE TABLE file_groups(id INTEGER PRIMARY KEY AUTOINCREMENT,group_name TEXT NOT NULL,formats TEXT NOT NULL,file_count INTEGER NOT NULL,status TEXT NOT NULL,notes TEXT NOT NULL);
CREATE TABLE standards(id INTEGER PRIMARY KEY AUTOINCREMENT,item TEXT NOT NULL,status TEXT NOT NULL,rule TEXT NOT NULL,basis TEXT NOT NULL);
CREATE TABLE automation(id INTEGER PRIMARY KEY AUTOINCREMENT,item TEXT NOT NULL,status TEXT NOT NULL,tool TEXT NOT NULL,result TEXT NOT NULL,disposition TEXT NOT NULL);
CREATE TABLE qa_checks(id INTEGER PRIMARY KEY AUTOINCREMENT,check_name TEXT NOT NULL,status TEXT NOT NULL,evidence TEXT NOT NULL);
CREATE TABLE updates(id INTEGER PRIMARY KEY AUTOINCREMENT,event_date TEXT NOT NULL,title TEXT NOT NULL,status TEXT NOT NULL,detail TEXT NOT NULL);
CREATE TABLE runtime(id INTEGER PRIMARY KEY AUTOINCREMENT,component TEXT NOT NULL,version TEXT NOT NULL,status TEXT NOT NULL,availability TEXT NOT NULL,purpose TEXT NOT NULL);
CREATE TABLE cad_preparation(id INTEGER PRIMARY KEY AUTOINCREMENT,concern_group TEXT NOT NULL,item TEXT NOT NULL,status TEXT NOT NULL,current_evidence TEXT NOT NULL,next_action TEXT NOT NULL,owner TEXT NOT NULL);
CREATE TABLE role_views(id INTEGER PRIMARY KEY AUTOINCREMENT,role TEXT NOT NULL,focus TEXT NOT NULL,decision_rule TEXT NOT NULL);
CREATE TABLE access_controls(id INTEGER PRIMARY KEY AUTOINCREMENT,control TEXT NOT NULL,status TEXT NOT NULL,rule TEXT NOT NULL);
CREATE TABLE cad_public_registers(register_name TEXT NOT NULL,sequence INTEGER NOT NULL,record_id TEXT NOT NULL,payload_json TEXT NOT NULL,PRIMARY KEY(register_name,sequence));
"""


def build_database(path: Path, project: dict[str, Any]) -> dict[str, int]:
    """Build and validate the canonical SQLite database."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=path.parent, suffix=".sqlite", delete=False) as handle:
        temporary = Path(handle.name)
    try:
        with sqlite3.connect(temporary) as connection:
            connection.executescript(SCHEMA_SQL)
            p = project["project"]
            connection.execute(
                "INSERT INTO project VALUES (?,?,?,?,?,?,?,?,?)",
                (p["id"], p["name"], p["client"], p["provider"], p["phase"], p["current_gate"], p["production_status"], REVISION, project["updated_date"]),
            )
            for key, value in project["metrics"].items():
                if isinstance(value, (int, float)):
                    connection.execute("INSERT INTO metrics VALUES (?,?,?,?)", (key, value, None, None))
                else:
                    connection.execute("INSERT INTO metrics VALUES (?,?,?,?)", (key, None, str(value), None))
            connection.executemany(
                "INSERT INTO milestones VALUES (?,?,?,?,?,?)",
                [(x["id"], x["name"], x["status"], x["phase"], x["evidence"], x["limitation"]) for x in MILESTONES],
            )
            connection.executemany(
                "INSERT INTO kickoff_gates VALUES (?,?,?,?,?)",
                [(x["sequence"], x["gate"], x["status"], x["owner"], x["requirement"]) for x in KICKOFF_GATES],
            )
            connection.executemany(
                "INSERT INTO validation_sessions VALUES (?,?,?,?,?)",
                [(x["session"], x["role"], x["points"], x["status"], x["limitation"]) for x in VALIDATION_SESSIONS],
            )
            connection.executemany(
                "INSERT INTO native_overlap_pairs VALUES (?,?,?,?,?,?,?)",
                [(x["pair"], x["classification"], "no", "no", "no", x["overlay"], "Analytical evidence only; licensed-runtime discrete-control review remains required.") for x in NATIVE_PAIRS],
            )
            connection.executemany(
                "INSERT INTO slice_evidence VALUES (?,?,?,?,?,?,?,?,?)",
                [(x["id"], x["session"], x["purpose"], x["height_m"], x["thickness_m"], x["points"], "Ready for human review", x["image"], "Candidate floor/unit; analytical control only" if x["points"] else "Zero contributing points in this upper trial band; candidate floor/unit; analytical control only") for x in SLICE_EVIDENCE],
            )
            connection.executemany("INSERT INTO commercial(term,value,status) VALUES (?,?,?)", [(x["term"], x["value"], x["status"]) for x in COMMERCIAL])
            connection.executemany(
                "INSERT INTO deliverables VALUES (?,?,?,?,?,?)",
                [(x["sequence"], x["name"], x["status"], x["scope"], x["format"], x["target"]) for x in DELIVERABLES],
            )
            connection.executemany(
                "INSERT INTO reports VALUES (?,?,?,?,?)",
                [(x["id"], x["name"], x["status"], x["url"], x["summary"]) for x in REPORTS],
            )
            connection.executemany(
                "INSERT INTO file_groups(group_name,formats,file_count,status,notes) VALUES (?,?,?,?,?)",
                [(x["group"], x["formats"], x["count"], x["status"], x["notes"]) for x in FILE_GROUPS],
            )
            connection.executemany(
                "INSERT INTO standards(item,status,rule,basis) VALUES (?,?,?,?)",
                [(x["item"], x["status"], x["rule"], x["basis"]) for x in STANDARDS],
            )
            connection.executemany(
                "INSERT INTO automation(item,status,tool,result,disposition) VALUES (?,?,?,?,?)",
                [(x["item"], x["status"], x["tool"], x["result"], x["disposition"]) for x in AUTOMATION],
            )
            connection.executemany(
                "INSERT INTO qa_checks(check_name,status,evidence) VALUES (?,?,?)",
                [(x["check"], x["status"], x["evidence"]) for x in QA_CHECKS],
            )
            connection.executemany(
                "INSERT INTO updates(event_date,title,status,detail) VALUES (?,?,?,?)",
                [(x["date"], x["title"], x["status"], x["detail"]) for x in UPDATES],
            )
            connection.executemany(
                "INSERT INTO runtime(component,version,status,availability,purpose) VALUES (?,?,?,?,?)",
                [(x["component"], x["version"], x["status"], x["availability"], x["purpose"]) for x in RUNTIME],
            )
            connection.executemany(
                "INSERT INTO cad_preparation(concern_group,item,status,current_evidence,next_action,owner) VALUES (?,?,?,?,?,?)",
                [(x["group"], x["item"], x["status"], x["current_evidence"], x["next_action"], x["owner"]) for x in CAD_PREPARATION],
            )
            connection.executemany(
                "INSERT INTO role_views(role,focus,decision_rule) VALUES (?,?,?)",
                [(x["role"], x["focus"], x["decision"]) for x in ROLE_VIEWS],
            )
            connection.executemany(
                "INSERT INTO access_controls(control,status,rule) VALUES (?,?,?)",
                [(x["control"], x["status"], x["rule"]) for x in ACCESS_CONTROLS],
            )
            register_id_keys = {
                "cad_drafter_checks": "check_id",
                "cad_area_rooms": "record_id",
                "cad_assets": "asset_id",
                "cad_orientation_controls": "orientation_id",
            }
            public_register_rows: list[tuple[str, int, str, str]] = []
            for register_name, id_key in register_id_keys.items():
                for sequence, record in enumerate(project[register_name], start=1):
                    public_register_rows.append(
                        (register_name, sequence, record[id_key], json.dumps(record, ensure_ascii=False, sort_keys=True))
                    )
            connection.executemany("INSERT INTO cad_public_registers VALUES (?,?,?,?)", public_register_rows)
            connection.commit()
            integrity = connection.execute("PRAGMA integrity_check").fetchone()[0]
            if integrity != "ok":
                raise RuntimeError(f"SQLite integrity failure: {integrity}")
            counts = {
                row[0]: connection.execute(f'SELECT COUNT(*) FROM "{row[0]}"').fetchone()[0]
                for row in connection.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
            }
        temporary.replace(path)
        return counts
    except Exception:
        temporary.unlink(missing_ok=True)
        raise


def build_report_csvs(root: Path) -> list[Path]:
    """Build sanitized public CSV exports."""
    data = root / "reports" / "data"
    outputs: list[Path] = []
    path = data / "validated-scan-summary.csv"
    write_csv(path, ["session", "role", "all_source_points", "finite_coordinates", "status", "limitation"], [(x["session"], x["role"], x["points"], "yes", x["status"], x["limitation"]) for x in VALIDATION_SESSIONS])
    outputs.append(path)
    path = data / "native-overlap-summary.csv"
    write_csv(path, ["pair", "classification", "transform_applied", "registration_tolerance_adopted", "registration_pass", "overlay", "limitation"], [(x["pair"], x["classification"], "no", "no", "no", x["overlay"], "Analytical evidence only; licensed-runtime discrete-control review remains required.") for x in NATIVE_PAIRS])
    outputs.append(path)
    path = data / "slice-summary.csv"
    write_csv(path, ["slice_id", "session", "purpose", "height_above_candidate_floor_m", "thickness_candidate_m", "point_count", "image", "status", "limitation"], [(x["id"], x["session"], x["purpose"], x["height_m"], x["thickness_m"], x["points"], x["image"], "Ready for human review", "Candidate floor/unit; analytical control only" if x["points"] else "Zero contributing points in this upper trial band; candidate floor/unit; analytical control only") for x in SLICE_EVIDENCE])
    outputs.append(path)
    path = data / "milestone-evidence.csv"
    write_csv(path, ["milestone_id", "milestone", "status", "phase", "evidence", "limitation"], [(x["id"], x["name"], x["status"], x["phase"], x["evidence"], x["limitation"]) for x in MILESTONES])
    outputs.append(path)
    for filename in (
        "cad-drafter-checklist.csv",
        "cad-area-room-register.csv",
        "cad-asset-block-register.csv",
        "cad-orientation-register.csv",
    ):
        static_path = data / filename
        if not static_path.is_file():
            raise FileNotFoundError(f"Required public CAD-prep register missing: {static_path}")
        outputs.append(static_path)
    return outputs


def main() -> int:
    """Build JSON, CSV, SQLite, transport parts, schema, and manifest."""
    root = Path(__file__).resolve().parents[1]
    if not (root / ".git").exists():
        raise SystemExit(f"Refusing to build outside a Git worktree: {root}")
    data_dir = root / "data"
    project = build_project()
    project.update(load_public_registers(root))
    project_path = data_dir / "project.json"
    atomic_write(project_path, json.dumps(project, indent=2, ensure_ascii=False) + "\n")
    schema_path = data_dir / "schema.sql"
    atomic_write(schema_path, SCHEMA_SQL)
    csv_paths = build_report_csvs(root)
    database_path = data_dir / "bdpc_client_os.sqlite"
    table_counts = build_database(database_path, project)

    transport_dir = data_dir / "sqlite"
    transport_dir.mkdir(parents=True, exist_ok=True)
    for stale in transport_dir.glob("part-*.b64"):
        stale.unlink()
    encoded = base64.b64encode(database_path.read_bytes()).decode("ascii")
    part_paths: list[Path] = []
    for index, offset in enumerate(range(0, len(encoded), 16_000), start=1):
        part = transport_dir / f"part-{index:02d}.b64"
        atomic_write(part, encoded[offset : offset + 16_000])
        part_paths.append(part)

    release_path = data_dir / "release.json"
    atomic_write(
        release_path,
        json.dumps({"release_marker": RELEASE_MARKER, "revision": REVISION, "updated_date": "2026-07-21"}, indent=2) + "\n",
    )
    instructions_path = data_dir / "README.txt"
    atomic_write(
        instructions_path,
        "BDPC Dunn Residence client-safe data download\n\n"
        "Use the ‘Download verified SQLite’ control in the Client Service OS. The browser reconstructs the multipart transport, verifies the transport and database SHA-256 values from manifest.json, and then saves bdpc_client_os.sqlite.\n\n"
        "A direct copy is also available at data/bdpc_client_os.sqlite. Use manifest.json to verify its SHA-256 value and expected table counts. data/schema.sql documents the client-safe schema.\n",
    )
    tracked_outputs = [project_path, schema_path, database_path, release_path, instructions_path, *part_paths, *csv_paths]
    manifest = {
        "schema_version": "2.1",
        "revision": REVISION,
        "release_marker": RELEASE_MARKER,
        "updated_date": "2026-07-21",
        "database": "data/bdpc_client_os.sqlite",
        "database_download_name": "bdpc_client_os.sqlite",
        "database_sha256": sha256_path(database_path),
        "database_transport": [str(path.relative_to(root)) for path in part_paths],
        "database_transport_sha256": hashlib.sha256(encoded.encode("ascii")).hexdigest(),
        "table_counts": table_counts,
        "files": {str(path.relative_to(root)): {"bytes": path.stat().st_size, "sha256": sha256_path(path)} for path in tracked_outputs},
        "privacy": "Client-safe aggregate and derived project controls only; confidential source materials are not included.",
    }
    atomic_write(data_dir / "manifest.json", json.dumps(manifest, indent=2, sort_keys=True) + "\n")
    print(json.dumps({"revision": REVISION, "database_sha256": manifest["database_sha256"], "transport_parts": len(part_paths), "table_counts": table_counts}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
