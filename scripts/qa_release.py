#!/usr/bin/env python3
"""Run deterministic local QA for the client-safe static release."""
from __future__ import annotations

import argparse
import base64
import csv
import hashlib
import json
import re
import sqlite3
import tempfile
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

from PIL import Image


EXPECTED_ROUTES = [
    "index.html",
    "reports/index.html",
    "reports/intake/index.html",
    "reports/scan-visual/index.html",
    "reports/las-header/index.html",
    "reports/las-core/index.html",
    "reports/registration/index.html",
    "reports/completion/index.html",
    "sow/index.html",
    "estimate/index.html",
]


def sha256_path(path: Path) -> str:
    """Return a file SHA-256 digest."""
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


class PageParser(HTMLParser):
    """Collect local references, IDs, and image alternative text."""

    def __init__(self) -> None:
        super().__init__()
        self.references: list[str] = []
        self.ids: list[str] = []
        self.images_without_alt: list[str] = []
        self.tag_counts: dict[str, int] = {}
        self.text_parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.tag_counts[tag] = self.tag_counts.get(tag, 0) + 1
        values = dict(attrs)
        if values.get("id"):
            self.ids.append(values["id"] or "")
        for key in ("href", "src"):
            if values.get(key):
                self.references.append(values[key] or "")
        if tag == "img" and not (values.get("alt") or "").strip():
            self.images_without_alt.append(values.get("src") or "<missing src>")

    def handle_data(self, data: str) -> None:
        """Collect visible text for preservation assertions."""
        if data.strip():
            self.text_parts.append(data.strip())


def resolve_reference(root: Path, page: Path, reference: str) -> Path | None:
    """Resolve a local site reference to a repository path."""
    split = urlsplit(reference)
    if split.scheme in {"http", "https", "mailto", "tel", "data", "javascript"} or reference.startswith("#"):
        return None
    clean = unquote(split.path)
    if clean.startswith("/bdpc/"):
        candidate = root / clean.removeprefix("/bdpc/")
    elif clean == "/bdpc" or clean == "/bdpc/":
        candidate = root
    elif clean.startswith("/"):
        raise ValueError(f"Unexpected site-root path: {reference}")
    else:
        candidate = page.parent / clean
    if clean.endswith("/") or candidate.is_dir():
        candidate /= "index.html"
    return candidate.resolve()


