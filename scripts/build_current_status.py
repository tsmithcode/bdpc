#!/usr/bin/env python3
"""Build the live status JavaScript, SQLite snapshot, and verified transport."""
from __future__ import annotations

import base64
import hashlib
import json
import sqlite3
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
STATUS_PATH = DATA / "current-status.json"
DATABASE = DATA / "bdpc_client_os.sqlite"
PARTS = DATA / "sqlite"
PART_SIZE = 16_000


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def replace_rows(connection: sqlite3.Connection, table: str, sql: str, rows: list[tuple]) -> None:
    connection.execute(f"DELETE FROM {table}")
    connection.executemany(sql, rows)


status = json.loads(STATUS_PATH.read_text(encoding="utf-8"))
project = status["project"]

connection = sqlite3.connect(DATABASE)
connection.execute("PRAGMA foreign_keys=ON")
with connection:
    replace_rows(
        connection,
        "project",
        "INSERT INTO project VALUES (?,?,?,?,?,?,?,?,?)",
        [(
            project["id"], project["name"], project["client"], project["provider"],
            project["current_state"], project["remaining_gate"], project["production_status"],
            status["revision"], status["updated_at"],
        )],
    )
    metrics = [
        ("delivery_readiness_current", 92, "92", "percent"),
        ("delivery_readiness_prepass", 68, "68", "percent"),
        ("model_entities", 167, "167", "entities"),
        ("native_dimensions", 14, "14", "dimensions"),
        ("opening_assemblies", 6, "6", "assemblies"),
        ("window_zones", 8, "8", "zones"),
        ("main_level_area", 1116, "1,116", "square feet"),
        ("deck_area", 324, "324", "square feet"),
        ("porch_area", 108, "108", "square feet"),
        ("sheet", None, "A101", "sheet"),
        ("viewport_scale", None, "1:48", "scale"),
    ]
    replace_rows(connection, "metrics", "INSERT INTO metrics VALUES (?,?,?,?)", metrics)

    connection.execute("DELETE FROM milestones")
    # Milestones have six columns; keep insertion explicit for schema clarity.
    connection.executemany(
        "INSERT INTO milestones VALUES (?,?,?,?,?,?)",
        [
            (f"M-{index:02d}", item["milestone"], item["status"], item["date"], item["evidence"], "No scope expansion")
            for index, item in enumerate(status["timeline"], 1)
        ],
    )

    gates = [
        (1, "One-sheet written authorization", "complete", "BDPC", "A101 existing main level only"),
        (2, "Licensed AutoCAD Architecture 2026", "complete", "CAD Guardian", "Native drafting and plotting environment operational"),
        (3, "Brian's July 24 drafting decisions", "complete", "BDPC", "ROOM, field verification, no north arrow, DWG + PDF"),
        (4, "BDPC fonts / CTB / title standards", "pending", "BDPC", "Required before final issuance"),
        (5, "BDPC professional acceptance", "pending", "BDPC", "Final architectural release authority"),
    ]
    replace_rows(connection, "kickoff_gates", "INSERT INTO kickoff_gates VALUES (?,?,?,?,?)", gates)

    commercial = [
        (index, item["term"], item["value"], item["status"])
        for index, item in enumerate(status["scope_terms"], 1)
    ]
    replace_rows(connection, "commercial", "INSERT INTO commercial VALUES (?,?,?,?)", commercial)

    deliverables = [
        (1, status["deliverable_hashes"]["dwg"]["name"], "review-ready", "A101 existing main level", "DWG", "BDPC review"),
        (2, status["deliverable_hashes"]["pdf"]["name"], "review-ready", "A101 existing main level", "PDF", "BDPC review"),
    ]
    replace_rows(connection, "deliverables", "INSERT INTO deliverables VALUES (?,?,?,?,?,?)", deliverables)

    standards = [
        (index, item["item"], item["status"], item["rule"], item["basis"])
        for index, item in enumerate(status["standards"], 1)
    ]
    replace_rows(connection, "standards", "INSERT INTO standards VALUES (?,?,?,?,?)", standards)

    automation = [
        (index, item["capability"], item["status"], item["use"], item["human_control"], "Retained")
        for index, item in enumerate(status["automation"], 1)
    ]
    replace_rows(connection, "automation", "INSERT INTO automation VALUES (?,?,?,?,?,?)", automation)

    qa_rows = [
        (index, item["check"], item["status"], item["evidence"])
        for index, item in enumerate(status["qa"], 1)
    ]
    replace_rows(connection, "qa_checks", "INSERT INTO qa_checks VALUES (?,?,?,?)", qa_rows)

    updates = [
        (index, item["date"], item["title"], item["status"], item["effect"])
        for index, item in enumerate(status["decisions_log"], 1)
    ]
    replace_rows(connection, "updates", "INSERT INTO updates VALUES (?,?,?,?,?)", updates)

    runtime = [
        (index, item["component"], "2026" if "2026" in item["component"] else "current", item["status"], item["availability"], item["purpose"])
        for index, item in enumerate(status["dependencies"], 1)
    ]
    replace_rows(connection, "runtime", "INSERT INTO runtime VALUES (?,?,?,?,?,?)", runtime)

    prep = [
        (index, "Current completion pass", item["item"], item["status"], item["evidence"], item["next_action"], "CAD Guardian")
        for index, item in enumerate(status["cad_preparation"], 1)
    ]
    replace_rows(connection, "cad_preparation", "INSERT INTO cad_preparation VALUES (?,?,?,?,?,?,?)", prep)

    effort = [
        ("EFT-COMPLETE", "Completed project work", "A101", "Authority, evidence, model, and client direction", 5.5, "CAD Guardian", "Complete", "Review-ready base", "68 percent readiness before final pass"),
        ("EFT-PASS", "Review-ready completion pass", "A101", "Cleanup, native audit, plot, visual QA, package", 2.0, "CAD Guardian", "Approved", "Review-ready DWG/PDF", "92 percent readiness"),
        ("EFT-RESERVE", "Minor correction reserve", "A101", "Seven bounded presentation and defect corrections", 0.5, "CAD Guardian", "Consumed", "Corrected review-ready DWG/PDF", "8.0-hour contracted effort limit reached"),
    ]
    replace_rows(connection, "sow_effort_plan", "INSERT INTO sow_effort_plan VALUES (?,?,?,?,?,?,?,?,?)", effort)

