from __future__ import annotations

import base64
import hashlib
import json
import sqlite3
import struct
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


status = json.loads((DATA / "current-status.json").read_text(encoding="utf-8"))
manifest = json.loads((DATA / "manifest.json").read_text(encoding="utf-8"))
index = (ROOT / "index.html").read_text(encoding="utf-8")
status_js = (ROOT / "status-data.js").read_text(encoding="utf-8")

assert status["revision"] == manifest["revision"]
assert status["project"]["overall_delivery_readiness_percent"] == 92
assert [(item["stage"], item["percent"]) for item in status["readiness_history"]] == [
    ("Before correction pass", 68),
    ("After correction pass", 92),
]
assert set(status["deliverable_hashes"]) == {"dwg", "pdf"}
assert all(len(item["sha256"]) == 64 for item in status["deliverable_hashes"].values())
payment = status["payment"]
assert payment["provider"] == "Zelle"
assert payment["mode"] == "external transfer"
assert payment["currency"] == "USD" and payment["amount_minor"] == 60000
assert payment["status"] == "received" and payment["received_date"] == "2026-07-24"
assert "checkout_url" not in payment and "button_label" not in payment
assert len(status["outstanding_questions"]) == 4
assert len(status["client_closeout"]) == 5
assert any("Monday, July 27" in item["record"] for item in status["client_closeout"])
assert {item["status"] for item in status["outstanding_questions"]} == {
    "Monday review pending", "awaiting BDPC response", "pending client review"
}
assert "buy.stripe.com" not in json.dumps(status)
assert "sk_" not in json.dumps(status) and "rk_" not in json.dumps(status)
assert 'href="os.css?v=20260724.3"' in index
assert 'src="status-data.js?v=20260724.7"' in index
assert 'src="sqlite.js?v=20260724.6"' in index
assert 'src="status-render.js?v=20260724.7"' in index
assert "authorization.js" not in index and "scope-focus.js" not in index
assert json.loads(status_js.removeprefix("window.BDPC_STATUS=").rstrip().removesuffix(";")) == status

assert len(status["visuals"]) == 7
for visual in status["visuals"]:
    asset = ROOT / visual["src"]
    assert asset.is_file(), asset
    assert asset.suffix.lower() == ".png", asset
    payload = asset.read_bytes()
    assert payload.startswith(b"\x89PNG\r\n\x1a\n"), asset
    assert payload[12:16] == b"IHDR", asset
    asset_hash = sha256(payload)
    if "sha256" in visual:
        assert visual["sha256"] == asset_hash, asset
    if visual["data_key"] in {"model", "sheet"}:
        assert len(visual.get("sha256", "")) == 64, asset
        assert visual["sha256"][:12] in asset.name, asset
    width, height = struct.unpack(">II", payload[16:24])
    assert width == visual["width"] and height == visual["height"]
assert "dunn-model-space.svg" not in (ROOT / "status-render.js").read_text(encoding="utf-8")

database = (DATA / "bdpc_client_os.sqlite").read_bytes()
assert sha256(database) == manifest["database_sha256"]
encoded = "".join((ROOT / part).read_text(encoding="ascii") for part in manifest["database_transport"])
encoded = "".join(encoded.split())
assert sha256(encoded.encode("ascii")) == manifest["database_transport_sha256"]
assert base64.b64decode(encoded) == database

connection = sqlite3.connect(DATA / "bdpc_client_os.sqlite")
assert connection.execute("PRAGMA integrity_check").fetchone()[0] == "ok"
tables = [row[0] for row in connection.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")]
counts = {table: connection.execute(f'SELECT COUNT(*) FROM "{table}"').fetchone()[0] for table in sorted(tables)}
assert counts == manifest["table_counts"]
metrics = dict(connection.execute("SELECT key, value_text FROM metrics"))
assert metrics["delivery_readiness_current"] == "92"
assert metrics["delivery_readiness_prepass"] == "68"
assert connection.execute("SELECT phase FROM project").fetchone()[0] == status["project"]["current_state"]
assert connection.execute(
    "SELECT value, status FROM commercial WHERE term='Payment'"
).fetchone() == ("$600.00 received via Zelle", "received")
connection.close()

print(json.dumps({
    "revision": status["revision"],
    "readiness": [68, 92],
    "database_sha256": manifest["database_sha256"],
    "transport_parts": len(manifest["database_transport"]),
    "table_counts": counts,
    "integrity": "ok",
}, indent=2))
