#!/usr/bin/env python3
from __future__ import annotations

import base64
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUTH_PATH = ROOT / "data" / "current-authorization.json"
CURRENT_MANIFEST_PATH = ROOT / "sow" / "current" / "manifest.json"
CURRENT_VIEWER_PATH = ROOT / "sow" / "current" / "index.html"
ACTIVE_FILES = [
    ROOT / "index.html",
    ROOT / "authorization.js",
    ROOT / "sow" / "index.html",
    ROOT / "sow" / "current" / "index.html",
    ROOT / "sow" / "current" / "manifest.json",
    ROOT / "reports" / "index.html",
]
EXPECTED_PANELS = [
    "overview",
    "milestones",
    "files",
    "standards",
    "automation",
    "cad-prep",
    "delivery",
    "commercial",
    "updates",
    "runtime",
]


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(f"VALIDATION FAILED: {message}")


def main() -> None:
    require(AUTH_PATH.exists(), "current authorization JSON is missing")
    require(CURRENT_MANIFEST_PATH.exists(), "governing SOW manifest is missing")
    require(CURRENT_VIEWER_PATH.exists(), "governing SOW viewer is missing")
    auth = json.loads(AUTH_PATH.read_text(encoding="utf-8"))
    manifest = json.loads(CURRENT_MANIFEST_PATH.read_text(encoding="utf-8"))

    require(auth["authorization"]["status"] == "authorized", "written authorization must be recorded as authorized")
    require(auth["scope"]["sheet_count"] == 1, "active scope must contain exactly one sheet")
    require(auth["scope"]["deliverable"] == "Existing Main Level As-Built Floor Plan", "unexpected active deliverable")
    require(auth["commercial"]["fixed_fee_usd"] == 600, "active fixed fee must be $600")
    require(float(auth["commercial"]["effort_ceiling_hours"]) == 8.0, "active effort ceiling must be 8.0 hours")
    require(auth["commercial"]["payment_status"] in {"awaiting payment", "paid"}, "unexpected payment status")
    require(auth["schedule"]["delivery_due"] == "2026-07-22T16:00:00-04:00", "unexpected delivery deadline")
    require(auth["commercial"]["payment_link"].startswith("https://buy.stripe.com/"), "payment link must be a Stripe payment link")
    require(sum(float(item["hours"]) for item in auth["work_plan"]) == 8.0, "work-plan hours must total 8.0")

    require(manifest["project"] == auth["project"], "governing SOW project does not match current authorization")
    require(manifest["authorization"]["status"] == "authorized", "governing SOW manifest must record authorization")
    require(manifest["authorization"]["fixed_fee_usd"] == auth["commercial"]["fixed_fee_usd"], "governing SOW fee does not match current authorization")
    require(auth["scope"]["deliverable"] in manifest["authorization"]["scope"], "governing SOW scope does not match active deliverable")
    require(manifest["document"]["revision"] == "2026.07.21.4", "unexpected governing SOW revision")
    require(manifest["document"]["pages"] == 5, "unexpected governing SOW page count")
    require(manifest["document"]["size_bytes"] == 22974, "unexpected governing SOW byte count")
    require(manifest["document"]["sha256"] == "8a1195f91f909e7528d94ff9a1695cea977aa85acf60b609ee3e219367229602", "unexpected governing SOW checksum")

    encoded_parts = []
    for relative_path in manifest["document"]["parts"]:
        part_path = CURRENT_MANIFEST_PATH.parent / relative_path
        require(part_path.exists(), f"governing SOW segment is missing: {relative_path}")
        encoded_parts.append(part_path.read_text(encoding="ascii").strip())
    try:
        pdf_bytes = base64.b64decode("".join(encoded_parts), validate=True)
    except Exception as error:
        raise SystemExit(f"VALIDATION FAILED: governing SOW Base64 is invalid: {error}") from error
    require(len(pdf_bytes) == manifest["document"]["size_bytes"], "governing SOW reconstructed byte count does not match manifest")
    require(hashlib.sha256(pdf_bytes).hexdigest() == manifest["document"]["sha256"], "governing SOW reconstructed checksum does not match manifest")
    require(pdf_bytes.startswith(b"%PDF-"), "governing document does not reconstruct as a PDF")

    for path in ACTIVE_FILES:
        require(path.exists(), f"active file missing: {path.relative_to(ROOT)}")

    index = (ROOT / "index.html").read_text(encoding="utf-8")
    script = (ROOT / "authorization.js").read_text(encoding="utf-8")
    sow = (ROOT / "sow" / "index.html").read_text(encoding="utf-8")
    viewer = CURRENT_VIEWER_PATH.read_text(encoding="utf-8")
    archive = (ROOT / "sow" / "archive" / "index.html").read_text(encoding="utf-8")
    reports = (ROOT / "reports" / "index.html").read_text(encoding="utf-8")
    payment_link = auth["commercial"]["payment_link"]
    deliverable = auth["scope"]["deliverable"]

    require("os.js" not in index, "active index must not load the legacy three-sheet renderer")
    require("sqlite.js" not in index, "active index must not load the legacy evidence renderer")
    require("authorization.js" in index, "active index must load the current authorization renderer")
    require(deliverable in sow and deliverable in reports, "current deliverable must appear on SOW and report index")
    require("commercial.payment_link" in script and payment_link in sow and payment_link in reports, "secure payment CTA must be available across active pages")
    require(f'href="{payment_link}"' in index, "root payment CTA must work before JavaScript loads")
    require("/bdpc/sow/current/" in index and "/bdpc/sow/current/" in archive, "issued V3 document must be directly linked from current navigation and archive")
    require("crypto.subtle.digest('SHA-256'" in viewer, "issued V3 viewer must verify SHA-256 before release")
    require(payment_link in viewer, "issued V3 viewer must expose the secure payment CTA")
    require("$600" in index and "$600" in sow and "$600" in reports, "active fee must be visible across active pages")
    require("8.0" in sow and "8.0" in reports, "effort ceiling must be visible on current SOW and report index")

    for panel in EXPECTED_PANELS:
        require(f"{panel}:" in script or f"'{panel}':" in script or f'"{panel}":' in script, f"missing renderer for panel: {panel}")
        require(f'data-tab="{panel}"' in index, f"missing tab declaration: {panel}")

    archive_url = auth["supersedes"]["archive_url"].replace("/bdpc/", "")
    archive_data_url = auth["supersedes"]["archive_data_url"].replace("/bdpc/", "")
    require((ROOT / archive_url).exists(), "human-readable superseded SOW archive is missing")
    require((ROOT / archive_data_url).exists(), "machine-readable superseded data archive is missing")
    require((ROOT / "data" / "archive" / "index.json").exists(), "archive catalog is missing")

    print("Current-scope validation passed.")


if __name__ == "__main__":
    main()
