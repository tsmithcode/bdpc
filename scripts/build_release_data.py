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


REVISION = "2026.07.21.2"
RELEASE_MARKER = "OS_SYNC_20260721"
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
    {"id": "M-01", "name": "Five source/working validations", "status": "Complete", "phase": "Pre-license evidence", "evidence": "5 of 5 passed independent integrity, header, stride, endpoint, bounds, dimension, and manifest checks.", "limitation": "Not registration or survey certification."},
    {"id": "M-02", "name": "Full-source statistics", "status": "Complete", "phase": "Pre-license evidence", "evidence": "91,688,946 source points processed in bounded chunks and reconciled.", "limitation": "Analytical evidence only."},
    {"id": "M-03", "name": "Full-source figures", "status": "Ready for human review", "phase": "Pre-license evidence", "evidence": "25 full-source figures generated; one decision-relevant plan view is included here.", "limitation": "Selected figures are analytical controls, not issued drawings."},
    {"id": "M-04", "name": "Plan-control slices", "status": "Ready for human review", "phase": "Pre-license evidence", "evidence": "Nine trial slice figures generated.", "limitation": "Two upper trial bands contain zero contributing points; floor basis and candidate units remain controls."},
    {"id": "M-05", "name": "Native-coordinate pair analysis", "status": "Complete", "phase": "Pre-license evidence", "evidence": "Five pairs analyzed: four weak native overlaps and one no-material-overlap.", "limitation": "No transform, adopted tolerance, or registration pass."},
    {"id": "M-06", "name": "Estimate and release package", "status": "Ready", "phase": "Client review", "evidence": "$3,200 estimate and client-safe evidence package passed local QA.", "limitation": "Requires human review and written authorization."},
    {"id": "M-07", "name": "Written authorization", "status": "Awaiting input", "phase": "Kickoff", "evidence": "BDPC written authorization is required.", "limitation": "Production clock has not started."},
    {"id": "M-08", "name": "Start payment", "status": "Awaiting input", "phase": "Kickoff", "evidence": "$1,600 start payment arrangement is required.", "limitation": "Production clock has not started."},
    {"id": "M-09", "name": "Controlling inputs", "status": "Awaiting input", "phase": "Kickoff", "evidence": "BDPC must confirm controlling CAD, design/redline intent, title block, standards, and dependencies.", "limitation": "Candidate status does not establish authority."},
    {"id": "M-10", "name": "Licensed Autodesk-compatible runtime", "status": "Blocked", "phase": "Kickoff", "evidence": "Licensed compatible Autodesk runtime or approved remote workstation is required.", "limitation": "Native compatibility and plotting fidelity remain unvalidated."},
    {"id": "M-11", "name": "Native drawing production", "status": "Not started", "phase": "Production", "evidence": "No native production drawing or final production PDF exists.", "limitation": "Begins only after all kickoff gates."},
    {"id": "M-12", "name": "Consolidated client review", "status": "Not started", "phase": "Production", "evidence": "One consolidated review round is included.", "limitation": "Occurs after the check set is issued."},
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
]

DELIVERABLES = [
    {"sequence": 1, "name": "Existing floor plan", "status": "Not started", "scope": "Measured existing-condition plan with unresolved conflicts documented.", "format": "Native CAD + PDF", "target": "Check set"},
    {"sequence": 2, "name": "Proposed floor plan", "status": "Not started", "scope": "Proposed planning coordinated to confirmed BDPC direction.", "format": "Native CAD + PDF", "target": "Check set"},
    {"sequence": 3, "name": "Site and area plan", "status": "Not started", "scope": "Agreed footprint, work limits, and area context without survey representation.", "format": "Native CAD + PDF", "target": "Check set"},
]

REPORTS = [
    {"id": "RPT-01", "name": "Source intake", "status": "Complete", "url": "/bdpc/reports/intake/", "summary": "Aggregate source inventory and authority boundaries."},
    {"id": "RPT-02", "name": "Visual inspection", "status": "Complete", "url": "/bdpc/reports/scan-visual/", "summary": "Twenty-five full-source figures across five generalized scan sessions."},
    {"id": "RPT-03", "name": "Header validation", "status": "Complete", "url": "/bdpc/reports/las-header/", "summary": "Five readable point-cloud headers and reconciled point totals."},
    {"id": "RPT-04", "name": "Plan-control slice evidence", "status": "Complete", "url": "/bdpc/reports/las-core/", "summary": "Nine trial slices with contributing-point and zero-band limitations."},
    {"id": "RPT-05", "name": "Native-coordinate overlap", "status": "Complete", "url": "/bdpc/reports/registration/", "summary": "Five current pair overlays with the four-weak/one-no-material result."},
    {"id": "RPT-06", "name": "Pre-license completion brief", "status": "Ready", "url": "/bdpc/reports/completion/", "summary": "Current completion, kickoff gates, evidence counts, and truth boundary."},
]


def build_project() -> dict[str, Any]:
    """Return the canonical browser-facing project object."""
    return {
        "schema_version": "2.0",
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
        "kickoff_gates": KICKOFF_GATES,
        "validation_sessions": VALIDATION_SESSIONS,
        "native_pairs": NATIVE_PAIRS,
        "slices": SLICE_EVIDENCE,
        "commercial": COMMERCIAL,
        "deliverables": DELIVERABLES,
        "qa_checks": [
            {"check": "Source/working validation", "status": "Complete", "evidence": "5 of 5 passed independent validation."},
            {"check": "Bounded full-source processing", "status": "Complete", "evidence": "91,688,946 points reconciled."},
            {"check": "Native-coordinate overlap", "status": "Complete", "evidence": "Four weak overlaps and one no-material-overlap; no transform/tolerance/pass."},
            {"check": "Controlling inputs", "status": "Awaiting input", "evidence": "BDPC confirmation is a kickoff gate."},
            {"check": "Licensed native validation", "status": "Blocked", "evidence": "Compatible runtime or approved remote workstation required."},
            {"check": "Production drawings", "status": "Not started", "evidence": "Begins after all kickoff gates."},
        ],
        "updates": [
            {"date": "2026-07-21", "title": "Client OS release synchronized", "status": "Complete", "detail": "Canonical data, client-safe evidence, estimate terms, kickoff gates, and verified download transport were reconciled."},
            {"date": "2026-07-21", "title": "Pre-license evidence package", "status": "Ready", "detail": "The estimate and supporting project review are ready for human review and written authorization."},
            {"date": "Next", "title": "Clear all kickoff gates", "status": "Awaiting input", "detail": "Written authorization, start payment, controlling-input confirmation, and licensed runtime access are all required before production starts."},
        ],
        "runtime": [
            {"component": "Licensed compatible Autodesk runtime or approved remote workstation", "status": "Blocked", "purpose": "Native openability, dependencies, production, and plotting validation."},
            {"component": "Client OS", "status": "Ready", "purpose": "Client-safe project review, estimate, evidence, and downloads."},
        ],
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
    return outputs


def main() -> int:
    """Build JSON, CSV, SQLite, transport parts, schema, and manifest."""
    root = Path(__file__).resolve().parents[1]
    if not (root / ".git").exists():
        raise SystemExit(f"Refusing to build outside a Git worktree: {root}")
    data_dir = root / "data"
    project = build_project()
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
        "schema_version": "2.0",
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