def verify_data(root: Path) -> dict[str, int]:
    """Verify canonical JSON, CSV, SQLite, and manifest consistency."""
    project = json.loads((root / "data/project.json").read_text(encoding="utf-8"))
    manifest = json.loads((root / "data/manifest.json").read_text(encoding="utf-8"))
    expected_metrics = {
        "source_files": 908,
        "source_bytes": 8_801_309_883,
        "scan_sessions": 5,
        "source_points": 91_688_946,
        "validated_sessions": 5,
        "full_source_figures": 25,
        "plan_control_slices": 9,
        "native_overlays": 5,
        "weak_native_overlap": 4,
        "no_material_overlap": 1,
        "production_drawings_complete": 0,
    }
    for key, value in expected_metrics.items():
        if project["metrics"].get(key) != value:
            raise ValueError(f"Metric mismatch for {key}")
    if len(project["kickoff_gates"]) != 4:
        raise ValueError("Expected four kickoff gates")
    if len(project["native_pairs"]) != 5:
        raise ValueError("Expected five native pairs")
    report_names = {item["id"]: item["name"] for item in project["reports"]}
    if report_names.get("RPT-02") != "Visual inspection":
        raise ValueError("RPT-02 must preserve the image-driven Visual inspection route")
    if report_names.get("RPT-04") != "Plan-control slice evidence":
        raise ValueError("RPT-04 must preserve the nine-slice evidence route")
    classifications = [item["classification"] for item in project["native_pairs"]]
    if classifications.count("native_overlap_weak") != 4 or classifications.count("no_material_overlap") != 1:
        raise ValueError("Native overlap classification mismatch")
    if "No transform was applied" not in project["overlap_statement"] or "no pair was declared registered" not in project["overlap_statement"]:
        raise ValueError("Required overlap boundary missing")

    csv_counts: dict[str, int] = {}
    expected_rows = {
        "validated-scan-summary.csv": 5,
        "native-overlap-summary.csv": 5,
        "slice-summary.csv": 9,
        "milestone-evidence.csv": 12,
    }
    for filename, expected in expected_rows.items():
        path = root / "reports/data" / filename
        with path.open(newline="", encoding="utf-8") as handle:
            rows = list(csv.DictReader(handle))
        if len(rows) != expected:
            raise ValueError(f"Unexpected row count for {filename}: {len(rows)}")
        csv_counts[filename] = len(rows)

    for relative, record in manifest["files"].items():
        path = root / relative
        if not path.is_file() or path.stat().st_size != record["bytes"] or sha256_path(path) != record["sha256"]:
            raise ValueError(f"Manifest file mismatch: {relative}")

    parts = [(root / relative).read_text(encoding="ascii") for relative in manifest["database_transport"]]
    transport = "".join(parts)
    if hashlib.sha256(transport.encode("ascii")).hexdigest() != manifest["database_transport_sha256"]:
        raise ValueError("Multipart transport hash mismatch")
    decoded = base64.b64decode(transport, validate=True)
    database_path = root / manifest["database"]
    if decoded != database_path.read_bytes():
        raise ValueError("Multipart reconstruction is not byte-for-byte identical")
    if hashlib.sha256(decoded).hexdigest() != manifest["database_sha256"]:
        raise ValueError("Database hash mismatch")
    with tempfile.TemporaryDirectory(prefix="bdpc-sqlite-qa-") as folder:
        reconstructed = Path(folder) / manifest["database_download_name"]
        reconstructed.write_bytes(decoded)
        with sqlite3.connect(f"file:{reconstructed}?mode=ro", uri=True) as connection:
            if connection.execute("PRAGMA integrity_check").fetchone()[0] != "ok":
                raise ValueError("SQLite integrity_check failed")
            actual_counts = {
                table: connection.execute(f'SELECT COUNT(*) FROM "{table}"').fetchone()[0]
                for table in manifest["table_counts"]
            }
    if actual_counts != manifest["table_counts"]:
        raise ValueError("SQLite table counts do not match the manifest")
    return csv_counts


def verify_html(root: Path) -> tuple[int, int, int]:
    """Verify routes, local references, duplicate IDs, and image alternatives."""
    for route in EXPECTED_ROUTES:
        if not (root / route).is_file():
            raise ValueError(f"Missing expected route: {route}")
    pages = sorted(root.rglob("*.html"))
    references = 0
    for page in pages:
        parser = PageParser()
        parser.feed(page.read_text(encoding="utf-8"))
        duplicates = sorted({identifier for identifier in parser.ids if parser.ids.count(identifier) > 1})
        if duplicates:
            raise ValueError(f"Duplicate IDs in {page.relative_to(root)}: {duplicates}")
        if parser.images_without_alt:
            raise ValueError(f"Missing image alt text in {page.relative_to(root)}: {parser.images_without_alt}")
        for reference in parser.references:
            candidate = resolve_reference(root, page, reference)
            if candidate is None:
                continue
            references += 1
            try:
                candidate.relative_to(root)
            except ValueError as exc:
                raise ValueError(f"Reference escapes repository: {page.relative_to(root)} -> {reference}") from exc
            if not candidate.exists():
                raise ValueError(f"Missing local reference: {page.relative_to(root)} -> {reference}")
            relative = candidate.relative_to(root)
            cursor = root
            for part in relative.parts:
                names = {entry.name for entry in cursor.iterdir()}
                if part not in names:
                    raise ValueError(f"Path-case mismatch: {relative}")
                cursor /= part
    return len(pages), references, sum(1 for _ in root.rglob("*.html"))