integrity = connection.execute("PRAGMA integrity_check").fetchone()[0]
if integrity != "ok":
    raise RuntimeError(f"SQLite integrity check failed: {integrity}")
connection.close()

database_bytes = DATABASE.read_bytes()
database_hash = sha256_bytes(database_bytes)
encoded = base64.b64encode(database_bytes).decode("ascii")
transport_hash = sha256_bytes(encoded.encode("ascii"))
parts = [encoded[index:index + PART_SIZE] for index in range(0, len(encoded), PART_SIZE)]
PARTS.mkdir(parents=True, exist_ok=True)
for old in PARTS.glob("part-*.b64"):
    old.unlink()
transport_paths = []
for index, content in enumerate(parts, 1):
    path = PARTS / f"part-{index:02d}.b64"
    path.write_text(content, encoding="ascii")
    transport_paths.append(f"data/sqlite/{path.name}")

connection = sqlite3.connect(DATABASE)
tables = [row[0] for row in connection.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
)]
counts = {table: connection.execute(f'SELECT COUNT(*) FROM "{table}"').fetchone()[0] for table in tables}
connection.close()

status["sqlite"] = {
    "data_key": "sqlite",
    "database_url": "/bdpc/data/bdpc_client_os.sqlite",
    "database_sha256": database_hash,
    "transport_sha256": transport_hash,
    "download_name": "bdpc_client_os.sqlite",
}
STATUS_PATH.write_text(json.dumps(status, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")
(ROOT / "status-data.js").write_text(
    "window.BDPC_STATUS=" + json.dumps(status, separators=(",", ":"), ensure_ascii=True) + ";\n",
    encoding="utf-8",
)

manifest = {
    "schema_version": status["schema_version"],
    "revision": status["revision"],
    "generated_at": status["updated_at"],
    "database": "data/bdpc_client_os.sqlite",
    "database_download_name": "bdpc_client_os.sqlite",
    "database_sha256": database_hash,
    "database_bytes": len(database_bytes),
    "database_transport": transport_paths,
    "database_transport_sha256": transport_hash,
    "table_counts": counts,
    "status_source": "data/current-status.json",
    "privacy": "Client-safe aggregate and derived project controls only; confidential sources are excluded.",
}
manifest_text = json.dumps(manifest, indent=2, ensure_ascii=True) + "\n"
(DATA / "manifest.json").write_text(manifest_text, encoding="utf-8")
(DATA / "release.json").write_text(
    json.dumps({
        "revision": status["revision"],
        "updated_at": status["updated_at"],
        "status": project["current_state"],
        "delivery_readiness_percent": 92,
    }, indent=2) + "\n",
    encoding="utf-8",
)

print(json.dumps({
    "revision": status["revision"],
    "database_sha256": database_hash,
    "transport_parts": len(parts),
    "table_counts": counts,
    "integrity": integrity,
}, indent=2))
