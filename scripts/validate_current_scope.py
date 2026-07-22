#!/usr/bin/env python3
from __future__ import annotations

import base64
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUTH_PATH = ROOT / "data" / "current-authorization.json"
DOCTRINE_PATH = ROOT / "data" / "operating-doctrine.json"
CONTROLS_PATH = ROOT / "data" / "production-controls.json"
CURRENT_MANIFEST_PATH = ROOT / "sow" / "current" / "manifest.json"
CURRENT_VIEWER_PATH = ROOT / "sow" / "current" / "index.html"
REPORT_INDEX_PATH = ROOT / "reports" / "index.html"
REPORT_ROUTES = [
    ROOT / "reports" / "intake" / "index.html",
    ROOT / "reports" / "scan-visual" / "index.html",
    ROOT / "reports" / "las-header" / "index.html",
    ROOT / "reports" / "las-core" / "index.html",
    ROOT / "reports" / "registration" / "index.html",
    ROOT / "reports" / "completion" / "index.html",
    ROOT / "reports" / "context-visual" / "index.html",
    ROOT / "reports" / "cad-prep" / "index.html",
]
ACTIVE_FILES = [
    ROOT / "index.html",
    ROOT / "authorization.js",
    ROOT / "scope-focus.js",
    AUTH_PATH,
    DOCTRINE_PATH,
    CONTROLS_PATH,
    ROOT / "sow" / "index.html",
    CURRENT_VIEWER_PATH,
    CURRENT_MANIFEST_PATH,
    REPORT_INDEX_PATH,
    *REPORT_ROUTES,
]
EXPECTED_PANELS = [
    "overview", "milestones", "files", "standards", "automation",
    "cad-prep", "delivery", "commercial", "updates", "runtime",
]
REQUIRED_STANDARD_RULES = {
    "Residential dimension precision": "1/2 inch",
    "Typical framed-wall basis": "3.5 inches",
    "Door and window vocabulary": "Reuse established",
    "Model-space standard source": "TCADD",
    "Paper-space presentation source": "current BDPC drawing",
    "Measured-evidence rule": "not automatic truth",
    "Unknown conditions": "Do not invent",
    "Conflict escalation": "return them for BDPC direction",
}


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(f"VALIDATION FAILED: {message}")