def verify_images(root: Path) -> int:
    """Decode every public raster image."""
    images = [path for path in root.rglob("*") if path.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"}]
    for path in images:
        with Image.open(path) as image:
            image.verify()
    return len(images)


def verify_preservation(root: Path) -> dict[str, int]:
    """Block regressions in report depth, visible evidence, and SOW print controls."""
    expectations = {
        "reports/index.html": {"img": 3, "h2": 4},
        "reports/intake/index.html": {"table": 1, "h2": 6},
        "reports/scan-visual/index.html": {"img": 25, "h2": 6},
        "reports/las-header/index.html": {"table": 1, "h2": 3},
        "reports/las-core/index.html": {"img": 9, "table": 1, "h2": 5},
        "reports/registration/index.html": {"img": 5, "table": 1, "h2": 3},
        "sow/index.html": {"table": 1, "h2": 9},
    }
    counts: dict[str, int] = {}
    for relative, required in expectations.items():
        parser = PageParser()
        parser.feed((root / relative).read_text(encoding="utf-8"))
        for tag, minimum in required.items():
            actual = parser.tag_counts.get(tag, 0)
            if actual < minimum:
                raise ValueError(f"Preservation regression: {relative} requires at least {minimum} <{tag}> elements; found {actual}")
            counts[f"{relative}:{tag}"] = actual

    visual = (root / "reports/scan-visual/index.html").read_text(encoding="utf-8")
    for session in "abcde":
        if visual.count(f"session-{session}-") < 8:
            raise ValueError(f"Visual report is missing the Session {session.upper()} evidence gallery")

    reports_text = "\n".join(
        (root / relative).read_text(encoding="utf-8")
        for relative in expectations
        if relative.startswith("reports/")
    )
    for phrase in (
        "Documented operating rules",
        "Authority hierarchy",
        "Documented source-protection rules",
        "Validation method",
        "Documented interpretation rules",
        "Method and decision rules",
    ):
        if phrase not in reports_text:
            raise ValueError(f"Preservation regression: missing documented rule section: {phrase}")

    sow = (root / "sow/index.html").read_text(encoding="utf-8")
    for phrase in (
        "Print / Save PDF",
        "Included scope",
        "Excluded scope",
        "Client responsibilities and kickoff gates",
        "Acceptance criteria",
        "Change control",
        "@page { size:letter",
        "width:min(8.5in",
        "window.print()",
    ):
        if phrase not in sow:
            raise ValueError(f"SOW preservation/print regression: missing {phrase!r}")
    return counts


def verify_text_boundaries(root: Path) -> None:
    """Reject known stale claims and raw GitHub history dependencies."""
    forbidden = {
        "strong_overlap_claim": re.compile(r"(?i)strong(?:ly)?\s+(?:shared-coordinate|native-overlap|coordinated overlapping)"),
        "registration_pass_claim": re.compile(r"(?i)registration\s+(?:passed|certified)"),
        "activity_percentage": re.compile(r"(?i)(preflight_percent|production_percent|overall milestone completion)"),
        "raw_github_dependency": re.compile(r"https://(?:raw\.)?githubusercontent\.com|github\.com/.+/(?:blob|raw)/"),
        "absolute_local_path": re.compile(r"/Users/"),
    }
    text_suffixes = {".html", ".css", ".js", ".json", ".csv", ".sql", ".md", ".txt"}
    for path in root.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in text_suffixes:
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        for label, pattern in forbidden.items():
            if pattern.search(text):
                raise ValueError(f"{label} in {path.relative_to(root)}")


def report_unreferenced_assets(root: Path) -> list[str]:
    """Return public asset files that are not named by any public text file."""
    text = "\n".join(
        path.read_text(encoding="utf-8", errors="replace")
        for path in root.rglob("*")
        if path.is_file() and path.suffix.lower() in {".html", ".css", ".js", ".json", ".csv", ".sql", ".md", ".txt", ".py"}
    )
    assets = [path for path in root.rglob("*") if path.is_file() and path.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"}]
    return [str(path.relative_to(root)) for path in assets if str(path.relative_to(root)) not in text and path.name not in text]


def main() -> int:
    """Run all local release checks and print a compact result."""
    parser = argparse.ArgumentParser()
    parser.add_argument("root", nargs="?", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    root = args.root.expanduser().resolve()
    if not (root / ".git").exists():
        raise SystemExit(f"Not a Git worktree: {root}")
    csv_counts = verify_data(root)
    page_count, reference_count, _ = verify_html(root)
    image_count = verify_images(root)
    preservation_counts = verify_preservation(root)
    verify_text_boundaries(root)
    unreferenced = report_unreferenced_assets(root)
    if unreferenced:
        raise ValueError(f"Unreferenced public images: {unreferenced}")
    print(json.dumps({
        "status": "PASS",
        "html_pages": page_count,
        "local_references": reference_count,
        "images_decoded": image_count,
        "csv_rows": csv_counts,
        "sqlite_integrity": "ok",
        "preservation_counts": preservation_counts,
        "unreferenced_public_images": 0,
    }, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
