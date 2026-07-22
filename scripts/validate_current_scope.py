#!/usr/bin/env python3
from __future__ import annotations

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
    require(auth["authorization"]["signature_status"] == "not executed", "signature status must be explicit")
    require(auth["scope"]["sheet_count"] == 1, "active scope must contain exactly one sheet")
    require(auth["scope"]["deliverable"] == "Existing Main Level As-Built Floor Plan", "unexpected active deliverable")
    require(auth["scope"]["condition"] == "existing conditions only", "active scope must remain existing conditions only")
    require(auth["commercial"]["fixed_fee_usd"] == 600, "active fixed fee must be $600")
    require(float(auth["commercial"]["effort_ceiling_hours"]) == 8.0, "active effort ceiling must be 8.0 hours")
    require(auth["commercial"]["payment_status"] in {"awaiting payment", "paid", "due after delivery"}, "unexpected payment status")
    require(auth["schedule"]["delivery_due"] == "2026-07-22T16:00:00-04:00", "unexpected delivery deadline")
    require(auth["commercial"]["payment_link"].startswith("https://buy.stripe.com/"), "payment link must be a Stripe payment link")
    require(sum(float(item["hours"]) for item in auth["work_plan"]) == 8.0, "work-plan hours must total 8.0")

    require("AutoCAD" in controls["zero_friction_activation"]["client_action"], "zero-friction client action must point to AutoCAD/runtime availability")
    require("remaining production gate is AutoCAD" in controls["zero_friction_activation"]["acceptance_message"], "acceptance path must reflect the current AutoCAD production gate")
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
    require(manifest["authorization"]["status"] == "authorized_by_email", "current SOW manifest must record email authorization")
    require(manifest["authorization"]["signature_status"] == "not executed", "current SOW manifest must record unsigned status")
    require(manifest["authorization"]["fixed_fee_usd"] == auth["commercial"]["fixed_fee_usd"], "governing SOW fee does not match current authorization")
    require(auth["scope"]["deliverable"] in manifest["authorization"]["scope"], "governing SOW scope does not match active deliverable")
    require(manifest["document"]["revision"] == "2026.07.22.1", "unexpected current SOW revision")
    require(manifest["document"]["version"] == "4", "current SOW must be Version 4")
    require(manifest["document"]["pages"] == 1, "current SOW must be a one-page working reference")
    require(manifest["document"]["canonical_url"] == "/bdpc/sow/", "current SOW canonical URL must be the HTML SOW")
    require("print/save" in manifest["document"]["export_method"].lower(), "current SOW export method must remain browser print/save")

    index = (ROOT / "index.html").read_text(encoding="utf-8")
    script = (ROOT / "authorization.js").read_text(encoding="utf-8")
    focus_script = (ROOT / "scope-focus.js").read_text(encoding="utf-8")
    sow = (ROOT / "sow" / "index.html").read_text(encoding="utf-8")
    viewer = CURRENT_VIEWER_PATH.read_text(encoding="utf-8")
    archive = (ROOT / "sow" / "archive" / "index.html").read_text(encoding="utf-8")
    report_index = REPORT_INDEX_PATH.read_text(encoding="utf-8")
    deliverable = auth["scope"]["deliverable"]

    require("os.js" not in index, "active index must not load the legacy three-sheet renderer")
    require("sqlite.js" not in index, "active index must not load the legacy evidence renderer")
    require("authorization.js" in index, "active index must load the current authorization renderer")
    require("scope-focus.js" in index, "active index must load the focused-scope controller")
    require(index.index("authorization.js") < index.index("scope-focus.js"), "focused-scope controller must load after the renderer")
    require('href="/bdpc/reports/"' not in index, "active header must not advertise retired reports")
    require("REPORT_PREFIX" in focus_script and "MutationObserver" in focus_script, "focused-scope controller must neutralize dynamically rendered report links")
    require("Expanded-scope reporting" not in focus_script and "Expanded scope" not in focus_script, "disabled expanded-reporting teaser must stay hidden")
    require("operating-doctrine.json" in script and "production-controls.json" in script, "enterprise data sources must drive the renderer")
    require(deliverable in sow and deliverable in report_index, "current deliverable must appear on SOW and report retirement notice")
    require("SOW V4" in index and "SOW V4" in sow, "current SOW V4 must be visible before JavaScript loads")
    require("Print / Save PDF" in sow and "window.print()" in sow, "current SOW must preserve browser print/save export")
    require("/bdpc/sow/current/" in index and "/bdpc/sow/current/" in archive, "current SOW compatibility route must remain linked")
    require("location.replace('/bdpc/sow/')" in viewer, "current compatibility route must forward to SOW V4")
    require("Preparing the verified PDF" not in viewer, "stale PDF-preparation fallback must not appear on current route")
    for stale_token in ["Pay $600", "Pay $600 securely", "Pay $600 and activate", "Issued V3 PDF"]:
        require(stale_token not in index and stale_token not in script and stale_token not in sow and stale_token not in viewer, f"stale current-facing token remains: {stale_token}")
    require("$600" in index and "$600" in sow, "active fee must be visible across active production pages")
    require("payment due after delivery" in sow.lower(), "payment timing must be visible on the current SOW")

    require('data-report-retired="true"' in report_index, "report index must be explicitly retired")
    require("Reports paused for the current scope" in report_index, "report index must explain the focused-scope pause")
    require('href="/bdpc/"' in report_index and "Return to Project Home" in report_index, "report disclaimer must provide a home redirect button")
    for hidden_text in ["Evidence access", "Expanded-scope reporting", "Expanded scope teaser", "Optimized reporting"]:
        require(hidden_text not in script and hidden_text not in focus_script and hidden_text not in report_index, f"disabled reporting teaser remains visible: {hidden_text}")
    require(auth["commercial"]["payment_link"] not in report_index, "retired report page must not distract with a payment CTA")

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