def main() -> None:
    for path in ACTIVE_FILES:
        require(path.exists(), f"active file missing: {path.relative_to(ROOT)}")

    auth = json.loads(AUTH_PATH.read_text(encoding="utf-8"))
    doctrine = json.loads(DOCTRINE_PATH.read_text(encoding="utf-8"))
    controls = json.loads(CONTROLS_PATH.read_text(encoding="utf-8"))
    manifest = json.loads(CURRENT_MANIFEST_PATH.read_text(encoding="utf-8"))

    require(auth["authorization"]["status"] == "authorized", "written authorization must be recorded as authorized")
    require(auth["scope"]["sheet_count"] == 1, "active scope must contain exactly one sheet")
    require(auth["scope"]["deliverable"] == "Existing Main Level As-Built Floor Plan", "unexpected active deliverable")
    require(auth["scope"]["condition"] == "existing conditions only", "active scope must remain existing conditions only")
    require(auth["commercial"]["fixed_fee_usd"] == 600, "active fixed fee must be $600")
    require(float(auth["commercial"]["effort_ceiling_hours"]) == 8.0, "active effort ceiling must be 8.0 hours")
    require(auth["commercial"]["payment_status"] in {"awaiting payment", "paid"}, "unexpected payment status")
    require(auth["schedule"]["delivery_due"] == "2026-07-22T16:00:00-04:00", "unexpected delivery deadline")
    require(auth["commercial"]["payment_link"].startswith("https://buy.stripe.com/"), "payment link must be a Stripe payment link")
    require(sum(float(item["hours"]) for item in auth["work_plan"]) == 8.0, "work-plan hours must total 8.0")

    require(controls["zero_friction_activation"]["client_action"].startswith("Pay the authorized $600"), "zero-friction client action must remain payment")
    require("Payment is the only remaining commercial acceptance action" in controls["zero_friction_activation"]["acceptance_message"], "acceptance path must not request redundant confirmation")
    require(len(doctrine["source_hierarchy"]) >= 6, "source hierarchy was oversimplified")
    require(len(doctrine["standards_register"]) >= 18, "standards register was oversimplified")
    require(len(doctrine["enterprise_controls"]) >= 12, "enterprise control framework was oversimplified")
    require(len(doctrine["decision_log"]) >= 6, "decision history was oversimplified")
    require(len(controls["milestone_register"]) >= 15, "milestone ledger was oversimplified")
    require(len(controls["cad_prep_register"]) >= 14, "CAD preparation register was oversimplified")
    require(len(controls["automation_register"]) >= 14, "automation register was oversimplified")
    require(len(controls["qa_register"]) >= 20, "QA register was oversimplified")
    require(len(controls["risk_register"]) >= 8, "risk register was oversimplified")

    standards = {item["standard"]: item["rule"] for item in doctrine["standards_register"]}
    for standard, required_text in REQUIRED_STANDARD_RULES.items():
        require(standard in standards, f"preserved standard missing: {standard}")
        require(required_text in standards[standard], f"preserved standard changed or weakened: {standard}")

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

    index = (ROOT / "index.html").read_text(encoding="utf-8")
    script = (ROOT / "authorization.js").read_text(encoding="utf-8")
    focus_script = (ROOT / "scope-focus.js").read_text(encoding="utf-8")
    sow = (ROOT / "sow" / "index.html").read_text(encoding="utf-8")
    viewer = CURRENT_VIEWER_PATH.read_text(encoding="utf-8")
    archive = (ROOT / "sow" / "archive" / "index.html").read_text(encoding="utf-8")
    report_index = REPORT_INDEX_PATH.read_text(encoding="utf-8")
    payment_link = auth["commercial"]["payment_link"]
    deliverable = auth["scope"]["deliverable"]

    require("os.js" not in index, "active index must not load the legacy three-sheet renderer")
    require("sqlite.js" not in index, "active index must not load the legacy evidence renderer")
    require("authorization.js" in index, "active index must load the current authorization renderer")
    require("scope-focus.js" in index, "active index must load the focused-scope controller")
    require(index.index("authorization.js") < index.index("scope-focus.js"), "focused-scope controller must load after the renderer")
    require('href="/bdpc/reports/"' not in index, "active header must not advertise retired reports")
    require("REPORT_PREFIX" in focus_script and "MutationObserver" in focus_script, "focused-scope controller must neutralize dynamically rendered report links")
    require("Expanded-scope reporting" in focus_script and "Expanded scope" in focus_script, "expanded reporting teaser must remain visible without active report links")
    require("operating-doctrine.json" in script and "production-controls.json" in script, "enterprise data sources must drive the renderer")
    require(deliverable in sow and deliverable in report_index, "current deliverable must appear on SOW and report retirement notice")
    require("commercial.payment_link" in script and payment_link in sow, "secure payment CTA must remain available on active production pages")
    require(f'href="{payment_link}"' in index, "root payment CTA must work before JavaScript loads")
    require("/bdpc/sow/current/" in index and "/bdpc/sow/current/" in archive, "issued V3 document must be directly linked from current navigation and archive")
    require("crypto.subtle.digest('SHA-256'" in viewer, "issued V3 viewer must verify SHA-256 before release")
    require(payment_link in viewer, "issued V3 viewer must expose the secure payment CTA")
    require("$600" in index and "$600" in sow, "active fee must be visible across active production pages")
    require("8.0" in sow, "effort ceiling must be visible on the current SOW")

    require('data-report-retired="true"' in report_index, "report index must be explicitly retired")
    require("Reports paused for the current scope" in report_index, "report index must explain the focused-scope pause")
    require('href="/bdpc/"' in report_index and "Return to Project Home" in report_index, "report disclaimer must provide a home redirect button")
    require("Expanded scope teaser" in report_index and "Optimized reporting" in report_index, "report disclaimer must include the expanded-scope reporting teaser")
    require(payment_link not in report_index, "retired report page must not distract with a payment CTA")

    for report_path in REPORT_ROUTES:
        retired = report_path.read_text(encoding="utf-8")
        require('data-report-retired="true"' in retired, f"emailed report route is not retired: {report_path.relative_to(ROOT)}")
        require('url=/bdpc/reports/' in retired, f"emailed report route does not redirect to the disclaimer: {report_path.relative_to(ROOT)}")

    for token in [
        "standards_register", "source_hierarchy", "enterprise_controls",
        "automation_register", "cad_prep_register", "qa_register",
        "risk_register", "decision_log", "zero_friction_activation",
        "Cutting-edge, not bleeding-edge", "1/2 inch", "3.5 inches",
    ]:
        require(token in script or token in DOCTRINE_PATH.read_text(encoding="utf-8") or token in CONTROLS_PATH.read_text(encoding="utf-8"), f"enterprise preservation token missing: {token}")

    for panel in EXPECTED_PANELS:
        require(f"{panel}:" in script or f"'{panel}':" in script or f'"{panel}":' in script, f"missing renderer for panel: {panel}")
        require(f'data-tab="{panel}"' in index, f"missing tab declaration: {panel}")

    archive_url = auth["supersedes"]["archive_url"].replace("/bdpc/", "")
    archive_data_url = auth["supersedes"]["archive_data_url"].replace("/bdpc/", "")
    require((ROOT / archive_url).exists(), "human-readable superseded SOW archive is missing")
    require((ROOT / archive_data_url).exists(), "machine-readable superseded data archive is missing")
    require((ROOT / "data" / "archive" / "index.json").exists(), "archive catalog is missing")

    print("Current-scope enterprise validation passed with report-retirement controls.")


if __name__ == "__main__":
    main()
