#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUTH_PATH = ROOT / "data" / "current-authorization.json"
ACTIVE_FILES = [
    ROOT / "index.html",
    ROOT / "authorization.js",
    ROOT / "sow" / "index.html",
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
    auth = json.loads(AUTH_PATH.read_text(encoding="utf-8"))

    require(auth["authorization"]["status"] == "authorized", "written authorization must be recorded as authorized")
    require(auth["scope"]["sheet_count"] == 1, "active scope must contain exactly one sheet")
    require(auth["scope"]["deliverable"] == "Existing Main Level As-Built Floor Plan", "unexpected active deliverable")
    require(auth["commercial"]["fixed_fee_usd"] == 600, "active fixed fee must be $600")
    require(float(auth["commercial"]["effort_ceiling_hours"]) == 8.0, "active effort ceiling must be 8.0 hours")
    require(auth["commercial"]["payment_status"] in {"awaiting payment", "paid"}, "unexpected payment status")
    require(auth["schedule"]["delivery_due"] == "2026-07-22T16:00:00-04:00", "unexpected delivery deadline")
    require(auth["commercial"]["payment_link"].startswith("https://buy.stripe.com/"), "payment link must be a Stripe payment link")
    require(sum(float(item["hours"]) for item in auth["work_plan"]) == 8.0, "work-plan hours must total 8.0")

    for path in ACTIVE_FILES:
        require(path.exists(), f"active file missing: {path.relative_to(ROOT)}")

    index = (ROOT / "index.html").read_text(encoding="utf-8")
    script = (ROOT / "authorization.js").read_text(encoding="utf-8")
    sow = (ROOT / "sow" / "index.html").read_text(encoding="utf-8")
    reports = (ROOT / "reports" / "index.html").read_text(encoding="utf-8")
    payment_link = auth["commercial"]["payment_link"]
    deliverable = auth["scope"]["deliverable"]

    require("os.js" not in index, "active index must not load the legacy three-sheet renderer")
    require("sqlite.js" not in index, "active index must not load the legacy evidence renderer")
    require("authorization.js" in index, "active index must load the current authorization renderer")
    require(deliverable in sow and deliverable in reports, "current deliverable must appear on SOW and report index")
    require("commercial.payment_link" in script and payment_link in sow and payment_link in reports, "secure payment CTA must be available across active pages")
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
